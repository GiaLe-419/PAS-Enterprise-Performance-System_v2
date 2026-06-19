// src/App.tsx
// ============================================================
// ỨNG DỤNG CHÍNH
// ============================================================
// Mục đích: Điều hướng giữa màn hình đăng nhập và nội dung chính
// - Hiển thị loading khi kiểm tra session
// - Hiển thị LoginView nếu chưa đăng nhập
// - Hiển thị AppContent nếu đã đăng nhập
// - Quản lý các tab và điều hướng
// ============================================================

import React, { useState } from "react";
import {
  DataverseProvider,
  useDataverse,
} from "@/src/context/DataverseContext";
import { LoginView } from "@/src/components/LoginView";
import { Header } from "@/src/components/Header";
import { Sidebar } from "@/src/components/Sidebar";
import { DashboardView } from "@/src/components/DashboardView";
import { CycleManagementView } from "@/src/components/CycleManagementView";
// TODO: Import các component khác khi phát triển
// import { GoalManagementView } from "@/src/components/GoalManagementView";
// import { AppraisalWorkflowView } from "@/src/components/AppraisalWorkflowView";
// import { CalibrationView } from "@/src/components/CalibrationView";
// import { AnalyticsView } from "@/src/components/AnalyticsView";
// import { AuditLogView } from "@/src/components/AuditLogView";

// ============================================================
// NỘI DUNG CHÍNH CỦA APP
// ============================================================
function AppContent() {
  // Lấy dữ liệu từ context
  const { currentUser, isAuthenticated, isLoading, logout } = useDataverse();

  // State quản lý tab hiện tại
  const [activeTab, setActiveTab] = useState("dashboard");

  // State quản lý appraisal được chọn
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(
    null,
  );

  // ============================================================
  // HIỂN THỊ LOADING
  // ============================================================
  if (isLoading) {
    console.log("Dang kiem tra session...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-lg">Dang tai...</div>
        </div>
      </div>
    );
  }

  // ============================================================
  // HIỂN THỊ MÀN HÌNH ĐĂNG NHẬP
  // ============================================================
  if (!isAuthenticated || !currentUser) {
    console.log("Nguoi dung chua dang nhap, hien thi LoginView");
    return <LoginView />;
  }

  console.log("Nguoi dung da dang nhap:", currentUser.name);

  // ============================================================
  // HIỂN THỊ NỘI DUNG CHÍNH
  // ============================================================
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header user={currentUser} onLogout={logout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <DashboardView
              setActiveTab={setActiveTab}
              setSelectedAppraisalId={setSelectedAppraisalId}
              user={currentUser}
            />
          )}

          {/* Quản lý chu kỳ */}
          {activeTab === "cycles" && <CycleManagementView user={currentUser} />}

          {/* TODO: Thêm các tab khác khi phát triển */}
          {/* {activeTab === "goals" && <GoalManagementView user={currentUser} />} */}
          {/* {activeTab === "appraisals" && (
            <AppraisalWorkflowView
              selectedAppraisalId={selectedAppraisalId}
              setSelectedAppraisalId={setSelectedAppraisalId}
              user={currentUser}
            />
          )} */}
          {/* {activeTab === "calibration" && <CalibrationView user={currentUser} />} */}
          {/* {activeTab === "analytics" && <AnalyticsView user={currentUser} />} */}
          {/* {activeTab === "audits" && <AuditLogView user={currentUser} />} */}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// APP CHÍNH
// ============================================================
export default function App() {
  console.log("Khoi dong ung dung PAS Enterprise");
  return (
    <DataverseProvider>
      <AppContent />
    </DataverseProvider>
  );
}
