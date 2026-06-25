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

import React, { useState, useEffect } from "react";
import {
  DataverseProvider,
  useDataverse,
} from "@/src/context/DataverseContext";
import { LoginView } from "@/src/components/LoginView";
import { Header } from "@/src/components/Header";
import { Sidebar } from "@/src/components/Sidebar";
import { DashboardView } from "@/src/components/DashboardView";
import { CycleManagementView } from "@/src/components/CycleManagementView";
import { GoalManagementView } from "@/src/components/GoalManagementView";

// TODO: Import các component khác khi phát triển
// import { AppraisalWorkflowView } from "@/src/components/AppraisalWorkflowView";
// import { CalibrationView } from "@/src/components/CalibrationView";
// import { AnalyticsView } from "@/src/components/AnalyticsView";
// import { AuditLogView } from "@/src/components/AuditLogView";

// ============================================================
// COMPONENT HIỂN THỊ LỖI TRUY CẬP
// ============================================================
function AccessDeniedView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-bold text-red-800 mb-2">
          Không có quyền truy cập
        </h3>
        <p className="text-sm text-red-600">{message}</p>
        <button
          onClick={() => (window.location.href = "#")}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Quay lại Dashboard
        </button>
      </div>
    </div>
  );
}

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
  // RESET TAB KHI USER THAY ĐỔI (ĐĂNG NHẬP/ĐĂNG XUẤT)
  // ============================================================
  useEffect(() => {
    // Reset về dashboard mỗi khi user đăng nhập
    if (currentUser) {
      setActiveTab("dashboard");
    }
  }, [currentUser?.id]); // Chạy khi user id thay đổi

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
  // KIỂM TRA ROLE
  // ============================================================
  const isEmployee = currentUser.role === "Employee";
  const isManager =
    currentUser.role === "Manager" || currentUser.role === "SeniorManager";
  const isHR = currentUser.role === "HR";
  const isManagerOrHR = isManager || isHR;

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
          {/* Dashboard - Tất cả roles đều xem được */}
          {activeTab === "dashboard" && (
            <DashboardView
              setActiveTab={setActiveTab}
              setSelectedAppraisalId={setSelectedAppraisalId}
              user={currentUser}
            />
          )}

          {/* Quản lý mục tiêu (KPI & Goals) - Tất cả roles đều xem được */}
          {activeTab === "goals" && <GoalManagementView user={currentUser} />}

          {/* Quản lý chu kỳ - CHỈ Manager và HR */}
          {activeTab === "cycles" &&
            (isManagerOrHR ? (
              <CycleManagementView user={currentUser} />
            ) : (
              <AccessDeniedView message="Bạn không có quyền truy cập vào Quản lý chu kỳ. Tính năng này chỉ dành cho Manager và HR." />
            ))}

          {/* TODO: Thêm các tab khác khi phát triển */}
          {/* 
          {activeTab === "appraisals" && (
            <AppraisalWorkflowView
              selectedAppraisalId={selectedAppraisalId}
              setSelectedAppraisalId={setSelectedAppraisalId}
              user={currentUser}
            />
          )}
          {activeTab === "calibration" && (
            isManagerOrHR ? (
              <CalibrationView user={currentUser} />
            ) : (
              <AccessDeniedView message="Bạn không có quyền truy cập vào Hiệu chỉnh. Tính năng này chỉ dành cho Manager và HR." />
            )
          )}
          {activeTab === "analytics" && (
            isManagerOrHR ? (
              <AnalyticsView user={currentUser} />
            ) : (
              <AccessDeniedView message="Bạn không có quyền truy cập vào Phân tích. Tính năng này chỉ dành cho Manager và HR." />
            )
          )}
          {activeTab === "audits" && (
            isHR ? (
              <AuditLogView user={currentUser} />
            ) : (
              <AccessDeniedView message="Bạn không có quyền truy cập vào Nhật ký. Tính năng này chỉ dành cho HR." />
            )
          )}
          */}
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
