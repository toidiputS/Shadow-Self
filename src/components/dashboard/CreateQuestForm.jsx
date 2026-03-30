import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateQuestForm({ onSubmit, onCancel }) {
  const MotionDiv = motion.div;
  const [questName, setQuestName] = useState("");
  const [questType, setQuestType] = useState("daily");
  const [xpReward, setXpReward] = useState(10);
  const [spReward, setSpReward] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (questName.trim()) {
      onSubmit({
        title: questName.trim(),
        type: questType,
        xp_reward: xpReward,
        sp_reward: spReward,
        active: true
      });
      setQuestName("");
      setQuestType("daily");
      setXpReward(10);
      setSpReward(50);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <div className="
        p-6 rounded-3xl
        bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]
      ">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Quest Name
            </label>
            <input
              type="text"
              value={questName}
              onChange={(e) => setQuestName(e.target.value)}
              placeholder="Enter quest name..."
              className="
                w-full px-6 py-4 rounded-2xl
                bg-[#e0e0e0] 
                shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                text-gray-800 placeholder-gray-400
                focus:outline-none
                transition-all duration-200
              "
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Quest Type
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setQuestType("daily")}
                  className={`
                    w-full px-4 py-3 rounded-2xl text-sm font-medium
                    transition-all duration-200
                    ${questType === "daily"
                      ? 'bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] text-gray-800'
                      : 'bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] text-gray-600'
                    }
                  `}
                >
                  Daily Habit
                </button>
                <button
                  type="button"
                  onClick={() => setQuestType("single")}
                  className={`
                    w-full px-4 py-3 rounded-2xl text-sm font-medium
                    transition-all duration-200
                    ${questType === "single"
                      ? 'bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] text-gray-800'
                      : 'bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] text-gray-600'
                    }
                  `}
                >
                  Single Action
                </button>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                XP Reward
              </label>
              <input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                className="
                  w-full px-5 py-3 rounded-2xl
                  bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                  text-gray-800 focus:outline-none
                "
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                SP Reward
              </label>
              <input
                type="number"
                value={spReward}
                onChange={(e) => setSpReward(parseInt(e.target.value) || 0)}
                className="
                  w-full px-5 py-3 rounded-2xl
                  bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                  text-gray-800 focus:outline-none
                "
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4 mt-6 border-t border-gray-200">
            <button
              type="submit"
              className="
                flex-1 py-4 px-8 rounded-2xl
                bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]
                hover:shadow-[6px_6px_10px_#bebebe,-6px_-6px_10px_#ffffff]
                active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                transition-all duration-200
                text-gray-800 font-bold
                flex items-center justify-center gap-3
              "
            >
              <Plus className="w-5 h-5 text-gray-600" />
              Create Quest
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="
                flex-1 py-4 px-8 rounded-2xl
                text-gray-600 font-bold
                hover:text-gray-800
                flex items-center justify-center gap-3
              "
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </MotionDiv>
  );
}
