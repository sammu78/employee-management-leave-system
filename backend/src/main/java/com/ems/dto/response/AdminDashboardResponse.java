package com.ems.dto.response;

import java.util.List;

public class AdminDashboardResponse {
    private long totalEmployees;
    private long activeEmployees;
    private long totalDepartments;
    private long pendingLeavesCount;
    private long todayPresentCount;
    private long todayLateCount;
    private long todayAbsentCount;
    private List<LeaveRequestResponse> recentLeaveRequests;
    private List<AttendanceResponse> recentAttendance;

    public AdminDashboardResponse() {}

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getActiveEmployees() {
        return activeEmployees;
    }

    public void setActiveEmployees(long activeEmployees) {
        this.activeEmployees = activeEmployees;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getPendingLeavesCount() {
        return pendingLeavesCount;
    }

    public void setPendingLeavesCount(long pendingLeavesCount) {
        this.pendingLeavesCount = pendingLeavesCount;
    }

    public long getTodayPresentCount() {
        return todayPresentCount;
    }

    public void setTodayPresentCount(long todayPresentCount) {
        this.todayPresentCount = todayPresentCount;
    }

    public long getTodayLateCount() {
        return todayLateCount;
    }

    public void setTodayLateCount(long todayLateCount) {
        this.todayLateCount = todayLateCount;
    }

    public long getTodayAbsentCount() {
        return todayAbsentCount;
    }

    public void setTodayAbsentCount(long todayAbsentCount) {
        this.todayAbsentCount = todayAbsentCount;
    }

    public List<LeaveRequestResponse> getRecentLeaveRequests() {
        return recentLeaveRequests;
    }

    public void setRecentLeaveRequests(List<LeaveRequestResponse> recentLeaveRequests) {
        this.recentLeaveRequests = recentLeaveRequests;
    }

    public List<AttendanceResponse> getRecentAttendance() {
        return recentAttendance;
    }

    public void setRecentAttendance(List<AttendanceResponse> recentAttendance) {
        this.recentAttendance = recentAttendance;
    }
}
