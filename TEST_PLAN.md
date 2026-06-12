# HRMS – QA Test Plan & Scenarios

End-to-end test plan covering every screen, button, and API, plus a verified
bug list (planted + pre-existing). Use this for exploratory, API, and negative
testing, and as the source for your bug reports.

---

## 1. Setup

```bash
npm run install:all      # install root + backend + frontend
cp backend/.env.example backend/.env       # set MONGODB_URI + JWT_SECRET
cp frontend/.env.example frontend/.env
npm run seed             # creates demo accounts + sample attendance
npm run dev              # backend :5000, frontend :3000
```

- Frontend: http://localhost:3000  •  API base: http://localhost:5000/api
- Use the browser DevTools **Network** + **Console** tabs throughout.
- For API testing use Postman/Insomnia/curl. Auth = header `Authorization: Bearer <token>` from the login response.

### Test accounts (after `npm run seed`)
| Role | Email | Password | Scenario it's good for |
|------|-------|----------|------------------------|
| Admin | admin@hrms.com | password123 | full access |
| HR | hr@hrms.com | password123 | manage employees/attendance/leave/payroll |
| Employee EMP001 | asha@hrms.com | EMP001@123 | weekend attendance → **BUG-2 overpay** |
| Employee EMP002 | rohan@hrms.com | EMP002@123 | weekday attendance, **today open** → test Punch In / **BUG-3** |
| Employee EMP003 | priya@hrms.com | EMP003@123 | weekday attendance + **pending leave**; has deductions |
| Employee EMP004 | vikram@hrms.com | EMP004@123 | partial attendance + **pending leave**; high salary |
| Employee EMP005 | sneha@hrms.com | EMP005@123 | **inactive** (has past attendance) → **BUG-6** (generate payroll via API); login is disabled |
| Employee EMP006 | arjun@hrms.com | EMP006@123 | weekend attendance → **BUG-2 overpay** |
| Employee EMP007 | meera@hrms.com | EMP007@123 | weekday attendance (clean baseline) |

> 2 pending leave requests (EMP003, EMP004) exist so HR/Admin Leave screens have data.
> EMP005 is deactivated — use an **admin token** to `POST /api/payroll/generate` for it to reproduce BUG-6 (the UI dropdown hides inactive staff).

---

## 2. End-to-End Smoke Flow (happy path, do this first)

1. **Login** as Admin → lands on `/admin/dashboard`. Repeat for HR and Employee (each lands on its own dashboard).
2. **HR → Employees → Add Employee**: fill all fields incl. DOB/DOJ + salary → Save → toast shows generated credentials → new row in list.
3. **HR → Employees → (eye)** view profile → **(pencil)** edit → change a field → Update.
4. **Employee login (new employee)** with the generated credentials.
5. **Employee → Attendance → Punch In**, then **Punch Out**.
6. **Employee → Leaves → Apply** (Annual/Casual/Sick) → submit → appears in Leave History as `pending`.
7. **HR → Leaves** → Approve/Reject the request.
8. **HR/Admin → Payroll → Generate Payroll** for an employee/month → record appears → **Download** payslip PDF.
9. **Employee → Payslips** → see and download own payslip.
10. **Logout** from each portal.

Record anything that deviates. The known deviations are catalogued in §4 and §5.

---

## 3. Module-by-Module Scenarios (feature + button + API coverage)

### A. Authentication & Access control
| Test | Steps | Expected |
|------|-------|----------|
| Valid login | each role | token issued, redirect to role dashboard |
| Invalid password | wrong pw | toast "Invalid email or password" (401) |
| Empty fields | submit blank | client validation: email/password messages |
| Inactive user | deactivate an employee, try login | 401 "Account is inactive" |
| Token expiry/401 | hit API with bad token | auto-logout + redirect to /login |
| Route guard | as employee, open `/hr/...` or `/admin/...` URL | redirected to `/employee/dashboard` |
| No signup | look for register | **none exists** (by design) |

API: `POST /api/auth/login`, `GET /api/auth/me`.

### B. Employee management
HR pages: `/hr/employees` (list, search, view, edit, add). Admin page: `/admin/employees` (list, filters, add modal, edit modal, set-salary modal, activate/deactivate, delete).

| Test | Steps | Expected |
|------|-------|----------|
| List + search | type in search | filters by name/email/ID |
| Create (HR) | all fields | created + credentials toast |
| Required validation | leave fields blank | per-field messages; basic salary must be > 0 |
| Edit | change values | persists |
| Set salary (Admin $) | change salary | persists |
| Activate/Deactivate (Admin) | toggle Power icon | status flips |
| Delete (Admin) | trash icon → confirm | employee + user + leave balance removed |
| Duplicate email | create with existing email | 400 "Employee with this email already exists" |

