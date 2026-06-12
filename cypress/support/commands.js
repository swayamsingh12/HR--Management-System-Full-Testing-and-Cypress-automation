const apiUrl = () => Cypress.env("apiUrl");

Cypress.Commands.add("loginViaUI", (email, password, expectedPath) => {
  cy.visit("/login");
  cy.get("#email").clear().type(email);
  cy.get("#password").clear().type(password);
  cy.contains("button", "Login").click();

  cy.url({ timeout: 10000 }).should("include", expectedPath);
});

Cypress.Commands.add("loginAsAdmin", () => {
  cy.loginViaUI("admin@hrms.com", "password123", "/admin/dashboard");
  cy.log("Logged in as ADMIN (admin@hrms.com)");
});

Cypress.Commands.add("loginAsHR", () => {
  cy.loginViaUI("hr@hrms.com", "password123", "/hr/dashboard");
  cy.log("Logged in as HR (hr@hrms.com)");
});

Cypress.Commands.add("loginAsEmployee", (email, password) => {
  cy.loginViaUI(email, password, "/employee/dashboard");
  cy.log(`Logged in as EMPLOYEE (${email})`);
});

Cypress.Commands.add("getAdminToken", () => {
  return cy
    .request("POST", `${apiUrl()}/auth/login`, {
      email: "admin@hrms.com",
      password: "password123",
    })
    .then((res) => {
      expect(res.status, "admin login status").to.eq(200);
      expect(res.body.token, "admin token present").to.exist;
      return res.body.token;
    });
});

Cypress.Commands.add(
  "getEmployeeToken",
  (email = "asha@hrms.com", password = "EMP001@123") => {
    return cy
      .request("POST", `${apiUrl()}/auth/login`, { email, password })
      .then((res) => {
        expect(res.status, "employee login status").to.eq(200);
        expect(res.body.token, "employee token present").to.exist;
        return res.body.token;
      });
  },
);

Cypress.Commands.add("getEmployeeObjectId", (empCode) => {
  return cy.getAdminToken().then((token) =>
    cy
      .request({
        method: "GET",
        url: `${apiUrl()}/employees`,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const emp = res.body.find((e) => e.employeeId === empCode);
        expect(emp, `employee ${empCode} should exist (run "npm run seed")`).to
          .exist;
        return emp._id;
      }),
  );
});
