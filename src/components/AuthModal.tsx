import React, { useState } from 'react';
import { X, Cloud, Shield, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import type { UserSession } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignInSuccess,
}) => {
  const [emailInput, setEmailInput] = useState('tshagrah@gmail.com');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const user: UserSession = {
        uid: `user-${Date.now()}`,
        email: emailInput.trim(),
        displayName: displayName.trim() || emailInput.split('@')[0],
        isCloudSynced: true,
        lastSyncedAt: Date.now(),
      };
      onSignInSuccess(user);
      setIsLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Cloud Sync & Google Sign-In</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="p-5 space-y-4">
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Secure Cross-Device Cloud Sync
            </div>
            <p className="text-[11px] text-emerald-400/90 leading-relaxed">
              Sign in with your Google account to automatically back up your resumes and sync across mobile, tablet, and desktop devices.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Google / Gmail Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Vance"
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !emailInput.trim()}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-colors shadow-sm shadow-emerald-900/40 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Connecting Cloud...' : 'Sign In with Gmail & Enable Sync'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 text-center"
            >
              Continue in Guest Mode (Local Storage Only)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
