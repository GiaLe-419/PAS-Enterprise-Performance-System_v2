import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, HelpCircle, Shield, RefreshCw, UserCheck, LogOut } from 'lucide-react';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const { users, currentUser, switchUser, activeCycle, loginType, logout } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-blue-900 text-white p-2 rounded">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <span className="font-semibold text-lg text-blue-950 font-sans tracking-tight">PAS</span>
          <span className="hidden sm:inline bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded-full ml-2 font-medium border border-blue-100">
            Performance Appraisal Platform
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Sandbox Actor Switcher - Required to demo different role flows only in Sandbox */}
        {loginType === 'Sandbox' ? (
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <span className="text-xs text-amber-800 font-semibold flex items-center gap-1">
              <UserCheck size={14} className="text-amber-700" /> Sandbox Act-As:
            </span>
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:ring-0 cursor-pointer p-0 pr-8 outline-none"
            >
              {users.map((u) => {
                const displayRole = u.role === 'HR' 
                  ? 'HR BP' 
                  : u.role === 'SeniorManager' 
                    ? 'Senior Manager' 
                    : u.role;
                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({displayRole})
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-100 px-3 py-1.5 rounded-lg text-emerald-850">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Đại diện Chính thức
            </span>
          </div>
        )}

        {/* Logout button */}
        <button 
          onClick={logout}
          title="Log Out of Session"
          className="p-1.5 px-3 text-xs text-red-650 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-bold"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline font-bold">Đăng xuất</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <button className="relative p-1.5 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        </button>

        <button className="p-1.5 hover:bg-slate-50 rounded-full text-slate-500 transition-colors hidden sm:block">
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
};
