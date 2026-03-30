import React from "react";
import { TrendingUp, Award, Coins, Flame } from "lucide-react";

export default function MetricsDisplay({ todayCount, wallet, currentRank }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-(--text-primary)">
      {/* Today's Quests */}
      <div className="p-6 rounded-4xl nm-flat-lg group hover:nm-flat transition-all duration-500 border-b-4 border-blue-500/10 flex flex-col justify-between">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center nm-inset-sm shrink-0">
            <TrendingUp className="w-7 h-7 text-blue-500 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <p className="text-[10px] text-(--text-secondary) font-black uppercase tracking-[0.2em] opacity-50 mb-1">Quota Progress</p>
            <h3 className="text-3xl font-black tracking-tight">{todayCount} <span className="text-sm font-medium opacity-40">/ Daily</span></h3>
          </div>
        </div>
        <div className="pt-4 border-t border-(--text-secondary)/5">
          <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest opacity-40 italic">Synchronized Activity Log</p>
        </div>
      </div>

      {/* Shadow Points */}
      <div className="p-6 rounded-4xl nm-flat-lg group hover:nm-flat transition-all duration-500 border-b-4 border-yellow-500/10 flex flex-col justify-between">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center nm-inset-sm shrink-0">
            <Coins className="w-7 h-7 text-yellow-500 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <p className="text-[10px] text-(--text-secondary) font-black uppercase tracking-[0.2em] opacity-50 mb-1">Shadow Points</p>
            <h3 className="text-3xl font-black tracking-tight">{wallet?.sp || 0} <span className="text-sm font-medium opacity-40 text-yellow-500/50 uppercase tracking-widest">SP</span></h3>
          </div>
        </div>
        <div className="pt-4 border-t border-(--text-secondary)/5">
          <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest opacity-40 italic">Vested Recovery Merit</p>
        </div>
      </div>

      {/* Shadow Rank */}
      <div className="p-6 rounded-4xl nm-flat-lg group hover:nm-flat transition-all duration-500 border-b-4 border-purple-500/10 flex flex-col justify-between">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center nm-inset-sm shrink-0">
            <Award className="w-7 h-7 text-purple-500 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <p className="text-[10px] text-(--text-secondary) font-black uppercase tracking-[0.2em] opacity-50 mb-1">Clearance Tier</p>
            <h3 className="text-2xl font-black tracking-widest uppercase leading-tight">{currentRank.name}</h3>
          </div>
        </div>
        <div className="pt-4 border-t border-(--text-secondary)/5">
          <p className="text-xs text-purple-500/70 font-bold uppercase tracking-widest italic">Level {currentRank.level} Certified</p>
        </div>
      </div>

      {/* Perfect Days */}
      <div className="p-6 rounded-4xl nm-flat-lg group hover:nm-flat transition-all duration-500 border-b-4 border-orange-500/10 flex flex-col justify-between">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center nm-inset-sm shrink-0">
            <Flame className="w-7 h-7 text-orange-500 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <p className="text-[10px] text-(--text-secondary) font-black uppercase tracking-[0.2em] opacity-50 mb-1">Perfect Cycle</p>
            <h3 className="text-3xl font-black">{wallet?.perfect_days || 0}</h3>
          </div>
        </div>
        <div className="pt-4 border-t border-(--text-secondary)/5">
          <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest opacity-40 italic">Continuous Compliance</p>
        </div>
      </div>
    </div>
  );
}
