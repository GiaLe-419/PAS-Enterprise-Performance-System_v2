// src/components/GoalManagementView.tsx
import React, { useState, useEffect } from "react";
import { useDataverse } from "@/src/context/DataverseContext";
import { AuthUser } from "@/src/services/AuthService";
import {
  CheckSquare,
  Plus,
  Check,
  Trash,
  AlertCircle,
  Send,
  FileText,
  Clock,
  TrendingUp,
  Scale,
  Edit2,
} from "lucide-react";

// ============ TYPES ============
interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  title: string;
  description: string;
  weight: number;
  category: "Technical" | "Business" | "Development" | "People";
  target: string;
  targetValue: number;
  actualValue: number;
  progress: number;
  status:
    | "Draft"
    | "Pending Approval"
    | "Revision Required"
    | "Approved"
    | "Rejected";
  evidence: string;
  evidenceUrl?: string;
  evidenceName?: string;
  managerComment?: string;
  approvedBy?: string;
  approvedDate?: string;
  submittedDate?: string;
  lastUpdated: string;
}

// ============ COMPONENT ============
interface GoalManagementViewProps {
  user: AuthUser;
}

export const GoalManagementView: React.FC<GoalManagementViewProps> = ({
  user,
}) => {
  const {
    currentUser,
    cycles,
    loadCycles,
    // TODO: Thêm các hàm quản lý goal vào DataverseContext
    // goals, addGoal, updateGoal, deleteGoal, submitGoal, approveGoal, ...
  } = useDataverse();

  // ===== STATE =====
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubordinateId, setSelectedSubordinateId] =
    useState<string>("");
  const [batchMsg, setBatchMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [batchComment, setBatchComment] = useState("");
  const [batchReviewError, setBatchReviewError] = useState("");
  const [batchReviewMsg, setBatchReviewMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // New goal form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<
    "Technical" | "Business" | "Development" | "People"
  >("Business");
  const [target, setTarget] = useState("");
  const [targetValue, setTargetValue] = useState(100);
  const [weight, setWeight] = useState(20);
  const [evidence, setEvidence] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Editing states
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<
    "Technical" | "Business" | "Development" | "People"
  >("Business");
  const [editTarget, setEditTarget] = useState("");
  const [editTargetValue, setEditTargetValue] = useState(100);
  const [editWeight, setEditWeight] = useState(20);
  const [editEvidence, setEditEvidence] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  // ===== ROLE CHECKS =====
  const isManager =
    user.role === "Manager" ||
    user.role === "HR" ||
    user.role === "SeniorManager";
  const isEmployee = user.role === "Employee";

  // ===== SUBORDINATES =====
  // TODO: Cần lấy danh sách employees từ DataverseContext
  const subordinates: AuthUser[] = []; // Tạm thời để trống

  // ===== ACTIVE CYCLE =====
  const activeCycle = cycles.find((c) => c.status === "Active");

  // ===== GOALS =====
  // TODO: Cần lấy goals từ DataverseContext
  const goals: Goal[] = [];

  // Set initial selected subordinate
  useEffect(() => {
    if (isManager && subordinates.length > 0 && !selectedSubordinateId) {
      setSelectedSubordinateId(subordinates[0].id);
    }
  }, [isManager, subordinates, selectedSubordinateId]);

  // Determine target employee
  const targetEmployeeId = isManager ? selectedSubordinateId : user.id;
  const targetEmployee =
    subordinates.find((u) => u.id === targetEmployeeId) || user;

  // Filter goals by target user and cycle
  const cycleGoals = goals.filter(
    (g) => g.employeeId === targetEmployeeId && g.cycleId === activeCycle?.id,
  );

  const totalWeight = cycleGoals.reduce((sum, g) => sum + g.weight, 0);

  // Count states
  const countDraft = cycleGoals.filter((g) => g.status === "Draft").length;
  const countPending = cycleGoals.filter(
    (g) => g.status === "Pending Approval",
  ).length;
  const countRevision = cycleGoals.filter(
    (g) => g.status === "Revision Required",
  ).length;
  const countApproved = cycleGoals.filter(
    (g) => g.status === "Approved",
  ).length;
  const countRejected = cycleGoals.filter(
    (g) => g.status === "Rejected",
  ).length;

  // ===== HANDLERS =====
  // TODO: Implement với Dataverse Service thật

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    // TODO: Gọi createGoal từ DataverseContext
    setIsCreating(false);
  };

  const handleSaveEdit = (goalId: string) => {
    // TODO: Gọi updateGoal từ DataverseContext
    setEditingGoalId(null);
  };

  const handleEmployeeSubmit = () => {
    // TODO: Gọi submitGoalsBatch từ DataverseContext
  };

  const handleBatchReview = (action: "approve" | "revision" | "reject") => {
    // TODO: Gọi approveGoals từ DataverseContext
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description || "");
    setEditCategory(goal.category);
    setEditTarget(goal.target);
    setEditTargetValue(goal.targetValue);
    setEditWeight(goal.weight);
    setEditEvidence(goal.evidence || "");
    setEditErrorMsg("");
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
  };

  // ===== RENDER =====
  // UI giữ nguyên như cũ, chỉ thay đổi data source
  // ... (phần render giữ nguyên)

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* HEADER BAR */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="text-blue-900" size={24} /> KPI & Goals Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Formulate key objectives, weight values, and monitor qualitative
            approval workflow matrices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isManager && subordinates.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold px-1.5 font-mono">
                WORKSPACE FOR:
              </span>
              <select
                value={selectedSubordinateId}
                onChange={(e) => {
                  setSelectedSubordinateId(e.target.value);
                  setEditingGoalId(null);
                }}
                className="bg-transparent border-none text-xs font-black text-blue-900 focus:outline-none focus:ring-0 p-0 pr-8 cursor-pointer font-sans"
              >
                {subordinates.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} — {sub.department}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* WORKFLOW PROGRESS VISUAL TIMELINE */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 shadow-2xs font-mono text-center">
        {[
          {
            label: "Draft",
            count: countDraft,
            bg: "bg-slate-100 text-slate-700 border-slate-200",
          },
          {
            label: "Pending Approval",
            count: countPending,
            bg: "bg-blue-50 text-blue-800 border-blue-100",
          },
          {
            label: "Revision Required",
            count: countRevision,
            bg: "bg-amber-50 text-amber-800 border-amber-100",
          },
          {
            label: "Approved",
            count: countApproved,
            bg: "bg-emerald-50 text-emerald-800 border-emerald-100",
          },
          {
            label: "Rejected",
            count: countRejected,
            bg: "bg-red-50 text-red-800 border-red-100",
          },
        ].map((step) => (
          <div
            key={step.label}
            className={`border rounded-xl p-2.5 flex flex-col justify-center items-center ${step.bg}`}
          >
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">
              {step.label}
            </span>
            <span className="text-xl font-black mt-1 leading-none">
              {step.count}
            </span>
          </div>
        ))}
      </section>

      {/* CUMULATIVE WEIGHT MATRIX */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-indigo-900 shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
              Weighted Goal Balance
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
              Enterprise policy mandates total goals weight equals exactly 100%
              allocation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Sum Weight
            </span>
            <span
              className={`text-lg font-black font-mono ${totalWeight === 100 ? "text-emerald-700" : "text-amber-700"}`}
            >
              {totalWeight}% / 100%
            </span>
          </div>
          <div className="flex-1 sm:w-40 bg-slate-100 h-2.5 rounded-full overflow-hidden shrink-0">
            <div
              className={`h-full transition-all duration-300 ${totalWeight === 100 ? "bg-emerald-600" : totalWeight > 100 ? "bg-red-600" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, totalWeight)}%` }}
            />
          </div>
          {totalWeight === 100 ? (
            <span className="text-[10px] bg-emerald-50 border border-emerald-150 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md uppercase font-mono">
              Valid
            </span>
          ) : (
            <span className="text-[10px] bg-amber-50 border border-amber-150 text-amber-800 font-extrabold px-2 py-0.5 rounded-md uppercase font-mono">
              Adjust
            </span>
          )}
        </div>
      </section>

      {/* TẠM THỜI: THÔNG BÁO ĐANG PHÁT TRIỂN */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <h3 className="text-sm font-bold text-amber-800">🚧 Đang phát triển</h3>
        <p className="text-xs text-amber-700 mt-1">
          Chức năng Goal Management đang được chuyển đổi từ AppContext sang
          DataverseContext.
          <br />
          Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  );
};
