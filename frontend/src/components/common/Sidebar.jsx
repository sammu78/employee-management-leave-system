import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarDays,
  CheckSquare,
  Clock,
  Building2,
  UserCheck,
  Briefcase,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Employee Directory', path: '/employees', icon: Users },
    { name: 'Add Employee', path: '/employees/new', icon: UserPlus },
    { name: 'Leave Approvals', path: '/admin/leaves', icon: CheckSquare },
    { name: 'Attendance Records', path: '/attendance', icon: Clock },
    { name: 'Department Hub', path: '/departments', icon: Building2 },
    { name: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  const employeeNavItems = [
    { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Apply for Leave', path: '/leaves/apply', icon: CalendarDays },
    { name: 'Leave History', path: '/leaves/history', icon: CheckSquare },
    { name: 'Attendance Punch', path: '/attendance', icon: Clock },
    { name: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Enterprise EMS</span>
              <span className="block text-[10px] uppercase font-semibold text-brand-400 tracking-wider">
                HR & Leave Suite
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-3 px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {isAdmin ? 'Administration Portal' : 'Employee Portal'}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="rounded-xl bg-slate-800/60 p-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block mb-0.5">Role:</span>
            <span className="font-mono text-brand-300">{user?.role || 'Guest'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

