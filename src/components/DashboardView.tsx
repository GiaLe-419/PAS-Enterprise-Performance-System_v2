// src/components/DashboardView.tsx
// ============================================================
// MÀN HÌNH TỔNG QUAN (DASHBOARD)
// ============================================================
// Mục đích: Hiển thị tổng quan hệ thống và các task cần xử lý
// - Thông tin user và cycle hiện tại
// - Thống kê workflow
// - Các KPI chính
// - Các task pending theo role
// - Cảnh báo hệ thống
// ============================================================

import React, { useState, useMemo } from "react";
import { useDataverse } from "@/src/context/DataverseContext";
import { AuthUser } from "@/src/services/AuthService";
import {
  Briefcase,
  Layers,
  Calendar,
  FileText,
  Users,
  Clock,
  ChevronRight,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Inbox,
  ShieldAlert,
  UserCheck,
  CheckSquare,
  History,
  BarChart3,
  Settings,
} from "lucide-react";

// ============================================================
// ĐỊNH NGHĨA PROPS
// ============================================================
interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  setSelectedAppraisalId: (id: string | null) => void;
  user: AuthUser; // Người dùng hiện tại
}

// ============================================================
// COMPONENT CHÍNH
// ============================================================
export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  setSelectedAppraisalId,
  user,
}) => {
  // Lấy dữ liệu từ DataverseContext
  const {
    cycles,
    // TODO: Thêm appraisals, users khi có
    // appraisals,
    // users,
  } = useDataverse();

  console.log("DashboardView - User:", user.name, "Role:", user.role);

  // ===== TẠM THỜI: MOCK DATA =====
  // TODO: Thay bằng dữ liệu thật từ DataverseContext
  const mockUsers: AuthUser[] = [user];
  const mockAppraisals: any[] = [];
  const safeCycles = cycles || [];
  const mockActiveCycle = safeCycles.find((c) => c.status === "Active") || null;

  // ===== STATE =====
  const [showOnlyMyWorkflow, setShowOnlyMyWorkflow] = useState(true);

  // ===== FILTER APPRAISALS =====
  const filteredAppraisals = useMemo(() => {
    if (user.role === "Employee") {
      return mockAppraisals.filter(
        (a) => a.employeeId === user.id && a.cycleId === mockActiveCycle?.id,
      );
    }
    if (user.role === "Manager") {
      const mySubordinateIds = mockUsers
        .filter((u) => u.managerId === user.id)
        .map((u) => u.id);
      return mockAppraisals.filter(
        (a) =>
          mySubordinateIds.includes(a.employeeId) &&
          a.cycleId === mockActiveCycle?.id,
      );
    }
    return mockAppraisals;
  }, [mockAppraisals, user, mockUsers, mockActiveCycle]);

  // ===== STAGE STATS =====
  const stageStats = {
    GoalSetup: filteredAppraisals.filter((a) => a.currentStage === "GoalSetup")
      .length,
    SelfAppraisal: filteredAppraisals.filter(
      (a) => a.currentStage === "SelfAppraisal",
    ).length,
    ManagerAppraisal: filteredAppraisals.filter(
      (a) => a.currentStage === "ManagerAppraisal",
    ).length,
    Calibration: filteredAppraisals.filter(
      (a) => a.currentStage === "Calibration",
    ).length,
    SignOff: filteredAppraisals.filter((a) => a.currentStage === "SignOff")
      .length,
    Completed: filteredAppraisals.filter((a) => a.currentStage === "Completed")
      .length,
  };

  // ===== OVERDUE =====
  const overdueAppraisals = mockAppraisals.filter((a) => {
    return (
      a.cycleId === mockActiveCycle?.id &&
      a.currentStage === "GoalSetup" &&
      !a.isGoalApproved
    );
  });
  const overdueCount = overdueAppraisals.length;
  const overdueEmployees = overdueAppraisals
    .map((a) => mockUsers.find((u) => u.id === a.employeeId))
    .filter((emp): emp is NonNullable<typeof emp> => !!emp);

  // ===== TASKS =====
  const getUserTasks = () => {
    const tasks: any[] = [];

    // Employee tasks
    if (user.role === "Employee") {
      const myAppraisal = mockAppraisals.find(
        (a) => a.employeeId === user.id && a.cycleId === mockActiveCycle?.id,
      );
      if (myAppraisal) {
        if (myAppraisal.currentStage === "GoalSetup") {
          tasks.push({
            id: "t_setup_goals",
            title: "Define Key Performance Goals",
            desc: "Review and define goals for H1 2024 to lock your performance metrics.",
            tab: "goals",
            priority: "High",
          });
        } else if (
          myAppraisal.currentStage === "SelfAppraisal" &&
          myAppraisal.selfAppraisal?.status === "Draft"
        ) {
          tasks.push({
            id: "t_self_app",
            title: "Complete and Submit Self-Appraisal",
            desc: "Outline your strengths, development opportunities, and blockers for H1.",
            tab: "appraisals",
            appraisalId: myAppraisal.id,
            priority: "Critical",
          });
        } else if (
          myAppraisal.currentStage === "SignOff" &&
          !myAppraisal.signOff?.employeeSigned
        ) {
          tasks.push({
            id: "t_signoff",
            title: "Complete Digital Sign-off",
            desc: "Review your calibrated evaluation report, provide final reflections, and sign.",
            tab: "appraisals",
            appraisalId: myAppraisal.id,
            priority: "Critical",
          });
        }
      }
    }

    // Manager tasks
    if (user.role === "Manager") {
      const subordinates = mockUsers.filter((u) => u.managerId === user.id);
      subordinates.forEach((sub) => {
        const subApp = mockAppraisals.find(
          (a) => a.employeeId === sub.id && a.cycleId === mockActiveCycle?.id,
        );
        if (subApp) {
          if (subApp.currentStage === "GoalSetup" && !subApp.isGoalApproved) {
            tasks.push({
              id: `t_app_g_${sub.id}`,
              title: `Approve Objectives: ${sub.name}`,
              desc: `Review custom KPIs proposed by ${sub.name} for the active cycle.`,
              tab: "goals",
              priority: "High",
            });
          } else if (
            subApp.currentStage === "ManagerAppraisal" &&
            subApp.managerAppraisal?.status === "Draft"
          ) {
            tasks.push({
              id: `t_mgr_a_${sub.id}`,
              title: `Complete Evaluation: ${sub.name}`,
              desc: `Assess strengths, score competencies (30%), and provide justification.`,
              tab: "appraisals",
              appraisalId: subApp.id,
              priority: "Critical",
            });
          }
        }
      });
    }

    // HR tasks
    if (user.role === "HR") {
      const draftCycles = safeCycles.filter((c) => c.status === "Draft");
      if (draftCycles.length > 0) {
        tasks.push({
          id: "t_hr_p",
          title: "Activate Pending Appraisals Cycle",
          desc: "Annual Leadership Assessment is currently in Draft. Confirm weights to activate.",
          tab: "cycles",
          priority: "High",
        });
      }

      const calibCount = mockAppraisals.filter(
        (a) => a.currentStage === "Calibration",
      ).length;
      if (calibCount > 0) {
        tasks.push({
          id: "t_hr_cal",
          title: "Calibrate Score Cohorts",
          desc: `${calibCount} appraisals are waiting in the Calibration Room for bell parity checks.`,
          tab: "calibration",
          priority: "Critical",
        });
      }
    }

    // SeniorManager tasks
    if (user.role === "SeniorManager") {
      mockAppraisals.forEach((subApp) => {
        if (
          subApp.cycleId === mockActiveCycle?.id &&
          subApp.currentStage === "SignOff" &&
          subApp.signOff?.employeeSigned &&
          !subApp.signOff?.managerSigned
        ) {
          const subUser = mockUsers.find((u) => u.id === subApp.employeeId);
          tasks.push({
            id: `t_sl_seal_${subApp.id}`,
            title: `Executive Sealing: ${subUser?.name || "Employee"}`,
            desc: `Review final validated metrics, affix Executive digital seal and formally close appraisal package.`,
            tab: "appraisals",
            appraisalId: subApp.id,
            priority: "Critical",
          });
        }
      });
    }

    return tasks;
  };

  const currentTasks = getUserTasks();

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* ===== WELCOME BANNER ===== */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 filter blur-[1px]">
          <Briefcase size={220} className="text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <p className="text-blue-400 text-xs uppercase font-bold tracking-widest font-mono">
            Ecosystem Dashboard
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Performance Appraisal System
          </h2>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Welcome back,{" "}
            <span className="text-white font-bold">{user.name}</span>. You are
            operating in the{" "}
            <span className="text-white bg-slate-800 px-2 py-0.5 rounded text-xs font-mono border border-slate-700">
              {mockActiveCycle ? mockActiveCycle.name : "No Active Cycle"}
            </span>
            .
          </p>
          <p className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded inline-block mt-2">
            Version: {new Date().toLocaleDateString("en-GB")}{" "}
            {new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* ===== CRITICAL ALERT BANNER ===== */}
      {currentTasks.length > 0 && (
        <div
          onClick={() => {
            const firstTask = currentTasks[0];
            if (firstTask?.appraisalId) {
              setSelectedAppraisalId(firstTask.appraisalId);
            }
            setActiveTab(firstTask.tab);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-lg border border-indigo-500 animate-in slide-in-from-top-4 duration-500 flex items-center justify-between cursor-pointer group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-lg border border-white/20">
              <ShieldAlert size={22} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">
                System Workflow Action Required
              </h4>
              <p className="text-[11px] text-indigo-50 opacity-90 italic">
                Bạn có {currentTasks.length} tác vụ đang chờ xử lý trong chu kỳ
                hiện tại.
              </p>
              <p className="text-[11px] text-indigo-50 opacity-80 uppercase font-mono tracking-tighter">
                Status: {currentTasks.length} Pending Assignments detected in
                Matrix Workbench.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1.5 rounded border border-white/10">
              Proceed to Registry
            </span>
            <ArrowRight
              size={18}
              className="text-white group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      )}

      {/* ===== WORKFLOW STATS ===== */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          Workflow Status Funnel
        </h3>
        <div
          className={`grid grid-cols-2 ${mockActiveCycle?.peerFeedbackEnabled ? "lg:grid-cols-6" : "lg:grid-cols-6"} gap-4`}
        >
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              Goal Setup
            </p>
            <p className="text-2xl font-bold text-slate-700 mt-1">
              {stageStats.GoalSetup}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              Self Appr.
            </p>
            <p className="text-2xl font-bold text-slate-700 mt-1">
              {stageStats.SelfAppraisal}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              Mgr Appr.
            </p>
            <p className="text-2xl font-bold text-slate-700 mt-1">
              {stageStats.ManagerAppraisal}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              Calibration
            </p>
            <p className="text-2xl font-bold text-slate-700 mt-1">
              {stageStats.Calibration}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs bg-blue-50/20 border-blue-105">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Sign-Off
            </p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {stageStats.SignOff}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs bg-emerald-50/20 border-emerald-100">
            <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-widest">
              Completed
            </p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">
              {stageStats.Completed}
            </p>
          </div>
        </div>
      </section>

      {/* ===== KPI METRICS ===== */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          Dashboard Key Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Employees", value: mockUsers.length },
            {
              label: "Active Cycles",
              value: safeCycles.filter((c) => c.status === "Active").length,
            },
            {
              label: "Pending Reviews",
              value: mockAppraisals.filter(
                (a) => a.currentStage !== "Completed",
              ).length,
            },
            {
              label: "Completion Rate",
              value: `${((mockAppraisals.filter((a) => a.currentStage === "Completed").length / (mockAppraisals.length || 1)) * 100).toFixed(0)}%`,
            },
            { label: "Avg. Rating", value: "4.2" },
          ].map((kpi, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-slate-200"
            >
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-slate-700">{kpi.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===== TASKS ===== */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Inbox size={16} className="text-blue-900" /> Pending Action Tasks
            </h3>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
              {currentTasks.length} Assigned
            </span>
          </div>

          {currentTasks.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              <Clock size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">
                Workspace completely empty.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toggle actor role in top bar to reveal specific action cards.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentTasks.map((task, idx) => {
                const isCritical = task.priority === "Critical";
                const isHigh = task.priority === "High";

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-l-8 animate-in fade-in slide-in-from-left-2 duration-300 ${
                      isCritical
                        ? "bg-rose-600 text-white border-rose-800"
                        : isHigh
                          ? "bg-amber-500 text-white border-amber-700"
                          : "bg-indigo-600 text-white border-indigo-800"
                    }`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl border ${
                            isCritical
                              ? "bg-rose-700 border-rose-500"
                              : isHigh
                                ? "bg-amber-600 border-amber-400"
                                : "bg-indigo-700 border-indigo-500"
                          }`}
                        >
                          <ShieldAlert size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 font-mono">
                            Priority: {task.priority}
                          </p>
                          <h4 className="text-[13px] font-bold tracking-tight leading-tight">
                            {task.title}
                          </h4>
                        </div>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed font-medium md:pl-11">
                        {task.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (task.appraisalId) {
                          setSelectedAppraisalId(task.appraisalId);
                        }
                        setActiveTab(task.tab);
                      }}
                      className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl border shadow-lg transition-all cursor-pointer whitespace-nowrap self-end md:self-auto active:scale-95 group ${
                        isCritical
                          ? "bg-white text-rose-600 border-rose-50 hover:bg-rose-50"
                          : isHigh
                            ? "bg-white text-amber-600 border-amber-50 hover:bg-amber-50"
                            : "bg-white text-indigo-600 border-indigo-50 hover:bg-indigo-50"
                      }`}
                    >
                      Process Now{" "}
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== SIDEBAR PANEL ===== */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Review Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                Review Parameters
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                Active
              </span>
            </div>

            {mockActiveCycle ? (
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">
                    {mockActiveCycle.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Period: {mockActiveCycle.startDate} to{" "}
                    {mockActiveCycle.endDate}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-medium text-slate-500">
                    <span>Performance Rating Scale</span>
                    <span className="text-slate-850 font-bold">1 to 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <div
                        key={val}
                        className="bg-slate-50 hover:bg-blue-50 text-[10px] font-bold text-slate-600 hover:text-blue-900 py-1.5 rounded text-center border border-slate-205 cursor-help transition-all"
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Evaluation Weight Rules
                    </span>
                    <span className="text-slate-850 font-bold">
                      Goals focus
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold text-blue-900">
                      Goals ({mockActiveCycle.goalWeighting}%)
                    </span>
                    <div className="flex-1 bg-slate-250 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-900 h-2"
                        style={{ width: `${mockActiveCycle.goalWeighting}%` }}
                      />
                      <div
                        className="bg-blue-400 h-2"
                        style={{
                          width: `${100 - mockActiveCycle.goalWeighting}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-blue-500">
                      Comp ({100 - mockActiveCycle.goalWeighting}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active cycle. Login as HR BP to configure one.
              </div>
            )}
          </div>

          {/* System Warnings */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                System Warnings
              </span>
              {overdueCount > 0 ? (
                <span className="bg-red-50 text-red-805 border border-red-105 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase animate-pulse">
                  Alert
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  Nominal
                </span>
              )}
            </div>

            <div className="p-4 space-y-3 font-sans">
              {overdueEmployees.length > 0 ? (
                overdueEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-start gap-2.5 text-xs text-red-800 bg-red-50/50 border border-red-100 p-3 rounded-lg"
                  >
                    <AlertOctagon
                      size={16}
                      className="text-red-700 shrink-0 mt-0.5"
                    />
                    <div className="space-y-1">
                      <span className="font-bold">Overdue Goal Setup</span>
                      <p className="text-[10px] text-red-700 leading-relaxed">
                        {emp.name} is{" "}
                        <span className="font-bold underline">overdue</span> for
                        H1 cycle goal setup. Email pinged.
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <UserCheck
                    size={16}
                    className="text-slate-500 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    <span className="font-bold">All Cycle Milestones Met</span>
                    <p className="text-[10px] text-slate-550 leading-relaxed">
                      No active milestones are currently overdue across cohort
                      groups.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50/45 border border-amber-100 p-3 rounded-lg">
                <ShieldAlert
                  size={16}
                  className="text-amber-700 shrink-0 mt-0.5"
                />
                <div className="space-y-1">
                  <span className="font-bold">
                    Scale Rating Inflation Warning
                  </span>
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Automatic auditing flags potential rating inflation in the
                    Design Cohort. Calibration checks required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
