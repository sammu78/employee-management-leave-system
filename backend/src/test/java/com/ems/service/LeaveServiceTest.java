package com.ems.service;

import com.ems.dto.request.LeaveApplyRequest;
import com.ems.dto.request.LeaveRejectRequest;
import com.ems.dto.response.LeaveRequestResponse;
import com.ems.entity.Employee;
import com.ems.entity.LeaveBalance;
import com.ems.entity.LeaveRequest;
import com.ems.entity.User;
import com.ems.entity.enums.LeaveStatus;
import com.ems.entity.enums.LeaveType;
import com.ems.entity.enums.Role;
import com.ems.exception.InsufficientLeaveBalanceException;
import com.ems.exception.OverlappingLeaveException;
import com.ems.exception.UnauthorizedException;
import com.ems.mapper.EntityMapper;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.LeaveRequestRepository;
import com.ems.service.impl.LeaveServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Spy
    private EntityMapper mapper = new EntityMapper();

    @InjectMocks
    private LeaveServiceImpl leaveService;

    private User employeeUser;
    private User adminUser;
    private Employee employee;
    private LeaveBalance leaveBalance;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(leaveService, "excludeWeekends", true);

        employeeUser = new User("emp@ems.com", "pass", Role.ROLE_EMPLOYEE);
        employeeUser.setId(10L);

        adminUser = new User("admin@ems.com", "pass", Role.ROLE_ADMIN);
        adminUser.setId(99L);

        employee = new Employee();
        employee.setId(1L);
        employee.setEmployeeId("EMP-1001");
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setUser(employeeUser);

        leaveBalance = new LeaveBalance(employee, 12, 10, 15);
        leaveBalance.setId(1L);
    }

    private LocalDate getNextMonday() {
        LocalDate date = LocalDate.now().plusDays(1);
        while (date.getDayOfWeek() != DayOfWeek.MONDAY) {
            date = date.plusDays(1);
        }
        return date;
    }

    @Test
    @DisplayName("Should successfully apply for leave when balance is sufficient and no overlap")
    void testApplyLeaveSuccess() {
        LocalDate start = getNextMonday();
        LocalDate end = start.plusDays(2); // Mon, Tue, Wed = 3 days

        LeaveApplyRequest request = new LeaveApplyRequest(LeaveType.CASUAL_LEAVE, start, end, "Personal vacation");

        when(employeeRepository.findByUserId(10L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findOverlappingRequests(eq(1L), eq(start), eq(end), any()))
                .thenReturn(Collections.emptyList());
        when(leaveBalanceRepository.findByEmployeeId(1L)).thenReturn(Optional.of(leaveBalance));

        LeaveRequest savedRequest = new LeaveRequest();
        savedRequest.setId(100L);
        savedRequest.setEmployee(employee);
        savedRequest.setLeaveType(LeaveType.CASUAL_LEAVE);
        savedRequest.setStartDate(start);
        savedRequest.setEndDate(end);
        savedRequest.setTotalDays(3);
        savedRequest.setReason("Personal vacation");
        savedRequest.setStatus(LeaveStatus.PENDING);

        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(savedRequest);

        LeaveRequestResponse response = leaveService.applyLeave(employeeUser, request);

        assertNotNull(response);
        assertEquals(LeaveStatus.PENDING, response.getStatus());
        assertEquals(3, response.getTotalDays());
        assertEquals(LeaveType.CASUAL_LEAVE, response.getLeaveType());
    }

    @Test
    @DisplayName("Should throw InsufficientLeaveBalanceException when balance is too low")
    void testApplyLeaveInsufficientBalance() {
        LocalDate start = getNextMonday();
        LocalDate end = start.plusDays(4); // 5 working days

        leaveBalance.setCasualLeave(2); // Only 2 days available, requesting 5

        LeaveApplyRequest request = new LeaveApplyRequest(LeaveType.CASUAL_LEAVE, start, end, "Long break");

        when(employeeRepository.findByUserId(10L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findOverlappingRequests(eq(1L), eq(start), eq(end), any()))
                .thenReturn(Collections.emptyList());
        when(leaveBalanceRepository.findByEmployeeId(1L)).thenReturn(Optional.of(leaveBalance));

        assertThrows(InsufficientLeaveBalanceException.class, () -> leaveService.applyLeave(employeeUser, request));
        verify(leaveRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw OverlappingLeaveException when dates conflict with existing active request")
    void testApplyLeaveOverlapping() {
        LocalDate start = getNextMonday();
        LocalDate end = start.plusDays(2);

        LeaveApplyRequest request = new LeaveApplyRequest(LeaveType.CASUAL_LEAVE, start, end, "Personal");

        when(employeeRepository.findByUserId(10L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findOverlappingRequests(eq(1L), eq(start), eq(end), any()))
                .thenReturn(List.of(new LeaveRequest()));

        assertThrows(OverlappingLeaveException.class, () -> leaveService.applyLeave(employeeUser, request));
        verify(leaveRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should approve leave request and deduct the corresponding leave balance")
    void testApproveLeaveDeductsBalance() {
        LeaveRequest pendingRequest = new LeaveRequest();
        pendingRequest.setId(100L);
        pendingRequest.setEmployee(employee);
        pendingRequest.setLeaveType(LeaveType.CASUAL_LEAVE);
        pendingRequest.setTotalDays(3);
        pendingRequest.setStatus(LeaveStatus.PENDING);

        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));
        when(leaveBalanceRepository.findByEmployeeId(1L)).thenReturn(Optional.of(leaveBalance));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(i -> i.getArgument(0));

        int initialBalance = leaveBalance.getCasualLeave();

        LeaveRequestResponse response = leaveService.approveLeave(100L, adminUser);

        assertNotNull(response);
        assertEquals(LeaveStatus.APPROVED, response.getStatus());
        assertEquals(initialBalance - 3, leaveBalance.getCasualLeave());
        verify(leaveBalanceRepository, times(1)).save(leaveBalance);
    }

    @Test
    @DisplayName("Should strictly prevent an employee from approving their own leave")
    void testEmployeeCannotApproveOwnLeave() {
        LeaveRequest pendingRequest = new LeaveRequest();
        pendingRequest.setId(100L);
        pendingRequest.setEmployee(employee); // employee.user has ID 10L
        pendingRequest.setStatus(LeaveStatus.PENDING);

        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

        // Approver is employeeUser (ID 10L)
        assertThrows(UnauthorizedException.class, () -> leaveService.approveLeave(100L, employeeUser));
        verify(leaveBalanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject leave without deducting leave balance")
    void testRejectLeaveDoesNotDeductBalance() {
        LeaveRequest pendingRequest = new LeaveRequest();
        pendingRequest.setId(100L);
        pendingRequest.setEmployee(employee);
        pendingRequest.setLeaveType(LeaveType.CASUAL_LEAVE);
        pendingRequest.setTotalDays(3);
        pendingRequest.setStatus(LeaveStatus.PENDING);

        when(leaveRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(i -> i.getArgument(0));

        int initialBalance = leaveBalance.getCasualLeave();

        LeaveRejectRequest rejectRequest = new LeaveRejectRequest("High workload during sprint");
        LeaveRequestResponse response = leaveService.rejectLeave(100L, rejectRequest, adminUser);

        assertNotNull(response);
        assertEquals(LeaveStatus.REJECTED, response.getStatus());
        assertEquals("High workload during sprint", response.getRejectionReason());
        assertEquals(initialBalance, leaveBalance.getCasualLeave()); // Unchanged
        verify(leaveBalanceRepository, never()).save(any());
    }
}
