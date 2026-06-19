// src/components/Header.tsx
// ============================================================
// HEADER CỦA ỨNG DỤNG - GIỮ NGUYÊN GIAO DIỆN
// ============================================================
// Mục đích: Hiển thị logo, thông tin user, sandbox, logout
// - Logo và tên ứng dụng
// - Sandbox Actor Switcher (nếu cần)
// - Thông tin user và vai trò
// - Nút đăng xuất
// - Thông báo và trợ giúp
// ============================================================

import React from "react";
import { AuthUser } from "@/src/generated/services/AuthService";
import { Bell, HelpCircle, Shield, UserCheck, LogOut } from "lucide-react";

// ============================================================
// ĐỊNH NGHĨA PROPS
// ============================================================
interface HeaderProps {
  user: AuthUser; // Người dùng hiện tại
  onLogout: () => void; // Hàm đăng xuất
  isSandbox?: boolean; // Có đang ở chế độ Sandbox không
  onSwitchUser?: (userId: string) => void; // Hàm đổi user trong Sandbox
  users?: AuthUser[]; // Danh sách user để switch
}

// ============================================================
// COMPONENT CHÍNH
// ============================================================
export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  isSandbox = false,
  onSwitchUser,
  users = [],
}) => {
  console.log("Header - User:", user.name, "Role:", user.role);

  // Xác định tên hiển thị cho role
  const getDisplayRole = (role: string) => {
    if (role === "HR") return "HR BP";
    if (role === "SeniorManager") return "Senior Manager";
    return role;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      {/* ===== LOGO ===== */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-900 text-white p-2 rounded">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <span className="font-semibold text-lg text-blue-950 font-sans tracking-tight">
            PAS
          </span>
          <span className="hidden sm:inline bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded-full ml-2 font-medium border border-blue-100">
            Performance Appraisal Platform
          </span>
        </div>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="flex items-center gap-4">
        {/* ===== SANDBOX ACTOR SWITCHER ===== */}
        {isSandbox && onSwitchUser ? (
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <span className="text-xs text-amber-800 font-semibold flex items-center gap-1">
              <UserCheck size={14} className="text-amber-700" /> Sandbox Act-As:
            </span>
            <select
              value={user.id}
              onChange={(e) => onSwitchUser(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:ring-0 cursor-pointer p-0 pr-8 outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({getDisplayRole(u.role)})
                </option>
              ))}
            </select>
          </div>
        ) : (
          /* ===== STATUS INDICATOR ===== */
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

        {/* ===== USER INFO ===== */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-slate-800">{user.name}</p>
          <p className="text-[10px] text-slate-500">
            {getDisplayRole(user.role)}
          </p>
        </div>

        {/* ===== LOGOUT BUTTON ===== */}
        <button
          onClick={onLogout}
          title="Log Out of Session"
          className="p-1.5 px-3 text-xs text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-bold"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline font-bold">Đăng xuất</span>
        </button>

        {/* ===== SEPARATOR ===== */}
        <div className="h-6 w-px bg-slate-200" />

        {/* ===== NOTIFICATIONS ===== */}
        <button className="relative p-1.5 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        </button>

        {/* ===== HELP ===== */}
        <button className="p-1.5 hover:bg-slate-50 rounded-full text-slate-500 transition-colors hidden sm:block">
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
};
