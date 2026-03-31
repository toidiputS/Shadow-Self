import React, { useState } from "react";
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
  Lock,
  Plus,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import GuildStatus from "../components/dashboard/GuildStatus";
import AuditLog from "../components/dashboard/AuditLog";
import GuildRoster from "../components/guild/GuildRoster";
import GuildPotDetails from "../components/guild/GuildPotDetails";
import ContractBuilder from "../components/guild/ContractBuilder";

export default function Guild() {
  const MotionDiv = motion.div;
  const [isContractBuilderOpen, setIsContractBuilderOpen] = useState(false);
  const [isAntiSpiralActive, setIsAntiSpiralActive] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      return data;
    },
    enabled: !!user?.id,
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

  const canManageGuild = profile?.role === 'admin' || guildMember?.role === 'leader';
  const guild = guildMember?.guilds;

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Sector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black flex items-center justify-center md:justify-start gap-6 uppercase tracking-widest leading-none italic">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-4xl flex items-center justify-center nm-flat text-blue-500 relative">
                <div className="absolute inset-0 bg-blue-500/10 rounded-4xl animate-pulse"></div>
                <Shield className="w-8 h-8 md:w-10 md:h-10 relative z-10" />
              </div>
              The Guild
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-8 md:ml-26">
              <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] opacity-60">Collective Stabilization Protocol</span>
              {guild && (
                <div className="flex items-center gap-3 px-6 py-2.5 rounded-full nm-inset-sm text-[10px] font-black uppercase tracking-widest border border-white/5 opacity-80 backdrop-blur-md">
                   <Users className="w-4 h-4 text-blue-500" />
                   <span>{guild.name} Node Terminal</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
              {canManageGuild && (
                <button 
                  onClick={() => setIsAntiSpiralActive(!isAntiSpiralActive)}
                  className={`flex-1 md:flex-none py-5 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all duration-500 ${
                    isAntiSpiralActive ? 'nm-inset-sm text-orange-500 shadow-orange-500/20' : 'nm-button text-orange-500/60 hover:text-orange-500'
                  }`}
                >
                  <Skull className={`w-5 h-5 ${isAntiSpiralActive ? 'animate-pulse' : ''}`} />
                  {isAntiSpiralActive ? 'Anti-Spiral Active' : 'Anti-Spiral Link'}
                </button>
              )}
              <Link
                to={createPageUrl('Dashboard')}
                className="flex-1 md:flex-none py-5 px-10 rounded-2xl nm-button font-black text-[10px] uppercase tracking-[0.4rem] flex items-center justify-center gap-4 group transition-all"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Terminal
              </Link>
          </div>
        </div>

        {/* Tactical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Status & Oversight */}
          <div className="lg:col-span-4 space-y-12">
            <GuildStatus user_id={user?.id} />

            {/* Active System Debuffs (Consequences) */}
            <div className={`p-10 rounded-[3rem] nm-flat transition-all duration-700 border ${debuffs.length > 0 ? 'border-red-500/20' : 'border-white/5'}`}>
               <div className="flex items-center gap-5 mb-10">
                 <div className={`w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center ${debuffs.length > 0 ? 'text-red-500 animate-pulse' : 'opacity-20'}`}>
                    <Skull className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-widest leading-tight">Environment Interference</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1 italic">Institutional Debuffs Active</p>
                 </div>
               </div>

               {debuffs.length === 0 ? (
                 <div className="nm-inset-sm p-12 rounded-4xl text-center opacity-40">
                    <ShieldCheck className="w-12 h-12 mb-6 mx-auto text-green-500 opacity-60" />
                    <p className="text-xs font-black uppercase tracking-[0.3rem]">System Integrity Cleared</p>
                    <p className="text-[10px] mt-4 font-bold italic opacity-60">"No active protocol deviations detected in guild environment."</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {debuffs.map((debuff) => (
                     <div key={debuff.id} className="p-6 rounded-3xl nm-inset-sm border border-red-500/10 hover:border-red-500/30 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-xs font-black uppercase tracking-widest text-red-500">{debuff.debuff_type.replace(/_/g, ' ')}</span>
                           <div className="px-3 py-1 rounded-lg nm-flat-sm text-[9px] font-mono font-black text-red-400">-{Math.round((1 - debuff.sp_modifier) * 100)}% YIELD</div>
                        </div>
                        <div className="h-3 rounded-full nm-inset p-0.5 mb-2 relative overflow-hidden">
                           <div 
                             className="h-full rounded-full bg-red-500/40 relative z-10" 
                             style={{ width: `${(debuff.quests_cleared / debuffs.quests_to_clear) * 100}%` }} 
                           />
                           <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Collective Progress</p>
                           <p className="text-xs font-black text-red-500/60">{debuffs.quests_to_clear - debuffs.quests_cleared} protocols to verify</p>
                        </div>
                     </div>
                   ))}
                   <button className="w-full py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-all mt-4 border border-red-500/5">
                      Consult Protocol Manual
                   </button>
                 </div>
               )}
            </div>

            {/* Weekly Contracts Sector */}
            <div className="p-10 rounded-[3rem] nm-flat border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
               
               <div className="flex items-center gap-5 mb-10 relative z-10">
                 <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-orange-500">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-widest">Active Contracts</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1 italic">Binding Collective Accountability</p>
                 </div>
               </div>
               
               <div className="space-y-6 relative z-10">
                 {/* Mock Active Contract */}
                 <div className="p-6 rounded-3xl nm-inset-sm border border-orange-500/10 group-hover:nm-inset transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="text-sm font-black uppercase tracking-wider text-orange-400">Zero Breach Week</h4>
                       <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">4D REMAINING</span>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                       <div className="h-1.5 flex-1 rounded-full bg-linear-to-r from-orange-500/40 to-yellow-500/40" style={{ width: '85%' }}></div>
                       <span className="text-[10px] font-black text-orange-500">85% Compliance</span>
                    </div>
                    <p className="text-[10px] font-bold opacity-60 leading-relaxed italic">Collective failure below 90% triggers institutional 'SP Yield' penalty.</p>
                 </div>

                 {canManageGuild && (
                    <button 
                      onClick={() => setIsContractBuilderOpen(true)}
                      className="w-full py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Finalize New Binding
                    </button>
                 )}
               </div>
            </div>
          </div>

          {/* Collective Hub */}
          <div className="lg:col-span-8 space-y-12">
            <GuildRoster guildId={guildMember?.guild_id} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <GuildPotDetails potData={potData} />
                <div className="h-full flex flex-col">
                   <div className="flex items-center gap-5 mb-8 pl-4">
                      <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-blue-500">
                         <History className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-widest">Protocol Registry</h3>
                   </div>
                   <div className="flex-1 min-h-[500px]">
                      <AuditLog />
                   </div>
                </div>
            </div>
          </div>
        </div>

        <div className="pb-40" />
      </div>

      <ContractBuilder isOpen={isContractBuilderOpen} onClose={() => setIsContractBuilderOpen(false)} />
    </div>
  );
}
