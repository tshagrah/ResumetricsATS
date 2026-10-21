import React from 'react';
import { FileText, Sparkles, Cloud, CloudOff, User, LogOut, CheckCircle2 } from 'lucide-react';
import type { UserSession } from '../services/storage';

interface NavbarProps {
  activeView: 'dashboard' | 'editor';
  setActiveView: (view: 'dashboard' | 'editor') => void;
  user: UserSession | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onQuickImport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  user,
  onOpenAuth,
  onSignOut,
  onQuickImport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                ResuMetric <span className="text-indigo-400 font-medium">ATS</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white py-1 ${
              activeView === 'dashboard' ? 'text-white border-b-2 border-indigo-400 font-semibold' : ''
            }`}
          >
            Resume Dashboard
          </button>
          <button
            onClick={() => setActiveView('editor')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white py-1 ${
              activeView === 'editor' ? 'text-white border-b-2 border-indigo-400 font-semibold' : ''
            }`}
          >
            CV Builder & Preview
          </button>
          <button
            onClick={onQuickImport}
            className="whitespace-nowrap shrink-0 transition-colors hover:text-white py-1 text-slate-300 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Import PDF / LinkedIn
          </button>
        </nav>

        {/* Zone 3: Primary Action & Google Auth Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 rounded-lg py-1.5 px-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Cloud className="w-2.5 h-2.5" /> Cloud Synced
                  </p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap"
            >
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guest Mode · </span>Sign In with Gmail
            </button>
          )}

          {activeView === 'dashboard' ? (
            <button
              onClick={() => setActiveView('editor')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
            >
              Open Editor
            </button>
          ) : (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              All Resumes
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
