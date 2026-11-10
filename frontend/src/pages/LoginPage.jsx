import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearAuthError } from '../store/slices/authSlice';
import { Briefcase, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const result = await dispatch(login({ email, password }));
    if (!result.error) {
      const user = result.payload;
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    dispatch(clearAuthError());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/30">
            <Briefcase className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Enterprise EMS
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to manage employee operations, leaves & attendance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-6 rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 sm:text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 sm:text-sm outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg shadow-brand-500/30 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Login Shortcuts */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-xs font-medium text-slate-500 text-center uppercase tracking-wider mb-3">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@ems.com', 'Admin@123')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
              >
                Log in as Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('john.doe@ems.com', 'Emp@123')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
              >
                Log in as Employee
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">Don't have an account? </span>
            <Link to="/register" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
              Register as Employee
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
