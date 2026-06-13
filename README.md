<div align="center">

# 🏗️ HRMS — Full Quality Engineering Suite

### QA Engineer Fellowship Assignment | Deep Thought Launchpad

[![CI Pipeline](https://github.com/swayamsingh12/HR--Management-System-Full-Testing-and-Cypress-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/swayamsingh12/HR--Management-System-Full-Testing-and-Cypress-automation/actions)
![Bugs Found](https://img.shields.io/badge/Bugs%20Found-12-red)
![Tests Written](https://img.shields.io/badge/Tests%20Written-47-green)
![E2E](https://img.shields.io/badge/E2E-Cypress-brightgreen)
![API](https://img.shields.io/badge/API-Newman%20%2B%20Postman-orange)

</div>

---

## 📖 The Story Behind This Project

This is not just a test automation project.

I joined as the **first QA Engineer** on a team building HR technology for construction companies. The users are site managers logging attendance on phones at dusty construction sites, payroll operators processing salaries for 200 workers, and **daily wage workers whose rent depends on getting paid correctly this month.**

The team had no tests, no CI pipeline, and had already experienced **two production incidents** in one month:

> **Incident 1:** A missing environment variable crashed the app on the last day of the month. 200 payslips failed to generate. 38 workers got their pay 3 days late.

> **Incident 2:** An API route typo caused attendance submission to return 404 for 2 days. 47 workers' overtime was never logged. 12 workers got less pay that month.

My job was to make sure this never happens again — not by gatekeeping, but by making quality the path of least resistance for the entire team.

---

## 🎯 What I Built

| Deliverable | Description | Status |
|-------------|-------------|--------|
| 📋 Test Strategy | Risk-based testing approach for construction payroll | ✅ |
| 🔍 Exploratory Testing | 45-60 min structured session, 12 bugs found | ✅ |
| 📝 Acceptance Criteria | Overtime entry spec from a vague PM Slack message | ✅ |
| 🐛 Bug Reports | 12 detailed reports with evidence and impact | ✅ |
| ⚠️ Negative Testing | 30 test cases across 6 categories | ✅ |
| 🤖 Cypress E2E Suite | 4 core user journey flows automated | ✅ |
| 🔌 API Test Suite | 29 tests via Postman/Newman | ✅ |
| 🚀 CI Pipeline | GitHub Actions running on every push | ✅ |
| 📚 Swagger Docs | Full API documentation at /api-docs | ✅ |
| 💭 Quality Reflection | Honest answers about testing philosophy | ✅ |

---

## 🏗️ Tech Stack

<table>
<tr>
<td valign="top">

**Application**
- React 18 + TypeScript
- Vite + Tailwind CSS
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- PDFKit (payslip generation)

</td>
<td valign="top">

**Testing**
- Cypress (E2E automation)
- Postman + Newman (API tests)
- GitHub Actions (CI/CD)
- Swagger UI (API docs)

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/swayamsingh12/HR--Management-System-Full-Testing-and-Cypress-automation.git
cd HR--Management-System-Full-Testing-and-Cypress-automation

# Install all dependencies
npm run install:all

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Add your MONGODB_URI and JWT_SECRET to backend/.env
```

### Environment Variables

**backend/.env**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

### Seed & Run

```bash
# Create demo accounts and sample data
npm run seed

# Start both frontend and backend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Swagger Docs | http://localhost:5000/api-docs |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrms.com | password123 |
| HR | hr@hrms.com | password123 |
| Employee 1 | asha@hrms.com | EMP001@123 |
| Employee 2 | rohan@hrms.com | EMP002@123 |

---

## 🧪 Running Tests

### Cypress E2E Tests

```bash
# Interactive mode
npm run cypress:open

# Headless mode
npm run cypress:run
```

### Newman API Tests

```bash
npm run test:api
```

### Run Everything

```bash
npm run test:all
```

---

## 🐛 12 Bugs Found

I found **12 bugs** during exploratory and negative testing — 7 planted intentionally to simulate real payroll failures, and 5 genuine pre-existing issues.

### 🔴 Critical

| ID | Bug | Impact |
|----|-----|--------|
| BUG-001 | Salary update not reflected in payslip | Worker underpaid after raise. Payroll uses old salary silently. |
| BUG-002 | Weekend attendance causes overpayment | Net salary ₹84,000 exceeds gross ₹80,000. Present 28 > Working 22. |

### 🟠 High

| ID | Bug | Impact |
|----|-----|--------|
| BUG-003 | Employee punch out stays incomplete | Worker punches in/out daily. Status never becomes present. Gets ₹0. |
| BUG-007 | Any employee sees all payroll data | Employee token returns all salaries. Complete privacy violation. |
| BUG-008 | Admin add employee form broken | Missing DOB field. Every admin employee creation fails with 400. |

### 🟡 Medium

| ID | Bug | Impact |
|----|-----|--------|
| BUG-004 | Negative salary accepted via API | API accepts basic: -50000. Payslip can show negative net salary. |
| BUG-005 | Duplicate payroll on concurrent requests | Double-click generates 2 payroll records for same employee/month. |
| BUG-006 | Payroll generated for inactive employee | Deactivated workers still get payroll. Company pays exited staff. |
| BUG-009 | Maternity leave always fails | Maternity/Paternity/Unpaid leave show 0 balance. Cannot be applied. |

### 🟢 Low

| ID | Bug | Impact |
|----|-----|--------|
| BUG-010 | Duplicate selector in punch modal | Two employee selectors shown in admin punch modal. |
| BUG-011 | Rupee symbol wrong in PDF | ₹ shows as ¹ on all payslips. Official document looks incorrect. |
| BUG-012 | Generate button not disabled | Button stays active during processing. Multiple clicks possible. |

> Full bug reports with steps to reproduce, evidence, root cause, and who gets hurt: [`bug-reports/`](./bug-reports/)

---

## 📊 Test Results

### E2E Tests (Cypress)

| File | What It Tests | Pass | Fail |
|------|--------------|------|------|
| 01-employee-onboarding | HR adds employee, active status, duplicate email | 3 | 1* |
| 02-profile-update | Salary update, payroll propagation, profile edit | 3 | 1* |
| 03-salary-payslip-flow | Gross/Tax/PF math, net vs gross, PDF download | 5 | 1* |
| 04-employee-exit | Deactivate, login blocked, payroll stops | 2 | 2* |

*Failing tests **intentionally document known bugs**.
They will turn green once bugs are fixed.

### API Tests (Newman)

| Category | Tests | Pass | Fail |
|----------|-------|------|------|
| Authentication | 7 | 7 | 0 |
| Employee Management | 6 | 5 | 1* |
| Attendance | 4 | 3 | 1* |
| Payroll | 8 | 5 | 3* |
| Leave Management | 4 | 3 | 1* |

### Negative Testing

| Category | Tests | Pass | Fail |
|----------|-------|------|------|
| Authentication | 7 | 7 | 0 |
| Employee Management | 6 | 4 | 2 |
| Attendance | 3 | 2 | 1 |
| Payroll | 7 | 3 | 4 |
| Leave Management | 3 | 2 | 1 |
| XSS/Injection | 3 | 2 | 1 |
| **Total** | **29** | **20** | **9** |

---

## 🚦 CI Pipeline

GitHub Actions runs automatically on every push to `main` and every pull request.

```text
Push to main
     │
     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Smoke Tests  │────▶│  API Tests   │────▶│  E2E Tests   │
│              │     │   Newman     │     │   Cypress    │
│  3 checks    │     │  29 tests    │     │  18 tests    │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Smoke Tests — 3 checks that must always pass:**
- ✅ Backend server is running
- ✅ Database is connected and responding
- ✅ Payroll endpoint is alive

**About `continue-on-error` in the pipeline:**
Some tests intentionally fail to document known bugs.
Once all bugs are fixed, remove `continue-on-error`
to enforce a fully green pipeline.

---

## 📁 Project Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI
├── backend/                                # Node.js + Express API
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── middleware/
├── frontend/                               # React + TypeScript
│   └── src/
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
│   └── overtime-entry.md                   # QA-301 Acceptance Criteria
├── test-strategy.md                        # Testing approach and decisions
├── quality-reflection.md                   # Personal quality philosophy
├── negative-testing-report.md              # QA-303 Negative testing
└── README.md
```

---

## 💭 Key Insight

> *"The test strategy applies to any software project ever built. The strong answer names specific screens, specific calculations, specific users, and specific failure consequences in this HRMS."*

Every test I wrote has a real person behind it.

**BUG-003** is not just "punch out status stays incomplete."
It is Asha Verma punching in every single day for a month,
trusting the system is tracking her attendance,
and then receiving ₹0 on her payslip because
the status never changed from incomplete.

That is someone who cannot pay rent.

That understanding — not technical skill —
is what drives every priority decision in this project.

---

## 👤 Author

**Swayam Singh**
Automation Test Engineer @ Kraftshala


---

<div align="center">

**If this repo helped you understand QA engineering
beyond just writing test cases — it did its job.**

</div>
