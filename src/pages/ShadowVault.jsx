import React, { useState } from "react";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, Store, ArrowLeft, ShieldCheck, ShoppingCart, Info, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";

import CosmeticItemCard from "../components/shadowvault/CosmeticItemCard";
import ThemeSidebar from "../components/dashboard/ThemeSidebar";

export default function ShadowVault() {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const queryClient = useQueryClient();
  const MotionDiv = motion.div;

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['userWallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['cosmeticItems'],
    queryFn: async () => {
      const { data } = await supabase
        .from('cosmetic_items')
        .select('*');
      return data || [];
    },
    initialData: [],
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['userInventory', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('user_cosmetic_inventory')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const ownedItemIds = new Set(inventory.map(invItem => invItem.item_id));

  const purchaseItemMutation = useMutation({
    mutationFn: async (item) => {
      if (!user?.id || !wallet) throw new Error("User or wallet not loaded.");
      if (wallet.sp < item.sp_cost) throw new Error("Insufficient Shadow Points.");

      await supabase
        .from('progress')
        .update({
          sp: wallet.sp - item.sp_cost,
        })
        .eq('user_id', user.id);

      await supabase
        .from('user_cosmetic_inventory')
        .insert([{
          user_id: user.id,
          item_id: item.id,
          item_name: item.name
        }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWallet'] });
      queryClient.invalidateQueries({ queryKey: ['userInventory'] });
    },
  });

  const handlePurchase = (item) => {
    purchaseItemMutation.mutate(item);
  };

  const isLoading = walletLoading || itemsLoading || inventoryLoading;

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-8 transition-colors duration-400">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black flex items-center justify-center md:justify-start gap-4 uppercase tracking-widest leading-none">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center nm-flat">
                <Store className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              </div>
              Guild Vault
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 md:ml-18">
              <span className="text-(--text-secondary) font-black uppercase tracking-[0.3em] text-[10px] opacity-40">Recovery Privilege Market</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full nm-inset-sm text-[10px] font-black uppercase tracking-tighter opacity-70">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span>Locked Redemption Terminal</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row w-full md:w-auto items-center gap-4">
            <button
               onClick={() => setIsThemeOpen(true)}
               className="w-16 h-16 rounded-2xl nm-button flex items-center justify-center group transition-colors hover:text-blue-500"
            >
               <Palette className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex-1 md:flex-none flex flex-col items-center justify-center px-8 py-4 rounded-3xl nm-inset min-w-[160px] group transition-all hover:nm-inset-sm overflow-hidden">
               <p className="text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) opacity-40 mb-1">Authenticated Merit</p>
               <div className="flex items-center gap-3">
                 <Coins className="w-6 h-6 text-yellow-500 transition-transform group-hover:scale-110" />
                 <span className="text-2xl font-black leading-none">{wallet?.sp || 0} <span className="text-[10px] opacity-30 tracking-tighter">Vested SP</span></span>
               </div>
            </div>

            <Link
              to={createPageUrl('Dashboard')}
              className="flex-1 md:flex-none py-5 px-8 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 group transition-all"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Exit Vault
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-10 p-8 rounded-4xl nm-inset border border-blue-500/5 flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl nm-flat-sm flex items-center justify-center shrink-0 border border-blue-500/10">
            <Info className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2rem] mb-2 leading-none">Guild Protocol 402: Privilege Redemption</h4>
            <p className="text-sm text-(--text-secondary) leading-relaxed font-medium opacity-80">
              Verified recovery progression (Merit) generates Vested Shadow Points. These represent earned resource allocations for institutional privileges, personal exemptions, and cosmetic environmental overrides. All transactions are logged for clinical review.
            </p>
          </div>
        </div>

        {/* Items Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 opacity-40" />
            </div>
            <h2 className="text-2xl font-black tracking-widest uppercase">Active Clearance Tiers</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-(--text-secondary) font-bold uppercase tracking-widest opacity-40 animate-pulse">Requesting inventory from Shadow Core...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 rounded-3xl nm-inset">
              <p className="text-(--text-secondary) text-lg font-black uppercase tracking-widest opacity-80">Terminal Empty</p>
              <p className="text-(--text-secondary) opacity-40 text-sm mt-3 italic">Await next system delivery for privilege updates</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <MotionDiv
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="h-full"
                  >
                    <CosmeticItemCard
                      item={item}
                      userSpBalance={wallet?.sp || 0}
                      isOwned={ownedItemIds.has(item.id)}
                      onPurchase={handlePurchase}
                    />
                  </MotionDiv>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <ThemeSidebar isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
      </div>
    </div>
  );
}
