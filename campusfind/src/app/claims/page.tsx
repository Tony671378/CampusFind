'use client';

import React, { useState, useEffect } from 'react';
import { Claim, ClaimStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import ClaimReviewModal from '@/components/ClaimReviewModal';
import Link from 'next/link';
import {
  FileCheck,
  ShieldCheck,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Lock,
  MapPin,
  MessageSquare,
  HelpCircle,
  Building
} from 'lucide-react';

export default function ClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my_claims' | 'incoming' | 'all'>('my_claims');
  const [reviewClaim, setReviewClaim] = useState<Claim | null>(null);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/claims');
      const data = await res.json();
      setClaims(data.claims || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-heading">Authentication Required</h2>
        <p className="text-xs text-slate-400">
          Please log in or select a demo persona above to view your ownership claims and review incoming claims.
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
        >
          Login with Campus Credentials
        </Link>
      </div>
    );
  }

  // Filter claims based on active tab
  const mySubmittedClaims = claims.filter(c => c.claimant_id === user.id);
  const incomingClaims = claims.filter(c => c.claimant_id !== user.id);

  const displayedClaims =
    activeTab === 'my_claims'
      ? mySubmittedClaims
      : activeTab === 'incoming'
      ? incomingClaims
      : claims;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ownership Verification Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">
            Claims &amp; Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track claims you submitted and verify ownership answers for items you reported.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('my_claims')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'my_claims'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Claims ({mySubmittedClaims.length})
          </button>

          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'incoming'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Incoming Claims ({incomingClaims.length})
          </button>

          {(user.role === 'admin' || user.role === 'staff') && (
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Claims ({claims.length})
            </button>
          )}
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
          <span>Loading ownership claims...</span>
        </div>
      ) : displayedClaims.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
            <FileCheck className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">No Claims in this Category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'my_claims'
              ? 'You have not submitted any ownership claims yet. If you see a found item that belongs to you, click "Claim Item".'
              : 'No incoming claims pending review for your reported items.'}
          </p>
          <div className="pt-2">
            <Link
              href="/items"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-block"
            >
              Browse Campus Items
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedClaims.map(cl => {
            const isMyClaim = cl.claimant_id === user.id;
            const answers = cl.verification_answers || {};

            return (
              <div
                key={cl.id}
                className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  {/* Top row: Claim ID + Status Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-400">
                      Claim #{cl.id}
                    </span>
                    <StatusBadge status={cl.status} size="sm" />
                  </div>

                  {/* Item mini header */}
                  <div className="flex items-start gap-3">
                    <img
                      src={cl.item_image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=200&q=80'}
                      alt={cl.item_title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-800"
                    />
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white line-clamp-1">
                        {cl.item_title}
                      </h4>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {isMyClaim ? 'Submitted by You' : `Claimant: ${cl.claimant_name}`}
                      </span>
                    </div>
                  </div>

                  {/* Verification Answers Preview */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Verification Answers:
                    </span>
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">
                      {answers.contents_or_unique_marks || 'No mark description provided'}
                    </p>
                    {answers.serial_or_identifying_code && (
                      <p className="text-slate-400 text-[11px]">
                        <strong>ID Code / Serial:</strong> {answers.serial_or_identifying_code}
                      </p>
                    )}
                  </div>

                  {/* Admin notes if any */}
                  {cl.admin_notes && (
                    <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-700/40 text-[11px] text-indigo-200">
                      <strong>Review Note:</strong> {cl.admin_notes}
                    </div>
                  )}

                  {/* Safe Handover banner if approved */}
                  {cl.status === 'approved' && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2">
                      <Building className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Approved for Handover:</strong> Please collect your item at the Campus Security Post or Library Desk with your college ID.
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/items/${cl.item_id}`}
                    className="text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    View Item
                  </Link>

                  {/* If incoming claim or staff/admin: Review button */}
                  {!isMyClaim || user.role === 'admin' || user.role === 'staff' ? (
                    <button
                      onClick={() => setReviewClaim(cl)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect &amp; Verify</span>
                    </button>
                  ) : (
                    <Link
                      href={`/messages?item_id=${cl.item_id}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Message Finder</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewClaim && (
        <ClaimReviewModal
          claim={reviewClaim}
          isOpen={Boolean(reviewClaim)}
          onClose={() => setReviewClaim(null)}
          onStatusUpdated={fetchClaims}
        />
      )}
    </div>
  );
}
