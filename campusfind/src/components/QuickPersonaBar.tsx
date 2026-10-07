'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserCheck, Shield, GraduationCap, Users, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuickPersonaBar() {
  const { user, quickLogin, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const personas = [
    { id: 1, name: 'Alex Rivera', role: 'student', label: '🎓 Alex (Student - Lost Earbuds)', icon: GraduationCap },
    { id: 4, name: 'Emily Watson', role: 'student', label: '🎓 Emily (Student - Lost Wallet)', icon: GraduationCap },
    { id: 8, name: 'Officer Hall', role: 'staff', label: '🛡️ Officer Hall (Campus Security)', icon: Shield },
    { id: 9, name: 'Dr. Vance', role: 'staff', label: '📚 Dr. Vance (Library Staff)', icon: Users },
    { id: 10, name: 'Dean Miller', role: 'admin', label: '🏛️ Dean Miller (Campus Admin)', icon: UserCheck },
  ];

  if (collapsed) {
    return (
      <div className="bg-indigo-950/80 border-b border-indigo-800/40 text-xs py-1 px-4 flex justify-between items-center text-indigo-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Demo Role Switcher Active: <strong>{user ? `${user.name} (${user.role})` : 'Guest'}</strong></span>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-indigo-300 hover:text-white flex items-center gap-1 font-medium underline"
        >
          Expand Persona Bar <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-800/40 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-indigo-200">
          <span className="font-semibold text-white uppercase tracking-wider text-[10px] bg-indigo-600/60 px-2 py-0.5 rounded border border-indigo-400/30">
            Demo Persona Switcher
          </span>
          <span className="hidden sm:inline text-slate-400">Current Session:</span>
          {user ? (
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {user.name} ({user.role})
            </span>
          ) : (
            <span className="text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Guest (Not Logged In)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 hidden md:inline text-[11px]">Quick Switch:</span>
          {personas.map(p => {
            const isCurrent = user?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => quickLogin(p.id)}
                disabled={isLoading}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm ring-1 ring-white/30'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{p.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-400 hover:text-slate-200 p-1 ml-1"
            title="Collapse persona bar"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
