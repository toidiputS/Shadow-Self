import React, { useState, useMemo } from "react";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Store, Shield, Users, Crown, User, Palette, LayoutDashboard, History, Activity } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { startOfDay, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import MetricsDisplay from "../components/dashboard/MetricsDisplay";
import LevelProgress from "../components/dashboard/LevelProgress";
import { getCurrentRank } from "@/utils";
import QuestCard from "../components/dashboard/QuestCard";
import CreateQuestForm from "../components/dashboard/CreateQuestForm";
import PerfectDayBanner from "../components/dashboard/PerfectDayBanner";
import ThemeSidebar from "../components/dashboard/ThemeSidebar";
import AuditLog from "../components/dashboard/AuditLog";
import GuildStatus from "../components/dashboard/GuildStatus";

export default function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPerfectDayBanner, setShowPerfectDayBanner] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
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

  // Fetch user role and guild info
  const { data: guildMember } = useQuery({
    queryKey: ['guildMember', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('guild_members')
        .select(`
          *,
          guilds(*)
        `)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch or create user progress (wallet)
  const { data: wallet } = useQuery({
    queryKey: ['userWallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) return data;
      
      const { data: newData } = await supabase
        .from('progress')
        .insert([{ user_id: user.id }])
        .select()
        .single();
      return newData;
    },
    enabled: !!user?.id,
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

  // Create quest mutation
  const createQuestMutation = useMutation({
    mutationFn: async (questData) => {
      const { data } = await supabase
        .from('quests')
        .insert([{ 
          ...questData,
          creator_id: user.id
        }])
        .select()
        .single();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setShowCreateForm(false);
    },
  });

  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: async (quest) => {
      await supabase
        .from('quest_completions')
        .insert([{
          quest_id: quest.id,
          user_id: user.id
        }]);

      if (wallet) {
        const newXp = (wallet.xp || 0) + (quest.xp_reward || 0);
        const newSp = (wallet.sp || 0) + (quest.sp_reward || 0);
        
        await supabase
          .from('progress')
          .update({
            xp: newXp,
            sp: newSp,
          })
          .eq('user_id', user.id);
      }

      if (quest.type === "SINGLE_ACTION" || quest.type === "single") {
        await supabase
          .from('quests')
          .update({ active: false })
          .eq('id', quest.id);
      }

      return quest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completionLogs'] });
      queryClient.invalidateQueries({ queryKey: ['userWallet'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setTimeout(checkPerfectDay, 500);
    },
  });

  const completedToday = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    return new Set(
      completionLogs
        .filter(log => startOfDay(new Date(log.completed_at)).getTime() === today)
        .map(log => log.quest_id)
    );
  }, [completionLogs]);

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
      } else if (logDate.getTime() < checkDate.getTime()) {
        break;
      }
    }
    return streak;
  };

  const checkPerfectDay = async () => {
    const dailyHabits = quests.filter(q => q.type === "DAILY_HABIT" || q.type === "daily");
    if (dailyHabits.length === 0) return;

    const allCompleted = dailyHabits.every(quest => completedToday.has(quest.id));
    if (allCompleted && wallet) {
      const perfectDayBonus = 100;
      await supabase
        .from('progress')
        .update({
          sp: (wallet.sp || 0) + perfectDayBonus,
          perfect_days: (wallet.perfect_days || 0) + 1,
        })
        .eq('user_id', user.id);
      
      queryClient.invalidateQueries({ queryKey: ['userWallet'] });
      setShowPerfectDayBanner(true);
      setTimeout(() => setShowPerfectDayBanner(false), 5000);
    }
  };

  const todayCount = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime();
    return completionLogs.filter(log => 
      new Date(log.completed_at).getTime() >= todayStart
    ).length;
  }, [completionLogs]);

  const currentRank = getCurrentRank(wallet?.xp || 0);

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'member': return <User className="w-4 h-4 text-(--text-secondary)" />;
      default: return <Users className="w-4 h-4 text-(--text-secondary)" />;
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full nm-inset-sm text-[10px] font-black uppercase tracking-[0.1em] opacity-80 border border-white/5">
                  {getRoleIcon(guildMember.role)}
                  <span>{guildMember.guilds?.name} — {guildMember.role}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-row w-full md:w-auto gap-5 items-center">
            <button
              onClick={() => setIsThemeOpen(true)}
              className="w-16 h-16 rounded-2xl nm-button flex items-center justify-center group transition-colors hover:text-blue-500"
              title="System Appearance"
            >
              <Palette className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <Link
              to={createPageUrl('ShadowVault')}
              className="flex-1 md:flex-none py-5.5 px-9 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.3rem] flex items-center justify-center gap-4 group transition-all"
            >
              <Store className="w-5.5 h-5.5 group-hover:scale-110 transition-transform" />
              Guild Vault
            </Link>

            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex-1 md:flex-none py-5.5 px-9 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.3rem] flex items-center justify-center gap-4 group transition-all"
              >
                <Plus className="w-5.5 h-5.5 group-hover:rotate-90 transition-transform" />
                New Quest
              </button>
            )}
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-12">
            <LevelProgress totalXp={wallet?.xp || 0} />
        </div>

        {/* Primary Metrics */}
        <MetricsDisplay 
          todayCount={todayCount} 
          wallet={wallet}
          currentRank={currentRank}
        />

        {/* Create Quest Area */}
        <AnimatePresence>
          {showCreateForm && (
            <CreateQuestForm
              onSubmit={(data) => createQuestMutation.mutate(data)}
              onCancel={() => setShowCreateForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Middle Row: Status & Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
           <div className="lg:col-span-1">
             <div className="flex items-center gap-3 mb-6 ml-2">
                <LayoutDashboard className="w-5 h-5 opacity-40" />
                <h2 className="text-xl font-black tracking-widest uppercase">Institutional Oversight</h2>
             </div>
             <GuildStatus user_id={user?.id} />
           </div>
           <div className="lg:col-span-2">
             <div className="flex items-center gap-3 mb-6 ml-2">
                <History className="w-5 h-5 opacity-40" />
                <h2 className="text-xl font-black tracking-widest uppercase">Guild Registry</h2>
             </div>
             <AuditLog />
           </div>
        </div>

        {/* Bottom Area: Quests */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-10 border-l-4 border-blue-500/20 pl-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center">
                <Activity className="w-6 h-6 opacity-40" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-widest uppercase">Active Clearance Protocols</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4rem] opacity-30 mt-1">Institutional Assignment Queue</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full nm-inset-xs text-[10px] font-black uppercase tracking-widest opacity-30">
               <Shield className="w-3.5 h-3.5" />
               <span>Authenticated Sync</span>
            </div>
          </div>
          
          {questsLoading ? (
            <div className="text-center py-20 text-(--text-secondary) font-bold uppercase tracking-[0.5rem] opacity-20 animate-pulse">Establishing Core Connection...</div>
          ) : quests.length === 0 ? (
            <div className="text-center py-24 rounded-4xl nm-inset bg-black/5">
              <p className="text-(--text-secondary) text-xl font-black uppercase tracking-widest opacity-80">No active clearance protocols assigned</p>
              <p className="opacity-40 text-sm mt-4 font-medium italic">Synchronize with guild-master for next tasking cycles</p>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {quests.map((quest) => {
                  const isCompleted = (quest.type === "DAILY_HABIT" || quest.type === "daily") && completedToday.has(quest.id);
                  const streak = (quest.type === "DAILY_HABIT" || quest.type === "daily") ? calculateStreak(quest.id) : 0;
                  return (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={(q) => completeQuestMutation.mutate(q)}
                      isCompleted={isCompleted}
                      streak={streak}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Banners & Sidebars */}
        <AnimatePresence>
          <PerfectDayBanner show={showPerfectDayBanner} />
        </AnimatePresence>
        <ThemeSidebar isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
      </div>
    </div>
  );
}
