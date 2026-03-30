import React from "react";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, Store, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence } from "framer-motion";

import CosmeticItemCard from "../components/shadowvault/CosmeticItemCard";

export default function ShadowVault() {
  const queryClient = useQueryClient();

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

      // Transaction-like update (ideally would be an RPC or transaction in production)
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
    <div className="min-h-screen bg-[#e0e0e0] px-4 py-8 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-10 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center justify-center md:justify-start gap-4">
              <div className="
                w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center
                bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
              ">
                <Store className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
              </div>
              Shadow Vault
            </h1>
            <p className="text-gray-500 mt-3 md:ml-18 font-medium">Cosmetic Store</p>
          </div>
          
          <div className="flex flex-row w-full md:w-auto items-center gap-4">
            <div className="flex-1 md:flex-none flex items-center justify-center gap-2
              px-5 py-4 rounded-2xl
              bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
              text-gray-800 font-bold
            ">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="text-base md:text-lg">{wallet?.sp || 0} SP</span>
            </div>
            <Link
              to={createPageUrl('Dashboard')}
              className="
                flex-1 md:flex-none py-4 px-6 md:px-8 rounded-2xl
                bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]
                hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
                active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                transition-all duration-200
                text-gray-800 font-bold text-sm
                flex items-center justify-center gap-2
              "
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span> Dashboard
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading vault items...</div>
        ) : items.length === 0 ? (
          <div className="
            text-center py-16 rounded-3xl
            bg-[#e0e0e0] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]
          ">
            <p className="text-gray-500 text-lg">No items available yet</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for new cosmetics</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {items.map((item) => (
                <CosmeticItemCard
                  key={item.id}
                  item={item}
                  userSpBalance={wallet?.sp || 0}
                  isOwned={ownedItemIds.has(item.id)}
                  onPurchase={handlePurchase}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
