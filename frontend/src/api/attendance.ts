import api from './axios';

export const attendanceApi = {
  punchIn: async (location?: string) => {
    const response = await api.post('/attendance/punch-in', { location });
    return response.data;
  },
  punchOut: async (location?: string) => {
    const response = await api.post('/attendance/punch-out', { location });
    return response.data;
  },
  getMyAttendance: async (startDate?: string, endDate?: string) => {
    const params = startDate && endDate ? { startDate, endDate } : {};
    const response = await api.get('/attendance/me', { params });
    return response.data;
  },
  getEmployeeAttendance: async (employeeId: string, startDate?: string, endDate?: string) => {
    const params = startDate && endDate ? { startDate, endDate } : {};
    const response = await api.get(`/attendance/employee/${employeeId}`, { params });
    return response.data;
  },
  regularize: async (id: string, status: string, reason: string) => {
    const response = await api.patch(`/attendance/${id}/regularize`, { status, reason });
    return response.data;
  },
  punchInForEmployee: async (employeeId: string, location?: string) => {
    const response = await api.post(`/attendance/employee/${employeeId}/punch-in`, { location });
    return response.data;
  },
  punchOutForEmployee: async (employeeId: string, location?: string) => {
    const response = await api.post(`/attendance/employee/${employeeId}/punch-out`, { location });
    return response.data;
  },
};

