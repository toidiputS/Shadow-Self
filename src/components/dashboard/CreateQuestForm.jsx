import React, { useState } from "react";
import { Plus, X, ShieldAlert, Target, Zap, Repeat, Clock, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateQuestForm({ onSubmit, onCancel }) {
  const [questName, setQuestName] = useState("");
  const [questType, setQuestType] = useState("daily");
  const [xpReward, setXpReward] = useState(25);
  const [spReward, setSpReward] = useState(100);
  const [difficulty, setDifficulty] = useState("small");
  const [category, setCategory] = useState("recovery");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [triggerText, setTriggerText] = useState("");
  const [chainId, setChainId] = useState("");
  const [chainPosition, setChainPosition] = useState(1);
  const [proofRequired, setProofRequired] = useState(false);

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
        category: category,
        estimated_time: estimatedTime,
        trigger_text: triggerText,
        chain_id: chainId || null,
        chain_position: chainPosition,
        proof_required: proofRequired,
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
      <div className="p-8 rounded-4xl nm-flat-lg border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
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

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
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
            {/* Category */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-3 ml-2 opacity-60">
                Core Domain
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['recovery', 'wellness', 'social', 'skill'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`
                      px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest
                      transition-all duration-300
                      ${category === cat
                        ? 'nm-inset text-blue-500'
                        : 'nm-flat-xs text-(--text-secondary) opacity-60 hover:opacity-100'
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Deployment Type */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-3 ml-2 opacity-60">
                Execution Model
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Estimated Time & Trigger Mapping */}
             <div className="p-6 rounded-3xl nm-inset-sm border border-blue-500/10 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-blue-500 mb-3 ml-1">
                  Temporal Requirement
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g. 20 min"
                    className="w-full px-6 py-4 rounded-2xl nm-inset font-bold text-(--text-primary) focus:outline-none border-0"
                  />
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-blue-500 mb-3 ml-1">
                  Trigger Mapping (PATTERN TRACKING)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={triggerText}
                    onChange={(e) => setTriggerText(e.target.value)}
                    placeholder="When X happens..."
                    className="w-full px-6 py-4 rounded-2xl nm-inset font-bold text-(--text-primary) focus:outline-none border-0"
                  />
                  <HelpCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 pointer-events-none" />
                </div>
                <p className="mt-3 text-[9px] font-bold opacity-40 uppercase tracking-tight">Anchors protocols to real-life situations</p>
              </div>
            </div>

            {/* Quest Chains (New Section Highlight) */}
            <div className="p-6 rounded-3xl nm-inset-sm border border-purple-500/10">
              <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-purple-500 mb-3 ml-1">
                Quest Chains (ROUTINE STRUCTURE)
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                   <p className="text-[8px] font-black opacity-30 uppercase mb-2">Protocol Order</p>
                   <input
                    type="number"
                    min="1"
                    value={chainPosition}
                    onChange={(e) => setChainPosition(parseInt(e.target.value) || 1)}
                    className="w-full px-5 py-4 rounded-xl nm-inset font-bold text-(--text-primary) focus:outline-none"
                  />
                </div>
                <div className="flex-[2]">
                   <p className="text-[8px] font-black opacity-30 uppercase mb-2">Chain ID (Optional UUID)</p>
                   <input
                    type="text"
                    value={chainId}
                    onChange={(e) => setChainId(e.target.value)}
                    placeholder="Auto-groups protocols"
                    className="w-full px-5 py-4 rounded-xl nm-inset text-xs font-bold text-(--text-primary) focus:outline-none"
                  />
                </div>
              </div>
              <p className="mt-3 text-[9px] font-bold opacity-40 uppercase tracking-tight">Unlocked sequentially in execution queue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Difficulty Band */}
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) mb-3 ml-2 opacity-60">
                Resistance Tier
              </label>
              <div className="flex gap-2">
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

            {/* Yield Estimates */}
            <div className="md:col-span-1">
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
            <div className="md:col-span-1">
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

          <div className="flex items-center gap-4 px-6 py-4 rounded-3xl nm-inset-sm border border-white/5">
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Evidence Requirement</p>
                <p className="text-[9px] font-bold opacity-30 uppercase mt-1">Force verification via sponsor review</p>
             </div>
             <button 
               type="button"
               onClick={() => setProofRequired(!proofRequired)}
               className={`w-14 h-8 rounded-full nm-inset-sm relative p-1 transition-all ${proofRequired ? 'bg-blue-500/20' : ''}`}
             >
                <div className={`absolute w-6 h-6 rounded-full nm-flat transition-all ${proofRequired ? 'right-1 bg-blue-500' : 'left-1 bg-gray-500'}`} />
             </button>
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
