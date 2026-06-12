describe("03 - Salary / Payslip Flow", () => {
  const apiUrl = Cypress.env("apiUrl");
  let data;
  let june;
  let emp001Id;

  before(() => {
    cy.fixture("testData.json").then((d) => {
      data = d;
    });
    cy.getAdminToken().then((token) => {
      const headers = { Authorization: `Bearer ${token}` };
      const { month, year } = data.automation;
      cy.getEmployeeObjectId(data.automation.primary.code).then((empId) => {
        emp001Id = empId;

        cy.request({
          method: "POST",
          url: `${apiUrl}/payroll/generate`,
          headers,
          failOnStatusCode: false,
          body: { employeeId: empId, month, year },
        });
        cy.request({
          method: "GET",
          url: `${apiUrl}/payroll?employeeId=${empId}&month=${month}&year=${year}`,
          headers,
        }).then((res) => {
          expect(res.body.length, "automation employee payroll should exist").to.be.greaterThan(0);
          june = res.body[0];
        });
      });
    });
  });

  it("Scenario 1 - Gross salary math is correct", () => {
    const { basic, hra, allowances } = data.automation.salary;
    cy.log(`Calculation: ${basic} + ${hra} + ${allowances} = ${basic + hra + allowances}`);
    cy.log(`Actual gross in payroll: ${june.salary.gross}`);
    expect(june.salary.gross, "gross = basic + hra + allowances").to.eq(80000);
    cy.log("PASS: gross salary is 80000");
  });

  it("Scenario 2 - Tax calculation is correct", () => {
    cy.log("Calculation: 80000 x 0.10 = 8000");
    cy.log(`Actual tax in payroll: ${june.deductions.tax}`);
    expect(june.deductions.tax, "tax = gross x 0.10").to.eq(8000);
    cy.log("PASS: tax is 8000");
  });

  it("Scenario 3 - PF calculation is correct", () => {
    cy.log("Calculation: 50000 x 0.12 = 6000");
    cy.log(`Actual PF in payroll: ${june.deductions.providentFund}`);
    expect(june.deductions.providentFund, "pf = basic x 0.12").to.eq(6000);
    cy.log("PASS: provident fund is 6000");
  });

  it("Scenario 4 - Net salary must not exceed gross (documents BUG-002) [EXPECTED TO FAIL]", () => {
    cy.log(`Working days: ${june.workingDays}`);
    cy.log(`Present days: ${june.presentDays}`);
    cy.log(`Gross: ${june.salary.gross}`);
    cy.log(`Net salary: ${june.netSalary}`);
    cy.log("BUG-002: Net exceeds gross due to weekend attendance");

    expect(
      june.netSalary,
      "BUG-002: net salary must not exceed gross salary",
    ).to.be.lessThan(june.salary.gross);
  });

  it("Scenario 5 - Payslip PDF downloads successfully", () => {
    cy.getAdminToken().then((token) => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/payroll/${june._id}/payslip`,
        headers: { Authorization: `Bearer ${token}` },
        encoding: "binary",
        failOnStatusCode: false,
      }).then((res) => {
        cy.log(`Payslip download status: ${res.status}`);
        cy.log(`Content-Type: ${res.headers["content-type"]}`);
        expect(res.status, "payslip download status").to.eq(200);
        expect(res.headers["content-type"], "payslip content type").to.include(
          "application/pdf",
        );
        cy.log("PASS: payslip PDF downloaded");
      });
    });
  });

  it("Scenario 6 - Employee sees own payslips", () => {
    cy.loginAsEmployee(data.automation.primary.email, data.automation.primary.password);
    cy.visit("/employee/payslips");
    cy.contains("No payslips found").should("not.exist");
    cy.get("table tbody tr", { timeout: 10000 }).its("length").should("be.greaterThan", 0);
    cy.log("PASS: employee payslip records are visible");
  });
});
