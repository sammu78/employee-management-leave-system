import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTodayAttendance,
  checkIn,
  checkOut,
  fetchMyAttendance,
  fetchAllAttendance,
} from '../store/slices/attendanceSlice';
import { departmentApi } from '../api/departmentApi';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  UserCheck,
} from 'lucide-react';

export default function AttendanceManagementPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const {
    todayAttendance,
    myAttendance,
    allAttendance,
    pagination,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.attendance);

  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'organization'
  const [punchNote, setPunchNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Admin filter states
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [page, setPage] = useState(0);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    dispatch(fetchTodayAttendance());
    if (isAdmin) {
      departmentApi.getAll().then((res) => {
        if (res.data) setDepartments(res.data);
      }).catch(() => {});
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (activeTab === 'my') {
      dispatch(fetchMyAttendance({ page, size: 12 }));
    } else if (activeTab === 'organization' && isAdmin) {
      dispatch(
        fetchAllAttendance({
          date: filterDate || null,
          status: filterStatus || null,
          departmentId: filterDept || null,
          page,
          size: 12,
        })
      );
    }
  }, [dispatch, activeTab, page, filterDate, filterStatus, filterDept, isAdmin]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    await dispatch(checkIn(punchNote || 'Web punch in'));
    setPunchNote('');
    setActionLoading(false);
    dispatch(fetchTodayAttendance());
    dispatch(fetchMyAttendance({ page: 0, size: 12 }));
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    await dispatch(checkOut(punchNote || 'Web punch out'));
    setPunchNote('');
    setActionLoading(false);
    dispatch(fetchTodayAttendance());
    dispatch(fetchMyAttendance({ page: 0, size: 12 }));
  };

  const isCheckedIn = !!todayAttendance?.checkInTime;
  const isCheckedOut = !!todayAttendance?.checkOutTime;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily work punches, calculate work duration and review company-wide presence
          </p>
        </div>

        {isAdmin && (
          <div className="flex rounded-xl bg-slate-200/80 p-1 border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('my');
                setPage(0);
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'my'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Attendance Punch
            </button>
            <button
              onClick={() => {
                setActiveTab('organization');
                setPage(0);
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'organization'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Organization Master View
            </button>
          </div>
        )}
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

      {/* TAB 1: My Attendance & Punch Card */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          {/* Digital Time Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today's Workday Session
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-slate-600 pt-1">
                <span>
                  Check In:{' '}
                  <strong className="text-slate-900">
                    {todayAttendance?.checkInTime ? todayAttendance.checkInTime.substring(0, 5) : 'Not recorded'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Check Out:{' '}
                  <strong className="text-slate-900">
                    {todayAttendance?.checkOutTime ? todayAttendance.checkOutTime.substring(0, 5) : 'Pending'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Work Hours:{' '}
                  <strong className="text-brand-600">
                    {todayAttendance?.workHours ? `${todayAttendance.workHours} hrs` : 'In progress'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {!isCheckedIn ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={punchNote}
                    onChange={(e) => setPunchNote(e.target.value)}
                    placeholder="Optional punch note..."
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none w-full sm:w-48"
                  />
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    Punch In Now
                  </button>
                </div>
              ) : !isCheckedOut ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={punchNote}
                    onChange={(e) => setPunchNote(e.target.value)}
                    placeholder="Optional sign-off note..."
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none w-full sm:w-48"
                  />
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Punch Out Now
                  </button>
                </div>
              ) : (
                <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Workday Session Completed
                </div>
              )}
            </div>
          </div>

          {/* Personal Punch History Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
              My Historical Punch Log
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Check In</th>
                    <th className="px-4 py-3.5">Check Out</th>
                    <th className="px-4 py-3.5">Total Hours</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                        No previous attendance records recorded.
                      </td>
                    </tr>
                  ) : (
                    myAttendance.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-slate-900 text-xs">
                          {att.date}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-700 font-mono">
                          {att.checkInTime ? att.checkInTime.substring(0, 5) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-700 font-mono">
                          {att.checkOutTime ? att.checkOutTime.substring(0, 5) : 'Active'}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-xs text-slate-800 font-mono">
                          {att.workHours != null ? `${att.workHours} hrs` : '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={att.status} size="sm">
                            {att.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                          {att.notes || '-'}
                        </td>
                      </tr>
                    ))
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
        </div>
      )}

      {/* TAB 2: Organization Master View (Admin only) */}
      {activeTab === 'organization' && isAdmin && (
        <div className="space-y-6">
          {/* Admin Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setPage(0);
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white focus:border-brand-500 outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white focus:border-brand-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ABSENT">Absent</option>
              </select>

              {/* Department Filter */}
              <select
                value={filterDept}
                onChange={(e) => {
                  setFilterDept(e.target.value);
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

          {/* Master Organization Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Check In</th>
                    <th className="px-4 py-3.5">Check Out</th>
                    <th className="px-4 py-3.5">Hours</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && allAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-2" />
                        Loading records...
                      </td>
                    </tr>
                  ) : allAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        No attendance records for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    allAttendance.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-slate-900 block">{att.employeeName}</span>
                          <span className="text-xs text-slate-400 font-mono">{att.employeeCode}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                          {att.departmentName || 'General'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-700 font-mono">
                          {att.date}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-700 font-mono">
                          {att.checkInTime ? att.checkInTime.substring(0, 5) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-700 font-mono">
                          {att.checkOutTime ? att.checkOutTime.substring(0, 5) : 'Active'}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-xs text-slate-800 font-mono">
                          {att.workHours != null ? `${att.workHours} hrs` : '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={att.status} size="sm">
                            {att.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                          {att.notes || '-'}
                        </td>
                      </tr>
                    ))
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
        </div>
      )}
    </div>
  );
}
