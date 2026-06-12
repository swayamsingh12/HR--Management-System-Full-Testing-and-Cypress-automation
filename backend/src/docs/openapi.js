// OpenAPI 3.0 specification for the HRMS API.
// Served as interactive docs at GET /api/docs and as raw JSON at GET /api/docs.json
// (mounted in src/server.js). The base server URL already includes "/api", so
// the paths below are written relative to it (e.g. "/auth/login").

const bearer = [{ bearerAuth: [] }];

const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "HRMS API",
    version: "1.0.0",
    description:
      "Human Resource Management System API (MERN). JWT bearer auth with three roles: admin, hr, employee.\n\n" +
      "Get a token from `POST /auth/login`, click **Authorize**, and paste the token to try protected endpoints.",
  },
  servers: [{ url: "http://localhost:5000/api", description: "Local backend" }],
  tags: [
    { name: "Auth", description: "Login and current user" },
    { name: "Employees", description: "Employee CRUD (HR/Admin) and self-profile" },
    { name: "Attendance", description: "Punch in/out and attendance records" },
    { name: "Leaves", description: "Leave application, balance, approval" },
    { name: "Payroll", description: "Payroll generation and payslips" },
    { name: "Admin", description: "Admin-only management routes (/admin/*)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { message: { type: "string", example: "Not authorized, no token" } },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@hrms.com" },
          password: { type: "string", example: "password123" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["admin", "hr", "employee"] },
              employeeId: { type: "string", nullable: true },
              name: { type: "string" },
              department: { type: "string", nullable: true },
            },
          },
        },
      },
      Salary: {
        type: "object",
        properties: {
          basic: { type: "number", example: 50000 },
          hra: { type: "number", example: 20000 },
          allowances: { type: "number", example: 10000 },
          deductions: { type: "number", example: 0 },
        },
      },
      Employee: {
        type: "object",
        properties: {
          _id: { type: "string" },
          employeeId: { type: "string", example: "EMP001" },
          firstName: { type: "string", example: "Asha" },
          lastName: { type: "string", example: "Verma" },
          email: { type: "string", format: "email" },
          phone: { type: "string", example: "9876543210" },
          dateOfBirth: { type: "string", format: "date" },
          dateOfJoining: { type: "string", format: "date" },
          department: { type: "string", example: "Engineering" },
          position: { type: "string", example: "Software Developer" },
          salary: { $ref: "#/components/schemas/Salary" },
          isActive: { type: "boolean", example: true },
        },
      },
      EmployeeInput: {
        type: "object",
        required: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "dateOfBirth",
          "department",
          "position",
        ],
        properties: {
          firstName: { type: "string", example: "Test" },
          lastName: { type: "string", example: "Worker" },
          email: { type: "string", format: "email", example: "newhire@hrms.com" },
          phone: { type: "string", example: "9876543210" },
          dateOfBirth: { type: "string", format: "date", example: "1995-01-15" },
          dateOfJoining: { type: "string", format: "date", example: "2024-01-01" },
          department: { type: "string", example: "Engineering" },
          position: { type: "string", example: "QA Engineer" },
          salary: { $ref: "#/components/schemas/Salary" },
        },
      },
      Attendance: {
        type: "object",
        properties: {
          _id: { type: "string" },
          employee: { type: "string" },
          date: { type: "string", format: "date-time" },
          punchIn: {
            type: "object",
            properties: {
              time: { type: "string", format: "date-time" },
              location: { type: "string", example: "Office" },
            },
          },
          punchOut: {
            type: "object",
            properties: {
              time: { type: "string", format: "date-time" },
              location: { type: "string", example: "Office" },
            },
          },
          status: {
            type: "string",
            enum: ["present", "absent", "late", "half-day", "incomplete"],
          },
          workingHours: { type: "number", example: 9 },
        },
      },
      Leave: {
        type: "object",
        properties: {
          _id: { type: "string" },
          employee: { type: "string" },
          leaveType: {
            type: "string",
            enum: ["sick", "casual", "annual", "maternity", "paternity", "unpaid"],
          },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          days: { type: "number" },
          reason: { type: "string" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
        },
      },
      LeaveInput: {
        type: "object",
        required: ["leaveType", "startDate", "endDate", "reason"],
        properties: {
          leaveType: { type: "string", enum: ["sick", "casual", "annual"], example: "casual" },
          startDate: { type: "string", format: "date", example: "2026-06-20" },
          endDate: { type: "string", format: "date", example: "2026-06-21" },
          reason: { type: "string", example: "Family function out of town" },
        },
      },
      LeaveBalance: {
        type: "object",
        properties: {
          employee: { type: "string" },
          annual: { $ref: "#/components/schemas/LeaveBucket" },
          casual: { $ref: "#/components/schemas/LeaveBucket" },
          sick: { $ref: "#/components/schemas/LeaveBucket" },
        },
      },
      LeaveBucket: {
        type: "object",
        properties: {
          total: { type: "number", example: 12 },
          used: { type: "number", example: 0 },
          remaining: { type: "number", example: 12 },
        },
      },
      Payroll: {
        type: "object",
        properties: {
          _id: { type: "string" },
          employee: { type: "string" },
          month: { type: "integer", minimum: 1, maximum: 12, example: 6 },
          year: { type: "integer", example: 2026 },
          salary: {
            type: "object",
            properties: {
              basic: { type: "number" },
              hra: { type: "number" },
              allowances: { type: "number" },
              gross: { type: "number" },
            },
          },
          deductions: {
            type: "object",
            properties: {
              tax: { type: "number" },
              providentFund: { type: "number" },
              other: { type: "number" },
              total: { type: "number" },
            },
          },
          netSalary: { type: "number" },
          workingDays: { type: "number" },
          presentDays: { type: "number" },
          leaveDays: { type: "number" },
          status: { type: "string", enum: ["draft", "generated", "paid"] },
        },
      },
      PayrollGenerateInput: {
        type: "object",
        required: ["employeeId", "month", "year"],
        properties: {
          employeeId: { type: "string", description: "Employee Mongo _id", example: "665f..." },
          month: { type: "integer", minimum: 1, maximum: 12, example: 6 },
          year: { type: "integer", example: 2026 },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid token",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Forbidden: {
        description: "Authenticated but not allowed for this role",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      BadRequest: {
        description: "Validation error",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      NotFound: {
        description: "Resource not found",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },
  // Global security: every operation needs a bearer token unless overridden (login).
  security: bearer,
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: {
            description: "Login successful",
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the currently authenticated user",
        responses: {
          200: { description: "Current user" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    "/employees": {
      get: {
        tags: ["Employees"],
        summary: "List employees (HR/Admin)",
        parameters: [
          { name: "department", in: "query", schema: { type: "string" } },
          { name: "isActive", in: "query", schema: { type: "boolean" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Array of employees",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Employee" } },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Employees"],
        summary: "Create an employee + login (HR/Admin)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EmployeeInput" } } },
        },
        responses: {
          201: { description: "Created (returns employee + generated credentials)" },
          400: { $ref: "#/components/responses/BadRequest" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/employees/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Mongo _id or employeeId code" },
      ],
      get: {
        tags: ["Employees"],
        summary: "Get an employee (self for employees, any for HR/Admin)",
        responses: {
          200: { description: "Employee", content: { "application/json": { schema: { $ref: "#/components/schemas/Employee" } } } },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Employees"],
        summary: "Update an employee (self for employees, any for HR/Admin)",
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/EmployeeInput" } } },
        },
        responses: {
          200: { description: "Updated employee" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/employees/{id}/status": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      patch: {
        tags: ["Employees"],
        summary: "Activate / deactivate an employee (HR/Admin)",
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { isActive: { type: "boolean", example: false } } },
            },
          },
        },
        responses: { 200: { description: "Status updated" }, 403: { $ref: "#/components/responses/Forbidden" } },
      },
    },

    "/attendance/punch-in": {
      post: {
        tags: ["Attendance"],
        summary: "Punch in (employee)",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { location: { type: "string", example: "Office" } } } } },
        },
        responses: { 200: { description: "Punched in" }, 400: { $ref: "#/components/responses/BadRequest" } },
      },
    },
    "/attendance/punch-out": {
      post: {
        tags: ["Attendance"],
        summary: "Punch out (employee)",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { location: { type: "string", example: "Office" } } } } },
        },
        responses: { 200: { description: "Punched out" }, 400: { $ref: "#/components/responses/BadRequest" } },
      },
    },
    "/attendance/me": {
      get: {
        tags: ["Attendance"],
        summary: "My attendance + today's status",
        parameters: [
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: { 200: { description: "Attendance list + todayStatus" } },
      },
    },
    "/attendance/employee/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Attendance"],
        summary: "Get an employee's attendance (HR/Admin)",
        responses: {
          200: { description: "Array of attendance", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Attendance" } } } } },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/attendance/employee/{employeeId}/punch-in": {
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string" } }],
      post: { tags: ["Attendance"], summary: "Punch in for an employee (HR/Admin)", responses: { 200: { description: "Punched in" } } },
    },
    "/attendance/employee/{employeeId}/punch-out": {
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string" } }],
      post: { tags: ["Attendance"], summary: "Punch out for an employee (HR/Admin)", responses: { 200: { description: "Punched out" } } },
    },
    "/attendance/{id}/regularize": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      patch: {
        tags: ["Attendance"],
        summary: "Regularize an attendance record (HR/Admin)",
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { status: { type: "string" }, reason: { type: "string" } } },
            },
          },
        },
        responses: { 200: { description: "Regularized" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },

    "/leaves": {
      post: {
        tags: ["Leaves"],
        summary: "Apply for leave (employee)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LeaveInput" } } } },
        responses: { 201: { description: "Leave applied" }, 400: { $ref: "#/components/responses/BadRequest" } },
      },
    },
    "/leaves/me": {
      get: { tags: ["Leaves"], summary: "My leave requests", responses: { 200: { description: "Array of leaves", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Leave" } } } } } } },
    },
    "/leaves/balance/me": {
      get: { tags: ["Leaves"], summary: "My leave balance", responses: { 200: { description: "Leave balance", content: { "application/json": { schema: { $ref: "#/components/schemas/LeaveBalance" } } } } } },
    },
    "/leaves/pending": {
      get: { tags: ["Leaves"], summary: "Pending leave requests (HR/Admin)", responses: { 200: { description: "Array of pending leaves" }, 403: { $ref: "#/components/responses/Forbidden" } } },
    },
    "/leaves/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      patch: {
        tags: ["Leaves"],
        summary: "Approve / reject a leave (HR/Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { status: { type: "string", enum: ["approved", "rejected"] }, rejectionReason: { type: "string" } } },
            },
          },
        },
        responses: { 200: { description: "Leave updated" }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },

    "/payroll/generate": {
      post: {
        tags: ["Payroll"],
        summary: "Generate payroll for an employee/month (HR/Admin)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PayrollGenerateInput" } } } },
        responses: {
          201: { description: "Payroll generated", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, payroll: { $ref: "#/components/schemas/Payroll" } } } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/payroll/me": {
      get: { tags: ["Payroll"], summary: "My payrolls (employee)", responses: { 200: { description: "Array of payrolls", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Payroll" } } } } } } },
    },
    "/payroll": {
      get: {
        tags: ["Payroll"],
        summary: "List payrolls (HR/Admin)",
        parameters: [
          { name: "month", in: "query", schema: { type: "integer" } },
          { name: "year", in: "query", schema: { type: "integer" } },
          { name: "employeeId", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Array of payrolls", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Payroll" } } } } } },
      },
    },
    "/payroll/{id}/payslip": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Payroll"],
        summary: "Download payslip PDF",
        responses: {
          200: { description: "PDF file", content: { "application/pdf": { schema: { type: "string", format: "binary" } } } },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/admin/employees/{id}/salary": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      put: {
        tags: ["Admin"],
        summary: "Set an employee's salary (Admin)",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Salary" } } } },
        responses: { 200: { description: "Salary updated" }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
    "/admin/employees/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      delete: {
        tags: ["Admin"],
        summary: "Delete an employee (Admin)",
        responses: { 200: { description: "Deleted" }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
    "/admin/employees/{id}/deactivate": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      patch: {
        tags: ["Admin"],
        summary: "Deactivate an employee (Admin)",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { isActive: { type: "boolean", example: false } } } } } },
        responses: { 200: { description: "Deactivated" }, 403: { $ref: "#/components/responses/Forbidden" } },
      },
    },
    "/admin/employees/{id}/activate": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      patch: {
        tags: ["Admin"],
        summary: "Activate an employee (Admin)",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { isActive: { type: "boolean", example: true } } } } } },
        responses: { 200: { description: "Activated" }, 403: { $ref: "#/components/responses/Forbidden" } },
      },
    },
    "/admin/attendance": {
      get: { tags: ["Admin"], summary: "All attendance with filters (Admin)", parameters: [
        { name: "employeeId", in: "query", schema: { type: "string" } },
        { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
        { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
        { name: "status", in: "query", schema: { type: "string" } },
      ], responses: { 200: { description: "Array of attendance" }, 403: { $ref: "#/components/responses/Forbidden" } } },
    },
    "/admin/leaves": {
      get: { tags: ["Admin"], summary: "Pending leaves (Admin)", responses: { 200: { description: "Array of leaves" }, 403: { $ref: "#/components/responses/Forbidden" } } },
    },
    "/admin/payroll": {
      get: { tags: ["Admin"], summary: "All payrolls (Admin)", responses: { 200: { description: "Array of payrolls" }, 403: { $ref: "#/components/responses/Forbidden" } } },
    },
  },
};

export default openapiSpec;
