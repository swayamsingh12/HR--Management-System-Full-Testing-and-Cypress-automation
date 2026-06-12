# HRMS Full Testing & Cypress Automation

**QA Engineer Fellowship Assignment — Deep Thought Launchpad**

A complete quality engineering implementation for a 
construction industry HRMS (Human Resource Management 
System). This repository contains the full test suite, 
bug reports, acceptance criteria, test strategy, and 
CI pipeline built as part of the QA Engineer Fellowship 
selection process.

---

## What This Project Is

This is a MERN stack HRMS application used by 
construction companies to manage workers, track 
attendance, and process payroll. The users are 
site managers, payroll operators, HR teams, and 
daily wage workers whose salary depends on this 
system working correctly.

I joined as the first QA Engineer on a team that 
had no tests, no CI pipeline, and had already 
experienced two production incidents in one month 
that caused workers to receive wrong or late 
payslips.

My job was not just to write tests. It was to make 
quality something the entire team does — not 
something one person owns.

---

## Tech Stack

**Application:**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT

**Testing:**
- E2E: Cypress
- API: Postman + Newman
- CI: GitHub Actions
- API Docs: Swagger UI

---

## Project Structure
hrms-fullstack-mern/

├── .github/

│   └── workflows/

│       └── ci.yml              # GitHub Actions CI pipeline

├── backend/                    # Node.js + Express API

├── frontend/                   # React + TypeScript app

├── cypress/

│   ├── e2e/

│   │   ├── 01-employee-onboarding.cy.js

│   │   ├── 02-profile-update.cy.js

│   │   ├── 03-salary-payslip-flow.cy.js

│   │   ├── 04-employee-exit.cy.js

│   │   └── 05-api-tests.cy.js

│   ├── support/

│   │   ├── commands.js

│   │   └── e2e.js

│   └── fixtures/

│       └── testData.json

├── api-tests/

│   └── hrms-api-tests.postman_collection.json

├── bug-reports/

│   ├── BUG-001-salary-not-reflected-in-payslip.md

│   ├── BUG-002-weekend-attendance-overpays-worker.md

│   ├── BUG-003-punchout-status-stays-incomplete.md

│   ├── BUG-004-negative-salary-accepted.md

│   ├── BUG-005-duplicate-payroll-race-condition.md

│   ├── BUG-006-payroll-for-inactive-employee.md

│   ├── BUG-007-employee-sees-all-payrolls.md

│   ├── BUG-008-admin-add-employee-form-broken.md

│   ├── BUG-009-maternity-leave-always-fails.md

│   ├── BUG-010-duplicate-selector-punch-modal.md

│   ├── BUG-011-rupee-symbol-wrong-in-pdf.md

│   └── BUG-012-generate-button-not-disabled.md

├── specs/

│   └── overtime-entry.md

├── test-strategy.md

├── quality-reflection.md

├── negative-testing-report.md

└── README.md
---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/swayamsingh12/HR--Management-System-Full-Testing-and-Cypress-automation.git
cd HR--Management-System-Full-Testing-and-Cypress-automation

# Install all dependencies
npm run install:all

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env and add your MONGODB_URI and JWT_SECRET
```

### Environment Variables

Backend `.env`:PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

NODE_ENV=development

### Seed Database

```bash
npm run seed
```

This creates:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrms.com | password123 |
| HR | hr@hrms.com | password123 |
| Employee 1 | asha@hrms.com | EMP001@123 |
| Employee 2 | rohan@hrms.com | EMP002@123 |

### Run Application

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

---

## Running Tests

### Cypress E2E Tests

```bash
# Open Cypress interactive mode
npm run cypress:open

