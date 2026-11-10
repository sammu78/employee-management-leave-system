package com.ems.repository;

import com.ems.entity.Employee;
import com.ems.entity.enums.EmploymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeId(String employeeId);

    Optional<Employee> findByUserId(Long userId);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(String employeeId);

    boolean existsByEmailAndIdNot(String email, Long id);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:deptId IS NULL OR (e.department IS NOT NULL AND e.department.id = :deptId)) AND " +
           "(:status IS NULL OR e.employmentStatus = :status) AND " +
           "(:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.employeeId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Employee> searchEmployees(
            @Param("deptId") Long deptId,
            @Param("status") EmploymentStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    long countByEmploymentStatus(EmploymentStatus status);

    long countByDepartmentId(Long departmentId);
}
