/// <reference types="cypress" />


describe("01 - Employee Onboarding", () => {
  const apiUrl = Cypress.env("apiUrl");
  let data;

  before(() => {
    cy.fixture("testData.json").then((d) => {
      data = d;
    });
    // Clean up cypresstest@hrms.com so this suite can be run repeatedly.
    cy.getAdminToken().then((token) => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/employees`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        const existing = res.body.find(
          (e) => e.email === "cypresstest@hrms.com",
        );
        if (existing) {
          cy.request({
            method: "DELETE",
            url: `${apiUrl}/admin/employees/${existing.employeeId}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        }
      });
    });
  });

  // --- Scenario 1 -----------------------------------------------------------
  it("Scenario 1 - HR adds a new employee successfully", () => {
    cy.loginAsHR();
    cy.visit("/hr/employees");
    cy.contains("button", "Add Employee").click();
    cy.url().should("include", "/hr/employees/add");

    const e = data.newEmployee;
    cy.get("#firstName").type(e.firstName);
    cy.get("#lastName").type(e.lastName);
    cy.get("#email").type(e.email);
    cy.get("#phone").type(e.phone);
    cy.get("#dateOfBirth").type(e.dateOfBirth);
    cy.get("#dateOfJoining").type(e.dateOfJoining);
    cy.get("#department").select(e.department);
    cy.get("#position").type(e.position);
    cy.get("#basicSalary").type(e.basicSalary);

    cy.intercept("POST", "**/api/employees").as("createEmp");
    cy.contains("button", "Add Employee").click(); // submit

    cy.wait("@createEmp").then((i) => {
      cy.log(`Create employee API status: ${i.response.statusCode}`);
    });

    // PASS: redirected back to the list AND the new employee is visible.
    cy.url({ timeout: 10000 }).should("include", "/hr/employees");
    cy.contains("TestCypress Worker", { timeout: 10000 }).should("be.visible");
    cy.log('PASS: "TestCypress Worker" created and visible in the employee list');
  });

  // --- Scenario 2 -----------------------------------------------------------
  it("Scenario 2 - New employee has Active status", () => {
    cy.loginAsHR();
    cy.visit("/hr/employees");
    cy.contains("tr", "TestCypress").should("contain", "Active");
    cy.log('PASS: "TestCypress Worker" row shows the Active badge');
  });

  // --- Scenario 3 -----------------------------------------------------------
  // EXPECTED TO FAIL — documents BUG-008.
  // The Admin "Add Employee" modal has no Date of Birth / Date of Joining
  // fields, both required by the schema, so the create always returns 400.
  it("Scenario 3 - Admin Add Employee is broken (documents BUG-008) [EXPECTED TO FAIL]", () => {
    cy.loginAsAdmin();
    cy.visit("/admin/employees");
    cy.contains("button", "Add Employee").click(); // opens the modal

    // Modal inputs have no ids; fill in order: first, last, email, phone, dept, position
    cy.get("form").within(() => {
      cy.get("input").eq(0).type("AdminTest");
      cy.get("input").eq(1).type("User");
      cy.get("input").eq(2).type("admintestbug008@hrms.com");
      cy.get("input").eq(3).type("9876500000");
      cy.get("input").eq(4).type("Engineering");
      cy.get("input").eq(5).type("QA Engineer");
    });

    cy.intercept("POST", "**/admin/employees").as("adminCreate");
    cy.contains("button", "Save").click();

    cy.wait("@adminCreate").then((i) => {
      cy.log("Expected: 201 employee created");
      cy.log(`Actual: ${i.response.statusCode}`);
      cy.log(`Error message: ${i.response.body && i.response.body.message}`);
      cy.log("BUG-008: Admin Add Employee form is missing dateOfBirth & dateOfJoining");
      // PASS condition we WANT (creation succeeds). Currently fails with 400.
      expect(
        i.response.statusCode,
        "BUG-008: Admin Add Employee should create the employee (missing DOB/DOJ fields)",
      ).to.eq(201);
    });
  });

  // --- Scenario 4 -----------------------------------------------------------
  it("Scenario 4 - Duplicate email is rejected", () => {
    cy.getAdminToken().then((token) => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/employees`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
        body: {
          firstName: "Dup",
          lastName: "Email",
          email: "asha@hrms.com", // already exists (EMP001)
          phone: "9999999999",
          dateOfBirth: "1995-01-01",
          dateOfJoining: "2024-01-01",
          department: "Engineering",
          position: "Developer",
          salary: { basic: 10000 },
        },
      }).then((res) => {
        cy.log("Expected: 400 (already exists)");
        cy.log(`Actual: ${res.status} - ${res.body.message}`);
        expect(res.status, "duplicate email should be rejected").to.eq(400);
        expect(res.body.message, "rejection message").to.match(/already exists/i);
        cy.log("PASS: duplicate email rejected with 400");
      });
    });
  });
});
