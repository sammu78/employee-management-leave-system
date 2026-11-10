import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import EmployeeDashboardPage from '../pages/EmployeeDashboardPage';
import EmployeeDirectoryPage from '../pages/EmployeeDirectoryPage';
import EmployeeDetailsPage from '../pages/EmployeeDetailsPage';
import AddEditEmployeePage from '../pages/AddEditEmployeePage';
import LeaveApplicationPage from '../pages/LeaveApplicationPage';
import LeaveApprovalPage from '../pages/LeaveApprovalPage';
import LeaveHistoryPage from '../pages/LeaveHistoryPage';
import AttendanceManagementPage from '../pages/AttendanceManagementPage';
import DepartmentManagementPage from '../pages/DepartmentManagementPage';
import ProfilePage from '../pages/ProfilePage';
import AccessDeniedPage from '../pages/AccessDeniedPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Authenticated routes inside DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Default redirect based on role */}
          <Route
            path="/"
            element={
              user?.role === 'ROLE_ADMIN' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Employee Routes */}
          <Route path="/dashboard" element={<EmployeeDashboardPage />} />
          <Route path="/leaves/apply" element={<LeaveApplicationPage />} />
          <Route path="/leaves/history" element={<LeaveHistoryPage />} />
          <Route path="/attendance" element={<AttendanceManagementPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin / Manager Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/employees" element={<EmployeeDirectoryPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
            <Route path="/employees/new" element={<AddEditEmployeePage />} />
            <Route path="/employees/:id/edit" element={<AddEditEmployeePage />} />
            <Route path="/admin/leaves" element={<LeaveApprovalPage />} />
            <Route path="/departments" element={<DepartmentManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

