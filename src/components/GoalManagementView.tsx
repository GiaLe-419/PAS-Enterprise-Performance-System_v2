import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Goal, User } from '../types';
import { 
  CheckSquare, 
  Plus, 
  Check, 
  Trash, 
  AlertCircle, 
  Link2, 
  ExternalLink, 
  Edit2, 
  Send, 
  FileText,
  RotateCcw,
  XCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Scale
} from 'lucide-react';

export const GoalManagementView: React.FC = () => {
  const { 
    currentUser, 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    submitGoal,
    submitGoalsBatch,
    approveGoal,
    requestRevisionGoal,
    rejectGoal,
    approveGoals, 
    activeCycle, 
    users, 
    appraisals 
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubordinateId, setSelectedSubordinateId] = useState<string>('');

  // Batch Validation State and Handlers
  const [batchMsg, setBatchMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Manager Batch Review State
  const [batchComment, setBatchComment] = useState('');
  const [batchReviewError, setBatchReviewError] = useState('');
  const [batchReviewMsg, setBatchReviewMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // New goal form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Technical' | 'Business' | 'Development' | 'People'>('Business');
  const [target, setTarget] = useState('');
  const [targetValue, setTargetValue] = useState(100);
  const [weight, setWeight] = useState(20);
  const [evidence, setEvidence] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing goal states
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<'Technical' | 'Business' | 'Development' | 'People'>('Business');
  const [editTarget, setEditTarget] = useState('');
  const [editTargetValue, setEditTargetValue] = useState(100);
  const [editWeight, setEditWeight] = useState(20);
  const [editEvidence, setEditEvidence] = useState('');
  const [editEvidenceUrl, setEditEvidenceUrl] = useState('');
  const [editEvidenceName, setEditEvidenceName] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Manager feedback comment states (indexed by goalId)
  const [managerComments, setManagerComments] = useState<Record<string, string>>({});
  // Manager feedback error states (indexed by goalId)
  const [managerErrors, setManagerErrors] = useState<Record<string, string>>({});

  // Role details
  const isManager = currentUser.role === 'Manager' || currentUser.role === 'HR' || currentUser.role === 'SeniorManager';
  const subordinates = users.filter(u => u.managerId === currentUser.id);

  // Set initial selected subordinate on load if empty
  if (isManager && subordinates.length > 0 && !selectedSubordinateId) {
    setSelectedSubordinateId(subordinates[0].id);
  }

  // Determine target employee
  const targetEmployeeId = isManager ? selectedSubordinateId : currentUser.id;
  const targetEmployee = users.find(u => u.id === targetEmployeeId) || currentUser;

  // Goals list filtered by target user and cycle
  const cycleGoals = goals.filter(g => g.employeeId === targetEmployeeId && g.cycleId === activeCycle?.id);
  
  // Weights total logic
  const totalWeight = cycleGoals.reduce((sum, g) => sum + g.weight, 0);

  // Find related appraisal record
  const relatedAppraisal = appraisals.find(a => a.employeeId === targetEmployeeId && a.cycleId === activeCycle?.id);

  // Count states for top workflow timeline
  const countDraft = cycleGoals.filter(g => g.status === 'Draft').length;
  const countPending = cycleGoals.filter(g => g.status === 'Pending Approval').length;
  const countRevision = cycleGoals.filter(g => g.status === 'Revision Required').length;
  const countApproved = cycleGoals.filter(g => g.status === 'Approved').length;
  const countRejected = cycleGoals.filter(g => g.status === 'Rejected').length;

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please specify an objective title.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a short description outlining the scope of work.');
      return;
    }
    if (!target.trim()) {
      setErrorMsg('Please specify a quantitative target metric description.');
      return;
    }
    if (weight <= 0 || weight > 100) {
      setErrorMsg('Weight allocation must be between 1% and 100%.');
      return;
    }
    if (totalWeight + Math.floor(weight) > 100) {
      setErrorMsg(`Cannot add this objective. Cumulative weight exceeds 100% threshold limit (Current total: ${totalWeight}%).`);
      return;
    }
    if (!activeCycle) {
      setErrorMsg('No active appraisal cycle found.');
      return;
    }

    addGoal({
      employeeId: currentUser.id,
      cycleId: activeCycle.id,
      title: title.trim(),
      description: description.trim(),
      weight: Math.floor(weight),
      category,
      target: target.trim(),
      actual: 'Not yet assessed.',
      targetValue: Number(targetValue),
      actualValue: 0,
      progress: 0,
      evidence: evidence.trim(),
      evidenceUrl: evidenceUrl.trim() || undefined,
      evidenceName: evidenceName.trim() || undefined
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setCategory('Business');
    setTarget('');
    setTargetValue(100);
    setWeight(20);
    setEvidence('');
    setEvidenceUrl('');
    setEvidenceName('');
    setIsCreating(false);
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description || '');
    setEditCategory(goal.category);
    setEditTarget(goal.target);
    setEditTargetValue(goal.targetValue);
    setEditWeight(goal.weight);
    setEditEvidence(goal.evidence || '');
    setEditEvidenceUrl(goal.evidenceUrl || '');
    setEditEvidenceName(goal.evidenceName || '');
    setEditErrorMsg('');
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
  };

  const handleSaveEdit = (goalId: string) => {
    setEditErrorMsg('');
    const curGoal = cycleGoals.find(g => g.id === goalId);
    if (!curGoal) return;

    if (!editTitle.trim()) {
      setEditErrorMsg('Subject title cannot be empty.');
      return;
    }
    if (!editDescription.trim()) {
      setEditErrorMsg('Scope description cannot be empty.');
      return;
    }
    if (!editTarget.trim()) {
      setEditErrorMsg('Target metric details cannot be empty.');
      return;
    }
    if (editWeight <= 0 || editWeight > 100) {
      setEditErrorMsg('Weight allocation must be between 1% and 100%.');
      return;
    }

    const proposedTotal = totalWeight - curGoal.weight + Math.floor(editWeight);
    if (proposedTotal > 100) {
      setEditErrorMsg(`Total goal weights cannot exceed 100% threshold (With changes, sum is ${proposedTotal}%).`);
      return;
    }

    updateGoal(goalId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      target: editTarget.trim(),
      targetValue: Number(editTargetValue),
      weight: Math.floor(editWeight),
      evidence: editEvidence.trim(),
      evidenceUrl: editEvidenceUrl.trim() || undefined,
      evidenceName: editEvidenceName.trim() || undefined,
      status: 'Draft' // Resets state to Draft so they must submit it for review
    });

    setEditingGoalId(null);
  };

  const handleManagerAction = (goalId: string, action: 'approve' | 'revision' | 'reject') => {
    // Reset previous error
    setManagerErrors(prev => ({ ...prev, [goalId]: '' }));

    let comment = managerComments[goalId] || '';
    if (!comment.trim()) {
      if (action === 'approve') {
        comment = 'Approved by manager.';
      } else {
        setManagerErrors(prev => ({ 
          ...prev, 
          [goalId]: 'Feedback comments are strictly required to request a revision or reject a goal.' 
        }));
        return;
      }
    }

    if (action === 'approve') {
      approveGoal(goalId, comment.trim());
    } else if (action === 'revision') {
      requestRevisionGoal(goalId, comment.trim());
    } else if (action === 'reject') {
      rejectGoal(goalId, comment.trim());
    }

    // Clear manager inputs for this goal
    setManagerComments(prev => ({ ...prev, [goalId]: '' }));
    setManagerErrors(prev => ({ ...prev, [goalId]: '' }));
  };

  const handleEmployeeSubmit = (goalId?: string) => {
    setBatchMsg(null);
    if (cycleGoals.length < 2) {
      setBatchMsg({
        type: 'error',
        text: `Policy Violation: At least 2 KPIs/goals must be formulated in your workspace (Currently you have ${cycleGoals.length} goal(s)). Please add more objectives.`
      });
      return;
    }
    if (totalWeight !== 100) {
      setBatchMsg({
        type: 'error',
        text: `Policy Violation: Cumulative weight allocation is currently ${totalWeight}%. Your total goal weights must equal exactly 100% before submitting for review.`
      });
      return;
    }

    submitGoalsBatch(currentUser.id, activeCycle?.id || '');
    setBatchMsg({
      type: 'success',
      text: 'Success! Your entire goals portfolio has been submitted to your manager in a single batch.'
    });
  };

  const handleBatchReview = (action: 'approve' | 'revision' | 'reject') => {
    setBatchReviewError('');
    setBatchReviewMsg(null);

    const pendingCount = cycleGoals.filter(g => g.status === 'Pending Approval').length;
    if (pendingCount === 0) {
      setBatchReviewError('There are no objectives in the review queue to review.');
      return;
    }

    if (action !== 'approve' && !batchComment.trim()) {
      setBatchReviewError('Feedback/evaluation comments are strictly required to request a revision or reject objectives.');
      return;
    }

    const reviewComment = batchComment.trim() || 'Batch approved by manager.';
    approveGoals(targetEmployeeId, activeCycle?.id || '', reviewComment, action);
    
    setBatchComment('');
    setBatchReviewMsg({
      type: 'success',
      text: `Success! You have successfully processed the entire objectives portfolio batch as: ${
        action === 'approve' ? 'Approved' : action === 'revision' ? 'Revision Required' : 'Rejected'
      }.`
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      
      {/* HEADER BAR */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="text-blue-900" size={24} /> KPI & Goals Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Formulate key objectives, weight values, and monitor qualitative approval workflow matrices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subordinate Selection Drawer for Managers */}
          {isManager && subordinates.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold px-1.5 font-mono">WORKSPACE FOR:</span>
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
                    {sub.name} — {sub.title}
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
          { label: 'Draft', count: countDraft, bg: 'bg-slate-100 text-slate-700 border-slate-200' },
          { label: 'Pending Approval', count: countPending, bg: 'bg-blue-50 text-blue-800 border-blue-100' },
          { label: 'Revision Required', count: countRevision, bg: 'bg-amber-50 text-amber-800 border-amber-100' },
          { label: 'Approved', count: countApproved, bg: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
          { label: 'Rejected', count: countRejected, bg: 'bg-red-50 text-red-800 border-red-100' }
        ].map((step) => (
          <div key={step.label} className={`border rounded-xl p-2.5 flex flex-col justify-center items-center ${step.bg}`}>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">{step.label}</span>
            <span className="text-xl font-black mt-1 leading-none">{step.count}</span>
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
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">Weighted Goal Balance</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
              Enterprise policy mandates total goals weight equals exactly 100% allocation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Sum Weight</span>
            <span className={`text-lg font-black font-mono ${totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {totalWeight}% / 100%
            </span>
          </div>
          <div className="flex-1 sm:w-40 bg-slate-100 h-2.5 rounded-full overflow-hidden shrink-0">
            <div 
              className={`h-full transition-all duration-300 ${totalWeight === 100 ? 'bg-emerald-600' : totalWeight > 100 ? 'bg-red-600':'bg-amber-500'}`} 
              style={{ width: `${Math.min(100, totalWeight)}%` }} 
            />
          </div>
          {totalWeight === 100 ? (
            <span className="text-[10px] bg-emerald-50 border border-emerald-150 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md uppercase font-mono">Valid</span>
          ) : (
            <span className="text-[10px] bg-amber-50 border border-amber-150 text-amber-800 font-extrabold px-2 py-0.5 rounded-md uppercase font-mono">Adjust</span>
          )}
        </div>
      </section>

      {!isCreating && currentUser.role === 'Employee' && (
        <div className="flex justify-start my-4">
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingGoalId(null);
            }}
            className="bg-slate-955 hover:bg-slate-900 text-slate-900 hover:text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-300 shadow-xs"
            style={{ backgroundColor: '#f1f5f9' }}
          >
            <Plus size={16} /> Create New Goal
          </button>
        </div>
      )}

      {/* GOALS BATCH SUBMISSION CONTROLS (Employee Only) */}
      {currentUser.role === 'Employee' && (
        <section className="bg-slate-50 border border-slate-200.5 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Send className="text-blue-900 shrink-0" size={18} />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide font-mono">
              Goals Batch Submission Desk
            </h3>
          </div>

          {batchMsg && (
            <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              batchMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <AlertCircle size={16} className={batchMsg.type === 'success' ? 'text-emerald-700 font-bold shrink-0' : 'text-red-700 font-bold shrink-0'} />
              <span>{batchMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {/* KPI count rule card */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
              cycleGoals.length >= 2 
                ? 'bg-emerald-50/40 border-emerald-150' 
                : 'bg-amber-50/40 border-amber-150'
            }`}>
              <div className="mt-0.5 shrink-0">
                {cycleGoals.length >= 2 ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black">✓</span>
                ) : (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black">!</span>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-xs">Rule 1: Minimum of 2 KPIs</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enterprise policy requires employees to formulate at least 2 distinct objectives.
                </p>
                <p className="text-[11px] font-black font-mono pt-1">
                  Current Status: <span className={cycleGoals.length >= 2 ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>{cycleGoals.length} Goal(s) created</span>
                </p>
              </div>
            </div>

            {/* Total weight rule card */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
              totalWeight === 100 
                ? 'bg-emerald-50/40 border-emerald-150' 
                : 'bg-amber-50/40 border-amber-150'
            }`}>
              <div className="mt-0.5 shrink-0">
                {totalWeight === 100 ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black">✓</span>
                ) : (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black">!</span>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-xs">Rule 2: Weight allocation sum equal to 100%</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The sum weights of all objectives must add up to exactly 100% to send for manager verification.
                </p>
                <p className="text-[11px] font-black font-mono pt-1">
                  Current Status: <span className={totalWeight === 100 ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>{totalWeight}% / 100% allocated</span>
                </p>
              </div>
            </div>
          </div>

          {/* Batch submission call to action line */}
          <div className="border-t border-slate-200/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium font-sans">
              {cycleGoals.filter(g => g.status === 'Draft' || g.status === 'Revision Required').length === 0 ? (
                <span className="font-mono text-[11px] font-semibold text-slate-500">
                  No goals in queue. All objectives are already submitted or fully approved.
                </span>
              ) : (
                <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                  {cycleGoals.filter(g => g.status === 'Draft' || g.status === 'Revision Required').length} goal(s) ready for batch submission.
                </span>
              )}
            </div>

            {cycleGoals.filter(g => g.status === 'Draft' || g.status === 'Revision Required').length > 0 && (
              <button
                type="button"
                onClick={() => handleEmployeeSubmit()}
                className={`font-black py-2.5 px-6 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                  cycleGoals.length >= 2 && totalWeight === 100
                    ? 'bg-blue-900 hover:bg-blue-800 text-white active:scale-98'
                    : 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed opacity-80'
                }`}
              >
                <Send size={15} /> Send Goals Batch to Manager
              </button>
            )}
          </div>
        </section>
      )}

      {/* GOALS BATCH REVIEW CONTROLS (Manager Only) */}
      {currentUser.role === 'Manager' && targetEmployee.managerId === currentUser.id && (
        <section className="bg-slate-50 border border-slate-200.5 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <CheckSquare className="text-blue-900 shrink-0" size={18} />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide font-mono">
              Objectives Batch Review Desk
            </h3>
          </div>

          {batchReviewMsg && (
            <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              batchReviewMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <AlertCircle size={16} className={batchReviewMsg.type === 'success' ? 'text-emerald-700 shrink-0' : 'text-red-700 shrink-0'} />
              <span>{batchReviewMsg.text}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-black uppercase text-slate-500 font-mono">
                Unified Manager Review Comments / Feedback <span className="text-red-750">*</span>
              </label>
              <textarea
                placeholder="Type your unified feedback, required revisions, or approval comments for this goals portfolio batch..."
                value={batchComment}
                onChange={(e) => {
                  setBatchComment(e.target.value);
                  setBatchReviewError('');
                }}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs font-medium leading-relaxed"
                rows={3}
              />
              {batchReviewError && (
                <p className="text-red-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="text-red-600 shrink-0" /> {batchReviewError}
                </p>
              )}
            </div>
          </div>

          {/* Batch review action buttons */}
          <div className="border-t border-slate-200/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium font-sans">
              {cycleGoals.filter(g => g.status === 'Pending Approval').length === 0 ? (
                <span className="font-mono text-[11px] font-semibold text-slate-500">
                  No objectives in review queue. Subordinate has not submitted any draft goals for approval yet.
                </span>
              ) : (
                <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                  {cycleGoals.filter(g => g.status === 'Pending Approval').length} objective(s) awaiting batch decision.
                </span>
              )}
            </div>

            {cycleGoals.filter(g => g.status === 'Pending Approval').length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBatchReview('revision')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black py-2 px-5 rounded-xl cursor-pointer shadow-xs transition-all active:scale-98"
                >
                  Request Batch Revision
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchReview('reject')}
                  className="bg-red-700 hover:bg-red-800 text-white font-black py-2 px-5 rounded-xl cursor-pointer shadow-xs transition-all active:scale-98"
                >
                  Reject Batch
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchReview('approve')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-6 rounded-xl cursor-pointer shadow-md transition-all active:scale-98"
                >
                  Approve Entire Batch
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FORM OR LISTS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CREATE FORM PANEL */}
          {isCreating && (
            <div className="bg-white border border-slate-200.5 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Formulate Performance Metric</h3>
                <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 text-slate-500 rounded">Draft State</span>
              </div>
              
              {errorMsg && (
                <div className="bg-red-50 text-red-800 p-3.5 rounded-xl border border-red-100 flex items-center gap-2 text-xs">
                  <AlertCircle size={16} className="text-red-700 shrink-0" /> <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateGoalSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block font-bold text-slate-700">Goal Subject / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Expand Regional Retail Partnerships"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-2.5 outline-none font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">KPI Division Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none text-slate-800"
                    >
                      <option value="Business">Business Growth</option>
                      <option value="Technical">Technical Excellence</option>
                      <option value="People">People & Mentorship</option>
                      <option value="Development">Personal Development</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Detailed Scope / Description</label>
                  <textarea
                    placeholder="Provide a thorough, robust description of what this goal entails and why it matters..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-2.5 outline-none font-medium text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block font-bold text-slate-700">Quantitative Target Metric / Deliverable Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Onboard at least 15 local merchant partnerships"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-2.5 outline-none font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Success Threshold (Count/Value)</label>
                    <input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-slate-200.5 rounded-xl">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-750 flex items-center gap-1">Weight Allocation (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-black text-slate-800"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Define high/low priority weights. Current cycle sum: {totalWeight}%.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-750">Self Evidence Specification</label>
                    <input
                      type="text"
                      placeholder="Discuss expected proof (e.g. Signed contract files)"
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    Commit Draft Goal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MAIN GOALS DIRECTORY VIEW */}
          <div className="space-y-4">
            
            {/* WORKFLOW BANNER WARNING */}
            {relatedAppraisal && (
              <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                relatedAppraisal.isGoalApproved 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  : 'bg-indigo-50 text-indigo-900 border-indigo-100'
              }`}>
                <TrendingUp size={20} className="shrink-0 mt-0.5 text-blue-900" />
                <div>
                  <span className="font-bold flex items-center gap-1.5 uppercase font-mono text-[10px] tracking-wider">
                    {relatedAppraisal.isGoalApproved ? '✓ STAGE COMPLETED':'★ REVIEWS REQUIRED'}
                  </span>
                  <p className="mt-1 leading-relaxed text-[11px] font-medium font-sans">
                    {relatedAppraisal.isGoalApproved 
                      ? "Success! All performance objectives for this cycle have been approved. The appraisal stage has transitioned to Employee Self-Assessment."
                      : "Direct manager must verify and approve every goal. Self-assessment and further appraisal steps are locked until all goals are approved."
                    }
                  </p>
                </div>
              </div>
            )}

            {/* CARDS FEED LIST */}
            {cycleGoals.length === 0 ? (
              <div className="bg-slate-50/50 border border-slate-200.5 rounded-2xl p-12 text-center text-slate-500 font-sans">
                <CheckSquare size={48} className="mx-auto text-slate-300 mb-2.5" />
                <h4 className="text-sm font-bold text-slate-800">No performance objectives formulated yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
                  Create and submit performance goals to align with H1 business directions.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {cycleGoals.map((goal) => {
                  const isCurrentEditing = editingGoalId === goal.id;
                  
                  // Status badges colors mapping
                  const statusColors: Record<string, string> = {
                    'Draft': 'bg-slate-100 text-slate-700 border-slate-250',
                    'Pending Approval': 'bg-blue-50 text-blue-800 border-blue-200',
                    'Revision Required': 'bg-amber-50 text-amber-800 border-amber-200',
                    'Approved': 'bg-emerald-50 text-emerald-800 border-emerald-250',
                    'Rejected': 'bg-red-50 text-red-800 border-red-200'
                  };

                  const canEmployeeEdit = currentUser.role === 'Employee' && (goal.status === 'Draft' || goal.status === 'Revision Required');

                  return (
                    <div 
                      key={goal.id} 
                      className="bg-white border border-slate-200 focus-within:border-slate-350 rounded-2xl p-5 md:p-6 shadow-3xs relative overflow-hidden transition-all"
                    >
                      {/* TOP BADGE BANNER */}
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-50/50 border border-blue-100/50 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-md font-mono uppercase tracking-wider">
                            {goal.category}
                          </span>
                          <span className={`text-[10px] font-black border uppercase px-2.5 py-0.5 rounded-xl font-mono ${statusColors[goal.status] || 'bg-slate-50 text-slate-500'}`}>
                            ● {goal.status}
                          </span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-black px-2.5 py-0.5 rounded-md border border-indigo-200">
                            Weight: <span className="font-extrabold">{goal.weight}%</span>
                          </span>
                        </div>

                        {/* Top Employee draft deletions AND HR deletions */}
                        {( (currentUser.role === 'Employee' && goal.status === 'Draft') || currentUser.role === 'HR') && !isCurrentEditing && (
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            title={currentUser.role === 'HR' ? "Force Delete Goal (HR Override)" : "Delete Draft Goal"}
                            className="bg-red-50 border border-red-100 text-red-700 hover:text-red-900 hover:bg-red-100 p-1.5 rounded-lg transition-colors cursor-pointer text-xs"
                          >
                            <Trash size={13} />
                          </button>
                        )}
                      </div>

                      {/* EDIT CARD FORM STATE */}
                      {isCurrentEditing ? (
                        <div className="space-y-4 text-xs font-sans">
                          <div className="border-b border-slate-100 pb-2 mb-2 font-mono text-slate-400 uppercase text-[10px] font-black">
                            ✏ Edit Goal: {goal.title}
                          </div>

                          {editErrorMsg && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl font-bold flex items-center gap-2">
                              <AlertCircle size={15} /> {editErrorMsg}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2 space-y-1">
                              <label className="block font-bold text-slate-705">Goal Title</label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2 outline-none font-medium text-slate-850"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-705">Category</label>
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold outline-none"
                              >
                                <option value="Business">Business</option>
                                <option value="Technical">Technical</option>
                                <option value="People">People</option>
                                <option value="Development">Development</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-slate-705">Description Scope</label>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2 outline-none font-medium leading-relaxed text-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2 space-y-1">
                              <label className="block font-bold text-slate-705">Quantitative Target Metric</label>
                              <input
                                type="text"
                                value={editTarget}
                                onChange={(e) => setEditTarget(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-705">Target Success Value</label>
                              <input
                                type="number"
                                value={editTargetValue}
                                onChange={(e) => setEditTargetValue(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-700">Goal Weight (%)</label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={editWeight}
                                onChange={(e) => setEditWeight(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-700">Proof Evidence Notes</label>
                              <input
                                type="text"
                                value={editEvidence}
                                onChange={(e) => setEditEvidence(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1.5 font-medium"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={cancelEditing}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 px-3.5 rounded-xl cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(goal.id)}
                              className="bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer shadow-xs"
                            >
                              Save Draft Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* DISPLAY GOAL DETAILS */
                        <div className="space-y-4">
                          
                          {/* Title & Description */}
                          <div className="space-y-1 select-text">
                            <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug">{goal.title}</h4>
                            <p className="text-xs text-slate-600/90 leading-relaxed font-sans">{goal.description}</p>
                          </div>

                          {/* Target KPIs spec */}
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1 select-text">
                            <div>
                              <span className="font-bold uppercase tracking-wider text-slate-400 text-[9px] font-mono block">Quantitative Benchmark Target</span>
                              <p className="font-extrabold text-blue-955">{goal.target}</p>
                            </div>
                            <div className="flex justify-between items-center bg-white border border-slate-200/50 p-2 rounded-lg mt-2 font-mono text-[11px]">
                              <span>Success Threshold: <strong className="text-slate-800 font-black">{goal.targetValue} counts</strong></span>
                              <span>Last Updated: <strong className="text-slate-500 font-medium">{new Date(goal.lastUpdated).toLocaleDateString()}</strong></span>
                            </div>
                          </div>

                          {/* REBUTTALS OR HISTORIC AUDIT FLAGS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] select-text">
                            {/* Evidence display */}
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
                              <Send size={14} className="text-slate-400" />
                              <span className="leading-normal font-sans font-medium text-slate-550">
                                <strong>Evidence notes:</strong> {goal.evidence || 'No documentation proof scheduled yet.'}
                              </span>
                            </div>

                            {/* Verification/Approved By display */}
                            {goal.status === 'Approved' && (
                              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-800">
                                <Check size={14} className="shrink-0" />
                                <span className="leading-normal font-sans">
                                  Digitally authorized by <strong>{goal.approvedBy}</strong> on <strong>{goal.approvedDate ? new Date(goal.approvedDate).toLocaleDateString() : 'N/A'}</strong>.
                                </span>
                              </div>
                            )}

                            {/* Revision Comment Display */}
                            {goal.status === 'Revision Required' && goal.managerComment && (
                              <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 flex items-start gap-2 text-amber-850 md:col-span-2">
                                <Clock size={14} className="shrink-0 mt-0.5" />
                                <div className="leading-snug">
                                  <strong className="block uppercase text-[9px] font-mono tracking-wider">Manager Revision Comment:</strong>
                                  <span className="font-medium italic">"{goal.managerComment}"</span>
                                </div>
                              </div>
                            )}

                            {/* Rejected Comment Display */}
                            {goal.status === 'Rejected' && goal.managerComment && (
                              <div className="bg-red-50/75 p-2.5 rounded-xl border border-red-100 flex items-start gap-2 text-red-900 md:col-span-2">
                                <XCircle size={14} className="shrink-0 mt-0.5 font-bold" />
                                <div className="leading-snug">
                                  <strong className="block uppercase text-[9px] font-mono tracking-wider">Rejection Reason:</strong>
                                  <span className="font-medium italic">"{goal.managerComment}"</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* ACTION PANEL FOOTER */}
                          <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
                            
                            <div className="text-[11px] text-slate-400 font-mono select-none">
                              {goal.submittedDate ? `Submitted: ${new Date(goal.submittedDate).toLocaleDateString()}`: 'Not submitted yet'}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Employee Actions */}
                              {currentUser.role === 'Employee' && (
                                <>
                                  {/* Edit button */}
                                  {canEmployeeEdit && (
                                    <button
                                      onClick={() => startEditing(goal)}
                                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black py-1.5 px-3.5 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                                    >
                                      <Edit2 size={13} /> Edit Goal
                                    </button>
                                  )}

                                  {/* Wait label for Pending Approval */}
                                  {goal.status === 'Pending Approval' && (
                                    <span className="text-slate-400 font-mono text-[11px] bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                                      Waiting for Manager Approval
                                    </span>
                                  )}
                                </>
                              )}

                              {/* Manager Actions (Show ONLY on goals belonging to direct reports!) */}
                              {currentUser.role === 'Manager' && targetEmployee.managerId === currentUser.id && (
                                <>
                                  {goal.status === 'Pending Approval' ? (
                                    <span className="text-slate-400 font-mono text-[11px] bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                                      Review Pending (Use Batch Review Desk)
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400 font-mono border italic px-3 py-1 bg-slate-50 border-slate-150 rounded-xl">
                                      Workflow Status Cleared
                                    </span>
                                  )}
                                </>
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

        </div>

        {/* RIGHT COLUMN: DETAIL WORKPLACE CONTEXTS */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* PROFILE SUMMARY */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" /> Active Employee Space
            </h4>

            <div className="flex items-center gap-3">
              <img
                src={targetEmployee.avatar}
                alt={targetEmployee.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="leading-tight text-xs select-text">
                <span className="font-extrabold text-slate-900 text-sm block leading-snug">{targetEmployee.name}</span>
                <span className="text-slate-500 font-bold block">{targetEmployee.title}</span>
                <span className="text-slate-400 font-mono block text-[10px] uppercase mt-0.5">{targetEmployee.department}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1.5 border-t border-slate-100">
              <div className="flex justify-between text-slate-500 border-b border-slate-100 py-1.5">
                <span>Cycle Code</span>
                <span className="font-black text-slate-805 font-mono">{activeCycle?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-500 border-b border-slate-100 py-1.5">
                <span>Direct Goals</span>
                <span className="font-black text-slate-800 font-mono">{cycleGoals.length}</span>
              </div>
              <div className="flex justify-between text-slate-500 border-b border-slate-100 py-1.5">
                <span>Approved Goals</span>
                <span className="font-black text-emerald-800 font-mono">✓ {countApproved}</span>
              </div>
              <div className="flex justify-between text-slate-500 py-1.5">
                <span>Pending Review</span>
                <span className="font-black text-blue-800 font-mono">⏳ {countPending}</span>
              </div>
            </div>
          </div>

          {/* POLICY ADVICE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-3 leading-relaxed text-xs text-slate-600/90 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-slate-400" /> Corporate KPI Policies
            </h4>
            <p>
              1. Employees can create/edit goals in <strong>Draft</strong> or <strong>Revision Required</strong>.
            </p>
            <p>
              2. Editing is disabled on <strong>Approved</strong> and <strong>Rejected</strong> goals.
            </p>
            <p>
              3. Initiating appraisal reviews is blocked if any goal status does not equal <strong>Approved</strong>.
            </p>
          </div>

        </aside>

      </div>

    </div>
  );
};
