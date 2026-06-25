// src/components/GoalManagementView.tsx
// ============================================================
// MÀN HÌNH QUẢN LÝ MỤC TIÊU (GOALS) - FIXED
// ============================================================

import React, { useState, useEffect } from "react";
import { useGoals } from "@/src/hooks/useGoals";
import { useCycles } from "@/src/hooks/useCycles";
import { AuthUser } from "@/src/generated/services/AuthService";
import { New_employeesprofilesService } from "@/src/generated/services/New_employeesprofilesService";
import {
  CheckSquare,
  Plus,
  Check,
  Trash,
  AlertCircle,
  Send,
  Clock,
  Scale,
  Edit2,
  Loader2,
  XCircle,
  Calendar,
  Users,
} from "lucide-react";

// ============================================================
// ĐỊNH NGHĨA PROPS
// ============================================================
interface GoalManagementViewProps {
  user: AuthUser;
}

// ============================================================
// COMPONENT CHÍNH
// ============================================================
export const GoalManagementView: React.FC<GoalManagementViewProps> = ({
  user,
}) => {
  // Lấy active cycle
  const { getActiveCycle, cycles } = useCycles(user?.id, user?.email);
  const activeCycle = getActiveCycle();

  // ===== MANAGER STATE =====
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // ===== ROLE CHECKS =====
  const isEmployee = user.role === "Employee";
  const isManager =
    user.role === "Manager" ||
    user.role === "HR" ||
    user.role === "SeniorManager";

  // ===== XÁC ĐỊNH EMPLOYEE ID =====
  const effectiveEmployeeId = isManager
    ? selectedEmployeeId || user.id
    : user.id;

  // ===== LOAD EMPLOYEES (nếu là Manager) =====
  useEffect(() => {
    if (isManager && activeCycle?.id) {
      const loadEmployees = async () => {
        setLoadingEmployees(true);
        try {
          const result = await New_employeesprofilesService.getAll({
            filter: `_new_manager_value eq '${user.id}' and statecode eq 0`,
            select: [
              "new_employeesprofileid",
              "new_username",
              "new_email",
              "new_department",
            ],
          });
          const emps = result.data || [];
          setEmployees(emps);
          if (emps.length > 0) {
            setSelectedEmployeeId(emps[0].new_employeesprofileid);
          }
        } catch (err) {
          console.error("Loi load employees:", err);
        } finally {
          setLoadingEmployees(false);
        }
      };
      loadEmployees();
    }
  }, [isManager, activeCycle?.id, user.id]);

  // ===== DÙNG HOOK useGoals - CHỈ GỌI 1 LẦN =====
  const {
    goals,
    loading,
    error,
    loadGoals,
    createGoal,
    updateGoal,
    updateGoalStatus,
    deleteGoal,
    submitGoalsBatch,
    getTotalWeight,
    getStatusCount,
    appraisalId,
    isAppraisalLoading,
  } = useGoals(effectiveEmployeeId, activeCycle?.id || "");

  // ===== RELOAD GOALS KHI ĐỔI EMPLOYEE =====
  useEffect(() => {
    if (effectiveEmployeeId && activeCycle?.id) {
      console.log("🔄 Load goals cho employee:", effectiveEmployeeId);
      loadGoals();
    }
  }, [effectiveEmployeeId, activeCycle?.id]);

  // Debug
  useEffect(() => {
    console.log("📊 [GoalManagementView] Goals:", goals.length, "goals");
    console.log("📊 [GoalManagementView] Appraisal ID:", appraisalId);
    console.log("📊 [GoalManagementView] User:", user.name, user.role);
    console.log(
      "📊 [GoalManagementView] Effective Employee ID:",
      effectiveEmployeeId,
    );
  }, [goals, appraisalId, user, effectiveEmployeeId]);

  // ============================================================
  // STATE (giữ nguyên)
  // ============================================================
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ===== FORM STATES =====
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<
    "Technical" | "Business" | "Development" | "People"
  >("Business");
  const [target, setTarget] = useState("");
  const [targetValue, setTargetValue] = useState(100);
  const [weight, setWeight] = useState(20);
  const [evidence, setEvidence] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceName, setEvidenceName] = useState("");

  // ===== EDIT STATES =====
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<
    "Technical" | "Business" | "Development" | "People"
  >("Business");
  const [editTarget, setEditTarget] = useState("");
  const [editTargetValue, setEditTargetValue] = useState(100);
  const [editWeight, setEditWeight] = useState(20);
  const [editEvidence, setEditEvidence] = useState("");
  const [editEvidenceUrl, setEditEvidenceUrl] = useState("");
  const [editEvidenceName, setEditEvidenceName] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  // ===== BATCH REVIEW =====
  const [batchComment, setBatchComment] = useState("");
  const [batchReviewError, setBatchReviewError] = useState("");
  const [batchReviewMsg, setBatchReviewMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ===== MANAGER ACTION =====
  const [managerComments, setManagerComments] = useState<
    Record<string, string>
  >({});
  const [managerErrors, setManagerErrors] = useState<Record<string, string>>(
    {},
  );

  // ===== STATS =====
  const totalWeight = getTotalWeight();
  const countDraft = getStatusCount("Draft");
  const countPending = getStatusCount("Pending Approval");
  const countRevision = getStatusCount("Revision Required");
  const countApproved = getStatusCount("Approved");
  const countRejected = getStatusCount("Rejected");

  // ============================================================
  // HANDLERS (giữ nguyên)
  // ============================================================
  const handleCreateGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    if (!title.trim()) {
      setErrorMsg("Please enter a goal title");
      setIsSubmitting(false);
      return;
    }

    if (weight <= 0 || weight > 100) {
      setErrorMsg("Weight must be between 1 and 100");
      setIsSubmitting(false);
      return;
    }

    if (totalWeight + weight > 100) {
      setErrorMsg(`Total weight would exceed 100% (Current: ${totalWeight}%)`);
      setIsSubmitting(false);
      return;
    }

    if (!activeCycle) {
      setErrorMsg("No active cycle found");
      setIsSubmitting(false);
      return;
    }

    try {
      await createGoal({
        title: title.trim(),
        description: description.trim(),
        weight: Math.floor(weight),
        category,
        target: target.trim(),
        targetValue: Number(targetValue),
        actualValue: 0,
        evidence: evidence.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
        evidenceName: evidenceName.trim() || undefined,
        employeeId: user.id,
        cycleId: activeCycle.id,
      });

      setIsCreating(false);
      resetForm();
      setSuccessMsg("Goal created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Business");
    setTarget("");
    setTargetValue(100);
    setWeight(20);
    setEvidence("");
    setEvidenceUrl("");
    setEvidenceName("");
  };

  const startEditing = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description || "");
    setEditCategory(goal.category);
    setEditTarget(goal.target);
    setEditTargetValue(goal.targetValue);
    setEditWeight(goal.weight);
    setEditEvidence(goal.evidence || "");
    setEditEvidenceUrl(goal.evidenceUrl || "");
    setEditEvidenceName(goal.evidenceName || "");
    setEditErrorMsg("");
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
  };

  const handleSaveEdit = async (goalId: string) => {
    setEditErrorMsg("");

    if (!editTitle.trim()) {
      setEditErrorMsg("Title is required");
      return;
    }

    if (editWeight <= 0 || editWeight > 100) {
      setEditErrorMsg("Weight must be between 1 and 100");
      return;
    }

    const curGoal = goals.find((g) => g.id === goalId);
    if (!curGoal) return;

    const proposedTotal = totalWeight - curGoal.weight + editWeight;
    if (proposedTotal > 100) {
      setEditErrorMsg(
        `Total weight would exceed 100% (Would be: ${proposedTotal}%)`,
      );
      return;
    }

    try {
      await updateGoal(goalId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        target: editTarget.trim(),
        targetValue: Number(editTargetValue),
        weight: Math.floor(editWeight),
        evidence: editEvidence.trim(),
        evidenceUrl: editEvidenceUrl.trim() || undefined,
        evidenceName: editEvidenceName.trim() || undefined,
        status: "Draft",
      });

      setEditingGoalId(null);
      setSuccessMsg("Goal updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setEditErrorMsg("Failed to update goal");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      await deleteGoal(id);
      setSuccessMsg("Goal deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete goal");
    }
  };

  const handleEmployeeSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await submitGoalsBatch();
      setSuccessMsg("Goals submitted for approval successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to submit goals",
      );
    }
  };

  const handleBatchReview = async (
    action: "approve" | "revision" | "reject",
  ) => {
    setBatchReviewError("");
    setBatchReviewMsg(null);

    const pendingGoals = goals.filter((g) => g.status === "Pending Approval");
    if (pendingGoals.length === 0) {
      setBatchReviewError("No goals pending approval");
      return;
    }

    if (action !== "approve" && !batchComment.trim()) {
      setBatchReviewError("Comment is required for revision or rejection");
      return;
    }

    try {
      const statusMap = {
        approve: "Approved" as const,
        revision: "Revision Required" as const,
        reject: "Rejected" as const,
      };

      for (const goal of pendingGoals) {
        await updateGoalStatus(
          goal.id,
          statusMap[action],
          batchComment.trim() || "Batch processed by manager.",
        );
      }

      setBatchComment("");
      setBatchReviewMsg({
        type: "success",
        text: `Batch ${action === "approve" ? "approved" : action === "revision" ? "revision requested" : "rejected"} successfully!`,
      });
      setTimeout(() => setBatchReviewMsg(null), 3000);
    } catch (err) {
      setBatchReviewError("Failed to process batch");
    }
  };

  const handleManagerAction = async (
    goalId: string,
    action: "approve" | "revision" | "reject",
  ) => {
    setManagerErrors((prev) => ({ ...prev, [goalId]: "" }));

    const comment = managerComments[goalId] || "";
    if (action !== "approve" && !comment.trim()) {
      setManagerErrors((prev) => ({
        ...prev,
        [goalId]: "Comment is required for revision or rejection",
      }));
      return;
    }

    try {
      const statusMap = {
        approve: "Approved" as const,
        revision: "Revision Required" as const,
        reject: "Rejected" as const,
      };
      await updateGoalStatus(
        goalId,
        statusMap[action],
        comment.trim() || "Approved by manager.",
      );
      setManagerComments((prev) => ({ ...prev, [goalId]: "" }));
      setManagerErrors((prev) => ({ ...prev, [goalId]: "" }));
      setSuccessMsg(
        `Goal ${action === "approve" ? "approved" : action === "revision" ? "revision requested" : "rejected"} successfully!`,
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setManagerErrors((prev) => ({
        ...prev,
        [goalId]: "Failed to process action",
      }));
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (!activeCycle) {
    return (
      <div className="p-6 text-center text-slate-400">
        <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Active Cycle</h3>
        <p className="text-xs text-slate-500 mt-1">
          Please wait for HR to activate a cycle before creating goals.
        </p>
      </div>
    );
  }

  // ============================================================
  // MANAGER VIEW
  // ============================================================
  if (isManager) {
    if (loadingEmployees) {
      return (
        <div className="text-center py-12">
          <Loader2 size={32} className="animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-400 mt-2">Loading employees...</p>
        </div>
      );
    }

    if (employees.length === 0) {
      return (
        <div className="p-6 text-center text-slate-400 max-w-2xl mx-auto">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            No Employees Assigned
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            You don't have any employees assigned to review.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
        {/* Debug Panel */}
        <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 text-[10px] font-mono overflow-auto">
          <details>
            <summary className="font-bold cursor-pointer text-slate-600">
              🔍 Debug
            </summary>
            <div className="mt-2 space-y-1">
              <p>
                <strong>Manager:</strong> {user.name} ({user.role})
              </p>
              <p>
                <strong>Selected Employee:</strong>{" "}
                {employees.find(
                  (e) => e.new_employeesprofileid === selectedEmployeeId,
                )?.new_username || "None"}
              </p>
              <p>
                <strong>Appraisal ID:</strong> {appraisalId || "Loading..."}
              </p>
              <p>
                <strong>Goals Count:</strong> {goals.length}
              </p>
              <p>
                <strong>Loading:</strong> {loading ? "Yes" : "No"}
              </p>
            </div>
          </details>
        </div>

        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="text-blue-900" size={24} /> Team Goals Review
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review and approve goals submitted by your team.
            </p>
          </div>
        </section>

        {/* Employee Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="text-sm font-bold text-slate-700 shrink-0 flex items-center gap-2">
              <Users size={16} /> Select Employee:
            </label>
            <select
              value={selectedEmployeeId || ""}
              onChange={(e) => {
                setSelectedEmployeeId(e.target.value);
              }}
              className="w-full sm:w-64 border border-slate-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
            >
              {employees.map((emp) => (
                <option
                  key={emp.new_employeesprofileid}
                  value={emp.new_employeesprofileid}
                >
                  {emp.new_username}{" "}
                  {emp.new_department ? `(${emp.new_department})` : ""}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              {goals.length} goal(s) for{" "}
              {employees.find(
                (e) => e.new_employeesprofileid === selectedEmployeeId,
              )?.new_username || "selected"}
            </span>
          </div>
        </div>

        {/* Cycle Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-blue-900 shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
                Active Cycle
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeCycle.name} ({activeCycle.type})
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
            {activeCycle.status}
          </span>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">{successMsg}</p>
          </div>
        )}

        {/* Workflow Progress */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono text-center">
          {[
            { label: "Draft", count: countDraft },
            { label: "Pending", count: countPending },
            { label: "Revision", count: countRevision },
            { label: "Approved", count: countApproved },
            { label: "Rejected", count: countRejected },
          ].map((step) => (
            <div
              key={step.label}
              className="bg-white border rounded-xl p-2.5 flex flex-col justify-center items-center"
            >
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                {step.label}
              </span>
              <span className="text-xl font-black mt-1">{step.count}</span>
            </div>
          ))}
        </section>

        {/* Goals List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2
                size={24}
                className="animate-spin mx-auto text-blue-600"
              />
              <p className="text-xs text-slate-400 mt-2">Loading...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="bg-slate-50/50 border border-slate-200.5 rounded-2xl p-12 text-center">
              <CheckSquare
                size={48}
                className="mx-auto text-slate-300 mb-2.5"
              />
              <h4 className="text-sm font-bold text-slate-800">No goals</h4>
              <p className="text-xs text-slate-400">
                No goals to review for this employee.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {goals.map((goal) => {
                const statusColors: Record<string, string> = {
                  Draft: "bg-slate-100 text-slate-700 border-slate-250",
                  "Pending Approval":
                    "bg-blue-50 text-blue-800 border-blue-200",
                  "Revision Required":
                    "bg-amber-50 text-amber-800 border-amber-200",
                  Approved: "bg-emerald-50 text-emerald-800 border-emerald-250",
                  Rejected: "bg-red-50 text-red-800 border-red-200",
                };

                return (
                  <div
                    key={goal.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs"
                  >
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 flex-wrap">
                      <span className="bg-blue-50/50 border border-blue-100/50 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-md font-mono uppercase">
                        {goal.category}
                      </span>
                      <span
                        className={`text-[10px] font-black border uppercase px-2.5 py-0.5 rounded-xl font-mono ${statusColors[goal.status]}`}
                      >
                        ● {goal.status}
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-black px-2.5 py-0.5 rounded-md border border-indigo-200">
                        Weight: {goal.weight}%
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-slate-600/90 mt-1">
                        {goal.description}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs mt-3">
                      <span className="font-bold uppercase text-slate-400 text-[9px] font-mono block">
                        Target
                      </span>
                      <p className="font-extrabold text-blue-900">
                        {goal.target}
                      </p>
                      <div className="flex justify-between bg-white border border-slate-200/50 p-2 rounded-lg mt-2 font-mono text-[11px]">
                        <span>
                          Threshold: <strong>{goal.targetValue}</strong>
                        </span>
                        <span>
                          Updated:{" "}
                          {new Date(goal.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Manager Actions */}
                    {goal.status === "Pending Approval" && (
                      <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Comment..."
                          value={managerComments[goal.id] || ""}
                          onChange={(e) =>
                            setManagerComments((prev) => ({
                              ...prev,
                              [goal.id]: e.target.value,
                            }))
                          }
                          className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs w-full sm:w-auto"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() =>
                              handleManagerAction(goal.id, "approve")
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleManagerAction(goal.id, "revision")
                            }
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]"
                          >
                            Revise
                          </button>
                          <button
                            onClick={() =>
                              handleManagerAction(goal.id, "reject")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]"
                          >
                            Reject
                          </button>
                        </div>
                        {managerErrors[goal.id] && (
                          <p className="text-red-600 text-[10px]">
                            {managerErrors[goal.id]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Batch Review */}
        {goals.filter((g) => g.status === "Pending Approval").length > 0 && (
          <section className="bg-slate-50 border border-slate-200.5 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <CheckSquare className="text-blue-900 shrink-0" size={18} />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide font-mono">
                Batch Review
              </h3>
            </div>

            {batchReviewMsg && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                  batchReviewMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                <AlertCircle size={16} /> <span>{batchReviewMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 font-mono">
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Feedback for all pending goals..."
                value={batchComment}
                onChange={(e) => {
                  setBatchComment(e.target.value);
                  setBatchReviewError("");
                }}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs"
                rows={2}
              />
              {batchReviewError && (
                <p className="text-red-600 text-[11px] font-bold mt-1">
                  {batchReviewError}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBatchReview("approve")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-5 rounded-xl text-xs"
              >
                Approve All (
                {goals.filter((g) => g.status === "Pending Approval").length})
              </button>
              <button
                onClick={() => handleBatchReview("revision")}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black py-2 px-5 rounded-xl text-xs"
              >
                Revision All
              </button>
              <button
                onClick={() => handleBatchReview("reject")}
                className="bg-red-700 hover:bg-red-800 text-white font-black py-2 px-5 rounded-xl text-xs"
              >
                Reject All
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }

  // ============================================================
  // EMPLOYEE VIEW (giữ nguyên)
  // ============================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* Debug */}
      <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 text-[10px] font-mono overflow-auto">
        <details>
          <summary className="font-bold cursor-pointer text-slate-600">
            🔍 Debug
          </summary>
          <div className="mt-2 space-y-1">
            <p>
              <strong>User:</strong> {user.name} ({user.role})
            </p>
            <p>
              <strong>Appraisal ID:</strong> {appraisalId || "Loading..."}
            </p>
            <p>
              <strong>Goals:</strong> {goals.length}
            </p>
            <p>
              <strong>Total Weight:</strong> {totalWeight}%
            </p>
          </div>
        </details>
      </div>

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="text-blue-900" size={24} /> KPI & Goals
          </h2>
          <p className="text-[10px] text-slate-400">
            Appraisal: {appraisalId || "Loading..."}
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center gap-2"
          >
            <Plus size={16} /> Create Goal
          </button>
        )}
      </section>

      {/* Cycle Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-blue-900">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase">
              Active Cycle
            </h3>
            <p className="text-[11px] text-slate-500">
              {activeCycle.name} ({activeCycle.type})
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
          {activeCycle.status}
        </span>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600" />
          <p className="text-xs text-red-700">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <Check size={18} className="text-emerald-600" />
          <p className="text-xs text-emerald-700">{successMsg}</p>
        </div>
      )}

      {/* Workflow */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono text-center">
        {[
          { label: "Draft", count: countDraft },
          { label: "Pending", count: countPending },
          { label: "Revision", count: countRevision },
          { label: "Approved", count: countApproved },
          { label: "Rejected", count: countRejected },
        ].map((step) => (
          <div
            key={step.label}
            className="bg-white border rounded-xl p-2.5 flex flex-col justify-center items-center"
          >
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
              {step.label}
            </span>
            <span className="text-xl font-black mt-1">{step.count}</span>
          </div>
        ))}
      </section>

      {/* Weight */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-indigo-900">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase">
              Weight Balance
            </h3>
            <p className="text-[11px] text-slate-400">Total must equal 100%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-black font-mono ${totalWeight === 100 ? "text-emerald-700" : "text-amber-700"}`}
          >
            {totalWeight}% / 100%
          </span>
          <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${totalWeight === 100 ? "bg-emerald-600" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, totalWeight)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono mb-4">
            Create Goal
          </h3>
          <form onSubmit={handleCreateGoalSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 outline-none"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  disabled={isSubmitting}
                >
                  <option value="Business">Business</option>
                  <option value="Technical">Technical</option>
                  <option value="People">People</option>
                  <option value="Development">Development</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target
                </label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-black"
                  disabled={isSubmitting}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Total: {totalWeight}%
                </p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Evidence
                </label>
                <input
                  type="text"
                  placeholder="Evidence description"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 rounded-xl disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 size={24} className="animate-spin mx-auto text-blue-600" />
            <p className="text-xs text-slate-400 mt-2">Loading...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-slate-50/50 border border-slate-200.5 rounded-2xl p-12 text-center">
            <CheckSquare size={48} className="mx-auto text-slate-300 mb-2.5" />
            <h4 className="text-sm font-bold text-slate-800">No goals yet</h4>
            <p className="text-xs text-slate-400">Create your first goal.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {goals.map((goal) => {
              const isCurrentEditing = editingGoalId === goal.id;
              const canEmployeeEdit =
                goal.status === "Draft" || goal.status === "Revision Required";
              const statusColors: Record<string, string> = {
                Draft: "bg-slate-100 text-slate-700 border-slate-250",
                "Pending Approval": "bg-blue-50 text-blue-800 border-blue-200",
                "Revision Required":
                  "bg-amber-50 text-amber-800 border-amber-200",
                Approved: "bg-emerald-50 text-emerald-800 border-emerald-250",
                Rejected: "bg-red-50 text-red-800 border-red-200",
              };

              return (
                <div
                  key={goal.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50/50 border border-blue-100/50 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-md font-mono uppercase">
                        {goal.category}
                      </span>
                      <span
                        className={`text-[10px] font-black border uppercase px-2.5 py-0.5 rounded-xl font-mono ${statusColors[goal.status]}`}
                      >
                        ● {goal.status}
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-black px-2.5 py-0.5 rounded-md border border-indigo-200">
                        Weight: {goal.weight}%
                      </span>
                    </div>
                    {canEmployeeEdit && !isCurrentEditing && (
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 p-1.5 rounded-lg"
                      >
                        <Trash size={13} />
                      </button>
                    )}
                  </div>

                  {isCurrentEditing ? (
                    <div className="space-y-4 text-xs">
                      <div className="border-b border-slate-100 pb-2 font-mono text-slate-400 uppercase text-[10px] font-black">
                        ✏ Edit
                      </div>
                      {editErrorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-center gap-2">
                          <AlertCircle size={15} /> {editErrorMsg}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Category
                          </label>
                          <select
                            value={editCategory}
                            onChange={(e) =>
                              setEditCategory(e.target.value as any)
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                          >
                            <option value="Business">Business</option>
                            <option value="Technical">Technical</option>
                            <option value="People">People</option>
                            <option value="Development">Development</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Target
                          </label>
                          <input
                            type="text"
                            value={editTarget}
                            onChange={(e) => setEditTarget(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Target Value
                          </label>
                          <input
                            type="number"
                            value={editTargetValue}
                            onChange={(e) =>
                              setEditTargetValue(Number(e.target.value))
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Weight (%)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editWeight}
                            onChange={(e) =>
                              setEditWeight(Number(e.target.value))
                            }
                            className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Evidence
                          </label>
                          <input
                            type="text"
                            value={editEvidence}
                            onChange={(e) => setEditEvidence(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1.5"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={cancelEditing}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 px-3.5 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(goal.id)}
                          className="bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-1.5 px-4 rounded-xl"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-slate-600/90 mt-1">
                        {goal.description}
                      </p>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs mt-3">
                        <span className="font-bold uppercase text-slate-400 text-[9px] font-mono block">
                          Target
                        </span>
                        <p className="font-extrabold text-blue-900">
                          {goal.target}
                        </p>
                        <div className="flex justify-between bg-white border border-slate-200/50 p-2 rounded-lg mt-2 font-mono text-[11px]">
                          <span>
                            Threshold: <strong>{goal.targetValue}</strong>
                          </span>
                          <span>
                            Updated:{" "}
                            {new Date(goal.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-[11px] text-slate-400 font-mono">
                          {goal.submittedDate
                            ? `Submitted: ${new Date(goal.submittedDate).toLocaleDateString()}`
                            : "Not submitted"}
                        </div>
                        <div className="flex items-center gap-2">
                          {canEmployeeEdit && (
                            <button
                              onClick={() => startEditing(goal)}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                          )}
                          {goal.status === "Pending Approval" && (
                            <span className="text-slate-400 font-mono text-[11px] bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                              Waiting for Approval
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Batch */}
      {isEmployee && (
        <div className="bg-slate-50 border border-slate-200.5 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Send className="text-blue-900 shrink-0" size={18} />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide font-mono">
              Batch Submission
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${goals.filter((g) => g.status === "Draft" || g.status === "Revision Required").length >= 2 ? "bg-emerald-50/40 border-emerald-150" : "bg-amber-50/40 border-amber-150"}`}
            >
              <div>
                {goals.filter(
                  (g) =>
                    g.status === "Draft" || g.status === "Revision Required",
                ).length >= 2
                  ? "✓"
                  : "!"}
              </div>
              <div>
                <p className="font-extrabold">Minimum 2 KPIs</p>
                <p className="text-[11px] text-slate-500">
                  {
                    goals.filter(
                      (g) =>
                        g.status === "Draft" ||
                        g.status === "Revision Required",
                    ).length
                  }{" "}
                  goal(s) ready
                </p>
              </div>
            </div>
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${totalWeight === 100 ? "bg-emerald-50/40 border-emerald-150" : "bg-amber-50/40 border-amber-150"}`}
            >
              <div>{totalWeight === 100 ? "✓" : "!"}</div>
              <div>
                <p className="font-extrabold">Weight = 100%</p>
                <p className="text-[11px] text-slate-500">
                  {totalWeight}% / 100%
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
            <span className="text-xs text-slate-500">
              {
                goals.filter(
                  (g) =>
                    g.status === "Draft" || g.status === "Revision Required",
                ).length
              }{" "}
              goal(s) ready
            </span>
            {goals.filter(
              (g) => g.status === "Draft" || g.status === "Revision Required",
            ).length > 0 && (
              <button
                onClick={handleEmployeeSubmit}
                className={`font-black py-2.5 px-6 rounded-xl flex items-center gap-2 ${goals.filter((g) => g.status === "Draft" || g.status === "Revision Required").length >= 2 && totalWeight === 100 ? "bg-blue-900 hover:bg-blue-800 text-white" : "bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed"}`}
              >
                <Send size={15} /> Submit to Manager
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
