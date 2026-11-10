import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import leaveReducer from './slices/leaveSlice';
import attendanceReducer from './slices/attendanceSlice';
import departmentReducer from './slices/departmentSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    leave: leaveReducer,
    attendance: attendanceReducer,
    department: departmentReducer,
    dashboard: dashboardReducer,
  },
});