API: `GET/POST /api/employees`, `GET/PUT /api/employees/:id`, `PATCH /api/employees/:id/status`, and admin `…/salary`, `…/activate`, `…/deactivate`, `DELETE /api/admin/employees/:id`.

### C. Attendance
Employee: `/employee/attendance` (Punch In / Punch Out + history). HR: `/hr/attendance` (select employee, punch for them, view). Admin: `/admin/attendance` (date range, status filter, punch modal).

| Test | Steps | Expected |
|------|-------|----------|
| Punch in | employee, first time today | record created, button switches to Punch Out |
| Double punch-in | punch in twice | 400 "Already punched in today" |
| Punch out | after punch-in | punch-out time recorded |
| Punch out w/o punch-in | fresh day | 400 "Please punch in first" |
| History | view table | dates/times/status/hours |
| HR punch for employee | select + punch | works for that employee |

API: `POST /api/attendance/punch-in`, `/punch-out`, `GET /api/attendance/me`, `GET /api/attendance/employee/:id`, HR `…/employee/:id/punch-in|out`, `PATCH /api/attendance/:id/regularize`.

### D. Leave
Employee: `/employee/leaves/apply`, `/employee/leaves` (history + balance). HR/Admin: leave approval.

| Test | Steps | Expected |
|------|-------|----------|
| Apply (annual/casual/sick) | valid dates + reason ≥10 chars | created, pending |
| Date validation | end before start | "End date must be after start date" |
| Insufficient balance | request more days than remaining | 400 insufficient balance |
| Approve/Reject (HR) | act on pending | status updates; approved deducts balance |
| Balance display | check apply page | annual/casual/sick remaining shown |

API: `POST /api/leaves`, `GET /api/leaves/me`, `GET /api/leaves/balance/me`, `GET /api/leaves/pending`, `PATCH /api/leaves/:id`.

### E. Payroll
HR: `/hr/payroll`. Admin: `/admin/payroll` (filters, generate modal, details modal, download). Employee: `/employee/payslips`.

| Test | Steps | Expected |
|------|-------|----------|
| Generate | select employee/month/year | record created (~2s) |
| Duplicate (sequential) | generate same again | 400 "Payroll already generated" |
| Download payslip | click Download | PDF downloads |
| View details (admin) | eye icon | breakdown modal |
| Employee payslips | view own | only own records |

API: `POST /api/payroll/generate`, `GET /api/payroll`, `GET /api/payroll/me`, `GET /api/payroll/:id/payslip`.

### F. Dashboards & Profile
- Employee/HR/Admin dashboards: smoke-test that stats load without console errors.
- Employee `/employee/profile`: edit personal info + address + emergency contact → Save.

---

## 4. PLANTED BUGS — detailed bug reports (all verified)

> These were deliberately introduced. Each is reproducible and documented with root cause.

### BUG-1 — Salary change not reflected in payslip *(Critical)*
- **Steps:** As HR/Admin set an employee's salary (e.g. EMP001) to a new value (Admin → Employees → $ Set Salary, or `PUT /api/admin/employees/:id/salary`). Generate that employee's payroll for a month that has attendance.
- **Expected:** Payslip uses the **current** salary.
- **Actual:** Payslip uses the salary captured at employee **creation**; salary updates are ignored.
- **Verified:** live salary `90000` → payslip basic `50000`.
- **Root cause:** payroll reads `employee.salaryAtJoining` (a snapshot set only in `createEmployee`) instead of the live `employee.salary` (`backend/src/controllers/payrollController.js`).
- **Who's hurt:** the worker (underpaid after a raise) / payroll operator (wrong payouts).
- **Severity:** Critical — money is wrong and silently so.

### BUG-2 — Weekend attendance overpays (ratio > 1.0) *(High)*
- **Steps:** An employee with attendance on weekends (seeded EMP001 has this) → generate payroll for that month.
- **Expected:** Net salary ≤ gross; pay proportional to actual working days.
- **Actual:** `presentDays` (28) > `workingDays` (22) → ratio 1.27 → **net ₹84,000 > gross ₹80,000**.
- **Root cause:** `workingDays` counts weekdays only, but `presentDays` counts every attendance record incl. weekend punches (`payrollController.js`). No weekend exclusion on the present-day side.
- **Who's hurt:** the company (overpays); payroll operator (numbers don't reconcile).
- **Severity:** High.

