// src/components/CycleManagementView.tsx
// ============================================================
// MÀN HÌNH QUẢN LÝ CHU KỲ ĐÁNH GIÁ
// ============================================================
// Mục đích: Cho phép HR quản lý các chu kỳ đánh giá
// - Xem danh sách cycles từ Dataverse
// - Tạo cycle mới
// - Active/Close cycle
// - Xóa cycle
// ============================================================

import React, { useState, useEffect } from "react";
import { useCycles } from "@/src/hooks/useCycles";
import { AuthUser } from "@/src/generated/services/AuthService";
import {
  Layers,
  Plus,
  Check,
  Play,
  Square,
  Scale,
  Star,
  Sliders,
  Calendar,
  AlertCircle,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

// ============================================================
// ĐỊNH NGHĨA PROPS
// ============================================================
interface CycleManagementViewProps {
  user: AuthUser; // Người dùng hiện tại
}

// ============================================================
// COMPONENT CHÍNH
// ============================================================
export const CycleManagementView: React.FC<CycleManagementViewProps> = ({
  user,
}) => {
  // Sử dụng hook useCycles
  const {
    cycles,
    loading,
    error,
    loadCycles,
    createCycle,
    updateCycleStatus,
    deleteCycle,
  } = useCycles(user?.id, user?.email);

  // ===== STATE =====
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== STATE CHO POPUP XÓA =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"Mid-Year" | "End-Year">("Mid-Year");
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(
    `${new Date().getFullYear()}-07-01`,
  );
  const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-12-31`);
  const [goalsWeight, setGoalsWeight] = useState(70);
  const [peerEnabled, setPeerEnabled] = useState(false);

  // Validations
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ===== KIỂM TRA QUYỀN HR =====
  const isHR = user.role === "HR" || user.role === "SeniorManager";

  // ===== LOAD CYCLES =====
  useEffect(() => {
    loadCycles();
  }, []);

  // ============================================================
  // MỞ POPUP XÓA
  // ============================================================
  const openDeleteModal = (id: string, name: string) => {
    console.log("Mo popup xoa cycle:", name);
    setCycleToDelete({ id, name });
    setShowDeleteModal(true);
  };

  // ============================================================
  // ĐÓNG POPUP XÓA
  // ============================================================
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCycleToDelete(null);
    setIsDeleting(false);
  };

  // ============================================================
  // XỬ LÝ XÓA CYCLE
  // ============================================================
  const handleConfirmDelete = async () => {
    if (!cycleToDelete) return;

    console.log("Xoa cycle:", cycleToDelete.id);
    setIsDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await deleteCycle(cycleToDelete.id);
      setSuccessMsg("Cycle deleted successfully!");
      console.log("Xoa cycle thanh cong");
      closeDeleteModal();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Loi xoa cycle:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to delete cycle",
      );
      setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setIsDeleting(false);
    }
  };
  // ============================================================
  // XỬ LÝ TẠO CYCLE
  // ============================================================
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Bat dau tao cycle moi tu UI");

    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    // Validation
    if (!name.trim()) {
      setErrorMsg("Please enter a descriptive cycle label.");
      setIsSubmitting(false);
      return;
    }

    if (!startDate || !endDate) {
      setErrorMsg("Please select both start and end dates.");
      setIsSubmitting(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      setErrorMsg("End date must be after start date.");
      setIsSubmitting(false);
      return;
    }

    if (year < 2000 || year > 2100) {
      setErrorMsg("Year must be between 2000 and 2100.");
      setIsSubmitting(false);
      return;
    }

    if (goalsWeight < 0 || goalsWeight > 100) {
      setErrorMsg("Goal weighting must be between 0 and 100.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Du lieu cycle:", {
        name,
        type,
        year,
        startDate,
        endDate,
        goalsWeight,
        peerEnabled,
      });

      await createCycle({
        name: name.trim(),
        type,
        year: Number(year),
        startDate,
        endDate,
        goalWeighting: goalsWeight,
        peerFeedbackEnabled: peerEnabled,
      });

      // Reset form
      setIsCreating(false);
      setName("");
      setErrorMsg("");
      setSuccessMsg("Cycle created successfully!");
      console.log("Tao cycle thanh cong");

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Loi tao cycle:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to create cycle",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // XỬ LÝ CẬP NHẬT TRẠNG THÁI
  // ============================================================
  const handleUpdateStatus = async (
    id: string,
    status: "Active" | "Closed",
  ) => {
    console.log("Cap nhat status cycle", id, "thanh", status);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await updateCycleStatus(id, status);
      const message =
        status === "Active"
          ? "Cycle activated successfully!"
          : "Cycle closed successfully!";
      setSuccessMsg(message);
      console.log(message);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Loi cap nhat status:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to update cycle status",
      );
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  // Nếu không phải HR, hiển thị thông báo không có quyền
  if (!isHR) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h3 className="text-red-800 font-bold">Access Denied</h3>
          <p className="text-red-600 text-sm mt-1">
            Only HR and Senior Manager can manage appraisal cycles.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Your role: <strong>{user.role}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* ===== TITLE BLOCK ===== */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="text-blue-900" size={20} /> Appraisal Cycle
            Configuration Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure and activate multi-role performance review windows
            cross-enterprise.
            {loading && (
              <span className="ml-2 text-blue-600">(Loading...)</span>
            )}
          </p>
        </div>
        {isHR && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} /> Create New Cycle
          </button>
        )}
      </section>

      {/* ===== MESSAGES ===== */}
      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 flex items-center gap-2 text-xs">
          <AlertCircle size={16} className="text-red-700" /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100 flex items-center gap-2 text-xs">
          <Check size={16} className="text-emerald-700" /> {successMsg}
        </div>
      )}
      {error && !errorMsg && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 flex items-center gap-2 text-xs">
          <AlertCircle size={16} className="text-red-700" /> {error}
          <button
            onClick={loadCycles}
            className="ml-auto text-blue-600 hover:text-blue-800 font-bold"
          >
            Retry
          </button>
        </div>
      )}
      {showDeleteModal && cycleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Confirm Deletion
                </h3>
              </div>
              <button
                onClick={closeDeleteModal}
                className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"
                disabled={isDeleting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to delete this appraisal cycle?
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-800">
                  {cycleToDelete.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  This action cannot be undone. All related data will be
                  permanently removed.
                </p>
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">{errorMsg}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Cycle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== MAIN SETUP AREA ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===== LEFT COLUMN ===== */}
        <div className="lg:col-span-8 space-y-6">
          {/* ===== CREATE FORM ===== */}
          {isCreating ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">
                Create Performance Cycle
              </h3>

              <form
                onSubmit={handleCreate}
                className="space-y-4 text-xs font-sans"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Cycle Label Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., FY24 Mid-Year Review"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2.5 outline-none font-medium"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">
                        Type
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium outline-none"
                        disabled={isSubmitting}
                      >
                        <option value="Mid-Year">Mid-Year</option>
                        <option value="End-Year">End-Year</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">
                        Year
                      </label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium outline-none"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Workflow Open Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium font-mono outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Workflow Closing Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium font-mono outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Score Config */}
                <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-700">
                      Configurable Weight Ratio Score
                    </span>
                    <span className="font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-105">
                      Goals: {goalsWeight}% / Competencies: {100 - goalsWeight}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-500">
                      Scale Balance:
                    </span>
                    <input
                      type="range"
                      min="30"
                      max="80"
                      step="5"
                      value={goalsWeight}
                      onChange={(e) => setGoalsWeight(Number(e.target.value))}
                      className="flex-1 accent-blue-900 cursor-pointer"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Business Rule: Enforce that Goals (KPIs) weight and core
                    Competencies (soft skills) weight sum directly to 100%.
                  </p>
                </div>

                {/* Peer Feedback */}
                <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">
                      Include Anonymous Peer Feedback Stage
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={peerEnabled}
                        onChange={(e) => setPeerEnabled(e.target.checked)}
                        className="sr-only peer"
                        disabled={isSubmitting}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-900"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Enabling this adds an anonymous 360-degree peer feedback
                    stage between Self-Appraisal and Manager Review.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-lg hover:shadow-xs transition-all cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Creating..."
                      : "Activate Templates and Save"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ===== CYCLES LIST ===== */
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">
                    Appraisal Cycles Registry
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {cycles.length} cycles
                  </span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-slate-400">
                    Loading cycles...
                  </div>
                ) : cycles.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Calendar
                      size={32}
                      className="mx-auto text-slate-300 mb-2"
                    />
                    <p className="text-xs">No cycles found</p>
                    <p className="text-[10px] mt-1">
                      Create your first cycle to get started
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto select-text">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider border-b border-slate-205 text-[10px] font-bold">
                          <th className="px-5 py-3">Cycle Name</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3 text-center">Year</th>
                          <th className="px-4 py-3">Timeline</th>
                          <th className="px-4 py-3 text-center">
                            Peer Feedback
                          </th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {cycles.map((cycle) => (
                          <tr
                            key={cycle.id}
                            className="hover:bg-slate-50 transition-all font-medium text-slate-700"
                          >
                            <td className="px-5 py-4">
                              <span className="font-bold text-slate-800 block text-xs">
                                {cycle.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Ratio: {cycle.goalWeighting}:
                                {100 - cycle.goalWeighting} Goals focus
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-505">
                              {cycle.type}
                            </td>
                            <td className="px-4 py-4 text-center text-slate-505">
                              {cycle.year}
                            </td>
                            <td className="px-4 py-4 font-mono text-[11px] text-slate-505">
                              {cycle.startDate} to {cycle.endDate}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {isHR ? (
                                <div className="flex items-center justify-center">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={cycle.peerFeedbackEnabled}
                                      onChange={() => {
                                        // TODO: Implement togglePeerFeedback
                                        // togglePeerFeedbackEnabled(cycle.id);
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-900"></div>
                                  </label>
                                </div>
                              ) : (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    cycle.peerFeedbackEnabled
                                      ? "bg-purple-50 text-purple-800 border border-purple-105"
                                      : "bg-slate-50 text-slate-400 border border-slate-150"
                                  }`}
                                >
                                  {cycle.peerFeedbackEnabled ? "Active" : "Off"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  cycle.status === "Active"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                                    : cycle.status === "Closed"
                                      ? "bg-slate-100 text-slate-500 border border-slate-200"
                                      : "bg-amber-50 text-amber-800 border border-amber-100"
                                }`}
                              >
                                {cycle.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {isHR ? (
                                <div className="flex justify-end gap-1.5">
                                  {cycle.status === "Draft" && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(cycle.id, "Active")
                                      }
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Play size={10} /> Activate
                                    </button>
                                  )}
                                  {cycle.status === "Active" && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(cycle.id, "Closed")
                                      }
                                      className="bg-slate-500 hover:bg-slate-650 text-white font-bold px-2 py-1 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Square size={10} /> Close
                                    </button>
                                  )}
                                  {cycle.status === "Closed" && (
                                    <span className="text-[10px] font-mono text-slate-400 mr-2 uppercase tracking-wide">
                                      Archived
                                    </span>
                                  )}
                                  {cycle.status !== "Active" && (
                                    <button
                                      onClick={() =>
                                        openDeleteModal(cycle.id, cycle.name)
                                      }
                                      className="text-red-600 hover:text-red-800 text-[10px] font-bold transition-colors"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  No access
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Weight Config */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2">
                <Sliders size={16} className="text-blue-900" /> Active Weights
                Logic
              </span>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Objective Goals weight</span>
                  <span>70%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-900 h-full"
                    style={{ width: "70%" }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Goals scored directly against dynamic key performance metrics
                  of employee targets.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Core Competencies weight</span>
                  <span>30%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-400 h-full"
                    style={{ width: "30%" }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Leadership, collaboration, communication, innovation, and
                  general standards scores.
                </p>
              </div>
            </div>
          </div>

          {/* Rating Scale */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2">
                <Scale size={16} className="text-blue-900" /> Organizational
                Scale
              </span>
              <span className="bg-red-50 text-red-900 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                Locked
              </span>
            </div>
            <div className="p-4 space-y-2 text-xs">
              <p className="text-[10px] text-slate-400 mb-2">
                Standardized 1-5 Performance scale used for multi-cohort
                calibration alignment exercises.
              </p>
              <div className="space-y-1.5">
                {[
                  {
                    val: 1,
                    label: "Needs Imp.",
                    color: "bg-red-50 text-red-900 border-red-150",
                  },
                  {
                    val: 2,
                    label: "Meets Expectations",
                    color: "bg-orange-50 text-orange-900 border-orange-150",
                  },
                  {
                    val: 3,
                    label: "Good (Exceeds)",
                    color: "bg-blue-50 text-blue-900 border-blue-105",
                  },
                  {
                    val: 4,
                    label: "Superior Achievement",
                    color: "bg-cyan-50 text-cyan-900 border-cyan-155",
                  },
                  {
                    val: 5,
                    label: "Distinguished Elite",
                    color: "bg-emerald-50 text-emerald-900 border-emerald-100",
                  },
                ].map((scale) => (
                  <div
                    key={scale.val}
                    className={`p-2 rounded-lg border flex items-center justify-between font-bold text-[10px] ${scale.color}`}
                  >
                    <span>Scale {scale.val}</span>
                    <span>{scale.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
