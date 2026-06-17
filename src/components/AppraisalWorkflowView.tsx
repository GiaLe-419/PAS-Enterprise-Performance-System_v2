// src/components/AppraisalWorkflowView.tsx
import React, { useState, useEffect } from "react";
import { useDataverse } from "@/src/context/DataverseContext";
import { AuthUser } from "@/src/services/AuthService";
import {
  FolderLock,
  UserSquare,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Check,
  FileSignature,
  RotateCcw,
  MessageSquare,
  Lock,
  Unlock,
  Building,
  Eye,
  Star,
  Clock,
  X,
  Loader2,
} from "lucide-react";

// ============ TYPES ============
interface AppraisalWorkflowViewProps {
  selectedAppraisalId: string | null;
  setSelectedAppraisalId: (id: string | null) => void;
  user: AuthUser; // ✅ Nhận user từ props
}

// ============ COMPONENT ============
export const AppraisalWorkflowView: React.FC<AppraisalWorkflowViewProps> = ({
  selectedAppraisalId,
  setSelectedAppraisalId,
  user,
}) => {
  // ✅ Dùng DataverseContext
  const {
    // TODO: Thêm appraisals, users, goals vào DataverseContext
    // appraisals,
    // users,
    // activeCycle,
    // goals,
    // saveSelfAppraisal,
    // saveManagerAppraisal,
    // signOffEmployee,
    // signOffManager,
    // requestPeerFeedback,
    // submitPeerFeedback,
    // cancelPeerReviewRequest,
    // requestAdditionalFeedback,
    // submitAdditionalFeedback,
    // overrideAppraisal,
    // updateGoal
  } = useDataverse();

  // ===== TẠM THỜI: Mock data để UI không bị lỗi =====
  const mockAppraisals: any[] = [];
  const mockUsers: AuthUser[] = [user];
  const mockGoals: any[] = [];
  const mockActiveCycle = null;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load appraisals từ DataverseContext
    // loadAppraisals(activeCycle?.id);
    setTimeout(() => setLoading(false), 500);
  }, []);

  // ===== TRẠNG THÁI FORM =====
  const [strengths, setStrengths] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [blockers, setBlockers] = useState("");
  const [additionalFeedbackContent, setAdditionalFeedbackContent] =
    useState("");
  const [collaboration, setCollaboration] = useState(4);
  const [communication, setCommunication] = useState(4);
  const [problemSolving, setProblemSolving] = useState(4);
  const [leadership, setLeadership] = useState(3);
  const [teamwork, setTeamwork] = useState(3);
  const [accountability, setAccountability] = useState(3);
  const [peerComments, setPeerComments] = useState("");
  const [ratingGoals, setRatingGoals] = useState(3.0);
  const [ratingComp, setRatingComp] = useState(3.0);
  const [managerJustification, setManagerJustification] = useState("");
  const [inflationAck, setInflationAck] = useState(false);
  const [selectedReviewerToAdd, setSelectedReviewerToAdd] = useState("");
  const [employeeReflections, setEmployeeReflections] = useState("");
  const [employeeRebuttal, setEmployeeRebuttal] = useState("");
  const [managerFinalComments, setManagerFinalComments] = useState("");
  const [formMsg, setFormMsg] = useState({ type: "", text: "" });
  const [selectedPeerFeedbackForModal, setSelectedPeerFeedbackForModal] =
    useState<any>(null);
  const [
    selectedAdditionalFeedbackForModal,
    setSelectedAdditionalFeedbackForModal,
  ] = useState<any>(null);

  // ===== TÌM APPRAISAL =====
  // TODO: Thay mock bằng dữ liệu thật từ DataverseContext
  const activeAppraisal =
    mockAppraisals.find((a) => a.id === selectedAppraisalId) ||
    mockAppraisals[0];

  const employeeUser = activeAppraisal
    ? mockUsers.find((u) => u.id === activeAppraisal.employeeId)
    : user;
  const managerUser = employeeUser
    ? mockUsers.find((u) => u.id === employeeUser.managerId)
    : null;
  const managerName = managerUser?.name || "Direct Manager";
  const appraisalGoals = mockGoals.filter(
    (g) =>
      g.employeeId === activeAppraisal?.employeeId &&
      g.cycleId === activeAppraisal?.cycleId,
  );

  const isManagerOrHR =
    user.role === "Manager" ||
    user.role === "HR" ||
    user.role === "SeniorManager";

  // ===== HANDLERS (Tạm thời chỉ log) =====
  const handleEmployeeSelfSubmit = (isSubmit: boolean) => {
    setFormMsg({ type: "", text: "" });
    if (isSubmit && (!strengths.trim() || !opportunities.trim())) {
      setFormMsg({
        type: "error",
        text: "Strengths and development opportunities commentary fields are mandatory for submission.",
      });
      return;
    }
    // TODO: Gọi saveSelfAppraisal từ DataverseContext
    setFormMsg({
      type: "success",
      text: isSubmit
        ? "Self-appraisal submitted successfully."
        : "Self-appraisal draft saved.",
    });
  };

  const handleManagerAppraisalSubmit = (isSubmit: boolean) => {
    // TODO: Gọi saveManagerAppraisal từ DataverseContext
    setFormMsg({
      type: "success",
      text: isSubmit
        ? "Manager appraisal submitted."
        : "Manager appraisal draft saved.",
    });
  };

  const handleEmployeeSignComplete = () => {
    // TODO: Gọi signOffEmployee từ DataverseContext
    setFormMsg({ type: "success", text: "Self digital signature stamped." });
  };

  const handleManagerSignComplete = () => {
    // TODO: Gọi signOffManager từ DataverseContext
    setFormMsg({ type: "success", text: "Manager signature completed." });
  };

  const handleHRUnlock = () => {
    // TODO: Gọi overrideAppraisal từ DataverseContext
    setFormMsg({ type: "success", text: "Appraisal unlocked." });
  };

  const handleAdditionalFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gọi submitAdditionalFeedback từ DataverseContext
    setFormMsg({ type: "success", text: "Thank you for your feedback." });
  };

  const handlePeerFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gọi submitPeerFeedback từ DataverseContext
    setFormMsg({ type: "success", text: "Peer feedback submitted." });
  };

  const calculatedSum = parseFloat(
    (ratingGoals * 0.7 + ratingComp * 0.3).toFixed(2),
  );
  const isExtremeScore = calculatedSum >= 4.8 || calculatedSum <= 2.2;
  const justificationLength = managerJustification.trim().length;
  const isJustificationValid = !isExtremeScore || justificationLength >= 250;
  const showInflationAlert = calculatedSum > 4.2;

  // ===== RENDER =====
  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-blue-600" />
        <p className="text-xs text-slate-400 mt-2">Loading appraisals...</p>
      </div>
    );
  }

  if (!activeAppraisal) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        No matching employee appraisals located in active cycles.
      </div>
    );
  }

  // ===== UI GIỮ NGUYÊN NHƯ CŨ =====
  // Phần render UI giữ nguyên, chỉ thay currentUser → user
  // và các hàm gọi sẽ được thay sau khi DataverseContext hoàn thiện

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* Upper select selector */}
      <section className="bg-white border border-slate-200.5 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 select-text">
          <div className="bg-indigo-900 text-white p-2.5 rounded-lg shrink-0">
            <FolderLock size={20} />
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono">
              Appraisals Matrix Workbench
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-slate-500 font-semibold font-sans">
                Active Target Employee Record:
              </span>
              <select
                value={activeAppraisal.id}
                onChange={(e) => setSelectedAppraisalId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-indigo-900 p-0 pr-8 cursor-pointer focus:ring-0 outline-none"
              >
                {mockAppraisals.map((apr) => {
                  const subUser = mockUsers.find(
                    (u) => u.id === apr.employeeId,
                  );
                  return (
                    <option key={apr.id} value={apr.id}>
                      {subUser?.name}{" "}
                      {apr.employeeId === user.id ? "(My Appraisal)" : ""} —{" "}
                      {apr.currentStage}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Audit trail sequence helper tracker */}
        <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto pb-1 max-w-full scrollbar-none">
          {[
            "GoalSetup",
            "SelfAppraisal",
            "ManagerAppraisal",
            "Calibration",
            "SignOff",
            "Completed",
          ].map((stage, idx) => (
            <React.Fragment key={stage}>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                  activeAppraisal.currentStage === stage
                    ? "bg-blue-900 text-white font-black"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {idx + 1}. {stage.replace("Appraisal", "").replace("Off", "")}
              </span>
              {idx < 5 && (
                <ChevronRight size={10} className="text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Messaging overlay */}
      {formMsg.text && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 font-sans ${
            formMsg.type === "error"
              ? "bg-red-50 text-red-900 border-red-105"
              : "bg-emerald-50 text-emerald-850 border-emerald-100"
          }`}
        >
          <AlertCircle size={16} />
          <span className="font-semibold">{formMsg.text}</span>
        </div>
      )}

      {/* TẠM THỜI: THÔNG BÁO ĐANG PHÁT TRIỂN */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <h3 className="text-sm font-bold text-amber-800">🚧 Đang phát triển</h3>
        <p className="text-xs text-amber-700 mt-1">
          Chức năng Appraisal Workflow đang được chuyển đổi từ AppContext sang
          DataverseContext.
          <br />
          Vui lòng quay lại sau.
        </p>
        <p className="text-xs text-amber-600 mt-2">
          User hiện tại: <strong>{user.name}</strong> ({user.role})
        </p>
      </div>
    </div>
  );
};
