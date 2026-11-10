import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import Badge from './Badge';

export default function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs sm:text-sm font-medium text-slate-500 hidden sm:inline">
          Today: <span className="text-slate-700 font-semibold">{todayStr}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-bold text-slate-800 leading-tight">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>

          {user?.role && (
            <Badge variant={user.role} size="sm">
              {user.role === 'ROLE_ADMIN' ? 'ADMIN' : 'EMPLOYEE'}
            </Badge>
          )}

          <Link
            to="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-semibold border border-brand-200 hover:bg-brand-100 transition-colors"
            title="My Profile"
          >
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
