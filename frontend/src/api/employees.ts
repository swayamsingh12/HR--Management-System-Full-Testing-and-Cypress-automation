import api from './axios';

export const employeesApi = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/employees', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/employees/${id}/status`, { isActive });
    return response.data;
  },
};

