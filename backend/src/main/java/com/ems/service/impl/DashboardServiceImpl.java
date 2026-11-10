package com.ems.service.impl;

import com.ems.dto.response.AdminDashboardResponse;
import com.ems.dto.response.AttendanceResponse;
import com.ems.dto.response.EmployeeDashboardResponse;
import com.ems.dto.response.LeaveRequestResponse;
import com.ems.entity.Attendance;
import com.ems.entity.Employee;
import com.ems.entity.LeaveBalance;
import com.ems.entity.LeaveRequest;
import com.ems.entity.User;
import com.ems.entity.enums.AttendanceStatus;
import com.ems.entity.enums.EmploymentStatus;
import com.ems.entity.enums.LeaveStatus;
import com.ems.exception.ResourceNotFoundException;
import com.ems.mapper.EntityMapper;
import com.ems.repository.*;
import com.ems.service.DashboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final AttendanceRepository attendanceRepository;
    private final EntityMapper mapper;

    public DashboardServiceImpl(EmployeeRepository employeeRepository,
                                DepartmentRepository departmentRepository,
                                LeaveRequestRepository leaveRequestRepository,
                                LeaveBalanceRepository leaveBalanceRepository,
                                AttendanceRepository attendanceRepository,
                                EntityMapper mapper) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.attendanceRepository = attendanceRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboardStats() {
        LocalDate today = LocalDate.now();

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByEmploymentStatus(EmploymentStatus.ACTIVE);
        long totalDepartments = departmentRepository.count();
        long pendingLeaves = leaveRequestRepository.countByStatus(LeaveStatus.PENDING);

        long todayPresent = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        long todayLate = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.LATE);
        long totalCheckedIn = attendanceRepository.countByDate(today);
        long todayAbsent = Math.max(0, activeEmployees - totalCheckedIn);

        List<LeaveRequestResponse> recentLeaves = leaveRequestRepository
                .findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .getContent().stream()
                .map(mapper::toLeaveRequestResponse)
                .collect(Collectors.toList());

        List<AttendanceResponse> recentAttendance = attendanceRepository
                .findAll(PageRequest.of(0, 5, Sort.by("date").descending().and(Sort.by("id").descending())))
                .getContent().stream()
                .map(mapper::toAttendanceResponse)
                .collect(Collectors.toList());

        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalEmployees(totalEmployees);
        response.setActiveEmployees(activeEmployees);
        response.setTotalDepartments(totalDepartments);
        response.setPendingLeavesCount(pendingLeaves);
        response.setTodayPresentCount(todayPresent);
        response.setTodayLateCount(todayLate);
        response.setTodayAbsentCount(todayAbsent);
        response.setRecentLeaveRequests(recentLeaves);
        response.setRecentAttendance(recentAttendance);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDashboardResponse getEmployeeDashboardStats(User currentUser) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employee.getId())
                .orElseGet(() -> leaveBalanceRepository.save(new LeaveBalance(employee, 12, 10, 15)));

        Optional<Attendance> todayAtt = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), LocalDate.now());

        List<LeaveRequestResponse> recentLeaves = leaveRequestRepository
                .findByEmployeeId(employee.getId(), PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .getContent().stream()
                .map(mapper::toLeaveRequestResponse)
                .collect(Collectors.toList());

        List<AttendanceResponse> recentAttendance = attendanceRepository
                .findByEmployeeIdOrderByDateDesc(employee.getId(), PageRequest.of(0, 5))
                .getContent().stream()
                .map(mapper::toAttendanceResponse)
                .collect(Collectors.toList());

        long totalLeaves = leaveRequestRepository.findByEmployeeId(employee.getId(), PageRequest.of(0, 1)).getTotalElements();
        long pendingLeaves = leaveRequestRepository.countByEmployeeIdAndStatus(employee.getId(), LeaveStatus.PENDING);
        long approvedLeaves = leaveRequestRepository.countByEmployeeIdAndStatus(employee.getId(), LeaveStatus.APPROVED);

        EmployeeDashboardResponse response = new EmployeeDashboardResponse();
        response.setEmployee(mapper.toEmployeeResponse(employee));
        response.setLeaveBalance(mapper.toLeaveBalanceResponse(balance));
        response.setTodayAttendance(todayAtt.map(mapper::toAttendanceResponse).orElse(null));
        response.setRecentLeaves(recentLeaves);
        response.setRecentAttendance(recentAttendance);
        response.setTotalLeavesApplied(totalLeaves);
        response.setPendingLeavesCount(pendingLeaves);
        response.setApprovedLeavesCount(approvedLeaves);

        return response;
    }
}

