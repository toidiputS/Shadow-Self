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
  Lock,
  Plus,
  Compass,
  Palette
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
 
   React.useEffect(() => {
     const handleThemeUpdate = () => {
       // Force re-render to pick up new CSS variables if needed, 
       // though typically CSS variables update automatically in the DOM.
       // This ensures any JS-driven styles tied to the theme are refreshed.
       setActiveTab(prev => prev); 
     };
     window.addEventListener('shadow_theme_update', handleThemeUpdate);
     return () => window.removeEventListener('shadow_theme_update', handleThemeUpdate);
   }, []);
 
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

   const [channelHealth, setChannelHealth] = useState({
     'in-app': 99,
     'email': 96,
     'sms': 0,
     'sponsor': 100,
     'leader': 45
   });

   const [guidanceProtocols, setGuidanceProtocols] = useState([
      { id: 1, title: 'Missed Habit', trigger: 'Immediate', action: 'Notify Recovery Team', icon: 'Compass', color: 'text-red-500' },
      { id: 2, title: 'Low Activity', trigger: '80% Threshold', action: 'Send Wellness Nudge', icon: 'Zap', color: 'text-yellow-500' },
      { id: 3, title: 'Inactive User', trigger: '48h Inactive', action: 'Wellness Check-in', icon: 'Wifi', color: 'text-blue-500' },
      { id: 4, title: 'House Fee Issue', trigger: 'Grace Expiry', action: 'Guidance Required', icon: 'Lock', color: 'text-orange-500' }
   ]);

   const handlePurgeProtocol = (id) => {
      if (confirm("Delete Protocol: Are you sure you want to remove this guidance rule?")) {
         setGuidanceProtocols(prev => prev.filter(r => r.id !== id));
      }
   };

   const handleEditProtocol = (rule) => {
      const newAction = prompt(`Action for [${rule.title.toUpperCase()}]:`, rule.action);
      if (newAction) {
         setGuidanceProtocols(prev => prev.map(r => r.id === rule.id ? { ...r, action: newAction } : r));
      }
   };

   const iconMap = {
      Skull: <Skull className="w-5 h-5 text-red-500" />,
      Zap: <Zap className="w-5 h-5 text-yellow-500" />,
      Wifi: <Wifi className="w-5 h-5 text-blue-500" />,
      Lock: <Lock className="w-5 h-5 text-orange-500" />,
      Compass: <Compass className="w-5 h-5 text-red-500" />
   };

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
    
    // Simulate update
    setTimeout(() => {
      setChannelStates(prev => {
        const current = prev[id];
        let next = 'active';
        if (current === 'active') next = 'restricted';
        else if (current === 'restricted') next = 'locked';
        else next = 'active';
        
        // Dynamically update health based on the new status
        setChannelHealth(h => ({
          ...h,
          [id]: next === 'active' ? (90 + Math.floor(Math.random() * 10)) : 
                next === 'restricted' ? (30 + Math.floor(Math.random() * 20)) : 0
        }));

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
    { id: 'in-app', name: 'In-App Alerts', icon: Bell },
    { id: 'email', name: 'Email Notifications', icon: Mail },
    { id: 'sms', name: 'SMS Alerts', icon: Smartphone },
    { id: 'sponsor', name: 'Sponsor Dashboard', icon: Users },
    { id: 'leader', name: 'Manager Alerts', icon: ShieldAlert },
  ].map(c => ({ 
    ...c, 
    status: channelStates[c.id], 
    health: channelHealth[c.id] 
  }));

  const triggers = [
    { event: "Missed Check-in", urgency: "High", channel: "Member + Sponsor", followUp: "Support T+4h", type: 'assignment' },
    { event: "Habit Streak Broken", urgency: "Critical", channel: "Sponsor + Recovery Team", followUp: "Guidance T+2h", type: 'breach' },
    { event: "Sponsor Review Needed", urgency: "Medium", channel: "Support Portal", followUp: "Team T+12h", type: 'message' },
    { event: "Wellness Concern", urgency: "Critical", channel: "All Channels", followUp: "Immediate Support", type: 'breach' },
    { event: "Grace Period Active", urgency: "Warning", channel: "In-App + Log", followUp: "Sponsor Summary", type: 'alert' },
  ];

  const tabs = [
    { id: "alerts", name: "Triggers", icon: Zap },
    { id: "protocols", name: "Protocols", icon: ShieldAlert },
    { id: "health", name: "Status", icon: Activity },
    { id: "log", name: "History", icon: FileText },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Sent', value: recentSignals.length, sub: 'All Notifications', color: 'text-blue-500' },
           { label: 'Unread', value: recentSignals.filter(s => !s.read).length, sub: 'Pending Review', color: 'text-orange-500' },
           { label: 'System Uptime', value: '99.9%', sub: 'Healthy', color: 'text-green-500' },
           { label: 'Active Channels', value: `${channelsList.filter(c => c.status === 'active').length}/5`, sub: 'Routing Alerts', color: 'text-purple-500' },
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

      <div className="flex flex-col gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full shrink-0 flex flex-col md:flex-row gap-6 items-stretch">
           <div className="flex-1 p-2 rounded-[2.5rem] nm-inset-sm flex flex-col sm:flex-row gap-2 border border-white/5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center sm:justify-between px-6 py-5 rounded-4xl transition-all duration-300 ${isActive ? 'nm-button text-blue-500 scale-[1.02]' : 'text-(--text-secondary) opacity-30 hover:opacity-100'}`}
                  >
                    <div className="flex items-center gap-4">
                       <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 hidden sm:block" />}
                  </button>
                );
              })}
           </div>

           <div className="w-full md:w-72 p-8 rounded-[2.5rem] nm-flat border border-white/5 bg-white/1 flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-4">Admin Status</p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase opacity-60">Status</span>
                    <span className="text-[10px] font-black uppercase text-green-500">All Good</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase opacity-60">Access</span>
                    <span className="text-[10px] font-black uppercase text-blue-500">Full Admin</span>
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
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Automatic Alerts</h3>
                      <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] italic">Manage automatic message rules for the house</p>
                   </div>

                  <div className="flex-1 rounded-[2.5rem] nm-inset border border-white/5 overflow-hidden flex flex-col">
                     <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                           <thead>
                               <tr className="border-b border-white/5 bg-black/10">
                                 <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Event Name</th>
                                 <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Priority</th>
                                 <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Follow-up</th>
                                 <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Action</th>
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
                                   <td className="p-8 text-[10px] opacity-20 italic">{trigger.followUp}</td>
                                   <td className="p-8 text-right">
                                      <button 
                                        onClick={() => triggerMutation.mutate({ 
                                          type: trigger.type, 
                                          title: trigger.event, 
                                          message: `Manual test notification sent.` 
                                        })}
                                        disabled={triggerMutation.isLoading}
                                        className="px-5 py-3 rounded-2xl nm-button text-[10px] hover:text-blue-500 transition-all active:nm-inset-sm disabled:opacity-20"
                                      >
                                         {triggerMutation.isLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Send Test'}
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
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Message Channels</h3>
                      <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] italic">Check if house alerts are functional</p>
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
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">STATUS: {channel.status}</span>
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
                                    'Disable Channel'
                                 ) : (
                                    'Enable Channel'
                                 )}
                              </button>
                           </div>

                           <div className="flex items-center gap-10">
                              <div className="flex-1">
                                 <div className="flex justify-between items-center mb-3 text-[9px] font-black uppercase tracking-widest opacity-30">
                                    <span>Signal Reliability</span>
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
                                 <p className="text-[8px] font-black uppercase tracking-widest opacity-20">Channel Health</p>
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
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Message History</h3>
                        <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] italic">Log of all house alerts and messages</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                           <input 
                             type="text" 
                             placeholder="Search history..." 
                             className="pl-12 pr-6 py-4 rounded-2xl nm-inset-sm bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-none placeholder:opacity-10 w-64"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto pr-4 custom-scrollbar">
                     {isLoadingSignals ? (
                        <div className="py-40 text-center opacity-20 animate-pulse uppercase tracking-[0.4rem] font-black text-xs italic">Loading notification history...</div>
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
                                   onClick={() => alert("Notification History: All alerts sent to users are logged here for review. This helps ensure everyone is getting the support they need.")}
                                   className="w-10 h-10 rounded-xl nm-button flex items-center justify-center opacity-40 hover:opacity-100 transition-all text-blue-500 active:scale-90"
                                   title="Information"
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
                              Loading old messages... {syncProgress}%
                           </>
                        ) : (
                           <>
                              <Download className="w-4 h-4" />
                              Load Older History
                           </>
                        )}
                     </button>
                     <div className="text-right flex items-center gap-4 opacity-10">
                        <Lock className="w-3 h-3" />
                        <p className="text-[9px] font-black uppercase tracking-[0.5rem]">Encrypted</p>
                     </div>
                  </div>
                </div>
              )}
              
               {activeTab === 'protocols' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                   <div className="flex items-center justify-between mb-2">
                       <div>
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Guidance Protocols</h3>
                          <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] italic">Support responses for missed check-ins or habits</p>
                       </div>
                       <button 
                         onClick={() => alert("Notice: New protocols must be approved by the recovery team. Please contact technical support for custom deployment.")}
                         className="px-6 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                       >
                          <Plus className="w-4 h-4 text-blue-500" /> New Protocol
                       </button>
                   </div>
                   
                   {guidanceProtocols.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20">
                         <ShieldCheck className="w-16 h-16 mb-8 text-green-500" />
                         <p className="text-xl font-black uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed">
                            All protocols are currently disabled.
                         </p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar">
                         {guidanceProtocols.map((rule) => (
                            <div key={rule.id} className="p-6 rounded-4xl nm-inset-sm border border-white/5 space-y-4 group">
                               <div className="flex items-center justify-between">
                                  <div className="w-10 h-10 rounded-2xl nm-button flex items-center justify-center">
                                     {iconMap[rule.icon]}
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 px-3 py-1 rounded-full nm-flat-xs">Active</span>
                               </div>
                               <div>
                                  <h4 className="text-sm font-black italic uppercase tracking-tight group-hover:text-blue-500 transition-colors">{rule.title}</h4>
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
                                   <button 
                                     onClick={() => handlePurgeProtocol(rule.id)}
                                     className="flex-1 py-3 rounded-2xl nm-button text-[9px] font-black uppercase hover:text-red-500 transition-all active:scale-95"
                                   >
                                     Remove
                                   </button>
                                   <button 
                                     onClick={() => handleEditProtocol(rule)}
                                     className="flex-1 py-3 rounded-2xl nm-button text-[9px] font-black uppercase hover:text-blue-500 transition-all active:scale-95"
                                   >
                                     Modify
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
               )}

               {!['alerts', 'health', 'log', 'protocols'].includes(activeTab) && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20">
                   <ShieldAlert className="w-16 h-16 mb-8" />
                   <p className="text-xl font-black uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed">
                      This section is coming soon.
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
