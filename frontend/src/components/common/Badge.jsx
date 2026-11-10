import React from 'react';

export default function Badge({ children, variant = 'neutral', size = 'md' }) {
  const variantStyles = {
    // Leave / General Statuses
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10',

    // Attendance Statuses
    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    LATE: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    HALF_DAY: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
    ABSENT: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',

    // Employment Statuses
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10',
    TERMINATED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    ON_LEAVE: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',

    // Roles
    ROLE_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10',
    ROLE_EMPLOYEE: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
    ROLE_MANAGER: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/10',

    // Generic
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    info: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const style = variantStyles[variant] || variantStyles.neutral;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ring-inset ${style} ${sizeStyle}`}
    >
      {children}
    </span>
  );
}
