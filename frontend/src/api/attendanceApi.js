import axiosClient from './axiosClient';

export const attendanceApi = {
  checkIn: (data) => axiosClient.post('/attendance/check-in', data),
  checkOut: (data) => axiosClient.post('/attendance/check-out', data),
  getToday: () => axiosClient.get('/attendance/today'),
  getMyAttendance: (params) => axiosClient.get('/attendance/my', { params }),
  getAll: (params) => axiosClient.get('/attendance', { params }),
};
