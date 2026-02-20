// AdminDashboard component
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Employees from './pages/admin/Employees';
import Attendance from './pages/admin/Attendance';
import Leaves from './pages/admin/Leaves';
import Payroll from './pages/admin/Payroll';

const AdminDashboard = () => {
    return (
        <Switch>
            <Route path="/admin/employees" component={Employees} />
            <Route path="/admin/attendance" component={Attendance} />
            <Route path="/admin/leaves" component={Leaves} />
            <Route path="/admin/payroll" component={Payroll} />
        </Switch>
    );
};

export default AdminDashboard;
