# BUG-007 — Employee Can View All Staff Payroll Data

**Severity:** High
**Module:** Payroll / Authorization
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I logged in as a regular employee and called the 
GET /api/payroll endpoint using the employee token. 
Instead of getting a 403 forbidden response, I got 
200 OK with complete payroll data for ALL employees 
in the system including their salaries, deductions, 
and net pay.

## Steps
1. Login as employee:
   POST /api/auth/login
   Body: {"email": "asha@hrms.com", "password": "EMP001@123"}
   Copy the token

2. Call payroll endpoint with employee token:
   GET http://localhost:5000/api/payroll
   Headers: Authorization: Bearer EMPLOYEE_TOKEN

3. Check response

## What I expected
HTTP 403 Forbidden
Message: "Not authorized to access this resource"

## What actually happened
HTTP 200 OK
Returned complete payroll records for all employees:
- Asha Verma (EMP001) — Net ₹84,000
- Priya Nair (EMP003) — Net ₹67,450
- Arjun Rao (EMP006) — Net ₹91,127
- Meera Joshi (EMP007) — Net ₹58,347
- Vikram Singh (EMP004) — Net ₹0
- And more...

Every employee can see every other employee's 
salary and deductions.

## Proof
- Employee token used (not admin/HR token)
- GET /api/payroll returned 200
- Response contains 7 payroll records
- All records include salary breakdown and net pay
- Verified employee role in auth/me response

## Who gets hurt
Every employee's salary is exposed to all other 
employees. This is a serious privacy violation.
Construction workers can see their manager's salary.
Junior staff can see senior staff pay.
This creates workplace conflicts and is a 
compliance violation.

## Why this is High
Salary data is among the most sensitive personal 
information in any organization. This endpoint 
has no role check at all — any authenticated 
user can access it. Zero effort needed to exploit.

## Root cause
Role guard was removed from GET /api/payroll route 
in payrollRoutes.js. The getAllPayrolls controller 
also does not scope results to the requesting user.
Employee should only be able to access 
GET /api/payroll/me for their own records.