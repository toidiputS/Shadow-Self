import React from "react";
import { supabase } from "@/api/supabase";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Users, 
  Activity, 
  Zap, 
  TrendingUp, 
  ArrowLeft, 
  Heart,
  Skull,
  Coins,
  History,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import GuildStatus from "../components/dashboard/GuildStatus";
import AuditLog from "../components/dashboard/AuditLog";

export default function Guild() {
  const MotionDiv = motion.div;

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: guildMember } = useQuery({
    queryKey: ['guildMember', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('guild_members')
        .select(`*, guilds(*)`)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: potData } = useQuery({
    queryKey: ['guildPot', guildMember?.guild_id],
    queryFn: async () => {
      if (!guildMember?.guild_id) return null;
      const { data } = await supabase
        .from('guild_pot')
        .select('*')
        .eq('guild_id', guildMember.guild_id)
        .maybeSingle();
      return data;
    },
    enabled: !!guildMember?.guild_id,
  });

  const { data: debuffs = [] } = useQuery({
    queryKey: ['guildDebuffs', guildMember?.guild_id],
    queryFn: async () => {
      if (!guildMember?.guild_id) return [];
      const { data } = await supabase
        .from('guild_debuffs')
        .select('*')
        .eq('guild_id', guildMember.guild_id)
        .is('cleared_at', null);
      return data || [];
    },
    enabled: !!guildMember?.guild_id,
  });

  const guild = guildMember?.guilds;

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black flex items-center justify-center md:justify-start gap-5 uppercase tracking-widest leading-none">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center nm-flat">
                <Shield className="w-7 h-7 md:w-9 md:h-9 text-blue-500" />
              </div>
              The Guild
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-5 md:ml-21">
              <span className="text-(--text-secondary) font-black uppercase tracking-[0.4em] text-[10px] opacity-40">Collective Authority</span>
              {guild && (
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full nm-inset-sm text-[10px] font-black uppercase tracking-widest opacity-80 border border-white/5">
                   <Users className="w-4 h-4 text-blue-500" />
                   <span>{guild.name} — Command Center</span>
                </div>
              )}
            </div>
          </div>
          
          <Link
            to={createPageUrl('Dashboard')}
            className="flex-1 md:flex-none py-5 px-8 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.3rem] flex items-center justify-center gap-4 group transition-all"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Core Terminal
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Stats & Status */}
          <div className="lg:col-span-4 space-y-10">
            <GuildStatus user_id={user?.id} />

            {/* Guild Pot Card */}
            <div className="p-8 rounded-4xl nm-flat-lg border border-white/5">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center">
                       <Coins className="w-5 h-5 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-widest">Guild Pot</h3>
                  </div>
               </div>
               
               <div className="nm-inset-sm p-6 rounded-3xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2rem] opacity-30 mb-2">Total Resource Reserve</p>
                  <p className="text-4xl font-black">{potData?.sp_balance || 0} <span className="text-sm opacity-40">SP</span></p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-[9px] font-black uppercase tracking-[0.1rem] opacity-40">
                     <TrendingUp className="w-3 h-3 text-green-500" />
                     <span>Daily Contribution Goal: 1,000 SP</span>
                  </div>
               </div>

               <p className="mt-6 text-xs text-(--text-secondary) leading-relaxed opacity-60 italic">
                  "Collective reserves are used to clear systemic debuffs, unlock guild-wide events, and sustain members in high-debt protocols."
               </p>
            </div>
          </div>

          {/* Middle Column: Active Debuffs & Registry */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Debuffs Section */}
               <div className={`p-8 rounded-4xl nm-flat-lg border ${debuffs.length > 0 ? 'border-red-500/20' : 'border-white/5'}`}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center ${debuffs.length > 0 ? 'text-red-500 animate-pulse' : 'opacity-20'}`}>
                       <Skull className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-widest leading-tight">System Debuffs</h3>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Environmental Interference</p>
                    </div>
                  </div>

                  {debuffs.length === 0 ? (
                    <div className="nm-inset-sm p-8 rounded-3xl text-center opacity-40">
                       <p className="text-xs font-black uppercase tracking-[0.2rem]">No Active Interference</p>
                       <p className="text-[10px] mt-2 italic">System running at 100% capacity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {debuffs.map((debuff) => (
                        <div key={debuff.id} className="p-4 rounded-2xl nm-inset-sm border border-red-500/10">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-black uppercase tracking-widest text-red-500">{debuff.debuff_type.replace('_', ' ')}</span>
                              <span className="text-[10px] font-bold opacity-40">{Math.round(debuff.sp_modifier * 100)}% Yield</span>
                           </div>
                           <div className="h-2 rounded-full nm-inset p-0.5 mb-2">
                              <div 
                                className="h-full rounded-full bg-red-500/40" 
                                style={{ width: `${(debuff.quests_cleared / debuffs.quests_to_clear) * 100}%` }} 
                              />
                           </div>
                           <p className="text-[9px] font-black uppercase tracking-tighter opacity-40 text-center">
                              {debuff.quests_to_clear - debuff.quests_cleared} protocols remaining to clear
                           </p>
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               {/* Guild Contracts Summary */}
               <div className="p-8 rounded-4xl nm-flat-lg border border-white/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center">
                       <Lock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-widest leading-tight">Weekly Contracts</h3>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Accountability Binding</p>
                    </div>
                  </div>
                  
                  <div className="nm-inset-sm p-6 rounded-3xl flex flex-col items-center justify-center gap-3 opacity-60 grayscale scale-95 origin-center">
                     <p className="text-xs font-black uppercase tracking-widest text-center">Contract Interface Locked</p>
                     <p className="text-[10px] text-center italic">Requires Guild Level 3 or Sponsor Approval</p>
                  </div>
               </div>
            </div>

            {/* Global Activity Registry */}
            <div className="h-[500px]">
               <AuditLog />
            </div>
          </div>
        </div>

        {/* Footer Navigation (Desktop) */}
        <div className="hidden md:flex justify-center mt-12">
           <div className="flex items-center gap-6 p-4 rounded-3xl nm-inset">
              <Link to="/dashboard" className="px-8 py-3 rounded-xl nm-button text-[10px] font-black uppercase tracking-widest hover:text-blue-500">Overview</Link>
              <Link to="/guild" className="px-8 py-3 rounded-xl nm-inset-sm text-[10px] font-black uppercase tracking-widest text-blue-500">Guild</Link>
              <Link to="/shadowvault" className="px-8 py-3 rounded-xl nm-button text-[10px] font-black uppercase tracking-widest hover:text-blue-500">Vault</Link>
              <div className="px-8 py-3 rounded-xl nm-button opacity-20 cursor-not-allowed text-[10px] font-black uppercase tracking-widest">System</div>
           </div>
        </div>
      </div>
    </div>
  );
}
