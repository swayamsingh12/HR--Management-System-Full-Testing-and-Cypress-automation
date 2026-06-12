/// <reference types="cypress" />
/**
 * TEST FILE 2 — Profile / Salary Update
 * --------------------------------------------------------------------------
 * Covers:
 *   1. Salary update saves correctly (API)
 *   2. Updated salary is reflected in payroll  -> documents BUG-001 (EXPECTED TO FAIL)
 *   3. Employee updates their own profile (UI)
 */

describe("02 - Profile / Salary Update", () => {
  const apiUrl = Cypress.env("apiUrl");
  let data;

  before(() => {
    cy.fixture("testData.json").then((d) => {
      data = d;
    });
  });

  // --- Scenario 1 -----------------------------------------------------------
  it("Scenario 1 - Salary update saves correctly", () => {
    cy.getAdminToken().then((token) => {
      const upd = data.salaryUpdate; // basic 90000, hra 10000, allowances 5000
      // setSalary accepts the employeeId code ("EMP001") directly.
      cy.request({
        method: "PUT",
        url: `${apiUrl}/admin/employees/EMP001/salary`,
        headers: { Authorization: `Bearer ${token}` },
        body: upd,
      }).then((res) => {
        cy.log(`Old basic salary: ${data.emp001Salary.basic}`);
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

  // --- Scenario 2 -----------------------------------------------------------
  // EXPECTED TO FAIL — documents BUG-001.
  // After updating salary to 90000, a freshly generated payroll should use
  // 90000. Instead it uses the salary snapshot from joining time (50000).
  it("Scenario 2 - Updated salary reflected in payroll (documents BUG-001) [EXPECTED TO FAIL]", () => {
    cy.getAdminToken().then((token) => {
      const headers = { Authorization: `Bearer ${token}` };

      // 1) Update EMP001 salary to 90000.
      cy.request({
        method: "PUT",
        url: `${apiUrl}/admin/employees/EMP001/salary`,
        headers,
        body: data.salaryUpdate,
      });

      // 2) Generate payroll for EMP001, month 11 / 2026 (needs the Mongo _id).
      cy.getEmployeeObjectId("EMP001").then((empId) => {
        cy.request({
          method: "POST",
          url: `${apiUrl}/payroll/generate`,
          headers,
          failOnStatusCode: false, // may already exist from a previous run
          body: { employeeId: empId, month: 11, year: 2026 },
        });

        // 3) Read the generated payroll and inspect the salary it used.
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
          // PASS condition we WANT: payroll reflects the updated salary.
          expect(
            payroll.salary.basic,
            "BUG-001: payroll should use the current salary (90000), not the joining snapshot (50000)",
          ).to.eq(90000);
        });
      });
    });
  });

  // --- Scenario 3 -----------------------------------------------------------
  it("Scenario 3 - Employee updates own profile", () => {
    cy.loginAsEmployee(data.credentials.emp001.email, data.credentials.emp001.password);
    cy.visit("/employee/profile");
    // Wait for the form to hydrate, then change the phone number.
    cy.get("#phone", { timeout: 10000 }).should("be.visible").clear().type("9111111111");
    cy.contains("button", "Save Changes").click();

    cy.contains("Profile updated successfully", { timeout: 10000 }).should("be.visible");
    cy.log("PASS: employee profile updated successfully");
  });
});
