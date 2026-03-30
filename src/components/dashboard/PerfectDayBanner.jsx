import React from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, ShieldCheck } from "lucide-react";

export default function PerfectDayBanner({ show }) {
  if (!show) return null;

  const MotionDiv = motion.div;

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.9, y: 100, x: "-50%" }}
      animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, scale: 0.9, y: 100, x: "-50%" }}
      className="
        fixed bottom-12 left-1/2 z-100
        p-8 rounded-4xl nm-flat-lg text-(--text-primary)
        max-w-md w-[calc(100%-2rem)] border border-yellow-500/20 backdrop-blur-xl
        shadow-[0_20px_50px_rgba(0,0,0,0.3)]
      "
    >
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center nm-inset-sm shrink-0">
          <Trophy className="w-10 h-10 text-yellow-500 animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-2xl font-black text-(--text-primary) uppercase tracking-widest leading-none">Protocol Optimized</h3>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full nm-inset-sm w-fit text-[10px] font-black uppercase tracking-tighter opacity-60">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            <span>Continuous Compliance Lock</span>
          </div>
          <p className="text-sm text-(--text-secondary) font-medium leading-relaxed italic opacity-80">
            Full synchronization achieved. +100 Vested SP Bonus authorized.
          </p>
        </div>
      </div>
    </MotionDiv>
  );
}
