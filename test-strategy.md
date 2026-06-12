# Test Strategy — HRMS Construction Payroll

**Written by:** Swayam Singh
**Date:** 12-06-2026
**Repo:** github.com/YOUR_USERNAME/hrms-fullstack-mern

---

## Why I wrote this

Before writing a single test I spent time understanding
what this system actually does and who depends on it.

This is a payroll system for construction companies.
The users are not software engineers. They are site
managers logging attendance on a phone at a dusty
construction site, payroll operators processing
salaries for 200 workers, and daily wage workers
whose rent depends on getting paid correctly this month.

Every test I wrote has a real person behind it.
If I got the testing wrong, that person gets hurt.

---

## What this system actually does

Everything in this system flows toward one output:
the payslip.

Worker joins → attendance tracked → overtime logged
→ salary calculated → payslip generated → worker paid

If any step in this chain breaks, the worker does not
get paid correctly. That is the only thing that matters.

---

## The 5 most critical flows ranked by impact

### 1. Salary → Payslip Calculation (Critical)
**Why #1:**
This is the core of the entire system. If salary
data does not flow correctly into payslip, every
worker gets wrong pay. I found BUG-001 here —
salary updates are silently ignored during payroll
generation. 200 workers could get wrong payslips
and nobody would know.

**Who gets hurt if it breaks:**
Asha Verma got a raise but her payslip shows old
salary. She gets paid ₹40,000 less this month.
She has no way to know why.

---

### 2. Attendance → Payroll Calculation (Critical)
**Why #2:**
Net salary is calculated using attendance ratio.
Wrong attendance = wrong pay. I found two bugs here:
BUG-002 (weekend attendance causes overpayment) and
BUG-003 (employee punch out never marks attendance
as present). A worker can punch in and out every day
and still get paid for 0 days.

**Who gets hurt if it breaks:**
Construction worker punches in every day for a month.
Payroll runs. Present days = 0. Net salary = ₹0.
Worker cannot pay rent.

---

### 3. Employee Onboarding (High)
**Why #3:**
If a worker cannot be added to the system, they
cannot punch in, cannot apply leave, cannot receive
payslip. They are invisible. I found BUG-008 here —
Admin cannot add employees at all due to missing
form fields.

**Who gets hurt if it breaks:**
New worker joins the construction site on Day 1.
Admin cannot add them. They work for a month.
Payroll runs. They are not in the system.
They get nothing.

---

### 4. Role Based Access Control (High)
**Why #4:**
If any employee can see all salaries, trust breaks.
If an employee can change their own salary, the
company loses money. I found BUG-007 (any employee
sees all payrolls) and EXTRA-003 (employee can
change own salary via API).

**Who gets hurt if it breaks:**
Junior worker sees senior manager salary.
Workplace conflict. HR compliance violation.
In worst case, employee raises own salary via API.

---

### 5. Employee Exit / Deactivation (Medium)
**Why #5:**
When a worker leaves, payroll must stop. I found
BUG-006 — payroll can still be generated for
deactivated employees. In construction with high
worker turnover, this could mean paying dozens
of exited workers every month.

**Who gets hurt if it breaks:**
Worker exits in June. Payroll operator generates
July payroll. Exited worker gets paid.
Company loses money. Finance audit fails.

---

## What I will automate vs test manually

### Automate these

**Salary → payslip math verification**
Why: This runs every month for every employee.
If it breaks, impact is maximum. Automated test
catches it immediately on every code change.
The senior dev changed payroll logic last sprint
and broke it — a test would have caught that.

**Attendance punch in/out flow**
Why: BUG-003 showed that employee punch out is
broken. This is a regression risk — any change
to attendance controller could break it again.
Automated test prevents that.

**Role based access control**
Why: Security tests must run on every deployment.
Manual testing every time is not reliable.
One missed test = salary data exposed.

**API validation tests**
Why: UI forms have validation but API does not.
Any developer can call the API directly and bypass
UI validation. Automated API tests are the only
safety net here.

**CI smoke tests**
Why: Two production incidents happened because
broken code reached production with no checks.
3-5 fast smoke tests on every push would have
caught both incidents before deployment.

---

### Test manually these

**PDF payslip visual layout**
Why: Checking that payslip looks correct, numbers
are aligned, rupee symbol shows properly — this
needs human eyes. Automating PDF visual checks
is complex and brittle.

**Mobile responsiveness**
Why: Site managers use phones at construction sites.
Manual testing on actual devices is more reliable
than automated viewport tests for real usability.

**Leave approval workflow end to end**
Why: This involves multiple role switches (employee
applies, HR approves). Manual testing is faster
to set up and easier to verify visually.

**Error message clarity**
Why: Whether an error message makes sense to a
non-technical payroll operator needs human judgment.
Automation can only check if a message exists,
not if it is clear.

---

## How I kept CI fast

The senior dev specifically said he does not want
a 20-minute test suite. I agree — a slow CI that
nobody runs is worse than no CI.

My approach:
- Smoke tests (3-5 tests) run on every push
  — checks app boots and critical endpoints respond
  — completes in under 2 minutes
- Full E2E suite runs only on PR to main
  — not on every push to feature branches
- API tests run in parallel with E2E tests
  — saves time on CI

This way the senior dev's daily pushes are not
slowed down but the main branch is always protected.

---

## What I deliberately did NOT test

### Performance / Load testing
This codebase has no performance issues visible
at current scale (2 construction sites, ~200 workers).
Load testing would be premature optimization.
Worth revisiting when they scale to 8 sites.

### Email notifications
The system does not have email functionality.
No point testing something that does not exist.

### Browser compatibility
The app uses modern React with Tailwind.
Cross-browser testing beyond Chrome is low priority
for an internal HR tool used by a small team.

### Legacy admin dashboard
The AdminDashboard.tsx file uses old React Router v5
API and is broken. It appears to be dead/unused code.
Testing broken legacy code that is not in use wastes
time. Flagged it as EXTRA-006 and moved on.

### Every possible SQL injection variation
Basic injection testing done in NT-029. The app
uses MongoDB with Mongoose which provides good
protection. Comprehensive injection testing would
take days and adds diminishing returns here.

---

## The team dynamic I had to account for

This was not just a technical problem.

**Senior Dev** thinks QA is overhead. He has been
on this codebase 3 years and fixes things from memory.
My strategy works WITH him not against him:
- CI runs fast so his workflow barely changes
- Tests document the system so new devs don't need
  to ask him every time
- I used his codebase knowledge to understand
  where the real risks are (payroll module)

**New Dev** is afraid to touch payroll module.
My regression suite is specifically designed for him:
- Tests tell him what is safe to change
- If he breaks something, tests catch it immediately
- He can push code without asking senior dev every time

**PM** wants speed AND reliability.
Fast CI + targeted tests = both. Not one at the cost
of the other.

**Dev Lead** does not want slow CI.
Smoke tests complete in under 2 minutes.
Full suite runs only on PR not every push.

---

## One honest thing

I have not worked on a construction payroll system
before. I understand the codebase I tested but I
do not fully understand the business rules around
PF calculations, ESIC, labour law overtime limits,
or how the payroll data integrates with accounting
systems.

Before this goes to production, someone with
domain knowledge should review whether the
10% tax and 12% PF calculations match actual
Indian labour law requirements. My tests verify
the math is consistent — not that the business
rules themselves are correct.