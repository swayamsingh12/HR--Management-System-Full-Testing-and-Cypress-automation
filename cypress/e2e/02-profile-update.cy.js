describe("02 - Profile / Salary Update", () => {
  const apiUrl = Cypress.env("apiUrl");
  let data;

  before(() => {
    cy.fixture("testData.json").then((d) => {
      data = d;
    });
  });

  it("Scenario 1 - Salary update saves correctly", () => {
    cy.getAdminToken().then((token) => {
      const upd = data.salaryUpdate;
      const primary = data.automation.primary;

      cy.request({
        method: "PUT",
        url: `${apiUrl}/admin/employees/${primary.code}/salary`,
        headers: { Authorization: `Bearer ${token}` },
        body: upd,
      }).then((res) => {
        cy.log(`Old basic salary: ${data.automation.salary.basic}`);
        cy.log(`New basic salary: ${res.body.employee.salary.basic}`);
        expect(res.status, "salary update status").to.eq(200);
        expect(
          res.body.employee.salary.basic,
          "saved basic salary should equal requested value",
        ).to.eq(90000);
        cy.log("PASS: salary updated and persisted as 90000");
      });
    });
  });

  it("Scenario 2 - Updated salary reflected in payroll (documents BUG-001) [EXPECTED TO FAIL]", () => {
    cy.getAdminToken().then((token) => {
      const headers = { Authorization: `Bearer ${token}` };

      const primary = data.automation.primary;

      cy.request({
        method: "PUT",
        url: `${apiUrl}/admin/employees/${primary.code}/salary`,
        headers,
        body: data.salaryUpdate,
      });

      cy.getEmployeeObjectId(primary.code).then((empId) => {
        cy.request({
          method: "POST",
          url: `${apiUrl}/payroll/generate`,
          headers,
          failOnStatusCode: false,
          body: { employeeId: empId, month: 11, year: 2026 },
        });

        cy.request({
          method: "GET",
          url: `${apiUrl}/payroll?employeeId=${empId}&month=11&year=2026`,
          headers,
        }).then((res) => {
          expect(res.body.length, "November payroll should exist").to.be.greaterThan(0);
          const payroll = res.body[0];
          cy.log("Expected salary: 90000");
          cy.log(`Actual salary in payroll: ${payroll.salary.basic}`);
          cy.log("BUG-001: Payroll uses old salary (snapshot from joining time)");

          expect(
            payroll.salary.basic,
            "BUG-001: payroll should use the current salary (90000), not the joining snapshot (50000)",
          ).to.eq(90000);
        });
      });
    });
  });

  it("Scenario 3 - Employee updates own profile", () => {
    cy.loginAsEmployee(data.automation.primary.email, data.automation.primary.password);
    cy.visit("/employee/profile");

    cy.get("#phone", { timeout: 10000 }).should("be.visible").clear().type("9111111111");
    cy.contains("button", "Save Changes").click();

    cy.contains("Profile updated successfully", { timeout: 10000 }).should("be.visible");
    cy.log("PASS: employee profile updated successfully");
  });
});
