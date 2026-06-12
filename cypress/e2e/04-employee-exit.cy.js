/// <reference types="cypress" />
/**
 * TEST FILE 4 — Employee Exit
 * --------------------------------------------------------------------------
 * Covers:
 *   1. Admin deactivates an employee (UI)
 *   2. A deactivated employee cannot log in
 *   3. Payroll is blocked for inactive employees -> documents BUG-006 (EXPECTED TO FAIL)
 *   4. An employee cannot list everyone's payroll -> documents BUG-007 (EXPECTED TO FAIL)
 *
 * Target: EMP002 (Rohan Mehta).
 */

describe("04 - Employee Exit", () => {
  const apiUrl = Cypress.env("apiUrl");
  let data;

  before(() => {
    cy.fixture("testData.json").then((d) => {
      data = d;
    });
  });

  const setActive = (isActive) =>
    cy.getAdminToken().then((token) =>
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/admin/employees/EMP002/status`,
        headers: { Authorization: `Bearer ${token}` },
        body: { isActive },
        failOnStatusCode: false,
      }),
    );

  // --- Scenario 1 -----------------------------------------------------------
  it("Scenario 1 - Admin deactivates an employee", () => {
    setActive(true); // make sure EMP002 starts active so "Deactivate" is shown
    cy.loginAsAdmin();
    cy.visit("/admin/employees");

    cy.contains("tr", "Rohan").find('button[title="Deactivate"]').click();

    cy.contains("Employee deactivated", { timeout: 10000 }).should("be.visible");
    cy.contains("tr", "Rohan").should("contain", "Inactive");
    cy.log("PASS: EMP002 (Rohan Mehta) status changed to Inactive");
  });

  // --- Scenario 2 -----------------------------------------------------------
  it("Scenario 2 - Deactivated employee cannot login", () => {
    setActive(false); // deactivate via API first

    cy.visit("/login");
    cy.get("#email").clear().type(data.credentials.emp002.email);
    cy.get("#password").clear().type(data.credentials.emp002.password);
    cy.contains("button", "Login").click();

    cy.contains("Account is inactive", { timeout: 10000 }).should("be.visible");
    cy.url().should("include", "/login");
    cy.log("PASS: inactive employee blocked at login, stayed on /login");
  });

  // --- Scenario 3 -----------------------------------------------------------
  // EXPECTED TO FAIL — documents BUG-006.
  // Generating payroll for a deactivated employee should be blocked (400) but
  // the API still returns 201 and creates the record.
  it("Scenario 3 - Payroll blocked for inactive employee (documents BUG-006) [EXPECTED TO FAIL]", () => {
    setActive(false);
    cy.getAdminToken().then((token) => {
      const headers = { Authorization: `Bearer ${token}` };
      cy.getEmployeeObjectId("EMP002").then((empId) => {
        cy.request({
          method: "POST",
          url: `${apiUrl}/payroll/generate`,
          headers,
          failOnStatusCode: false,
          body: { employeeId: empId, month: 9, year: 2026 },
        }).then((res) => {
          cy.log("Expected: 400 blocked");
          cy.log(`Actual: ${res.status} generated`);
          cy.log("BUG-006: Payroll generates for inactive employee");
          // PASS condition we WANT: the API rejects with 400 + an "inactive" message.
          // (The message check also keeps this failing on re-runs where a prior
          //  run already created the record and the API returns "already generated".)
          expect(
            res.status,
            "BUG-006: payroll should be blocked (400) for an inactive employee",
          ).to.eq(400);
          expect(
            res.body.message || "",
            "BUG-006: rejection should mention the employee is inactive",
          ).to.match(/inactive/i);
        });
      });
    });
  });

  // --- Scenario 4 -----------------------------------------------------------
  // EXPECTED TO FAIL — documents BUG-007.
  // An employee token should NOT be able to list all payrolls.
  it("Scenario 4 - Employee cannot see all payrolls (documents BUG-007) [EXPECTED TO FAIL]", () => {
    cy.getEmployeeToken(
      data.credentials.emp001.email,
      data.credentials.emp001.password,
    ).then((token) => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/payroll`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        cy.log("Expected: 403 forbidden");
        cy.log(`Actual: ${res.status} with ${Array.isArray(res.body) ? res.body.length : 0} payroll records`);
        cy.log("BUG-007: Employee can see everyone's salary");
        // PASS condition we WANT: employees are forbidden (403) from the list endpoint.
        expect(
          res.status,
          "BUG-007: employees must not be able to list all payrolls (expected 403)",
        ).to.eq(403);
      });
    });
  });
});
