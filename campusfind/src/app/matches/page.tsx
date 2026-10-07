'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MatchScore } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  MapPin,
  Calendar,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Info
} from 'lucide-react';

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(50);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const filteredMatches = matches.filter(m => m.score >= minScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Intelligent Algorithmic Matching</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">
            Smart Matches &amp; Pairings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Our multi-factor algorithm scans category, keywords, color, brand, campus location, and date proximity to find candidate matches.
          </p>
        </div>

        {/* Filter by minimum confidence */}
        <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <span className="font-semibold text-slate-400">Min Confidence:</span>
          {[50, 70, 85].map(score => (
            <button
              key={score}
              onClick={() => setMinScore(score)}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                minScore === score
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {score}%+
            </button>
          ))}
        </div>
      </div>

      {/* Info Alert Box */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/40 flex items-start gap-3 text-xs text-indigo-200">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>How matching works:</strong> Matches are computed automatically without human bias. A high match score indicates that an item reported as lost shares significant characteristics with a reported found item. <em>&laquo;This may be your item. Submit a claim to verify ownership.&raquo;</em>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <span>Computing campus cross-reference matches...</span>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 text-purple-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">No High-Confidence Matches Above {minScore}%</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try lowering the minimum confidence threshold or report a lost item to trigger matching.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setMinScore(50)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
            >
              Show All Matches (50%+)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMatches.map((m, idx) => {
            const isExpanded = expandedIndex === idx;
            const b = m.breakdown;

            return (
              <div
                key={idx}
                className="rounded-3xl glass-panel p-6 border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl space-y-6"
              >
                {/* Header Row: Confidence Meter + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-sm font-extrabold flex items-center gap-1.5 shadow-md shadow-purple-500/10">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Possible Match — {m.score}%</span>
                    </div>

                    <span className="text-xs text-slate-400">
                      Detected across {m.lostItem.location_name} &amp; {m.foundItem.location_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Factor Breakdown' : 'Show Score Breakdown'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <Link
                      href={`/items/${m.foundItem.id}`}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Claim Item</span>
                    </Link>
                  </div>
                </div>

                {/* Side-by-side Item Comparison (Lost vs Found) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* Left: Lost Report */}
                  <div className="rounded-2xl bg-slate-900/90 p-5 border border-rose-900/40 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Lost Report
                        </span>
                        <span className="text-[11px] text-slate-400">{m.lostItem.date}</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <img
                          src={m.lostItem.image_url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=300&q=80'}
                          alt={m.lostItem.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                        />
                        <div>
                          <h4 className="font-heading font-bold text-sm text-white line-clamp-1">{m.lostItem.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{m.lostItem.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-slate-300 font-medium">{m.lostItem.location_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Color / Brand:</span>
                        <span className="text-slate-300 font-medium">{m.lostItem.color || 'N/A'} {m.lostItem.brand ? `• ${m.lostItem.brand}` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Found Report */}
                  <div className="rounded-2xl bg-slate-900/90 p-5 border border-emerald-900/40 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Found Discovery
                        </span>
                        <span className="text-[11px] text-slate-400">{m.foundItem.date}</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <img
                          src={m.foundItem.image_url || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80'}
                          alt={m.foundItem.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                        />
                        <div>
                          <h4 className="font-heading font-bold text-sm text-white line-clamp-1">{m.foundItem.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{m.foundItem.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-slate-300 font-medium">{m.foundItem.location_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Color / Brand:</span>
                        <span className="text-slate-300 font-medium">{m.foundItem.color || 'N/A'} {m.foundItem.brand ? `• ${m.foundItem.brand}` : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Factor Breakdown Accordion (Section 10) */}
                {isExpanded && (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 animate-in fade-in space-y-3">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Algorithmic Factor Breakdown (Max 100%)
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Category (30%)</span>
                        <span className={`font-bold ${b.categoryMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                          +{b.categoryScore} pts
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Keywords (35%)</span>
                        <span className="font-bold text-cyan-400">+{b.keywordScore} pts</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Location (15%)</span>
                        <span className={`font-bold ${b.locationMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                          +{b.locationScore} pts
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Color (10%)</span>
                        <span className={`font-bold ${b.colorMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                          +{b.colorScore} pts
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Brand (10%)</span>
                        <span className={`font-bold ${b.brandMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                          +{b.brandScore} pts
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Date Proximity</span>
                        <span className="font-bold text-purple-400">+{b.dateScore} pts</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
