package com.ems.service;

import com.ems.dto.request.CheckInRequest;
import com.ems.dto.request.CheckOutRequest;
import com.ems.dto.response.AttendanceResponse;
import com.ems.entity.Attendance;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.entity.enums.AttendanceStatus;
import com.ems.entity.enums.Role;
import com.ems.exception.BadRequestException;
import com.ems.mapper.EntityMapper;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Spy
    private EntityMapper mapper = new EntityMapper();

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private User user;
    private Employee employee;

    @BeforeEach
    void setUp() {
        user = new User("emp@ems.com", "pass", Role.ROLE_EMPLOYEE);
        user.setId(5L);

        employee = new Employee();
        employee.setId(15L);
        employee.setEmployeeId("EMP-1005");
        employee.setFirstName("Clara");
        employee.setLastName("Oswald");
        employee.setUser(user);
    }

    @Test
    @DisplayName("Should successfully check-in employee for current workday")
    void testCheckInSuccess() {
        when(employeeRepository.findByUserId(5L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.existsByEmployeeIdAndDate(eq(15L), any(LocalDate.class))).thenReturn(false);

        Attendance savedAttendance = new Attendance(employee, LocalDate.now(), LocalTime.of(9, 15), AttendanceStatus.PRESENT);
        savedAttendance.setId(50L);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(savedAttendance);

        AttendanceResponse response = attendanceService.checkIn(user, new CheckInRequest("Remote login"));

        assertNotNull(response);
        assertEquals(LocalDate.now(), response.getDate());
        assertNotNull(response.getCheckInTime());
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException on duplicate check-in on the same day")
    void testDuplicateCheckInFails() {
        when(employeeRepository.findByUserId(5L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.existsByEmployeeIdAndDate(eq(15L), any(LocalDate.class))).thenReturn(true);

        assertThrows(BadRequestException.class, () -> attendanceService.checkIn(user, new CheckInRequest()));
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should successfully check-out and compute work hours")
    void testCheckOutSuccess() {
        when(employeeRepository.findByUserId(5L)).thenReturn(Optional.of(employee));

        Attendance existingAttendance = new Attendance(employee, LocalDate.now(), LocalTime.now().minusHours(8), AttendanceStatus.PRESENT);
        existingAttendance.setId(50L);

        when(attendanceRepository.findByEmployeeIdAndDate(eq(15L), any(LocalDate.class)))
                .thenReturn(Optional.of(existingAttendance));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(i -> i.getArgument(0));

        AttendanceResponse response = attendanceService.checkOut(user, new CheckOutRequest("Leaving for the day"));

        assertNotNull(response);
        assertNotNull(response.getCheckOutTime());
        assertNotNull(response.getWorkHours());
        assertTrue(response.getWorkHours() >= 7.0);
    }
}
