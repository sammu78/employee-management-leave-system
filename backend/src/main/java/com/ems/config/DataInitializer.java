package com.ems.config;

import com.ems.entity.*;
import com.ems.entity.enums.AttendanceStatus;
import com.ems.entity.enums.EmploymentStatus;
import com.ems.entity.enums.LeaveStatus;
import com.ems.entity.enums.LeaveType;
import com.ems.entity.enums.Role;
import com.ems.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           EmployeeRepository employeeRepository,
                           LeaveBalanceRepository leaveBalanceRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           AttendanceRepository attendanceRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.attendanceRepository = attendanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data load.");
            return;
        }

        log.info("Seeding initial data for Employee Management System...");

        // 1. Seed Departments
        Department hrDept = departmentRepository.save(new Department("Human Resources", "People operations, recruitment, and organizational culture."));
        Department engDept = departmentRepository.save(new Department("Engineering", "Software development, architecture, and technology infrastructure."));
        Department qaDept = departmentRepository.save(new Department("Quality Assurance", "Testing, automation, quality engineering, and compliance."));
        Department finDept = departmentRepository.save(new Department("Finance", "Financial planning, accounting, and budgeting."));
        Department prodDept = departmentRepository.save(new Department("Product Management", "Product discovery, roadmaps, and UI/UX design."));

        // 2. Seed Admin User & Employee
        User adminUser = new User("admin@ems.com", passwordEncoder.encode("Admin@123"), Role.ROLE_ADMIN);
        adminUser = userRepository.save(adminUser);

        Employee adminEmp = new Employee();
        adminEmp.setEmployeeId("EMP-0001");
        adminEmp.setFirstName("Sarah");
        adminEmp.setLastName("Connor");
        adminEmp.setEmail("admin@ems.com");
        adminEmp.setPhone("+1-555-0100");
        adminEmp.setDepartment(hrDept);
        adminEmp.setDesignation("HR Director & System Admin");
        adminEmp.setJoiningDate(LocalDate.now().minusYears(3));
        adminEmp.setEmploymentStatus(EmploymentStatus.ACTIVE);
        adminEmp.setUser(adminUser);
        adminEmp = employeeRepository.save(adminEmp);

        leaveBalanceRepository.save(new LeaveBalance(adminEmp, 15, 12, 20));

        // 3. Seed Employee 1: John Doe
        User emp1User = new User("john.doe@ems.com", passwordEncoder.encode("Emp@123"), Role.ROLE_EMPLOYEE);
        emp1User = userRepository.save(emp1User);

        Employee emp1 = new Employee();
        emp1.setEmployeeId("EMP-1001");
        emp1.setFirstName("John");
        emp1.setLastName("Doe");
        emp1.setEmail("john.doe@ems.com");
        emp1.setPhone("+1-555-0101");
        emp1.setDepartment(engDept);
        emp1.setDesignation("Senior Java Full Stack Engineer");
        emp1.setJoiningDate(LocalDate.now().minusYears(1).minusMonths(4));
        emp1.setEmploymentStatus(EmploymentStatus.ACTIVE);
        emp1.setUser(emp1User);
        emp1 = employeeRepository.save(emp1);

        leaveBalanceRepository.save(new LeaveBalance(emp1, 10, 8, 12));

        // 4. Seed Employee 2: Jane Smith
        User emp2User = new User("jane.smith@ems.com", passwordEncoder.encode("Emp@123"), Role.ROLE_EMPLOYEE);
        emp2User = userRepository.save(emp2User);

        Employee emp2 = new Employee();
        emp2.setEmployeeId("EMP-1002");
        emp2.setFirstName("Jane");
        emp2.setLastName("Smith");
        emp2.setEmail("jane.smith@ems.com");
        emp2.setPhone("+1-555-0102");
        emp2.setDepartment(qaDept);
        emp2.setDesignation("QA Lead Engineer");
        emp2.setJoiningDate(LocalDate.now().minusMonths(9));
        emp2.setEmploymentStatus(EmploymentStatus.ACTIVE);
        emp2.setUser(emp2User);
        emp2 = employeeRepository.save(emp2);

        leaveBalanceRepository.save(new LeaveBalance(emp2, 12, 10, 15));

        // 5. Seed Employee 3: Robert Brown
        User emp3User = new User("robert.brown@ems.com", passwordEncoder.encode("Emp@123"), Role.ROLE_EMPLOYEE);
        emp3User = userRepository.save(emp3User);

        Employee emp3 = new Employee();
        emp3.setEmployeeId("EMP-1003");
        emp3.setFirstName("Robert");
        emp3.setLastName("Brown");
        emp3.setEmail("robert.brown@ems.com");
        emp3.setPhone("+1-555-0103");
        emp3.setDepartment(finDept);
        emp3.setDesignation("Senior Financial Analyst");
        emp3.setJoiningDate(LocalDate.now().minusMonths(6));
        emp3.setEmploymentStatus(EmploymentStatus.ACTIVE);
        emp3.setUser(emp3User);
        emp3 = employeeRepository.save(emp3);

        leaveBalanceRepository.save(new LeaveBalance(emp3, 11, 10, 14));

        // 6. Seed Sample Leave Requests
        LeaveRequest leave1 = new LeaveRequest();
        leave1.setEmployee(emp1);
        leave1.setLeaveType(LeaveType.CASUAL_LEAVE);
        leave1.setStartDate(LocalDate.now().plusDays(5));
        leave1.setEndDate(LocalDate.now().plusDays(6));
        leave1.setTotalDays(2);
        leave1.setReason("Attending family wedding ceremony.");
        leave1.setStatus(LeaveStatus.PENDING);
        leaveRequestRepository.save(leave1);

        LeaveRequest leave2 = new LeaveRequest();
        leave2.setEmployee(emp2);
        leave2.setLeaveType(LeaveType.SICK_LEAVE);
        leave2.setStartDate(LocalDate.now().plusDays(10));
        leave2.setEndDate(LocalDate.now().plusDays(11));
        leave2.setTotalDays(2);
        leave2.setReason("Scheduled dental surgery.");
        leave2.setStatus(LeaveStatus.PENDING);
        leaveRequestRepository.save(leave2);

        // 7. Seed Today's Attendance
        LocalDate today = LocalDate.now();

        Attendance att1 = new Attendance();
        att1.setEmployee(emp1);
        att1.setDate(today);
        att1.setCheckInTime(LocalTime.of(9, 15));
        att1.setStatus(AttendanceStatus.PRESENT);
        att1.setNotes("Punched in on-site.");
        attendanceRepository.save(att1);

        Attendance att2 = new Attendance();
        att2.setEmployee(emp2);
        att2.setDate(today);
        att2.setCheckInTime(LocalTime.of(9, 45));
        att2.setStatus(AttendanceStatus.LATE);
        att2.setNotes("Traffic delay on expressway.");
        attendanceRepository.save(att2);

        log.info("Database seeding successfully completed!");
    }
}

