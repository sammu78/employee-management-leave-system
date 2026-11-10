package com.ems.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_balances", uniqueConstraints = {
    @UniqueConstraint(columnNames = "employee_id")
})
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Column(name = "casual_leave", nullable = false)
    private int casualLeave = 12;

    @Column(name = "sick_leave", nullable = false)
    private int sickLeave = 10;

    @Column(name = "earned_leave", nullable = false)
    private int earnedLeave = 15;

    @Column(name = "unpaid_leave_used", nullable = false)
    private int unpaidLeaveUsed = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LeaveBalance() {}

    public LeaveBalance(Employee employee, int casualLeave, int sickLeave, int earnedLeave) {
        this.employee = employee;
        this.casualLeave = casualLeave;
        this.sickLeave = sickLeave;
        this.earnedLeave = earnedLeave;
        this.unpaidLeaveUsed = 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
