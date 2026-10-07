'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category, CampusLocation } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  PlusCircle,
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Award,
  Eye,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReportLostPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [locationId, setLocationId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [approximateTime, setApproximateTime] = useState('14:00');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [privateDetails, setPrivateDetails] = useState('');
  const [reward, setReward] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, locRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/locations'),
        ]);
        const catData = await catRes.json();
        const locData = await locRes.json();
        setCategories(catData.categories || []);
        setLocations(locData.locations || []);
        if (catData.categories?.length) setCategoryId(String(catData.categories[0].id));
        if (locData.locations?.length) setLocationId(String(locData.locations[0].id));
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else {
        setError(data.error || 'Failed to upload image.');
      }
    } catch {
      setError('Error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAiEnhance = async () => {
    if (!title.trim() && !description.trim()) {
      setError('Please provide at least an item name to enhance.');
      return;
    }
    setIsAiEnhancing(true);
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance_description',
          text: description || title,
        }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setDescription(data.suggestion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to report an item. Please login or select a demo persona above.');
      return;
    }

    if (!title.trim() || !categoryId || !locationId || !description.trim() || !date) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lost',
          title: title.trim(),
          category_id: Number(categoryId),
          description: description.trim(),
          location_id: Number(locationId),
          date,
          approximate_time: approximateTime,
          color: color.trim(),
          brand: brand.trim(),
          model: model.trim(),
          private_details: privateDetails.trim(),
          reward: reward.trim(),
          image_url: imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit report.');
      } else {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        router.push(`/items/${data.item.id}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLoc = locations.find(l => l.id === Number(locationId));
  const selectedCat = categories.find(c => c.id === Number(categoryId));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Lost Property Registration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-heading">Report a Lost Item</h1>
        <p className="text-xs text-slate-400">
          Provide as many identifying details as possible. CampusFind will immediately check for matching found items.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form (7 cols) + Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Basic Item Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Item Name / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='e.g. Black JBL Wireless Earbuds, Fossil Leather Wallet, Student ID...'
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Last Seen Campus Location *
                </label>
                <select
                  value={locationId}
                  onChange={e => setLocationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.building})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date Lost *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Approximate Time
                </label>
                <input
                  type="time"
                  value={approximateTime}
                  onChange={e => setApproximateTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="e.g. Black"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. JBL, Apple"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. 230NC TWS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Description & AI Assistant */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Item Description *
                </label>
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={isAiEnhancing}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiEnhancing ? 'Enhancing...' : '✨ AI Enhance Description'}</span>
                </button>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe where you left it, special markings, stickers, engravings, contents, or circumstances..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Upload Photo (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {imageUrl && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Photo uploaded successfully
                  </span>
                )}
              </div>
            </div>

            {/* Private Verification Traits */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-700/40 space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300">
                  Private Identifying Details (To Verify Finder)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enter details known only to you (e.g. exact wallpaper picture, phone passcode hint, engraved letters, inside pocket coins).
              </p>
              <input
                type="text"
                value={privateDetails}
                onChange={e => setPrivateDetails(e.target.value)}
                placeholder="e.g. Serial ending in 492, dent on bottom rim, library card ending in 014..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Reward */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reward for Finder (Optional)
              </label>
              <input
                type="text"
                value={reward}
                onChange={e => setReward(e.target.value)}
                placeholder='e.g. "$20 Cafeteria Voucher" or "Free Coffee"'
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-xl shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Publishing Lost Report...</span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Submit Lost Report &amp; Run Smart Matching</span>
              </>
            )}
          </button>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              Live Public Preview
            </span>
            <span>How students see this</span>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 p-4 space-y-4 shadow-xl">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 relative">
              <img
                src={imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-600 text-white shadow">
                  Lost Item
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/90 text-slate-300 border border-slate-700">
                  {selectedCat?.name || 'Category'}
                </span>
              </div>
              {reward && (
                <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <Award className="w-3 h-3" />
                  <span>{reward}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-bold text-base text-white">
                {title || 'Untitled Lost Item'}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {description || 'Your item description will appear here...'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300">{selectedLoc?.name || 'Campus Location'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{date} • {approximateTime}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Personal phone numbers &amp; emails are protected. Students communicate via safe in-app chat.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
