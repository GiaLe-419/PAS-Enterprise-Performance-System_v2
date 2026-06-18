// src/App.tsx
import React, { useState } from "react";
import { DataverseProvider } from "./context/DataverseContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { CycleManagementView } from "./components/CycleManagementView";
import { GoalManagementView } from "./components/GoalManagementView"; // ✅ THÊM IMPORT
import { LoginView } from "./components/LoginView";
import { useDataverse } from "./context/DataverseContext";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(
    null,
  );

  const { currentUser, isAuthenticated, logout } = useDataverse();

  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header user={currentUser} onLogout={logout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "dashboard" && (
            <DashboardView
              setActiveTab={setActiveTab}
              setSelectedAppraisalId={setSelectedAppraisalId}
              user={currentUser}
            />
          )}
          {activeTab === "cycles" && <CycleManagementView user={currentUser} />}

          {/* ✅ THÊM GOALS ROUTE */}
          {activeTab === "goals" && <GoalManagementView user={currentUser} />}

          {/* ✅ CÁC ROUTE KHÁC (sẽ thêm sau) */}
          {/* {activeTab === "appraisals" && <AppraisalWorkflowView ... />} */}
          {/* {activeTab === "calibration" && <CalibrationView ... />} */}
          {/* {activeTab === "analytics" && <AnalyticsView ... />} */}
          {/* {activeTab === "audits" && <AuditLogView ... />} */}
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
