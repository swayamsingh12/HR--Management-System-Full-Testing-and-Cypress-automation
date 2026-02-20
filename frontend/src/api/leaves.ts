import api from './axios';

export const leavesApi = {
  apply: async (data: any) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },
  getMyLeaves: async () => {
    const response = await api.get('/leaves/me');
    return response.data;
  },
  getMyBalance: async () => {
    const response = await api.get('/leaves/balance/me');
    return response.data;
  },
  getPending: async () => {
    const response = await api.get('/leaves/pending');
    return response.data;
  },
  updateStatus: async (id: string, status: string, rejectionReason?: string) => {
    const response = await api.patch(`/leaves/${id}`, { status, rejectionReason });
    return response.data;
  },
};

