import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchEmployeeDashboard } from '../store/slices/dashboardSlice';
import { checkIn, checkOut } from '../store/slices/attendanceSlice';
import { cancelLeave } from '../store/slices/leaveSlice';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  LogIn,
  LogOut,
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const dispatch = useDispatch();
  const { employeeStats, loading } = useSelector((state) => state.dashboard);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punchNote, setPunchNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    dispatch(fetchEmployeeDashboard());
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    await dispatch(checkIn(punchNote || 'Web portal punch'));
    setPunchNote('');
    setActionLoading(false);
    loadData();
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    await dispatch(checkOut(punchNote || 'Leaving office'));
    setPunchNote('');
    setActionLoading(false);
    loadData();
  };

  const handleCancelLeave = async (id) => {
    if (window.confirm('Are you sure you want to cancel this pending leave request?')) {
      await dispatch(cancelLeave(id));
      loadData();
    }
  };

  if (loading && !employeeStats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const employee = employeeStats?.employee;
  const balance = employeeStats?.leaveBalance;
  const todayAtt = employeeStats?.todayAttendance;

  const isCheckedIn = !!todayAtt?.checkInTime;
  const isCheckedOut = !!todayAtt?.checkOutTime;

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Employee Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {employee?.firstName || 'Employee'}!
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            {employee?.designation} • {employee?.departmentName || 'General'} • {employee?.employeeId}
          </p>
        </div>

        {/* Live Attendance Clock & Punch Box */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-wider text-indigo-200 font-medium">Digital Timeclock</p>
            <div className="text-2xl font-mono font-bold tracking-widest mt-0.5">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-indigo-200 mt-1">
              Status:{' '}
              {isCheckedOut ? (
                <span className="font-semibold text-white">Checked Out ({todayAtt.checkOutTime.substring(0, 5)})</span>
              ) : isCheckedIn ? (
                <span className="font-semibold text-emerald-300">Checked In ({todayAtt.checkInTime.substring(0, 5)})</span>
              ) : (
                <span className="font-semibold text-amber-300">Not Checked In</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                Punch Check-In
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Punch Check-Out
              </button>
            ) : (
              <div className="px-4 py-2 bg-white/20 rounded-xl text-xs font-semibold text-white text-center">
                Day Complete ({todayAtt.workHours || 0} hrs)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Your Leave Quotas & Balances</h2>
          <Link
            to="/leaves/apply"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200"
          >
            <PlusCircle className="w-4 h-4" /> Apply for Leave
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Casual Leave"
            value={`${balance?.casualLeave ?? 0} Days`}
            subtitle="Available balance"
            icon={CalendarDays}
            color="indigo"
          />
          <StatCard
            title="Sick Leave"
            value={`${balance?.sickLeave ?? 0} Days`}
            subtitle="Medical / emergencies"
            icon={CalendarDays}
            color="emerald"
          />
          <StatCard
            title="Earned Leave"
            value={`${balance?.earnedLeave ?? 0} Days`}
            subtitle="Annual paid privilege"
            icon={CalendarDays}
            color="amber"
          />
          <StatCard
            title="Unpaid Leave"
            value={`${balance?.unpaidLeaveUsed ?? 0} Days`}
            subtitle="Total days taken"
            icon={CalendarDays}
            color="rose"
          />
        </div>
      </div>

      {/* Recent Leaves & Attendance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leave Requests (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-brand-600" />
              My Recent Leave Requests
            </h2>
            <Link
              to="/leaves/history"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Full History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {(!employeeStats?.recentLeaves || employeeStats.recentLeaves.length === 0) ? (
              <div className="py-12 text-center text-sm text-slate-400">
                You haven't submitted any leave requests yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Leave Type</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeStats.recentLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {leave.leaveType.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                        {leave.totalDays}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={leave.status} size="sm">
                          {leave.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {leave.status === 'PENDING' ? (
                          <button
                            onClick={() => handleCancelLeave(leave.id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Recent Attendance (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              Recent Punches
            </h2>
            <Link
              to="/attendance"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 p-4 space-y-3">
            {(!employeeStats?.recentAttendance || employeeStats.recentAttendance.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent attendance records.
              </div>
            ) : (
              employeeStats.recentAttendance.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-800 block">{att.date}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      In: {att.checkInTime ? att.checkInTime.substring(0, 5) : '-'} | Out:{' '}
                      {att.checkOutTime ? att.checkOutTime.substring(0, 5) : '-'}
                    </span>
                  </div>
                  <Badge variant={att.status} size="sm">
                    {att.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

