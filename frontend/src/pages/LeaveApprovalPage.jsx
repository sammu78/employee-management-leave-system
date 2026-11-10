import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllLeaves, approveLeave, rejectLeave } from '../store/slices/leaveSlice';
import { departmentApi } from '../api/departmentApi';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { CalendarDays, CheckCircle, XCircle, Filter, AlertCircle } from 'lucide-react';

export default function LeaveApprovalPage() {
  const dispatch = useDispatch();
  const { allLeaves, pagination, loading, error, successMessage } = useSelector((state) => state.leave);
  const { user } = useSelector((state) => state.auth);

  const [status, setStatus] = useState('PENDING');
  const [departmentId, setDepartmentId] = useState('');
  const [page, setPage] = useState(0);
  const [departments, setDepartments] = useState([]);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  useEffect(() => {
    departmentApi.getAll().then((res) => {
      if (res.data) setDepartments(res.data);
    }).catch(() => {});
  }, []);

  const loadData = () => {
    dispatch(
      fetchAllLeaves({
        status: status || null,
        departmentId: departmentId || null,
        page,
        size: 10,
      })
    );
  };

  useEffect(() => {
    loadData();
  }, [dispatch, status, departmentId, page]);

  const handleApprove = async (leave) => {
    // Check if own leave
    if (leave.employeeId === user?.employeeId) {
      alert('You are strictly not allowed to approve your own leave request.');
      return;
    }

    if (window.confirm(`Approve leave request for ${leave.employeeName} (${leave.totalDays} days)?`)) {
      await dispatch(approveLeave(leave.id));
      loadData();
    }
  };

  const handleOpenReject = (leave) => {
    if (leave.employeeId === user?.employeeId) {
      alert('You cannot review your own leave request.');
      return;
    }
    setSelectedLeave(leave);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) return;
    await dispatch(rejectLeave({ id: selectedLeave.id, rejectionReason: rejectReason }));
    setIsRejectModalOpen(false);
    setSelectedLeave(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Approvals Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, approve, or reject team leave applications with automatic balance reconciliation
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-semibold">
          {successMessage}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {/* Status Tab buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatus(st === 'ALL' ? '' : st);
                setPage(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                (st === 'ALL' && !status) || status === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Department filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white focus:border-brand-500 outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Leave Type</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Days</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && allLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-2" />
                    Loading leave requests...
                  </td>
                </tr>
              ) : allLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leave requests found in this view.
                  </td>
                </tr>
              ) : (
                allLeaves.map((leave) => {
                  const isOwnLeave = leave.employeeId === user?.employeeId;
                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">{leave.employeeName}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {leave.employeeCode} • {leave.departmentName || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-700">
                        {leave.leaveType.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="px-4 py-4 font-bold text-xs text-slate-800">
                        {leave.totalDays} day(s)
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                        {leave.rejectionReason && (
                          <span className="block text-[11px] text-rose-600 mt-1 font-medium">
                            Note: {leave.rejectionReason}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={leave.status} size="sm">
                          {leave.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {leave.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(leave)}
                              disabled={isOwnLeave}
                              className={`p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition ${
                                isOwnLeave ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              title={isOwnLeave ? 'Cannot approve own leave' : 'Approve Leave'}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleOpenReject(leave)}
                              disabled={isOwnLeave}
                              className={`p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition ${
                                isOwnLeave ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              title={isOwnLeave ? 'Cannot review own leave' : 'Reject Leave'}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {leave.approvedByName ? `by ${leave.approvedByName}` : 'Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pagination.pageNumber}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.pageSize}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Leave Application"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-sm text-slate-600">
            Please input the official reason for rejecting the request submitted by{' '}
            <span className="font-semibold text-slate-800">{selectedLeave?.employeeName}</span>.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Rejection Justification *
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incompatible with upcoming product release sprint."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
