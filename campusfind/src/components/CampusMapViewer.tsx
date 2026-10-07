'use client';

import React, { useState } from 'react';
import { CampusLocation, Item } from '@/types';
import { MapPin, Building, Search, Eye, AlertCircle, CheckCircle, Compass, X } from 'lucide-react';
import Link from 'next/link';

interface CampusMapViewerProps {
  locations: (CampusLocation & { lost_count?: number; found_count?: number; total_items?: number })[];
  items?: Item[];
  selectedLocationId?: number | null;
  onSelectLocation?: (id: number | null) => void;
}

export default function CampusMapViewer({
  locations,
  items = [],
  selectedLocationId = null,
  onSelectLocation,
}: CampusMapViewerProps) {
  const [activeLocationId, setActiveLocationId] = useState<number | null>(selectedLocationId);
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');

  const handlePinClick = (id: number) => {
    const nextId = activeLocationId === id ? null : id;
    setActiveLocationId(nextId);
    if (onSelectLocation) {
      onSelectLocation(nextId);
    }
  };

  const selectedLoc = locations.find(l => l.id === activeLocationId);
  const locationItems = items.filter(i => i.location_id === activeLocationId);

  return (
    <div className="space-y-4">
      {/* Map toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-heading">Interactive Campus Map</h4>
            <p className="text-[11px] text-slate-400">Click any campus building to inspect reported items</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterType === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Hotspots
          </button>
          <button
            onClick={() => setFilterType('lost')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterType === 'lost' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lost Only
          </button>
          <button
            onClick={() => setFilterType('found')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterType === 'found' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Found Only
          </button>
        </div>
      </div>

      {/* Visual Campus Map Canvas */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl p-4 select-none">
        {/* Subtle grid pattern & campus pathways */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Decorative campus roads/zones */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" xmlns="http://www.w3.org/2000/svg">
          {/* Main campus boulevard */}
          <path d="M 150 820 Q 400 500 500 240 T 800 180" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="16 8" />
          <path d="M 200 680 L 620 600 L 740 440 L 860 760" fill="none" stroke="#38bdf8" strokeWidth="8" strokeDasharray="12 6" />
          <circle cx="48%" cy="36%" r="60" fill="rgba(99, 102, 241, 0.08)" stroke="#818cf8" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="62%" cy="60%" r="50" fill="rgba(16, 185, 129, 0.08)" stroke="#34d399" strokeWidth="2" strokeDasharray="6 4" />
          <rect x="72%" y="12%" width="120" height="80" rx="12" fill="rgba(245, 158, 11, 0.08)" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" />
        </svg>

        {/* Legend overlays */}
        <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500"></span>
            Lost Items
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
            Found Items
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Campus Zones
          </span>
        </div>

        {/* Location pins */}
        {locations.map(loc => {
          const lost = loc.lost_count || 0;
          const found = loc.found_count || 0;
          const total = lost + found;

          if (filterType === 'lost' && lost === 0) return null;
          if (filterType === 'found' && found === 0) return null;

          const isSelected = activeLocationId === loc.id;

          return (
            <div
              key={loc.id}
              style={{ left: `${loc.map_x}%`, top: `${loc.map_y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              onClick={() => handlePinClick(loc.id)}
            >
              {/* Pin marker */}
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? 'scale-125 z-30'
                    : 'group-hover:scale-110'
                }`}
              >
                {/* Radar pulse for active items */}
                {total > 0 && (
                  <span className={`absolute w-8 h-8 rounded-full animate-ping opacity-75 ${
                    lost > 0 ? 'bg-rose-500/40' : 'bg-emerald-500/40'
                  }`} />
                )}

                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                  isSelected
                    ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white ring-4 ring-cyan-400/50'
                    : total > 0
                    ? lost > found
                      ? 'bg-rose-600/90 text-white hover:bg-rose-500 shadow-rose-600/30'
                      : 'bg-emerald-600/90 text-white hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>

                {/* Badge counter */}
                {total > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-950 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-slate-700 shadow-md">
                    {total}
                  </span>
                )}
              </div>

              {/* Pin tooltip label */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 pointer-events-none whitespace-nowrap transition-all ${
                isSelected
                  ? 'opacity-100 scale-100 z-40'
                  : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
              }`}>
                <div className="bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-center shadow-xl">
                  <span className="text-[11px] font-bold text-white block">{loc.name}</span>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 mt-0.5">
                    {lost > 0 && <span className="text-rose-400 font-semibold">{lost} lost</span>}
                    {found > 0 && <span className="text-emerald-400 font-semibold">{found} found</span>}
                    {total === 0 && <span className="text-slate-500">0 reports</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected location detail drawer / modal */}
      {selectedLoc && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-heading">{selectedLoc.name}</h4>
                <p className="text-xs text-slate-400">
                  {selectedLoc.building} • Zone: {selectedLoc.zone}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveLocationId(null)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2">{selectedLoc.description}</p>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {selectedLoc.lost_count || 0} Lost Items
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {selectedLoc.found_count || 0} Found Items
              </span>
            </div>

            <Link
              href={`/items?location_id=${selectedLoc.id}`}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View all items at this location</span>
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
