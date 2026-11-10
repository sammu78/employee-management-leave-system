import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAdminDashboard } from '../store/slices/dashboardSlice';
import { approveLeave, rejectLeave } from '../store/slices/leaveSlice';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import {
  Users,
  Building2,
  CalendarDays,
  UserCheck,
  Clock,
  UserX,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { adminStats, loading } = useSelector((state) => state.dashboard);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const loadData = () => {
    dispatch(fetchAdminDashboard());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this leave request?')) {
      await dispatch(approveLeave(id));
      loadData();
    }
  };

  const handleOpenReject = (leave) => {
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

  if (loading && !adminStats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time workforce snapshot, attendance metrics & pending leave authorizations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/employees/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            + Add Employee
          </Link>
          <Link
            to="/admin/leaves"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition"
          >
            Leave Queue
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Employees"
          value={adminStats?.totalEmployees ?? 0}
          subtitle={`${adminStats?.activeEmployees ?? 0} currently active`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Pending Leaves"
          value={adminStats?.pendingLeavesCount ?? 0}
          subtitle="Awaiting authorization"
          icon={CalendarDays}
          color="amber"
        />
        <StatCard
          title="Today's Present"
          value={adminStats?.todayPresentCount ?? 0}
          subtitle="On time check-ins"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Today's Late / Absent"
          value={`${adminStats?.todayLateCount ?? 0} / ${adminStats?.todayAbsentCount ?? 0}`}
          subtitle="Late punch / Unaccounted"
          icon={Clock}
          color="rose"
        />
      </div>

      {/* Main Grid: Recent Leaves & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leave Requests */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-brand-600" />
              Recent Leave Requests
            </h2>
            <Link
              to="/admin/leaves"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {(!adminStats?.recentLeaveRequests || adminStats.recentLeaveRequests.length === 0) ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No leave requests found in the system.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminStats.recentLeaveRequests.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {leave.employeeName}
                        <span className="block text-xs text-slate-400">{leave.employeeCode}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                        {leave.leaveType.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                        {leave.totalDays} day(s)
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={leave.status} size="sm">
                          {leave.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {leave.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleOpenReject(leave)}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Today's Attendance Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              Live Attendance Log
            </h2>
            <Link
              to="/attendance"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Full Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {(!adminStats?.recentAttendance || adminStats.recentAttendance.length === 0) ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No attendance records for today yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminStats.recentAttendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {att.employeeName}
                        <span className="block text-xs text-slate-400">{att.departmentName || 'General'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 font-mono">
                        {att.checkInTime ? att.checkInTime.substring(0, 5) : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 font-mono">
                        {att.checkOutTime ? att.checkOutTime.substring(0, 5) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={att.status} size="sm">
                          {att.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Leave Request"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-sm text-slate-600">
            Please provide a specific reason for rejecting the leave request from{' '}
            <span className="font-semibold text-slate-800">{selectedLeave?.employeeName}</span>.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Rejection Reason *
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Critical project deadline requires full team presence."
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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

