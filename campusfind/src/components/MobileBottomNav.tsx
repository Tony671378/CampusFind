'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageSquare, User, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <>
      {/* Bottom report selection modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:hidden">
          <div className="w-full bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-heading">Report an Item</h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Choose whether you lost a personal belonging or found an item on campus.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/report/lost"
                onClick={() => setReportModalOpen(false)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-rose-950/80 to-slate-900 border border-rose-500/40 text-center space-y-2 hover:border-rose-400"
              >
                <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-white">I Lost an Item</span>
                <span className="text-[10px] text-slate-400">Report missing property</span>
              </Link>

              <Link
                href="/report/found"
                onClick={() => setReportModalOpen(false)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 text-center space-y-2 hover:border-emerald-400"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-white">I Found an Item</span>
                <span className="text-[10px] text-slate-400">Report campus discovery</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2">
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
              pathname === '/' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </Link>

          <Link
            href="/items"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
              pathname === '/items' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span>Search</span>
          </Link>

          {/* Central Report Action Button */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex flex-col items-center justify-center -mt-5"
            aria-label="Report Item"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 ring-4 ring-slate-950 transition-transform active:scale-95">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300 mt-1">Report</span>
          </button>

          <Link
            href="/messages"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
              pathname === '/messages' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Messages</span>
          </Link>

          <Link
            href={user ? '/profile' : '/login'}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
              pathname === '/profile' || pathname === '/login' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
