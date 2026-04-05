import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  MessageSquare, 
  Zap, 
  Trash2, 
  AlertCircle,
  TrendingUp,
  Heart,
  Clock,
  UserCircle,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/hooks/useAuth";
import RecoveryHeatmap from "../dashboard/RecoveryHeatmap";
import { formatDistanceToNow } from "date-fns";
import HouseMessageModal from "./HouseMessageModal";

const MotionDiv = motion.div;

export default function MemberProfileModal({ isOpen, onClose, member, initialAction }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = member?.user_id || member?.id; // Handle different object shapes
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isSignalModalOpen, setIsSignalModalOpen] = React.useState(false);
  const [signalDefaultMsg, setSignalDefaultMsg] = React.useState('');

  React.useEffect(() => {
    if (isOpen && initialAction) {
      if (initialAction === 'manage') setActiveTab('history');
      else if (initialAction === 'signal') setActiveTab('alerts');
      else setActiveTab('overview');
    }
  }, [isOpen, initialAction]);


  const { data: profile } = useQuery({
    queryKey: ['memberProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      return data;
    },
    enabled: !!userId && isOpen,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['memberLogs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('quest_completions')
        .select(`
          *,
          quests(title)
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!userId && isOpen,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['memberActivity', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('guild_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!userId && isOpen,
  });

  const { data: signals = [] } = useQuery({
    queryKey: ['memberSignals', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!userId && (isOpen && activeTab === 'alerts'),
  });

    const supportMutation = useMutation({
      mutationFn: async ({ customMessage, type = 'support' } = {}) => {
        const isFocus = type === 'support';
         const defaultMsg = isFocus 
           ? "HOUSE NOTICE: We're checking in to see how we can better support your progress."
           : "HOUSE CHECK-IN: Please let us know how you're doing.";
       
       const { error } = await supabase.from('notifications').insert([{
         user_id: userId,
         type: isFocus ? 'verification' : 'manual',
         message: customMessage || defaultMsg,
         metadata: { 
           priority: isFocus ? 'high' : 'medium', 
           action: isFocus ? 'manual_audit' : 'sync_request',
           sender_id: user.id
         }
       }]);
        if (error) throw error;
      },
       onSuccess: () => {
          alert("House message sent successfully.");
       },
       onError: (err) => {
          alert("Failed to send message: " + err.message);
       }
    });

   const purgeMutation = useMutation({
     mutationFn: async (id) => {
       const { error } = await supabase.from('guild_activity_log').delete().eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['memberActivity', userId] });
     },
      onError: (err) => {
        alert("Failed to remove habit entry: " + err.message);
      }
   });
    const purgeAllMutation = useMutation({
      mutationFn: async () => {
        const { error } = await supabase.from('guild_activity_log').delete().eq('user_id', userId);
        if (error) throw error;
      },
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['memberActivity', userId] });
         alert("All records cleared.");
       },
       onError: (err) => {
         alert("Failed to clear records: " + err.message);
       }
    });

  React.useEffect(() => {
    if (isOpen && initialAction === 'signal' && userId) {
      setSignalDefaultMsg("HOUSE ALERT: Please update your status when possible.");
      setIsSignalModalOpen(true);
    }
  }, [isOpen, initialAction, userId]);

   if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-999 flex items-center justify-center p-4 md:p-8">
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
        />
        
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative w-full max-w-7xl h-full max-h-[90vh] bg-(--bg-color) nm-flat-lg rounded-[4rem] overflow-hidden flex flex-col md:flex-row border border-white/5 shadow-2xl z-10"
        >
          {/* Left Column: Member Card */}
          <div className="w-full md:w-80 lg:w-96 p-12 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between shrink-0 bg-white/2">
              <div className="space-y-12">
                 <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-24 h-24 rounded-4xl nm-inset-sm flex items-center justify-center text-blue-500 mb-8 mx-auto md:mx-0">
                       <UserCircle className="w-12 h-12" />
                    </div>
                    
                    <div>
                       <h2 className="text-xl font-black uppercase tracking-widest">{profile?.display_name || "Member"}</h2>
                       <p className="text-[10px] font-black uppercase tracking-[0.3rem] opacity-30 mt-2 italic">Member ID: {userId?.substring(0, 8)}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-5 rounded-2xl nm-inset-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                           <Zap className="w-4 h-4 text-blue-500 opacity-60" />
                           <span className="text-xs font-black">{profile?.current_streak || 0}D</span>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Current Streak</p>
                    </div>
                    <div className="p-5 rounded-2xl nm-inset-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                           <TrendingUp className="w-4 h-4 text-green-500 opacity-60" />
                           <span className="text-xs font-black">{profile?.xp || 0} XP</span>
                        </div>
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Progress Points</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-10 border-t border-white/5">
                     <button 
                       onClick={() => {
                         setSignalDefaultMsg("HOUSE ALERT: Please update your status when possible.");
                         setIsSignalModalOpen(true);
                       }}
                       className="w-full py-4 rounded-xl nm-button text-[10px] font-black uppercase tracking-widest text-orange-500 hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
                     >
                        <MessageSquare className="w-4 h-4" /> Send Message
                     </button>
                      <button 
                        onClick={() => {
                          if (confirm("REQUEST EXTRA SUPPORT? This will let the house team know this member needs a check-in.")) {
                             supportMutation.mutate({ type: 'support' });
                          }
                        }}
                        className="w-full py-4 rounded-xl nm-button text-[10px] font-black uppercase tracking-widest text-red-500 hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                         <ShieldAlert className="w-4 h-4" /> Request Support
                      </button>
                  </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="mt-12 text-[10px] font-black uppercase tracking-[0.5rem] opacity-20 hover:opacity-100 transition-all active:scale-95 py-2"
              >
                 Close Details
              </button>
          </div>

           {/* Right Column: Member Records */}
          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                      <Activity className="w-7 h-7" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-[0.3em] leading-none mb-2">Member Details</h3>
                      <p className="text-[10px] font-black uppercase opacity-30 tracking-widest italic">House Activity Log</p>
                   </div>
                </div>

                {/* Tactical Tabs */}
                <div className="flex items-center gap-4 nm-inset-sm p-1.5 rounded-2xl">
                   <button 
                     onClick={() => setActiveTab('overview')}
                     className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'nm-button text-blue-500' : 'opacity-40'}`}
                   >
                     Overview
                   </button>
                    <button 
                      onClick={() => setActiveTab('alerts')}
                      className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'alerts' ? 'nm-button text-purple-500' : 'opacity-40'}`}
                    >
                      Messages
                    </button>
                   <button 
                     onClick={() => setActiveTab('history')}
                     className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'nm-button text-orange-500' : 'opacity-40'}`}
                   >
                     History
                   </button>
                </div>
             </div>

             <div className="space-y-20">
                {activeTab === 'overview' && (
                  <>
                    <RecoveryHeatmap completionLogs={logs} />
                    <div className="space-y-8 max-w-3xl">
                       <div className="flex items-center gap-4 mb-4 border-l-2 border-blue-500/30 pl-4">
                          <Clock className="w-4 h-4 opacity-30 text-blue-500" />
                          <h4 className="text-sm font-black uppercase tracking-widest opacity-40">Habit Progress</h4>
                       </div>
                       {logs.length === 0 ? (
                          <div className="p-12 text-center nm-inset-sm opacity-20 italic uppercase tracking-widest text-xs rounded-3xl">No habit data recorded.</div>
                       ) : (
                          <div className="space-y-4">
                             {logs.map((log) => (
                                <div key={log.id} className="p-6 rounded-3xl nm-inset-sm border border-white/5 flex flex-col gap-3 group hover:nm-inset transition-all">
                                   <div className="flex items-center justify-between">
                                      <p className="text-xs font-black uppercase tracking-wider text-blue-500">{log.quests?.title || "House Habit"}</p>
                                      <span className="text-[9px] font-black opacity-30 tabular-nums">
                                         {formatDistanceToNow(new Date(log.completed_at), { addSuffix: true })}
                                      </span>
                                   </div>
                                   <p className="text-[11px] font-bold opacity-60 leading-relaxed italic">{log.reflection_note || "Habit completed successfully."}</p>
                                   <div className="flex justify-end pt-2">
                                      <span className="text-[10px] font-black text-blue-500/40">+{log.xp_earned || 50} XP</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                  </>
                )}

                {activeTab === 'alerts' && (
                  <div className="space-y-8 max-w-3xl">
                      <div className="flex items-center gap-4 mb-4 border-l-2 border-purple-500/30 pl-4">
                          <MessageSquare className="w-4 h-4 opacity-30 text-purple-500" />
                          <h4 className="text-sm font-black uppercase tracking-widest opacity-40">Message History</h4>
                       </div>
                       {signals.length === 0 ? (
                          <div className="p-12 text-center nm-inset-sm opacity-20 italic uppercase tracking-widest text-xs rounded-3xl">No messages found.</div>
                       ) : (
                         <div className="space-y-4">
                            {signals.map((sig) => (
                               <div key={sig.id} className="p-6 rounded-3xl nm-inset-sm border border-white/5 flex flex-col gap-3">
                                  <div className="flex items-center justify-between mb-1">
                                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${sig.metadata?.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'nm-flat-xs opacity-50'}`}>
                                       {sig.type || 'ALERT'}
                                     </span>
                                     <span className="text-[9px] font-black opacity-30 tabular-nums">
                                        {formatDistanceToNow(new Date(sig.created_at), { addSuffix: true })}
                                     </span>
                                  </div>
                                  <p className="text-xs font-bold opacity-80 leading-relaxed">{sig.message}</p>
                               </div>
                            ))}
                         </div>
                      )}
                  </div>
                )}

                 {activeTab === 'history' && (
                  <div className="space-y-8 max-w-3xl">
                      <div className="flex items-center justify-between gap-4 mb-4 border-l-2 border-orange-500/30 pl-4">
                         <div className="flex items-center gap-4">
                            <ShieldAlert className="w-4 h-4 opacity-30 text-orange-500" />
                            <h4 className="text-sm font-black uppercase tracking-widest opacity-40">Activity Logs</h4>
                         </div>
                         {activity.length > 0 && (
                            <button 
                              onClick={() => {
                                if (window.confirm("DELETE ALL LOGS? This cannot be undone. Are you sure?")) {
                                  purgeAllMutation.mutate();
                                }
                              }}
                              disabled={purgeAllMutation.isPending}
                              className="px-4 py-1.5 rounded-lg nm-button text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-all flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" /> Clear Logs
                            </button>
                         )}
                      </div>
                     {activity.length === 0 ? (
                        <div className="p-12 text-center nm-inset-sm opacity-20 italic uppercase tracking-widest text-xs rounded-3xl">No registered actions recorded.</div>
                     ) : (
                        <div className="space-y-4">
                           {activity.map((act) => (
                              <div key={act.id} className="p-6 rounded-3xl nm-inset-sm border-y border-y-white/10 border-r border-r-white/10 border-l-2 border-l-orange-500/50 flex flex-col gap-3 group hover:nm-inset transition-all relative">
                                 <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                       <span className="text-[9px] font-black uppercase opacity-30 italic px-2 py-0.5 rounded-md nm-flat-xs">{act.type || 'HOUSE'}</span>
                                       <button 
                                         onClick={() => {
                                           if (window.confirm("DELETE LOG: Are you sure you want to remove this record?")) {
                                             purgeMutation.mutate(act.id);
                                           }
                                         }}
                                         disabled={purgeMutation.isPending}
                                         className="w-6 h-6 rounded-lg nm-button flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
                                       >
                                         <Trash2 className="w-3 h-3" />
                                       </button>
                                    </div>
                                    <span className="text-[9px] font-black opacity-30 tabular-nums">
                                       {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}
                                    </span>
                                 </div>
                                 <p className="text-xs font-bold opacity-80 leading-relaxed">{act.message}</p>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
                )}
             </div>
          </div>
        </MotionDiv>
      </div>

      <HouseMessageModal 
        key={isSignalModalOpen ? 'active' : 'inactive'}
        isOpen={isSignalModalOpen}
         onClose={() => setIsSignalModalOpen(false)}
         onConfirm={(message) => {
           supportMutation.mutate({ customMessage: message, type: 'alert' });
         }}
        defaultMessage={signalDefaultMsg}
      />
    </AnimatePresence>
  );
}
