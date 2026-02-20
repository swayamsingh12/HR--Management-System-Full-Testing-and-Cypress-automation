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
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

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

After setting up, you'll need to create users. You can create an admin user manually in MongoDB or use the employee creation API to create employees (which auto-creates user accounts).

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

