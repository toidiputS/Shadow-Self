import React from "react";
import { TrendingUp, Award, Coins, Flame, ShieldCheck, Zap } from "lucide-react";

export default function MetricsDisplay({ todayCount, wallet, profile, currentRank }) {
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

      {/* Compliance Streak */}
      <div className="p-6 rounded-4xl nm-flat-lg group hover:nm-flat transition-all duration-500 border-b-4 border-orange-500/10 flex flex-col justify-between">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center nm-inset-sm shrink-0">
            <Flame className="w-7 h-7 text-orange-500 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <p className="text-[10px] text-(--text-secondary) font-black uppercase tracking-[0.2em] opacity-50 mb-1">Compliance Streak</p>
            <h3 className="text-3xl font-black">{profile?.current_streak || 0} <span className="text-sm font-medium opacity-40">Days</span></h3>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-1.5" title="Best Streak">
             <Zap className="w-3.5 h-3.5 text-orange-400/40" />
             <span className="text-[10px] font-black opacity-30 uppercase">{profile?.best_streak || 0} Peak</span>
          </div>
          <div className="flex items-center gap-1.5" title="Grace Days Remaining">
             <ShieldCheck className="w-3.5 h-3.5 text-blue-400/40" />
             <span className="text-[10px] font-black opacity-30 uppercase">{profile?.grace_days || 0} Grace</span>
          </div>
        </div>

        <div className="pt-4 border-t border-(--text-secondary)/5">
          <p className="text-xs text-orange-500/70 font-black uppercase tracking-widest italic">
            {profile?.current_streak > 0 ? "Momentum Sustained" : "Consistency Watch"}
          </p>
        </div>
      </div>
    </div>
  );
}
