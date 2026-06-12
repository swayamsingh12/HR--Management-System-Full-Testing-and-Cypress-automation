# BUG-010 — Duplicate Employee Selector in Admin Punch Modal

**Severity:** Low
**Module:** Attendance
**Found by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Open

## What happened
When Admin clicks Punch In or Punch Out button in 
the Attendance page, a modal opens with two employee 
selector fields stacked on top of each other. One is 
a text input and one is a dropdown. This is a UI 
rendering issue causing confusion.

## Steps
1. Login as Admin
2. Go to Attendance
3. Click Punch In button
4. Look at the modal that opens

## What I expected
One clean employee selector dropdown.

## What actually happened
Two employee selector fields visible:
- A text input field labeled "Employee"
- A dropdown select below it also for employee selection

Both appear to be for selecting the same employee.
The text input appears to be a broken component.

## Proof
- Screenshot shows Punch In Employee modal
- Two separate employee selection fields visible
- One is text input, one is dropdown

## Who gets hurt
Admin gets confused about which field to use.
Minor UI issue but looks unprofessional.

## Why this is Low
Functionality still works using the dropdown.
No data integrity issue.
Pure UI/UX problem.

## Root cause
Admin attendance punch modal has a stray 
broken Input component rendered above the 
correct Select dropdown. Likely a leftover 
from a refactor that was not cleaned up.