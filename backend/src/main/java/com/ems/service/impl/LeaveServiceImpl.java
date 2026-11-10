package com.ems.service.impl;

import com.ems.dto.request.LeaveApplyRequest;
import com.ems.dto.request.LeaveRejectRequest;
import com.ems.dto.response.LeaveBalanceResponse;
import com.ems.dto.response.LeaveRequestResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.Employee;
import com.ems.entity.LeaveBalance;
import com.ems.entity.LeaveRequest;
import com.ems.entity.User;
import com.ems.entity.enums.LeaveStatus;
import com.ems.entity.enums.LeaveType;
import com.ems.entity.enums.Role;
import com.ems.exception.*;
import com.ems.mapper.EntityMapper;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.LeaveRequestRepository;
import com.ems.service.LeaveService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final EntityMapper mapper;

    @Value("${app.leave.exclude-weekends:true}")
    private boolean excludeWeekends;

    public LeaveServiceImpl(LeaveRequestRepository leaveRequestRepository,
                            LeaveBalanceRepository leaveBalanceRepository,
                            EmployeeRepository employeeRepository,
                            EntityMapper mapper) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public LeaveRequestResponse applyLeave(User currentUser, LeaveApplyRequest request) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        // 1. Validate date range
        if (startDate == null || endDate == null) {
            throw new BadRequestException("Start date and end date are required.");
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date cannot be after end date.");
        }

        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Leave start date cannot be in the past.");
        }

        // 2. Calculate total leave days
        int totalDays = calculateWorkingDays(startDate, endDate);
        if (totalDays <= 0) {
            throw new BadRequestException("Selected date range contains 0 working days (weekends only).");
        }

        // 3. Check for overlapping pending or approved requests
        List<LeaveRequest> overlapping = leaveRequestRepository.findOverlappingRequests(
                employee.getId(),
                startDate,
                endDate,
                List.of(LeaveStatus.PENDING, LeaveStatus.APPROVED)
        );

        if (!overlapping.isEmpty()) {
            throw new OverlappingLeaveException(
                    "You already have a pending or approved leave request that overlaps with " + startDate + " to " + endDate
            );
        }

        // 4. Validate leave balance
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employee.getId())
                .orElseGet(() -> leaveBalanceRepository.save(new LeaveBalance(employee, 12, 10, 15)));

        validateLeaveBalance(balance, request.getLeaveType(), totalDays);

        // 5. Create leave request
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setStartDate(startDate);
        leaveRequest.setEndDate(endDate);
        leaveRequest.setTotalDays(totalDays);
        leaveRequest.setReason(request.getReason().trim());
        leaveRequest.setStatus(LeaveStatus.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapper.toLeaveRequestResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaveRequestResponse> getMyLeaves(User currentUser, LeaveStatus status, int page, int size) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LeaveRequest> requestPage;

        if (status != null) {
            requestPage = leaveRequestRepository.findByEmployeeIdAndStatus(employee.getId(), status, pageable);
        } else {
            requestPage = leaveRequestRepository.findByEmployeeId(employee.getId(), pageable);
        }

        List<LeaveRequestResponse> content = requestPage.getContent().stream()
                .map(mapper::toLeaveRequestResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                requestPage.getNumber(),
                requestPage.getSize(),
                requestPage.getTotalElements(),
                requestPage.getTotalPages(),
                requestPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaveRequestResponse> getAllLeaves(LeaveStatus status, Long deptId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LeaveRequest> requestPage = leaveRequestRepository.findAllFiltered(status, deptId, pageable);

        List<LeaveRequestResponse> content = requestPage.getContent().stream()
                .map(mapper::toLeaveRequestResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                requestPage.getNumber(),
                requestPage.getSize(),
                requestPage.getTotalElements(),
                requestPage.getTotalPages(),
                requestPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveRequestResponse getLeaveById(Long id, User currentUser) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        // Check permission if regular employee
        if (currentUser.getRole() == Role.ROLE_EMPLOYEE) {
            if (leaveRequest.getEmployee().getUser() == null ||
                !leaveRequest.getEmployee().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to view this leave request.");
            }
        }

        return mapper.toLeaveRequestResponse(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveRequestResponse approveLeave(Long id, User currentUser) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Cannot approve request. Current status is " + leaveRequest.getStatus());
        }

        // Rule: Do not allow an employee to approve their own leave
        if (leaveRequest.getEmployee().getUser() != null &&
            leaveRequest.getEmployee().getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Employees are strictly not permitted to approve their own leave requests.");
        }

        // Deduct balance
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(leaveRequest.getEmployee().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found for employee"));

        deductLeaveBalance(balance, leaveRequest.getLeaveType(), leaveRequest.getTotalDays());
        leaveBalanceRepository.save(balance);

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setApprovedBy(currentUser);
        leaveRequest.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapper.toLeaveRequestResponse(updated);
    }

    @Override
    @Transactional
    public LeaveRequestResponse rejectLeave(Long id, LeaveRejectRequest rejectRequest, User currentUser) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Cannot reject request. Current status is " + leaveRequest.getStatus());
        }

        // Rule: Do not allow an employee to reject their own leave
        if (leaveRequest.getEmployee().getUser() != null &&
            leaveRequest.getEmployee().getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Employees cannot review their own leave requests.");
        }

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setRejectionReason(rejectRequest.getRejectionReason());
        leaveRequest.setApprovedBy(currentUser);
        leaveRequest.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapper.toLeaveRequestResponse(updated);
    }

    @Override
    @Transactional
    public LeaveRequestResponse cancelLeave(Long id, User currentUser) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        // Only the employee who created it or Admin can cancel
        boolean isOwner = leaveRequest.getEmployee().getUser() != null &&
                          leaveRequest.getEmployee().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to cancel this leave request.");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING leave requests can be cancelled. Status is " + leaveRequest.getStatus());
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        leaveRequest.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapper.toLeaveRequestResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveBalanceResponse getMyLeaveBalance(User currentUser) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employee.getId())
                .orElseGet(() -> leaveBalanceRepository.save(new LeaveBalance(employee, 12, 10, 15)));

        return mapper.toLeaveBalanceResponse(balance);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveBalanceResponse getEmployeeLeaveBalance(Long employeeId) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found for employee id: " + employeeId));
        return mapper.toLeaveBalanceResponse(balance);
    }

    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        int days = 0;
        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            if (excludeWeekends) {
                DayOfWeek dow = curr.getDayOfWeek();
                if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                    days++;
                }
            } else {
                days++;
            }
            curr = curr.plusDays(1);
        }
        return days;
    }

    private void validateLeaveBalance(LeaveBalance balance, LeaveType type, int requestedDays) {
        switch (type) {
            case CASUAL_LEAVE:
                if (balance.getCasualLeave() < requestedDays) {
                    throw new InsufficientLeaveBalanceException(
                            "Insufficient Casual Leave balance. Requested: " + requestedDays + ", Available: " + balance.getCasualLeave()
                    );
                }
                break;
            case SICK_LEAVE:
                if (balance.getSickLeave() < requestedDays) {
                    throw new InsufficientLeaveBalanceException(
                            "Insufficient Sick Leave balance. Requested: " + requestedDays + ", Available: " + balance.getSickLeave()
                    );
                }
                break;
            case EARNED_LEAVE:
                if (balance.getEarnedLeave() < requestedDays) {
                    throw new InsufficientLeaveBalanceException(
                            "Insufficient Earned Leave balance. Requested: " + requestedDays + ", Available: " + balance.getEarnedLeave()
                    );
                }
                break;
            case UNPAID_LEAVE:
                // Unpaid leave has no upper limit, tracked upon approval
                break;
        }
    }

    private void deductLeaveBalance(LeaveBalance balance, LeaveType type, int days) {
        switch (type) {
            case CASUAL_LEAVE:
                if (balance.getCasualLeave() < days) {
                    throw new InsufficientLeaveBalanceException("Casual leave balance insufficient during approval");
                }
                balance.setCasualLeave(balance.getCasualLeave() - days);
                break;
            case SICK_LEAVE:
                if (balance.getSickLeave() < days) {
                    throw new InsufficientLeaveBalanceException("Sick leave balance insufficient during approval");
                }
                balance.setSickLeave(balance.getSickLeave() - days);
                break;
            case EARNED_LEAVE:
                if (balance.getEarnedLeave() < days) {
                    throw new InsufficientLeaveBalanceException("Earned leave balance insufficient during approval");
                }
                balance.setEarnedLeave(balance.getEarnedLeave() - days);
                break;
            case UNPAID_LEAVE:
                balance.setUnpaidLeaveUsed(balance.getUnpaidLeaveUsed() + days);
                break;
        }
    }
}
