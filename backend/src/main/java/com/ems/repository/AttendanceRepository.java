package com.ems.repository;

import com.ems.entity.Attendance;
import com.ems.entity.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);

    Page<Attendance> findByEmployeeId(Long employeeId, Pageable pageable);

    Page<Attendance> findByEmployeeIdOrderByDateDesc(Long employeeId, Pageable pageable);

    @Query("SELECT a FROM Attendance a WHERE " +
           "(:date IS NULL OR a.date = :date) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:deptId IS NULL OR (a.employee.department IS NOT NULL AND a.employee.department.id = :deptId))")
    Page<Attendance> findAllFiltered(
            @Param("date") LocalDate date,
            @Param("status") AttendanceStatus status,
            @Param("deptId") Long deptId,
            Pageable pageable
    );

    long countByDateAndStatus(LocalDate date, AttendanceStatus status);

    long countByDate(LocalDate date);

    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
}
