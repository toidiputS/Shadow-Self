import React from "react";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Users, 
  AlertTriangle, 
  Zap, 
  Clock, 
  ShieldAlert, 
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  Settings2,
  User,
  ShieldCheck,
  Moon,
  VolumeX,
  Volume2,
  FileText,
  BarChart3,
  Heart,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const MotionDiv = motion.div;

export default function NotificationsHub() {
  const [activeTab, setActiveTab] = React.useState("alerts");
  const [activeOverride, setActiveOverride] = React.useState("none");
  const queryClient = useQueryClient();

  const { data: recentSignals = [], isLoading: isLoadingSignals } = useQuery({
    queryKey: ['system-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 10000,
  });

  React.useEffect(() => {
    const channel = supabase
      .channel('system-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          queryClient.invalidateQueries(['system-notifications']);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const triggerMutation = useMutation({
    mutationFn: async ({ type, title, message }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          metadata: { icon: "Zap", color: "text-blue-500" }
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['system-notifications']);
      queryClient.invalidateQueries(['notifications']); // Also invalidate user-facing ones
    }
  });

  const channels = [
    { id: 'in-app', name: 'In-App Engine', status: 'active', icon: Bell, health: 100 },
    { id: 'email', name: 'Secure Email Relay', status: 'active', icon: Mail, health: 98 },
    { id: 'sms', name: 'Direct SMS Priority', status: 'locked', icon: Smartphone, health: 0 },
    { id: 'sponsor', name: 'Sponsor Direct Ping', status: 'active', icon: Users, health: 100 },
    { id: 'leader', name: 'Leader Escalation', status: 'restricted', icon: ShieldAlert, health: 100 },
  ];

  const triggers = [
    { event: "Missed Protocol Quest", urgency: "High", channel: "Member + Sponsor", escalation: "Leader T+4h", type: 'assignment' },
    { event: "Missed Protocol Chain", urgency: "Critical", channel: "Sponsor + Leader", escalation: "Admin T+2h", type: 'breach' },
    { event: "Sponsor Review Needed", urgency: "Medium", channel: "Sponsor Direct", escalation: "Leader T+12h", type: 'message' },
    { event: "Protocol Breach Flagged", urgency: "Critical", channel: "All Channels", escalation: "Immediate Admin", type: 'breach' },
    { event: "Grace Day Activation", urgency: "Warning", channel: "In-App + Log", escalation: "Sponsor Summary", type: 'alert' },
  ];

   const tabs = [
     { id: "alerts", name: "Alerts & Triggers", icon: Zap },
     { id: "escalation", name: "Escalation Rules", icon: ShieldAlert },
     { id: "health", name: "Channel Health", icon: Activity },
     { id: "log", name: "Delivery Log", icon: FileText },
   ];

  return (
    <div className="space-y-8 py-4">
      {/* Dynamic Signal Counter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Transmissions', value: recentSignals.length, color: 'text-blue-500' },
           { label: 'Unread Status', value: recentSignals.filter(s => !s.read).length, color: 'text-orange-500' },
           { label: 'Uptime Stability', value: '99.9%', color: 'text-green-500' },
           { label: 'Active Channels', value: channels.filter(c => c.status === 'active').length + '/5', color: 'text-purple-500' },
         ].map((stat, i) => (
           <div key={i} className="p-4 rounded-2xl nm-inset-sm">
              <p className="text-[8px] font-black uppercase opacity-30 tracking-widest leading-none mb-2">{stat.label}</p>
              <p className={`text-xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
           </div>
         ))}
      </div>

      {/* Tabs Header */}
      <div className="flex gap-2 p-2 rounded-4xl nm-inset-sm overflow-x-auto no-scrollbar">
         {tabs.map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`
                 flex items-center gap-3 px-6 py-4 rounded-3xl transition-all duration-500 whitespace-nowrap
                 ${isActive 
                   ? 'nm-button text-blue-500 shadow-[inset_0_2px_10px_rgba(59,130,246,0.1)]' 
                   : 'text-(--text-secondary) opacity-40 hover:opacity-100 hover:text-blue-400'
                 }
               `}
             >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none pt-0.5">{tab.name}</span>
             </button>
           );
         })}
      </div>

      <AnimatePresence mode="wait">
        <MotionDiv
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3 }}
        >
          {/* Alerts & Triggers Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-8">
              <section className="space-y-6">
                <div className="flex items-center justify-between ml-2">
                   <div className="flex items-center gap-3 opacity-60">
                      <Zap className="w-4 h-4" />
                      <h3 className="text-xs font-black uppercase tracking-widest leading-none">Intelligence Triggers</h3>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-lg text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/10">
                      Matrix Core Live
                   </div>
                </div>
                <div className="rounded-4xl nm-inset border border-white/5 overflow-hidden">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-white/5 bg-black/5">
                            <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">System Event Node</th>
                            <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Urgency</th>
                            <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Escalation</th>
                            <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-black uppercase tracking-tighter text-[10px]">
                         {triggers.map((trigger, i) => (
                           <tr key={i} className="group hover:bg-white/5 transition-colors">
                              <td className="p-6">
                                 <p className="text-(--text-primary)">{trigger.event}</p>
                                 <p className="text-[8px] opacity-20 font-black tracking-widest mt-1">Route: {trigger.channel}</p>
                              </td>
                              <td className="p-6 italic">
                                 <span className={`px-2 py-1 rounded-lg nm-inset-sm ${trigger.urgency === 'Critical' ? 'text-red-500' : trigger.urgency === 'High' ? 'text-orange-500' : trigger.urgency === 'Warning' ? 'text-yellow-500' : 'text-blue-500'}`}>
                                   {trigger.urgency}
                                 </span>
                              </td>
                              <td className="p-6 opacity-20 italic font-medium">{trigger.escalation}</td>
                              <td className="p-6 text-right">
                                 <button 
                                   onClick={() => triggerMutation.mutate({ 
                                     type: trigger.type, 
                                     title: `Trigger: ${trigger.event}`, 
                                     message: `Simulated ${trigger.urgency} event detected by manual administrator override.` 
                                   })}
                                   disabled={triggerMutation.isPending}
                                   className="px-4 py-2 rounded-xl nm-button text-[9px] hover:text-blue-500 transition-colors disabled:opacity-20"
                                 >
                                    {triggerMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin mx-auto" /> : 'Fire Signal'}
                                 </button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3 ml-2 opacity-60">
                    <Smartphone className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-widest leading-none">Channel Dispatch Controls</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {channels.map(channel => (
                      <div key={channel.id} className={`p-5 rounded-3xl nm-button flex flex-col gap-4 group transition-all ${channel.status === 'locked' ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:nm-flat'}`}>
                         <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center ${channel.status === 'active' ? 'text-blue-500' : 'text-(--text-secondary)'}`}>
                               <channel.icon className="w-5 h-5" />
                            </div>
                            <div className={`w-4 h-4 rounded-full nm-inset-sm flex items-center justify-center ${channel.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${channel.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            </div>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">{channel.name}</p>
                            <p className="text-[8px] opacity-40 uppercase font-black tracking-tighter italic">Status: {channel.status}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>
            </div>
          )}

          {/* Escalation Rules Tab */}
          {activeTab === "escalation" && (
            <div className="space-y-8">
              <section className="space-y-6">
                 <div className="flex items-center gap-3 ml-2 opacity-60">
                    <ShieldAlert className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-widest leading-none">Escalation Ladder</h3>
                 </div>
                 <div className="p-10 rounded-4xl nm-flat-lg relative overflow-hidden bg-linear-to-br from-transparent to-(--border-color)/5">
                    <div className="absolute top-1/2 left-20 right-20 h-0.5 bg-(--border-color) -translate-y-1/2 opacity-10" />
                    <div className="flex justify-between items-center relative z-10">
                       {[
                         { id: 1, label: 'Resident', sub: 'T+0 Base Hub', icon: User, color: 'text-blue-500' },
                         { id: 2, label: 'Sponsor', sub: 'T+30-2h Ping', icon: Users, color: 'text-orange-500' },
                         { id: 3, label: 'Leader', sub: 'T+12h Breach', icon: ShieldCheck, color: 'text-red-500' },
                         { id: 4, label: 'Admin Hub', sub: 'T+24h Lockdown', icon: Settings2, color: 'text-purple-600' },
                       ].map((step, i) => (
                         <div key={i} className="flex flex-col items-center gap-4 group">
                           <div className={`w-18 h-18 rounded-4xl nm-button flex items-center justify-center ${step.color} group-hover:nm-flat transition-all group-hover:-translate-y-2`}>
                              <step.icon className="w-8 h-8" />
                           </div>
                           <div className="text-center">
                              <p className="text-xs font-black uppercase tracking-widest">{step.label}</p>
                              <p className="text-[8px] opacity-30 font-black uppercase tracking-tighter mt-1">{step.sub}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <section className="space-y-6">
                    <div className="flex items-center gap-3 ml-2 opacity-60">
                       <VolumeX className="w-4 h-4" />
                       <h3 className="text-xs font-black uppercase tracking-widest leading-none">Override Protocol Center</h3>
                    </div>
                    <div className="p-8 rounded-4xl nm-flat border border-red-500/5 grid gap-4">
                       {[
                         { id: 'none', name: 'Standard Path', desc: 'No active overrides', icon: Volume2 },
                         { id: 'critical', name: 'Mute Non-Critical', desc: 'High/Critical only', icon: VolumeX },
                         { id: 'sponsor', name: 'Sponsor-Only', desc: 'Vested routing focus', icon: Users },
                         { id: 'breach', name: 'Breach-Only', desc: 'Emergency stabilization', icon: AlertTriangle },
                       ].map(opt => (
                         <button 
                           key={opt.id}
                           onClick={() => setActiveOverride(opt.id)}
                           className={`p-5 rounded-3xl transition-all flex items-center gap-5 ${activeOverride === opt.id ? 'nm-inset-sm border border-red-500/20 bg-red-500/5' : 'nm-flat border border-transparent'}`}
                         >
                            <div className={`w-10 h-10 rounded-xl nm-button flex items-center justify-center ${activeOverride === opt.id ? 'text-red-500' : 'opacity-40'}`}>
                               <opt.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                               <p className={`text-[10px] font-black uppercase tracking-widest ${activeOverride === opt.id ? 'text-red-500' : 'opacity-80'}`}>{opt.name}</p>
                               <p className="text-[8px] opacity-30 mt-1 font-bold uppercase tracking-tight italic">{opt.desc}</p>
                            </div>
                         </button>
                       ))}
                    </div>
                 </section>

                 <section className="space-y-6">
                    <div className="flex items-center gap-3 ml-2 opacity-60">
                       <Moon className="w-4 h-4" />
                       <h3 className="text-xs font-black uppercase tracking-widest leading-none">Quiet Hours & Bypass</h3>
                    </div>
                    <div className="p-8 rounded-4xl nm-inset-sm border border-blue-500/5 h-full space-y-8 flex flex-col justify-center">
                       <div className="flex items-center justify-between px-6 py-4 rounded-3xl nm-button bg-blue-500/5">
                          <div className="flex items-center gap-4">
                             <Moon className="w-5 h-5 text-blue-500" />
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Active Window</p>
                                <p className="text-lg font-black tabular-nums tracking-tighter italic">22:00 — 06:00</p>
                             </div>
                          </div>
                          <div className="w-12 h-6 rounded-full nm-inset-sm p-1 flex items-center">
                             <div className="w-4 h-4 rounded-full bg-blue-500 translate-x-6" />
                          </div>
                       </div>
                       
                       <div className="p-6 rounded-3xl border border-orange-500/20 bg-orange-500/5">
                          <div className="flex items-center gap-4 mb-3">
                             <AlertTriangle className="w-5 h-5 text-orange-500" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Emergency Protocol Bypass</p>
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-tighter opacity-60 leading-relaxed italic">
                             All "Critical" and "Protocol Breach" alerts bypass inactive windows and mutes automatically.
                          </p>
                       </div>
                    </div>
                 </section>
              </div>
            </div>
          )}

          {/* Channel Health Tab */}
          {activeTab === "health" && (
            <div className="space-y-8">
              <section className="space-y-6">
                 <div className="flex items-center gap-3 ml-2 opacity-60">
                    <BarChart3 className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-widest leading-none">Channel Operational Health</h3>
                 </div>
                 <div className="grid gap-4">
                    {channels.map((channel, i) => (
                      <div key={i} className="p-8 rounded-4xl nm-flat group hover:nm-flat transition-all border border-white/5">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-5">
                               <div className={`w-14 h-14 rounded-2xl nm-inset flex items-center justify-center transition-colors ${channel.health > 80 ? 'text-blue-500' : 'text-red-400 opacity-40'}`}>
                                  <channel.icon className="w-8 h-8" />
                               </div>
                               <div>
                                  <p className="text-sm font-black uppercase tracking-widest">{channel.name}</p>
                                  <p className="text-[9px] opacity-40 uppercase font-black tracking-tighter mt-1 italic">Last Node Pulse: 1s ago</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className={`text-4xl font-black italic tracking-tighter leading-none ${channel.health > 80 ? 'text-green-500' : 'text-red-500 opacity-20'}`}>{channel.health}%</p>
                               <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-2 opacity-20">Uptime Stability</p>
                            </div>
                         </div>
                         <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden nm-inset-sm">
                            <MotionDiv 
                               initial={{ width: 0 }}
                               animate={{ width: `${channel.health}%` }}
                               className={`h-full ${channel.health > 80 ? 'bg-blue-500' : 'bg-red-500/20'}`}
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </section>
            </div>
          )}

          {/* Delivery Log Tab */}
          {activeTab === "log" && (
            <div className="space-y-6">
               <div className="flex items-center justify-between ml-2">
                  <div className="flex items-center gap-3 opacity-60">
                     <Activity className="w-4 h-4" />
                     <h3 className="text-xs font-black uppercase tracking-widest leading-none">Transmission Intelligence Ledger</h3>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">
                     Retaining last 20 system alerts
                  </div>
               </div>
               <div className="space-y-3">
                  {isLoadingSignals ? (
                    <div className="py-20 opacity-20 animate-pulse text-center uppercase tracking-widest text-xs font-black">Decrypting Ledger...</div>
                  ) : recentSignals.length === 0 ? (
                    <div className="py-20 opacity-20 text-center uppercase tracking-widest text-xs font-black">No Signals Logged</div>
                  ) : (
                    <AnimatePresence initial={false}>
                       {recentSignals.map((log) => (
                         <motion.div 
                           key={log.id}
                           initial={{ opacity: 0, x: -10, height: 0 }}
                           animate={{ opacity: 1, x: 0, height: 'auto' }}
                           exit={{ opacity: 0, x: 10, height: 0 }}
                           className="p-5 rounded-3xl nm-inset-sm flex items-center justify-between text-[11px] font-black uppercase tracking-tight group hover:nm-inset transition-all border border-white/5 mb-3"
                         >
                            <div className="flex items-center gap-8 flex-1">
                               <span className="opacity-20 tabular-nums w-20">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                               <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${log.read ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                                  <span className="text-(--text-primary) italic opacity-80">{log.title}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-8">
                               <div className="flex items-center gap-3 opacity-30 italic">
                                  <span className="px-3 py-1 rounded bg-black/5 border border-white/5">{log.type}</span>
                                  <span>Resident {log.user_id.substring(0, 4)}</span>
                               </div>
                               <div className={`flex items-center gap-3 w-28 justify-end text-blue-400`}>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Delivered</span>
                               </div>
                               <button className="p-2 opacity-20 hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                               </button>
                            </div>
                         </motion.div>
                       ))}
                    </AnimatePresence>
                  )}
               </div>
               <button className="w-full py-6 rounded-4xl nm-button text-[10px] font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all mt-8 border border-white/5">
                  Fetch Archival Sync Data (90D+)
               </button>
            </div>
          )}
        </MotionDiv>
      </AnimatePresence>
    </div>
  );
}
