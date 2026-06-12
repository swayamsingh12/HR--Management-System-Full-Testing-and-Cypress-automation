describe("01 - Employee Onboarding", () => {
  const apiUrl = Cypress.env("apiUrl");
  let data;

  before(() => {
    cy.fixture("testData.json").then((d) => {
      data = d;
    });

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

    cy.contains("button", "Add Employee").click();

    cy.location("pathname", { timeout: 10000 }).should("eq", "/hr/employees");
    cy.contains("td", "TestCypress Worker", { timeout: 10000 }).should("be.visible");
    cy.log('PASS: "TestCypress Worker" created and visible in the employee list');
  });

  it("Scenario 2 - New employee has Active status", () => {
    cy.loginAsHR();
    cy.visit("/hr/employees");
    cy.contains("tr", "TestCypress").should("contain", "Active");
    cy.log('PASS: "TestCypress Worker" row shows the Active badge');
  });

  it("Scenario 3 - Admin Add Employee is broken (documents BUG-008) [EXPECTED TO FAIL]", () => {
    cy.loginAsAdmin();
    cy.visit("/admin/employees");
    cy.contains("button", "Add Employee").click();

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

      expect(
        i.response.statusCode,
        "BUG-008: Admin Add Employee should create the employee (missing DOB/DOJ fields)",
      ).to.eq(201);
    });
  });

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
          email: data.automation.primary.email,
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
