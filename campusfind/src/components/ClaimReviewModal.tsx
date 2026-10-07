'use client';

import React, { useState } from 'react';
import { Claim, ClaimStatus } from '@/types';
import { ShieldCheck, X, Check, XCircle, AlertTriangle, Eye, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClaimReviewModalProps {
  claim: Claim & { private_details?: string };
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export default function ClaimReviewModal({
  claim,
  isOpen,
  onClose,
  onStatusUpdated,
}: ClaimReviewModalProps) {
  const [adminNotes, setAdminNotes] = useState(claim.admin_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpdateStatus = async (status: ClaimStatus) => {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/claims/${claim.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update claim status.');
      } else {
        if (status === 'approved' || status === 'completed') {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
        onStatusUpdated();
        onClose();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const answers = claim.verification_answers || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Verify Ownership Claim #{claim.id}
            </h3>
            <p className="text-xs text-slate-400">
              Claimant: <strong>{claim.claimant_name}</strong> ({claim.claimant_college_id || claim.claimant_email})
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-700/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Inspection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Left: Claimant answers */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Claimant&apos;s Submitted Answers
              </span>
              <span className="text-[10px] text-slate-400">{claim.claimant_name}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Contents & Unique Marks:</span>
                <p className="text-white bg-slate-900/60 p-2 rounded-lg mt-0.5 border border-slate-700/40">
                  {answers.contents_or_unique_marks || 'Not provided'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Colors / Attached Accents:</span>
                <p className="text-white bg-slate-900/60 p-2 rounded-lg mt-0.5 border border-slate-700/40">
                  {answers.colors_or_accents || 'Not provided'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Serial / Identifier Code:</span>
                <p className="text-white bg-slate-900/60 p-2 rounded-lg mt-0.5 border border-slate-700/40">
                  {answers.serial_or_identifying_code || 'Not provided'}
                </p>
              </div>

              {answers.additional_proof && (
                <div>
                  <span className="text-slate-400 block font-medium">Additional Proof:</span>
                  <p className="text-white bg-slate-900/60 p-2 rounded-lg mt-0.5 border border-slate-700/40">
                    {answers.additional_proof}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Secret verification details recorded by finder/staff */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-700/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-700/40">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Hidden Item Truth Key
              </span>
              <span className="text-[10px] bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full">
                Private Verification
              </span>
            </div>

            <div className="text-xs space-y-2 text-indigo-200">
              <p className="text-slate-300">
                Compare the claimant&apos;s responses on the left with the hidden verification details recorded for this item below:
              </p>

              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-3 text-indigo-100 font-mono text-[11px] leading-relaxed">
                {claim.private_details || 'No special private key recorded for this item.'}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-[11px] text-slate-400">
                <strong>Anti-Fraud Warning:</strong> If the claim is rejected as knowingly false, a fraud strike is recorded for this user. 3 strikes will automatically suspend the account.
              </div>
            </div>
          </div>
        </div>

        {/* Verification notes */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-semibold block">
            Reviewer / Handover Notes (optional):
          </label>
          <input
            type="text"
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            placeholder="e.g. Details verified in person at Security Office. Scheduled handover for 3 PM."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-400">
            Current Status: <span className="font-semibold capitalize text-white">{claim.status.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-2">
            {claim.status !== 'rejected' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('rejected')}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Claim</span>
              </button>
            )}

            {claim.status === 'pending' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('under_review')}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 transition-all flex items-center gap-1.5"
              >
                <span>Mark Under Review</span>
              </button>
            )}

            {claim.status !== 'approved' && claim.status !== 'completed' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('approved')}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve Claim & Arrange Handover</span>
              </button>
            )}

            {claim.status === 'approved' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('completed')}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Complete Handover & Mark Returned</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
