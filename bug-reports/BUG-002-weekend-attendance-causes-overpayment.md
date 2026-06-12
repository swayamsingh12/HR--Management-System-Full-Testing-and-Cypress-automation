# BUG-002 — Weekend Attendance Causes Worker Overpayment

**Severity:** High
**Module:** Payroll / Attendance
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I generated payroll for Asha Verma (EMP001) for June 2026.
Her net salary came out as ₹84,000 which is MORE than her 
gross salary of ₹80,000. A worker cannot take home more 
than their gross salary. Something is clearly wrong with 
the attendance calculation.

When I checked the payroll details I saw:
- Working Days: 22
- Present Days: 28

Present days is more than working days. That is impossible 
if weekends are excluded. Asha has attendance records on 
Saturdays and Sundays which are being counted as present 
days but working days only counts weekdays.

## Steps
1. Login as Admin
2. Make sure EMP001 has attendance records including weekends
   (seeded data already has this)
3. Payroll → Generate → EMP001, June 2026
4. View payroll details

## What I expected
- Present Days should not exceed Working Days
- Net Salary should always be less than or equal to 
  Gross minus Deductions
- Weekend attendance should not count toward payroll

## What actually happened
- Working Days: 22 (weekdays only)
- Present Days: 28 (includes weekends)
- Attendance Ratio: 28/22 = 1.27
- Net Salary: ₹84,000
- Gross Salary: ₹80,000
- Net is ₹4,000 MORE than Gross — impossible

## Proof
- Payroll details modal shows 28/22
- Downloaded PDF payslip confirms Net ₹84,000
- Gross on same payslip is ₹80,000
- Math: (80000-14000) × 1.27 = 84,000

## Who gets hurt
The company is overpaying workers who work on weekends.
Finance team cannot reconcile salary reports because 
net exceeds gross. For a company with 200 workers across 
8 construction sites, this could mean lakhs of rupees 
overpaid every month without anyone noticing.

## Why this is High
Money is going out incorrectly every month. The bug 
is in the core payroll calculation formula. Any employee 
with weekend attendance records will be overpaid. 
Silent — no error shown anywhere.

## Root cause
payrollController.js counts workingDays as weekdays only
but counts presentDays from ALL attendance records 
including weekends. No weekend filter on present day 
count. Attendance ratio can exceed 1.0 causing net 
salary to exceed gross salary.