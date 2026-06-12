# BUG-006 — Payroll Generated for Deactivated Employee

**Severity:** Medium
**Module:** Payroll / Employee Management
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I deactivated Rohan Mehta (EMP002) using the status 
update endpoint. Then I sent a payroll generation 
request for Rohan for June 2026. The system generated 
the payroll successfully with HTTP 201. No check was 
done to verify if the employee is still active.

## Steps
1. Login as Admin, get token
2. Deactivate employee:
   PATCH /api/admin/employees/ROHAN_ID/status
   Body: {"isActive": false}
   Response: "Employee status updated" isActive: false

3. Generate payroll for deactivated employee:
   POST /api/payroll/generate
   Body: {"employeeId": "ROHAN_ID", "month": 6, "year": 2026}

4. Check response

## What I expected
HTTP 400 with message:
"Cannot generate payroll for inactive employee"

## What actually happened
HTTP 201 — Payroll generated successfully
Full payroll record created for deactivated employee:
- Net Salary: ₹44,823
- Status: generated

## Proof
- Deactivation response confirmed isActive: false
- Payroll generation returned 201
- Payroll record created with full salary details
- Employee ID EMP002 confirmed in response

## Who gets hurt
Company pays an employee who has already left.
Finance team has no way to know payroll was 
generated for an exited employee.
In construction companies with high workforce 
turnover, this could mean multiple exited workers 
getting paid every month.

## Why this is Medium
HR/Admin UI hides inactive employees from the 
payroll generation dropdown so UI users cannot 
easily trigger this. But anyone with API access 
can generate payroll for any employee ID regardless 
of their active status.

## Root cause
generatePayroll function in payrollController.js 
fetches the employee and checks if they exist but 
never checks employee.isActive before proceeding. 
A simple check at the start of the function would 
prevent this completely.