import React, { useState } from "react";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft,
  Skull,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export default function GuildPotDetails({ guildId, potData: initialPotData }) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  
  const isOwnerOrAdmin = profile?.role === 'owner' || profile?.role === 'admin';

  // Fetch pot data with debuff info
  const { data: potData } = useQuery({
    queryKey: ['guild-pot', guildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_pot')
        .select('*')
        .eq('guild_id', guildId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!guildId
  });

  // Fetch active debuff
  const { data: activeDebuff } = useQuery({
    queryKey: ['guild-debuff', guildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_debuffs')
        .select('*')
        .eq('guild_id', guildId)
        .eq('active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      return data || null;
    },
    enabled: !!guildId
  });

  // Fetch activity log
  const { data: activityLog = [] } = useQuery({
    queryKey: ['guild-activity-log', guildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_activity_log')
        .select('*')
        .eq('guild_id', guildId)
        .order('created_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      return data;
    },
    enabled: !!guildId
  });

  // Clear debuff mutation
  const clearDebuffMutation = useMutation({
    mutationFn: async () => {
      // Clear the active debuff
      const { error } = await supabase
        .from('guild_debuffs')
        .update({ 
          active: false, 
          cleared_at: new Date().toISOString() 
        })
        .eq('guild_id', guildId)
        .eq('active', true);

      if (error) throw error;

      // Clear debuff from guild_pot
      await supabase
        .from('guild_pot')
        .update({ 
          debuff_active: null,
          debuff_expires_at: null
        })
        .eq('guild_id', guildId);

      // Log the action
      await supabase
        .from('guild_activity_log')
        .insert([{
          guild_id: guildId,
          user_id: user.id,
          action_type: 'debuff_cleared',
          description: 'Cleared active guild debuff',
          sp_amount: -potData?.sp_balance * 0.1 || -50 // 10% of pot as cost
        }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild-debuff', guildId] });
      queryClient.invalidateQueries({ queryKey: ['guild-pot', guildId] });
      queryClient.invalidateQueries({ queryKey: ['guild-activity-log', guildId] });
    }
  });

  // Withdraw mutation (admin only, takes a percentage)
  const withdrawMutation = useMutation({
    mutationFn: async (amount) => {
      // Deduct from guild pot
      const { error } = await supabase
        .from('guild_pot')
        .update({ 
          sp_balance: potData.sp_balance - amount 
        })
        .eq('guild_id', guildId);

      if (error) throw error;

      // Log withdrawal
      await supabase
        .from('guild_activity_log')
        .insert([{
          guild_id: guildId,
          user_id: user.id,
          action_type: 'withdrawal',
          description: `Admin withdrawal of ${amount} SP`,
          sp_amount: -amount
        }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild-pot', guildId] });
      queryClient.invalidateQueries({ queryKey: ['guild-activity-log', guildId] });
      setShowWithdrawConfirm(false);
    }
  });

  const handleClearDebuff = () => {
    if (window.confirm('Clear debuff? This will cost 10% of the guild pot.')) {
      clearDebuffMutation.mutate();
    }
  };

  const handleWithdraw = (amount) => {
    withdrawMutation.mutate(amount);
  };

  const spBalance = potData?.sp_balance || 0;
  const debuff = activeDebuff;

  // Mock history if no real data
  const history = activityLog.length > 0 ? activityLog : [
    { id: 1, type: "fine", amount: -50, description: "Protocol Breach: Marcus T.", time: "2h ago", icon: <ShieldAlert className="text-red-500" /> },
    { id: 2, type: "contribution", amount: 100, description: "AM Milestone: Elena V.", time: "4h ago", icon: <ShieldCheck className="text-green-500" /> },
    { id: 3, type: "redemption", amount: -500, description: "Cleared 'SP Yield' Debuff", time: "1d ago", icon: <Zap className="text-yellow-500" /> },
    { id: 4, type: "fine", amount: -25, description: "Missed Reflection: Julian R.", time: "1d ago", icon: <Skull className="text-orange-500" /> },
    { id: 5, type: "contribution", amount: 200, description: "Weekly Chain Clear: Sarah C.", time: "2d ago", icon: <TrendingUp className="text-blue-500" /> },
  ];

  const getActivityIcon = (actionType) => {
    switch (actionType) {
      case 'fine': return <ShieldAlert className="text-red-500" />;
      case 'contribution': return <ShieldCheck className="text-green-500" />;
      case 'debuff_cleared': return <Zap className="text-yellow-500" />;
      case 'withdrawal': return <ArrowDownLeft className="text-orange-500" />;
      default: return <Coins className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-10">
       <div className="p-8 rounded-[2.5rem] nm-flat-lg border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          {/* Active Debuff Warning */}
          {debuff && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-black uppercase text-red-500">Active Debuff: {debuff.debuff_type}</p>
                <p className="text-[10px] opacity-60">{debuff.consequence_type} - Expires {debuff.duration_days} days</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-8 relative z-10">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-yellow-500">
                   <Coins className="w-6 h-6" />
                </div>

                <div>
                   <h3 className="text-xl font-black uppercase tracking-widest leading-none">Institutional Reserve</h3>
                   <p className="text-[10px] font-black uppercase opacity-30 tracking-widest mt-1 italic">Collective SP Liquidity</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-2xl font-black">{spBalance} <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">SP</span></p>
                <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] font-black uppercase tracking-widest text-green-500">
                   <TrendingUp className="w-3 h-3" /> +12% Growth
                </div>
             </div>
          </div>


          <div className="grid grid-cols-2 gap-4 relative z-10">
              <button 
                onClick={handleClearDebuff}
                disabled={!debuff || clearDebuffMutation.isPending || !isOwnerOrAdmin}
                className={`flex-1 p-5 rounded-3xl nm-button text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {clearDebuffMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )} Clear Debuff
              </button>
              
              <button 
                onClick={() => setShowWithdrawConfirm(true)}
                disabled={!isOwnerOrAdmin || spBalance < 100}
                className="flex-1 p-5 rounded-3xl nm-button text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ArrowDownLeft className="w-4 h-4" /> Withdraw
              </button>
          </div>
       </div>


       {/* Withdraw Modal */}
       {showWithdrawConfirm && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="nm-flat-lg p-8 rounded-4xl max-w-md w-full">
             <div className="flex items-center gap-4 mb-6">
               <AlertTriangle className="w-8 h-8 text-orange-500" />
               <h3 className="text-xl font-black uppercase">Confirm Withdrawal</h3>
             </div>
             
             <p className="text-[10px] font-black opacity-60 mb-6 uppercase tracking-widest">
               Available Balance: {spBalance} SP
             </p>
             
             <div className="grid grid-cols-3 gap-3 mb-6">
               {[100, 250, 500].map(amount => (
                 <button
                   key={amount}
                   onClick={() => handleWithdraw(amount)}
                   disabled={spBalance < amount || withdrawMutation.isPending}
                   className="p-4 rounded-2xl nm-button font-black text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-all"
                 >
                   {amount} SP
                 </button>
               ))}
             </div>
             
             <button
               onClick={() => setShowWithdrawConfirm(false)}
               className="w-full py-4 rounded-2xl nm-inset-sm font-black text-[10px] uppercase tracking-widest"
             >
               Cancel
             </button>
           </div>
         </div>
       )}


       <div className="p-8 rounded-[2.5rem] nm-flat border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-blue-400">
                   <History className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-black uppercase tracking-widest">Ledger History</h3>
             </div>

             <div className="px-5 py-2 rounded-xl nm-inset-sm text-[9px] font-black uppercase tracking-widest opacity-30">Last 25 Entries</div>
          </div>


          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
             {history.map((entry) => (
               <div key={entry.id} className="p-5 rounded-3xl nm-inset-sm border border-white/5 flex items-center justify-between group hover:nm-flat transition-all">
                  <div className="flex items-center gap-5">
                     <div className="w-10 h-10 rounded-xl nm-flat flex items-center justify-center">
                        {getActivityIcon(entry.type) || entry.icon}
                     </div>
                     <div>
                        <h4 className="text-xs font-black uppercase tracking-wider">{entry.description}</h4>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-0.5">{entry.time || (entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '')}</p>
                     </div>

                  </div>
                  <div className="text-right">
                     <span className={`text-sm font-black font-mono tracking-widest ${
                       (entry.amount > 0 || entry.sp_amount > 0) ? 'text-green-500' : 'text-red-500'
                     }`}>
                       {(entry.amount > 0 ? '+' : (entry.amount < 0 ? '' : (entry.sp_amount > 0 ? '+' : ''))}{entry.amount || entry.sp_amount || 0} <span className="text-[9px] opacity-40">SP</span>
                     </span>

                  </div>

               </div>

             ))}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-(--bg-color) to-transparent pointer-events-none" />
       </div>

    </div>
  );
}
