package com.ems.controller;

import com.ems.dto.request.EmployeeCreateRequest;
import com.ems.dto.request.EmployeeUpdateRequest;
import com.ems.dto.request.ProfileUpdateRequest;
import com.ems.dto.response.ApiResponse;
import com.ems.dto.response.EmployeeResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.enums.EmploymentStatus;
import com.ems.security.UserPrincipal;
import com.ems.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PagedResponse<EmployeeResponse>>> getAllEmployees(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) EmploymentStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        PagedResponse<EmployeeResponse> employees = employeeService.getAllEmployees(
                departmentId, status, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success("Employees retrieved successfully", employees));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #id == authentication.principal.user.id")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        EmployeeResponse employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success("Employee retrieved successfully", employee));
    }

    @GetMapping("/profile/me")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EmployeeResponse employee = employeeService.getEmployeeByUserId(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", employee));
    }

    @PutMapping("/profile/me")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        EmployeeResponse updated = employeeService.updateProfile(userPrincipal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeCreateRequest request) {
        EmployeeResponse created = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        EmployeeResponse updated = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", updated));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateEmployee(@PathVariable Long id) {
        employeeService.deactivateEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deactivated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully"));
    }
}
