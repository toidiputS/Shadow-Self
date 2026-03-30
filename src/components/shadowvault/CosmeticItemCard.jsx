import React, { useState } from "react";
import { Coins, CheckCircle, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function CosmeticItemCard({ item, userSpBalance, isOwned, onPurchase }) {
  const [isPressed, setIsPressed] = useState(false);
  const canAfford = userSpBalance >= item.sp_cost;

  const handlePurchase = () => {
    if (!isOwned && canAfford) {
      onPurchase(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`relative p-6 rounded-3xl transition-all duration-200
        ${isOwned ? 'bg-[#e0e0e0] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]'
          : 'bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]'
        }
        ${isPressed ? 'shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]' : ''}
      `}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {item.image_url && (
        <div className="w-full h-32 rounded-2xl overflow-hidden mb-4
          bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center
        ">
          <img
            src={item.image_url}
 
