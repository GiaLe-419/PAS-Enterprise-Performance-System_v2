import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Appraisal, User } from '../types';
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
  X
} from 'lucide-react';

interface AppraisalWorkflowViewProps {
  selectedAppraisalId: string | null;
  setSelectedAppraisalId: (id: string | null) => void;
}

export const AppraisalWorkflowView: React.FC<AppraisalWorkflowViewProps> = ({ 
  selectedAppraisalId, 
  setSelectedAppraisalId 
}) => {
  const { 
    currentUser, 
    appraisals, 
    users, 
    activeCycle, 
    saveSelfAppraisal, 
    saveManagerAppraisal,
    signOffEmployee,
    signOffManager,
    requestPeerFeedback,
    submitPeerFeedback,
    cancelPeerReviewRequest,
    expirePeerReviewRequest,
    requestAdditionalFeedback,
    submitAdditionalFeedback,
    overrideAppraisal,
    goals,
    updateGoal
  } = useApp();

  // Find appraisal records to display based on Role and Assignment permissions
  const visibleAppraisals = appraisals.filter(a => {
    if (a.cycleId !== activeCycle?.id) return false;
    
    // HR and SeniorLeader see everything
    if (currentUser.role === 'HR' || currentUser.role === 'SeniorManager') return true;
    
    // Managers see themselves and direct reports
    if (currentUser.role === 'Manager') {
      const emp = users.find(u => u.id === a.employeeId);
      return a.employeeId === currentUser.id || emp?.managerId === currentUser.id;
    }
    
    // Check if current user is invited to provide additional feedback
    const isRequestedReviewer = (a.feedbackRequests || []).some(req => req.reviewerId === currentUser.id) ||
                                (a.peerReviews || []).some(pr => pr.reviewerId === currentUser.id);
    
    // Regular employees see their own appraisal only, or appraisals they are invited to review
    return a.employeeId === currentUser.id || isRequestedReviewer;
  });

  // Set default appraisal if not selected
  useEffect(() => {
    if (!selectedAppraisalId && visibleAppraisals.length > 0) {
      const ownAppDoc = visibleAppraisals.find(a => a.employeeId === currentUser.id);
      if (ownAppDoc) {
        setSelectedAppraisalId(ownAppDoc.id);
      } else {
        setSelectedAppraisalId(visibleAppraisals[0].id);
      }
    }
  }, [selectedAppraisalId, visibleAppraisals, setSelectedAppraisalId, currentUser.id]);

  // Handle active appraisal lookups securely
  let activeAppraisal = appraisals.find(a => a.id === selectedAppraisalId);
  if (!activeAppraisal && visibleAppraisals.length > 0) {
    const ownAppDoc = visibleAppraisals.find(a => a.employeeId === currentUser.id);
    activeAppraisal = ownAppDoc || visibleAppraisals[0];
  }

  // Safeguard: standard employees must not access another employee's standard appraisal details
  const isManagerOrHR = currentUser.role === 'Manager' || currentUser.role === 'HR' || currentUser.role === 'SeniorManager';
  if (activeAppraisal && activeAppraisal.employeeId !== currentUser.id && !isManagerOrHR) {
    const isRequestedReviewer = (activeAppraisal.feedbackRequests || []).some(req => req.reviewerId === currentUser.id) ||
                                (activeAppraisal.peerReviews || []).some(pr => pr.reviewerId === currentUser.id);
    if (!isRequestedReviewer) {
      const myAppraisal = appraisals.find(a => a.employeeId === currentUser.id && a.cycleId === activeCycle?.id);
      if (myAppraisal) {
        activeAppraisal = myAppraisal;
      }
    }
  }

  // Self Appraisal form states
  const [strengths, setStrengths] = useState('');
  const [opportunities, setOpportunities] = useState('');
  const [blockers, setBlockers] = useState('');

  // Additional feedback form states
  const [additionalFeedbackContent, setAdditionalFeedbackContent] = useState('');

  // Structured Peer Feedback form states
  const [collaboration, setCollaboration] = useState(4);
  const [communication, setCommunication] = useState(4);
  const [problemSolving, setProblemSolving] = useState(4);
  const [leadership, setLeadership] = useState(3);
  const [teamwork, setTeamwork] = useState(3);
  const [accountability, setAccountability] = useState(3);
  const [peerComments, setPeerComments] = useState('');
  
  // Manager appraisal form states
  const [ratingGoals, setRatingGoals] = useState(3.0);
  const [ratingComp, setRatingComp] = useState(3.0);
  const [managerJustification, setManagerJustification] = useState('');
  const [inflationAck, setInflationAck] = useState(false);
  
  // Interactive additional feedback selection states
  const [selectedReviewerToAdd, setSelectedReviewerToAdd] = useState('');

  // Sign off form states
  const [employeeReflections, setEmployeeReflections] = useState('');
  const [employeeRebuttal, setEmployeeRebuttal] = useState('');
  const [managerFinalComments, setManagerFinalComments] = useState('');

  // Local helper states
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [selectedPeerFeedbackForModal, setSelectedPeerFeedbackForModal] = useState<any>(null);
  const [selectedAdditionalFeedbackForModal, setSelectedAdditionalFeedbackForModal] = useState<any>(null);

  // Self Appraisal form states
  useEffect(() => {
    if (activeAppraisal) {
      setStrengths(activeAppraisal.selfAppraisal.strengths || '');
      setOpportunities(activeAppraisal.selfAppraisal.opportunities || '');
      setBlockers(activeAppraisal.selfAppraisal.blockers || '');
      
      setRatingGoals(activeAppraisal.managerAppraisal.ratingGoals || 3.0);
      setRatingComp(activeAppraisal.managerAppraisal.ratingCompetencies || 3.0);
      setManagerJustification(activeAppraisal.managerAppraisal.justification || '');
      setInflationAck(activeAppraisal.managerAppraisal.inflationAcknowledged || false);

      setEmployeeReflections(activeAppraisal.signOff.employeeReflections || '');
      setEmployeeRebuttal(activeAppraisal.signOff.employeeRebuttal || '');
      setManagerFinalComments(activeAppraisal.signOff.managerFinalComments || '');
      setFormMsg({ type: '', text: '' });
    }
  }, [selectedAppraisalId, activeAppraisal]);

  // Check if there are any pending review tasks for the current user
  const pendingPeerReviewsCount = appraisals.filter(a => 
    (a.peerReviews || []).some(pr => pr.reviewerId === currentUser.id && pr.status === 'Requested')
  ).length;

  const pendingFeedbackRequestsCount = appraisals.filter(a => 
    (a.feedbackRequests || []).some(req => req.reviewerId === currentUser.id && req.status === 'Pending')
  ).length;

  const totalPendingTasks = pendingPeerReviewsCount + pendingFeedbackRequestsCount;

  if (!activeAppraisal) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        No matching employee appraisals located in active cycles.
      </div>
    );
  }

  const employeeUser = users.find(u => u.id === activeAppraisal.employeeId);
  const managerUser = employeeUser ? users.find(u => u.id === employeeUser.managerId) : null;
  const managerName = managerUser?.name || 'Direct Manager';
  const appraisalGoals = goals.filter(g => g.employeeId === activeAppraisal.employeeId && g.cycleId === activeAppraisal.cycleId);

  const isPendingRespondent = activeAppraisal.feedbackRequests?.some(
    req => req.reviewerId === currentUser.id && req.status === 'Pending'
  );

  const isPendingStructuredRespondent = activeAppraisal.peerReviews?.some(
    pr => pr.reviewerId === currentUser.id && pr.status === 'Requested'
  );

  if (!employeeUser) return null;

  // Render Self Appraisal panel
  const handleEmployeeSelfSubmit = (isSubmit: boolean) => {
    setFormMsg({ type: '', text: '' });

    if (isSubmit && (!strengths.trim() || !opportunities.trim())) {
      setFormMsg({ type: 'error', text: 'Strengths and development opportunities commentary fields are mandatory for submission.' });
      return;
    }

    saveSelfAppraisal(activeAppraisal.id, strengths, opportunities, blockers, isSubmit);
    setFormMsg({ 
      type: 'success', 
      text: isSubmit ? 'Self-appraisal submitted successfully to manager workflow queue.' : 'Self-appraisal draft details saved locally.' 
    });
  };

  const handleAdditionalFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!additionalFeedbackContent.trim()) {
      setFormMsg({ type: 'error', text: 'Feedback content cannot be empty.' });
      return;
    }
    submitAdditionalFeedback(activeAppraisal.id, additionalFeedbackContent);
    setAdditionalFeedbackContent('');
    setFormMsg({ type: 'success', text: 'Thank you for your feedback.' });
  };

  const handlePeerFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    if (!peerComments.trim() || peerComments.length < 30) {
      setFormMsg({ type: 'error', text: 'Peer evaluation comments must be at least 30 characters in length to provide descriptive clarity.' });
      return;
    }

    submitPeerFeedback(
      activeAppraisal.id,
      currentUser.id,
      {
        collaboration,
        communication,
        problemSolving,
        leadership,
        teamwork,
        accountability
      },
      peerComments,
      '', // strengths removed
      ''  // opportunities removed
    );

    setPeerComments('');
    setFormMsg({ type: 'success', text: 'Additional feedback form anonymously logged to workspace ledger.' });
  };

  // Render Manager Appraisal submit
  const calculatedSum = parseFloat(((ratingGoals * 0.7) + (ratingComp * 0.3)).toFixed(2));
  const isExtremeScore = calculatedSum >= 4.8 || calculatedSum <= 2.2;
  const justificationLength = managerJustification.trim().length;
  const isJustificationValid = !isExtremeScore || justificationLength >= 250;

  // Check inflation: if managers average reviews is high, alert
  const showInflationAlert = calculatedSum > 4.2;

  const handleManagerAppraisalSubmit = (isSubmit: boolean) => {
    setFormMsg({ type: '', text: '' });

    if (isSubmit) {
      if (isExtremeScore && !isJustificationValid) {
        setFormMsg({ 
          type: 'error', 
          text: `Business rule violation: Score ratings of ${calculatedSum} are flagged as extreme cohort deviations. Detailed Manager Justification must be at least 250 characters (Current count: ${justificationLength} chars).` 
        });
        return;
      }
      if (showInflationAlert && !inflationAck) {
        setFormMsg({ 
          type: 'error', 
          text: 'Inflation check warning: Please review rating distribution bell guidelines and acknowledge compliance checking of standard limits.' 
        });
        return;
      }
    }

    saveManagerAppraisal(activeAppraisal.id, ratingGoals, ratingComp, managerJustification, isSubmit, inflationAck);
    setFormMsg({ 
      type: 'success', 
      text: isSubmit ? 'Manager appraisal submitted successfully. Proceeding to calibration alignment window.' : 'Manager appraisal draft saved.' 
    });
  };

  // Render digital signatures routines
  const handleEmployeeSignComplete = () => {
    setFormMsg({ type: '', text: '' });
    if (!employeeReflections.trim()) {
      setFormMsg({ type: 'error', text: 'Please type descriptive final reflections before digital sign-off and approval.' });
      return;
    }
    signOffEmployee(activeAppraisal.id, employeeReflections, employeeRebuttal);
    setFormMsg({ type: 'success', text: 'Self digital signature stamped. Awaiting manager validation signature.' });
  };

  const handleManagerSignComplete = () => {
    setFormMsg({ type: '', text: '' });
    signOffManager(activeAppraisal.id, managerFinalComments);
    setFormMsg({ type: 'success', text: 'Direct Manager signature completed. Appraisal record locked and indexed in global talent registries.' });
  };

  // HR BP overrides / unlock
  const handleHRUnlock = () => {
    overrideAppraisal(activeAppraisal.id, 'ManagerAppraisal');
    setFormMsg({ type: 'success', text: 'Unlocked: Appraisal records reverted back to Manager Evaluation.' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* Upper select selector across all evaluations */}
      <section className="bg-white border border-slate-200.5 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 select-text">
          <div className="bg-indigo-900 text-white p-2.5 rounded-lg shrink-0">
            <FolderLock size={20} />
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono">Appraisals Matrix Workbench</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-slate-500 font-semibold font-sans">Active Target Employee Record:</span>
              <select
                value={activeAppraisal.id}
                onChange={(e) => setSelectedAppraisalId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-indigo-900 p-0 pr-8 cursor-pointer focus:ring-0 outline-none"
              >
                {visibleAppraisals.map((apr) => {
                  const subUser = users.find(u => u.id === apr.employeeId);
                  
                  return (
                    <option key={apr.id} value={apr.id}>
                      {subUser?.name} {apr.employeeId === currentUser.id ? '(My Appraisal)' : ''} — {apr.currentStage}
                      {(apr.peerReviews || []).some(pr => pr.reviewerId === currentUser.id && pr.status === 'Requested') ? ' [Action Required]' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Audit trail sequence helper tracker */}
        <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto pb-1 max-w-full scrollbar-none">
          {(() => {
            const rawStages = [
              { tag: 'GoalSetup', label: '1. Goals' },
              { tag: 'SelfAppraisal', label: '2. Self' },
              { tag: 'ManagerAppraisal', label: '3. Mgr Review' },
              { tag: 'Calibration', label: '4. Calibrate' },
              { tag: 'SignOff', label: '5. Sign' },
              { tag: 'Completed', label: '6. Sealed' }
            ];

            const stageSequence = rawStages.map(s => s.tag);

            return rawStages.map((step, idx) => {
              const mappedCurrentStage = activeAppraisal.currentStage;
              const currentIdx = stageSequence.indexOf(mappedCurrentStage);
              const stepIdx = stageSequence.indexOf(step.tag);
              const isFinished = currentIdx > stepIdx;
              const isCurrent = mappedCurrentStage === step.tag;

              return (
                <React.Fragment key={step.tag}>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                    isCurrent 
                      ? 'bg-blue-900 text-white font-black' 
                      : isFinished 
                        ? 'bg-slate-100 text-slate-500 line-through' 
                        : 'bg-slate-50 text-slate-350'
                  }`}>
                    {step.label}
                  </span>
                  {idx < rawStages.length - 1 && <ChevronRight size={10} className="text-slate-300 shrink-0" />}
                </React.Fragment>
              );
            });
          })()}
        </div>
      </section>

      {/* Messaging overlay */}
      {formMsg.text && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 font-sans ${
          formMsg.type === 'error' 
            ? 'bg-red-50 text-red-900 border-red-105' 
            : 'bg-emerald-50 text-emerald-850 border-emerald-100'
        }`}>
          <AlertCircle size={16} />
          <span className="font-semibold">{formMsg.text}</span>
        </div>
      )}

      {/* Layout Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left main interactive work spaces */}
        <div className="lg:col-span-8 space-y-6">
          {/* RESPONDENT VIEW: PROVIDE ADDITIONAL FEEDBACK */}
          {isPendingRespondent && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-purple-100 pb-3">
                <HelpCircle size={20} className="text-purple-700" />
                <div>
                  <h3 className="text-sm font-bold text-purple-950 uppercase tracking-wider font-mono">Feedback Request: {employeeUser.name}</h3>
                  <p className="text-[10px] text-purple-600 mt-0.5">Manager has requested your qualitative input for this review cycle.</p>
                </div>
              </div>
              
              <form onSubmit={handleAdditionalFeedbackSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">Your Feedback & Observations</label>
                  <textarea
                    placeholder="Share your experience working with this colleague. Focus on collaboration, impact, and growth."
                    value={additionalFeedbackContent}
                    onChange={(e) => setAdditionalFeedbackContent(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-lg p-3 text-xs outline-none font-medium leading-relaxed shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-900 hover:bg-purple-800 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                >
                  Submit Additional Feedback
                </button>
              </form>
            </div>
          )}

          {/* RESPONDENT VIEW: PROVIDE STRUCTURED PEER FEEDBACK */}
          {isPendingStructuredRespondent && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-indigo-100 pb-3">
                <Star size={20} className="text-indigo-700" />
                <div>
                  <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider font-mono">Structured Peer Evaluation: {employeeUser.name}</h3>
                  <p className="text-[10px] text-indigo-600 mt-0.5">Please provide quantitative and qualitative feedback to support your colleague's professional development.</p>
                </div>
              </div>
              
              <form onSubmit={handlePeerFeedbackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Collaboration (Hợp tác)', state: collaboration, setter: setCollaboration },
                    { label: 'Communication (Giao tiếp)', state: communication, setter: setCommunication },
                    { label: 'Problem Solving (Giải quyết VĐ)', state: problemSolving, setter: setProblemSolving },
                    { label: 'Leadership (Lãnh đạo)', state: leadership, setter: setLeadership },
                    { label: 'Teamwork (Làm việc nhóm)', state: teamwork, setter: setTeamwork },
                    { label: 'Accountability (Trách nhiệm)', state: accountability, setter: setAccountability }
                  ].map((field) => (
                    <div key={field.label} className="bg-white p-3 rounded-lg border border-indigo-100 space-y-1.5 transition-shadow hover:shadow-sm">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-700">{field.label}</label>
                        <span className="text-[11px] font-mono font-extrabold text-indigo-600 flex items-center gap-1">
                          {field.state}.0 <Star size={10} fill="currentColor" />
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        step="1" 
                        value={field.state} 
                        onChange={(e) => field.setter(Number(e.target.value))} 
                        className="w-full accent-indigo-600 h-1 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">Detailed Observations (Min. 30 chars)</label>
                  <textarea
                    placeholder="Provide specific examples of impact, behaviors, and outcomes..."
                    value={peerComments}
                    onChange={(e) => setPeerComments(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-indigo-200 focus:border-indigo-500 rounded-lg p-3 text-xs outline-none font-medium leading-relaxed shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                >
                  Submit Structured Evaluation
                </button>
              </form>
            </div>
          )}

          {/* STATE 0: GOALS NOT APPROVED block */}
          {activeAppraisal.currentStage === 'GoalSetup' && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 font-sans space-y-3">
              <AlertCircle size={40} className="text-amber-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-850">Goals Pending Verification Setup</h3>
              <p className="text-xs text-slate-550 max-w-md mx-auto leading-relaxed">
                Before commencing self-appraisal procedures, direct managers must review and digitally authorize proposed goals inside the <strong className="text-blue-900">KPI & Goals Desk</strong>.
              </p>
              {currentUser.role === 'Manager' && (
                <button
                  onClick={() => setSelectedAppraisalId(activeAppraisal.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-lg text-xs cursor-pointer shadow-sm transition-all"
                >
                  Inspect Employee Goals
                </button>
              )}
            </div>
          )}

          {/* STATE 1: EMPLOYEE SELF-APPRAISAL SCREEN */}
          {activeAppraisal.currentStage === 'SelfAppraisal' && (
            <div className="bg-white border border-slate-204 rounded-xl p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Employee Self-Appraisal Form</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Author: {employeeUser.name} — Review details carefully.</p>
                </div>
                <span className="bg-blue-50 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-105">
                  Phase 2 of 6
                </span>
              </div>

              {!(appraisalGoals.length > 0 && appraisalGoals.every(g => g.status === 'Approved')) ? (
                <div className="bg-amber-50 border border-amber-250 rounded-xl p-6 text-center space-y-3 font-sans">
                  <AlertCircle size={36} className="text-amber-600 mx-auto" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-mono">Self-Appraisal Locked</h4>
                  <p className="text-xs text-amber-850 max-w-sm mx-auto leading-normal font-semibold">
                    All goals must be approved before self-appraisal can begin.
                  </p>
                </div>
              ) : currentUser.role === 'Employee' && currentUser.id === employeeUser.id && activeAppraisal.selfAppraisal.status === 'Draft' ? (
                <div className="space-y-4 text-xs font-sans">
                  {/* Goals reference checklist box */}
                  <div className="bg-slate-50 border border-slate-200.5 rounded-lg p-3">
                    <span className="font-bold text-slate-650 block mb-1">Your Metrics Progress Reference:</span>
                    <ul className="space-y-1 text-[11px] text-slate-500">
                      {appraisalGoals.map(g => (
                        <li key={g.id} className="flex justify-between font-medium">
                          <span>• {g.title}</span>
                          <span className="text-indigo-900 font-bold">
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={g.progress} 
                              onChange={(e) => updateGoal(g.id, { progress: Number(e.target.value) })}
                              className="w-12 bg-white border border-slate-200 rounded text-right font-bold text-indigo-900"
                            /> % actual
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">What are your primary cycle achievements & strengths?</label>
                    <textarea
                      placeholder="Discuss custom value delivered, major project completions, and team support."
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2.5 outline-none font-medium leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">What are your key development & growth opportunities?</label>
                    <textarea
                      placeholder="Outline future training goals, technical skills vectors, or certification steps."
                      value={opportunities}
                      onChange={(e) => setOpportunities(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2.5 outline-none font-medium leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Identify blockers, constraints, or resources required (Optional)</label>
                    <textarea
                      placeholder="Discuss project bottlenecks, external supplier lockouts, or operational friction points."
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2.5 outline-none font-medium leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleEmployeeSelfSubmit(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-lg cursor-pointer transition-all"
                    >
                      Save Progress Draft
                    </button>
                    <button
                      onClick={() => handleEmployeeSelfSubmit(true)}
                      className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Check size={14} /> Submit Final Reflections
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs select-text">
                  {activeAppraisal.selfAppraisal.status === 'Submitted' ? (
                    <div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-200 leading-relaxed font-sans text-slate-700">
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Employee Strengths</span>
                        <p>{activeAppraisal.selfAppraisal.strengths}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Development Areas</span>
                        <p>{activeAppraisal.selfAppraisal.opportunities}</p>
                      </div>
                      {activeAppraisal.selfAppraisal.blockers && (
                        <div>
                           <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Blockers noted</span>
                           <p>{activeAppraisal.selfAppraisal.blockers}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono select-none">Submitted at: {activeAppraisal.selfAppraisal.submittedAt}</p>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-xs italic font-sans">
                      Self-appraisal draft is currently being completed by the employee. Switch to Employee role to edit it.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}



          {/* STATE 3: MANAGER APPRAISAL REVIEW SCREEN */}
          {activeAppraisal.currentStage === 'ManagerAppraisal' && (
            <div className="bg-white border border-slate-250.5 rounded-xl p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center bg-slate-50/20 px-1">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-505 font-mono flex items-center gap-1.5">
                    Manager Review Appraisal Workspace
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Assessor: {managerName} — Scoring and justification validations.</p>
                </div>
                <span className="bg-amber-55 text-amber-900 border border-amber-205 text-[10px] font-bold px-2 py-0.5 rounded">
                  Phase 3 of 6
                </span>
              </div>

              {currentUser.role === 'Manager' ? (
                <div className="space-y-5 text-xs font-sans">
                  {/* Professional Peer Review (360 Feedback) Panel */}
                  <div className="bg-indigo-50/20 border border-indigo-100 rounded-3xl p-8 space-y-8 shadow-sm">
                    {/* Row 1: Header & Guidance Context */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-5 border-b border-indigo-100 pb-5">
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20">
                          <Star size={18} fill="white" />
                        </div>
                        <h4 className="text-sm font-bold text-indigo-950 uppercase tracking-[0.15em] font-mono">Peer Evaluation Workbench</h4>
                      </div>
                      <div className="hidden lg:block w-px h-6 bg-indigo-200"></div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-2xl">
                        Invite multi-rater input to gain comprehensive performance insights. cross-functional collaboration intelligence helps finalize a holistic employee profile.
                      </p>
                    </div>

                    {/* Row 2: Interactive Selection & Action */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-2xl border border-indigo-100 shadow-sm w-fit">
                        <select
                          value={selectedReviewerToAdd}
                          onChange={(e) => setSelectedReviewerToAdd(e.target.value)}
                          className="text-[11px] bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl outline-none text-slate-700 min-w-[220px] focus:border-indigo-500 transition-all cursor-pointer font-medium"
                        >
                          <option value="">-- Select Colleague Evaluator --</option>
                          {users
                            .filter(u => 
                              u.id !== activeAppraisal.employeeId && 
                              u.id !== currentUser.id &&
                              !(activeAppraisal.peerReviews || []).some(pr => pr.reviewerId === u.id) &&
                              !(activeAppraisal.feedbackRequests || []).some(fr => fr.reviewerId === u.id)
                            )
                            .map(u => (
                              <option key={u.id} value={u.id}>{u.name} — {u.department}</option>
                            ))
                          }
                        </select>
                        <button 
                          onClick={() => {
                            if (selectedReviewerToAdd) {
                              requestPeerFeedback(activeAppraisal.id, [selectedReviewerToAdd]);
                              setSelectedReviewerToAdd('');
                              setFormMsg({ type: 'success', text: 'Evaluation invitation successfully dispatched to colleague corridor.' });
                            }
                          }}
                          disabled={!selectedReviewerToAdd}
                          className="text-[11px] font-bold bg-indigo-900 text-white px-7 py-2.5 rounded-xl hover:bg-indigo-800 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                        >
                          Dispatch Invitation
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {(activeAppraisal.peerReviews || []).length > 0 && (
                        <div className="bg-white/60 p-4 border border-indigo-100 rounded-xl flex flex-col gap-3 shadow-xs">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-1">Active Peer Invitations Registry</span>
                          <div className="flex flex-col gap-2">
                            {activeAppraisal.peerReviews.map(pr => {
                              const badgeStyles = 
                                pr.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                pr.status === 'Requested' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                pr.status === 'Cancelled' ? 'bg-slate-50 text-slate-500 border-slate-200 opacity-60' :
                                pr.status === 'Expired' ? 'bg-rose-50 text-rose-700 border-rose-200 opacity-60' :
                                'bg-slate-50 text-slate-500 border-slate-150';

                              return (
                                <div key={pr.id} className={`text-xs px-4 py-2.5 rounded-lg border flex items-center justify-between font-medium transition-all ${badgeStyles}`}>
                                  <div className="flex items-center gap-3">
                                    {pr.status === 'Completed' ? (
                                      <div className="bg-emerald-500 text-white p-0.5 rounded-full">
                                        <Star size={12} fill="white" />
                                      </div>
                                    ) : (
                                      <div className={`w-2 h-2 rounded-full ${pr.status === 'Requested' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                                    )}
                                    <div className="flex flex-col">
                                      <span className="font-bold text-[13px]">{pr.reviewerName}</span>
                                      <span className="text-[10px] opacity-70 font-bold uppercase tracking-tighter">Status: {pr.status}</span>
                                    </div>
                                  </div>
                                  
                                  {(pr.status === 'Requested') && (
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          cancelPeerReviewRequest(activeAppraisal.id, pr.id);
                                        }}
                                        className="bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                                      >
                                        Cancel Request
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {/* Qualitative feedback requests hidden per user request to target only structured evaluations */}
                          </div>
                        </div>
                      )}
                      
                      {/* Evaluation summary grid removed per user request */}
                    </div>
                  </div>

                  {/* Score adjustment cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-205 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between font-bold text-slate-750">
                        <span>Objectives score (70%)</span>
                        <span className="font-mono font-bold text-blue-900">{ratingGoals.toFixed(1)} / 5.0</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        value={ratingGoals}
                        onChange={(e) => setRatingGoals(Number(e.target.value))}
                        className="w-full accent-blue-900 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Assessed directly against employee KPI completions.</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-205 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between font-bold text-slate-755">
                        <span>Core Competencies score (30%)</span>
                        <span className="font-mono font-bold text-blue-900">{ratingComp.toFixed(1)} / 5.0</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        value={ratingComp}
                        onChange={(e) => setRatingComp(Number(e.target.value))}
                        className="w-full accent-blue-900 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Assessed against innovation, team play, and communication standards.</p>
                    </div>
                  </div>

                  {/* Math preview with weights */}
                  <div className="p-3 bg-indigo-50 border border-indigo-105 rounded-lg flex items-center justify-between font-sans">
                    <div className="text-[11px] font-medium text-slate-505">
                      Formula preview: <strong className="font-mono text-indigo-900">({ratingGoals.toFixed(1)} * 0.70) + ({ratingComp.toFixed(1)} * 0.30)</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold block uppercase text-indigo-500">Total Score</span>
                      <span className="text-lg font-black text-indigo-950 font-mono">{calculatedSum.toFixed(2)} / 5.0</span>
                    </div>
                  </div>

                  {/* Rating inflation alert */}
                  {showInflationAlert && (
                    <div className="p-3 bg-amber-50/50 border border-amber-205 rounded-lg text-amber-805 space-y-2">
                      <div className="flex items-start gap-1.5 font-bold">
                        <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-700" />
                        <span>Cohort Inflation Guideline Alert</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-amber-700">
                        Score rating exceeds 4.2. Business standards flag high trends within design cohorts. Detailed descriptive justification context is expected.
                      </p>
                      <label className="flex items-center gap-1.5 font-bold text-[10px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inflationAck}
                          onChange={(e) => setInflationAck(e.target.checked)}
                          className="w-3.5 h-3.5"
                        />
                        <span>I verify that employee scope justifies high score rating under bell parameters.</span>
                      </label>
                    </div>
                  )}

                  {/* Justified constraints */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-slate-700">
                      <label className="font-bold">Comprehensive Justification Narrative {isExtremeScore && <span className="text-red-650">*Required</span>}</label>
                      <span className={`font-mono font-bold text-[10px] ${isJustificationValid ? 'text-slate-500' : 'text-red-700'}`}>
                        {justificationLength} / 250 characters min {isExtremeScore && '(Extreme score constraint)'}
                      </span>
                    </div>
                    <textarea
                      placeholder="Outline specific milestones, leadership roles, behavior traits, or technical solutions. Mandated if final score is highest (>= 4.8) or lowest (<= 2.2)..."
                      value={managerJustification}
                      onChange={(e) => setManagerJustification(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2.5 outline-none font-medium leading-relaxed font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-150">
                    <button
                      onClick={() => handleManagerAppraisalSubmit(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-lg cursor-pointer transition-all"
                    >
                      Save Review Draft
                    </button>
                    <button
                      onClick={() => handleManagerAppraisalSubmit(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg shadow-sm cursor-pointer transition-all"
                    >
                      Authorize & Submit Appraisal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs select-text">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-sans text-slate-700 italic text-center">
                    Manager Review Workspace is currently in Draft. Log in as Direct Manager {managerName} to file scores.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 4: CALIBRATION WORKSPACE REDIRECT BLOCK */}
          {activeAppraisal.currentStage === 'Calibration' && (
            <div className="bg-white border border-slate-200.5 rounded-xl p-8 text-center text-slate-505 font-sans space-y-3">
              <TrendingUp size={44} className="text-blue-900 mx-auto" />
              <h3 className="text-sm font-bold text-slate-850">Calibration Committee Adjustment Step</h3>
              <p className="text-xs text-slate-550 max-w-sm mx-auto leading-relaxed">
                Review submitted performance scores inside the <strong className="text-indigo-900">Calibration Room</strong> to lock bell distributions and log audited adjustments.
              </p>
            </div>
          )}

          {/* STATE 5 - SIGN OFF SEQUENCE SCREEN */}
          {(activeAppraisal.currentStage === 'SignOff' || activeAppraisal.currentStage === 'Completed') && (
            <div className="bg-white border border-slate-204 rounded-xl p-6 shadow-xs space-y-6">
              {activeAppraisal.currentStage === 'Completed' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 p-5 rounded-xl flex items-center gap-3.5 text-xs">
                  <ShieldCheck size={28} className="text-emerald-700 shrink-0" />
                  <div className="space-y-0.5 select-text">
                    <h4 className="font-bold text-slate-850 text-sm">Evaluation Record Locked & Sealed (C-402)</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      This appraisal has been fully completed, verified, and locked under standard corporate compliance regulations. Ledger is sealed.
                    </p>
                  </div>
                  {currentUser.role === 'HR' && (
                    <button
                      onClick={handleHRUnlock}
                      className="ml-auto bg-red-50 hover:bg-red-100 text-red-800 font-bold py-1.5 px-3 border border-red-200 rounded text-xs transition-all flex items-center gap-1 shrink-0"
                    >
                      <Unlock size={12} /> HR Override: Unlock File
                    </button>
                  )}
                </div>
              )}

              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Digital Signature and Reflections Workspace</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dual signature enforcement setup.</p>
                </div>
                <span className="bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Dual Sign-Off Gate
                </span>
              </div>

              {/* Score Display Card */}
              <div className="p-4 bg-slate-50 border border-slate-200.5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                <div className="space-y-1.5 select-text">
                  <span className="font-bold text-slate-450 uppercase text-[9px] block">Appraisal Summary Score Outcomes</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-black text-slate-800">
                      Score Outcome: {activeAppraisal.calibration.calibratedScore || activeAppraisal.managerAppraisal.calculatedScore || 'Hold'} / 5.0
                    </span>
                    {activeAppraisal.calibration.calibratedScore && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 border border-amber-100 rounded">
                        *Calibrated PARITY Adjust
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-505 italic leading-relaxed">
                    "{activeAppraisal.managerAppraisal.justification || 'Milestone delivery was highly rated.'}"
                  </p>
                </div>

                <div className="space-y-1 bg-white p-3 rounded border border-slate-150 select-text">
                  <span className="font-bold text-slate-450 text-[10px] uppercase block">Signature Audit logs Ledger</span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeAppraisal.signOff.employeeSigned ? 'bg-emerald-500':'bg-red-500'}`} />
                      Employee: {activeAppraisal.signOff.employeeSigned ? `Stamped on ${activeAppraisal.signOff.employeeSignedAt}` : 'Awaiting signature'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeAppraisal.signOff.managerSigned ? 'bg-emerald-500':'bg-red-500'}`} />
                      Senior Leader: {activeAppraisal.signOff.managerSigned ? `Sealed on ${activeAppraisal.signOff.managerSignedAt}` : 'Pending dual verification'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual signature forms */}
              <div className="space-y-5">
                {/* Employee Signature Block */}
                {!activeAppraisal.signOff.employeeSigned ? (
                  currentUser.role === 'Employee' && currentUser.id === employeeUser.id ? (
                    <div className="bg-slate-50 border border-slate-205 rounded-xl p-4 space-y-3 text-xs font-sans">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileSignature size={16} className="text-indigo-900" /> Complete employee signature reflections
                      </span>

                      <div className="space-y-1">
                        <label className="block text-slate-650 font-bold">Your final feedback & reflections</label>
                        <textarea
                          placeholder="Reflect on performance conversations and growth targets discussed with manager during this window..."
                          value={employeeReflections}
                          onChange={(e) => setEmployeeReflections(e.target.value)}
                          rows={2}
                          className="w-full bg-white border border-slate-200.5 rounded-lg p-2outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-650 font-bold">Form rebuttal comments (Optional - if escalations are active)</label>
                        <textarea
                          placeholder="Type rebuttal and comments only if you disagree with adjusted scores to notify HR operations..."
                          value={employeeRebuttal}
                          onChange={(e) => setEmployeeRebuttal(e.target.value)}
                          rows={1}
                          className="w-full bg-white border border-slate-200.5 rounded-lg p-2 outline-none text-red-900"
                        />
                      </div>

                      <button
                        onClick={handleEmployeeSignComplete}
                        className="bg-indigo-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg cursor-pointer shadow-xs transition-all flex items-center gap-1"
                      >
                        Digitally Sign & Authorize
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl italic font-sans text-xs text-slate-500 text-center">
                      Awaiting employee dual reflection, reflections, and first signature. Dual sequences are enforced.
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-emerald-50/50 text-emerald-800 border border-emerald-100 rounded-xl font-sans text-xs select-text space-y-1.5">
                    <span className="font-bold block uppercase text-[10px] text-emerald-600">Employee Signature Affixed Ledger</span>
                    <p className="font-medium">Reflections: "{activeAppraisal.signOff.employeeReflections}"</p>
                    {activeAppraisal.signOff.employeeRebuttal && (
                      <p className="text-red-800 font-bold">Rebuttal Filed: "{activeAppraisal.signOff.employeeRebuttal}"</p>
                    )}
                  </div>
                )}

                {/* Manager Signature Block (Only enabled after employee signs!) */}
                {activeAppraisal.signOff.employeeSigned && (
                  !activeAppraisal.signOff.managerSigned ? (
                    (currentUser.id === employeeUser.managerId || currentUser.role === 'SeniorManager' || currentUser.role === 'HR') ? (
                      <div className="bg-slate-50 border border-indigo-105 rounded-xl p-4 space-y-3 text-xs font-sans">
                        <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <ShieldCheck size={16} /> Seal & Approve Performance Package
                        </span>

                        <div className="space-y-1">
                          <label className="block text-slate-650 font-bold">Manager final summary remarks</label>
                          <textarea
                            placeholder="Type final seal comments, action items discussed during performance dialogues, or milestones targets..."
                            value={managerFinalComments}
                            onChange={(e) => setManagerFinalComments(e.target.value)}
                            rows={2}
                            className="w-full bg-white border border-slate-200.5 rounded-xl p-2 outline-none"
                          />
                        </div>

                        <button
                          onClick={handleManagerSignComplete}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg cursor-pointer shadow-xs transition-all flex items-center gap-1"
                        >
                          Affix Manager Seal & Lock
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl italic font-sans text-xs text-slate-400 text-center">
                        Employee signed. Clear for Manager {managerName} to seal and close performance ledger files.
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-xl font-sans text-xs space-y-1 leading-normal select-text">
                      <span className="font-bold uppercase text-[10px] text-indigo-500">Executive Archive Stamp Affixed</span>
                      <p className="font-medium">Final Remarks: "{activeAppraisal.signOff.managerFinalComments}"</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* STATE 6: COMPLETED & ARCHIVED BLOCK handled inline above for pristine dual-signoff and score reviews */}
        </div>

        {/* Right side contextual summaries */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono border-b border-slate-100 pb-1.5">
              Workplace Profile Summary
            </h4>
            
            <div className="flex items-center gap-3">
              <img
                src={employeeUser.avatar}
                alt={employeeUser.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-202 shrink-0"
              />
              <div className="leading-tight text-xs select-text">
                <span className="font-bold text-slate-800 text-sm block">{employeeUser.name}</span>
                <span className="text-slate-400 font-semibold block">{employeeUser.title}</span>
                <span className="text-slate-400 font-mono block text-[10px] uppercase mt-0.5">{employeeUser.department}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-550 border-b border-slate-100 py-1">
                <span>Cycle Code</span>
                <span className="font-bold text-slate-850">{activeCycle?.name}</span>
              </div>
              <div className="flex justify-between text-slate-550 border-b border-slate-100 py-1">
                <span>Review Stage</span>
                <span className="font-bold text-indigo-900 bg-indigo-50 px-1.5 rounded">{activeAppraisal.currentStage}</span>
              </div>
              <div className="flex justify-between text-slate-550 py-1">
                <span>Target Manager</span>
                <span className="font-bold text-slate-850">{managerName}</span>
              </div>
            </div>
          </div>

          {/* Unified Feedback & Evaluation Portfolio Card - Restored per user request */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500 font-mono border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare size={14} className="text-indigo-600" />
                Feedback Portfolio
              </span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold border border-indigo-100">
                {(activeAppraisal.additionalFeedback?.length || 0) + (activeAppraisal.peerReviews?.filter(pr => pr.status === 'Completed').length || 0)} RESPONSES
              </span>
            </h4>
            
            <div className="space-y-3 text-xs font-sans">
              {/* Structured Peer Reviews (All statuses: Completed, Requested, etc.) */}
              {activeAppraisal.peerReviews?.map(pr => {
                const canViewDetails = (currentUser.role === 'Manager' || currentUser.role === 'HR' || currentUser.role === 'Senior Manager') && pr.status === 'Completed';
                const isCompleted = pr.status === 'Completed';
                
                return (
                  <div 
                    key={pr.id} 
                    onClick={() => {
                      if (canViewDetails) setSelectedPeerFeedbackForModal(pr);
                    }}
                    className={`p-3 bg-white border border-slate-100 rounded-xl transition-all flex justify-between items-center shadow-xs ${canViewDetails ? 'hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer group' : 'cursor-default opacity-90'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] border ${isCompleted ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {isCompleted ? <Star size={12} fill="currentColor" /> : <Clock size={12} />}
                      </div>
                      <div className="leading-tight">
                        <span className="font-bold block text-[11px] text-slate-800">{pr.reviewerName}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-tighter ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
                            Status: {pr.status === 'Requested' ? 'Pending' : pr.status}
                          </span>
                          {(!canViewDetails && isCompleted) && <span className="text-[8px] text-slate-400 font-medium">(Content Restricted)</span>}
                          {!isCompleted && <span className="text-[8px] text-slate-400 font-medium">(Awaiting Input)</span>}
                        </div>
                      </div>
                    </div>
                    {canViewDetails && <Eye size={14} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />}
                  </div>
                );
              })}

              {/* Qualitative Feedback Records */}
              {activeAppraisal.additionalFeedback && activeAppraisal.additionalFeedback.length > 0 && (
                <div className="space-y-2">
                  {activeAppraisal.additionalFeedback.map(fb => {
                    const canViewDetails = currentUser.role === 'Manager' || currentUser.role === 'HR' || currentUser.role === 'Senior Manager';
                    
                    return (
                      <div 
                        key={fb.id} 
                        onClick={() => {
                          if (canViewDetails) setSelectedAdditionalFeedbackForModal(fb);
                        }}
                        className={`p-3 bg-slate-50 border border-slate-100 rounded-xl transition-all flex justify-between items-start ${canViewDetails ? 'hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer group' : 'cursor-default'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] border border-indigo-200">
                            {fb.senderName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="leading-tight overflow-hidden">
                            <span className="font-bold block text-[11px] text-slate-800">{fb.senderName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-tighter">Status: Completed</span>
                              {!canViewDetails && <span className="text-[8px] text-slate-400 font-medium">(Content Restricted)</span>}
                            </div>
                          </div>
                        </div>
                        {canViewDetails && <Eye size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0 ml-2" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {!(activeAppraisal.peerReviews?.some(pr => pr.status === 'Completed')) && !(activeAppraisal.additionalFeedback?.length) && (
                <div className="py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[10px] text-slate-400 font-medium italic">No feedback records processed.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Peer Feedback Detail Modal */}
      {selectedPeerFeedbackForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header per Image Ref */}
            <div className="bg-[#4338ca] p-6 flex justify-between items-center text-white relative">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                  <MessageSquare className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Chi tiết Phản hồi Bổ sung</h3>
                  <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest opacity-80">CONFIDENTIAL ADDITIONAL FEEDBACK PORTFOLIO</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPeerFeedbackForModal(null)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors text-white/70 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content per Image Ref */}
            <div className="flex-1 overflow-y-auto p-10 font-sans space-y-10 bg-[#f9fafb]">
              {/* Respondent Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg border border-indigo-200">
                    {selectedPeerFeedbackForModal.reviewerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{selectedPeerFeedbackForModal.reviewerName}</h4>
                    <p className="text-xs text-slate-500 font-medium">Colleague respondent</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-md border border-emerald-100 uppercase tracking-widest mb-1 block">COMPLETED</span>
                  <p className="text-[9px] text-slate-400 font-medium">Chưa hoàn thành</p>
                </div>
              </div>

              {/* Metrics Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📊</span>
                  <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.2em] font-mono">ĐIỂM SỐ ĐÁNH GIÁ TIÊU CHÍ (FRICTION-FREE POINTS):</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {[
                    { label: 'Collaboration (Hợp tác)', score: selectedPeerFeedbackForModal.ratings?.collaboration },
                    { label: 'Communication (Giao tiếp)', score: selectedPeerFeedbackForModal.ratings?.communication },
                    { label: 'Problem Solving (Giải quyết VĐ)', score: selectedPeerFeedbackForModal.ratings?.problemSolving },
                    { label: 'Leadership (Lãnh đạo)', score: selectedPeerFeedbackForModal.ratings?.leadership },
                    { label: 'Teamwork (Làm việc nhóm)', score: selectedPeerFeedbackForModal.ratings?.teamwork },
                    { label: 'Accountability (Trách nhiệm)', score: selectedPeerFeedbackForModal.ratings?.accountability }
                  ].map((field) => (
                    <div key={field.label} className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold text-slate-600">{field.label}</span>
                      <span className="text-[11px] font-mono font-extrabold text-[#4338ca] flex items-center gap-1.5">
                        {(field.score || 0).toFixed(1)} <Star size={12} fill="currentColor" className="mb-0.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualitative Observations */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📝</span>
                  <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.2em] font-mono">Ý KIẾN NHẬN XÉT THẢO LUẬN:</h4>
                </div>
                <div className="relative pl-6 border-l-4 border-indigo-100 italic">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    "{selectedPeerFeedbackForModal.comments || 'No descriptive comments provided.'}"
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedPeerFeedbackForModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-10 rounded-xl text-xs transition-all active:scale-95 border border-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Qualitative Feedback Detail Modal */}
      {selectedAdditionalFeedbackForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2.5 rounded-lg border border-indigo-500/30">
                  <MessageSquare className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest font-mono">Qualitative Feedback Detail</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Submitted by: {selectedAdditionalFeedbackForModal.senderName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAdditionalFeedbackForModal(null)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors text-white/50 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 font-sans">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 relative">
                <div className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-150 rounded">
                  Supporting Comments
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                  "{selectedAdditionalFeedbackForModal.content}"
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono italic">
                <span>Verification ID: {selectedAdditionalFeedbackForModal.id}</span>
                <span>Logged: {selectedAdditionalFeedbackForModal.createdAt}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedAdditionalFeedbackForModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-lg text-[11px] transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