# Run headlessly
npm run cypress:run
```

### Newman API Tests

```bash
# Run API test collection
npm run test:api
```

### All Tests

```bash
npm run test:all
```

---

## The 12 Bugs Found

Testing revealed 12 bugs — 7 were planted 
intentionally to simulate real construction 
payroll failures, and 5 were genuine pre-existing 
issues discovered during exploratory testing.

### Critical Bugs

| ID | Bug | Severity | Status |
|----|-----|----------|--------|
| BUG-001 | Salary update not reflected in payslip | Critical | Open |
| BUG-002 | Weekend attendance causes worker overpayment | High | Open |
| BUG-003 | Employee punch out status stays incomplete | High | Open |
| BUG-007 | Any employee can view all payroll data | High | Open |
| BUG-008 | Admin add employee form missing required fields | High | Open |

### Medium Bugs

| ID | Bug | Severity | Status |
|----|-----|----------|--------|
| BUG-004 | Negative salary accepted via API | Medium | Open |
| BUG-005 | Duplicate payroll on concurrent requests | Medium | Open |
| BUG-006 | Payroll generated for inactive employee | Medium | Open |
| BUG-009 | Maternity leave always fails | Medium | Open |

### Low Bugs

| ID | Bug | Severity | Status |
|----|-----|----------|--------|
| BUG-010 | Duplicate selector in punch modal | Low | Open |
| BUG-011 | Rupee symbol wrong in payslip PDF | Low | Open |
| BUG-012 | Generate payroll button not disabled | Low | Open |

Full bug reports with steps to reproduce,
evidence, root cause, and who gets hurt:
See `bug-reports/` folder.

---

## Test Coverage

### E2E Test Results

| Test File | Tests | Pass | Fail | Notes |
|-----------|-------|------|------|-------|
| 01-employee-onboarding | 4 | 3 | 1 | BUG-008 fail expected |
| 02-profile-update | 4 | 3 | 1 | BUG-001 fail expected |
| 03-salary-payslip-flow | 6 | 5 | 1 | BUG-002 fail expected |
| 04-employee-exit | 4 | 2 | 2 | BUG-006 BUG-007 fail expected |

Tests marked as EXPECTED TO FAIL document
known bugs. They will pass after bugs are fixed.

### API Test Results (Newman)

| Category | Tests | Pass | Fail | Notes |
|----------|-------|------|------|-------|
| Authentication | 7 | 7 | 0 | All passing |
| Employee Management | 6 | 5 | 1 | BUG-004 fail expected |
| Attendance | 4 | 3 | 1 | BUG-003 fail expected |
| Payroll | 8 | 5 | 3 | BUG-006 BUG-007 fail expected |
| Leave Management | 4 | 3 | 1 | BUG-009 fail expected |

### Negative Testing

30 negative test cases across 6 categories:
- 20 PASS
- 10 FAIL (document known bugs)

See `negative-testing-report.md` for full details.

---

## CI Pipeline

GitHub Actions runs automatically on every push
to main and on every pull request.

Three jobs run in sequence:

**Job 1 — Smoke Tests**
Verifies the app boots and critical endpoints
respond. This is the minimum safety gate.
Must always be green before any deployment.

**Job 2 — API Tests**
Runs full Newman collection against the backend.
Tests all 4 categories: happy path, validation,
business rules, error responses.

**Job 3 — E2E Tests**
Runs full Cypress suite against the complete
running application. Tests all 4 core user flows.

Tests documenting known bugs use
`continue-on-error: true` so the pipeline
does not completely block on known issues.
Once bugs are fixed, remove continue-on-error
to enforce a fully green pipeline.

---

## API Documentation

Swagger UI is available when the backend is running:http://localhost:5000/api-docs

Documents all endpoints with:
- Request body schemas
- Response schemas
- Authentication requirements
- Known bug notes

---

## Assignment Deliverables

| Deliverable | File | Status |
|-------------|------|--------|
| Test Strategy | test-strategy.md | ✅ Done |
| Quality Reflection | quality-reflection.md | ✅ Done |
| Acceptance Criteria | specs/overtime-entry.md | ✅ Done |
| Bug Reports | bug-reports/ (12 files) | ✅ Done |
| Negative Testing | negative-testing-report.md | ✅ Done |
| E2E Test Suite | cypress/e2e/ (5 files) | ✅ Done |
| API Test Suite | api-tests/ | ✅ Done |
| CI Pipeline | .github/workflows/ci.yml | ✅ Done |
| API Documentation | Swagger at /api-docs | ✅ Done |

---

## What I Learned

The biggest insight from this assignment was
not technical. It was understanding that behind
every payroll bug is a real person who did not
get paid correctly this month.

A daily wage construction worker who punches
in every day but gets ₹0 on their payslip
because of BUG-003 is not a test case.
That is someone who cannot pay rent.

That understanding changed how I prioritized
tests — not by technical complexity but by
who gets hurt when it breaks.

---

## Author

**Swayam Singh**
QA Engineer Intern — Kraftshala
Deep Thought QA Engineer Fellowship Candidate

---

## Repository
https://github.com/swayamsingh12/HR--Management-System-Full-Testing-and-Cypress-automation

