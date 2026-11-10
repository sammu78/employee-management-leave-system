import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { employeeApi } from '../api/employeeApi';
import { updateCurrentUserProfile } from '../store/slices/authSlice';
import Badge from '../components/common/Badge';
import { User, Mail, Phone, Building2, Calendar, Shield, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfile = () => {
    setLoading(true);
    employeeApi.getMyProfile()
      .then((res) => {
        const data = res.data;
        setProfile(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
        });
      })
      .catch((err) => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await employeeApi.updateMyProfile(formData);
      setProfile(res.data);
      dispatch(updateCurrentUserProfile({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
      }));
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal contact information and review verified employment records
        </p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {profile && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-8">
          {/* Top Banner */}
          <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
            <div className="h-16 w-16 rounded-2xl bg-brand-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {profile.firstName?.charAt(0)}
              {profile.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
              <p className="text-xs text-slate-500">{profile.designation}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={profile.employmentStatus} size="sm">
                  {profile.employmentStatus}
                </Badge>
                <Badge variant={profile.role} size="sm">
                  {profile.role === 'ROLE_ADMIN' ? 'ADMIN' : 'EMPLOYEE'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form for editable fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Personal Information (Editable)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0199"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Updating...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Read-Only Organizational Metadata */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Employment Records (Read-Only)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800">{profile.employeeId}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Company Email</span>
                  <span className="font-semibold text-slate-800">{profile.email}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Department</span>
                  <span className="font-semibold text-slate-800">{profile.departmentName || 'General Staff'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Joining Date</span>
                  <span className="font-semibold text-slate-800">{profile.joiningDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
