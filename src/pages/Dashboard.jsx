import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Sparkles, 
  Shield, 
  Palette, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  BarChart3, 
  ShieldAlert, 
  ShieldCheck,
  Bell,
  Heart
} from "lucide-react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { startOfDay, isSameDay } from "date-fns";

import MetricsDisplay from "../components/dashboard/MetricsDisplay";
import LevelProgress from "../components/dashboard/LevelProgress";
import QuestCard from "../components/dashboard/QuestCard";
import CreateQuestForm from "../components/dashboard/CreateQuestForm";
import PerfectDayBanner from "../components/dashboard/PerfectDayBanner";
import ThemeSidebar from "../components/dashboard/ThemeSidebar";
import GuildStatus from "../components/dashboard/GuildStatus";
import DailyCheckIn from "../components/dashboard/DailyCheckIn";
import WeeklyReview from "../components/dashboard/WeeklyReview";
import RecoveryHeatmap from "../components/dashboard/RecoveryHeatmap";
import NotificationInbox from "../components/dashboard/NotificationInbox";

import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { profile: authProfile, user: authUser } = useAuth();
  const profile = authProfile;
  const user = authUser;
  
  const MotionDiv = motion.div;
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [bounceBackMessage, setBounceBackMessage] = useState(null);
  
  // Tactical Member State
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  // Data Fetching

  useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from('progress').select('*').eq('user_id', user.id).maybeSingle();
      if (error) {
        console.error("❌ Resource Pool Retrieval Error:", error.message);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  const { data: quests = [], isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const { data } = await supabase.from('quests').select('*').order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: completionLogs = [] } = useQuery({
    queryKey: ['completionLogs'],
    queryFn: async () => {
      const { data } = await supabase.from('quest_completions').select('*').eq('user_id', user.id);
      return data;
    },
    enabled: !!user?.id
  });

  const { data: dailyStatus } = useQuery({
    queryKey: ['dailyStatus', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('guild_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  const { data: unreadNotificationsCount = 0 } = useQuery({
    queryKey: ['unreadNotificationsCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
    staleTime: 5000
  });

  // System Intelligence Logic
  const isAntiSpiralMode = useMemo(() => {
    if (!profile) return false;
    const lastRelapse = profile.last_relapse_at ? new Date(profile.last_relapse_at) : null;
    if (!lastRelapse) return false;
    const hoursSinceRelapse = (new Date() - lastRelapse) / (1000 * 60 * 60);
    return hoursSinceRelapse < 48 && profile.current_streak === 0;
  }, [profile]);

  useEffect(() => {
    if (isAntiSpiralMode && !bounceBackMessage) {
        const timer = setTimeout(() => {
            setBounceBackMessage("ANTI-SPIRAL PROTOCOL ACTIVE. System integrity compromised. Execute minimum viable recovery protocols immediately to restabilize baseline.");
        }, 0);
        return () => clearTimeout(timer);
    }
  }, [isAntiSpiralMode, bounceBackMessage]);

  const completeQuestMutation = useMutation({
    mutationFn: async ({ quest, reflectionNote }) => {
      await supabase.from('quest_completions').insert([{
        quest_id: quest.id,
        user_id: user.id,
        reflection_note: reflectionNote,
        xp_earned: quest.xp_reward,
        sp_earned: quest.sp_reward
      }]);
      await supabase.rpc('update_wallet_rewards', {
        u_id: user.id,
        xp_amount: quest.xp_reward,
        sp_amount: quest.sp_reward
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['completionLogs'] });
    }
  });

  // Derived State
  const groupedQuests = useMemo(() => {
    const today = startOfDay(new Date());
    const result = { due: [], overdue: [], completed: [] };
    (quests || []).forEach(quest => {
      const logs = (completionLogs || []).filter(l => l.quest_id === quest.id);
      const isCompletedToday = logs.some(l => isSameDay(new Date(l.completed_at), today));
      if (isCompletedToday) result.completed.push(quest);
      else if (quest.is_shadow_debt) result.overdue.push(quest);
      else result.due.push(quest);
    });
    return result;
  }, [quests, completionLogs]);

  const calculateStreak = (questId) => {
    const logs = (completionLogs || []).filter(l => l.quest_id === questId).sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at));
    return logs.length;
  };

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Command Suite Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 relative px-2">
            <div className="flex flex-col gap-6 w-full md:w-auto">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-4xl nm-flat flex items-center justify-center text-blue-500 relative group">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-4xl animate-pulse"></div>
                        <Activity className="w-8 h-8 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.3rem] md:tracking-[0.5rem] leading-none mb-3 italic">Shadow Self</h1>
                        <div className="flex items-center gap-3 opacity-30">
                            <Sparkles className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2rem] md:tracking-[0.4rem]">Member Command Hub Active</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {!dailyStatus && (
                  <button 
                    onClick={() => setShowCheckIn(true)}
                    className="flex items-center gap-3 px-8 py-5 rounded-4xl nm-button text-[10px] font-black uppercase tracking-widest text-orange-500 group animate-bounce"
                  >
                    <Heart className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    Required Check-in
                  </button>
                )}
                <button 
                  onClick={() => setIsInboxOpen(true)}
                  className="w-16 h-16 rounded-4xl nm-button flex items-center justify-center text-blue-500 relative group"
                >
                  <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  {unreadNotificationsCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 nm-flat flex items-center justify-center border-2 border-(--bg-color)">
                      <span className="text-[8px] font-black text-white">{unreadNotificationsCount}</span>
                    </div>
                  )}
                </button>
                <button 
                  onClick={() => setIsThemeOpen(true)}
                  className="w-16 h-16 rounded-4xl nm-button flex items-center justify-center opacity-40 hover:opacity-100 hover:text-blue-400 transition-all"
                >
                  <Palette className="w-6 h-6" />
                </button>
                {showInstallBtn && (
                  <button 
                    onClick={handleInstall}
                    className="flex items-center gap-3 px-6 py-4 rounded-3xl nm-button text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/5 border border-blue-500/20"
                  >
                    <Plus className="w-3 h-3" />
                    Secure App
                  </button>
                )}
            </div>
        </div>

        {/* Anti-Spiral Mode */}
        {bounceBackMessage && (
          <MotionDiv
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-12 p-10 rounded-[3rem] nm-flat border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
             <div className="flex items-center gap-8 relative z-10">
                <div className="w-16 h-16 rounded-3xl nm-flat-sm flex items-center justify-center text-blue-500">
                   <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-blue-500">System Intelligence Bulletin</h3>
                  <p className="text-[11px] font-bold opacity-60 mt-2 max-w-2xl leading-relaxed italic">"{bounceBackMessage}"</p>
                </div>
             </div>
             <button onClick={() => setBounceBackMessage(null)} className="px-10 py-5 rounded-2xl nm-button font-black text-[10px] uppercase tracking-widest text-blue-400 hover:text-blue-300 relative z-10"> Acknowledge Protocol </button>
          </MotionDiv>
        )}

        <div className="mb-24 relative z-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               <GuildStatus user_id={profile?.user_id} />
               <div className="lg:col-span-2">
                 <RecoveryHeatmap completionLogs={completionLogs} />
               </div>
            </div>
        </div>

        <div className="mb-24 relative z-10 pt-10">
          <div className="flex items-center justify-between mb-16 border-l-4 border-blue-500/30 pl-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center border border-blue-500/10">
                <Activity className="w-7 h-7 text-blue-500 opacity-60" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-widest uppercase text-(--text-primary)">Daily Execution Queue</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.5rem] opacity-40 mt-2 text-blue-500 italic">Today's Tactical Assignment</p>
              </div>
            </div>
            {(groupedQuests?.due?.length || 0) > 0 && (
              <button 
                className="hidden lg:flex items-center gap-4 px-10 py-4 rounded-2xl nm-button text-[11px] font-black uppercase tracking-[0.25rem] text-blue-500 hover:scale-105 transition-all"
              >
                <span>Process Next Protocol</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <LayoutGroup id="member-coordinator">
            <div className="space-y-16">
              {/* Overdue Items */}
              {groupedQuests.overdue.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-10 ml-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h3 className="text-xl font-black uppercase tracking-widest text-red-500/60 italic">Shadow Debt (Protocol Deviation)</h3>
                    <div className="flex-1 h-px bg-red-500/10"></div>
                  </div>
                  <div className="grid gap-10 md:grid-cols-2">
                      {groupedQuests.overdue.map((quest) => (
                        <QuestCard 
                          key={quest.id} 
                          quest={quest} 
                          onComplete={(q, note) => completeQuestMutation.mutate({ quest: q, reflectionNote: note })} 
                          isCompleted={false} 
                          isOverdue={true} 
                          streak={calculateStreak(quest.id)} 
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Due Protocols */}
              <div>
                <div className="flex items-center gap-4 mb-10 ml-2">
                  <Clock className="w-5 h-5 opacity-30" />
                  <h3 className="text-xl font-black uppercase tracking-widest opacity-40">Active Assignments</h3>
                  <div className="flex-1 h-px bg-white/5"></div>
                </div>
                {questsLoading ? (
                  <div className="text-center py-24 text-(--text-secondary) font-black uppercase tracking-[0.6rem] opacity-10 animate-pulse italic">Connecting to institutional node...</div>
                ) : (
                  <div className="grid gap-10 md:grid-cols-2">
                      {groupedQuests.due.map((quest) => (
                        <QuestCard 
                          key={quest.id} 
                          quest={quest} 
                          onComplete={(q, note) => completeQuestMutation.mutate({ quest: q, reflectionNote: note })} 
                          isCompleted={false} 
                          streak={calculateStreak(quest.id)} 
                        />
                      ))}
                      {/* Blank state if no quests */}
                      {groupedQuests.due.length === 0 && groupedQuests.overdue.length === 0 && (
                        <div className="col-span-full py-20 text-center rounded-[3rem] nm-inset opacity-20 flex flex-col items-center">
                            <CheckCircle2 className="w-16 h-16 mb-8 text-green-500" />
                            <h3 className="text-2xl font-black uppercase tracking-[0.5rem]">Assignment Cleared</h3>
                            <p className="text-[10px] font-black mt-4 uppercase">All daily stabilization protocols have been successfully executed.</p>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Cleared Protocols */}
              {groupedQuests.completed.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-10 ml-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500/40" />
                    <h3 className="text-xl font-black uppercase tracking-widest opacity-30 italic">Validated Clears</h3>
                    <div className="flex-1 h-px bg-green-500/5"></div>
                  </div>
                  <div className="grid gap-10 md:grid-cols-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                      {groupedQuests.completed.map((quest) => (
                        <QuestCard 
                          key={quest.id} 
                          quest={quest} 
                          onComplete={(q, note) => completeQuestMutation.mutate({ quest: q, reflectionNote: note })} 
                          isCompleted={true} 
                          streak={calculateStreak(quest.id)} 
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </LayoutGroup>
        </div>

        <ThemeSidebar isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
        <NotificationInbox isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} />
      </div>

      <AnimatePresence>
        {showCheckIn && (
           <DailyCheckIn 
             onComplete={() => {
               setShowCheckIn(false);
               queryClient.invalidateQueries({ queryKey: ['dailyStatus'] });
             }} 
           />
        )}
        {showWeeklyReview && <WeeklyReview onClose={() => setShowWeeklyReview(false)} />}
      </AnimatePresence>
    </div>
  );
}
