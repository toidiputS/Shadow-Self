import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldAlert, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldMinus,
  Trash2
} from "lucide-react";

import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const MotionDiv = motion.div;

const ICON_MAP = {
  assignment: <Zap className="text-blue-500" />,
  verification: <CheckCircle2 className="text-green-500" />,
  breach: <ShieldAlert className="text-red-500" />,
  message: <MessageSquare className="text-purple-500" />,
  alert: <AlertCircle className="text-orange-500" />
};

export default function NotificationInbox({ isOpen, onClose, initialReplyId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyId, setReplyId] = React.useState(null);
  const [replyText, setReplyText] = React.useState("");

  React.useEffect(() => {
    if (isOpen && initialReplyId) {
      setReplyId(initialReplyId);
    }
  }, [isOpen, initialReplyId]);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isOpen,
    staleTime: 5000, // Reduced staleTime for better responsiveness
  });

  // Real-time subscription
  React.useEffect(() => {
    if (!isOpen || !user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, user?.id, queryClient]);

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['notifications', user?.id], []);
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    }
  });

  const deleteSingleMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    }
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ id, text }) => {
      const { error } = await supabase
        .from('notifications')
        .update({ 
           read: true,
           metadata: { 
             ...notifications.find(n => n.id === id)?.metadata,
             response: text,
             responded_at: new Date().toISOString()
           }
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
       setReplyId(null);
       setReplyText("");
       queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-100"
          />
          <MotionDiv
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-(--bg-color) nm-flat-lg z-110 p-8 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] border-l border-white/5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                  <Bell className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-widest leading-none">Protocol Inbox</h2>
                   <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-1">System Signal Feed</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center hover:text-red-500 transition-colors z-120 relative active:scale-95"
                title="Secure Terminal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-32">
               {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20 animate-pulse">
                      <ShieldMinus className="w-16 h-16 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Decrypting Signals...</p>
                  </div>
               ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20">
                      <ShieldMinus className="w-16 h-16 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Zero Active Signals</p>
                  </div>
               ) : (
                  <AnimatePresence initial={false}>
                    {notifications.map((n) => (
                      <MotionDiv 
                        key={n.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-6 rounded-4xl nm-flat group hover:nm-flat-lg transition-all relative overflow-hidden mb-6 ${!n.read ? 'border-r-4 border-blue-500/30' : ''}`}
                      >
                         <div className="absolute top-0 right-0 p-4 flex gap-2 z-40">
                              <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 deleteSingleMutation.mutate(n.id);
                               }}
                               disabled={deleteSingleMutation.isPending}
                               className={`w-8 h-8 rounded-lg nm-button flex items-center justify-center text-red-500/60 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-all active:scale-95 ${deleteSingleMutation.isPending ? 'animate-pulse opacity-20' : ''}`}
                               title="Purge Signal"
                             >
                                {deleteSingleMutation.isPending ? (
                                  <div className="w-3 h-3 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                         </div>
                         
                         <div className="flex gap-5 relative z-10">
                             <div className="w-12 h-12 shrink-0 rounded-2xl nm-inset-sm flex items-center justify-center">
                                 {ICON_MAP[n.type] || <Bell className="text-blue-500" />}
                             </div>
                             <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start mb-2 pr-12">
                                     <h3 className="text-xs font-black uppercase tracking-wider leading-none truncate">{n.title}</h3>
                                     <span className="text-[8px] font-black opacity-30 uppercase tabular-nums absolute right-4 top-14 group-hover:opacity-50 transition-opacity">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                     </span>
                                 </div>
                                 <p className="text-[11px] font-bold opacity-60 leading-relaxed mb-4">{n.message}</p>
                                 
                                 {replyId === n.id ? (
                                    <div className="mt-4 space-y-4">
                                       <textarea 
                                          autoFocus
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                          placeholder="Type your secure response..."
                                          className="w-full nm-inset-sm rounded-xl p-4 text-[11px] font-bold bg-transparent focus:outline-none min-h-[80px]"
                                       />
                                       <div className="flex gap-3">
                                          <button 
                                             onClick={() => sendReplyMutation.mutate({ id: n.id, text: replyText })}
                                             disabled={!replyText.trim() || sendReplyMutation.isPending}
                                             className="flex-1 py-3 rounded-xl nm-button text-[9px] font-black uppercase tracking-widest text-blue-500 disabled:opacity-30"
                                          >
                                             {sendReplyMutation.isPending ? 'Uplinking...' : 'Uplink Response'}
                                          </button>
                                          <button 
                                             onClick={() => setReplyId(null)}
                                             className="px-4 py-3 rounded-xl nm-button text-[9px] font-black uppercase tracking-widest opacity-50"
                                          >
                                             Cancel
                                          </button>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-between">
                                      <div className="flex gap-4">
                                           <button 
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               markReadMutation.mutate(n.id);
                                             }}
                                             disabled={n.read || markReadMutation.isPending}
                                             className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${n.read ? 'opacity-30' : 'text-blue-500 hover:gap-3'}`}
                                           >
                                               {markReadMutation.isPending ? 'Uplinking...' : n.read ? 'Acknowledged' : 'Acknowledge Signal'} {!n.read && !markReadMutation.isPending && <ArrowRight className="w-3 h-3" />}
                                           </button>
                                         {!n.read && (
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setReplyId(n.id);
                                              }}
                                              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-orange-500/80 hover:text-orange-500 transition-all active:scale-95"
                                            >
                                               Respond <MessageSquare className="w-3 h-3" />
                                            </button>
                                         )}
                                      </div>
                                      {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                                      {n.metadata?.response && (
                                         <div className="flex items-center gap-2 text-[8px] font-black uppercase opacity-20 italic">
                                            <MessageSquare className="w-2 h-2" /> Signal Replied
                                         </div>
                                      )}
                                    </div>
                                 )}
                             </div>
                         </div>
                         <Sparkles className="absolute -right-2 -bottom-2 w-16 h-16 opacity-5 pointer-events-none" />
                      </MotionDiv>
                    ))}
                  </AnimatePresence>
               )}
            </div>

            <div className="absolute bottom-8 left-8 right-8 shrink-0 bg-(--bg-color) pt-4">
               <button 
                onClick={() => clearMutation.mutate()}
                disabled={notifications.length === 0 || clearMutation.isPending}
                className="w-full py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all disabled:opacity-10"
               >
                  {clearMutation.isPending ? 'Purging Feed...' : 'Clear All Signals'}
               </button>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
}

