import React, { useState } from "react";
import { CheckCircle, Repeat, Zap, Flame, Coins, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestCard({ quest, onComplete, isCompleted, streak = 0 }) {
  const MotionDiv = motion.div;
  const MotionAnimatePresence = AnimatePresence;
  const [isPressed, setIsPressed] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  
  const isDailyHabit = quest.type === "daily" || quest.type === "DAILY_HABIT";

  const handleComplete = () => {
    setShowRewards(true);
    setTimeout(() => setShowRewards(false), 2000);
    onComplete(quest);
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative ${isCompleted ? 'opacity-50' : ''}`}
    >
      <div
        className={`
          p-6 rounded-3xl transition-all duration-200
          ${isCompleted 
            ? 'bg-[#e0e0e0] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]' 
            : 'bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]'
          }
          ${isPressed ? 'shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]' : ''}
        `}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isCompleted 
                ? 'bg-[#e0e0e0] shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]' 
                : 'bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]'
              }
            `}>
              {isDailyHabit ? (
                <Repeat className="w-5 h-5 text-gray-600" />
              ) : (
                <Zap className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {quest.title || quest.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isDailyHabit ? 'Daily Habit' : 'Single Action'}
              </p>
            </div>
          </div>
          
          {isDailyHabit && streak > 0 && (
            <div className="
              px-3 py-1 rounded-full flex items-center gap-1
              bg-[#e0e0e0] shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff]
            ">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-700">{streak}</span>
            </div>
          )}
        </div>

        {/* Rewards Display */}
        <div className="flex gap-2 mb-4">
          <div className="
            px-3 py-1 rounded-full text-xs font-medium text-gray-600 flex items-center gap-1
            bg-[#e0e0e0] shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff]
          ">
            <Award className="w-3 h-3" />
            +{quest.xp_reward} XP
          </div>
          <div className="
            px-3 py-1 rounded-full text-xs font-medium text-gray-600 flex items-center gap-1
            bg-[#e0e0e0] shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff]
          ">
            <Coins className="w-3 h-3" />
            +{quest.sp_reward} SP
          </div>
        </div>

        {!isCompleted && (
          <button
            onClick={handleComplete}
            className="
              w-full mt-4 py-3 px-6 rounded-2xl
              bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
              hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]
              active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
              transition-all duration-200
              text-gray-700 font-medium
              flex items-center justify-center gap-2
            "
          >
            <CheckCircle className="w-5 h-5" />
            Mark Complete
          </button>
        )}

        {isCompleted && (
          <div className="
            w-full mt-4 py-3 px-6 rounded-2xl
            bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
            text-gray-500 font-medium text-center
            flex items-center justify-center gap-2
          ">
            <CheckCircle className="w-5 h-5" />
            Completed
          </div>
        )}
      </div>

      {/* Floating Rewards Animation */}
      <MotionAnimatePresence>
        {showRewards && (
          <MotionDiv
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute top-0 right-0 flex gap-2 pointer-events-none"
          >
            <div className="
              px-4 py-2 rounded-full text-sm font-bold
              bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
              text-gray-700
            ">
              +{quest.xp_reward} XP
            </div>
            <div className="
              px-4 py-2 rounded-full text-sm font-bold
              bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
              text-gray-700
            ">
              +{quest.sp_reward} SP
            </div>
          </MotionDiv>
        )}
      </MotionAnimatePresence>
    </MotionDiv>
  );
}
