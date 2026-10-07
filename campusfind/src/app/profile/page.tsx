'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Item, Claim, Notification } from '@/types';
import ItemCard from '@/components/ItemCard';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import {
  User as UserIcon,
  GraduationCap,
  Mail,
  Award,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Bell,
  LogOut,
  PlusCircle,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const [myItems, setMyItems] = useState<Item[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'claims' | 'notifications'>('lost');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      try {
        const [itemsRes, claimsRes, notifRes] = await Promise.all([
          fetch(`/api/items?user_id=${user.id}`),
          fetch('/api/claims'),
          fetch('/api/notifications'),
        ]);

        const itemsData = await itemsRes.json();
        const claimsData = await claimsRes.json();
        const notifData = await notifRes.json();

        setMyItems(itemsData.items || []);
        setMyClaims((claimsData.claims || []).filter((c: Claim) => c.claimant_id === user.id));
        setNotifications(notifData.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-heading">Login to View Profile</h2>
        <p className="text-xs text-slate-400">
          Sign in or switch demo persona to see your personal campus statistics and reports history.
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
        >
          Login
        </Link>
      </div>
    );
  }

  const lostItems = myItems.filter(i => i.type === 'lost');
  const foundItems = myItems.filter(i => i.type === 'found');
  const returnedItems = myItems.filter(i => i.status === 'returned');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Card Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={user.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white font-heading">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                  {user.role}
                </span>
                {user.is_flagged && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600/30 text-rose-300 border border-rose-500/40">
                    Flagged / Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{user.department} • {user.year || 'Student'}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">ID: {user.college_id}</span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* User Stats Grid (Section 17) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-2xl font-bold text-rose-400 font-heading">{lostItems.length}</div>
            <div className="text-xs text-slate-400 font-medium">Lost Reports Posted</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-2xl font-bold text-emerald-400 font-heading">{foundItems.length}</div>
            <div className="text-xs text-slate-400 font-medium">Found Items Reported</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-2xl font-bold text-purple-400 font-heading">{myClaims.length}</div>
            <div className="text-xs text-slate-400 font-medium">Claims Submitted</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-2xl font-bold text-cyan-400 font-heading">{returnedItems.length}</div>
            <div className="text-xs text-slate-400 font-medium">Items Recovered</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'lost'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My Lost Items ({lostItems.length})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'found'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My Found Reports ({foundItems.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'claims'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My Claims ({myClaims.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'notifications'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Notifications ({notifications.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'lost' && (
          <div>
            {lostItems.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white font-heading">No lost reports filed yet</h3>
                <p className="text-xs text-slate-400">If you lost an item, report it now to trigger smart matching.</p>
                <Link
                  href="/report/lost"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Report Lost Item</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {lostItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'found' && (
          <div>
            {foundItems.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white font-heading">No found items reported</h3>
                <p className="text-xs text-slate-400">Found something on campus? Register it to return it to the owner.</p>
                <Link
                  href="/report/found"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Report Found Item</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {foundItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div>
            {myClaims.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white font-heading">No claims submitted</h3>
                <p className="text-xs text-slate-400">When you submit verification answers for a found item, track it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myClaims.map(cl => (
                  <div key={cl.id} className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{cl.item_title}</span>
                      <StatusBadge status={cl.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Proof: {cl.verification_answers?.contents_or_unique_marks || 'N/A'}
                    </p>
                    <Link
                      href={`/items/${cl.item_id}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 block pt-1"
                    >
                      View Referenced Item &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 text-xs text-slate-400">
                You&apos;re all caught up! No notifications.
              </div>
            ) : (
              notifications.map(n => (
                <Link
                  key={n.id}
                  href={n.link || '/'}
                  className={`block p-4 rounded-2xl border transition-all text-xs ${
                    !n.is_read
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{n.message}</p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
