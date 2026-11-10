package com.ems.service.impl;

import com.ems.dto.request.LoginRequest;
import com.ems.dto.request.RegisterRequest;
import com.ems.dto.response.AuthResponse;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.LeaveBalance;
import com.ems.entity.User;
import com.ems.entity.enums.EmploymentStatus;
import com.ems.entity.enums.Role;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.UserRepository;
import com.ems.security.JwtTokenProvider;
import com.ems.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           LeaveBalanceRepository leaveBalanceRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        Optional<Employee> employeeOpt = employeeRepository.findByUserId(user.getId());

        Long employeeId = employeeOpt.map(Employee::getId).orElse(null);
        String employeeCode = employeeOpt.map(Employee::getEmployeeId).orElse(null);
        String firstName = employeeOpt.map(Employee::getFirstName).orElse("Admin");
        String lastName = employeeOpt.map(Employee::getLastName).orElse("User");

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                employeeId,
                employeeCode,
                firstName,
                lastName
        );
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with email " + email + " already exists.");
        }

        // Create User
        User user = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_EMPLOYEE
        );
        User savedUser = userRepository.save(user);

        // Department
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElse(null);
        }

        // Generate unique employee ID
        String employeeId = "EMP-" + String.format("%04d", (int) (Math.random() * 9000 + 1000));
        while (employeeRepository.existsByEmployeeId(employeeId)) {
            employeeId = "EMP-" + String.format("%04d", (int) (Math.random() * 9000 + 1000));
        }

        // Create Employee
        Employee employee = new Employee();
        employee.setEmployeeId(employeeId);
        employee.setFirstName(request.getFirstName().trim());
        employee.setLastName(request.getLastName().trim());
        employee.setEmail(email);
        employee.setPhone(request.getPhone());
        employee.setDepartment(department);
        employee.setDesignation(request.getDesignation());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setUser(savedUser);

        Employee savedEmployee = employeeRepository.save(employee);

        // Initialize default Leave Balance
        LeaveBalance leaveBalance = new LeaveBalance(savedEmployee, 12, 10, 15);
        leaveBalanceRepository.save(leaveBalance);

        // Authenticate & generate JWT
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedEmployee.getId(),
                savedEmployee.getEmployeeId(),
                savedEmployee.getFirstName(),
                savedEmployee.getLastName()
        );
    }
}

