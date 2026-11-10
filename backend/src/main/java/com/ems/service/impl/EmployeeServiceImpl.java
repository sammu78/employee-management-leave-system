package com.ems.service.impl;

import com.ems.dto.request.EmployeeCreateRequest;
import com.ems.dto.request.EmployeeUpdateRequest;
import com.ems.dto.request.ProfileUpdateRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.LeaveBalance;
import com.ems.entity.User;
import com.ems.entity.enums.EmploymentStatus;
import com.ems.entity.enums.Role;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.exception.UnauthorizedException;
import com.ems.mapper.EntityMapper;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.UserRepository;
import com.ems.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper mapper;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               UserRepository userRepository,
                               DepartmentRepository departmentRepository,
                               LeaveBalanceRepository leaveBalanceRepository,
                               PasswordEncoder passwordEncoder,
                               EntityMapper mapper) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getAllEmployees(
            Long deptId, EmploymentStatus status, String search,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        String searchParam = StringUtils.hasText(search) ? search.trim() : null;

        Page<Employee> employeePage = employeeRepository.searchEmployees(deptId, status, searchParam, pageable);

        List<EmployeeResponse> content = employeePage.getContent().stream()
                .map(mapper::toEmployeeResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                employeePage.getNumber(),
                employeePage.getSize(),
                employeePage.getTotalElements(),
                employeePage.getTotalPages(),
                employeePage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapper.toEmployeeResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByUserId(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user id: " + userId));
        return mapper.toEmployeeResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with email " + email + " already exists.");
        }

        // Determine employee ID
        String empId = request.getEmployeeId();
        if (!StringUtils.hasText(empId)) {
            empId = "EMP-" + String.format("%04d", (int) (Math.random() * 9000 + 1000));
        }
        while (employeeRepository.existsByEmployeeId(empId)) {
            empId = "EMP-" + String.format("%04d", (int) (Math.random() * 9000 + 1000));
        }

        // Create User
        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE;
        User user = new User(email, passwordEncoder.encode(request.getPassword()), role);
        User savedUser = userRepository.save(user);

        // Fetch department
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElse(null);
        }

        // Create Employee
        Employee employee = new Employee();
        employee.setEmployeeId(empId);
        employee.setFirstName(request.getFirstName().trim());
        employee.setLastName(request.getLastName().trim());
        employee.setEmail(email);
        employee.setPhone(request.getPhone());
        employee.setDepartment(department);
        employee.setDesignation(request.getDesignation());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setEmploymentStatus(request.getEmploymentStatus() != null ? request.getEmploymentStatus() : EmploymentStatus.ACTIVE);
        employee.setUser(savedUser);

        Employee savedEmployee = employeeRepository.save(employee);

        // Create Leave Balance
        LeaveBalance leaveBalance = new LeaveBalance(savedEmployee, 12, 10, 15);
        leaveBalanceRepository.save(leaveBalance);

        return mapper.toEmployeeResponse(savedEmployee);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setFirstName(request.getFirstName().trim());
        employee.setLastName(request.getLastName().trim());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            employee.setDepartment(department);
        } else {
            employee.setDepartment(null);
        }

        if (request.getEmploymentStatus() != null) {
            employee.setEmploymentStatus(request.getEmploymentStatus());
            if (employee.getUser() != null) {
                employee.getUser().setEnabled(request.getEmploymentStatus() == EmploymentStatus.ACTIVE);
            }
        }

        if (request.getRole() != null && employee.getUser() != null) {
            employee.getUser().setRole(request.getRole());
        }

        Employee updated = employeeRepository.save(employee);
        return mapper.toEmployeeResponse(updated);
    }

    @Override
    @Transactional
    public EmployeeResponse updateProfile(User currentUser, ProfileUpdateRequest request) {
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + currentUser.getEmail()));

        employee.setFirstName(request.getFirstName().trim());
        employee.setLastName(request.getLastName().trim());
        employee.setPhone(request.getPhone());

        Employee updated = employeeRepository.save(employee);
        return mapper.toEmployeeResponse(updated);
    }

    @Override
    @Transactional
    public void deactivateEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setEmploymentStatus(EmploymentStatus.INACTIVE);
        if (employee.getUser() != null) {
            employee.getUser().setEnabled(false);
        }
        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeRepository.delete(employee);
    }
}
