package com.ems.dto.response;

import java.util.List;

public class EmployeeDashboardResponse {
    private EmployeeResponse employee;
    private LeaveBalanceResponse leaveBalance;
    private AttendanceResponse todayAttendance;
    private List<LeaveRequestResponse> recentLeaves;
    private List<AttendanceResponse> recentAttendance;
    private long totalLeavesApplied;
    private long pendingLeavesCount;
    private long approvedLeavesCount;

    public EmployeeDashboardResponse() {}

    public EmployeeResponse getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeResponse employee) {
        this.employee = employee;
    }

    public LeaveBalanceResponse getLeaveBalance() {
        return leaveBalance;
    }

    public void setLeaveBalance(LeaveBalanceResponse leaveBalance) {
        this.leaveBalance = leaveBalance;
    }

    public AttendanceResponse getTodayAttendance() {
        return todayAttendance;
    }

    public void setTodayAttendance(AttendanceResponse todayAttendance) {
        this.todayAttendance = todayAttendance;
    }

    public List<LeaveRequestResponse> getRecentLeaves() {
        return recentLeaves;
    }

    public void setRecentLeaves(List<LeaveRequestResponse> recentLeaves) {
        this.recentLeaves = recentLeaves;
    }

    public List<AttendanceResponse> getRecentAttendance() {
        return recentAttendance;
    }

    public void setRecentAttendance(List<AttendanceResponse> recentAttendance) {
        this.recentAttendance = recentAttendance;
    }

    public long getTotalLeavesApplied() {
        return totalLeavesApplied;
    }

    public void setTotalLeavesApplied(long totalLeavesApplied) {
        this.totalLeavesApplied = totalLeavesApplied;
    }

    public long getPendingLeavesCount() {
        return pendingLeavesCount;
    }

    public void setPendingLeavesCount(long pendingLeavesCount) {
        this.pendingLeavesCount = pendingLeavesCount;
    }

    public long getApprovedLeavesCount() {
        return approvedLeavesCount;
    }

    public void setApprovedLeavesCount(long approvedLeavesCount) {
        this.approvedLeavesCount = approvedLeavesCount;
    }
}
