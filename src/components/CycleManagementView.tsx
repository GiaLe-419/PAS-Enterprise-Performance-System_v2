import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Plus, Check, Play, Square, Scale, Star, Sliders, Calendar, AlertCircle } from 'lucide-react';

export const CycleManagementView: React.FC = () => {
  const { cycles, createCycle, updateCycleStatus, togglePeerFeedbackEnabled, currentUser } = useApp();
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'Mid-Year' | 'End-Year'>('Mid-Year');
  const [year, setYear] = useState(2024);
  const [startDate, setStartDate] = useState('2024-07-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [goalsWeight, setGoalsWeight] = useState(70);
  const [peerEnabled, setPeerEnabled] = useState(false);

  // Validations
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter a descriptive cycle label.');
      return;
    }

    const competenciesWeight = 100 - goalsWeight;

    createCycle({
      name,
      type,
      year: Number(year),
      startDate,
      endDate,
      ratingScale: {
        min: 1,
        max: 5,
        labels: {
          1: 'Unsatisfactory (Needs Imp.)',
          2: 'Developing (Fair)',
          3: 'Successful (Good)',
          4: 'Superior (Great)',
          5: 'Distinguished (Elite)'
        }
      },
      weights: {
        goals: goalsWeight,
        competencies: competenciesWeight
      },
      peerFeedbackEnabled: peerEnabled
    });

    // Reset clean states
    setIsCreating(false);
    setName('');
    setErrorMsg('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* Title block */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="text-blue-900" size={20} /> Appraisal Cycle Configuration Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure and activate multi-role performance review windows cross-enterprise.</p>
        </div>
        {currentUser.role === 'HR' && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} /> Create New Cycle
          </button>
        )}
      </section>

      {/* Main setup area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left main cycles list / or Create Form */}
        <div className="lg:col-span-8 space-y-6">
          {isCreating ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Create Performance Cycle</h3>
              {errorMsg && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 flex items-center gap-2 text-xs">
                  <AlertCircle size={16} className="text-red-700" /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Cycle Label Name</label>
                    <input
                      type="text"
                      placeholder="e.g., FY24 Mid-Year Review"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg p-2.5 outline-none font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium outline-none"
                      >
                        <option value="Mid-Year">Mid-Year</option>
                        <option value="End-Year">End-Year</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Year</label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Workflow Open Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium font-mono outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Workflow Closing Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Score Config rule weights */}
                <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-700">Configurable Weight Ratio Score</span>
                    <span className="font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-105">
                      Goals: {goalsWeight}% / Competencies: {100 - goalsWeight}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-500">Scale Balance:</span>
                    <input
                      type="range"
                      min="30"
                      max="80"
                      step="5"
                      value={goalsWeight}
                      onChange={(e) => setGoalsWeight(Number(e.target.value))}
                      className="flex-1 accent-blue-900 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Business Rule: Enforce that Goals (KPIs) weight and core Competencies (soft skills) weight sum directly to 100%. Managers appraisals must conform to weights defined here.
                  </p>
                </div>

                {/* Peer feedback config block */}
                <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Include Anonymous Peer Feedback Stage</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={peerEnabled}
                        onChange={(e) => setPeerEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-900"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Enabling this adds an anonymous 360-degree peer feedback stage between Self-Appraisal and Manager Review.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-lg hover:shadow-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-5 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Activate Templates and Save
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Appraisal Cycles Registry</h3>
                </div>
                
                <div className="overflow-x-auto select-text">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider border-b border-slate-205 text-[10px] font-bold">
                        <th className="px-5 py-3">Cycle Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-center">Year</th>
                        <th className="px-4 py-3">Timeline</th>
                        <th className="px-4 py-3 text-center">Peer Feedback</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {cycles.map((cycle) => (
                        <tr key={cycle.id} className="hover:bg-slate-50 transition-all font-medium text-slate-700">
                          <td className="px-5 py-4">
                            <span className="font-bold text-slate-800 block text-xs">{cycle.name}</span>
                            <span className="text-[10px] text-slate-400">Ratio: {cycle.weights.goals}:{100-cycle.weights.goals} Goals focus</span>
                          </td>
                          <td className="px-4 py-4 text-slate-505">{cycle.type}</td>
                          <td className="px-4 py-4 text-center text-slate-505">{cycle.year}</td>
                          <td className="px-4 py-4 font-mono text-[11px] text-slate-505">
                            {cycle.startDate} to {cycle.endDate}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {currentUser.role === 'HR' ? (
                              <div className="flex items-center justify-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cycle.peerFeedbackEnabled}
                                    onChange={() => togglePeerFeedbackEnabled(cycle.id)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-900"></div>
                                </label>
                              </div>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                cycle.peerFeedbackEnabled 
                                  ? 'bg-purple-50 text-purple-800 border border-purple-105' 
                                  : 'bg-slate-50 text-slate-400 border border-slate-150'
                              }`}>
                                {cycle.peerFeedbackEnabled ? 'Active' : 'Off'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              cycle.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                : cycle.status === 'Closed'
                                  ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-100'
                            }`}>
                              {cycle.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {currentUser.role === 'HR' ? (
                              <div className="flex justify-end gap-1.5">
                                {cycle.status === 'Draft' && (
                                  <button
                                    onClick={() => updateCycleStatus(cycle.id, 'Active')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Play size={10} /> Activate
                                  </button>
                                )}
                                {cycle.status === 'Active' && (
                                  <button
                                    onClick={() => updateCycleStatus(cycle.id, 'Closed')}
                                    className="bg-slate-500 hover:bg-slate-650 text-white font-bold px-2 py-1 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Square size={10} /> Close
                                  </button>
                                )}
                                {cycle.status === 'Closed' && (
                                  <span className="text-[10px] font-mono text-slate-400 mr-2 uppercase tracking-wide">Archived</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No access</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side configuration context bars */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Static Weight Config Panel info matching the reference wireframe image */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2">
                <Sliders size={16} className="text-blue-900" /> Active Weights Logic
              </span>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Objective Goals weight</span>
                  <span>70%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-900 h-full" style={{ width: '70%' }} />
                </div>
                <p className="text-[10px] text-slate-400">Goals scored directly against dynamic key performance metrics of employee targets.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Core Competencies weight</span>
                  <span>30%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full" style={{ width: '30%' }} />
                </div>
                <p className="text-[10px] text-slate-400">Leadership, collaboration, communication, innovation, and general standards scores.</p>
              </div>
            </div>
          </div>

          {/* Rating Scale card matching reference mock exactly */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2">
                <Scale size={16} className="text-blue-900" /> Organizational Scale
              </span>
              <span className="bg-red-50 text-red-900 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                Locked
              </span>
            </div>
            <div className="p-4 space-y-2 text-xs">
              <p className="text-[10px] text-slate-400 mb-2">Standardized 1-5 Performance scale used for multi-cohort calibration alignment exercises.</p>
              <div className="space-y-1.5">
                {[
                  { val: 1, label: 'Needs Imp.', color: 'bg-red-50 text-red-900 border-red-150' },
                  { val: 2, label: 'Meets Expectations', color: 'bg-orange-50 text-orange-900 border-orange-150' },
                  { val: 3, label: 'Good (Exceeds)', color: 'bg-blue-50 text-blue-900 border-blue-105' },
                  { val: 4, label: 'Superior Achievement', color: 'bg-cyan-50 text-cyan-900 border-cyan-155' },
                  { val: 5, label: 'Distinguished Elite', color: 'bg-emerald-50 text-emerald-900 border-emerald-100' }
                ].map((scale) => (
                  <div key={scale.val} className={`p-2 rounded-lg border flex items-center justify-between font-bold text-[10px] ${scale.color}`}>
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
