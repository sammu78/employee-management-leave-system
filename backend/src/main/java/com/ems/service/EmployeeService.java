package com.ems.service;

import com.ems.dto.request.EmployeeCreateRequest;
import com.ems.dto.request.EmployeeUpdateRequest;
import com.ems.dto.request.ProfileUpdateRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.User;
import com.ems.entity.enums.EmploymentStatus;

public interface EmployeeService {
    PagedResponse<EmployeeResponse> getAllEmployees(Long deptId, EmploymentStatus status, String search, int page, int size, String sortBy, String sortDir);
    EmployeeResponse getEmployeeById(Long id);
    EmployeeResponse getEmployeeByUserId(Long userId);
    EmployeeResponse createEmployee(EmployeeCreateRequest request);
    EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request);
    EmployeeResponse updateProfile(User currentUser, ProfileUpdateRequest request);
    void deactivateEmployee(Long id);
    void deleteEmployee(Long id);
}