### BUG-3 — Employee punch-out never finalizes status *(High)*
- **Steps:** As an **employee**, Punch In then Punch Out. Check attendance status/working hours.
- **Expected:** After punch-out, status = `present`/`late`, working hours computed.
- **Actual:** Status stays `incomplete`, working hours `0`. Employee's own dashboard/attendance shows "Absent". (HR/Admin punch-out for the same employee works correctly — proves the cause.)
- **Root cause:** employee `punchOut` uses `Attendance.findByIdAndUpdate(...)`, which bypasses the model `pre('save')` hook that finalizes status + hours (`attendanceController.js`). Also a stray route alias `POST /api/attendance/punchout` exists while the frontend calls `/punch-out`.
- **Who's hurt:** the worker (day not counted → underpaid via BUG-2's present-day logic); site manager (attendance reports wrong).
- **Severity:** High.

### BUG-4 — Negative salary accepted (no boundary validation) *(Medium)*
- **Steps:** `PUT /api/admin/employees/:id/salary` with `{"basic": -50000}` (Admin only).
- **Expected:** 400 rejecting non-positive salary.
- **Actual:** HTTP 200, `-50000` persisted → payroll can produce negative net salary.
- **Verified:** stored basic `-50000`.
- **Root cause:** `setSalary` uses `basic || 0` with no sign/zero check (`employeeController.js`). (Note: the Add/Edit *forms* now validate > 0, but the salary API does not.)
- **Who's hurt:** payroll operator/worker (negative/garbage payouts).
- **Severity:** Medium.

### BUG-5 — Duplicate payroll on double-submit (race condition) *(Medium)*
- **Steps:** Fire two **concurrent** `POST /api/payroll/generate` for the same employee/month (double-click "Generate Payroll", or `Promise.all` two requests).
- **Expected:** Exactly one payroll record; second rejected.
- **Actual:** **Two records** created for the same employee/month.
- **Verified:** 2 records created concurrently (a *sequential* second attempt still correctly returns "already generated").
- **Root cause:** app-level duplicate check with a 2s pre-check delay and **no DB unique constraint / no transaction lock** (`payrollController.js` + removed unique index in `models/Payroll.js`).
- **Who's hurt:** company (double payment); payroll operator.
- **Severity:** Medium.

### BUG-6 — Payroll generated for deactivated employees *(Medium)*
- **Steps:** Deactivate an employee (Admin → Power toggle, or `PATCH …/status {isActive:false}`). Generate payroll for them via API/Admin.
- **Expected:** Blocked — no payroll for exited/inactive staff.
- **Actual:** HTTP 201, payroll generated.
- **Verified:** 201 for inactive employee.
- **Note:** HR/Admin generate dropdowns *hide* inactive employees, so this is found via **API testing** (or by reactivate→deactivate timing).
- **Root cause:** `generatePayroll` never checks `employee.isActive` (`payrollController.js`).
- **Who's hurt:** company (paying ex-employees); payroll operator.
- **Severity:** Medium.

### BUG-7 — Any employee can read everyone's payroll (broken access control) *(High)*
- **Steps:** Log in as an **employee**, call `GET /api/payroll` (optionally `?employeeId=<otherId>`).
- **Expected:** 403 — employees may only see their own (`/api/payroll/me`).
- **Actual:** HTTP 200 returns **all** payroll records (salaries, deductions, net pay of all staff).
- **Verified:** employee token → 200 + records.
- **Root cause:** the role guard was removed from `GET /api/payroll` and `getAllPayrolls` does not scope results to the requester (`routes/payrollRoutes.js` + `payrollController.js`).
- **Who's hurt:** every employee (salary confidentiality breach); company (compliance).
- **Severity:** High.

---

## 5. ADDITIONAL ISSUES FOUND (pre-existing, not planted — bonus findings)

> These already existed in the codebase. Great material to show breadth in your report.

