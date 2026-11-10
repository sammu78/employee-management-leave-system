import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import { departmentApi } from '../api/departmentApi';
import { Briefcase, User, Mail, Lock, Phone, Building2, Calendar, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    departmentId: '',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const [departments, setDepartments] = useState([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    departmentApi.getAll().then((res) => {
      if (res.data) setDepartments(res.data);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const payload = {
      ...formData,
      departmentId: formData.departmentId ? Number(formData.departmentId) : null,
    };

    const result = await dispatch(register(payload));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/30">
            <Briefcase className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Employee Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Create your employee account to access the workforce portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          {(error || formError) && (
            <div className="mb-6 rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{formError || error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                  First Name *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jane"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Smith"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane.smith@company.com"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0123"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                  Designation *
                </label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1.5">
                  Joining Date *
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg shadow-brand-500/30 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 disabled:opacity-50 transition"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-6">
            <span className="text-sm text-slate-500">Already registered? </span>
            <Link to="/login" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
