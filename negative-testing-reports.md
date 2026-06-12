# Negative Testing Report

**Ticket:** QA-303
**Tested by:** Swayam Singh
**Date:** 12-06-2026
**App:** HRMS MERN
**Environment:** Local — backend :5000, frontend :3000

---

## What is Negative Testing

Negative testing means deliberately trying to break
the application by sending wrong, missing, or unexpected
inputs. The goal is to find places where the system
accepts bad data it should reject, or crashes instead
of showing a clean error message.

For a payroll system, bad data means wrong salaries,
wrong attendance, wrong payslips. Real workers get
hurt when this data is wrong.

---

## Test Environment Setup

- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- API testing done via Postman
- Admin token obtained via POST /api/auth/login
- Employee token obtained via POST /api/auth/login
  with employee credentials
- MongoDB Atlas — cloud database

---

## Section 1 — Authentication Negative Tests

### NT-001 — Login with empty email
**Request:**
POST /api/auth/login
Body: {"email": "", "password": "password123"}

**Expected:** 400 — email required
**Actual:** 400 — "Please provide email and password"
**Result:** PASS ✅

---

### NT-002 — Login with empty password
**Request:**
POST /api/auth/login
Body: {"email": "admin@hrms.com", "password": ""}

**Expected:** 400 — password required
**Actual:** 400 — "Please provide email and password"
**Result:** PASS ✅

---

### NT-003 — Login with wrong password
**Request:**
POST /api/auth/login
Body: {"email": "admin@hrms.com", "password": "wrongpass"}

**Expected:** 401 — invalid credentials
**Actual:** 401 — "Invalid email or password"
**Result:** PASS ✅

---

### NT-004 — Login with non-existent email
**Request:**
POST /api/auth/login
Body: {"email": "nobody@hrms.com", "password": "password123"}

**Expected:** 401 — invalid credentials
**Actual:** 401 — "Invalid email or password"
**Result:** PASS ✅

---

### NT-005 — Access protected route without token
**Request:**
GET /api/employees
No Authorization header

**Expected:** 401 — unauthorized
**Actual:** 401 — unauthorized
**Result:** PASS ✅

---

### NT-006 — Access protected route with fake token
**Request:**
GET /api/employees
Authorization: Bearer thisisafaketoken123

**Expected:** 401 — invalid token
**Actual:** 401 — "Not authorized, token failed"
**Result:** PASS ✅

---

### NT-029 — NoSQL injection in login
**Request:**
POST /api/auth/login
Body: {"email": {"$gt": ""}, "password": "password123"}

**Expected:** Rejected, no login
**Actual:** 500 — "Something went wrong. Please try again later."
Injection blocked, did not login
**Result:** PASS ✅ — Injection prevented

---

## Section 2 — Employee Management Negative Tests

### NT-007 — Create employee with missing required fields
**Request:**
POST /api/employees
Body: {"firstName": "Test"}

**Expected:** 400 — missing required fields
**Actual:** 400 — validation error
**Result:** PASS ✅

---

### NT-008 — Create employee with duplicate email
**Request:**
POST /api/employees
Body: valid employee data but existing email

**Expected:** 400 — email already exists
**Actual:** 400 — "Employee with this email already exists"
**Result:** PASS ✅

---

### NT-009 — Set negative salary via API
**Request:**
PUT /api/admin/employees/EMPLOYEE_ID/salary
Body: {"basic": -50000, "hra": 0, "allowances": 0}

**Expected:** 400 — salary must be positive
**Actual:** 200 — "Salary updated successfully"
Negative value saved to database
**Result:** FAIL ❌ — See BUG-004

---

### NT-010 — Set zero salary via API
**Request:**
PUT /api/admin/employees/EMPLOYEE_ID/salary
Body: {"basic": 0, "hra": 0, "allowances": 0}

**Expected:** 400 — salary must be greater than 0
**Actual:** 200 — accepted, zero salary saved
**Result:** FAIL ❌ — Same root cause as BUG-004

---

### NT-011 — Get employee with invalid ID format
**Request:**
GET /api/employees/invalidid123
Authorization: Bearer ADMIN_TOKEN

**Expected:** 400 — invalid ID format
**Actual:** 404 — "Employee not found"
Wrong HTTP status code returned.
Should be 400 bad request not 404 not found.
Invalid format is a client error not a missing
resource error.
**Result:** FAIL ❌ — Wrong status code

---

### NT-012 — Employee role accessing admin routes
**Request:**
GET /api/employees
Authorization: Bearer EMPLOYEE_TOKEN

**Expected:** 403 — not authorized
**Actual:** 403 — "not authorized"
**Result:** PASS ✅

---

### NT-030 — Extremely long string in name field
**Request:**
POST /api/employees
firstName: 265 character string

**Expected:** 400 — name too long
**Actual:** 201 — Employee created successfully
265 character name saved to database
Employee EMP20260008 created with invalid name
**Result:** FAIL ❌ — No max length validation

---

## Section 3 — Attendance Negative Tests

### NT-013 — Double punch in same day
**Request:**
POST /api/attendance/punch-in (twice same day)
Authorization: Bearer EMPLOYEE_TOKEN

**Expected:** 400 — already punched in today
**Actual:** 400 — "Already punched in today"
**Result:** PASS ✅

---

### NT-014 — Punch out without punching in
**Request:**
POST /api/attendance/punch-out
Authorization: Bearer EMPLOYEE_TOKEN
(on a day with no punch in)

**Expected:** 400 — please punch in first
**Actual:** 400 — "Please punch in first"
**Result:** PASS ✅

---

### NT-015 — Employee punch out status check
**Steps:**
1. Login as employee
2. Punch in
3. Punch out
4. Check attendance status in admin panel

