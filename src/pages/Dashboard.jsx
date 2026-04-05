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
  Heart,
  HeartHandshake,
  Wind,
  Droplets,
  Eye,
  Store
} from "lucide-react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { startOfDay, isSameDay, formatDistanceToNow } from "date-fns";

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

import { useAuth } from "@/hooks/useAuth";
import { useEngagement } from "@/hooks/useEngagement";
import { useBounceBack } from "@/hooks/useBounceBack";

export default function Dashboard() {
  const { profile: authProfile, user: authUser } = useAuth();
  const profile = authProfile;
  const user = authUser;
  const disclosure = useEngagement(profile);
  const bounceBack = useBounceBack(user?.id, profile);
  
  const MotionDiv = motion.div;
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  
  // Dashboard Controls
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [focusedInboxId, setFocusedInboxId] = useState(null);
  
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
        console.error("❌ Error loading your progress:", error.message);
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

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
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
    <div className="bg-(--bg-color) text-(--text-primary) p-4 md:p-12 min-h-screen transition-colors duration-400">

      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Header */}
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
                            <p className="text-[10px] font-black uppercase tracking-[0.2rem] md:tracking-[0.4rem]">Your House Dashboard</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {!dailyStatus && (
                  <button 
                    id="dashboard-checkin-btn"
                    onClick={() => setShowCheckIn(true)}
                    className="flex items-center gap-3 px-8 py-5 rounded-4xl nm-button text-[10px] font-black uppercase tracking-widest text-orange-500 group animate-bounce"
                  >
                    <Heart className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    Today's Check-in
                  </button>
                )}
                <button 
                  id="dashboard-notifications-btn"
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
                  id="dashboard-theme-btn"
                  onClick={() => setIsThemeOpen(true)}
                  className="w-16 h-16 rounded-4xl nm-button flex items-center justify-center opacity-40 hover:opacity-100 hover:text-blue-400 transition-all"
                >
                  <Palette className="w-6 h-6" />
                </button>
                <Link
                  to={createPageUrl('ShadowVault')}
                  className="w-16 h-16 rounded-4xl nm-button flex items-center justify-center text-yellow-500 hover:scale-105 transition-all"
                  title="House Store"
                >
                  <Store className="w-6 h-6" />
                </Link>
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

        {/* Support Mode */}
        {bounceBack.isActive && (
          <MotionDiv
            layout
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-16 p-10 rounded-[3rem] nm-flat border border-blue-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start gap-8 relative z-10 mb-10">
              <div className="w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center text-blue-500 shrink-0">
                <Heart className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-black uppercase tracking-widest text-blue-500">Support Mode Active</h3>
                  <span className={`px-3 py-1 rounded-lg nm-inset-sm text-[8px] font-black uppercase tracking-widest ${
                    bounceBack.severity === 'critical' ? 'text-red-500' : 'text-orange-500'
                  }`}>
                    {bounceBack.severity}
                  </span>
                </div>
                <p className="text-[11px] font-bold opacity-60 leading-relaxed italic max-w-2xl">
                  {bounceBack.triggerReason} Your habits have been simplified for now. Focus on the basics.
                </p>
              </div>
              <div className="px-5 py-2 rounded-xl nm-inset-sm text-[8px] font-black uppercase tracking-widest text-green-500/60 border border-green-500/10 shrink-0">
                Status: {bounceBack.complianceTag}
              </div>
            </div>

            {/* Restorative Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-8">
              {bounceBack.restorativeTasks.map((task) => {
                const iconMap = { breathe: Wind, hydrate: Droplets, ground: Eye };
                const TaskIcon = iconMap[task.id] || Heart;
                return (
                  <div key={task.id} className="p-6 rounded-3xl nm-inset-sm border border-blue-500/10 hover:border-blue-500/30 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl nm-flat flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <TaskIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-widest">{task.label}</h4>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-30">{task.duration}</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold opacity-50 leading-relaxed italic">{task.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Exit Progress */}
            <div className="flex items-center gap-6 relative z-10">
              <div className="flex-1 h-2 rounded-full nm-inset p-0.5">
                <div 
                  className="h-full rounded-full bg-blue-500/50 transition-all duration-1000" 
                  style={{ width: `${((3 - bounceBack.daysUntilExit) / 3) * 100}%` }} 
                />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                {bounceBack.daysUntilExit > 0 
                  ? `${bounceBack.daysUntilExit} day${bounceBack.daysUntilExit !== 1 ? 's' : ''} until back to normal`
                  : 'Suppport Finished'
                }
              </span>
            </div>
          </MotionDiv>
        )}

        {/* Watch Mode — Subtle Indicator */}
        {bounceBack.severity === 'watch' && !bounceBack.isActive && (
          <MotionDiv
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-6 rounded-2xl nm-inset-sm border border-orange-500/10 flex items-center gap-6"
          >
            <AlertCircle className="w-5 h-5 text-orange-500/60 shrink-0" />
            <p className="text-[10px] font-bold opacity-50 italic flex-1">
              {bounceBack.triggerReason} If things get harder, the app will turn on Support Mode to help out.
            </p>
            <span className="text-[8px] font-black uppercase tracking-widest text-orange-500/40">Watch Mode</span>
          </MotionDiv>
        )}

        {/* Progressive Disclosure: Welcome Card for Foundation Tier */}
        {!disclosure.isFullAccess && (
          <MotionDiv
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 p-10 rounded-[3rem] nm-flat border border-green-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-green-500/5"></div>
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center text-green-500">
                <Shield className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-black uppercase tracking-widest text-green-500 mb-2">Welcome to Shadow Self</h3>
                <p className="text-[11px] font-bold opacity-60 leading-relaxed italic max-w-2xl">
                  Focus on the basics. Complete your daily check-in and habits to build a streak. 
                  {disclosure.daysUntilNextTier > 0 && (
                    <span className="text-green-500"> New features unlock in {disclosure.daysUntilNextTier} day{disclosure.daysUntilNextTier !== 1 ? 's' : ''}.</span>
                  )}
                </p>
              </div>
              <div className="px-6 py-3 rounded-2xl nm-inset-sm text-[9px] font-black uppercase tracking-widest text-green-500/60">
                Tier: {disclosure.tierLabel}
              </div>
            </div>
          </MotionDiv>
        )}

        {/* Sponsor Interaction Bridge — Unlocks at Full Access (Day 8+) */}
        {disclosure.showSponsorBridge && (
        <div className="mb-24 relative z-10">
           <div className="flex flex-col md:flex-row items-center gap-12 p-12 rounded-[3.5rem] nm-flat border border-orange-500/10 hover:border-orange-500/20 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-colors"></div>
              <div className="w-24 h-24 rounded-4xl nm-inset-sm flex items-center justify-center text-orange-500 relative shrink-0">
                  <HeartHandshake className="w-12 h-12 relative z-10" />
                  <div className="absolute inset-0 bg-orange-500/10 rounded-4xl animate-pulse"></div>
              </div>
              <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
                  <h3 className="text-xl font-black uppercase tracking-widest text-orange-500 italic">Sponsor Feedback</h3>
                  <p className="text-[11px] font-bold opacity-60 leading-relaxed italic max-w-2xl">
                    {notifications?.[0]?.message || "Welcome to the house! Start by completing your morning check-in and habits to get settled in."}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-30 text-orange-500">— Manager: {notifications?.[0]?.metadata?.sender_name || "House Team"}</span>
                     <span className="w-1.5 h-1.5 rounded-full bg-orange-500/40"></span>
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">
                        {notifications?.[0]?.created_at ? formatDistanceToNow(new Date(notifications[0].created_at)) + " ago" : "SYSTEM READY"}
                     </span>
                  </div>
              </div>
              <button 
                onClick={() => {
                  if (notifications?.length > 0) {
                    setFocusedInboxId(notifications[0].id);
                  } else {
                    setFocusedInboxId(null);
                  }
                  setIsInboxOpen(true);
                }}
                disabled={!notifications?.length}
                className="px-10 py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-orange-500 hover:scale-105 transition-all relative z-10 group-hover:nm-flat-sm disabled:opacity-20 active:scale-95"
              >
                  {notifications?.length > 0 ? 'Respond to Sponsor' : 'No New Messages'}
              </button>
           </div>
        </div>
        )}

        {/* Guild Status & Heatmap — Unlocks at Anchor Tier (Day 5+) */}
        {disclosure.showGuildStatus && (
        <div id="dashboard-streak-stats" className="mb-24 relative z-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               <GuildStatus user_id={profile?.user_id} />
               {disclosure.showHeatmap && (
               <div className="lg:col-span-2">
                 <RecoveryHeatmap completionLogs={completionLogs} />
               </div>
               )}
            </div>
        </div>
        )}

        <div id="dashboard-today-queue" className="mb-24 relative z-10 pt-10">
          <div className="flex items-center justify-between mb-16 border-l-4 border-blue-500/30 pl-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center border border-blue-500/10">
                <Activity className="w-7 h-7 text-blue-500 opacity-60" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-widest uppercase text-(--text-primary)">Today's Habits</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.5rem] opacity-40 mt-2 text-blue-500 italic">Your Plan for Today</p>
              </div>
            </div>
            {(groupedQuests?.due?.length || 0) > 0 && (
              <button 
                className="hidden lg:flex items-center gap-4 px-10 py-4 rounded-2xl nm-button text-[11px] font-black uppercase tracking-[0.25rem] text-blue-500 hover:scale-105 transition-all"
              >
                <span>Start Next Habit</span>
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
                    <h3 className="text-xl font-black uppercase tracking-widest text-red-500/60 italic">Catching Up (Overdue Habits)</h3>
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

              {/* Active Habits */}
              <div>
                <div className="flex items-center gap-4 mb-10 ml-2">
                  <Clock className="w-5 h-5 opacity-30" />
                  <h3 className="text-xl font-black uppercase tracking-widest opacity-40">Your Active Habits</h3>
                  <div className="flex-1 h-px bg-white/5"></div>
                </div>
                {questsLoading ? (
                  <div className="text-center py-24 text-(--text-secondary) font-black uppercase tracking-[0.6rem] opacity-10 animate-pulse italic">Connecting to the house...</div>
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
                            <h3 className="text-2xl font-black uppercase tracking-[0.5rem]">All Done For Today!</h3>
                            <p className="text-[10px] font-black mt-4 uppercase">You've finished all your daily habits.</p>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Finished Habits */}
              {groupedQuests.completed.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-10 ml-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500/40" />
                    <h3 className="text-xl font-black uppercase tracking-widest opacity-30 italic">Finished for Today</h3>
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
        <NotificationInbox 
          isOpen={isInboxOpen} 
          onClose={() => {
            setIsInboxOpen(false);
            setFocusedInboxId(null);
          }} 
          initialReplyId={focusedInboxId}
        />
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
