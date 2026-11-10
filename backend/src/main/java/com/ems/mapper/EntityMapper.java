package com.ems.mapper;

import com.ems.dto.response.*;
import com.ems.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public EmployeeResponse toEmployeeResponse(Employee employee) {
        if (employee == null) {
            return null;
        }
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setEmployeeId(employee.getEmployeeId());
        response.setFirstName(employee.getFirstName());
        response.setLastName(employee.getLastName());
        response.setFullName(employee.getFullName());
        response.setEmail(employee.getEmail());
        response.setPhone(employee.getPhone());
        if (employee.getDepartment() != null) {
            response.setDepartmentId(employee.getDepartment().getId());
            response.setDepartmentName(employee.getDepartment().getName());
        }
        response.setDesignation(employee.getDesignation());
        response.setJoiningDate(employee.getJoiningDate());
        response.setEmploymentStatus(employee.getEmploymentStatus());
        if (employee.getUser() != null) {
            response.setRole(employee.getUser().getRole());
        }
        response.setCreatedAt(employee.getCreatedAt());
        return response;
    }

    public DepartmentResponse toDepartmentResponse(Department department, long count) {
        if (department == null) {
            return null;
        }
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getDescription(),
                count,
                department.getCreatedAt()
        );
    }

    public LeaveBalanceResponse toLeaveBalanceResponse(LeaveBalance balance) {
        if (balance == null) {
            return null;
        }
        String empName = balance.getEmployee() != null ? balance.getEmployee().getFullName() : "";
        Long empId = balance.getEmployee() != null ? balance.getEmployee().getId() : null;
        return new LeaveBalanceResponse(
                balance.getId(),
                empId,
                empName,
                balance.getCasualLeave(),
                balance.getSickLeave(),
                balance.getEarnedLeave(),
                balance.getUnpaidLeaveUsed()
        );
    }

    public LeaveRequestResponse toLeaveRequestResponse(LeaveRequest request) {
        if (request == null) {
            return null;
        }
        LeaveRequestResponse response = new LeaveRequestResponse();
        response.setId(request.getId());
        if (request.getEmployee() != null) {
            response.setEmployeeId(request.getEmployee().getId());
            response.setEmployeeCode(request.getEmployee().getEmployeeId());
            response.setEmployeeName(request.getEmployee().getFullName());
            if (request.getEmployee().getDepartment() != null) {
                response.setDepartmentName(request.getEmployee().getDepartment().getName());
            }
        }
        response.setLeaveType(request.getLeaveType());
        response.setStartDate(request.getStartDate());
        response.setEndDate(request.getEndDate());
        response.setTotalDays(request.getTotalDays());
        response.setReason(request.getReason());
        response.setStatus(request.getStatus());
        response.setRejectionReason(request.getRejectionReason());
        if (request.getApprovedBy() != null) {
            response.setApprovedByName(request.getApprovedBy().getEmail());
        }
        response.setReviewedAt(request.getReviewedAt());
        response.setCreatedAt(request.getCreatedAt());
        return response;
    }

    public AttendanceResponse toAttendanceResponse(Attendance attendance) {
        if (attendance == null) {
            return null;
        }
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        if (attendance.getEmployee() != null) {
            response.setEmployeeId(attendance.getEmployee().getId());
            response.setEmployeeCode(attendance.getEmployee().getEmployeeId());
            response.setEmployeeName(attendance.getEmployee().getFullName());
            if (attendance.getEmployee().getDepartment() != null) {
                response.setDepartmentName(attendance.getEmployee().getDepartment().getName());
            }
        }
        response.setDate(attendance.getDate());
        response.setCheckInTime(attendance.getCheckInTime());
        response.setCheckOutTime(attendance.getCheckOutTime());
        response.setWorkHours(attendance.getWorkHours());
        response.setStatus(attendance.getStatus());
        response.setNotes(attendance.getNotes());
        return response;
    }
}