### EXTRA-1 — Admin "Add Employee" cannot create employees *(High)*
- **Steps:** Admin → Employees → **Add Employee** → fill the modal (it has no Date of Birth / Date of Joining fields) → Save.
- **Expected:** Employee created.
- **Actual:** 400 "Path `dateOfBirth` is required" — the Admin modal omits required fields. (HR's Add Employee page includes them and works.)
- **Root cause:** Admin create modal (`pages/admin/Employees.tsx`) is missing required fields the schema enforces.

### EXTRA-2 — Maternity / Paternity / Unpaid leave can never be applied *(Medium)*
- **Steps:** Employee → Apply Leave → choose Maternity/Paternity/Unpaid → submit.
- **Expected:** Request submitted.
- **Actual:** 400 insufficient balance, always. Only annual/casual/sick have balances; the other three are offered in the dropdown but unusable.
- **Root cause:** `LeaveBalance` model only tracks annual/casual/sick; `applyLeave` requires a matching balance bucket.

### EXTRA-3 — Employee can change their own salary / reactivate themselves via API *(High – privilege escalation / mass assignment)*
- **Steps:** As an employee, `PUT /api/employees/<ownId>` with body `{"salary":{"basic":999999},"isActive":true}`.
- **Expected:** Employees can edit profile fields only (name/phone/address…), not salary/status.
- **Actual:** Whole `req.body` is saved (`updateEmployee` does `findByIdAndUpdate(employee._id, req.body)`), so an employee can raise their own salary or flip their status.
- **Root cause:** no field whitelist on `updateEmployee`; the route only checks ownership, not which fields may change.

### EXTRA-4 — Admin "backdated" punch is ignored *(Medium)*
- **Steps:** Admin → Attendance → Punch In/Out modal → pick a past **Date & Time** → submit.
- **Expected:** Attendance recorded for the chosen date/time.
- **Actual:** Backend ignores the supplied timestamp; it always records **now / today** (`punchInForEmployee`/`punchOutForEmployee` use `new Date()`).
- **Bonus:** the punch modal renders a broken stray `<Input as="select">` above the real dropdown.

### EXTRA-5 — Admin "Leave Management" only ever shows pending *(Low/Medium)*
- **Steps:** Admin → Leaves; try to view approved/rejected.
- **Actual:** Always shows only pending requests (route `GET /admin/leaves` maps to `getPendingLeaves`, not `getAllLeaves`); status filters have no effect.

### EXTRA-6 — Production build is broken (`npm run build`) *(Low – dev works)*
- **Steps:** `cd frontend && npm run build`.
- **Actual:** `tsc` fails: legacy `src/AdminDashboard.tsx` uses the old react-router v5 API (`Switch`, `component=`); several unused-import errors; `authStore` uses an invalid `onRehydrate` option. `npm run dev` is unaffected (Vite doesn't type-check).
- **Notes:** `src/components/Sidebar.tsx` is not a valid React component (raw JSX at module top level) — dead/unused file. `authStore`'s employeeId migration never runs because `onRehydrate` should be `onRehydrateStorage`.

---

## 6. API Test Matrix (for Postman/curl)

| Method | Endpoint | Auth | Notes / bug |
|--------|----------|------|-------------|
| POST | /api/auth/login | – | get token |
| GET | /api/auth/me | any | current user |
| GET | /api/employees | hr/admin | list |
| POST | /api/employees | hr/admin | create (needs DOB) |
| GET | /api/employees/:id | any (own if employee) | |
| PUT | /api/employees/:id | any (own if employee) | **EXTRA-3** mass assignment |
| PATCH | /api/employees/:id/status | hr/admin | activate/deactivate |
| PUT | /api/admin/employees/:id/salary | admin | **BUG-4** negative ok |
| DELETE | /api/admin/employees/:id | admin | |
| POST | /api/attendance/punch-in | employee | status → `incomplete` |
| POST | /api/attendance/punch-out | employee | **BUG-3** stays incomplete |
| POST | /api/attendance/punchout | employee | **BUG-3** stray alias |
| POST | /api/payroll/generate | hr/admin | **BUG-2/5/6** |
| GET | /api/payroll | (any!) | **BUG-7** should be hr/admin only |
| GET | /api/payroll/me | employee | correctly scoped |
| GET | /api/payroll/:id/payslip | own/hr/admin | PDF |
| POST | /api/leaves | employee | maternity/paternity/unpaid fail (**EXTRA-2**) |
| PATCH | /api/leaves/:id | hr/admin | approve/reject |

---

## 7. Negative / Boundary Checklist
- [ ] Login: blank, wrong pw, inactive user, SQL/NoSQL-ish strings in email.
- [ ] Employee create: missing required fields, duplicate email, basic salary 0 / negative / non-numeric.
- [ ] Salary API: negative, zero, huge numbers, strings (**BUG-4**).
- [ ] Attendance: double punch-in, punch-out without punch-in, status after punch-out (**BUG-3**).
- [ ] Payroll: generate twice sequentially (blocked) vs concurrently (**BUG-5**), for inactive employee (**BUG-6**), after a salary change (**BUG-1**), with weekend attendance (**BUG-2**).
- [ ] Access control: employee hitting hr/admin routes; employee `GET /api/payroll` (**BUG-7**); employee `PUT` own salary (**EXTRA-3**).
- [ ] Leave: end<start, over-balance, maternity/paternity/unpaid (**EXTRA-2**).
- [ ] Check browser console + network for errors on every page.
```
