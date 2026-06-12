# HRMS - Human Resource Management System

A complete, production-ready HRMS system built with MERN stack (MongoDB, Express, React, Node.js) + TypeScript + Tailwind CSS + Shadcn UI.

## Features

### Authentication
- JWT-based authentication
- Role-based access control (Admin, HR, Employee)
- Secure password hashing with bcrypt

### Employee Management (HR + Admin)
- Add new employees
- Edit employee details
- View employee list and profiles
- Set salary structure
- Activate/Deactivate employees
- Auto-create login credentials

### Attendance Management
- Employee punch-in/punch-out
- Prevent duplicate punches
- View attendance history
- HR/Admin can view any employee's attendance
- Date range filtering
- Attendance regularization

### Leave Management
- Employees can apply for leave
- View leave balance
- View leave history
- HR can approve/reject leaves
- Automatic leave balance deduction

### Payroll Management
- Generate monthly payroll
- View payroll records
- Download payslips as PDF
- Automatic salary calculation based on attendance

### Dashboards
- **Employee Dashboard**: Personal stats, quick actions
- **HR Dashboard**: Employee management, leave approvals, attendance reports
- **Admin Dashboard**: Complete organization overview

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing
- PDFKit for payslip generation

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- React Router
- Zustand for state management
- React Hook Form + Zod for validation
- Axios for API calls
- React Hot Toast for notifications

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API functions
│   │   ├── components/     # Reusable components
│   │   ├── layout/         # Layout components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main app component
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local instance or a MongoDB Atlas cluster)
- npm

### 1. Configure environment variables

Copy the example env files and fill in your own values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

At minimum set `MONGODB_URI` and `JWT_SECRET` in `backend/.env`.
All available variables are documented inside the `.env.example` files.

### 2. Install dependencies

From the project root, install root, backend, and frontend dependencies in one step:

```bash
npm install            # installs the root dev tooling (concurrently)
npm run install:all    # installs root + backend + frontend dependencies
```

(Or install manually: `npm install` in each of `backend/` and `frontend/`.)

### 3. Seed the database (optional but recommended)

This creates demo accounts and sample attendance so you can exercise the app right away.
**Warning:** the seed script clears the HRMS collections in the configured database.

```bash
npm run seed
```

### 4. Run the app

Start the backend and frontend together with a single command from the project root:

```bash
npm run dev
```

- Backend API: `http://localhost:5000`
- Frontend:    `http://localhost:3000`

You can also run them individually:

```bash
npm run dev:backend    # backend only (nodemon)
npm run dev:frontend   # frontend only (Vite)
```

## API Documentation (Swagger)

Interactive OpenAPI docs are served by the backend:

- **Swagger UI:** http://localhost:5000/api/docs
- **Raw OpenAPI JSON:** http://localhost:5000/api/docs.json

To try protected endpoints: open `/api/docs`, call `POST /auth/login`, copy the
`token`, click **Authorize** (top right), paste the token, then execute any request.

## Postman

A ready-to-run collection and environment live in [`postman/`](postman/):

- `postman/HRMS.postman_collection.json`
- `postman/HRMS.postman_environment.json`

Usage:
1. In Postman, **Import** both files.
2. Select the **HRMS Local** environment (sets `baseUrl`).
3. Run the **Auth & Setup** folder first (or use the **Collection Runner** on the
   whole collection). The login requests capture JWT tokens and the
   "Setup - Capture Employee IDs" request stores `emp001Id` / `emp002Id` into
   collection variables that the other requests reuse — no manual token copying.

Every request has test assertions (status code + basic schema). Requires the
backend running and the database seeded (`npm run seed`).

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (HR/Admin)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (HR/Admin)
- `PUT /api/employees/:id` - Update employee (HR/Admin)
- `PATCH /api/employees/:id/status` - Update employee status

### Attendance
- `POST /api/attendance/punch-in` - Punch in
- `POST /api/attendance/punch-out` - Punch out
- `GET /api/attendance/me` - Get my attendance
- `GET /api/attendance/employee/:id` - Get employee attendance (HR/Admin)
- `PATCH /api/attendance/:id/regularize` - Regularize attendance

### Leaves
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves/me` - Get my leaves
- `GET /api/leaves/balance/me` - Get leave balance
- `GET /api/leaves/pending` - Get pending leaves (HR/Admin)
- `PATCH /api/leaves/:id` - Update leave status (HR/Admin)

### Payroll
- `POST /api/payroll/generate` - Generate payroll (HR/Admin)
- `GET /api/payroll/me` - Get my payrolls
- `GET /api/payroll` - Get all payrolls (HR/Admin)
- `GET /api/payroll/:id/payslip` - Download payslip PDF

## Default Credentials

After running `npm run seed`, the following accounts are available:

| Role     | Email            | Password      | Notes |
|----------|------------------|---------------|-------|
| Admin    | admin@hrms.com   | password123   | full access |
| HR       | hr@hrms.com      | password123   | manage employees/attendance/leave/payroll |
| Employee | asha@hrms.com    | EMP001@123    | attendance incl. weekends |
| Employee | rohan@hrms.com   | EMP002@123    | weekday attendance, today open (testable Punch In) |
| Employee | priya@hrms.com   | EMP003@123    | weekday attendance, pending leave |
| Employee | vikram@hrms.com  | EMP004@123    | partial attendance, pending leave |
| Employee | sneha@hrms.com   | EMP005@123    | **inactive** (login disabled) |
| Employee | arjun@hrms.com   | EMP006@123    | attendance incl. weekends |
| Employee | meera@hrms.com   | EMP007@123    | weekday attendance |

New employees created through the app get an auto-generated login.
Default password format for new employees: `{employeeId}@123`

## Features Highlights

- ✅ Modern, clean UI with Tailwind CSS
- ✅ Responsive design
- ✅ Role-based access control
- ✅ JWT authentication
- ✅ Form validation with Zod
- ✅ Toast notifications
- ✅ PDF payslip generation
- ✅ Complete CRUD operations
- ✅ Real-time data updates
- ✅ Secure password handling

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## License

This project is open source and available for use.

## Support

For issues or questions, please create an issue in the repository.

