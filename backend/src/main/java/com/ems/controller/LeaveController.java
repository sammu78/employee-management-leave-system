package com.ems.controller;

import com.ems.dto.request.LeaveApplyRequest;
import com.ems.dto.request.LeaveRejectRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.LeaveBalanceResponse;
import com.ems.dto.response.LeaveRequestResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.enums.LeaveStatus;
import com.ems.security.UserPrincipal;
import com.ems.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> applyLeave(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody LeaveApplyRequest request) {
        LeaveRequestResponse response = leaveService.applyLeave(userPrincipal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave applied successfully", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PagedResponse<LeaveRequestResponse>>> getMyLeaves(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<LeaveRequestResponse> myLeaves = leaveService.getMyLeaves(userPrincipal.getUser(), status, page, size);
        return ResponseEntity.ok(ApiResponse.success("My leaves retrieved successfully", myLeaves));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PagedResponse<LeaveRequestResponse>>> getAllLeaves(
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<LeaveRequestResponse> allLeaves = leaveService.getAllLeaves(status, departmentId, page, size);
        return ResponseEntity.ok(ApiResponse.success("All leave requests retrieved successfully", allLeaves));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> getLeaveById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LeaveRequestResponse leave = leaveService.getLeaveById(id, userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Leave request retrieved successfully", leave));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> approveLeave(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LeaveRequestResponse response = leaveService.approveLeave(id, userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Leave request approved successfully", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> rejectLeave(
            @PathVariable Long id,
            @Valid @RequestBody LeaveRejectRequest rejectRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LeaveRequestResponse response = leaveService.rejectLeave(id, rejectRequest, userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected successfully", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancelLeave(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LeaveRequestResponse response = leaveService.cancelLeave(id, userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled successfully", response));
    }

    @GetMapping("/balance/my")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> getMyLeaveBalance(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LeaveBalanceResponse balance = leaveService.getMyLeaveBalance(userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Leave balance retrieved successfully", balance));
    }

    @GetMapping("/balance/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> getEmployeeLeaveBalance(
            @PathVariable Long employeeId) {
        LeaveBalanceResponse balance = leaveService.getEmployeeLeaveBalance(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Employee leave balance retrieved successfully", balance));
    }
}
