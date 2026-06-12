# BUG-003 — Employee Punch Out Does Not Update Attendance Status

**Severity:** High
**Module:** Attendance
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I logged in as an employee and punched in. Then I punched 
out. The UI showed success for both actions. But when I 
checked the attendance from Admin panel, the status was 
still showing "Incomplete" and punch out time was showing 
as "-" (missing).

I tested the same thing as HR — punching out for an 
employee from HR panel worked correctly and showed 
"Present". So the bug only affects employee self 
punch out, not HR/Admin punch out.

## Steps
1. Login as employee (rohan@hrms.com / EMP002@123)
2. Go to Attendance
3. Click Punch In — success message shown
4. Click Punch Out — success message shown
5. Logout
6. Login as Admin
7. Go to Attendance
8. Find EMP002 record for today
9. Check status column

## What I expected
After punch out:
- Status: Present or Late
- Punch Out time: actual time recorded
- Working hours: calculated correctly

## What actually happened
- Status: Incomplete
- Punch Out time: "-" (not recorded)
- Working hours: 0
- Employee shows as absent in their own dashboard

## Proof
- Admin attendance screenshot shows EMP003 Priya Nair
  status "Incomplete" after punch in and out
- Punch out time shows "-" in admin view
- HR punch out for same employee works correctly
  and shows "Late" status

## Who gets hurt
The worker punches in and out every day thinking their 
attendance is recorded. But it never gets marked as 
present. When payroll runs, their present days count 
is wrong. They get paid less than they worked.

This is especially bad for daily wage construction 
workers — every day of attendance matters for their 
monthly pay.

## Why this is High
Worker loses pay for days they actually worked.
The punch out appears to succeed in the UI so the 
worker has no idea their attendance is not being 
recorded. By the time payroll is generated, the 
data is already wrong.

## Root cause
Employee punch out uses Attendance.findByIdAndUpdate()
which bypasses the Mongoose pre-save hook. That hook 
is responsible for calculating working hours and 
updating the status to present/late. Since the hook 
never runs, status stays as incomplete and hours 
stay at 0.

HR/Admin punch out uses a different code path that 
works correctly — this is why HR punch out works 
but employee self punch out does not.

## Additional Note
There is also a stray route alias POST /api/attendance/punchout
(without hyphen) that exists alongside the correct route
POST /api/attendance/punch-out. Frontend calls the correct
route but the alias adds confusion and could cause issues
if frontend route ever changes.