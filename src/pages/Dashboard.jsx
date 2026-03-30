import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Shield, Palette, Activity, AlertCircle, CheckCircle2, Clock, ArrowRight, BarChart3, ShieldAlert, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion as m } from "framer-motion";
import { startOfDay, subDays, isBefore, isSameDay, isWithinInterval } from "date-fns";

import MetricsDisplay from "../components/dashboard/MetricsDisplay";
import LevelProgress from "../components/dashboard/LevelProgress";
import { getCurrentRank } from "@/utils";
import QuestCard from "../components/dashboard/QuestCard";
import CreateQuestForm from "../components/dashboard/CreateQuestForm";
import PerfectDayBanner from "../components/dashboard/PerfectDayBanner";
import ThemeSidebar from "../components/dashboard/ThemeSidebar";
import AuditLog from "../components/dashboard/AuditLog";
import GuildStatus from "../components/dashboard/GuildStatus";
import DailyCheckIn from "../components/dashboard/DailyCheckIn";
import WeeklyReview from "../components/dashboard/WeeklyReview";
import RecoveryHeatmap from "../components/dashboard/RecoveryHeatmap";

export default function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPerfectDayBanner, setShowPerfectDayBanner] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [bounceBackMessage, setBounceBackMessage] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  // Fetch user profile
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

  // Fetch check-in for today
  const { data: todayCheckIn, isLoading: checkInLoading } = useQuery({
    queryKey: ['dailyCheckIn', user?.id],
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
    enabled: !!user?.id,
  });

  // Fetch all completion logs
  const { data: completionLogs = [] } = useQuery({
    queryKey: ['completionLogs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('quest_completions')
        .select('*')
        .order('completed_at', { ascending: false });
      return data || [];
    },
    initialData: [],
  });

  // Fetch all active quests
  const { data: quests = [], isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('quests')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      return data || [];
    },
    initialData: [],
  });

  useEffect(() => {
    if (!checkInLoading && !todayCheckIn && user) {
      const timer = setTimeout(() => setShowCheckIn(true), 500);
      return () => clearTimeout(timer);
    }
  }, [todayCheckIn, checkInLoading, user]);

  // Fetch quests awaiting review (for sponsors)
  const { data: reviewQueue = [] } = useQuery({
    queryKey: ['reviewQueue', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('quests')
        .select('*, profiles:creator_id(display_name, avatar_url)')
        .eq('review_status', 'pending');
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Relapse & Streak Logic
  useEffect(() => {
    const runRelapseCheck = async () => {
      if (!user || !profile || !completionLogs.length) return;

      const yesterday = startOfDay(subDays(new Date(), 1));
      const dailyHabits = quests.filter(q => q.type === "DAILY_HABIT" || q.type === "daily");
      
      if (dailyHabits.length === 0) return;

      const completedYesterdayCount = completionLogs.filter(log => 
        isSameDay(new Date(log.completed_at), yesterday) &&
        dailyHabits.some(h => h.id === log.quest_id)
      ).length;

      const totalHabits = dailyHabits.length;
      const yesterdayMissed = completedYesterdayCount < totalHabits;

      if (yesterdayMissed) {
        if (profile.current_streak > 0) {
           if (profile.grace_days > 0) {
             await supabase
               .from('profiles')
               .update({ grace_days: profile.grace_days - 1 })
               .eq('user_id', user.id);
             setBounceBackMessage("Grace protocol initiated. Streak sustained through protection reserves.");
           } else {
             // Reset streak + Deduct 50 SP Penalty
             await supabase
               .from('profiles')
               .update({ current_streak: 0 })
               .eq('user_id', user.id);
             
             const { data: wallet } = await supabase
               .from('progress')
               .select('sp')
               .eq('user_id', user.id)
               .single();
               
             if (wallet) {
               await supabase
                 .from('progress')
                 .update({ sp: Math.max(0, (wallet.sp || 0) - 50) })
                 .eq('user_id', user.id);
             }

             setBounceBackMessage("Critical System Failure: Streak reset. Protocol Breach logged. -50 SP Penalty applied. Initiate recovery protocols.");
           }
           queryClient.invalidateQueries({ queryKey: ['userProfile'] });
           queryClient.invalidateQueries({ queryKey: ['userWallet'] });
        }

        const missedQuests = dailyHabits.filter(h => 
          !completionLogs.some(log => isSameDay(new Date(log.completed_at), yesterday) && log.quest_id === h.id)
        );

        for (const mq of missedQuests) {
           const exists = quests.some(q => q.is_shadow_debt && q.title.includes(mq.title));
           if (!exists) {
             await supabase.from('quests').insert([{
               title: `RESTORE: ${mq.title}`,
               description: `Recovery protocol for missed habit: ${mq.title}`,
               category: 'recovery',
               type: 'single',
               xp_reward: Math.floor(mq.xp_reward * 0.5),
               sp_reward: Math.floor(mq.sp_reward * 0.5),
               is_shadow_debt: true,
               creator_id: user.id
             }]);
           }
        }
        queryClient.invalidateQueries({ queryKey: ['quests'] });
      }
    };

    runRelapseCheck();
  }, [user, profile, completionLogs, quests, queryClient]);

  // Fetch user role and guild info
  const { data: guildMember } = useQuery({
    queryKey: ['guildMember', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('guild_members')
        .select(`*, guilds(*)`)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch progress (wallet)
  const { data: wallet } = useQuery({
    queryKey: ['userWallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Mutations
  const createQuestMutation = useMutation({
    mutationFn: async (questData) => {
      const { data } = await supabase
        .from('quests')
        .insert([{ ...questData, creator_id: user.id }])
        .select()
        .single();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setShowCreateForm(false);
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async ({ quest, reflectionNote }) => {
      await supabase
        .from('quest_completions')
        .insert([{ 
          quest_id: quest.id, 
          user_id: user.id,
          reflection_note: reflectionNote 
        }]);

      if (wallet) {
        const newXp = (wallet.xp || 0) + (quest.xp_reward || 0);
        const newSp = (wallet.sp || 0) + (quest.sp_reward || 0);
        
        await supabase
          .from('progress')
          .update({ xp: newXp, sp: newSp })
          .eq('user_id', user.id);
      }

      if (quest.type === "SINGLE_ACTION" || quest.type === "single") {
        await supabase
          .from('quests')
          .update({ active: false })
          .eq('id', quest.id);
      }

      const dailyHabits = quests.filter(q => q.type === "DAILY_HABIT" || q.type === "daily");
      const completedTodayCount = completionLogs.filter(log => 
          isSameDay(new Date(log.completed_at), new Date()) && 
          dailyHabits.some(h => h.id === log.quest_id)
      ).length + 1;

      if (completedTodayCount === dailyHabits.length && profile) {
         const newStreak = profile.current_streak + 1;
         const newBest = Math.max(profile.best_streak, newStreak);
         await supabase
           .from('profiles')
           .update({ current_streak: newStreak, best_streak: newBest })
           .eq('user_id', user.id);
         setShowPerfectDayBanner(true);
         setTimeout(() => setShowPerfectDayBanner(false), 5000);
      }

      return quest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completionLogs'] });
      queryClient.invalidateQueries({ queryKey: ['userWallet'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  const completedToday = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime();
    return new Set(
      completionLogs
        .filter(log => startOfDay(new Date(log.completed_at)).getTime() === todayStart)
        .map(log => log.quest_id)
    );
  }, [completionLogs]);

  const isAntiSpiralMode = useMemo(() => {
    if (!profile) return false;
    // Activate if current streak is 0 AND user had a streak within the last 3 days
    const wasRecentlyActive = completionLogs.some(log => 
       isWithinInterval(new Date(log.completed_at), { 
         start: subDays(new Date(), 3), 
         end: new Date() 
       })
    );
    return profile.current_streak === 0 && wasRecentlyActive;
  }, [profile, completionLogs]);

  const calculateStreak = (questId) => {
    const questLogs = completionLogs
      .filter(log => log.quest_id === questId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

    if (questLogs.length === 0) return 0;
    let streak = 0;
    let checkDate = startOfDay(new Date());

    for (const log of questLogs) {
      const logDate = startOfDay(new Date(log.completed_at));
      if (logDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate = startOfDay(subDays(checkDate, 1));
      } else if (logDate.getTime() < checkDate.getTime()) break;
    }
    return streak;
  };

  const groupedQuests = useMemo(() => {
    const now = new Date();
    const result = { due: [], overdue: [], completed: [] };

    // Track highest completed position in each chain
    const chainProgress = new Map();
    quests.forEach(q => {
      if (completedToday.has(q.id) && q.chain_id) {
        const currentPos = q.chain_position || 1;
        if (!chainProgress.has(q.chain_id) || currentPos > chainProgress.get(q.chain_id)) {
          chainProgress.set(q.chain_id, currentPos);
        }
      }
    });

    const activeQuests = quests.filter(quest => {
      if (completedToday.has(quest.id)) {
        result.completed.push(quest);
        return false;
      }
      return true;
    });

    // In Anti-spiral mode, we prioritize "Minimum Viable Recovery" quests
    let dueList = activeQuests;
    if (isAntiSpiralMode) {
      dueList = activeQuests.sort((a,b) => {
        if (a.category === 'recovery' && b.category !== 'recovery') return -1;
        if (a.category !== 'recovery' && b.category === 'recovery') return 1;
        return (a.estimated_time || '').localeCompare(b.estimated_time || '');
      }).slice(0, 3);
    }

    activeQuests.forEach(quest => {
      // If it's part of a chain, only show if it's the NEXT one
      if (quest.chain_id) {
        const highestCompleted = chainProgress.get(quest.chain_id) || 0;
        if (quest.chain_position !== highestCompleted + 1) {
          // Skip if it's not the next in line
          return;
        }
      }

      if (isAntiSpiralMode && !dueList.includes(quest)) return;

      if (quest.is_shadow_debt) {
        result.overdue.push(quest);
        return;
      }
      if (quest.due_date && isBefore(new Date(quest.due_date), startOfDay(now))) {
        result.overdue.push(quest);
      } else {
        result.due.push(quest);
      }
    });
    return result;
  }, [quests, completedToday, isAntiSpiralMode]);

  const todayCount = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime();
    return completionLogs.filter(log => 
      new Date(log.completed_at).getTime() >= todayStart
    ).length;
  }, [completionLogs]);

  const currentRank = getCurrentRank(wallet?.xp || 0);

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {showCheckIn && <DailyCheckIn userId={user?.id} guildId={guildMember?.guild_id} onComplete={() => setShowCheckIn(false)} />}
          {showWeeklyReview && <WeeklyReview onClose={() => setShowWeeklyReview(false)} completionLogs={completionLogs} quests={quests} />}
          {showPerfectDayBanner && <PerfectDayBanner show={showPerfectDayBanner} />}
        </AnimatePresence>

        <AnimatePresence>
          {bounceBackMessage && (
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-6 rounded-3xl nm-flat-sm border border-blue-500/10 flex items-center gap-5"
            >
               <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                  <ShieldAlert className="w-6 h-6" />
               </div>
               <div className="flex-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">System Intelligence Bulletin</p>
                 <p className="text-sm font-bold opacity-80">{bounceBackMessage}</p>
               </div>
               <button 
                 onClick={() => setBounceBackMessage(null)}
                 className="p-3 rounded-xl nm-button text-[10px] font-black uppercase"
               > Dismiss </button>
            </m.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black flex items-center justify-center md:justify-start gap-5 uppercase tracking-widest leading-none">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center nm-flat">
                <Sparkles className="w-7 h-7 md:w-9 md:h-9 text-blue-500" />
              </div>
              Shadow Self
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-5 md:ml-21">
              <span className="text-(--text-secondary) font-black uppercase tracking-[0.4em] text-[10px] opacity-40">System Core v3.01</span>
              {guildMember && (
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full nm-inset-sm text-[10px] font-black uppercase tracking-widest opacity-80 border border-white/5">
                   <Shield className="w-4 h-4 text-blue-500" />
                   <span>{guildMember.guilds?.name} — {guildMember.role}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-row w-full md:w-auto gap-5 items-center">
            <button onClick={() => setShowWeeklyReview(true)} className="w-16 h-16 rounded-2xl nm-button flex items-center justify-center group transition-colors hover:text-blue-500">
              <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => setIsThemeOpen(true)} className="w-16 h-16 rounded-2xl nm-button flex items-center justify-center group transition-colors hover:text-blue-500">
              <Palette className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            {!showCreateForm && (
              <button onClick={() => setShowCreateForm(true)} className="flex-1 md:flex-none py-5.5 px-9 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.3rem] flex items-center justify-center gap-4 group transition-all">
                <Plus className="w-5.5 h-5.5 group-hover:rotate-90 transition-transform" />
                New Quest
              </button>
            )}
          </div>
        </div>

        <div className="mb-12"><LevelProgress totalXp={wallet?.xp || 0} /></div>

        <MetricsDisplay todayCount={todayCount} wallet={wallet} profile={profile} currentRank={currentRank} />

        <AnimatePresence>
          {showCreateForm && <CreateQuestForm onSubmit={(data) => createQuestMutation.mutate(data)} onCancel={() => setShowCreateForm(false)} />}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
           <div className="lg:col-span-4 space-y-10">
              <GuildStatus user_id={user?.id} />
              <RecoveryHeatmap completionLogs={completionLogs} />
           </div>
           <div className="lg:col-span-8"><AuditLog /></div>
        </div>

        <div className="mb-20">
          <div className="flex items-center justify-between mb-12 border-l-4 border-blue-500/20 pl-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center"><Activity className="w-6 h-6 opacity-40" /></div>
              <div>
                <h2 className="text-3xl font-black tracking-widest uppercase">Daily Execution Queue</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4rem] opacity-30 mt-1">Today's Tactical Assignment</p>
              </div>
            </div>
            {groupedQuests.due.length > 0 && (
              <button className="hidden md:flex items-center gap-4 px-8 py-3 rounded-2xl nm-button text-[10px] font-black uppercase tracking-[0.2rem] text-blue-500 hover:scale-105 transition-all">
                <span>Process Next Protocol</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-16">
            {reviewQueue.length > 0 && (
              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-20 p-10 rounded-[3rem] nm-flat transition-all border border-blue-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                         <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-widest">Awaiting Verification</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4rem] opacity-30 mt-1 text-blue-500">Sponsor Oversight Module</p>
                      </div>
                   </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 relative z-10">
                   {reviewQueue.map((q) => (
                      <div key={q.id} className="p-6 rounded-3xl nm-inset-sm border border-white/5 group hover:nm-inset transition-all">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <h4 className="text-lg font-black uppercase tracking-tight opacity-90">{q.title}</h4>
                               <p className="text-[10px] font-bold uppercase opacity-40 mt-1">Submitted by: {q.profiles?.display_name || 'Protocol Member'}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-blue-500">+{q.xp_reward} Merit</p>
                               <p className="text-[10px] font-bold opacity-30 uppercase tracking-tighter mt-1">{q.category}</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <button 
                              onClick={() => {
                                supabase.from('quests').update({ review_status: 'approved' }).eq('id', q.id).then(() => {
                                   queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
                                   queryClient.invalidateQueries({ queryKey: ['quests'] });
                                });
                              }}
                              className="flex-1 py-3.5 rounded-xl nm-button font-black text-[10px] uppercase tracking-widest text-green-500 hover:scale-[1.02] transition-all"
                            > Verify </button>
                            <button className="flex-1 py-3.5 rounded-xl nm-button font-black text-[10px] uppercase tracking-widest text-red-500 opacity-60 hover:opacity-100 transition-all"> Reject </button>
                         </div>
                      </div>
                   ))}
                </div>
              </m.div>
            )}

            {groupedQuests.overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8 ml-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-black uppercase tracking-widest text-red-500/80">Shadow Debt (Overdue)</h3>
                  <div className="flex-1 h-px bg-red-500/10"></div>
                </div>
                <div className="grid gap-10 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
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
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-4 mb-8 ml-2">
                <Clock className="w-5 h-5 opacity-30" />
                <h3 className="text-lg font-black uppercase tracking-widest opacity-40">Due Protocols</h3>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>
              {questsLoading ? (
                <div className="text-center py-20 text-(--text-secondary) font-bold uppercase tracking-[0.5rem] opacity-20 animate-pulse">Establishing Core Connection...</div>
              ) : (
                <div className="grid gap-10 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {groupedQuests.due.map((quest) => (
                      <QuestCard 
                        key={quest.id} 
                        quest={quest} 
                        onComplete={(q, note) => completeQuestMutation.mutate({ quest: q, reflectionNote: note })} 
                        isCompleted={false} 
                        streak={calculateStreak(quest.id)} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {groupedQuests.completed.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8 ml-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500/40" />
                  <h3 className="text-lg font-black uppercase tracking-widest opacity-30">Cleared Protocols</h3>
                  <div className="flex-1 h-px bg-green-500/5"></div>
                </div>
                <div className="grid gap-10 md:grid-cols-2 opacity-60">
                  <AnimatePresence mode="popLayout">
                    {groupedQuests.completed.map((quest) => (
                      <QuestCard 
                        key={quest.id} 
                        quest={quest} 
                        onComplete={(q, note) => completeQuestMutation.mutate({ quest: q, reflectionNote: note })} 
                        isCompleted={true} 
                        streak={calculateStreak(quest.id)} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        <ThemeSidebar isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
      </div>
    </div>
  );
}
