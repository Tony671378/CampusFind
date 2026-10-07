'use client';

import React from 'react';
import Link from 'next/link';
import { Item } from '@/types';
import StatusBadge from './StatusBadge';
import { MapPin, Calendar, Tag, Award, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  showMatchIndicator?: boolean;
}

export default function ItemCard({ item, showMatchIndicator }: ItemCardProps) {
  const isLost = item.type === 'lost';

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col relative border border-slate-800/90 hover:border-slate-700">
      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md ${
            isLost
              ? 'bg-rose-600 text-white shadow-rose-600/30'
              : 'bg-emerald-600 text-white shadow-emerald-600/30'
          }`}>
            {isLost ? 'Lost' : 'Found'}
          </span>

          <StatusBadge status={item.status} size="sm" />
        </div>

        {/* Reward badge if offered */}
        {item.reward && (
          <div className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-amber-500/20">
            <Award className="w-3 h-3" />
            <span>Reward</span>
          </div>
        )}

        {/* Category tag at bottom of image */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-700/60">
          <Tag className="w-3 h-3 text-cyan-400" />
          <span>{item.category_name || 'Item'}</span>
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-heading font-semibold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Details list */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-300 truncate">{item.location_name || 'Campus Location'}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{item.date} {item.approximate_time ? `• ${item.approximate_time}` : ''}</span>
            </div>

            {item.color && (
              <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded text-[10px]">
                {item.color}
              </span>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-2">
          <Link
            href={`/items/${item.id}`}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-slate-800/90 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700/70 hover:border-indigo-500 shadow-sm"
          >
            <span>{item.type === 'found' ? 'View & Claim Item' : 'View Details'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
