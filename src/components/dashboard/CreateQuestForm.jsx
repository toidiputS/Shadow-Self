import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateQuestForm({ onSubmit, onCancel }) {
  const [questName, setQuestName] = useState("");
  const [questType, setQuestType] = useState("DAILY_HABIT");
  const [xpReward, setXpReward] = useState(10);
  const [spReward, setSpReward] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (questName.trim()) {
      onSubmit({
        name: questName.trim(),
        type: questType,
        xp_reward: xpReward,
        sp_reward: spReward,
        active: true
      });
      setQuestName("");
      setQuestType("DAILY_HABIT");
      setXpReward(10);
      setSpReward(50);
    }
  };

  return (
    <motion.div
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
                  onClick={() => setQuestType("DAILY_HABIT")}
                  className={`
                    w-full px-4 py-3 rounded-2xl text-sm font-medium
                    transition-all duration-200
                    ${questType === "DAILY_HABIT"
                      ? 'bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] text-gray-800'
                      : 'bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] text-gray-600'
                    }
                  `}
                >
                  Daily Habit
                </button>
                <button
                  type="button"
                  onClick={() => setQuestType("SINGLE_ACTION")}
 
