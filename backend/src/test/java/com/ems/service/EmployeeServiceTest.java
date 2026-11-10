package com.ems.service;

import com.ems.dto.request.EmployeeCreateRequest;
import com.ems.dto.request.EmployeeUpdateRequest;
import com.ems.dto.response.EmployeeResponse;
import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.entity.enums.EmploymentStatus;
import com.ems.entity.enums.Role;
import com.ems.exception.DuplicateResourceException;
import com.ems.mapper.EntityMapper;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveBalanceRepository;
import com.ems.repository.UserRepository;
import com.ems.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Spy
    private EntityMapper mapper = new EntityMapper();

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Department department;

    @BeforeEach
    void setUp() {
        department = new Department("Engineering", "Software Dev");
        department.setId(1L);
    }

    @Test
    @DisplayName("Should create employee, user account and initialize leave balance")
    void testCreateEmployeeSuccess() {
        EmployeeCreateRequest request = new EmployeeCreateRequest();
        request.setFirstName("Bruce");
        request.setLastName("Wayne");
        request.setEmail("bruce@ems.com");
        request.setPassword("Bat@1234");
        request.setDesignation("Lead Architect");
        request.setJoiningDate(LocalDate.now());
        request.setDepartmentId(1L);

        when(userRepository.existsByEmail("bruce@ems.com")).thenReturn(false);
        when(employeeRepository.existsByEmployeeId(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        User user = new User("bruce@ems.com", "encodedPassword", Role.ROLE_EMPLOYEE);
        user.setId(77L);
        when(userRepository.save(any(User.class))).thenReturn(user);

        Employee savedEmp = new Employee();
        savedEmp.setId(88L);
        savedEmp.setEmployeeId("EMP-8888");
        savedEmp.setFirstName("Bruce");
        savedEmp.setLastName("Wayne");
        savedEmp.setEmail("bruce@ems.com");
        savedEmp.setDepartment(department);
        savedEmp.setDesignation("Lead Architect");
        savedEmp.setJoiningDate(LocalDate.now());
        savedEmp.setUser(user);
        when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmp);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response);
        assertEquals("Bruce Wayne", response.getFullName());
        assertEquals("Engineering", response.getDepartmentName());
        verify(leaveBalanceRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should fail employee creation if email already exists")
    void testCreateEmployeeDuplicateEmail() {
        EmployeeCreateRequest request = new EmployeeCreateRequest();
        request.setEmail("existing@ems.com");

        when(userRepository.existsByEmail("existing@ems.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> employeeService.createEmployee(request));
    }

    @Test
    @DisplayName("Should deactivate employee and disable user account")
    void testDeactivateEmployee() {
        User user = new User("emp@ems.com", "pass", Role.ROLE_EMPLOYEE);
        user.setEnabled(true);

        Employee emp = new Employee();
        emp.setId(12L);
        emp.setUser(user);
        emp.setEmploymentStatus(EmploymentStatus.ACTIVE);

        when(employeeRepository.findById(12L)).thenReturn(Optional.of(emp));

        employeeService.deactivateEmployee(12L);

        assertEquals(EmploymentStatus.INACTIVE, emp.getEmploymentStatus());
        assertFalse(user.isEnabled());
        verify(employeeRepository, times(1)).save(emp);
    }
}
