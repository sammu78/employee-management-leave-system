import axiosClient from './axiosClient';

export const leaveApi = {
  apply: (data) => axiosClient.post('/leaves', data),
  getMyLeaves: (params) => axiosClient.get('/leaves/my', { params }),
  getAll: (params) => axiosClient.get('/leaves', { params }),
  getById: (id) => axiosClient.get(`/leaves/${id}`),
  approve: (id) => axiosClient.put(`/leaves/${id}/approve`),
  reject: (id, data) => axiosClient.put(`/leaves/${id}/reject`, data),
  cancel: (id) => axiosClient.put(`/leaves/${id}/cancel`),
  getMyBalance: () => axiosClient.get('/leaves/balance/my'),
  getEmployeeBalance: (employeeId) => axiosClient.get(`/leaves/balance/${employeeId}`),
};
