// src/components/Sidebar.tsx
import React from "react";
import { useDataverse } from "@/src/context/DataverseContext";
import { AuthUser } from "@/src/services/AuthService";
import {
  BarChart3,
  CheckSquare,
  FolderLock,
  Layers,
  TrendingUp,
  History,
  LayoutDashboard,
} from "lucide-react";

// ✅ THÊM user vào interface
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: AuthUser; // ✅ Thêm dòng này
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user, // ✅ Nhận user từ props
}) => {
  // ✅ KHÔNG dùng useApp() nữa
  // Dùng user từ props

  const isHR = user.role === "HR";
  const isSeniorManager = user.role === "SeniorManager";
  const isManager = user.role === "Manager";
  const hasManagementAccess = isHR || isSeniorManager || isManager;

  const menuItems = [
    {
      id: "dashboard",
      label: "Ecosystem Desk",
      icon: LayoutDashboard,
      roles: ["Employee", "Manager", "HR", "SeniorManager"],
    },
    {
      id: "cycles",
      label: "Cycle Registry",
      icon: Layers,
      roles: ["HR"],
      badge: "HR",
    },
    {
      id: "goals",
      label: "KPI & Goals Desk",
      icon: CheckSquare,
      roles: ["Employee", "Manager", "HR", "SeniorManager"],
    },
    {
      id: "appraisals",
      label: "Appraisal Reviews",
      icon: FolderLock,
      roles: ["Employee", "Manager", "HR", "SeniorManager"],
    },
    {
      id: "calibration",
      label: "Calibration Room",
      icon: TrendingUp,
      roles: ["HR"],
      badge: "HR",
    },
    {
      id: "analytics",
      label: "Talent Diagnostics",
      icon: BarChart3,
      roles: ["HR", "SeniorManager", "Manager"],
      badge: "Leader",
    },
    {
      id: "audits",
      label: "Audit Registry",
      icon: History,
      roles: ["HR", "Manager", "Employee", "SeniorManager"],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col h-[calc(100vh-64px)] shrink-0 font-sans">
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => {
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                  active
                    ? "bg-blue-650 text-white shadow-md shadow-blue-905/20 border-l-4 border-blue-500"
                    : "hover:bg-slate-800 hover:text-slate-100"
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 text-left">
                  <item.icon
                    size={18}
                    className={`shrink-0 ${
                      active ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span className="leading-snug">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 font-bold rounded uppercase tracking-wider shrink-0 whitespace-nowrap ${
                      item.badge === "HR"
                        ? "bg-blue-900/40 text-blue-300 border border-blue-800/45"
                        : item.badge === "Exec"
                          ? "bg-purple-900/40 text-purple-300 border border-purple-800/45"
                          : "bg-emerald-900/40 text-emerald-300 border border-emerald-800/45"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      <div className="p-4 border-t border-slate-850 mt-auto bg-slate-950/45 text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600 font-mono">
            Current Status
          </span>
          <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
            Online
          </span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Logged in: <strong className="text-slate-405">{user.name}</strong>
        </p>
        <p className="text-[10px] text-slate-600 font-mono">
          Security: System Sealed (C-402)
        </p>
      </div>
    </aside>
  );
};
