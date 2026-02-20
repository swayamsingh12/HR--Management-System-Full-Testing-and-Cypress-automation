import api from './axios';

export const payrollApi = {
  generate: async (data: { employeeId: string; month: number; year: number }) => {
    const response = await api.post('/payroll/generate', data);
    return response.data;
  },
  getMyPayrolls: async () => {
    const response = await api.get('/payroll/me');
    return response.data;
  },
  getAll: async (month?: number, year?: number, employeeId?: string) => {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (employeeId) params.employeeId = employeeId;
    const response = await api.get('/payroll', { params });
    return response.data;
  },
  downloadPayslip: async (id: string) => {
    const response = await api.get(`/payroll/${id}/payslip`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

