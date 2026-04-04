import React, { useState } from "react";
import { CheckCircle, Repeat, Zap, Flame, Coins, Award, ShieldCheck, Clock, Target, AlertCircle, MessageSquare, Edit3, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestCard({ quest, onComplete, isCompleted, isOverdue, streak = 0 }) {
  const [isPressed, setIsPressed] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [reflectionNote, setReflectionNote] = useState("");
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  
  const isDailyHabit = quest.type === "daily" || quest.type === "DAILY_HABIT";

  const MotionDiv = motion.div;

  const handleComplete = () => {
    setShowRewards(true);
    setTimeout(() => setShowRewards(false), 2000);
    onComplete(quest, reflectionNote);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'recovery': return 'text-blue-400';
      case 'wellness': return 'text-green-400';
      case 'social': return 'text-purple-400';
      case 'skill': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
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
            : isOverdue
              ? 'nm-flat-lg border border-red-500/20'
              : 'nm-flat-lg border border-white/10 group-hover:nm-flat'
          }
          ${isPressed ? 'nm-inset-sm' : ''}
        `}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
              ${isCompleted 
                ? 'nm-inset-sm opacity-50' 
                : isOverdue
                  ? 'nm-flat-sm text-red-500'
                  : 'nm-flat-sm text-blue-500 group-hover:scale-110'
              }
            `}>
              {isOverdue ? (
                <AlertCircle className="w-6 h-6" />
              ) : isDailyHabit ? (
                <Repeat className="w-6 h-6 opacity-80" />
              ) : (
                <Zap className="w-6 h-6 opacity-80" />
              )}
            </div>
            <div>
              <h3 className={`text-xl font-black tracking-tight ${isCompleted ? 'line-through opacity-40' : 'group-hover:text-blue-400'} transition-colors`}>
                {quest.title || quest.name}
              </h3>
              <div className="flex items-center gap-3 mt-1.5 ">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                  {isDailyHabit ? 'Shadow Habit' : 'Instant Action'}
                </p>
                {quest.category && (
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${getCategoryColor(quest.category)}`}>
                    • {quest.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {isDailyHabit && streak > 0 && (
            <div className="px-4 py-2 rounded-2xl flex items-center gap-2 nm-inset-sm transition-all group-hover:nm-inset">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-sm font-black opacity-80">{streak}</span>
            </div>
          )}
        </div>

        {/* Quest Detailed Info */}
        {!isCompleted && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-1">
            {quest.trigger_text && (
              <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity col-span-2">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2rem]">Initiation Command</span>
                </div>
                <span className="text-[10px] font-black uppercase leading-tight italic">"WHEN {quest.trigger_text}, EXECUTE {quest.title}"</span>
              </div>
            )}
            {quest.chain_id && (
              <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-2 text-blue-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2rem]">Chain</span>
                </div>
                <span className="text-[10px] font-black uppercase">PROTOCOL {quest.chain_position || 1}</span>
              </div>
            )}
            {quest.estimated_time && (
              <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-80 transition-opacity">
                 <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2rem]">Time</span>
                </div>
                <span className="text-[10px] font-bold uppercase">{quest.estimated_time}</span>
              </div>
            )}
            {quest.due_date && (
              <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2 text-orange-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2rem]">Due</span>
                </div>
                <span className="text-[10px] font-bold uppercase">{new Date(quest.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        )}

        {/* Rewards & Locked Assets */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 nm-inset-sm opacity-80 border border-white/5 group-hover:nm-inset transition-all">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>+{quest.xp_reward} Merit</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 nm-inset-sm opacity-80 border border-white/5 group-hover:nm-inset transition-all text-yellow-400/80">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>+{quest.sp_reward} SP</span>
          </div>
          {quest.reward_description && (
            <div className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border ${isCompleted ? 'nm-inset-sm opacity-40 border-white/5' : 'nm-flat-sm text-green-400 border-green-500/20 animate-pulse'}`}>
              <Lock className="w-3.5 h-3.5" />
              <span>Locked: {quest.reward_description}</span>
            </div>
          )}
        </div>

        {/* Proof & Reflection Section */}
        <AnimatePresence>
          {!isCompleted && (
            <div className="mb-10 space-y-5">
              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => setIsNoteVisible(!isNoteVisible)}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15rem] px-4 py-2 rounded-xl border transition-all ${isNoteVisible ? 'nm-inset-sm text-blue-500 border-blue-500/20' : 'nm-flat-sm opacity-60 border-white/5 hover:opacity-100 hover:text-blue-500'}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Observation
                </button>
                
                {quest.proof_required && (
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15rem] px-4 py-2 rounded-xl nm-flat-sm opacity-60 border border-white/5 hover:opacity-100 hover:text-blue-500 transition-all">
                    <Target className="w-4 h-4" />
                    Attach Proof
                  </button>
                )}
              </div>
              
              {isNoteVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative group/note">
                    <textarea
                      rows={1}
                      value={reflectionNote}
                      onChange={(e) => setReflectionNote(e.target.value)}
                      placeholder="Document protocol execution nuances..."
                      className="w-full bg-transparent nm-inset rounded-2xl px-6 py-4.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:opacity-20 border border-white/5 leading-relaxed pr-16"
                    />
                    <button 
                      onClick={() => setIsNoteVisible(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg nm-button flex items-center justify-center opacity-40 hover:opacity-100 transition-all text-red-500 hover:scale-110 active:scale-90"
                      title="Abort Observation"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {!isCompleted ? (
          <button
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onClick={handleComplete}
            className={`w-full py-5 px-8 rounded-3xl nm-button font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] group-hover:text-blue-500 ${isOverdue ? 'text-red-500' : ''}`}
          >
            {isOverdue ? <AlertCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 transition-transform group-hover:scale-110" />}
            {isOverdue ? 'Settle Shadow Debt' : quest.review_status === 'pending' ? 'Verification Pending' : 'Commit Protocol Output'}
          </button>
        ) : (
          <div className="w-full py-5 px-8 rounded-3xl nm-inset text-(--text-secondary) font-black text-[11px] uppercase tracking-[0.3em] text-center flex items-center justify-center gap-4 opacity-50 border border-white/5 grayscale">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Archive Validated
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
