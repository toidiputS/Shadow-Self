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
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ThemeSidebar from "../components/dashboard/ThemeSidebar";

export default function System() {
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  
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
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400">
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
           {/* Visual Settings */}
           <section>
              <div className="flex items-center gap-3 mb-6 ml-2">
                 <Palette className="w-4 h-4 opacity-40" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3rem] opacity-60">Environment Orchestration</h3>
              </div>
              <div className="grid gap-4">
                 <button 
                   onClick={() => setIsThemeOpen(true)}
                   className="p-6 rounded-3xl nm-button flex items-center justify-between group hover:border-blue-500/20 border border-transparent transition-all"
                 >
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-blue-500">
                          <Palette className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-widest">Interface Theme Presets</p>
                          <p className="text-[10px] opacity-40 mt-1 uppercase font-black tracking-tighter">Switch between Alpha Core, Veracity, Blood Moon, and more</p>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </button>

                 <div className="p-6 rounded-3xl nm-button flex items-center justify-between group opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-orange-500">
                          <HardDrive className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-widest">System Asset Cache</p>
                          <p className="text-[10px] opacity-40 mt-1 uppercase font-black tracking-tighter">0.0B Synchronized Resources</p>
                       </div>
                    </div>
                    <Lock className="w-4 h-4 opacity-40" />
                 </div>
              </div>
           </section>

           {/* Security Settings */}
           <section>
              <div className="flex items-center gap-3 mb-6 ml-2">
                 <ShieldCheck className="w-4 h-4 opacity-40" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3rem] opacity-60">Access & Intelligence</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-6 rounded-3xl nm-button flex flex-col gap-4 group hover:nm-flat">
                    <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-blue-500">
                       <Bell className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <p className="text-xs font-black uppercase tracking-widest">Notifications Hub</p>
                       <p className="text-[9px] opacity-30 mt-1 leading-relaxed font-bold uppercase tracking-tight">Status: Alerts Muted. Protocol Overrides in Play.</p>
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl nm-button flex flex-col gap-4 group hover:nm-flat">
                    <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-green-500">
                       <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <p className="text-xs font-black uppercase tracking-widest">Subscription Node</p>
                       <p className="text-[9px] opacity-30 mt-1 leading-relaxed font-bold uppercase tracking-tight">Status: Legacy Access. Institutional Billing Active.</p>
                    </div>
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
