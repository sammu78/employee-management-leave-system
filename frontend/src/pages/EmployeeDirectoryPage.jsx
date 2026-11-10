import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchEmployees, deactivateEmployee, deleteEmployee } from '../store/slices/employeeSlice';
import { departmentApi } from '../api/departmentApi';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { Search, Filter, UserPlus, Eye, Edit, UserX, Trash2, Building2 } from 'lucide-react';

export default function EmployeeDirectoryPage() {
  const dispatch = useDispatch();
  const { employees, pagination, loading } = useSelector((state) => state.employee);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    departmentApi.getAll().then((res) => {
      if (res.data) setDepartments(res.data);
    }).catch(() => {});
  }, []);

  const loadData = () => {
    dispatch(
      fetchEmployees({
        search: search || null,
        departmentId: departmentId || null,
        status: status || null,
        page,
        size: 10,
        sortBy: 'firstName',
        sortDir: 'asc',
      })
    );
  };

  useEffect(() => {
    loadData();
  }, [dispatch, page, departmentId, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  const handleDeactivate = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate employee: ${name}?`)) {
      await dispatch(deactivateEmployee(id));
      loadData();
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete employee: ${name}? This cannot be undone.`)) {
      await dispatch(deleteEmployee(id));
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search and manage organizational staff records & designations
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/employees/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            Add New Employee
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, employee ID..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:border-brand-500 outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:border-brand-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Emp ID</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-2" />
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No employees matching the criteria found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-bold flex items-center justify-center text-xs">
                          {emp.firstName.charAt(0)}
                          {emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{emp.fullName}</span>
                          <span className="text-xs text-slate-400">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-700 font-semibold">
                      {emp.employeeId}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs font-medium">
                      {emp.departmentName || <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-4 text-slate-700 text-xs">
                      {emp.designation}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={emp.employmentStatus} size="sm">
                        {emp.employmentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={emp.role} size="sm">
                        {emp.role === 'ROLE_ADMIN' ? 'ADMIN' : 'EMPLOYEE'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              to={`/employees/${emp.id}/edit`}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            {emp.employmentStatus === 'ACTIVE' && (
                              <button
                                onClick={() => handleDeactivate(emp.id, emp.fullName)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                                title="Deactivate"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(emp.id, emp.fullName)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.pageNumber}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.pageSize}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}
