import React from "react";
import { supabase } from "@/api/supabase";
import { useQuery } from "@tanstack/react-query";
import { 
  Settings, 
  User, 
  ArrowLeft, 
  Palette, 
  HardDrive, 
  ShieldCheck, 
  Bell, 
  CreditCard,
  Cloud,
  ChevronRight,
  LogOut,
  Lock,
  Sparkles,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSidebar from "../components/dashboard/ThemeSidebar";
import NotificationsHub from "../components/system/NotificationsHub";
import SubscriptionNode from "../components/system/SubscriptionNode";

const MotionDiv = motion.div;

export default function System() {
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState(null);
  
  const updateTheme = (name, value) => {
    document.documentElement.style.setProperty(name, value);
    if (name === '--light') {
        const lightValue = parseInt(value);
        document.documentElement.setAttribute('data-theme', lightValue < 40 ? 'dark' : 'light');
    }
  };

  const applyPreset = (p) => {
    updateTheme('--hue', p.h);
    updateTheme('--sat', p.s);
    updateTheme('--light', p.l);
    alert(`PRESET ACTIVATED: ${p.name.toUpperCase()} protocol deployed.`);
  };
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400">

      <div className="max-w-4xl mx-auto pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black flex items-center justify-center md:justify-start gap-4 uppercase tracking-widest leading-none">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center nm-flat">
                <Settings className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              </div>
              System Config
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 md:ml-18">
              <span className="text-(--text-secondary) font-black uppercase tracking-[0.3em] text-[10px] opacity-40">Administrative Environment</span>
            </div>
          </div>
          
          <Link
            to={createPageUrl('Dashboard')}
            className="flex-1 md:flex-none py-4 px-8 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.2rem] flex items-center justify-center gap-3 group transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Standard Mode
          </Link>
        </div>

        {/* User Card */}
        <div className="mb-10 p-8 rounded-4xl nm-flat-lg border border-white/5 flex items-center gap-8 group hover:nm-flat transition-all">
           <div className="w-20 h-20 rounded-3xl nm-inset-sm flex items-center justify-center border border-blue-500/10 group-hover:nm-inset transition-all overflow-hidden">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-10 h-10 text-blue-500 opacity-60" />
               )}
           </div>
           <div className="flex-1">
              <h4 className="text-2xl font-black uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
                {profile?.display_name || user?.email?.split('@')[0] || "Auth User"}
              </h4>
              <p className="text-[10px] font-black uppercase tracking-[0.25rem] opacity-40 mb-3 leading-none">Vested Member ID: {user?.id?.substring(0, 12)}</p>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full nm-inset-sm text-[9px] font-black uppercase tracking-tighter opacity-80 w-fit">
                 <ShieldCheck className="w-3 h-3 text-green-500" />
                 <span>High-Compliance Profile Verified</span>
              </div>
           </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-8">
           {/* Visual Settings & Theme Orchestration */}
           <section>
              <div className="flex items-center gap-3 mb-6 ml-2">
                 <Palette className="w-4 h-4 opacity-40" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3rem] opacity-60">Visual Orchestration</h3>
              </div>
              <div className={`p-1 rounded-4xl transition-all duration-700 ${activeSection === 'theme' ? 'nm-inset p-4 bg-blue-500/5' : ''}`}>
                 <button 
                   onClick={() => setActiveSection(activeSection === 'theme' ? null : 'theme')}
                   className={`w-full p-6 rounded-3xl nm-button flex items-center justify-between group transition-all ${activeSection === 'theme' ? 'nm-inset-sm border border-blue-500/20' : 'hover:nm-flat border border-transparent'}`}
                 >
                    <div className="flex items-center gap-5">
                       <div className={`w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center transition-colors ${activeSection === 'theme' ? 'text-blue-500' : 'text-blue-500 opacity-60'}`}>
                          <Palette className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-widest">Interface Theme Presets</p>
                          <p className="text-[10px] opacity-40 mt-1 uppercase font-black tracking-tighter italic">Live Spectral Hub — Alpha, Veracity, Blood Moon</p>
                       </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 opacity-20 transition-transform duration-500 ${activeSection === 'theme' ? 'rotate-90 opacity-100' : 'group-hover:opacity-100 group-hover:translate-x-1'}`} />
                 </button>

                 <AnimatePresence>
                    {activeSection === 'theme' && (
                      <MotionDiv
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                         <div className="mt-8 p-8 border-t border-white/5 space-y-12">
                            {/* In-page Theme Controls for Immediate Feedback */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                               <div className="space-y-6">
                                  <div className="flex items-center justify-between">
                                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Spectral Hue</p>
                                     <button onClick={() => updateTheme('--hue', '210')}><RefreshCw className="w-3 h-3 opacity-20 hover:opacity-100" /></button>
                                  </div>
                                  <div className="nm-inset-sm p-4 rounded-2xl">
                                     <input 
                                       type="range" 
                                       min="0" 
                                       max="360" 
                                       onChange={(e) => updateTheme('--hue', e.target.value)}
                                       className="w-full h-1.5 rounded-full appearance-none bg-linear-to-r from-red-500 via-green-500 to-blue-500 cursor-pointer"
                                     />
                                  </div>
                               </div>
                               <div className="space-y-6">
                                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Base Protocol</p>
                                  <div className="grid grid-cols-2 gap-4">
                                     <button 
                                       onClick={() => updateTheme('--light', '88%')}
                                       className="p-4 rounded-xl nm-button flex items-center gap-3"
                                     >
                                        <Sun className="w-4 h-4 text-yellow-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Light Core</span>
                                     </button>
                                     <button 
                                       onClick={() => updateTheme('--light', '15%')}
                                       className="p-4 rounded-xl nm-button flex items-center gap-3"
                                     >
                                        <Moon className="w-4 h-4 text-blue-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Stealth Node</span>
                                     </button>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="space-y-6 pt-4">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Institutional Presets</p>
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {[
                                    { name: 'Alpha Core', h: 210, s: '15%', l: '88%' },
                                    { name: 'Veracity', h: 155, s: '20%', l: '88%' },
                                    { name: 'Blood Moon', h: 355, s: '25%', l: '15%' },
                                    { name: 'Stealth', h: 220, s: '10%', l: '12%' },
                                  ].map((p, i) => (
                                    <button 
                                      key={i}
                                      onClick={() => {
                                        document.documentElement.style.setProperty('--hue', p.h);
                                        document.documentElement.style.setProperty('--sat', p.s);
                                        document.documentElement.style.setProperty('--light', p.l);
                                      }}
                                      className="p-4 rounded-xl nm-button text-[9px] font-black uppercase tracking-widest hover:text-blue-500"
                                    >
                                       {p.name}
                                    </button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </MotionDiv>
                    )}
                 </AnimatePresence>
              </div>
           </section>

           {/* Security & Finance Hub */}
           <section>
              <div className="flex items-center gap-3 mb-6 ml-2">
                 <ShieldCheck className="w-4 h-4 opacity-40" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3rem] opacity-60">Access & Institutional Node</h3>
              </div>
              <div className="space-y-4">
                 {/* Notifications Hub Module */}
                 <div className={`p-1 rounded-4xl transition-all duration-700 ${activeSection === 'notifications' ? 'nm-inset p-4 bg-blue-500/5' : ''}`}>
                    <button 
                      onClick={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}
                      className={`w-full p-6 rounded-3xl nm-button flex items-start gap-4 text-left transition-all group ${activeSection === 'notifications' ? 'nm-inset-sm border border-blue-500/20' : 'hover:nm-flat border border-transparent'}`}
                    >
                       <div className={`w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center transition-colors ${activeSection === 'notifications' ? 'text-blue-500' : 'text-blue-500 opacity-60 group-hover:opacity-100'}`}>
                          <Bell className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between">
                             <h4 className="text-xs font-black uppercase tracking-widest leading-none">Notifications Hub</h4>
                             <ChevronRight className={`w-5 h-5 opacity-20 transition-transform duration-500 ${activeSection === 'notifications' ? 'rotate-90 opacity-100' : 'group-hover:opacity-100 group-hover:translate-x-1'}`} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40 mt-1 mb-2">Configure escalation logic and channel routing</p>
                          <div className="flex gap-2">
                             <span className="px-2 py-0.5 rounded-md nm-inset-sm text-[8px] font-black uppercase text-green-500/80">4 Channels Online</span>
                             <span className="px-2 py-0.5 rounded-md nm-inset-sm text-[8px] font-black uppercase text-orange-500/80 italic">Overrides Active</span>
                          </div>
                       </div>
                    </button>
                    
                    <AnimatePresence>
                       {activeSection === 'notifications' && (
                         <MotionDiv
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="overflow-hidden"
                         >
                            <div className="mt-4 pt-4 border-t border-white/5">
                               <NotificationsHub />
                            </div>
                         </MotionDiv>
                       )}
                    </AnimatePresence>
                 </div>

                 {/* Subscription Node Module */}
                 <div className={`p-1 rounded-4xl transition-all duration-700 ${activeSection === 'subscription' ? 'nm-inset p-4 bg-green-500/5' : ''}`}>
                    <button 
                      onClick={() => setActiveSection(activeSection === 'subscription' ? null : 'subscription')}
                      className={`w-full p-6 rounded-3xl nm-button flex items-start gap-4 text-left transition-all group ${activeSection === 'subscription' ? 'nm-inset-sm border border-green-500/20' : 'hover:nm-flat border border-transparent'}`}
                    >
                       <div className={`w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center transition-colors ${activeSection === 'subscription' ? 'text-green-500' : 'text-green-500 opacity-60 group-hover:opacity-100'}`}>
                          <CreditCard className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between">
                             <h4 className="text-xs font-black uppercase tracking-widest leading-none">Subscription Node</h4>
                             <ChevronRight className={`w-5 h-5 opacity-20 transition-transform duration-500 ${activeSection === 'subscription' ? 'rotate-90 opacity-100' : 'group-hover:opacity-100 group-hover:translate-x-1'}`} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40 mt-1 mb-2">Manage institutional entitlements and resource caps</p>
                          <div className="flex gap-2">
                             <span className="px-2 py-0.5 rounded-md nm-inset-sm text-[8px] font-black uppercase text-blue-500/80 italic">Legacy Active</span>
                             <span className="px-2 py-0.5 rounded-md nm-inset-sm text-[8px] font-black uppercase opacity-20 italic">Renewal: Dec 31</span>
                          </div>
                       </div>
                    </button>

                    <AnimatePresence>
                       {activeSection === 'subscription' && (
                         <MotionDiv
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="overflow-hidden"
                         >
                            <div className="mt-4 pt-4 border-t border-white/5">
                               <SubscriptionNode />
                            </div>
                         </MotionDiv>
                       )}
                    </AnimatePresence>
                 </div>
              </div>
           </section>

           {/* Footer Action */}
           <div className="pt-8 border-t border-white/5">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="w-full py-5 rounded-3xl nm-button text-red-500/60 hover:text-red-500 font-black text-xs uppercase tracking-[0.4rem] flex items-center justify-center gap-4 transition-all"
              >
                  <LogOut className="w-5 h-5" />
                  Terminate Connection
              </button>
              <div className="mt-12 text-center opacity-20">
                 <p className="text-[9px] font-black uppercase tracking-[0.5rem] mb-2 flex items-center justify-center gap-4">
                    <Cloud className="w-3 h-3" />
                    Shadow Core System Synced
                 </p>
                 <p className="text-[9px] font-black uppercase tracking-tighter opacity-60">Instance: mdyvmrglyffmokfufbf0.v3.01</p>
              </div>
           </div>
        </div>

        <ThemeSidebar isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
      </div>
    </div>
  );
}
