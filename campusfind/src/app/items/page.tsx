'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Item, Category, CampusLocation } from '@/types';
import ItemCard from '@/components/ItemCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  PlusCircle,
  X,
  Sparkles,
  MapPin,
  Tag,
  Calendar,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

function ItemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState<'all' | 'lost' | 'found'>(
    (searchParams.get('type') as 'all' | 'lost' | 'found') || 'all'
  );
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [locationId, setLocationId] = useState(searchParams.get('location_id') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [nlQuery, setNlQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Fetch filter options
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
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  // Fetch items based on active filters
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== 'all') params.set('type', type);
      if (categoryId) params.set('category_id', categoryId);
      if (locationId) params.set('location_id', locationId);
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      if (color.trim()) params.set('color', color.trim());
      if (brand.trim()) params.set('brand', brand.trim());

      const res = await fetch(`/api/items?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, categoryId, locationId, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategoryId('');
    setLocationId('');
    setStatus('');
    setColor('');
    setBrand('');
    router.push('/items');
  };

  const handleAiSearch = async () => {
    if (!nlQuery.trim()) return;
    setIsAiSearching(true);
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_search',
          text: nlQuery,
        }),
      });
      const parsed = await res.json();
      if (parsed.type) setType(parsed.type);
      if (parsed.category_id) setCategoryId(String(parsed.category_id));
      if (parsed.location_id) setLocationId(String(parsed.location_id));
      if (parsed.color) setColor(parsed.color);
      if (parsed.keyword) setSearch(parsed.keyword);
    } catch (err) {
      console.error('AI search parse error:', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-heading">Campus Items Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect verified lost and found belongings across campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => router.push('/report/lost')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </button>

          <button
            onClick={() => router.push('/report/found')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* AI Smart Natural Language Query Bar (Section 26) */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 p-4 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold shrink-0">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Natural Language Search:</span>
        </div>
        <div className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={nlQuery}
            onChange={e => setNlQuery(e.target.value)}
            placeholder='e.g. "I lost my blue water bottle near the sports ground yesterday"'
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleAiSearch}
            disabled={isAiSearching}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all shrink-0 flex items-center gap-1"
          >
            <span>{isAiSearching ? 'Parsing...' : 'Auto-Filter'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filters + Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar Filter Column */}
        <aside
          className={`space-y-5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 ${
            showFiltersMobile ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              Filter Catalog
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Report Type</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setType('all')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  type === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setType('lost')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  type === 'lost' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setType('found')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  type === 'found' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Found
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Campus Location</label>
            <select
              value={locationId}
              onChange={e => setLocationId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Campus Locations</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lifecycle Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Item Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Any Status</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
              <option value="possible_match">Possible Match</option>
              <option value="claim_pending">Claim Pending</option>
              <option value="verified">Verified / Approved</option>
              <option value="returned">Successfully Returned</option>
            </select>
          </div>

          {/* Color & Brand */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Color</label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                onBlur={fetchItems}
                placeholder="e.g. Black"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                onBlur={fetchItems}
                placeholder="e.g. JBL"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </aside>

        {/* Right Main Column: Search Bar + Results Grid */}
        <main className="md:col-span-3 space-y-4">
          {/* Keyword Search form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search items by keyword, title, or details..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); fetchItems(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* Results Summary header */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Showing <strong className="text-white">{items.length}</strong> items
              {type !== 'all' && ` (${type})`}
            </span>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="aspect-[4/3] rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-heading">No matching items found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We couldn&apos;t find any lost or found items matching your search criteria.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => router.push('/report/lost')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors"
                >
                  Report Your Lost Item
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Campus Items...</div>}>
      <ItemsContent />
    </Suspense>
  );
}
