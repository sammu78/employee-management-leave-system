import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { applyLeave, fetchMyBalance, clearLeaveStatus } from '../store/slices/leaveSlice';
import { CalendarDays, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export default function LeaveApplicationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myBalance, loading, error, successMessage } = useSelector((state) => state.leave);

  const [formData, setFormData] = useState({
    leaveType: 'CASUAL_LEAVE',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [estimatedDays, setEstimatedDays] = useState(0);

  useEffect(() => {
    dispatch(fetchMyBalance());
    dispatch(clearLeaveStatus());
  }, [dispatch]);

  // Calculate working days preview (excluding weekends)
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (start <= end) {
        let count = 0;
        let cur = new Date(start);
        while (cur <= end) {
          const day = cur.getDay();
          if (day !== 0 && day !== 6) {
            count++;
          }
          cur.setDate(cur.getDate() + 1);
        }
        setEstimatedDays(count);
      } else {
        setEstimatedDays(0);
      }
    } else {
      setEstimatedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(applyLeave(formData));
    if (!result.error) {
      setTimeout(() => {
        navigate('/leaves/history');
      }, 1200);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Apply for Leave</h1>
      </div>

      {/* Available Balance Quotas */}
      {myBalance && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
            Your Available Leave Balances
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-700 block">Casual</span>
              <span className="text-xl font-extrabold text-indigo-950">{myBalance.casualLeave}</span>
              <span className="text-[10px] text-indigo-500 block">Days Left</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 block">Sick</span>
              <span className="text-xl font-extrabold text-emerald-950">{myBalance.sickLeave}</span>
              <span className="text-[10px] text-emerald-500 block">Days Left</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
              <span className="text-xs font-semibold text-amber-700 block">Earned</span>
              <span className="text-xl font-extrabold text-amber-950">{myBalance.earnedLeave}</span>
              <span className="text-[10px] text-amber-500 block">Days Left</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-semibold text-slate-700 block">Unpaid</span>
              <span className="text-xl font-extrabold text-slate-950">{myBalance.unpaidLeaveUsed}</span>
              <span className="text-[10px] text-slate-500 block">Days Used</span>
            </div>
          </div>
        </div>
      )}

      {/* Application Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-semibold">
            {successMessage} Redirecting to your leave history...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-2">
              Leave Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { type: 'CASUAL_LEAVE', label: 'Casual Leave' },
                { type: 'SICK_LEAVE', label: 'Sick Leave' },
                { type: 'EARNED_LEAVE', label: 'Earned Leave' },
                { type: 'UNPAID_LEAVE', label: 'Unpaid Leave' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, leaveType: item.type })}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                    formData.leaveType === item.type
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                required
                name="startDate"
                min={new Date().toISOString().split('T')[0]}
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                required
                name="endDate"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                value={formData.endDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
              />
            </div>
          </div>

          {/* Days calculation badge */}
          {estimatedDays > 0 && (
            <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3 flex items-center justify-between text-xs text-blue-800">
              <span>Working Days to be deducted (excludes weekends):</span>
              <span className="font-bold text-sm text-blue-900">{estimatedDays} Day(s)</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
              Reason for Absence *
            </label>
            <textarea
              required
              rows={4}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please provide details regarding the purpose of your leave..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || estimatedDays <= 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

