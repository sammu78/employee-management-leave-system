import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyLeaves, fetchMyBalance, cancelLeave } from '../store/slices/leaveSlice';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { CalendarDays, PlusCircle, AlertCircle, Ban } from 'lucide-react';

export default function LeaveHistoryPage() {
  const dispatch = useDispatch();
  const { myLeaves, myBalance, pagination, loading, error, successMessage } = useSelector((state) => state.leave);

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  const loadData = () => {
    dispatch(fetchMyLeaves({ status: status || null, page, size: 10 }));
    dispatch(fetchMyBalance());
  };

  useEffect(() => {
    loadData();
  }, [dispatch, status, page]);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this pending leave request?')) {
      await dispatch(cancelLeave(id));
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Leave History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all your submitted leave requests, approval decisions & current quota balances
          </p>
        </div>

        <Link
          to="/leaves/apply"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          Apply New Leave
        </Link>
      </div>

      {/* Quota Highlights */}
      {myBalance && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block uppercase">Casual Remaining</span>
            <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{myBalance.casualLeave}</span>
            <span className="text-[11px] text-slate-400">Days available</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block uppercase">Sick Remaining</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{myBalance.sickLeave}</span>
            <span className="text-[11px] text-slate-400">Medical quota</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block uppercase">Earned Remaining</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{myBalance.earnedLeave}</span>
            <span className="text-[11px] text-slate-400">Paid annual quota</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block uppercase">Unpaid Used</span>
            <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{myBalance.unpaidLeaveUsed}</span>
            <span className="text-[11px] text-slate-400">Total days unpaid</span>
          </div>
        </div>
      )}

      {/* Notifications */}
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

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-1.5 flex-wrap">
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

      {/* Leaves Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5">Leave Type</th>
                <th className="px-4 py-3.5">Date Range</th>
                <th className="px-4 py-3.5">Working Days</th>
                <th className="px-6 py-3.5">Reason & Feedback</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && myLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-2" />
                    Loading leave requests...
                  </td>
                </tr>
              ) : myLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No leave requests found in this status.
                  </td>
                </tr>
              ) : (
                myLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                      {leave.leaveType.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-700">
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td className="px-4 py-4 font-bold text-xs text-slate-800">
                      {leave.totalDays} day(s)
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-sm">
                      <p className="truncate" title={leave.reason}>{leave.reason}</p>
                      {leave.rejectionReason && (
                        <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                          Rejection note: {leave.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={leave.status} size="sm">
                        {leave.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === 'PENDING' ? (
                        <button
                          onClick={() => handleCancel(leave.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                        >
                          <Ban className="w-3.5 h-3.5" /> Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
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
  );
}

