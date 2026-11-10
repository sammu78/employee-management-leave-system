import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  clearDepartmentStatus,
} from '../store/slices/departmentSlice';
import Modal from '../components/common/Modal';
import { Building2, Plus, Edit, Trash2, Users, AlertCircle } from 'lucide-react';

export default function DepartmentManagementPage() {
  const dispatch = useDispatch();
  const { departments, loading, error, successMessage } = useSelector((state) => state.department);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(clearDepartmentStatus());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDeptForm({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, description: dept.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptForm.name) return;

    if (editingDept) {
      await dispatch(updateDepartment({ id: editingDept.id, data: deptForm }));
    } else {
      await dispatch(createDepartment(deptForm));
    }
    setIsModalOpen(false);
    dispatch(fetchDepartments());
  };

  const handleDelete = async (dept) => {
    if (
      window.confirm(
        `Are you sure you want to delete the department "${dept.name}"? Employees in this department will be unassigned.`
      )
    ) {
      await dispatch(deleteDepartment(dept.id));
      dispatch(fetchDepartments());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department Hub</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize business units, division hierarchies and staff distribution
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-semibold">
          {successMessage}
        </div>
      )}

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && departments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-2" />
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No departments defined yet. Click "Add Department" to start.
          </div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    {dept.employeeCount} {dept.employeeCount === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {dept.description || 'No description provided for this department.'}
                </p>
              </div>

              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    title="Edit Department"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              placeholder="e.g. Artificial Intelligence Research"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              placeholder="Responsibilities, scope and team mandate..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              {editingDept ? 'Update Department' : 'Save Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

