import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/auth/Login';
import EmployeeDashboard from './pages/employee/Dashboard';
import HRDashboard from './pages/hr/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import EmployeeLayout from './layout/EmployeeLayout';
import HRLayout from './layout/HRLayout';
import AdminLayout from './layout/AdminLayout';
import EmployeeList from './pages/hr/EmployeeList';
import AddEmployee from './pages/hr/AddEmployee';
import EditEmployee from './pages/hr/EditEmployee';
import EmployeeProfile from './pages/hr/EmployeeProfile';
import Attendance from './pages/employee/Attendance';
import LeaveApply from './pages/employee/LeaveApply';
import LeaveHistory from './pages/employee/LeaveHistory';
import Payslips from './pages/employee/Payslips';
import Profile from './pages/employee/Profile';
import HRAttendance from './pages/hr/Attendance';
import HRLeaves from './pages/hr/Leaves';
import HRPayroll from './pages/hr/Payroll';
import AdminEmployees from './pages/admin/Employees';
import AdminAttendance from './pages/admin/Attendance';
import AdminLeaves from './pages/admin/Leaves';
import AdminPayroll from './pages/admin/Payroll';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster position="top-right" />
        <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<Attendance />} />
            <Route path="/employee/leaves" element={<LeaveHistory />} />
            <Route path="/employee/leaves/apply" element={<LeaveApply />} />
            <Route path="/employee/payslips" element={<Payslips />} />
            <Route path="/employee/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['hr']} />}>
          <Route element={<HRLayout />}>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/employees" element={<EmployeeList />} />
            <Route path="/hr/employees/add" element={<AddEmployee />} />
            <Route path="/hr/employees/:id" element={<EmployeeProfile />} />
            <Route path="/hr/employees/:id/edit" element={<EditEmployee />} />
            <Route path="/hr/attendance" element={<HRAttendance />} />
            <Route path="/hr/leaves" element={<HRLeaves />} />
            <Route path="/hr/payroll" element={<HRPayroll />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/leaves" element={<AdminLeaves />} />
            <Route path="/admin/payroll" element={<AdminPayroll />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

