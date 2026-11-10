package com.ems.dto.response;

public class LeaveBalanceResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private int casualLeave;
    private int sickLeave;
    private int earnedLeave;
    private int unpaidLeaveUsed;

    public LeaveBalanceResponse() {}

    public LeaveBalanceResponse(Long id, Long employeeId, String employeeName, int casualLeave, int sickLeave, int earnedLeave, int unpaidLeaveUsed) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.casualLeave = casualLeave;
        this.sickLeave = sickLeave;
        this.earnedLeave = earnedLeave;
        this.unpaidLeaveUsed = unpaidLeaveUsed;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public int getCasualLeave() {
        return casualLeave;
    }

    public void setCasualLeave(int casualLeave) {
        this.casualLeave = casualLeave;
    }

    public int getSickLeave() {
        return sickLeave;
    }

    public void setSickLeave(int sickLeave) {
        this.sickLeave = sickLeave;
    }

    public int getEarnedLeave() {
        return earnedLeave;
    }

    public void setEarnedLeave(int earnedLeave) {
        this.earnedLeave = earnedLeave;
    }

    public int getUnpaidLeaveUsed() {
        return unpaidLeaveUsed;
    }

    public void setUnpaidLeaveUsed(int unpaidLeaveUsed) {
        this.unpaidLeaveUsed = unpaidLeaveUsed;
    }
}
