import React, { useState } from "react";
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
  MoreVertical,
  ChevronRight,
  ShieldQuestion,
  Search,
  CheckCircle2,
  Download,
  ArrowRight,
  Skull,
  Wifi,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const MotionDiv = motion.div;

export default function NotificationsHub() {
   const [activeTab, setActiveTab] = useState("alerts");
   const [channelTogglingId, setChannelTogglingId] = useState(null);
   const [isSyncingArchive, setIsSyncingArchive] = useState(false);
   const [syncProgress, setSyncProgress] = useState(0);
   
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
 
   const [channelStates, setChannelStates] = useState({
     'in-app': 'active',
     'email': 'active',
     'sms': 'locked',
     'sponsor': 'active',
     'leader': 'restricted'
   });

   const [channelHealth] = useState({
     'in-app': 99,
     'email': 96,
     'sms': 0,
     'sponsor': 100,
     'leader': 45
   });
 
   const triggerMutation = useMutation({
     mutationFn: async ({ type, title, message }) => {
       const { data } = await supabase.auth.getUser();
       const user = data?.user;
       if (!user) throw new Error("No active session detected.");
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          metadata: { icon: "Zap", color: "text-blue-500", priority: 'high' }
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-notifications'] });
    }
  });

  const toggleChannel = (id) => {
    setChannelTogglingId(id);
    
    // Simulate tactical uplink
    setTimeout(() => {
      setChannelStates(prev => {
        const current = prev[id];
        let next = 'active';
        if (current === 'active') next = 'restricted';
        else if (current === 'restricted') next = 'locked';
        else next = 'active';
        return { ...prev, [id]: next };
      });
      setChannelTogglingId(null);
    }, 1200);
  };

  const handleSyncArchive = () => {
    setIsSyncingArchive(true);
    setSyncProgress(10);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSyncingArchive(false);
            setSyncProgress(0);
          }, 800);
          return 100;
        }
        return prev + 8;
      });
    }, 200);
  };

  const channelsList = [
    { id: 'in-app', name: 'In-App Engine', icon: Bell },
    { id: 'email', name: 'Secure Email Relay', icon: Mail },
    { id: 'sms', name: 'Direct SMS Priority', icon: Smartphone },
    { id: 'sponsor', name: 'Sponsor Direct Ping', icon: Users },
    { id: 'leader', name: 'Leader Escalation', icon: ShieldAlert },
  ].map(c => ({ 
    ...c, 
    status: channelStates[c.id], 
    health: channelHealth[c.id] 
  }));

  const triggers = [
    { event: "Missed Protocol Quest", urgency: "High", channel: "Member + Sponsor", escalation: "Leader T+4h", type: 'assignment' },
    { event: "Missed Protocol Chain", urgency: "Critical", channel: "Sponsor + Leader", escalation: "Admin T+2h", type: 'breach' },
    { event: "Sponsor Review Needed", urgency: "Medium", channel: "Sponsor Direct", escalation: "Leader T+12h", type: 'message' },
    { event: "Protocol Breach Flagged", urgency: "Critical", channel: "All Channels", escalation: "Immediate Admin", type: 'breach' },
    { event: "Grace Day Activation", urgency: "Warning", channel: "In-App + Log", escalation: "Sponsor Summary", type: 'alert' },
  ];

  const tabs = [
    { id: "alerts", name: "Triggers", icon: Zap },
    { id: "escalation", name: "Rules", icon: ShieldAlert },
    { id: "health", name: "Health", icon: Activity },
    { id: "log", name: "Signal Log", icon: FileText },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: 'Signal Output', value: recentSignals.length, sub: 'Total Logged', color: 'text-blue-500' },
           { label: 'Actionable Delta', value: recentSignals.filter(s => !s.read).length, sub: 'Pending Review', color: 'text-orange-500' },
           { label: 'Uptime Matrix', value: '99.9%', sub: 'Decentralized Live', color: 'text-green-500' },
           { label: 'Pulse Channels', value: `${channelsList.filter(c => c.status === 'active').length}/5`, sub: 'Routing Active', color: 'text-purple-500' },
         ].map((stat, i) => (
           <div key={i} className="p-8 rounded-4xl nm-inset-sm border border-white/5 bg-white/1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                 <p className={`text-3xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
                 <span className="text-[9px] font-black uppercase opacity-20 italic">{stat.sub}</span>
              </div>
           </div>
         ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-3">
           <div className="p-2 rounded-[2.5rem] nm-inset-sm space-y-2 border border-white/5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-6 py-5 rounded-4xl transition-all duration-300 ${isActive ? 'nm-button text-blue-500 scale-[1.02]' : 'text-(--text-secondary) opacity-30 hover:opacity-100'}`}
                  >
                    <div className="flex items-center gap-4">
                       <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
           </div>

           <div className="p-8 rounded-[2.5rem] nm-flat border border-white/5 bg-white/1">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-4">Instance Security</p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase opacity-60">Status</span>
                    <span className="text-[10px) font-black uppercase text-green-500">Normal</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase opacity-60">Auth Level</span>
                    <span className="text-[10px) font-black uppercase text-blue-500">Root Node</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10 rounded-[3.5rem] nm-flat border border-white/5 bg-white/1 overflow-hidden min-h-[600px]">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {activeTab === "alerts" && (
                <div className="space-y-12 h-full flex flex-col">
                  <div>
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Protocol Triggers</h3>
                     <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] italic">Tactical Signal Escalation Architect</p>
                  </div>

                  <div className="flex-1 rounded-[2.5rem] nm-inset border border-white/5 overflow-hidden flex flex-col">
                     <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="border-b border-white/5 bg-black/10">
                                 <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Tactical Event Node</th>
                                 <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Matrix Priority</th>
                                 <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Escalation Delta</th>
                                 <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Command</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 font-black uppercase tracking-tighter text-[11px] opacity-80">
                              {triggers.map((trigger, i) => (
                                <tr key={i} className="group hover:bg-blue-500/3 transition-colors relative overflow-hidden">
                                   <td className="p-8">
                                      <p className="text-sm font-black italic tracking-tighter text-(--text-primary) mb-1 group-hover:text-blue-500 transition-colors">{trigger.event}</p>
                                      <p className="text-[9px] opacity-30 font-black tracking-widest flex items-center gap-2">
                                         <ArrowRight className="w-3 h-3 text-blue-500" /> {trigger.channel}
                                      </p>
                                   </td>
                                   <td className="p-8">
                                      <span className={`px-4 py-1.5 rounded-full nm-inset-xs text-[9px] ${trigger.urgency === 'Critical' ? 'text-red-500' : trigger.urgency === 'High' ? 'text-orange-500' : 'text-blue-500'}`}>
                                        {trigger.urgency}
                                      </span>
                                   </td>
                                   <td className="p-8 text-[10px] opacity-20 italic">{trigger.escalation}</td>
                                   <td className="p-8 text-right">
                                      <button 
                                        onClick={() => triggerMutation.mutate({ 
                                          type: trigger.type, 
                                          title: trigger.event, 
                                          message: `Manual protocol signal fired for investigation.` 
                                        })}
                                        disabled={triggerMutation.isPending}
                                        className="px-5 py-3 rounded-2xl nm-button text-[10px] hover:text-blue-500 transition-all active:nm-inset-sm disabled:opacity-20"
                                      >
                                         {triggerMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Fire Signal'}
                                      </button>
                                   </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === "health" && (
                <div className="space-y-12 flex-1">
                  <div>
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Matrix Health</h3>
                     <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] italic">Real-time Node Pulse Audit</p>
                  </div>

                  <div className="grid gap-6">
                     {channelsList.map((channel) => (
                        <div key={channel.id} className="p-10 rounded-[3rem] nm-flat border border-white/5 relative overflow-hidden group hover:nm-flat-lg transition-all">
                           <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-6">
                                 <div className={`w-16 h-16 rounded-4xl nm-inset-sm flex items-center justify-center transition-all ${channel.status === 'locked' ? 'grayscale opacity-20' : 'text-blue-500'}`}>
                                    <channel.icon className="w-8 h-8" />
                                 </div>
                                 <div>
                                    <h4 className="text-lg font-black uppercase tracking-widest">{channel.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                       <span className={`w-2 h-2 rounded-full ${channel.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                       <span className="text-[9px] font-black uppercase tracking-widest opacity-40">PROTOCOL: {channel.status}</span>
                                    </div>
                                 </div>
                              </div>
                              
                              <button 
                                onClick={() => toggleChannel(channel.id)}
                                disabled={channelTogglingId === channel.id}
                                className={`px-6 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest transition-all ${channelTogglingId === channel.id ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
                              >
                                 {channelTogglingId === channel.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                                 ) : channel.status === 'active' ? (
                                    'Restrict Node'
                                 ) : (
                                    'Uplink Node'
                                 )}
                              </button>
                           </div>

                           <div className="flex items-center gap-10">
                              <div className="flex-1">
                                 <div className="flex justify-between items-center mb-3 text-[9px] font-black uppercase tracking-widest opacity-30">
                                    <span>Signal Integrity</span>
                                    <span className="tabular-nums">{channel.health}%</span>
                                 </div>
                                 <div className="h-2 w-full nm-inset-sm rounded-full overflow-hidden">
                                    <MotionDiv 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${channel.health}%` }}
                                       className={`h-full ${channel.health > 80 ? 'bg-blue-500' : 'bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`}
                                    />
                                 </div>
                              </div>
                              <div className="w-32 text-right">
                                 <p className="text-4xl font-black italic tracking-tighter text-(--text-primary) opacity-90">{channel.health}%</p>
                                 <p className="text-[8px] font-black uppercase tracking-widest opacity-20">Stability Pulse</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              )}

              {activeTab === "log" && (
                <div className="space-y-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Signal Ledger</h3>
                        <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] italic">Historical Transaction Log</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                           <input 
                             type="text" 
                             placeholder="PROBE LEDGER..." 
                             className="pl-12 pr-6 py-4 rounded-2xl nm-inset-sm bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-none placeholder:opacity-10 w-64"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto pr-4 custom-scrollbar">
                     {isLoadingSignals ? (
                        <div className="py-40 text-center opacity-20 animate-pulse uppercase tracking-[0.4rem] font-black text-xs italic">Decrypting Transmission Ledger...</div>
                     ) : (
                        recentSignals.map((sig) => (
                           <MotionDiv
                             key={sig.id}
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             className="p-6 rounded-4xl nm-inset-sm border border-white/5 flex items-center justify-between hover:nm-flat transition-all group hover:scale-[1.01]"
                           >
                              <div className="flex items-center gap-8 flex-1">
                                 <div className={`w-3 h-3 rounded-full ${sig.read ? 'bg-green-500' : 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
                                 <div className="flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">{sig.type || 'SYSTEM'}</p>
                                    <p className="text-sm font-black italic tracking-tighter opacity-80 group-hover:opacity-100 transition-all">{sig.title}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-12">
                                 <div className="text-right">
                                    <p className="text-[10px] font-black opacity-40 uppercase tabular-nums">{formatDistanceToNow(new Date(sig.created_at), { addSuffix: true })}</p>
                                    <p className="text-[8px] font-black opacity-10 tracking-widest uppercase">RX Node: {sig.id.substring(0, 4)}</p>
                                 </div>
                                 <button 
                                   onClick={() => alert("TACTICAL DEBRIEF: This channel is currently synchronized with the Shadow Self core. All outgoing transmission pulses are logged and audited in real-time.")}
                                   className="w-10 h-10 rounded-xl nm-button flex items-center justify-center opacity-40 hover:opacity-100 transition-all text-blue-500 active:scale-90"
                                   title="Tactical Info"
                                 >
                                    <ShieldQuestion className="w-4 h-4" />
                                 </button>
                              </div>
                           </MotionDiv>
                        ))
                     )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                     <button 
                       onClick={handleSyncArchive}
                       disabled={isSyncingArchive}
                       className="px-10 py-5 rounded-3xl nm-button text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 flex items-center gap-4 hover:scale-105 transition-all active:nm-inset-sm disabled:opacity-50"
                     >
                        {isSyncingArchive ? (
                           <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Synchronizing Decrypted Data... {syncProgress}%
                           </>
                        ) : (
                           <>
                              <Download className="w-4 h-4" />
                              Fetch Archival Intelligence (90D+)
                           </>
                        )}
                     </button>
                     <div className="text-right flex items-center gap-4 opacity-10">
                        <Lock className="w-3 h-3" />
                        <p className="text-[9px] font-black uppercase tracking-[0.5rem]">Decryption Path Locked</p>
                     </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'escalation' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                         { title: 'Protocol Deviation', trigger: 'Immediate', action: 'Institutional Redact', icon: <Skull className="w-5 h-5 text-red-500" /> },
                         { title: 'Resource Exhaustion', trigger: '80% Threshold', action: 'Auto-Scaling RFP', icon: <Zap className="w-5 h-5 text-yellow-500" /> },
                         { title: 'Node Interaction Lack', trigger: '48h Inactive', action: 'Signal Ping', icon: <Wifi className="w-5 h-5 text-blue-500" /> },
                         { title: 'Billing Discontinuity', trigger: 'Grace Expiry', action: 'Service Hibernation', icon: <Lock className="w-5 h-5 text-orange-500" /> }
                      ].map((rule) => (
                         <div key={rule.title} className="p-6 rounded-4xl nm-inset-sm border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                               <div className="w-10 h-10 rounded-2xl nm-button flex items-center justify-center">
                                  {rule.icon}
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 px-3 py-1 rounded-full nm-flat-xs">Active</span>
                            </div>
                            <div>
                               <h4 className="text-sm font-black italic uppercase tracking-tight">{rule.title}</h4>
                               <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] font-bold opacity-30 uppercase">Trigger:</span>
                                  <span className="text-[10px] font-black text-white/80">{rule.trigger}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold opacity-30 uppercase">Action:</span>
                                  <span className="text-[10px] font-black text-orange-500">{rule.action}</span>
                               </div>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex gap-2">
                               <button className="flex-1 py-3 rounded-2xl nm-button text-[9px] font-black uppercase hover:text-red-500 transition-all active:scale-95">Purge</button>
                               <button className="flex-1 py-3 rounded-2xl nm-button text-[9px] font-black uppercase hover:text-blue-500 transition-all active:scale-95">Edit</button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {!['alerts', 'health', 'log', 'escalation'].includes(activeTab) && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20">
                   <ShieldAlert className="w-16 h-16 mb-8" />
                   <p className="text-xl font-black uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed">
                      Protocol Section Under Construction.
                   </p>
                </div>
              )}
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
