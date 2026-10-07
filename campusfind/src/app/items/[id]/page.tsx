'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Item, Claim, MatchScore } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import VerificationClaimModal from '@/components/VerificationClaimModal';
import ClaimReviewModal from '@/components/ClaimReviewModal';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  Shield,
  ShieldCheck,
  MessageSquare,
  Award,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  Flag,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [item, setItem] = useState<(Item & { has_private_verification?: boolean }) | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [reviewClaim, setReviewClaim] = useState<Claim | null>(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSuccess, setFlagSuccess] = useState(false);

  const fetchItemDetails = async () => {
    try {
      const res = await fetch(`/api/items/${id}`);
      if (!res.ok) {
        setItem(null);
        return;
      }
      const data = await res.json();
      setItem(data.item);
      setCanEdit(data.canEdit);

      // Fetch matches
      const matchRes = await fetch(`/api/matches?item_id=${id}`);
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        setMatches(matchData.matches || []);
      }

      // If user is owner or admin, fetch claims for this item
      if (data.canEdit) {
        const claimsRes = await fetch(`/api/claims?item_id=${id}`);
        if (claimsRes.ok) {
          const claimsData = await claimsRes.json();
          setClaims(claimsData.claims || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id, user]);

  const handleMarkReturned = async () => {
    try {
      const res = await fetch(`/api/items/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'returned' }),
      });
      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        fetchItemDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSuspicious = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReason.trim()) return;
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: id, reason: flagReason.trim() }),
      });
      if (res.ok) {
        setFlagSuccess(true);
        setTimeout(() => {
          setFlagModalOpen(false);
          setFlagSuccess(false);
          setFlagReason('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center text-slate-400">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
        <span>Loading item report details...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-heading">Item Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested item report does not exist or may have been removed by an administrator.
        </p>
        <Link
          href="/items"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
        >
          Return to Items Directory
        </Link>
      </div>
    );
  }

  const isLost = item.type === 'lost';
  const isOwner = user && user.id === item.user_id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/items" className="hover:text-white">Items</Link>
        <span>/</span>
        <span className="text-slate-200 truncate">{item.title}</span>
      </div>

      {/* Main Item Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image & Quick Visuals (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl aspect-[4/3]">
            <img
              src={item.image_url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isLost ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isLost ? 'Lost Item' : 'Found Item'}
              </span>
              <StatusBadge status={item.status} size="md" />
            </div>

            {item.reward && (
              <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Award className="w-3.5 h-3.5" />
                <span>{item.reward}</span>
              </div>
            )}
          </div>

          {/* Quick Item Attributes Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{item.category_name}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Location</span>
              <span className="text-xs font-bold text-white mt-0.5 block truncate">{item.location_name}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date Reported</span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {item.date} {item.approximate_time ? `• ${item.approximate_time}` : ''}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Color / Brand</span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {item.color || 'N/A'} {item.brand ? `• ${item.brand}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Description & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {item.location_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {item.date}
              </span>
              <span>•</span>
              <span className="text-slate-500">{item.views_count} views</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description</h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>

            {item.storage_location && (
              <div className="pt-3 mt-3 border-t border-slate-800 flex items-start gap-2 text-xs text-indigo-300">
                <Building className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Current Physical Custody:</strong> {item.storage_location}
                </div>
              </div>
            )}
          </div>

          {/* Reported by profile card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                {item.user_name?.charAt(0) || 'U'}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{item.user_name}</span>
                <span className="text-[11px] text-slate-400 capitalize">
                  {item.user_role} • Verified Campus Member
                </span>
              </div>
            </div>

            {!isOwner && user && (
              <Link
                href={`/messages?user_id=${item.user_id}&item_id=${item.id}`}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Message</span>
              </Link>
            )}
          </div>

          {/* Private Verification Traits (Visible ONLY to owner, staff, or admin) */}
          {canEdit && item.private_details && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Confidential Verification Key (Owner / Staff Only)
                </span>
                <span className="text-[10px] bg-indigo-600/30 text-indigo-200 px-2 py-0.5 rounded-full">
                  Hidden From Public
                </span>
              </div>
              <p className="text-xs text-white font-mono bg-slate-900/90 p-2.5 rounded-xl border border-indigo-500/30">
                {item.private_details}
              </p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* If Found item and user is NOT owner: Claim button */}
            {!isLost && !isOwner && item.status !== 'returned' && (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="px-6 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-xl shadow-cyan-600/25 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Claim This Item (Verify Ownership)</span>
              </button>
            )}

            {/* If Owner / Staff: Mark as Returned */}
            {canEdit && item.status !== 'returned' && (
              <button
                onClick={handleMarkReturned}
                className="px-5 py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Successfully Returned</span>
              </button>
            )}

            {/* Flag suspicious report */}
            <button
              onClick={() => setFlagModalOpen(true)}
              className="px-4 py-3 rounded-2xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Flag Suspicious</span>
            </button>
          </div>
        </div>
      </div>

      {/* Claims Management for Finder/Staff */}
      {canEdit && claims.length > 0 && (
        <section className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Ownership Claims Received ({claims.length})
              </h2>
              <p className="text-xs text-slate-400">
                Inspect claimant answers against your private verification details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map(cl => (
              <div
                key={cl.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{cl.claimant_name}</span>
                  <StatusBadge status={cl.status} size="sm" />
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="line-clamp-2">
                    <strong>Proof:</strong> {cl.verification_answers?.contents_or_unique_marks || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setReviewClaim({ ...cl, private_details: item.private_details })}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect &amp; Verify Claim</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Smart Matching Recommendations for this Item */}
      {matches.length > 0 && (
        <section className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-6 sm:p-8 border border-purple-500/30 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  AI Smart Matches for This Item
                </h3>
                <p className="text-xs text-slate-400">
                  Potential matching reports detected on campus by algorithm
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matches.slice(0, 3).map((m, idx) => {
              const matchedOpposite = item.type === 'lost' ? m.foundItem : m.lostItem;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                      Possible Match — {m.score}%
                    </span>
                    <span className="text-[10px] text-slate-400">{matchedOpposite.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{matchedOpposite.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{matchedOpposite.description}</p>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      {matchedOpposite.location_name}
                    </span>
                    <Link
                      href={`/items/${matchedOpposite.id}`}
                      className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Verification Claim Modal */}
      <VerificationClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onClaimSuccess={fetchItemDetails}
      />

      {/* Verification Review Modal */}
      {reviewClaim && (
        <ClaimReviewModal
          claim={reviewClaim}
          isOpen={Boolean(reviewClaim)}
          onClose={() => setReviewClaim(null)}
          onStatusUpdated={fetchItemDetails}
        />
      )}

      {/* Flag Suspicious Report Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white font-heading">Report Suspicious Item</h3>
            <p className="text-xs text-slate-400">
              Help keep CampusFind safe. Provide a reason why this post is inappropriate, spam, or duplicate.
            </p>

            {flagSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs text-center font-bold">
                Report submitted for campus moderation review.
              </div>
            ) : (
              <form onSubmit={handleReportSuspicious} className="space-y-3">
                <textarea
                  value={flagReason}
                  onChange={e => setFlagReason(e.target.value)}
                  placeholder="Explain why this report appears suspicious or violates campus rules..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFlagModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
