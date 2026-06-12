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
        url: `${apiUrl}/admin/employees/${data.automation.exit.code}/status`,
        headers: { Authorization: `Bearer ${token}` },
        body: { isActive },
        failOnStatusCode: false,
      }),
    );

  it("Scenario 1 - Admin deactivates an employee", () => {
    const exit = data.automation.exit;
    setActive(true);
    cy.loginAsAdmin();
    cy.visit("/admin/employees");

    cy.contains("tr", exit.code).find('button[title="Deactivate"]').click();

    cy.contains("Employee deactivated", { timeout: 10000 }).should("be.visible");
    cy.contains("tr", exit.code).should("contain", "Inactive");
    cy.log(`PASS: ${exit.code} (${exit.name}) status changed to Inactive`);
  });

  it("Scenario 2 - Deactivated employee cannot login", () => {
    setActive(false);

    cy.visit("/login");
    cy.get("#email").clear().type(data.automation.exit.email);
    cy.get("#password").clear().type(data.automation.exit.password);
    cy.contains("button", "Login").click();

    cy.contains("Account is inactive", { timeout: 10000 }).should("be.visible");
    cy.url().should("include", "/login");
    cy.log("PASS: inactive employee blocked at login, stayed on /login");
  });

  it("Scenario 3 - Payroll blocked for inactive employee (documents BUG-006) [EXPECTED TO FAIL]", () => {
    setActive(false);
    cy.getAdminToken().then((token) => {
      const headers = { Authorization: `Bearer ${token}` };
      cy.getEmployeeObjectId(data.automation.exit.code).then((empId) => {
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

  it("Scenario 4 - Employee cannot see all payrolls (documents BUG-007) [EXPECTED TO FAIL]", () => {
    cy.getEmployeeToken(
      data.automation.primary.email,
      data.automation.primary.password,
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

        expect(
          res.status,
          "BUG-007: employees must not be able to list all payrolls (expected 403)",
        ).to.eq(403);
      });
    });
  });
});
