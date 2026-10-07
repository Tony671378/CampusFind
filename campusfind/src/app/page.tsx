'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Item, Category, SystemStats, MatchScore } from '@/types';
import ItemCard from '@/components/ItemCard';
import {
  Search,
  PlusCircle,
  CheckCircle,
  Sparkles,
  MapPin,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Laptop,
  FileText,
  Briefcase,
  BookOpen,
  Watch,
  CreditCard,
  Key,
  Shirt,
  FlaskConical,
  Coffee,
  CheckCircle2,
  Lock,
  ChevronRight,
  Eye
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Laptop,
  FileText,
  Briefcase,
  BookOpen,
  Watch,
  CreditCard,
  Key,
  Shirt,
  FlaskConical,
  Coffee,
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentLost, setRecentLost] = useState<Item[]>([]);
  const [recentFound, setRecentFound] = useState<Item[]>([]);
  const [smartMatches, setSmartMatches] = useState<MatchScore[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [itemsRes, catRes, statsRes, matchesRes] = await Promise.all([
          fetch('/api/items?limit=20'),
          fetch('/api/categories'),
          fetch('/api/admin/stats'),
          fetch('/api/matches'),
        ]);

        const itemsData = await itemsRes.json();
        const catData = await catRes.json();
        const statsData = await statsRes.json();
        const matchesData = await matchesRes.json();

        const allItems: Item[] = itemsData.items || [];
        setRecentLost(allItems.filter(i => i.type === 'lost').slice(0, 8));
        setRecentFound(allItems.filter(i => i.type === 'found').slice(0, 8));
        setCategories(catData.categories || []);
        setStats(statsData.stats || null);
        setSmartMatches((matchesData.matches || []).slice(0, 3));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/items');
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 via-cyan-500/20 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Official College Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              Official Campus Platform • Metropolitan Institute
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.15]">
              Lost something on campus? <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Find it faster with CampusFind.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              &laquo;Lost something? Find it on Campus.&raquo; A centralized digital platform with smart AI matching, confidential ownership verification, and safe handover.
            </p>
          </div>

          {/* Big Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all"
            >
              <div className="pl-3.5 text-slate-400">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Search: "black wallet", "iPhone", "Casio calculator", "blue bottle"...'
                className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-400">
              <span className="text-slate-500">Popular:</span>
              {['Earbuds', 'Student ID', 'Water Bottle', 'Scientific Calculator', 'Keys', 'Backpack'].map(tag => (
                <button
                  key={tag}
                  onClick={() => router.push(`/items?search=${encodeURIComponent(tag)}`)}
                  className="bg-slate-800/80 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/report/lost"
              className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-xl shadow-rose-600/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report Lost Item</span>
            </Link>

            <Link
              href="/report/found"
              className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Report Found Item</span>
            </Link>

            <Link
              href="/map"
              className="px-5 py-3.5 rounded-2xl text-sm font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Campus Map</span>
            </Link>
          </div>

          {/* Dynamic Recovery Statistics Bar */}
          {stats && (
            <div className="pt-6">
              <div className="max-w-4xl mx-auto glass-panel rounded-2xl p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center border border-slate-800">
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                    {stats.totalLost + stats.totalFound}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Total Items Reported</div>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-heading">
                    {stats.totalFound}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Found &amp; In Custody</div>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-heading">
                    {stats.returnedItems}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Safely Returned</div>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-heading flex items-center justify-center gap-1">
                    <span>{stats.recoveryRatePercent}%</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Recovery Success Rate</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Smart Match Spotlight Banner (Section 10) */}
      {smartMatches.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white font-heading">Smart AI Matching Engine</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wide">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Our multi-factor algorithm continuously cross-references lost reports with found items on campus.
                  </p>
                </div>
              </div>

              <Link
                href="/matches"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>View All Smart Matches</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Smart Matches mini showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {smartMatches.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Pair #{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      Possible Match — {m.score}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40">
                      <span className="text-[10px] text-rose-400 font-bold uppercase block">Lost Report:</span>
                      <p className="text-white font-medium line-clamp-1">{m.lostItem.title}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block">Found Report:</span>
                      <p className="text-white font-medium line-clamp-1">{m.foundItem.title}</p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      {m.foundItem.location_name}
                    </span>
                    <Link
                      href={`/items/${m.foundItem.id}`}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Claim Item</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">Explore by Category</h2>
            <p className="text-xs text-slate-400 mt-1">Filter common belongings lost or found across campus buildings</p>
          </div>
          <Link
            href="/items"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map(cat => {
            const Icon = CATEGORY_ICON_MAP[cat.icon] || Laptop;
            return (
              <Link
                key={cat.id}
                href={`/items?category_id=${cat.id}`}
                className="glass-card rounded-2xl p-4 flex flex-col items-center text-center space-y-2 group hover:border-indigo-500/40"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 group-hover:bg-indigo-600/20 text-slate-300 group-hover:text-cyan-400 flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {cat.description?.slice(0, 24)}...
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Recent Items Feed (Recently Lost & Recently Found) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">Campus Item Feed</h2>
            <p className="text-xs text-slate-400 mt-1">Browse live reports submitted by students and campus staff</p>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab('lost')}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'lost'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recently Lost
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recently Found
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activeTab === 'all' && (
            <>
              {recentLost.slice(0, 4).map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
              {recentFound.slice(0, 4).map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </>
          )}

          {activeTab === 'lost' && (
            recentLost.map(item => (
              <ItemCard key={item.id} item={item} />
            ))
          )}

          {activeTab === 'found' && (
            recentFound.map(item => (
              <ItemCard key={item.id} item={item} />
            ))
          )}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/items"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-md"
          >
            <span>View All Campus Reports &amp; Apply Filters</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Safe Campus Handover Protocol Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Security &amp; Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              How CampusFind Protects Your Belongings
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed specifically for campus trust. We ensure that only verified owners can claim items, protecting students from false claims or duplicate posts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold font-heading">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Report on the Network</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Post detailed lost or found reports. Important secret traits stay hidden to verify ownership later.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold font-heading">
                02
              </div>
              <h3 className="text-sm font-bold text-white">Smart Match Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our algorithm calculates category, keywords, color, brand, and date proximity to detect potential matches automatically.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold font-heading">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Confidential Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Claimants answer unique proof questions. The finder or campus security verifies the answers before approving.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold font-heading">
                04
              </div>
              <h3 className="text-sm font-bold text-white">Safe Handover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Meet safely at designated spots like the Security Gatehouse or Library Circulation Desk to recover your item.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
