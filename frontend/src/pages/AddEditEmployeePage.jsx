import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createEmployee, updateEmployee } from '../store/slices/employeeSlice';
import { employeeApi } from '../api/employeeApi';
import { departmentApi } from '../api/departmentApi';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function AddEditEmployeePage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    departmentId: '',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentStatus: 'ACTIVE',
    role: 'ROLE_EMPLOYEE',
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    departmentApi.getAll().then((res) => {
      if (res.data) setDepartments(res.data);
    }).catch(() => {});

    if (isEdit) {
      setPageLoading(true);
      employeeApi.getById(id)
        .then((res) => {
          const emp = res.data;
          setFormData({
            employeeId: emp.employeeId || '',
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            email: emp.email || '',
            password: '',
            phone: emp.phone || '',
            departmentId: emp.departmentId ? String(emp.departmentId) : '',
            designation: emp.designation || '',
            joiningDate: emp.joiningDate || '',
            employmentStatus: emp.employmentStatus || 'ACTIVE',
            role: emp.role || 'ROLE_EMPLOYEE',
          });
        })
        .catch((err) => {
          setError(err.message || 'Failed to load employee details');
        })
        .finally(() => setPageLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        const updatePayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          departmentId: formData.departmentId ? Number(formData.departmentId) : null,
          designation: formData.designation,
          employmentStatus: formData.employmentStatus,
          role: formData.role,
        };
        const result = await dispatch(updateEmployee({ id, data: updatePayload }));
        if (result.error) throw new Error(result.error);
      } else {
        const createPayload = {
          ...formData,
          departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        };
        const result = await dispatch(createEmployee(createPayload));
        if (result.error) throw new Error(result.error);
      }
      navigate('/employees');
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <h1 className="text-xl font-bold text-slate-900">
          {isEdit ? 'Edit Employee Details' : 'Create New Employee'}
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                disabled={isEdit}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
              {isEdit && <span className="text-[11px] text-slate-400">Email cannot be changed after creation.</span>}
            </div>

            {!isEdit ? (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.employeeId}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 bg-slate-50 font-mono outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-0100"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Department
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Designation *
              </label>
              <input
                type="text"
                required
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Senior Software Developer"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Joining Date *
              </label>
              <input
                type="date"
                required
                disabled={isEdit}
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Employment Status *
              </label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:border-brand-500 outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                System Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 bg-white focus:border-brand-500 outline-none"
              >
                <option value="ROLE_EMPLOYEE">EMPLOYEE</option>
                <option value="ROLE_ADMIN">ADMIN</option>
                <option value="ROLE_MANAGER">MANAGER</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/employees"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

