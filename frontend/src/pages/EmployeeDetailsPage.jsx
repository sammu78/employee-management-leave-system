import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { employeeApi } from '../api/employeeApi';
import { leaveApi } from '../api/leaveApi';
import Badge from '../components/common/Badge';
import { ArrowLeft, Edit, Mail, Phone, Building2, Calendar, Briefcase, Shield, Clock } from 'lucide-react';

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [employee, setEmployee] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      employeeApi.getById(id),
      leaveApi.getEmployeeBalance(id).catch(() => ({ data: null })),
    ])
      .then(([empRes, balRes]) => {
        setEmployee(empRes.data);
        if (balRes?.data) setBalance(balRes.data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load employee details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="rounded-2xl bg-white p-8 border border-slate-100 text-center space-y-4">
        <p className="text-rose-600 font-semibold">{error || 'Employee not found'}</p>
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-sm text-brand-600 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
        </Link>

        {isAdmin && (
          <Link
            to={`/employees/${employee.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        )}
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-20 w-20 rounded-2xl bg-brand-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            {employee.firstName?.charAt(0)}
            {employee.lastName?.charAt(0)}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{employee.fullName}</h1>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{employee.designation}</p>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Badge variant={employee.employmentStatus} size="lg">
                  {employee.employmentStatus}
                </Badge>
                <Badge variant={employee.role} size="lg">
                  {employee.role === 'ROLE_ADMIN' ? 'ADMIN' : 'EMPLOYEE'}
                </Badge>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{employee.phone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{employee.departmentName || 'Not assigned to a department'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Joined on {employee.joiningDate}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 font-mono">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>ID: {employee.employeeId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance Quotas */}
      {balance && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-base font-bold text-slate-800">Assigned Leave Quotas & Usage</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">Casual Leave</p>
              <h3 className="text-2xl font-bold text-indigo-900 mt-1">{balance.casualLeave} Days</h3>
              <p className="text-[11px] text-indigo-500 mt-0.5">Remaining quota</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Sick Leave</p>
              <h3 className="text-2xl font-bold text-emerald-900 mt-1">{balance.sickLeave} Days</h3>
              <p className="text-[11px] text-emerald-500 mt-0.5">Medical allowance</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Earned Leave</p>
              <h3 className="text-2xl font-bold text-amber-900 mt-1">{balance.earnedLeave} Days</h3>
              <p className="text-[11px] text-amber-500 mt-0.5">Paid annual leave</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <p className="text-xs text-rose-700 font-semibold uppercase tracking-wider">Unpaid Used</p>
              <h3 className="text-2xl font-bold text-rose-900 mt-1">{balance.unpaidLeaveUsed} Days</h3>
              <p className="text-[11px] text-rose-500 mt-0.5">Deducted leaves</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
