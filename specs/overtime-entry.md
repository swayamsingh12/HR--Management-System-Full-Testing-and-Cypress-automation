# Overtime Entry Screen — Acceptance Criteria

**Ticket:** QA-301
**Written by:** Swayam Singh
**Date:** 12-06-2026
**Status:** Ready for Development

---

## Background

The PM sent this message in Slack:

"We need an overtime entry screen. Site managers should 
be able to log overtime for their workers at the end of 
each day — which worker, how many hours, what date, and 
a reason. This needs to work on mobile too since they'll 
enter it at the construction site."

That's the entire requirement. This document fills in 
everything the PM did not mention.

---

## Questions I Would Ask Before Dev Starts

1. Is there a maximum overtime hours allowed per day?
   (e.g. can a manager log 24 hours overtime?)

2. Is there a monthly overtime cap per worker?
   (Labour law in India caps overtime at 50 hours/month)

3. Can overtime be logged for past dates or only today?

4. What happens if two supervisors log overtime for the 
   same worker on the same day?

5. Can overtime be edited or deleted after submission?

6. Who approves overtime — does it need HR approval 
   before affecting payroll?

7. What happens to overtime data in payroll calculation?
   Is it added to net salary? At what rate?

8. What if the phone loses connectivity mid-submission
   at the construction site?

9. Can a site manager log overtime for workers from 
   other sites or only their own team?

10. What is the minimum reason length — can it be empty?

---

## Acceptance Criteria

### AC-1: Basic Form Fields
**Given** a site manager is logged in on mobile
**When** they open the overtime entry screen
**Then** they see these mandatory fields:
- Worker name (searchable dropdown from active employees)
- Date (default today, cannot be future date)
- Overtime hours (numeric, max 2 decimal places)
- Reason (text, minimum 10 characters)

---

### AC-2: Valid Submission
**Given** all fields are filled correctly
**When** the site manager clicks Submit
**Then** overtime record is created successfully
**And** success message is shown
**And** form resets for next entry

---

### AC-3: Overtime Hours Validation
**Given** the site manager is filling the form
**When** they enter overtime hours
**Then** the system should:
- Reject 0 or negative hours
- Reject more than 12 hours in a single entry
- Reject non-numeric values
- Accept decimal values like 1.5, 2.5

---

### AC-4: Monthly Cap Validation
**Given** a worker already has 48 overtime hours this month
**When** a site manager tries to log 5 more hours
**Then** system should reject with message:
"Worker has 48/50 overtime hours this month. 
Maximum 2 more hours can be logged."

---

### AC-5: Duplicate Entry Same Day
**Given** overtime has already been logged for Worker A 
on 12-06-2026 by Supervisor 1
**When** Supervisor 2 tries to log overtime for Worker A 
on the same date
**Then** system should warn:
"Overtime already logged for this worker today by 
[Supervisor Name]. Do you want to add additional 
overtime or view existing entry?"

---

### AC-6: Future Date Not Allowed
**Given** the site manager is selecting a date
**When** they select a future date
**Then** form should show error:
"Overtime can only be logged for today or past dates"

---

### AC-7: Mobile Responsiveness
**Given** the site manager is on a mobile phone
**When** they open the overtime entry screen
**Then** all fields are visible without horizontal scrolling
**And** buttons are large enough to tap with a finger
**And** keyboard does not cover the Submit button

---

### AC-8: Offline/Connectivity Loss
**Given** the site manager fills the form at a 
construction site with poor connectivity
**When** they submit and connection is lost mid-way
**Then** the form data should not be lost
**And** an error message should show:
"Submission failed. Your data has been saved. 
Please try again when connected."

---

### AC-9: Worker Not in System
**Given** a site manager tries to log overtime for 
a worker who is not in the HRMS
**When** they search for the worker name
**Then** the worker does not appear in dropdown
**And** there is no option to type a free-form name
**And** a message shows: "Worker not found. 
Contact HR to add them to the system first."

---

### AC-10: Inactive Worker
**Given** a worker has been deactivated in the system
**When** a site manager searches for them
**Then** the worker should not appear in the dropdown
**And** overtime cannot be logged for exited workers

---

### AC-11: Empty Form Submission
**Given** the site manager clicks Submit without 
filling any fields
**When** the form is submitted
**Then** all required field errors show at once:
- "Worker is required"
- "Date is required"  
- "Overtime hours is required"
- "Reason is required (minimum 10 characters)"

---

### AC-12: Reason Too Short
**Given** the site manager types "OT" as reason
**When** they submit
**Then** error shows:
"Reason must be at least 10 characters"

---

## Test Scenarios — Given/When/Then

### Scenario 1 — Happy Path
**Given** site manager logged in on mobile
**When** they log 3.5 hours overtime for Asha Verma 
on 12-06-2026 with reason "Extended shift for foundation work"
**Then** record created, success shown, form resets

### Scenario 2 — Exceeds Daily Limit
**Given** site manager is logged in
**When** they try to log 15 hours overtime for any worker
**Then** error: "Maximum 12 hours overtime per day allowed"

### Scenario 3 — Monthly Cap Reached
**Given** worker already has 50 overtime hours this month
**When** site manager tries to log any overtime for them
**Then** error: "Monthly overtime limit of 50 hours reached"

### Scenario 4 — Duplicate Same Day
**Given** overtime already logged for worker today
**When** same or different supervisor logs again for same worker
**Then** warning shown with existing entry details

### Scenario 5 — Offline Submission
**Given** form is filled completely
**When** network drops before submission completes
**Then** data preserved, retry option shown

### Scenario 6 — Wrong Data Types
**Given** site manager types "five" in hours field
**Then** field rejects non-numeric input immediately

---

## Launch Blockers vs V2

### Must have before launch
- All form fields with validation (AC-1 to AC-3)
- Mobile responsive layout (AC-7)
- Duplicate entry warning (AC-5)
- Empty form validation (AC-11)
- Inactive worker exclusion (AC-10)

### Can go in V2
- Monthly cap enforcement (AC-4)
- Offline data preservation (AC-8)
- Multi-supervisor conflict resolution (AC-5 full flow)
- Overtime approval workflow before payroll impact

---

## Notes for Developer

The form will be used on mobile at construction sites
with poor network. Keep it simple. Large buttons. 
Clear error messages. The site manager is not 
technically trained — if the error message is 
confusing they will just close the app and use 
paper instead.