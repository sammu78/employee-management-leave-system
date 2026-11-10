package com.ems.service.impl;

import com.ems.dto.request.CheckInRequest;
import com.ems.dto.request.CheckOutRequest;
import com.ems.dto.response.AttendanceResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.Attendance;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.entity.enums.AttendanceStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.mapper.EntityMapper;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.AttendanceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final EntityMapper mapper;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
                                 EmployeeRepository employeeRepository,
                                 EntityMapper mapper) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public AttendanceResponse checkIn(User currentUser, CheckInRequest request) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        LocalDate today = LocalDate.now();

        // Validate that an employee cannot create multiple active check-in sessions for the same workday
        if (attendanceRepository.existsByEmployeeIdAndDate(employee.getId(), today)) {
            throw new BadRequestException("You have already checked in for today (" + today + "). Multiple check-ins are not permitted.");
        }

        LocalTime now = LocalTime.now();
        // Determine status based on standard work start time (e.g., 9:30 AM)
        AttendanceStatus status = now.isAfter(LocalTime.of(9, 30)) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setCheckInTime(now);
        attendance.setStatus(status);
        if (request != null && request.getNotes() != null) {
            attendance.setNotes(request.getNotes());
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapper.toAttendanceResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceResponse checkOut(User currentUser, CheckOutRequest request) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new BadRequestException("No active check-in record found for today. Please check in first before checking out."));

        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("You have already checked out today at " + attendance.getCheckOutTime().toString().substring(0, 5));
        }

        LocalTime now = LocalTime.now();
        attendance.setCheckOutTime(now);

        Duration duration = Duration.between(attendance.getCheckInTime(), now);
        double hours = Math.round((duration.toMinutes() / 60.0) * 100.0) / 100.0;
        attendance.setWorkHours(hours);

        // If total work hours is less than 4 hours, mark as HALF_DAY
        if (hours < 4.0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        if (request != null && request.getNotes() != null) {
            String existingNotes = attendance.getNotes() != null ? attendance.getNotes() + " | " : "";
            attendance.setNotes(existingNotes + request.getNotes());
        }

        Attendance updated = attendanceRepository.save(attendance);
        return mapper.toAttendanceResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getTodayAttendance(User currentUser) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        Optional<Attendance> attendanceOpt = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), LocalDate.now());
        return attendanceOpt.map(mapper::toAttendanceResponse).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AttendanceResponse> getMyAttendance(User currentUser, int page, int size) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        Page<Attendance> attendancePage = attendanceRepository.findByEmployeeId(employee.getId(), pageable);

        List<AttendanceResponse> content = attendancePage.getContent().stream()
                .map(mapper::toAttendanceResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                attendancePage.getNumber(),
                attendancePage.getSize(),
                attendancePage.getTotalElements(),
                attendancePage.getTotalPages(),
                attendancePage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AttendanceResponse> getAllAttendance(LocalDate date, AttendanceStatus status, Long deptId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending().and(Sort.by("id").descending()));
        Page<Attendance> attendancePage = attendanceRepository.findAllFiltered(date, status, deptId, pageable);

        List<AttendanceResponse> content = attendancePage.getContent().stream()
                .map(mapper::toAttendanceResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                attendancePage.getNumber(),
                attendancePage.getSize(),
                attendancePage.getTotalElements(),
                attendancePage.getTotalPages(),
                attendancePage.isLast()
        );
    }
}
