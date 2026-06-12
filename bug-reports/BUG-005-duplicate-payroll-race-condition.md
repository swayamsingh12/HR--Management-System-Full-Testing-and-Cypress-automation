# BUG-005 — Duplicate Payroll Created on Concurrent Requests

**Severity:** Medium
**Module:** Payroll
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
I sent two payroll generation requests for the same 
employee and same month at exactly the same time using 
Promise.all in Node.js. Both requests returned 201 
success and two separate payroll records were created 
in the database for the same employee and month.

Sequential duplicate clicks are handled correctly — 
the second request returns "already generated". But 
truly concurrent requests both succeed because there 
is no database level lock or unique constraint.

## Steps
1. Get admin token
2. Create file test-duplicate.js with this content:

const token = 'YOUR_ADMIN_TOKEN';
const body = JSON.stringify({
  employeeId: 'EMPLOYEE_ID',
  month: 8,
  year: 2026
});
const opts = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body
};
Promise.all([
  fetch('http://localhost:5000/api/payroll/generate', opts),
  fetch('http://localhost:5000/api/payroll/generate', opts)
]).then(async ([r1, r2]) => {
  const d1 = await r1.json();
  const d2 = await r2.json();
  console.log('R1:', r1.status, d1.message);
  console.log('R2:', r2.status, d2.message);
});

3. Run: node test-duplicate.js

## What I expected
R1: 201 Payroll generated successfully
R2: 400 Payroll already generated for this month

## What actually happened
R1: 201 Payroll generated successfully
R2: 201 Payroll generated successfully

Two records created in database for same employee 
and same month.

## Proof
- Terminal output shows both R1 and R2 as 201
- Database shows two payroll records for same 
  employee, same month, same year
- Both records have different _id values

## Who gets hurt
Worker appears to be paid twice in finance reports.
Payroll operator confused about which record is correct.
Company finance audit fails.
If both payslips are processed, worker gets double 
payment or payment gets delayed while team investigates.

## Why this is Medium
Requires concurrent API requests to trigger.
Normal UI usage with sequential clicks is safe.
But any network retry, double click with slow 
connection, or automated script can trigger this.
Financial data integrity is at risk.

## Root cause
App level duplicate check exists but has a 2 second 
artificial delay before checking. During this window 
two concurrent requests both pass the check before 
either one creates the record. No database unique 
index exists on employee+month+year combination to 
act as final safety net.