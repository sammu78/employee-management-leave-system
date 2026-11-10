package com.ems.service;

import com.ems.dto.request.LeaveApplyRequest;
import com.ems.dto.request.LeaveRejectRequest;
import com.ems.dto.response.LeaveBalanceResponse;
import com.ems.dto.response.LeaveRequestResponse;
import com.ems.dto.response.PagedResponse;
import com.ems.entity.User;
import com.ems.entity.enums.LeaveStatus;

public interface LeaveService {
    LeaveRequestResponse applyLeave(User currentUser, LeaveApplyRequest request);
    PagedResponse<LeaveRequestResponse> getMyLeaves(User currentUser, LeaveStatus status, int page, int size);
    PagedResponse<LeaveRequestResponse> getAllLeaves(LeaveStatus status, Long deptId, int page, int size);
    LeaveRequestResponse getLeaveById(Long id, User currentUser);
    LeaveRequestResponse approveLeave(Long id, User currentUser);
    LeaveRequestResponse rejectLeave(Long id, LeaveRejectRequest rejectRequest, User currentUser);
    LeaveRequestResponse cancelLeave(Long id, User currentUser);
    LeaveBalanceResponse getMyLeaveBalance(User currentUser);
    LeaveBalanceResponse getEmployeeLeaveBalance(Long employeeId);
}
