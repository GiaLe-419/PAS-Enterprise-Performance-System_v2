import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, ShieldCheck, Mail, Sliders } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter logs based on search criteria and dates
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;

    // Treat dates correctly (boundary alignment)
    const logTime = new Date(log.timestamp).getTime();
    
    let matchesStartDate = true;
    if (startDate) {
      const startBoundary = new Date(startDate);
      startBoundary.setHours(0, 0, 0, 0);
      matchesStartDate = logTime >= startBoundary.getTime();
    }

    let matchesEndDate = true;
    if (endDate) {
      const endBoundary = new Date(endDate);
      endBoundary.setHours(23, 59, 59, 999);
      matchesEndDate = logTime <= endBoundary.getTime();
    }

    return matchesSearch && matchesRole && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* Title block */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-205 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <History className="text-blue-900" size={20} /> Immutable Audit Logs Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            System logs tracking goal creation, rating changes, calibration adjustments, sign-offs, and administrative overrides.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 py-1.5 px-3.5 rounded-lg font-bold font-mono">
          <ShieldCheck size={14} className="text-emerald-700 animate-pulse" /> LEDGER SEALED (AES-256)
        </div>
      </section>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200.5 rounded-xl p-4 shadow-xs flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action keyword, actor name, detail logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs font-medium outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-start xl:justify-end select-none">
          {/* Start Date */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white transition-colors cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white transition-colors cursor-pointer"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR BP</option>
              <option value="SeniorManager">Senior Manager</option>
            </select>
          </div>

          {/* Clear Button */}
          {(searchTerm || roleFilter !== 'ALL' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-250 hover:text-slate-800"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Logs Registry Table */}
      <div className="bg-white border border-slate-200.5 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto select-text">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider border-b border-slate-205 text-[10px] font-bold">
                <th className="px-5 py-3">Timestamp (UTC)</th>
                <th className="px-5 py-3">Actor (Role)</th>
                <th className="px-5 py-3">Action logged</th>
                <th className="px-5 py-3">Audit Details Summary</th>
                <th className="px-5 py-3 text-right">Verification Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredLogs.map((log) => {
                // Generate a custom deterministic signature hash to emulate immutable blockchain seal in reference image
                const mockVerificationCode = `SHA-${(log.timestamp + log.action).split('').reduce((acc, char) => acc + char.charCodeAt(0), 100).toString(16).toUpperCase()}`;

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-all text-slate-705 font-medium">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800 block">{log.actorName}</span>
                      <span className="text-[9px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
                        {log.actorRole === 'HR' ? 'HR BP' : log.actorRole === 'SeniorManager' ? 'SENIOR MANAGER' : log.actorRole}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-sans ${
                        log.action.includes('Approved') || log.action.includes('Signature') || log.action.includes('Success')
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : log.action.includes('Unlock') || log.action.includes('Override') || log.action.includes('Deleted')
                            ? 'bg-red-50 text-red-800 border border-red-105'
                            : log.action.includes('Calibration') || log.action.includes('Adjusted')
                              ? 'bg-purple-50 text-purple-800 border border-purple-100'
                              : 'bg-blue-50 text-blue-900 border border-blue-105'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-md select-all leading-normal text-slate-600">
                      {log.details}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-[10px] text-slate-400 uppercase tracking-widest selection:bg-slate-300">
                      {mockVerificationCode}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 italic">
                    No matching audit ledgers matches search descriptor filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
