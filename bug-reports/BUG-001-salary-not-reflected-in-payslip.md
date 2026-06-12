# BUG-001 — Salary Change Not Reflected in Payslip

**Severity:** Critical
**Module:** Payroll
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I updated Asha Verma's (EMP001) salary to Basic 90,000 
from the Admin panel. The update showed success. But when 
I generated her June 2026 payroll, the payslip still 
showed Basic 50,000 — her original joining salary.

The system is silently ignoring salary updates during 
payroll generation. No error, no warning, just wrong numbers.

## Steps
1. Login as Admin
2. Employees → EMP001 → click $ icon → set Basic 90000
3. Save → got success message
4. Payroll → Generate → select EMP001, June 2026
5. View payroll details → Basic shows 50000

## What I expected
Payslip Basic Salary: ₹90,000 (updated value)

## What actually happened
Payslip Basic Salary: ₹50,000 (original joining salary)
Gross shown: ₹80,000 instead of ₹1,05,000
Net Salary: ₹84,000 instead of what it should be

## Proof
- Salary update API returned 200 success
- Payroll details modal shows old salary
- Downloaded PDF payslip confirms Basic ₹50,000
- API response shows salaryAtJoining still has old values

## Who gets hurt
Asha got a raise but her payslip doesn't show it. She 
gets paid ₹40,000 less than she should this month. 
The payroll operator has no idea anything is wrong 
because no error is shown anywhere.

## Why this is Critical
This is a silent bug. Money is wrong but nobody knows. 
By the time the worker complains, payroll is already 
processed. In a construction company with 200+ workers, 
this could affect hundreds of payslips in one month.

## Root cause
Payroll controller reads employee.salaryAtJoining 
instead of employee.salary. salaryAtJoining is set 
only at creation and never updated when salary changes.