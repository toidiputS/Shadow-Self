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
  ShieldMinus
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP = {
  assignment: <Zap className="text-blue-500" />,
  verification: <CheckCircle2 className="text-green-500" />,
  breach: <ShieldAlert className="text-red-500" />,
  message: <MessageSquare className="text-purple-500" />,
  alert: <AlertCircle className="text-orange-500" />
};

export default function NotificationInbox({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
    staleTime: 30000,
  });

  React.useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          queryClient.invalidateQueries(['notifications']);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, queryClient]);

  const clearMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['notifications'], []);
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
      queryClient.invalidateQueries(['notifications']);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-100"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-(--bg-color) nm-flat-lg z-110 p-8 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] border-l border-white/5"
          >
            <div className="flex items-center justify-between mb-12">
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
                className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center hover:text-red-500 transition-colors"
                title="Secure Terminal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
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
                      <motion.div 
                        key={n.id}
                        initial={{ opacity: 0, x: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ 
                           height: { duration: 0.3 },
                           opacity: { duration: 0.2 },
                           x: { type: "spring", stiffness: 300, damping: 30 }
                        }}
                        className={`p-6 rounded-4xl nm-flat group hover:nm-flat-lg transition-all relative overflow-hidden mb-6 ${!n.read ? 'border-r-4 border-blue-500/30' : ''}`}
                      >
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <Sparkles className="w-12 h-12" />
                         </div>
                         
                         <div className="flex gap-5 relative z-10">
                             <div className="w-12 h-12 shrink-0 rounded-2xl nm-inset-sm flex items-center justify-center">
                                 {ICON_MAP[n.type] || <Bell className="text-blue-500" />}
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="text-sm font-black uppercase tracking-wider leading-none">{n.title}</h3>
                                     <span className="text-[9px] font-black opacity-30 uppercase tabular-nums">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                     </span>
                                 </div>
                                 <p className="text-[11px] font-bold opacity-60 leading-relaxed mb-4">{n.message}</p>
                                 <div className="flex items-center justify-between">
                                   <button 
                                     onClick={() => markReadMutation.mutate(n.id)}
                                     className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${n.read ? 'opacity-30' : 'text-blue-500 hover:gap-4'}`}
                                   >
                                       {n.read ? 'Acknowledged' : 'View Protocol'} <ArrowRight className="w-3 h-3" />
                                   </button>
                                   {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                                 </div>
                             </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               )}
            </div>

            <div className="absolute bottom-8 left-8 right-8">
               <button 
                onClick={() => clearMutation.mutate()}
                disabled={notifications.length === 0 || clearMutation.isPending}
                className="w-full py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all disabled:opacity-10"
               >
                  {clearMutation.isPending ? 'Purging Feed...' : 'Clear All Signals'}
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

