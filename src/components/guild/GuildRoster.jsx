import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  HardHat, 
  MoreVertical,
  ArrowRight,
  TrendingUp,
  Heart
} from "lucide-react";

export default function GuildRoster({ guildId }) {
  const { data: roster = [], isLoading } = useQuery({
    queryKey: ['guildRoster', guildId],
    queryFn: async () => {
      if (!guildId) return [];
      const { data } = await supabase
        .from('guild_members')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('guild_id', guildId);
      return data || [];
    },
    enabled: !!guildId,
  });

  if (isLoading) return <div className="text-center py-20 opacity-20 font-black uppercase tracking-widest animate-pulse">Syncing Guild Nodes...</div>;

  return (
    <div className="p-10 rounded-[3rem] nm-flat border border-white/5 relative overflow-hidden">
       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
       
       <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                <Users className="w-7 h-7" />
             </div>
             <div>
                <h3 className="text-2xl font-black uppercase tracking-[0.3em] leading-none mb-2">Member Roster</h3>
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest italic">Collective Node Transparency</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-6 py-3 rounded-xl nm-inset-sm text-[10px] font-black uppercase tracking-widest opacity-60">
                {roster.length} Active Nodes
             </div>
          </div>
       </div>

       <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="border-b border-white/5">
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Identity</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center">Status</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center">Contribution</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center">Streak</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-right">Actions</th>
                </tr>
             </thead>
             <tbody>
                {roster.map((member) => (
                   <tr key={member.id} className="group hover:bg-blue-500/5 transition-colors border-b border-white/5 last:border-none">
                      <td className="p-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-300 font-bold">
                               {member.profiles?.display_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                               <h4 className="text-sm font-black uppercase tracking-wider">{member.profiles?.display_name || 'Anonymous User'}</h4>
                               <p className="text-[10px] font-bold opacity-30 italic">{member.role === 'leader' ? 'Guild Leader' : 'Protocol Member'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg nm-inset-sm text-[9px] font-black uppercase tracking-widest ${
                            member.profiles?.current_streak > 0 ? 'text-green-500' : 'text-red-500'
                         }`}>
                            {member.profiles?.current_streak > 0 ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            <span>{member.profiles?.current_streak > 0 ? 'Verified' : 'Breach'}</span>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1">
                               <Heart className="w-3 h-3 text-red-500/60" />
                               <span className="text-xs font-black">+{member.contribution_score || 0}%</span>
                            </div>
                            <div className="w-24 h-1.5 rounded-full nm-inset-sm overflow-hidden p-0.5">
                               <div 
                                 className="h-full rounded-full bg-red-500/40" 
                                 style={{ width: `${member.contribution_score || 0}%` }}
                               />
                            </div>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <span className="text-sm font-black tracking-widest">{member.profiles?.current_streak || 0}D</span>
                      </td>
                      <td className="p-6 text-right">
                         <button className="p-3 rounded-xl nm-button opacity-0 group-hover:opacity-100 transition-all text-blue-500">
                            <ArrowRight className="w-4 h-4" />
                         </button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}
