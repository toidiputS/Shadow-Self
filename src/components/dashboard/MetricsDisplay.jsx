import React from "react";
import { TrendingUp, Award, Coins, Flame } from "lucide-react";

export default function MetricsDisplay({ todayCount, wallet, currentRank }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="
        p-6 rounded-3xl
        bg-[#e0e0e0] shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]
      ">
        <div className="flex items-center gap-3 mb-3">
          <div className="
            w-12 h-12 rounded-2xl flex items-center justify-center
            bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
          ">
            <TrendingUp className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Today</p>
            <h3 className="text-3xl font-bold text-gray-800">{todayCount}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-500">Quests completed</p>
      </div>

      <div className="
        p-6 rounded-3xl
        bg-[#e0e0e0] shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]
      ">
        <div className="flex items-center gap-3 mb-3">
          <div className="
            w-12 h-12 rounded-2xl flex items-center justify-center
            bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
          ">
            <Coins className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Shadow Points</p>
            <h3 className="text-3xl font-bold text-gray-800">{wallet?.sp || 0}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-500">Available to spend</p>
      </div>

      <div className="
        p-6 rounded-3xl
        bg-[#e0e0e0] shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]
      ">
        <div className="flex items-center gap-3 mb-3">
          <div className="
            w-12 h-12 rounded-2xl flex items-center justify-center
            bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
          ">
            <Award className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Shadow Rank</p>
            <h3 className="text-2xl font-bold text-gray-800">{currentRank.name}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-500">Level {currentRank.level}</p>
      </div>

      <div className="
        p-6 rounded-3xl
        bg-[#e0e0e0] shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]
      ">
        <div className="flex items-center gap-3 mb-3">
          <div className="
            w-12 h-12 rounded-2xl flex items-center justify-center
            bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
          ">
            <Flame className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Perfect Days</p>
            <h3 className="text-3xl font-bold text-gray-800">{wallet?.perfect_days || 0}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-500">All habits completed</p>
      </div>
    </div>
  );
}
