import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { Activity, ShieldCheck, AlertTriangle, UserCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AuditLog() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('guild_activity_log')
        .select(`
          *,
          profiles:user_id(display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!data || data.length === 0) {
        // Fallback to quest completions as a secondary registry
        const { data: completions } = await supabase
          .from('quest_completions')
          .select(`
            *,
            quests(title),
            profiles:user_id(display_name)
          `)
          .order('completed_at', { ascending: false })
          .limit(10);
          
        return (completions || []).map(c => ({
          ...c,
          event_type: 'protocol_complete',
          message: `PROTOCOL: ${c.quests?.title || "System Sync"} validated.`,
          created_at: c.completed_at
        }));
      }
      return data;
    },
    refetchInterval: 5000,
  });

  const getLogIcon = (type) => {
    switch (type) {
      case 'COMPLIANCE': return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'VIOLATION': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-8 rounded-4xl nm-flat-lg border border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest leading-none">Activity Registry</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full nm-inset-sm text-[10px] font-black uppercase tracking-tighter opacity-40">
           <Clock className="w-3 h-3" />
           <span>System Time Synced</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-20 animate-pulse">Requesting system logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center opacity-40 italic text-sm">
          No recent activity on this clearance.
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="p-4 rounded-2xl nm-inset-sm flex items-center gap-4 group hover:nm-inset transition-all"
            >
              <div className="w-9 h-9 rounded-xl nm-flat-xs flex items-center justify-center shrink-0 border border-white/5">
                 {getLogIcon(log.type || 'COMPLIANCE')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.05rem] truncate opacity-90 transition-opacity">
                  {log.message}
                </p>
                <div className="flex items-center gap-2 mt-1 opacity-40">
                  <UserCircle className="w-3 h-3" />
                  <span className="text-[10px] font-black tracking-widest uppercase">{log.profiles?.display_name || `Member: ${log.user_id?.substring(0, 8)}`}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-tighter opacity-30">
                  {formatDistanceToNow(new Date(log.completed_at))} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">Institutional Audit Locked</p>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
    </div>
  );
}
