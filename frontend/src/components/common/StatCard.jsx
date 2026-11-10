import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
  };

  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
