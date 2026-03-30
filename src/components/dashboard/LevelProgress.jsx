import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getCurrentRank, getNextRank } from "@/utils";

export default function LevelProgress({ totalXp }) {
  const currentRank = getCurrentRank(totalXp);
  const nextRank = getNextRank(currentRank.level);
  
  const xpInCurrentLevel = totalXp - currentRank.xp;
  const xpNeededForNext = nextRank ? nextRank.xp - currentRank.xp : 1;
  const progressPercent = nextRank ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

  return (
    <div className="
      p-8 rounded-3xl mb-8
      bg-[#e0e0e0] shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]
    ">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="
            w-16 h-16 rounded-2xl flex items-center justify-center
            bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]
          ">
            <Sparkles className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{currentRank.name}</h3>
            <p className="text-sm text-gray-500">Level {currentRank.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800">{totalXp} XP</p>
          {nextRank && (
            <p className="text-xs text-gray-500 mt-1">
              {nextRank.xp - totalXp} XP to {nextRank.name}
            </p>
          )}
        </div>
      </div>

      {nextRank && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress to next rank</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="
            h-4 rounded-full overflow-hidden
            bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
          ">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-linear-to-r from-gray-400 to-gray-500 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
