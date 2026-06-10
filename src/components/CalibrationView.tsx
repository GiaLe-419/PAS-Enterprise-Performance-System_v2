import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Appraisal, User } from '../types';
import { TrendingUp, Scale, Check, AlertCircle, Info, FileText, ArrowRight, Lock } from 'lucide-react';

export const CalibrationView: React.FC = () => {
  const { 
    currentUser, 
    appraisals, 
    users, 
    activeCycle, 
    calibrateAppraisal 
  } = useApp();

  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [calibratedValue, setCalibratedValue] = useState<number>(3.0);
  const [changeReason, setChangeReason] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const isHR = currentUser.role === 'HR';
  const hasAccess = isHR;

  // Find appraisals ready for calibration (either currentStage === 'Calibration' or has completed review)
  const calibratableAppraisals = appraisals.filter(a => {
    return a.cycleId === activeCycle?.id && 
           (a.currentStage === 'Calibration' || a.currentStage === 'SignOff' || a.currentStage === 'Completed');
  });

  const activeApp = appraisals.find(a => a.id === selectedAppId) || calibratableAppraisals[0];
  const activeEmployee = activeApp ? users.find(u => u.id === activeApp.employeeId) : null;

  // Sync state values with selected appraisal automatically
  useEffect(() => {
    if (activeApp) {
      const originalScore = activeApp.calibration.calibratedScore || activeApp.managerAppraisal.calculatedScore || 3.0;
      setCalibratedValue(originalScore);
      setChangeReason(activeApp.calibration.changeReason || '');
      setSuccessMsg('');
      setErrorMsg('');
    } else {
      setCalibratedValue(3.0);
      setChangeReason('');
    }
  }, [activeApp?.id]);

  // Set default form values on appraisal click
  const handleSelectAppraisal = (app: Appraisal) => {
    setSelectedAppId(app.id);
  };

  const handleAction = (isSubmit: boolean) => {
    setSuccessMsg('');
    setErrorMsg('');

    if (!activeApp) return;

    if (!changeReason.trim() || changeReason.length < 25) {
      setErrorMsg('Audit Compliance Check: Calibration change reason justification must be at least 25 characters details.');
      return;
    }

    calibrateAppraisal(activeApp.id, calibratedValue, changeReason, isSubmit);
    
    if (isSubmit) {
      setSuccessMsg(`Successfully finalized, submitted, and LOCKED performance rating for ${activeEmployee?.name} to score ${calibratedValue.toFixed(1)}/5.0`);
    } else {
      setSuccessMsg(`Successfully saved draft calibration details for ${activeEmployee?.name} to score ${calibratedValue.toFixed(1)}/5.0`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* Title */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="text-blue-900" size={20} /> Corporate Calibration Room
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Conduct multi-site cohort rating alignments, adjust skewed manager distributions, and maintain organizational equity.
          </p>
        </div>
        <div className="bg-slate-100 py-1.5 px-3.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 font-mono">
          Scope Security: Exec Confidential
        </div>
      </section>

      {!hasAccess ? (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl text-amber-800 space-y-2 max-w-lg mx-auto text-center font-sans">
          <AlertCircle size={32} className="text-amber-600 mx-auto" />
          <h3 className="font-bold text-sm">Access Denied: Exclusivity Parameters</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            The Calibration Panel is locked to HR Administrators only. Toggle your act as persona in the top header to <strong className="font-black text-blue-950">Alex Sterling (HR)</strong> to inspect.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Calibratable cohort list */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-550 font-mono">Cohorts Under Review</h3>
            
            {calibratableAppraisals.length === 0 ? (
              <div className="p-6 bg-slate-50 border rounded-xl text-center text-slate-400 text-xs font-sans">
                Review submissions has not concluded manager evaluation step. No calibrated targets ready.
              </div>
            ) : (
              <div className="space-y-2.5">
                {calibratableAppraisals.map((apr) => {
                  const emp = users.find(u => u.id === apr.employeeId);
                  const isSelected = activeApp?.id === apr.id;
                  const currentScore = apr.calibration.calibratedScore || apr.managerAppraisal.calculatedScore || 0;
                  
                  return (
                    <button
                      key={apr.id}
                      onClick={() => handleSelectAppraisal(apr)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={emp?.avatar}
                          alt={emp?.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-205"
                        />
                        <div className="leading-tight text-xs">
                          <span className="font-bold text-slate-800 text-xs block">{emp?.name}</span>
                          <span className="text-slate-400 font-semibold">{emp?.title}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{emp?.department}</span>
                        </div>
                      </div>

                      <div className="text-right leading-none font-sans">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">Grading Score</span>
                        <span className="text-sm font-black font-mono text-indigo-905">{currentScore ? `${currentScore.toFixed(2)}/5.0` : 'None'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: calibration slider and justification triggers */}
          <div className="lg:col-span-7 space-y-6 select-text">
            {activeApp && activeEmployee ? (
              <div className="bg-white border border-slate-200.5 rounded-xl p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center bg-slate-50/20 px-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeEmployee.avatar}
                      alt={activeEmployee.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-805 uppercase font-sans">Calibrate Focus: {activeEmployee.name}</h4>
                      <p className="text-[10px] text-slate-400">Position: {activeEmployee.title} — {activeEmployee.department}</p>
                    </div>
                  </div>
                  <span className="bg-indigo-50 text-indigo-900 border border-indigo-105 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                    Calibration Gate
                  </span>
                </div>

                {successMsg && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100 text-xs flex items-center gap-2">
                    <Check size={16} /> <span className="font-semibold">{successMsg}</span>
                  </div>
                )}
                {errorMsg && (
                  <div className="bg-red-50 text-red-900 p-3 rounded-lg border border-red-100 text-xs flex items-center gap-2 font-semibold">
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  {/* Scores reference panel */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-4 text-center font-sans">
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-450 mb-0.5">Manager Score</span>
                      <strong className="text-sm font-black font-mono text-slate-800">
                        {activeApp.managerAppraisal.calculatedScore?.toFixed(2) || '3.0'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-450 mb-0.5">Manager Rating goals</span>
                      <strong className="text-sm font-black font-mono text-slate-800">
                        {activeApp.managerAppraisal.ratingGoals?.toFixed(1) || '3.0'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-450 mb-0.5">Competencies score</span>
                      <strong className="text-sm font-black font-mono text-slate-800">
                        {activeApp.managerAppraisal.ratingCompetencies?.toFixed(1) || '3.0'}
                      </strong>
                    </div>
                  </div>

                  {/* Slider to adjust */}
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                    <div className={`rounded-xl p-5 space-y-3 shadow-inner ${activeApp.calibration.isSubmitted ? 'bg-slate-800 text-slate-400' : 'bg-slate-900 text-white'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-blue-400 uppercase tracking-widest flex items-center gap-1">
                          {activeApp.calibration.isSubmitted && <Lock size={12} className="text-amber-500" />} Score Calibration Metric
                        </span>
                        <span className="font-mono text-lg font-black bg-slate-800/80 border border-slate-705 px-3 py-1 rounded text-white">
                          {calibratedValue.toFixed(1)} / 5.0
                        </span>
                      </div>
                      
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={calibratedValue}
                        onChange={(e) => setCalibratedValue(Number(e.target.value))}
                        disabled={!!activeApp.calibration.isSubmitted}
                        className={`w-full accent-blue-500 ${activeApp.calibration.isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      />
                      <p className="text-[10px] text-slate-400">
                        {activeApp.calibration.isSubmitted ? 'Calibration rating has been completed and locked.' : 'Adjust score values smoothly. Calibrated scores override manager ratings during overall talent calibration calculations.'}
                      </p>
                    </div>

                    {/* Change Reason mandate triggers */}
                    <div className="space-y-1.5 font-sans">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-705 flex items-center gap-1">
                          Calibration Change Justification (25 char minimum) *
                        </label>
                        <span className="font-mono font-bold text-[10px] text-slate-500">{changeReason.trim().length} chars</span>
                      </div>
                      <textarea
                        placeholder="Detail specific cohorts parameters, additional feedback parity adjustments, or cross-functional calibration guidelines..."
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                        disabled={!!activeApp.calibration.isSubmitted}
                        rows={3}
                        className={`w-full border rounded-lg p-2.5 outline-none font-medium leading-relaxed font-sans ${activeApp.calibration.isSubmitted ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800'}`}
                        required
                      />
                    </div>

                    {activeApp.calibration.isSubmitted ? (
                      <div className="bg-slate-50 border border-slate-200/80 text-slate-750 font-sans p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full">
                        <div className="flex items-start gap-2.5">
                          <Lock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold block text-slate-800 leading-snug">Calibration Sealed & Locked</span>
                            <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Approved by {activeApp.calibration.calibratedBy || 'Corporate HR'} on {activeApp.calibration.calibratedAt ? new Date(activeApp.calibration.calibratedAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <span className="bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded font-mono text-[9px] uppercase tracking-wider self-start sm:self-center">
                          Secured Release Draft
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-105">
                        <button
                          type="button"
                          onClick={() => handleAction(false)}
                          className="bg-white hover:bg-slate-50 text-slate-750 font-bold py-2 px-4 border border-slate-250 rounded-lg shadow-2xs cursor-pointer transition-all flex items-center gap-1.5 text-xs"
                        >
                          Save Draft Calibration
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(true)}
                          className="bg-indigo-900 hover:bg-indigo-950 text-white font-bold py-2 px-5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5 text-xs"
                        >
                          <Scale size={14} /> Submit & Lock Calibration
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200.5 rounded-xl p-10 text-center font-sans text-slate-400 text-xs">
                <Info size={32} className="mx-auto text-slate-300 mb-2" />
                Select an employee from the cohort list to adjust rating metrics.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
