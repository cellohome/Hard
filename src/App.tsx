/**
 * Hard - Desktop Application
 * "Clean, optimize, and understand your Windows PC."
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SafetyOnboardingModal } from './components/SafetyOnboardingModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { SmartCleanPage } from './pages/SmartCleanPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { StartupPage } from './pages/StartupPage';
import { DiskAnalyzerPage } from './pages/DiskAnalyzerPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { SettingsPage } from './pages/SettingsPage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activePage, toasts, dismissToast } = useApp();

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'clean':
        return <SmartCleanPage />;
      case 'apps':
        return <ApplicationsPage />;
      case 'startup':
        return <StartupPage />;
      case 'disk':
        return <DiskAnalyzerPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'monitor':
        return <LiveMonitorPage />;
      case 'activity_log':
        return <ActivityLogPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-300">
      {/* Top Header Navigation */}
      <Header />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        {/* Viewport Area */}
        <main className="flex-1 overflow-y-auto px-6 py-5 bg-gradient-to-b from-slate-950 to-slate-900/40">
          <div className="max-w-6xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CommandPalette />
      <ConfirmationModal />
      <SafetyOnboardingModal />

      {/* Toast Notification Queue */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((item) => (
            <div
              key={item.id}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-white animate-in slide-in-from-bottom-2 duration-150"
            >
              <div className="flex items-center gap-2.5">
                {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {item.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                {item.type === 'info' && <Info className="w-4 h-4 text-teal-400 shrink-0" />}
                <span className="font-medium leading-snug">{item.message}</span>
              </div>
              <button
                onClick={() => dismissToast(item.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title="Dismiss notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
