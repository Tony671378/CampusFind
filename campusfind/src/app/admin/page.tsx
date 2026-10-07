'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SystemStats, User, Report, CampusLocation, Category, Item } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import {
  Shield,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Trash2,
  RefreshCw,
  PlusCircle,
  Lock,
  Eye,
  MapPin,
  Tag,
  Building,
  Flag,
  FileCheck
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'users' | 'reports' | 'locations' | 'categories' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Form states for adding location / category
  const [newLocName, setNewLocName] = useState('');
  const [newLocBuilding, setNewLocBuilding] = useState('');
  const [newLocZone, setNewLocZone] = useState('Academic');
  const [newLocX, setNewLocX] = useState(50);
  const [newLocY, setNewLocY] = useState(50);

  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');

  const [allowedDomain, setAllowedDomain] = useState('@college.edu');
  const [handoverLoc, setHandoverLoc] = useState('');

  const loadAllAdminData = async () => {
    try {
      const [statsRes, usersRes, reportsRes, locRes, catRes, itemsRes, settRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/reports'),
        fetch('/api/locations'),
        fetch('/api/categories'),
        fetch('/api/items?limit=100'),
        fetch('/api/admin/settings'),
      ]);

      const [statsD, usersD, repD, locD, catD, itemsD, settD] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        reportsRes.json(),
        locRes.json(),
        catRes.json(),
        itemsRes.json(),
        settRes.json(),
      ]);

      setStats(statsD.stats || null);
      setUsersList(usersD.users || []);
      setReports(repD.reports || []);
      setLocations(locD.locations || []);
      setCategories(catD.categories || []);
      setItems(itemsD.items || []);
      if (settD.settings) {
        setSettings(settD.settings);
        setAllowedDomain(settD.settings.allowed_email_domain || '@college.edu');
        setHandoverLoc(settD.settings.safe_handover_location || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [user]);

  const handleToggleUserSuspend = async (userId: number, currentFlag: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, is_flagged: !currentFlag }),
      });
      if (res.ok) {
        setActionMessage(`User #${userId} status updated.`);
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetUserClaims = async (userId: number) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, reset_claims: true }),
      });
      if (res.ok) {
        setActionMessage(`User #${userId} fraud strikes cleared.`);
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setActionMessage(`Item #${itemId} removed by administrator.`);
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportAction = async (reportId: number, status: 'reviewed' | 'dismissed') => {
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId, status }),
      });
      if (res.ok) {
        setActionMessage(`Report marked as ${status}.`);
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLocName,
          building: newLocBuilding,
          zone: newLocZone,
          map_x: newLocX,
          map_y: newLocY,
        }),
      });
      if (res.ok) {
        setActionMessage('Campus location registered.');
        setNewLocName('');
        setNewLocBuilding('');
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, icon: newCatIcon }),
      });
      if (res.ok) {
        setActionMessage('New category added.');
        setNewCatName('');
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            allowed_email_domain: allowedDomain,
            safe_handover_location: handoverLoc,
          },
        }),
      });
      if (res.ok) {
        setActionMessage('System settings saved successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('This will wipe recent changes and re-seed 10 users, 30 items, and locations. Continue?')) return;
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      if (res.ok) {
        alert('CampusFind database re-seeded successfully!');
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-white font-heading">Staff &amp; Admin Access Only</h2>
        <p className="text-xs text-slate-400">
          This portal is reserved for college security officers and campus administrators. Switch to Dean Miller or Officer Hall in the top bar to inspect.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Campus Operations &amp; Moderation Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">
            Administrative Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, user audits, spam moderation, and campus location management.
          </p>
        </div>

        <button
          onClick={handleResetDemoData}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset Demo Seed Data</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-400 font-bold ml-2">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-bold border-b border-slate-800">
        {[
          { key: 'overview', label: 'Analytics & Overview', icon: TrendingUp },
          { key: 'items', label: `Items (${items.length})`, icon: Tag },
          { key: 'reports', label: `Flagged Reports (${reports.filter(r => r.status === 'pending').length} new)`, icon: Flag },
          { key: 'users', label: `Users & Anti-Fraud (${usersList.length})`, icon: Users },
          { key: 'locations', label: `Campus Locations (${locations.length})`, icon: MapPin },
          { key: 'categories', label: `Categories (${categories.length})`, icon: Tag },
          { key: 'settings', label: 'System Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Overview & Analytics Tab (Section 18) */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Top Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Users</span>
              <div className="text-2xl font-extrabold text-white font-heading">{stats.totalUsers}</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Lost Items</span>
              <div className="text-2xl font-extrabold text-rose-400 font-heading">{stats.totalLost}</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Found Items</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-heading">{stats.totalFound}</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Active Claims</span>
              <div className="text-2xl font-extrabold text-amber-400 font-heading">{stats.activeClaims}</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Items Returned</span>
              <div className="text-2xl font-extrabold text-cyan-400 font-heading">{stats.returnedItems}</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Recovery Rate</span>
              <div className="text-2xl font-extrabold text-purple-400 font-heading">{stats.recoveryRatePercent}%</div>
            </div>
          </div>

          {/* Graphical Analytics Charts (Section 18) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Items by Category */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider flex items-center justify-between">
                <span>Items Distribution by Category</span>
                <Tag className="w-4 h-4 text-cyan-400" />
              </h3>

              <div className="space-y-3 text-xs">
                {stats.itemsByCategory.map(cat => {
                  const maxCount = Math.max(...stats.itemsByCategory.map(c => c.count), 1);
                  const pct = Math.round((cat.count / maxCount) * 100);
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{cat.name}</span>
                        <span className="text-slate-400 font-bold">{cat.count} items</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Top Locations Hotspots */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider flex items-center justify-between">
                <span>Top Campus Lost &amp; Found Hotspots</span>
                <MapPin className="w-4 h-4 text-rose-400" />
              </h3>

              <div className="space-y-3 text-xs">
                {stats.itemsByLocation.map(loc => {
                  const maxCount = Math.max(...stats.itemsByLocation.map(l => l.count), 1);
                  const pct = Math.round((loc.count / maxCount) * 100);
                  return (
                    <div key={loc.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{loc.name}</span>
                        <span className="text-slate-400 font-bold">{loc.count} reports</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Items Moderation Tab */}
      {activeTab === 'items' && (
        <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-heading">Item Catalog Moderation</h3>
            <span className="text-xs text-slate-400">{items.length} Total Reports</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase text-slate-400 bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Item</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono text-slate-400">#{item.id}</td>
                    <td className="p-3 font-semibold text-white max-w-xs truncate">{item.title}</td>
                    <td className="p-3 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.type === 'lost' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3">{item.category_name}</td>
                    <td className="p-3 truncate max-w-[150px]">{item.location_name}</td>
                    <td className="p-3">{item.user_name}</td>
                    <td className="p-3"><StatusBadge status={item.status} size="sm" /></td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/items/${item.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Flagged Reports Tab (Section 25 Anti-Fraud) */}
      {activeTab === 'reports' && (
        <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-heading">User-Reported Suspicious Activity</h3>
            <span className="text-xs text-slate-400">{reports.length} Total Flags</span>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No reported suspicious posts or flagged content.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Flagged Item: &quot;{r.item_title}&quot;
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-xl border border-rose-900/40">
                    <strong>Reported by {r.reporter_name}:</strong> {r.reason}
                  </p>
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <Link href={`/items/${r.item_id}`} className="text-cyan-400 hover:underline">
                      Inspect Item #{r.item_id} &rarr;
                    </Link>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReportAction(r.id, 'dismissed')}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => { handleDeleteItem(r.item_id); handleReportAction(r.id, 'reviewed'); }}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Delete Item &amp; Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Users & Anti-Fraud Tab (Section 25) */}
      {activeTab === 'users' && (
        <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white font-heading">User Directory &amp; Anti-Fraud Controls</h3>
            <span className="text-xs text-slate-400">{usersList.length} Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase text-slate-400 bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">College ID</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Activity</th>
                  <th className="p-3">Fraud Strikes</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">{u.name}</td>
                    <td className="p-3 font-mono">{u.college_id}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize font-bold text-indigo-300">{u.role}</td>
                    <td className="p-3 text-slate-400">
                      {(u as any).lost_count || 0} Lost • {(u as any).found_count || 0} Found
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${u.false_claims_count > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                        {u.false_claims_count} / 3
                      </span>
                    </td>
                    <td className="p-3">
                      {u.is_flagged ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {u.false_claims_count > 0 && (
                        <button
                          onClick={() => handleResetUserClaims(u.id)}
                          className="text-indigo-400 hover:text-indigo-300 text-[11px]"
                        >
                          Clear Strikes
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleUserSuspend(u.id, u.is_flagged)}
                        className={`text-[11px] font-bold ${
                          u.is_flagged ? 'text-emerald-400' : 'text-rose-400 hover:text-rose-300'
                        }`}
                      >
                        {u.is_flagged ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Campus Locations Tab (Section 14) */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-heading border-b border-slate-800 pb-2">
              Registered Campus Locations ({locations.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {locations.map(l => (
                <div key={l.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center justify-between">
                    <span>{l.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">({l.map_x}%, {l.map_y}%)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">{l.building} • Zone: {l.zone}</span>
                  <p className="text-[10px] text-slate-500">{l.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Location Form */}
          <form onSubmit={handleAddLocation} className="md:col-span-4 rounded-3xl glass-panel p-6 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2 border-b border-slate-800 pb-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Add Location
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location Name *</label>
              <input
                type="text"
                value={newLocName}
                onChange={e => setNewLocName(e.target.value)}
                placeholder="e.g. Biotech Greenhouse"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Building *</label>
              <input
                type="text"
                value={newLocBuilding}
                onChange={e => setNewLocBuilding(e.target.value)}
                placeholder="Franklin Hall"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Campus Zone</label>
              <input
                type="text"
                value={newLocZone}
                onChange={e => setNewLocZone(e.target.value)}
                placeholder="Academic / Engineering"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Map X (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newLocX}
                  onChange={e => setNewLocX(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Map Y (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newLocY}
                  onChange={e => setNewLocY(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
            >
              Add Campus Spot
            </button>
          </form>
        </div>
      )}

      {/* 6. Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-heading border-b border-slate-800 pb-2">
              Item Categories ({categories.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map(c => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-xs">{c.name}</div>
                  <span className="text-[10px] text-slate-400 font-mono">Icon: {c.icon}</span>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddCategory} className="md:col-span-4 rounded-3xl glass-panel p-6 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2 border-b border-slate-800 pb-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Add Category
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category Name *</label>
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="e.g. Sports Gear"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lucide Icon Name</label>
              <input
                type="text"
                value={newCatIcon}
                onChange={e => setNewCatIcon(e.target.value)}
                placeholder="Tag, Award, etc."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
            >
              Save Category
            </button>
          </form>
        </div>
      )}

      {/* 7. System Settings Tab (Section 5 Allowed Domain & Handover) */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6 max-w-2xl text-xs">
          <h3 className="text-base font-bold text-white font-heading border-b border-slate-800 pb-3">
            Campus System Configuration
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Allowed College Email Domain (Section 5 Requirement)
            </label>
            <input
              type="text"
              value={allowedDomain}
              onChange={e => setAllowedDomain(e.target.value)}
              placeholder="@college.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Registration will reject emails not matching this domain.
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Official Safe Handover Location Advice
            </label>
            <textarea
              value={handoverLoc}
              onChange={e => setHandoverLoc(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Displayed in claim approval notices to guide students to safe verification points.
            </span>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
          >
            Save System Settings
          </button>
        </form>
      )}
    </div>
  );
}
