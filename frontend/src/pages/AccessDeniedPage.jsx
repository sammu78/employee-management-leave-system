import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function AccessDeniedPage() {
  const { user } = useSelector((state) => state.auth);
  const homeLink = user?.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">403 - Access Denied</h1>

        <p className="text-sm text-slate-500">
          You do not have administrative or sufficient role clearance to access this portal resource.
        </p>

        <div className="pt-2">
          <Link
            to={homeLink}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
