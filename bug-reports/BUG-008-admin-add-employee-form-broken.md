# BUG-008 — Admin Cannot Add Employee Due to Missing Form Fields

**Severity:** High
**Module:** Employee Management
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I tried to add a new employee from the Admin panel. 
I filled all visible fields — First Name, Last Name, 
Email, Phone, Department, Position — and clicked Save.
The request failed with 400 error saying 
"Path dateOfBirth is required".

The Admin Add Employee form is missing the Date of Birth 
and Date of Joining fields that the backend requires.
The HR Add Employee page includes these fields and works 
correctly. Only the Admin form is broken.

## Steps
1. Login as Admin
2. Go to Employees
3. Click + Add Employee
4. Fill all visible fields:
   - First Name: Test
   - Last Name: Worker
   - Email: test.worker@hrms.com
   - Phone: 1234567890
   - Department: Sales
   - Position: Sales Executive
5. Click Save

## What I expected
Employee created successfully with credentials shown.

## What actually happened
HTTP 400 Bad Request
Error toast: "Path dateOfBirth is required"
Network tab confirms: 
{message: "Path `dateOfBirth` is required."}
Employee not created.

## Proof
- Screenshot shows Add Employee modal with only 
  6 fields — no DOB or DOJ fields visible
- Network tab shows 400 response
- Error message: Path dateOfBirth is required
- HR Add Employee page has DOB and DOJ and works

## Who gets hurt
Admin cannot onboard new employees at all using 
their own panel. They have to ask HR to do it.
This breaks the admin workflow completely.
New workers cannot be added to the system until 
this is fixed — they cannot punch in, apply 
leaves, or receive payroll.

## Why this is High
Core functionality is completely broken for Admin.
Every new employee onboarding is blocked.
Admin panel is unusable for its primary purpose.

## Root cause
Admin Add Employee modal in 
pages/admin/Employees.tsx is missing the 
dateOfBirth and dateOfJoining input fields 
that the Employee schema requires as mandatory.
HR's Add Employee form includes these fields 
which is why HR can create employees successfully.