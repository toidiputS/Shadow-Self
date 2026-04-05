import React from "react";
import { supabase } from "@/api/supabase";
import { useQuery } from "@tanstack/react-query";
import { 
  Settings, 
  User, 
  ArrowLeft, 
  ShieldCheck, 
  Bell, 
  CreditCard,
  Cloud,
  ChevronRight,
  LogOut,
  RefreshCw,
  Sun,
  Moon,
  ShieldAlert,
  Palette
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsHub from "../components/system/NotificationsHub";
import SubscriptionNode from "../components/system/SubscriptionNode";
import ThemeSidebar from "../components/dashboard/ThemeSidebar";

const MotionDiv = motion.div;

export default function System() {
  const [activeSection, setActiveSection] = React.useState(null);
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  const navigate = useNavigate();
  const [isPurging, setIsPurging] = React.useState(null); // 'logs' or 'notifications'

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

  const handlePurgeLogs = async () => {
    if (!window.confirm("ARE YOU SURE? This will clear all house activity and check-in history. It cannot be undone.")) return;
    setIsPurging('logs');
    try {
      // Execute multi-table purge using independent delete operations for safety
      const results = await Promise.all([
        supabase.from('guild_activity_log').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('quest_audit_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
      
      alert("SUCCESS: House history has been cleared.");
    } catch (err) {
      console.error(err);
      alert("ERROR: Could not clear history. Please try again.");
    } finally {
      setIsPurging(null);
    }
  };

  const handlePurgeNotifications = async () => {
    if (!window.confirm("ARE YOU SURE? This will clear all your notifications. It cannot be undone.")) return;
    setIsPurging('notifications');
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      alert("SUCCESS: Notifications cleared.");
    } catch (err) {
      console.error(err);
      alert("ERROR: Could not clear notifications.");
    } finally {
      setIsPurging(null);
    }
  };

  return (
    <div id="admin-setup-wizard" className="bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400">

      <div className="max-w-4xl mx-auto pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black flex items-center justify-center md:justify-start gap-4 uppercase tracking-widest leading-none">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center nm-flat">
                <Settings className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              </div>
              App Settings
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 md:ml-18">
              <span className="text-(--text-secondary) font-black uppercase tracking-[0.3em] text-[10px] opacity-40">House Admin Area</span>
            </div>
          </div>
          
          <Link
            to={createPageUrl('Dashboard')}
            className="flex-1 md:flex-none py-4 px-8 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.2rem] flex items-center justify-center gap-3 group transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Dashboard
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
              <p className="text-[10px] font-black uppercase tracking-[0.25rem] opacity-40 mb-3 leading-none">User ID: {user?.id?.substring(0, 12)}</p>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full nm-inset-sm text-[9px] font-black uppercase tracking-tighter opacity-80 w-fit">
                 <ShieldCheck className="w-3 h-3 text-green-500" />
                 <span>Verified Account</span>
              </div>
           </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
           
           {/* Notification Hub (Expanded) */}
           <div className="md:col-span-12 group h-full">
              <div 
                onClick={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}
                className={`h-full p-10 rounded-5xl flex flex-col justify-between transition-all cursor-pointer ${activeSection === 'notifications' ? 'nm-inset border border-blue-500/30' : 'nm-button border border-transparent hover:border-blue-500/20 hover:scale-[1.01]'}`}
              >
                 <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className={`w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center transition-colors shrink-0 ${activeSection === 'notifications' ? 'text-blue-500 nm-inset' : 'text-blue-500/60'}`}>
                       <Bell className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black uppercase tracking-widest mb-3 group-hover:text-blue-500 transition-colors">Guidance Hub</h3>
                          <ChevronRight className={`w-8 h-8 opacity-20 transition-transform duration-500 ${activeSection === 'notifications' ? 'rotate-90 opacity-100' : 'group-hover:opacity-100 group-hover:translate-x-1'}`} />
                       </div>
                       <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest leading-relaxed italic mb-8">
                          Centrally manage community-wide guidance protocols and support signals.
                       </p>
                       <div className="flex gap-4">
                          <span className="px-4 py-2 rounded-xl nm-inset-sm text-[9px] font-black uppercase text-green-500/80 tracking-widest">Active Status</span>
                          <span className="px-4 py-2 rounded-xl nm-inset-sm text-[9px] font-black uppercase text-blue-500/80 tracking-widest">Global Relay</span>
                          <span className="px-4 py-2 rounded-xl nm-inset-sm text-[9px] font-black uppercase opacity-20 tracking-widest italic">Core Engine Running</span>
                       </div>
                    </div>
                 </div>

                 <AnimatePresence>
                    {activeSection === 'notifications' && (
                       <MotionDiv
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden mt-12 pt-12 border-t border-white/5"
                         onClick={(e) => e.stopPropagation()}
                       >
                          <NotificationsHub />
                       </MotionDiv>
                    )}
                 </AnimatePresence>
              </div>
           </div>

           {/* 3. House Plan */}
           <div className="md:col-span-12 group">
              <div 
                onClick={() => setActiveSection(activeSection === 'subscription' ? null : 'subscription')}
                className={`p-8 rounded-5xl flex flex-col transition-all cursor-pointer ${activeSection === 'subscription' ? 'nm-inset border border-green-500/30' : 'nm-button border border-transparent hover:border-green-500/20'}`}
              >
                 <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className={`w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center transition-colors shrink-0 ${activeSection === 'subscription' ? 'text-green-500 nm-inset' : 'text-green-500/60'}`}>
                       <CreditCard className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black uppercase tracking-widest">House Plan</h3>
                          <ChevronRight className={`w-6 h-6 opacity-20 transition-transform duration-500 hidden md:block ${activeSection === 'subscription' ? 'rotate-90 opacity-100' : 'group-hover:opacity-100 group-hover:translate-x-1'}`} />
                       </div>
                       <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest mt-1 italic">
                          House Plan Management — {profile?.tier || 'Free'} Plan Active
                       </p>
                    </div>
                    <div className="px-8 py-3 rounded-2xl nm-inset-sm text-[10px] font-black uppercase text-green-500 tracking-[0.2em]">
                       Verified: {profile?.id?.substring(0, 8)}
                    </div>
                 </div>

                 <AnimatePresence>
                    {activeSection === 'subscription' && (
                       <MotionDiv
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden mt-12 pt-12 border-t border-white/5"
                         onClick={(e) => e.stopPropagation()}
                       >
                          <SubscriptionNode />
                       </MotionDiv>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>

        {/* Dangerous Actions */}
        <section className="mb-12">
           <div className="flex items-center gap-3 mb-8 ml-2 text-red-500/60">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-[0.4rem] opacity-80">Integrity Reset Actions</h3>
           </div>
           
           <div className="p-12 rounded-[3.5rem] nm-inset border border-red-500/5 bg-red-500/1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <ShieldAlert className="w-48 h-48 -mr-12 -mt-12" />
              </div>
              
              <div className="relative z-10 max-w-2xl">
                 <h4 className="text-xl font-black uppercase tracking-[0.3em] text-red-500 mb-6 italic">Clear All House Data</h4>
                 <p className="text-xs opacity-50 font-medium leading-relaxed mb-10">
                    These actions will permanently delete all activity history, check-ins, and notifications. 
                    <span className="block mt-2 font-black uppercase tracking-tighter text-red-500/40">WARNING: This cannot be undone.</span>
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePurgeLogs(); }}
                      disabled={isPurging === 'logs'}
                      className="group relative overflow-hidden py-6 rounded-3xl nm-button text-[11px] font-black uppercase tracking-widest text-red-500 hover:nm-flat transition-all active:scale-95 disabled:opacity-20"
                    >
                       <span className="relative z-10">{isPurging === 'logs' ? 'Clearing History...' : 'Delete All History'}</span>
                       <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    </button>
                    <button 
                       onClick={(e) => { e.stopPropagation(); handlePurgeNotifications(); }}
                       disabled={isPurging === 'notifications'}
                       className="group relative overflow-hidden py-6 rounded-3xl nm-button text-[11px] font-black uppercase tracking-widest text-orange-500 hover:nm-flat transition-all active:scale-95 disabled:opacity-20"
                    >
                       <span className="relative z-10">{isPurging === 'notifications' ? 'Clearing Alerts...' : 'Delete All Alerts'}</span>
                       <div className="absolute inset-0 bg-orange-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* Global Exit & Audit */}
        <div className="pt-8 border-t border-white/5">
           <div className="flex flex-col md:flex-row gap-6">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/');
                }}
                className="flex-1 py-6 rounded-3xl nm-button text-red-500/60 hover:text-red-500 font-black text-xs uppercase tracking-[0.5rem] flex items-center justify-center gap-4 transition-all hover:nm-flat"
              >
                  <LogOut className="w-5 h-5" />
                  Log Out
              </button>
              
              <Link 
                to="/admin"
                className="flex-1 py-6 rounded-3xl nm-button text-blue-500/60 hover:text-blue-500 font-black text-xs uppercase tracking-[0.3rem] flex items-center justify-center gap-4 transition-all hover:nm-flat"
              >
                  <ShieldCheck className="w-5 h-5" />
                  Admin Portal
              </Link>
           </div>
           
           <div className="mt-16 text-center opacity-20">
              <p className="text-[10px] font-black uppercase tracking-[0.6rem] mb-4 flex items-center justify-center gap-6">
                 <Cloud className="w-4 h-4" />
                 Shadow Core System Synced
              </p>
              <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest">
                <span>Instance: wdzxbmzykwebozrxddlt</span>
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                <span>Branch: PROD-v4.2.0</span>
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                <span className="text-blue-500">System Ready</span>
              </div>
           </div>
        </div>
      </div>

      <ThemeSidebar 
        isOpen={isThemeOpen} 
        onClose={() => setIsThemeOpen(false)} 
      />

      {/* Persistent Theme Trigger */}
      <button 
        onClick={() => setIsThemeOpen(true)}
        className="fixed bottom-32 right-8 w-16 h-16 rounded-full nm-button flex items-center justify-center text-blue-500 z-50 group hover:scale-110 transition-all border border-blue-500/10"
        title="App Appearance"
      >
        <Palette className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
      </button>

    </div>
  );
}
