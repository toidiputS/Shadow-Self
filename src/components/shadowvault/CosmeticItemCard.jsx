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
            alt={item.name}
            className="w-full h-full object-cover p-2 rounded-2xl"
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
        <p className="text-xs text-gray-500 font-medium line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-bold text-gray-700">{item.sp_cost} SP</span>
          </div>
          
          <button
            onClick={handlePurchase}
            disabled={isOwned || !canAfford}
            className={`
              px-6 py-3 rounded-xl text-xs font-bold
              transition-all duration-200 flex items-center gap-2
              ${isOwned
                ? 'bg-gray-200 text-gray-500 cursor-default shadow-none'
                : canAfford
                  ? 'bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] hover:shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] text-blue-600 active:shadow-[inset_-2px_-2px_4px_#ffffff,inset_2px_2px_4px_#bebebe]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 shadow-none'
              }
            `}
          >
            {isOwned ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Owned
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Buy
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
