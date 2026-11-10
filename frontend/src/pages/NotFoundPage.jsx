import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function NotFoundPage() {
  const { user } = useSelector((state) => state.auth);
  const homeLink = user ? (user.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/dashboard') : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">404 - Page Not Found</h1>

        <p className="text-sm text-slate-500">
          The requested route or HR resource does not exist or may have been relocated.
        </p>

        <div className="pt-2">
          <Link
            to={homeLink}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
