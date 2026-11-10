package com.ems.service;

import com.ems.dto.request.LoginRequest;
import com.ems.dto.request.RegisterRequest;
import com.ems.dto.response.AuthResponse;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.entity.enums.EmploymentStatus;
import com.ems.entity.enums.Role;
import com.ems.exception.DuplicateResourceException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.UserRepository;
import com.ems.security.JwtTokenProvider;
import com.ems.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private Employee sampleEmployee;

    @BeforeEach
    void setUp() {
        sampleUser = new User("test@ems.com", "encodedPassword", Role.ROLE_EMPLOYEE);
        sampleUser.setId(1L);

        sampleEmployee = new Employee();
        sampleEmployee.setId(10L);
        sampleEmployee.setEmployeeId("EMP-1001");
        sampleEmployee.setFirstName("Alice");
        sampleEmployee.setLastName("Wonder");
        sampleEmployee.setEmail("test@ems.com");
        sampleEmployee.setUser(sampleUser);
    }

    @Test
    @DisplayName("Should successfully authenticate and return JWT token on login")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("test@ems.com", "password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mock.jwt.token");
        when(userRepository.findByEmail("test@ems.com")).thenReturn(Optional.of(sampleUser));
        when(employeeRepository.findByUserId(1L)).thenReturn(Optional.of(sampleEmployee));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("test@ems.com", response.getEmail());
        assertEquals(Role.ROLE_EMPLOYEE.name(), response.getRole());
        assertEquals("EMP-1001", response.getEmployeeCode());
        assertEquals("Alice", response.getFirstName());
    }

    @Test
    @DisplayName("Should register new employee, create user, employee & leave balance records")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Bob");
        request.setLastName("Builder");
        request.setEmail("bob@ems.com");
        request.setPassword("password123");
        request.setDesignation("Software Engineer");
        request.setJoiningDate(LocalDate.now());

        when(userRepository.existsByEmail("bob@ems.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = new User("bob@ems.com", "encodedPassword", Role.ROLE_EMPLOYEE);
        savedUser.setId(2L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(employeeRepository.existsByEmployeeId(anyString())).thenReturn(false);

        Employee savedEmployee = new Employee();
        savedEmployee.setId(20L);
        savedEmployee.setEmployeeId("EMP-1002");
        savedEmployee.setFirstName("Bob");
        savedEmployee.setLastName("Builder");
        savedEmployee.setEmail("bob@ems.com");
        savedEmployee.setUser(savedUser);
        when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmployee);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mock.jwt.token.bob");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("bob@ems.com", response.getEmail());
        assertEquals("mock.jwt.token.bob", response.getToken());
        verify(leaveBalanceRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email already exists")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@ems.com");
        request.setPassword("pass123");

        when(userRepository.existsByEmail("existing@ems.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }
}
