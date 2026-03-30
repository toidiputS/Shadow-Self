import React, { useState } from "react";
import { CheckCircle, Repeat, Zap, Flame, Coins, Award, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestCard({ quest, onComplete, isCompleted, streak = 0 }) {
  const [isPressed, setIsPressed] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  
  const isDailyHabit = quest.type === "daily" || quest.type === "DAILY_HABIT";

  const MotionDiv = motion.div;

  const handleComplete = () => {
    setShowRewards(true);
    setTimeout(() => setShowRewards(false), 2000);
    onComplete(quest);
  };

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative ${isCompleted ? 'opacity-60' : ''} text-(--text-primary) group`}
    >
      <div
        className={`
          p-7 rounded-4xl transition-all duration-500
          ${isCompleted 
            ? 'nm-inset border border-white/5' 
            : 'nm-flat-lg border border-white/10 group-hover:nm-flat'
          }
          ${isPressed ? 'nm-inset-sm' : ''}
        `}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
              ${isCompleted 
                ? 'nm-inset-sm opacity-50' 
                : 'nm-flat-sm text-blue-500 group-hover:scale-110'
              }
            `}>
              {isDailyHabit ? (
                <Repeat className="w-6 h-6 opacity-80" />
              ) : (
                <Zap className="w-6 h-6 opacity-80" />
              )}
            </div>
            <div>
              <h3 className={`text-xl font-black tracking-tight ${isCompleted ? 'line-through opacity-40' : 'group-hover:text-blue-400'} transition-colors`}>
                {quest.title || quest.name}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 opacity-40">
                {isDailyHabit ? 'Shadow Habit' : 'Instant Action'}
              </p>
            </div>
          </div>
          
          {isDailyHabit && streak > 0 && (
            <div className="px-4 py-2 rounded-2xl flex items-center gap-2 nm-inset-sm transition-all group-hover:nm-inset">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-sm font-black opacity-80">{streak}</span>
            </div>
          )}
        </div>

        {/* Quest Info & Rewards */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 nm-inset-sm opacity-60">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>+{quest.xp_reward} Merit</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 nm-inset-sm opacity-60">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>+{quest.sp_reward} SP</span>
          </div>
          {quest.difficulty_band && (
            <div className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 nm-inset-sm opacity-60">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span>{quest.difficulty_band} Class</span>
            </div>
          )}
        </div>

        {!isCompleted ? (
          <button
            onClick={handleComplete}
            className="w-full py-4.5 px-6 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 group-hover:text-blue-500"
          >
            <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Certify Completion
          </button>
        ) : (
          <div className="w-full py-4.5 px-6 rounded-2xl nm-inset-sm text-(--text-secondary) font-black text-xs uppercase tracking-[0.2em] text-center flex items-center justify-center gap-3 opacity-60">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Verified & Logged
          </div>
        )}
      </div>

      {/* Floating Rewards Animation */}
      <AnimatePresence>
        {showRewards && (
          <MotionDiv
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -80, scale: 1.2 }}
            exit={{ opacity: 0, y: -120 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-0 inset-x-0 flex items-center justify-center gap-4 pointer-events-none z-50 font-black text-blue-500"
          >
             <div className="px-5 py-2.5 rounded-full nm-flat flex items-center gap-2">
               <Award className="w-4 h-4" /> +{quest.xp_reward || 0}
             </div>
             <div className="px-5 py-2.5 rounded-full nm-flat flex items-center gap-2">
               <Coins className="w-4 h-4" /> +{quest.sp_reward || 0}
             </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}
