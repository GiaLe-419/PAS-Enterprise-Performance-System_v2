/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CycleManagementView } from './components/CycleManagementView';
import { GoalManagementView } from './components/GoalManagementView';
import { AppraisalWorkflowView } from './components/AppraisalWorkflowView';
import { CalibrationView } from './components/CalibrationView';
import { AnalyticsView } from './components/AnalyticsView';
import { AuditLogView } from './components/AuditLogView';
import { LoginView } from './components/LoginView';
import { AlertTriangle, X } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(null);
  const { currentUser, loginType } = useApp();

  // Reset selected appraisal when switching user accounts to stay synchronized and show their own or correct default workspace record
  React.useEffect(() => {
    setSelectedAppraisalId(null);
  }, [currentUser?.id]);

  if (!loginType) {
    return <LoginView />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      {/* Upper header profile, act-as toggle switcher, and indicators */}
      <Header />

      <div className="flex flex-1 overflow-hidden select-none">
        {/* Sidebar Left Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Central scrollable workspaces area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/45 pb-11 select-text">
          {activeTab === 'dashboard' && (
            <DashboardView 
              setActiveTab={setActiveTab} 
              setSelectedAppraisalId={setSelectedAppraisalId} 
             />
          )}

          {activeTab === 'cycles' && (
            <CycleManagementView />
          )}

          {activeTab === 'goals' && (
            <GoalManagementView />
          )}

          {activeTab === 'appraisals' && (
            <AppraisalWorkflowView 
              selectedAppraisalId={selectedAppraisalId}
              setSelectedAppraisalId={setSelectedAppraisalId}
            />
          )}

          {activeTab === 'calibration' && (
            <CalibrationView />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'audits' && (
            <AuditLogView />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

