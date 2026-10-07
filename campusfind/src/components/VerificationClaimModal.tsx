'use client';

import React, { useState } from 'react';
import { Item } from '@/types';
import { ShieldCheck, X, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VerificationClaimModalProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: () => void;
}

export default function VerificationClaimModal({
  item,
  isOpen,
  onClose,
  onClaimSuccess,
}: VerificationClaimModalProps) {
  const [contents, setContents] = useState('');
  const [colorsOrAccents, setColorsOrAccents] = useState('');
  const [serialOrCode, setSerialOrCode] = useState('');
  const [additionalProof, setAdditionalProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contents.trim() && !colorsOrAccents.trim() && !serialOrCode.trim()) {
      setError('Please provide at least one specific identifying detail to verify your ownership.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          verification_answers: {
            contents_or_unique_marks: contents.trim(),
            colors_or_accents: colorsOrAccents.trim(),
            serial_or_identifying_code: serialOrCode.trim(),
            additional_proof: additionalProof.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit ownership claim.');
      } else {
        setSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          onClaimSuccess();
          onClose();
        }, 2200);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error submitting claim.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">Claim Submitted!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your verification details have been sent to the finder / campus security. You will receive an in-app notification once your claim is verified.
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-indigo-300">
              Safe handover instructions will be provided upon approval.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">Claim Ownership Verification</h3>
                <p className="text-xs text-slate-400">Item: &quot;{item.title}&quot;</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2.5 text-xs text-indigo-200">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                <strong>Confidential Verification:</strong> Your answers will ONLY be compared against the private verification traits recorded by the finder. They are never shown publicly.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/60 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  1. What was inside the item or what unique marks exist? *
                </label>
                <textarea
                  value={contents}
                  onChange={e => setContents(e.target.value)}
                  placeholder="e.g. In the left pocket there is a blue pen; scratch on the rear edge; specific wallpaper or sticker..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  2. Specific colors, patterns, or attached accessories:
                </label>
                <input
                  type="text"
                  value={colorsOrAccents}
                  onChange={e => setColorsOrAccents(e.target.value)}
                  placeholder="e.g. Batman keychain, brown stitching, orange inner lining..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  3. Serial number, student ID code, or passcode hint:
                </label>
                <input
                  type="text"
                  value={serialOrCode}
                  onChange={e => setSerialOrCode(e.target.value)}
                  placeholder="e.g. Serial ending in 492; Student ID # 2024-EC-118; device PIN starts with 7..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  4. Additional proof / verification details (optional):
                </label>
                <textarea
                  value={additionalProof}
                  onChange={e => setAdditionalProof(e.target.value)}
                  placeholder="e.g. Purchase invoice, ability to connect via Bluetooth in person, photo of item on phone..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting Verification...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Ownership Claim</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
