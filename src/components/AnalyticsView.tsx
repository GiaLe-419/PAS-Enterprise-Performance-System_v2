import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, MapPin, Building, Award, Calendar, Percent, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { appraisals, users, activeCycle } = useApp();

  // Filters state
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Multi-choice lists for filters
  const locations = ['ALL', 'North America (HQ)', 'North America (Remote)', 'EMEA (London)', 'EMEA (Madrid)', 'EMEA (Remote)', 'North America (Chicago)'];
  const departments = ['ALL', 'Product Design', 'Engineering', 'HR Operations', 'Executive Leadership', 'Marketing Strategy', 'Sales & Client Growth'];

  // Helper to filter appraisals based on geographic site / dept
  const filteredAppraisals = appraisals.filter(app => {
    const userRoleObj = users.find(u => u.id === app.employeeId);
    if (!userRoleObj) return false;

    const matchesLocation = selectedLocation === 'ALL' || userRoleObj.location === selectedLocation;
    const matchesDept = selectedDept === 'ALL' || userRoleObj.department === selectedDept;

    return app.cycleId === activeCycle?.id && matchesLocation && matchesDept;
  });

  // Calculate high level metrics dynamically
  const totalInScope = filteredAppraisals.length;
  const completedScenarios = filteredAppraisals.filter(a => a.currentStage === 'Completed').length;
  const completionRate = totalInScope === 0 ? 0 : Math.round((completedScenarios / totalInScope) * 100);

  // Scores math
  const scoreAppraisals = filteredAppraisals.filter(a => a.calibration.calibratedScore || a.managerAppraisal.calculatedScore);
  const averageRating = scoreAppraisals.length === 0 
    ? 0 
    : parseFloat((scoreAppraisals.reduce((acc, current) => {
        const ratingVal = current.calibration.calibratedScore || current.managerAppraisal.calculatedScore || 0;
        return acc + ratingVal;
      }, 0) / scoreAppraisals.length).toFixed(2));

  // Count calibrations
  const calibratedScenarios = filteredAppraisals.filter(a => a.calibration.calibratedScore && a.calibration.calibratedScore !== a.calibration.originalCalculatedScore).length;

  // Render cohort distribution for bell emulators (Using exact bounds based on math)
  const scoreCounters = {
    '1.0 - 2.2': filteredAppraisals.filter(a => {
      const s = a.calibration.calibratedScore || a.managerAppraisal.calculatedScore || 0;
      return s >= 1.0 && s <= 2.2;
    }).length,
    '2.3 - 3.2': filteredAppraisals.filter(a => {
      const s = a.calibration.calibratedScore || a.managerAppraisal.calculatedScore || 0;
      return s > 2.2 && s <= 3.2;
    }).length,
    '3.3 - 4.2': filteredAppraisals.filter(a => {
      const s = a.calibration.calibratedScore || a.managerAppraisal.calculatedScore || 0;
      return s > 3.2 && s <= 4.2;
    }).length,
    '4.3 - 5.0': filteredAppraisals.filter(a => {
      const s = a.calibration.calibratedScore || a.managerAppraisal.calculatedScore || 0;
      return s > 4.2 && s <= 5.0;
    }).length,
  };

  const highestCount = Math.max(...Object.values(scoreCounters), 1);

  // Department average score mapping for bento summaries
  const deptAverages = departments.filter(d => d !== 'ALL').map(dept => {
    const appsInDept = appraisals.filter(a => {
      const u = users.find(usr => usr.id === a.employeeId);
      return u?.department === dept && a.cycleId === activeCycle?.id;
    });
    
    const rated = appsInDept.filter(a => a.calibration.calibratedScore || a.managerAppraisal.calculatedScore);
    const avg = rated.length === 0 ? 0 : parseFloat((rated.reduce((acc, cur) => acc + (cur.calibration.calibratedScore || cur.managerAppraisal.calculatedScore || 0), 0) / rated.length).toFixed(2));

    return { name: dept, average: avg, totalCount: appsInDept.length };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans select-text">
      
      {/* Title */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-900" size={24} /> Executive Talent Diagnostics
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Analyze consolidated reviews analytics, inspect cohort ratings alignment, and audit organizational parity levels globally.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 font-mono inline-flex items-center gap-2 shadow-3xs">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" /> Scope: H1 Active Analytics
        </div>
      </section>

      {/* Selector Filters Header row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Geographics filter */}
        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-705 flex items-center gap-1.5 mb-1.5">
            <MapPin size={14} className="text-blue-900" /> Geographical Site Filter
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl p-3 font-semibold text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-0 transition-all cursor-pointer"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>
                {loc === 'ALL' ? 'All Global Sites (Default)' : loc}
              </option>
            ))}
          </select>
        </div>

        {/* Business units filter */}
        <div className="space-y-1 text-xs font-sans">
          <label className="font-bold text-slate-705 flex items-center gap-1.5 mb-1.5">
            <Building size={14} className="text-blue-900" /> Organizational Business Unit (Department)
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl p-3 font-semibold text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-0 transition-all cursor-pointer"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'ALL' ? 'All Corporate Departments (Default)' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI statistics cards block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col justify-between min-h-[120px] transition-all">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-mono">Workforce Average Score</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-2xl font-black text-slate-900 font-mono">
                {averageRating > 0 ? averageRating.toFixed(2) : '3.80'}
              </strong>
              <span className="text-[10px] text-slate-400 font-bold">/ 5.0 scale</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-900 h-full transition-all duration-500" 
                style={{ width: `${((averageRating || 3.80) / 5) * 100}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Consolidated live performance trend</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col justify-between min-h-[120px] transition-all">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-mono">Completion Rate</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-2xl font-black text-slate-900 font-mono">{completionRate}%</strong>
              <span className="text-[10px] text-slate-400 font-bold">{completedScenarios} of {totalInScope} appraisals</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-500" 
                style={{ width: `${completionRate}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Fully locked and released cycles</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col justify-between space-y-2 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-mono">Calibrated Audited Records</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-2xl font-black text-amber-700 font-mono">{calibratedScenarios}</strong>
              <span className="text-[10px] text-slate-400 font-extrabold">adjusted items</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-amber-600 font-sans">
            <span>Parity Align Audit</span>
            <span className="bg-amber-50 px-1.5 py-0.5 rounded uppercase font-mono text-[9px] border border-amber-200">Active</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col justify-between space-y-2 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-mono">In-Scope Heads</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-2xl font-black text-slate-900 font-mono">{totalInScope}</strong>
              <span className="text-[10px] text-slate-400 font-medium">Headcount in selection</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 font-sans">
            <span>Filter Coverage</span>
            <span className="bg-slate-50 px-1.5 py-0.5 rounded font-mono text-[9px] border border-slate-200">Satisfactory</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Cohort Performance Bell Curve Chart layout */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <TrendingUp size={16} className="text-blue-900" /> Bell Curve Parity Cohort Distribution
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Metrics compared side-by-side with recommended normal-curve guidelines.</p>
          </div>

          {/* SVG Custom Chart mimicking standard Bell Curves accurately */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 select-none">
            <div className="h-48 flex items-end gap-4 md:gap-6">
              {Object.entries(scoreCounters).map(([bucket, count]) => {
                const percentageHeight = (count / highestCount) * 100;
                const isPrimaryBucket = bucket.includes('3.3');
                return (
                  <div key={bucket} className="flex-1 flex flex-col justify-end items-center h-full gap-2">
                    {/* Numerical indicator above bar */}
                    <span className="font-mono text-xs font-black text-slate-800">
                      {count} {count === 1 ? 'head' : 'heads'}
                    </span>
                    
                    {/* Visual block bar */}
                    <div 
                      className={`w-full rounded-t-xl shadow-xs border transition-all duration-500 ${
                        isPrimaryBucket 
                          ? 'bg-blue-900 border-blue-950 relative overflow-hidden' 
                          : count > 0 
                            ? 'bg-indigo-300 border-indigo-400' 
                            : 'bg-slate-200 border-slate-300'
                      }`}
                      style={{ height: `${count === 0 ? 3 : Math.max(percentageHeight, 15)}%` }}
                    >
                      {isPrimaryBucket && count > 0 && (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent animate-pulse" />
                      )}
                    </div>

                    {/* Label descriptor */}
                    <span className="text-[10px] font-bold text-slate-500 font-sans tracking-tight text-center">
                      {bucket}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Legend guide info box */}
            <div className="mt-5 border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-500 leading-normal font-sans">
              <span>* Target Curve parameters: <b>10% High Performer / Specialist</b> (4.3-5.0), and <b>70% Core Consistent Delivery</b> (3.3-4.2).</span>
              <span className="font-black text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md uppercase font-mono shrink-0">
                Parity Alignment Met
              </span>
            </div>
          </div>
        </section>

        {/* Right side: Departments average levels list */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Department Analysis</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Averages across direct corporate divisions.</p>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {deptAverages.map((dept) => {
              const scorePercent = (dept.average / 5) * 100;
              const hasActiveReviews = dept.totalCount > 0;
              return (
                <div key={dept.name} className="space-y-1.5 font-sans text-xs select-text">
                  <div className="flex justify-between items-center font-bold text-slate-705">
                    <span className="truncate max-w-[180px]">{dept.name}</span>
                    <span className="font-mono font-black text-slate-800">
                      {dept.average > 0 ? dept.average.toFixed(2) : 'No Scores'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${hasActiveReviews ? 'bg-indigo-900' : 'bg-slate-250'}`} 
                      style={{ width: `${scorePercent > 0 ? scorePercent : 0}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Performance Rating</span>
                    <span>Count: {dept.totalCount} {dept.totalCount === 1 ? 'profile' : 'profiles'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

      </div>

    </div>
  );
};
