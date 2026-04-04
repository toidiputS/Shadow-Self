import React, { useState } from "react";
import { Coins, CheckCircle, ShoppingBag, ShieldCheck, Lock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function CosmeticItemCard({ item, userSpBalance, isOwned, onPurchase }) {
  const [isPressed, setIsPressed] = useState(false);
  const canAfford = userSpBalance >= item.sp_cost;

  const handlePurchase = () => {
    if (!isOwned && canAfford) {
      onPurchase(item);
    }
  };

  return (
    <MotionDiv
      layout
      className={`relative p-8 rounded-4xl transition-all duration-500 text-(--text-primary) group ${isOwned ? 'nm-inset border border-green-500/10' : 'nm-flat-lg border border-white/10 hover:nm-flat hover:-translate-y-2'} ${isPressed ? 'nm-inset-sm' : ''}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div className="w-full h-48 rounded-3xl overflow-hidden mb-8 nm-inset flex items-center justify-center relative bg-linear-to-br from-transparent to-(--border-color)/20 group-hover:nm-inset-sm transition-all duration-500">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className={`w-full h-full object-cover p-4 rounded-[40px] transition-all duration-700 group-hover:scale-110 ${isOwned ? 'grayscale opacity-60' : 'opacity-90'}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
            <ShieldCheck className="w-20 h-20 text-(--text-secondary)" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Guild Protected</span>
          </div>
        )}
        
        {isOwned ? (
          <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-md text-green-500 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-500/30 flex items-center gap-2 shadow-lg">
            <CheckCircle className="w-4 h-4" />
            Vested Clearance
          </div>
        ) : !canAfford && (
          <div className="absolute top-4 right-4 bg-red-500/10 backdrop-blur-md text-red-500 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Resource Gap
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-lg bg-black/20 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest border border-white/5 opacity-60">
            {item.category || 'Standard'} Tier
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-black text-(--text-primary) leading-none tracking-tighter group-hover:text-blue-500 transition-colors uppercase">{item.name}</h3>
          <ArrowUpRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </div>
        
        <p className="text-sm text-(--text-secondary) font-medium leading-relaxed opacity-60 mb-2 line-clamp-3 italic">
          "{item.description}"
        </p>
        
        <div className="flex items-center justify-between mt-4 pt-6 border-t border-(--text-secondary)/5">
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--text-secondary) opacity-40">Authorization Cost</p>
            <div className="flex items-center gap-2.5">
              <Coins className={`w-5 h-5 ${canAfford ? 'text-yellow-500' : 'text-red-400 opacity-50'} transition-colors`} />
              <span className={`text-xl font-black ${!canAfford && !isOwned ? 'text-red-400 opacity-80' : ''}`}>{item.sp_cost} <span className="text-xs opacity-30">SP</span></span>
            </div>
          </div>
          
          <button
            onClick={handlePurchase}
            disabled={isOwned || !canAfford}
            className={`px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 active:scale-95 ${isOwned ? 'nm-inset text-(--text-secondary) cursor-default bg-blue-500/5' : canAfford ? 'nm-button text-blue-500 hover:text-blue-400 font-bold' : 'nm-flat opacity-30 text-(--text-secondary) cursor-not-allowed'}`}
          >
            {isOwned ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                Authorized
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Redeem Protocol
              </>
            )}
          </button>
        </div>
      </div>
    </MotionDiv>
  );
}
