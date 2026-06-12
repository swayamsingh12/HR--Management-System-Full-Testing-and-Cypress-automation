import api from './axios';

// Admin Employee APIs
export const adminEmployeesApi = {
  getAll: async (filters?: any) => {
    const response = await api.get('/admin/employees', { params: filters });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/admin/employees/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/admin/employees', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/admin/employees/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data;
  },
  activate: async (id: string) => {
    const response = await api.patch(`/admin/employees/${id}/activate`, {
      isActive: true,
    });
    return response.data;
  },
  deactivate: async (id: string) => {
    const response = await api.patch(`/admin/employees/${id}/deactivate`, {
      isActive: false,
    });
    return response.data;
  },
  setSalary: async (id: string, salary: any) => {
    const response = await api.put(`/admin/employees/${id}/salary`, salary);
    return response.data;
  },
};

// Admin Attendance APIs
export const adminAttendanceApi = {
  getAll: async (filters?: any) => {
    const response = await api.get('/admin/attendance', { params: filters });
    return response.data;
  },
  punchIn: async (employeeId: string, timestamp?: Date) => {
    const response = await api.post(`/admin/attendance/${employeeId}/punch-in`, {
      timestamp,
    });
    return response.data;
  },
  punchOut: async (employeeId: string, timestamp?: Date) => {
    const response = await api.post(`/admin/attendance/${employeeId}/punch-out`, {
      timestamp,
    });
    return response.data;
  },
  regularize: async (attendanceId: string, data: any) => {
    const response = await api.patch(
      `/admin/attendance/${attendanceId}/regularize`,
      data
    );
    return response.data;
  },
  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get('/admin/attendance', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

// Admin Leave APIs
export const adminLeavesApi = {
  getPending: async () => {
    const response = await api.get('/admin/leaves');
    return response.data;
  },
  getAll: async (filters?: any) => {
    const response = await api.get('/admin/leaves', { params: filters });
    return response.data;
  },
  approve: async (leaveId: string, remarks?: string) => {
    const response = await api.patch(`/admin/leaves/${leaveId}/approve`, {
      status: 'approved',
      remarks,
    });
    return response.data;
  },
  reject: async (leaveId: string, remarks?: string) => {
    const response = await api.patch(`/admin/leaves/${leaveId}/reject`, {
      status: 'rejected',
      rejectionReason: remarks,
    });
    return response.data;
  },
};

// Admin Payroll APIs
export const adminPayrollApi = {
  generate: async (data: any) => {
    const response = await api.post('/admin/payroll/generate', data);
    return response.data;
  },
  getAll: async (filters?: any) => {
    const response = await api.get('/admin/payroll', { params: filters });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/admin/payroll/${id}`);
    return response.data;
  },
  downloadPayslip: async (payrollId: string) => {
    const response = await api.get(`/admin/payroll/${payrollId}/payslip`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
