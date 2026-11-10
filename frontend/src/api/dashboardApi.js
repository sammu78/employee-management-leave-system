import axiosClient from './axiosClient';

export const dashboardApi = {
  getAdminStats: () => axiosClient.get('/dashboard/admin'),
  getEmployeeStats: () => axiosClient.get('/dashboard/employee'),
};

