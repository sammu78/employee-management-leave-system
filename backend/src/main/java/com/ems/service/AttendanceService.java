package com.ems.service;

import com.ems.dto.request.CheckInRequest;
import com.ems.dto.request.CheckOutRequest;
import com.ems.dto.response.AttendanceResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.User;
import com.ems.entity.enums.AttendanceStatus;

import java.time.LocalDate;

public interface AttendanceService {
    AttendanceResponse checkIn(User currentUser, CheckInRequest request);
    AttendanceResponse checkOut(User currentUser, CheckOutRequest request);
    AttendanceResponse getTodayAttendance(User currentUser);
    PagedResponse<AttendanceResponse> getMyAttendance(User currentUser, int page, int size);
    PagedResponse<AttendanceResponse> getAllAttendance(LocalDate date, AttendanceStatus status, Long deptId, int page, int size);
}