**Expected:** Status = Present, hours calculated
**Actual:** Status = Incomplete, hours = 0
Punch out time shows as "-" in admin view
**Result:** FAIL ❌ — See BUG-003

---

## Section 4 — Payroll Negative Tests

### NT-016 — Generate payroll with missing employeeId
**Request:**
POST /api/payroll/generate
Body: {"month": 6, "year": 2026}

**Expected:** 400 — employeeId required
**Actual:** 400 — "Please provide employeeId,
month, and year"
**Result:** PASS ✅

---

### NT-017 — Generate payroll with missing month
**Request:**
POST /api/payroll/generate
Body: {"employeeId": "ID", "year": 2026}

**Expected:** 400 — month required
**Actual:** 400 — "Please provide employeeId,
month, and year"
**Result:** PASS ✅

---

### NT-018 — Generate payroll with month value 0
**Request:**
POST /api/payroll/generate
Body: {"employeeId": "ID", "month": 0, "year": 2026}

**Expected:** 400 — month must be between 1 and 12
**Actual:** 400 — "Please provide employeeId,
month, and year"
Month 0 treated as falsy like a missing field.
Misleading error message — month was provided
but invalid, not missing.
**Result:** FAIL ❌ — Wrong error message

---

### NT-019 — Generate payroll with month value 13
**Request:**
POST /api/payroll/generate
Body: {"employeeId": "ID", "month": 13, "year": 2026}

**Expected:** 400 — month must be between 1 and 12
**Actual:** 400 — "Path month (13) is more than
maximum allowed value (12)"
Mongoose schema catches this correctly.
**Result:** PASS ✅

---

### NT-020 — Generate payroll with negative month
**Request:**
POST /api/payroll/generate
Body: {"employeeId": "ID", "month": -1, "year": 2026}

**Expected:** 400 — month must be between 1 and 12
**Actual:** 400 — "Please provide employeeId,
month, and year"
Negative month treated as falsy.
Misleading error message.
**Result:** FAIL ❌ — Wrong error message

---

### NT-021 — Generate payroll for same employee twice
**Request:**
POST /api/payroll/generate (twice sequentially)
Same employee, month, year

**Expected:** Second request returns 400
**Actual:** 400 — "Payroll already generated
for this month"
**Result:** PASS ✅

---

### NT-022 — Generate payroll for inactive employee
**Steps:**
1. Deactivate employee via PATCH status endpoint
2. Generate payroll for deactivated employee

**Expected:** 400 — cannot generate for
inactive employee
**Actual:** 201 — "Payroll generated successfully"
Full payroll record created
**Result:** FAIL ❌ — See BUG-006

---

### NT-023 — Employee accessing all payrolls
**Request:**
GET /api/payroll
Authorization: Bearer EMPLOYEE_TOKEN

**Expected:** 403 — not authorized
**Actual:** 200 — returns all payroll records
for all employees including salaries
**Result:** FAIL ❌ — See BUG-007

---

### NT-024 — Download another employee payslip
**Request:**
GET /api/payroll/OTHER_PAYROLL_ID/payslip
Authorization: Bearer EMPLOYEE_TOKEN

**Expected:** 403 — not authorized
**Actual:** 403 — "Not authorized"
**Result:** PASS ✅

---

## Section 5 — Leave Negative Tests

### NT-025 — Apply leave with end date before start date
**Steps:**
1. Login as employee
2. Apply leave with end date before start date

**Expected:** 400 — end date must be after start date
**Actual:** 400 — "End date must be after start date"
**Result:** PASS ✅

---

### NT-026 — Apply leave exceeding balance
**Steps:**
1. Employee has 10 annual leave days remaining
2. Apply for 15 days annual leave

**Expected:** 400 — insufficient balance
**Actual:** 400 — "Insufficient annual leave balance"
**Result:** PASS ✅

---

### NT-027 — Apply maternity leave
**Steps:**
1. Login as employee
2. Select Maternity Leave type
3. UI shows Available: 0 days immediately
4. Submit application

**Expected:** Application submitted or clear
policy message
**Actual:** 400 — "Insufficient maternity leave
balance. Available: 0 days"
Leave cannot be applied at all
**Result:** FAIL ❌ — See BUG-009

---

## Section 6 — XSS and Injection Tests

### NT-028 — XSS in employee name field
**Input:**
firstName: "<script>alert('xss')</script>"

**Expected:** Sanitized or rejected
**Actual:** Saved as plain text, not executed
in browser
**Result:** PASS ✅ — React escapes by default

---

## Final Summary

| Result | Count |
|--------|-------|
| PASS ✅ | 20 |
| FAIL ❌ | 12 |

### Critical Failures
- NT-009 — Negative salary accepted (BUG-004)
- NT-015 — Punch out stays incomplete (BUG-003)
- NT-022 — Payroll for inactive employee (BUG-006)
- NT-023 — Employee sees all payrolls (BUG-007)

### High Failures
- NT-011 — Wrong error code for invalid ID
- NT-030 — No max length on name fields

### Medium Failures
- NT-010 — Zero salary accepted
- NT-018 — Misleading error for month 0
- NT-020 — Misleading error for negative month
- NT-027 — Maternity leave always fails (BUG-009)

### Low Failures
- NT-008 — Admin add employee broken (BUG-008)

---

## Automated Tests Written

5 most critical failures have automated tests.
See cypress/e2e/negative-testing.cy.js

Tests cover:
1. NT-009 — Negative salary via API
2. NT-015 — Punch out status check
3. NT-022 — Payroll for inactive employee
4. NT-023 — Employee accessing all payrolls
5. NT-018 — Invalid month in payroll generation