import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Shield, Palette, Activity, AlertCircle, CheckCircle2, Clock, ArrowRight, BarChart3, ShieldAlert, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { startOfDay, isSameDay } from "date-fns";

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
  const MotionDiv = motion.div;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [bounceBackMessage, setBounceBackMessage] = useState(null);
  
  const queryClient = useQueryClient();
  const user = supabase.auth.getUser();

  // Optimized Data Fetching
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      return data;
    }
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('progress').select('*').eq('user_id', user.id).single();
      return data;
    }
  });

  const { data: quests = [], isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      // Removing ambiguous profiles join to fix 400
      const { data } = await supabase.from('quests').select('*').order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: completionLogs = [] } = useQuery({
    queryKey: ['completionLogs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Adjusting select to remove problematic profile join if it's causing 400
      const { data } = await supabase.from('quest_completions').select('*').eq('user_id', user.id);
      return data;
    }
  });

  const { data: reviewQueue = [] } = useQuery({
    queryKey: ['reviewQueue'],
    queryFn: async () => {
      // Removing ambiguous profiles join to fix 400
      const { data } = await supabase.from('quests').select('*').eq('proof_required', true).eq('review_status', 'pending');
      return data;
    }
  });

  const { data: guildMember } = useQuery({
    queryKey: ['guildMember'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('guild_members').select('*, guilds(*)').eq('user_id', user.id).single();
      return data;
    }
  });

  // System Intelligence Logic
  const isAntiSpiralMode = useMemo(() => {
    if (!profile) return false;
    const lastRelapse = profile.last_relapse_at ? new Date(profile.last_relapse_at) : null;
    if (!lastRelapse) return false;
    // Activate if streak was lost in the last 48 hours and no new completions have occurred
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

  // Mutations
  const createQuestMutation = useMutation({
    mutationFn: async (newQuest) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('quests').insert([{ ...newQuest, user_id: user.id }]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setShowCreateForm(false);
    }
  });

  const completeQuestMutation = useMutation({
    mutationFn: async ({ quest, reflectionNote }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log completion
      await supabase.from('quest_completions').insert([{
        quest_id: quest.id,
        user_id: user.id,
        reflection_note: reflectionNote,
        xp_earned: quest.xp_reward,
        sp_earned: quest.sp_reward
      }]);

      // Update Wallet
      await supabase.rpc('update_wallet_rewards', {
        u_id: user.id,
        xp_amount: quest.xp_reward,
        sp_amount: quest.sp_reward
      });

      // Update Quest Status if Single
      if (quest.type === 'single') {
        await supabase.from('quests').update({ active: false }).eq('id', quest.id);
      }

      // Update Profile Streaks and Shadow Logic
      await supabase.rpc('process_quest_completion', {
        u_id: user.id,
        q_id: quest.id
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

      if (isCompletedToday) {
        result.completed.push(quest);
      } else if (quest.is_shadow_debt) {
        result.overdue.push(quest);
      } else {
        // Quest Chain Logic: If part of a chain, only show if it's the next position
        if (quest.chain_id) {
            const chainQuests = (quests || []).filter(q => q.chain_id === quest.chain_id);
            const completedInChain = (completionLogs || []).filter(l => 
                isSameDay(new Date(l.completed_at), today) && 
                chainQuests.some(cq => cq.id === l.quest_id)
            ).length;
            
            if (quest.chain_position === completedInChain + 1) {
                result.due.push(quest);
            }
        } else {
            result.due.push(quest);
        }
      }
    });

    return result;
  }, [quests, completionLogs]);

  const todayCount = (groupedQuests.completed || []).length;
  const currentRank = getCurrentRank(wallet?.xp || 0);

  const calculateStreak = (questId) => {
    const logs = (completionLogs || []).filter(l => l.quest_id === questId).sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at));
    // Hardcoded logic for demo streak calculation
    return logs.length;
  };

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400">
      <div className="max-w-7xl mx-auto">
        
        {/* Anti-Spiral Mode & Stabilization UI */}
        <AnimatePresence>
          {bounceBackMessage && (
            <MotionDiv
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-12 p-8 rounded-[2.5rem] nm-flat border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
            >
               <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl nm-flat-sm flex items-center justify-center text-blue-500 border border-blue-500/10">
                     <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-blue-500">System Intelligence Bulletin</h3>
                    <p className="text-sm font-bold opacity-60 mt-1 max-w-xl">{bounceBackMessage}</p>
                  </div>
               </div>
               <button 
                onClick={() => setBounceBackMessage(null)}
                className="px-8 py-4 rounded-2xl nm-button font-black text-[10px] uppercase tracking-widest text-blue-400 hover:text-blue-300 relative z-10"
               > Acknowledge </button>
            </MotionDiv>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAntiSpiralMode && (
            <MotionDiv
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-8 rounded-[2.5rem] nm-inset border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
            >
               <div className="absolute inset-0 bg-orange-500/5 animate-pulse"></div>
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl nm-flat-sm flex items-center justify-center text-orange-500 border border-orange-500/20">
                     <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-orange-500">Anti-Spiral Protocol Active</h3>
                    <p className="text-sm font-bold opacity-60 mt-1 max-w-xl italic">Execute stabilization objectives to restore system equilibrium.</p>
                  </div>
               </div>
               <div className="flex gap-3 relative z-10">
                  <div className="px-5 py-2 rounded-xl nm-flat-sm text-[9px] font-black uppercase text-orange-500 border border-orange-500/10">Stabilization: 0/3</div>
               </div>
            </MotionDiv>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 relative z-0">
           <div className="lg:col-span-4 flex flex-col gap-10">
              <GuildStatus user_id={user?.id} />
              <div className="relative">
                <RecoveryHeatmap completionLogs={completionLogs} />
              </div>
           </div>
           <div className="lg:col-span-8 h-full"><AuditLog /></div>
        </div>

        <div className="mb-24 relative z-10 pt-10">
          <div className="flex items-center justify-between mb-16 border-l-4 border-blue-500/30 pl-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center border border-blue-500/10">
                <Activity className="w-7 h-7 text-blue-500 opacity-60" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-widest uppercase text-(--text-primary)">Daily Execution Queue</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.5rem] opacity-40 mt-2 text-blue-500">Today's Tactical Assignment</p>
              </div>
            </div>
            {(groupedQuests?.due?.length || 0) > 0 && (
              <button className="hidden lg:flex items-center gap-4 px-10 py-4 rounded-2xl nm-button text-[11px] font-black uppercase tracking-[0.25rem] text-blue-500 hover:scale-105 transition-all">
                <span>Process Next Protocol</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <LayoutGroup id="quest-execution-coordinator">
            <div className="space-y-16">
              {(reviewQueue || []).length > 0 && (
                <MotionDiv
                  layout
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
                     {(reviewQueue || []).map((q) => (
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
                </MotionDiv>
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
          </LayoutGroup>
        </div>

        <ThemeSidebar isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
      </div>
      <AnimatePresence>
        {showWeeklyReview && <WeeklyReview onClose={() => setShowWeeklyReview(false)} />}
      </AnimatePresence>
    </div>
  );
}
