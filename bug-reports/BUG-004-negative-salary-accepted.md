# BUG-004 — Negative Salary Value Accepted by API

**Severity:** Medium
**Module:** Employee Management / Payroll
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I sent a PUT request to the salary update endpoint with 
Basic salary as -50000. The API accepted it and returned 
200 success. The negative value was saved to the database.

The UI form does have a validation that rejects negative 
salary but the API endpoint has no such validation. Anyone 
with an admin token can set a negative salary directly 
via API and the system will accept it.

## Steps
1. Get admin token via POST /api/auth/login
2. Get employee ID via GET /api/employees
3. Send this request in Postman:

Method: PUT
URL: http://localhost:5000/api/admin/employees/EMPLOYEE_ID/salary
Headers: Authorization: Bearer ADMIN_TOKEN
Body:
{
  "basic": -50000,
  "hra": 0,
  "allowances": 0
}

4. Check response

## What I expected
API should return 400 with message like:
"Basic salary must be greater than 0"

## What actually happened
HTTP Status: 200 OK
Response: "Salary updated successfully"
Database: basic salary saved as -50000

API response confirmed:
"salary": {
  "basic": -50000,
  "hra": 0,
  "allowances": 0
}

## Proof
- Postman request with basic: -50000
- Response status 200
- Response body shows salary.basic: -50000
- Verified in database — value persisted

## Who gets hurt
If payroll is generated after this:
- Gross salary becomes negative
- Tax and PF calculations go wrong
- Net salary becomes negative or zero
- Worker receives ₹0 payslip

Payroll operator sees wrong numbers with no 
explanation. Worker gets no pay that month.

## Why this is Medium
Requires admin access to trigger so not easily 
exploitable. But any admin making a typo or 
testing the API could accidentally set negative 
salary. No safety net exists at the API level.
UI validation alone is not enough — API must 
also validate.

## Root cause
setSalary controller in employeeController.js 
uses basic || 0 check which only handles 
undefined/null values. It does not check if 
basic is negative or zero. No Mongoose schema 
validation exists for minimum salary value.

## Steps to verify fix
After fix, send same request with basic: -50000
Should return 400 with clear error message.
Also test with basic: 0 — should also be rejected.
