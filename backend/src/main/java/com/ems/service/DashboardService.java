package com.ems.service;

import com.ems.dto.response.AdminDashboardResponse;
import com.ems.dto.response.EmployeeDashboardResponse;
import com.ems.entity.User;

public interface DashboardService {
    AdminDashboardResponse getAdminDashboardStats();
    EmployeeDashboardResponse getEmployeeDashboardStats(User currentUser);
}
