import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getCurrentRank, getNextRank } from "@/utils";

export default function LevelProgress({ totalXp }) {
  const MotionDiv = motion.div;
  const currentRank = getCurrentRank(totalXp);
  const nextRank = getNextRank(currentRank.level);
  
  const xpInCurrentLevel = totalXp - currentRank.xp;
  const xpNeededForNext = nextRank ? nextRank.xp - currentRank.xp : 1;
  const progressPercent = nextRank ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

  return (
    <div className="p-8 rounded-4xl mb-8 nm-flat text-(--text-primary)">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center nm-flat-sm">
            <Sparkles className="w-8 h-8 opacity-70" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-widest">{currentRank.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary) opacity-50">Clearance Tier Level {currentRank.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black tracking-tight">{totalXp} <span className="text-sm font-medium opacity-40">Merit</span></p>
          {nextRank && (
            <p className="text-[10px] font-black uppercase tracking-widest text-(--text-secondary) mt-1 opacity-40">
              {nextRank.xp - totalXp} XP to {nextRank.name}
            </p>
          )}
        </div>
      </div>

      {nextRank && (
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-(--text-secondary) opacity-50">
            <span>Quota Progress to next tier</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-5 rounded-full overflow-hidden nm-inset-sm p-1">
            <MotionDiv
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-linear-to-r from-(--text-secondary) to-(--text-primary) opacity-40 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
