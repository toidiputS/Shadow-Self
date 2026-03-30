import React from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";

export default function PerfectDayBanner({ show }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="
        fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50
        p-6 rounded-3xl
        bg-[#e0e0e0] shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]
        max-w-md
      "
    >
      <div className="flex items-center gap-4">
        <div className="
          w-16 h-16 rounded-2xl flex items-center justify-center
          bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
        ">
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-800">Perfect Day!</h3>
            <Sparkles className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mt-1">All habits completed +100 SP bonus!</p>
        </div>
      </div>
    </motion.div>
  );
}
