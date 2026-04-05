import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  UserCircle, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter, 
  X,
  FileText,
  Calendar,
  Lock,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isFullLogModalOpen, setIsFullLogModalOpen] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs', activeFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('guild_activity_log')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (activeFilter !== "ALL") {
        query = query.eq('type', activeFilter);
      }
      
      if (searchQuery) {
        query = query.ilike('message', `%${searchQuery}%`);
      }

      const { data } = await query.limit(50);
      
      if (!data || data.length === 0) {
        // Fallback or secondary registry
        const { data: completions } = await supabase
          .from('quest_completions')
          .select(`
            *,
            quests(title)
          `)
          .order('completed_at', { ascending: false })
          .limit(20);
          
        return (completions || []).map(c => ({
          ...c,
          type: 'HABIT',
          message: `${c.quests?.title || "Habit"} completed.`,
          created_at: c.completed_at
        }));
      }
      return data;
    },
    refetchInterval: 15000,
  });

  const getLogIcon = (type) => {
    switch (type) {
      case 'HABIT': return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'ISSUE': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'SYSTEM': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8); // Keep the dashboard view compact

  return (
    <div className="p-8 rounded-[3.5rem] nm-flat border border-white/5 flex flex-col h-full bg-white/2">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-[0.2em] leading-none mb-1">Activity Log</h2>
            <p className="text-[9px] font-black uppercase opacity-30 tracking-widest italic flex items-center gap-2">
               <Lock className="w-2 h-2" /> Recent House Activity
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity text-blue-500" />
              <input 
                type="text" 
                placeholder="SEARCH ACTIVITY..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl nm-inset-sm bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-none placeholder:opacity-20"
              />
           </div>
           <button 
             onClick={() => setIsFullLogModalOpen(true)}
             className="px-6 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all active:scale-95 flex items-center gap-2"
           >
              <FileText className="w-4 h-4" />
              Archives
           </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {["ALL", "HABIT", "ISSUE", "SYSTEM"].map(filter => (
            <button
               key={filter}
               onClick={() => setActiveFilter(filter)}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === filter ? 'nm-inset-xs text-blue-500 shadow-[inset_0_2px_10px_rgba(59,130,246,0.15)]' : 'nm-flat opacity-40 hover:opacity-100'}`}
            >
               {filter}
            </button>
          ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <RefreshCw className="w-8 h-8 text-blue-500 animate-spin opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Uplinking to Decentralized Registry...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 italic text-center px-12">
             <ShieldAlert className="w-12 h-12 mb-4 opacity-10" />
             <p className="text-xs font-black uppercase tracking-widest leading-relaxed">No activity matched your search parameters.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredLogs.map((log) => (
              <MotionDiv 
                key={log.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-5 rounded-3xl nm-inset-sm flex items-center gap-6 group hover:nm-flat transition-all border border-white/5 relative overflow-hidden"
              >
                <div className={`w-10 h-10 rounded-xl nm-inset-xs flex items-center justify-center shrink-0 border border-white/5 ${log.type === 'ISSUE' ? 'text-red-500' : log.type === 'HABIT' ? 'text-green-500' : 'text-blue-500'}`}>
                   {getLogIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                     <span className={`text-[8px] font-black uppercase tracking-widest italic opacity-40 px-2 py-0.5 rounded-lg nm-flat-xs ${log.type === 'ISSUE' ? 'text-red-500/60' : 'text-blue-400/60'}`}>{log.type || 'EVENT'}</span>
                     <span className="text-[9px] font-black uppercase opacity-20 tabular-nums">{formatDistanceToNow(new Date(log.created_at || log.completed_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-xs font-black uppercase tracking-tight opacity-80 group-hover:opacity-100 transition-opacity leading-tight">
                    {log.message}
                  </p>
                </div>
                <button title="View Details" className="p-3 rounded-2xl nm-button opacity-0 group-hover:opacity-100 transition-all text-blue-500 active:scale-95 ml-4">
                   <ChevronRight className="w-4 h-4" />
                </button>
              </MotionDiv>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">{logs.length} Total Activity Logs</p>
          <p className="text-[7px] font-black uppercase tracking-widest opacity-10">Last Update: {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
      </div>

      <AnimatePresence>
         {isFullLogModalOpen && (
            <div className="fixed inset-0 z-110 flex items-center justify-center p-6 md:p-8">
               <MotionDiv 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setIsFullLogModalOpen(false)}
                 className="absolute inset-0 bg-black/98 backdrop-blur-3xl cursor-pointer"
               />
               <MotionDiv 
                 initial={{ scale: 0.9, opacity: 0, y: 40 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 40 }}
                 onClick={(e) => e.stopPropagation()}
                 className="relative w-full max-w-5xl h-[85vh] bg-(--bg-color) nm-flat rounded-[4rem] p-12 border border-white/5 overflow-hidden flex flex-col shadow-2xl"
               >
                  <div className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center text-blue-500">
                           <FileText className="w-8 h-8" />
                        </div>
                        <div>
                           <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">House Archives</h3>
                           <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.4rem] mt-2 italic">Historical Activity Log</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => setIsFullLogModalOpen(false)}
                       className="w-14 h-14 rounded-2xl nm-button flex items-center justify-center text-red-500 opacity-40 hover:opacity-100 transition-all active:scale-95"
                     >
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar space-y-4">
                     {logs.map((log, i) => (
                        <div key={i} className="p-8 rounded-[2.5rem] nm-inset-sm border border-white/5 flex items-center gap-8 group hover:nm-inset transition-all">
                           <span className="text-[10px] font-black opacity-10 tabular-nums w-8">{(i + 1).toString().padStart(2, '0')}</span>
                           <div className={`w-12 h-12 rounded-2xl nm-flat flex items-center justify-center shrink-0 ${log.type === 'VIOLATION' ? 'text-red-500' : 'text-blue-500'}`}>
                              {getLogIcon(log.type)}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                 <span className="text-[9px] font-black uppercase tracking-widest opacity-40 tabular-nums">{new Date(log.created_at || log.completed_at).toLocaleString()}</span>
                                 <span className="text-[14px] opacity-10">/</span>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 italic">{log.type || 'HABIT'}</span>
                              </div>
                              <p className="text-sm font-black uppercase tracking-tight opacity-80 leading-relaxed italic">{log.message}</p>
                           </div>
                           <div className="flex items-center gap-4 text-right">
                              <div className="flex flex-col items-end">
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Signature Verified</p>
                                 <p className="text-[8px] font-black tabular-nums opacity-20">RX-NODE-{log.id?.substring(0, 4)}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-12 flex justify-between items-center px-6">
                     <p className="text-[10px] font-black uppercase tracking-[0.5rem] opacity-10">Shadow Self Systems v2.1</p>
                     <p className="text-[10px] font-black uppercase tracking-[0.2rem] text-blue-500/40 italic">Unauthorized access is prohibited.</p>
                  </div>
               </MotionDiv>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

const RefreshCw = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
  </svg>
);
