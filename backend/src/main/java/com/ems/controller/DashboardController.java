package com.ems.controller;

import com.ems.dto.response.AdminDashboardResponse;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.EmployeeDashboardResponse;
import com.ems.security.UserPrincipal;
import com.ems.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse response = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard data retrieved", response));
    }

    @GetMapping("/employee")
    public ResponseEntity<ApiResponse<EmployeeDashboardResponse>> getEmployeeDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EmployeeDashboardResponse response = dashboardService.getEmployeeDashboardStats(userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Employee dashboard data retrieved", response));
    }
}
