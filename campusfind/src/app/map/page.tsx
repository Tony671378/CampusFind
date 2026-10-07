'use client';

import React, { useState, useEffect } from 'react';
import { CampusLocation, Item } from '@/types';
import CampusMapViewer from '@/components/CampusMapViewer';
import ItemCard from '@/components/ItemCard';
import { MapPin, Building, Search, Compass, AlertCircle, CheckCircle } from 'lucide-react';

export default function CampusMapPage() {
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [locRes, itemsRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/items?limit=100'),
        ]);
        const locData = await locRes.json();
        const itemsData = await itemsRes.json();
        setLocations(locData.locations || []);
        setItems(itemsData.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedLoc = locations.find(l => l.id === selectedLocationId);
  const filteredItems = selectedLocationId
    ? items.filter(i => i.location_id === selectedLocationId)
    : items;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Campus Geo-Locational Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-heading">
          Campus Map &amp; Lost Hotspots
        </h1>
        <p className="text-xs text-slate-400">
          Explore approximate campus coordinates to identify where items were misplaced or discovered. Live pins indicate active reports.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-4" />
          <span>Rendering interactive campus grounds...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Visual Interactive Map */}
          <CampusMapViewer
            locations={locations}
            items={items}
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
          />

          {/* Location Items Directory Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white font-heading">
                {selectedLoc ? `Items at ${selectedLoc.name} (${filteredItems.length})` : `All Campus Locations (${items.length} Reports)`}
              </h2>

              {selectedLocationId && (
                <button
                  onClick={() => setSelectedLocationId(null)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                >
                  Show all locations
                </button>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                No active lost or found reports currently recorded at this building.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredItems.slice(0, 12).map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
