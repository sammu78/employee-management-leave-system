import axiosClient from './axiosClient';

export const employeeApi = {
  getAll: (params) => axiosClient.get('/employees', { params }),
  getById: (id) => axiosClient.get(`/employees/${id}`),
  getMyProfile: () => axiosClient.get('/employees/profile/me'),
  updateMyProfile: (data) => axiosClient.put('/employees/profile/me', data),
  create: (data) => axiosClient.post('/employees', data),
  update: (id, data) => axiosClient.put(`/employees/${id}`, data),
  deactivate: (id) => axiosClient.put(`/employees/${id}/deactivate`),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
};
