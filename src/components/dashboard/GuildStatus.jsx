import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { Shield, Zap, TrendingUp, AlertCircle, Heart } from "lucide-react";

export default function GuildStatus({ user_id }) {
  const { data: guildMember } = useQuery({
    queryKey: ['guildStatus', user_id],
    queryFn: async () => {
      if (!user_id) return null;
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          guilds(*)
        `)
        .eq('user_id', user_id)
        .maybeSingle();

      if (error) {
        console.error("❌ House Retrieval Error:", error.message);
        return null;
      }
      return data;
    },
    enabled: !!user_id,
  });

  const guild = guildMember?.guilds;

  return (
    <div className="p-8 rounded-4xl nm-flat-lg border border-white/5 flex flex-col group hover:nm-flat transition-all duration-700">

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest leading-none">House Status</h2>
        </div>
      </div>

      <div className="space-y-8 flex-1">
        {/* Guild Health */}
        <div>
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2rem] text-(--text-secondary) opacity-60">House Stability</span>
             </div>
             <span className="text-xl font-black">{guild?.health_score || 100}%</span>
          </div>
          <div className="h-3 rounded-full nm-inset-sm overflow-hidden p-0.5">
             <div 
               className="h-full rounded-full bg-linear-to-r from-red-500/50 via-yellow-500/50 to-green-500/50 transition-all duration-1000"
               style={{ width: `${guild?.health_score || 100}%` }}
             />
          </div>
        </div>

        {/* Shadow Stacks / Resource Pools */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 rounded-2xl nm-inset-sm flex flex-col items-center gap-2 group-hover:nm-inset transition-all">
              <Zap className="w-4 h-4 text-blue-400 opacity-60" />
              <div className="text-center">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">XP Daily Cap</p>
                 <p className="text-lg font-black">{guild?.daily_xp_cap || 0}</p>
              </div>
           </div>
           <div className="p-4 rounded-2xl nm-inset-sm flex flex-col items-center gap-2 group-hover:nm-inset transition-all">
              <TrendingUp className="w-4 h-4 text-yellow-400 opacity-60" />
              <div className="text-center">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">SP Daily Yield</p>
                 <p className="text-lg font-black">{guild?.daily_sp_cap || 0}</p>
              </div>
           </div>
        </div>

        {/* Compliance Protocol */}
        <div className="p-5 rounded-3xl nm-inset-sm border border-blue-500/5 group-hover:border-blue-500/10 transition-colors">
           <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.15rem] leading-none">Weekly Grace</p>
           </div>
           <div className="flex justify-between items-end">
              <div>
                 <p className="text-xs font-black opacity-80">{guild?.grace_misses_per_week || 0} / WEEK</p>
                 <p className="text-[9px] opacity-40 italic mt-1">Missed habits allowed per week</p>
              </div>
              <div className="px-3 py-1 rounded-full nm-flat-xs text-[9px] font-black truncate uppercase tracking-tighter opacity-70">
                 {guild?.consequence_mode || "STANDARD"} MODE
              </div>
           </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center pt-6 border-t border-white/5 opacity-30 group-hover:opacity-50 transition-opacity">
         <p className="text-[9px] font-black uppercase tracking-[0.3em]">House Name: {guild?.name || "Initializing..."}</p>
      </div>
    </div>
  );
}
