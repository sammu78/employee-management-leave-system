package com.ems.controller;

import com.ems.dto.request.CheckInRequest;
import com.ems.dto.request.CheckOutRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.AttendanceResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.enums.AttendanceStatus;
import com.ems.security.UserPrincipal;
import com.ems.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) CheckInRequest request) {
        AttendanceResponse response = attendanceService.checkIn(userPrincipal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Checked in successfully", response));
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) CheckOutRequest request) {
        AttendanceResponse response = attendanceService.checkOut(userPrincipal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Checked out successfully", response));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getTodayAttendance(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AttendanceResponse response = attendanceService.getTodayAttendance(userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Today's attendance status retrieved", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getMyAttendance(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<AttendanceResponse> response = attendanceService.getMyAttendance(userPrincipal.getUser(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Attendance history retrieved successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getAllAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AttendanceStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<AttendanceResponse> response = attendanceService.getAllAttendance(date, status, departmentId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved successfully", response));
    }
}

