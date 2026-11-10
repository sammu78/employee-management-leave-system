package com.ems.repository;

import com.ems.entity.LeaveRequest;
import com.ems.entity.enums.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    Page<LeaveRequest> findByEmployeeId(Long employeeId, Pageable pageable);

    Page<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status, Pageable pageable);

    @Query("SELECT l FROM LeaveRequest l WHERE " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:deptId IS NULL OR (l.employee.department IS NOT NULL AND l.employee.department.id = :deptId))")
    Page<LeaveRequest> findAllFiltered(@Param("status") LeaveStatus status,
                                       @Param("deptId") Long deptId,
                                       Pageable pageable);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId " +
           "AND l.status IN (:activeStatuses) " +
           "AND (l.startDate <= :endDate AND l.endDate >= :startDate)")
    List<LeaveRequest> findOverlappingRequests(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("activeStatuses") List<LeaveStatus> activeStatuses
    );

    long countByStatus(LeaveStatus status);

    long countByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);
}

