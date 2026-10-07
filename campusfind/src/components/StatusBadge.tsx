'use client';

import React from 'react';
import { ItemStatus, ClaimStatus } from '@/types';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, Sparkles, XCircle, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: ItemStatus | ClaimStatus | string;
  type?: 'item' | 'claim';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  switch (status) {
    case 'lost':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Lost Item</span>
        </span>
      );

    case 'found':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Found Item</span>
        </span>
      );

    case 'possible_match':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 animate-pulse ${sizeClasses}`}>
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Possible Match</span>
        </span>
      );

    case 'claim_pending':
    case 'pending':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Claim Pending</span>
        </span>
      );

    case 'under_review':
      return (
        <span className={`inline-flex items-center rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Under Review</span>
        </span>
      );

    case 'verified':
    case 'approved':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Verified & Approved</span>
        </span>
      );

    case 'rejected':
      return (
        <span className={`inline-flex items-center rounded-full bg-red-500/15 text-red-400 border border-red-500/30 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-red-400" />
          <span>Rejected</span>
        </span>
      );

    case 'returned':
    case 'completed':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Returned to Owner</span>
        </span>
      );

    case 'closed':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}>
          <Archive className="w-3.5 h-3.5 text-slate-400" />
          <span>Closed</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
}
