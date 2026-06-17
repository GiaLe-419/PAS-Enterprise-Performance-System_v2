// src/App.tsx
import React, { useState, useEffect } from "react";
import { DataverseProvider, useDataverse } from "./context/DataverseContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { CycleManagementView } from "./components/CycleManagementView";
import { GoalManagementView } from "./components/GoalManagementView";
import { AppraisalWorkflowView } from "./components/AppraisalWorkflowView";
import { CalibrationView } from "./components/CalibrationView";
import { AnalyticsView } from "./components/AnalyticsView";
import { AuditLogView } from "./components/AuditLogView";
import { LoginView } from "./components/LoginView";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(
    null,
  );

  // ✅ Lấy currentUser và logout từ DataverseContext
  const { currentUser, isAuthenticated, logout } = useDataverse();

  useEffect(() => {
    console.log("🔍 ===== APP STATE =====");
    console.log("🔍 isAuthenticated:", isAuthenticated);
    console.log("🔍 currentUser:", currentUser);
    console.log("🔍 currentUser?.id:", currentUser?.id);
    console.log("🔍 currentUser?.name:", currentUser?.name);
    console.log("🔍 currentUser?.role:", currentUser?.role);
    console.log("🔍 currentUser?.email:", currentUser?.email);
    console.log("🔍 =====================");
  }, [currentUser, isAuthenticated]);

  // Reset selected appraisal when switching user
  React.useEffect(() => {
    setSelectedAppraisalId(null);
  }, [currentUser?.id]);

  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      {/* ✅ Header nhận props */}
      <Header user={currentUser} onLogout={logout} />

      <div className="flex flex-1 overflow-hidden select-none">
        {/* ✅ Sidebar nhận props */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
        />

        {/* Central scrollable workspaces area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/45 pb-11 select-text">
          {activeTab === "dashboard" && (
            <DashboardView
              setActiveTab={setActiveTab}
              setSelectedAppraisalId={setSelectedAppraisalId}
              user={currentUser} // ✅ Thêm user
            />
          )}

          {activeTab === "cycles" && (
            <CycleManagementView user={currentUser} /> // ✅ Thêm user
          )}

          {activeTab === "goals" && (
            <GoalManagementView user={currentUser} /> // ✅ Thêm user
          )}

          {activeTab === "appraisals" && (
            <AppraisalWorkflowView
              selectedAppraisalId={selectedAppraisalId}
              setSelectedAppraisalId={setSelectedAppraisalId}
              user={currentUser} // ✅ Thêm user
            />
          )}

          {activeTab === "calibration" && (
            <CalibrationView user={currentUser} /> // ✅ Thêm user
          )}

          {activeTab === "analytics" && (
            <AnalyticsView user={currentUser} /> // ✅ Thêm user
          )}

          {activeTab === "audits" && (
            <AuditLogView user={currentUser} /> // ✅ Thêm user
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataverseProvider>
      <AppContent />
    </DataverseProvider>
  );
}
