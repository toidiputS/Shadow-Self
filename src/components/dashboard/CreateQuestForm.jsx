import React, { useState } from "react";
import { Plus, X, ShieldAlert, Target, Zap, Repeat } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateQuestForm({ onSubmit, onCancel }) {
  const [questName, setQuestName] = useState("");
  const [questType, setQuestType] = useState("daily");
  const [xpReward, setXpReward] = useState(25);
  const [spReward, setSpReward] = useState(100);
  const [difficulty, setDifficulty] = useState("small");

  const MotionDiv = motion.div;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (questName.trim()) {
      onSubmit({
        title: questName.trim(),
        type: questType,
        xp_reward: xpReward,
        sp_reward: spReward,
        difficulty_band: difficulty,
        active: true
      });
      setQuestName("");
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      className="mb-12 text-(--text-primary) relative z-10"
    >
      <div className="p-8 rounded-4xl nm-flat-lg border border-white/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-blue-500">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest leading-none">Initiate New Protocol</h2>
          </div>
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-full nm-button flex items-center justify-center hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Protocol Name */}
          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-3 ml-2 opacity-60">
              Protocol Designation
            </label>
            <input
              type="text"
              value={questName}
              onChange={(e) => setQuestName(e.target.value)}
              placeholder="E.g., 0600 Insight Meditation"
              className="
                w-full px-7 py-5 rounded-2xl
                nm-inset text-lg font-bold
                text-(--text-primary) placeholder-(--text-secondary) placeholder:opacity-30
                focus:nm-inset-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20
                transition-all duration-300
              "
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Deployment Category */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-3 ml-2 opacity-60">
                Deployment Category
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setQuestType("daily")}
                  className={`
                    px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3
                    transition-all duration-300
                    ${questType === "daily"
                      ? 'nm-inset text-blue-500'
                      : 'nm-flat-sm text-(--text-secondary) opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  <Repeat className="w-4 h-4" />
                  Habit
                </button>
                <button
                  type="button"
                  onClick={() => setQuestType("single")}
                  className={`
                    px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3
                    transition-all duration-300
                    ${questType === "single"
                      ? 'nm-inset text-orange-500'
                      : 'nm-flat-sm text-(--text-secondary) opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  <Zap className="w-4 h-4" />
                  Action
                </button>
              </div>
            </div>

            {/* Difficulty Band */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-3 ml-2 opacity-60">
                Resistance Tier
              </label>
              <div className="flex gap-3">
                {['small', 'medium', 'large'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`
                      flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter
                      transition-all duration-300
                      ${difficulty === d
                        ? 'nm-inset text-(--text-primary)'
                        : 'nm-flat-xs text-(--text-secondary) opacity-50 hover:opacity-100'
                      }
                    `}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Yield Estimates */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-3 ml-2 opacity-60">
                Merit Yield (XP)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                  className="w-full px-6 py-4 rounded-2xl nm-inset font-bold text-(--text-primary) focus:outline-none"
                />
                <ShieldAlert className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-3 ml-2 opacity-60">
                Resource Yield (SP)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={spReward}
                  onChange={(e) => setSpReward(parseInt(e.target.value) || 0)}
                  className="w-full px-6 py-4 rounded-2xl nm-inset font-bold text-(--text-primary) focus:outline-none"
                />
                <ShieldAlert className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-white/5">
            <button
              type="submit"
              className="flex-2 py-5 px-8 rounded-2xl nm-button font-black text-sm uppercase tracking-[0.3rem] flex items-center justify-center gap-4 group text-blue-500"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              Establish Protocol
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-5 px-8 rounded-2xl text-(--text-secondary) font-black text-[10px] uppercase tracking-[0.3rem] flex items-center justify-center gap-3 nm-flat hover:nm-inset transition-all"
            >
              Abort
            </button>
          </div>
        </form>
      </div>
    </MotionDiv>
  );
}
