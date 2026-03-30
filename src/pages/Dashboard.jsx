
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Store } from "lucide-react";
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

export default function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPerfectDayBanner, setShowPerfectDayBanner] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  // Fetch or create user wallet
  const { data: wallet } = useQuery({
    queryKey: ['userWallet', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const wallets = await base44.entities.UserWallet.filter({ user_id: user.email });
      if (wallets.length > 0) {
        return wallets[0];
      }
      // Create wallet if doesn't exist
      return await base44.entities.UserWallet.create({
        user_id: user.email,
        sp_balance: 0,
        total_xp: 0,
        current_level: 1,
        total_perfect_days: 0
      });
    },
    enabled: !!user?.email,
  });

  // Fetch all active quests
  const { data: quests = [], isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: () => base44.entities.Quest.filter({ active: true }, '-created_date'),
    initialData: [],
  });

  // Fetch all completion logs
  const { data: completionLogs = [] } = useQuery({
    queryKey: ['completionLogs'],
    queryFn: () => base44.entities.CompletionLog.list('-completion_date'),
    initialData: [],
  });

  // Create quest mutation
  const createQuestMutation = useMutation({
    mutationFn: (questData) => base44.entities.Quest.create(questData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setShowCreateForm(false);
    },
  });


  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: async (quest) => {
      // Log completion
      await base44.entities.CompletionLog.create({
        quest_id: quest.id,
        quest_name: quest.name,
        quest_type: quest.type,
        completion_date: new Date().toISOString(),
      });

      // Update wallet
      if (wallet) {
        const newXp = (wallet.total_xp || 0) + (quest.xp_reward || 0);
        const newSp = (wallet.sp_balance || 0) + (quest.sp_reward || 0);
        const newLevel = getCurrentRank(newXp).level;

        await base44.entities.UserWallet.update(wallet.id, {
          total_xp: newXp,
          sp_balance: newSp,
          current_level: newLevel,
        });
      }

      // If single action, deactivate the quest
      if (quest.type === "SINGLE_ACTION") {
        await base44.entities.Quest.update(quest.id, { active: false });
      }

      return quest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completionLogs'] });
      queryClient.invalidateQueries({ queryKey: ['userWallet'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      
      // Check for perfect day after a short delay
      setTimeout(checkPerfectDay, 500);
    },
  });

  // Calculate streak for a quest
  const calculateStreak = (questId) => {
    const questLogs = completionLogs
      .filter(log => log.quest_id === questId)
      .sort((a, b) => new Date(b.completion_date) - new Date(a.completion_date));

    if (questLogs.length === 0) return 0;

    let streak = 0;
    let checkDate = startOfDay(new Date());

    for (const log of questLogs) {
      const logDate = startOfDay(new Date(log.completion_date));
      
      if (logDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate = startOfDay(subDays(checkDate, 1));
      } else if (logDate.getTime() < checkDate.getTime()) {
        break;
      }
    }

    return streak;
  };

  // Check for perfect day
  const checkPerfectDay = async () => {
    const dailyHabits = quests.filter(q => q.type === "DAILY_HABIT");
    if (dailyHabits.length === 0) return;

    const allCompleted = dailyHabits.every(quest => completedToday.has(quest.id));
    
    if (allCompleted && wallet) {
      // Award perfect day bonus
      const perfectDayBonus = 100;
      await base44.entities.UserWallet.update(wallet.id, {
        sp_balance: (wallet.sp_balance || 0) + perfectDayBonus,
        total_perfect_days: (wallet.total_perfect_days || 0) + 1,
      });
      
      queryClient.invalidateQueries({ queryKey: ['userWallet'] });
      setShowPerfectDayBanner(true);
      setTimeout(() => setShowPerfectDayBanner(false), 5000);
    }
  };

  // Calculate metrics
  const todayStart = startOfDay(new Date()).toISOString();
  const todayCount = completionLogs.filter(log => 
    new Date(log.completion_date) >= new Date(todayStart)
  ).length;
  const totalCount = completionLogs.length;

  const currentRank = getCurrentRank(wallet?.total_xp || 0);

  // Calculate which daily habits were completed today
  const completedToday = React.useMemo(() => {
    return new Set(
      completionLogs
        .filter(log => {
          const logDate = startOfDay(new Date(log.completion_date));
          const today = startOfDay(new Date());
          return logDate.getTime() === today.getTime();
        })
        .map(log => log.quest_id)
    );
  }, [completionLogs]);

  const handleCompleteQuest = (quest) => {
    completeQuestMutation.mutate(quest);
  };

  const handleCreateQuest = (questData) => {
    createQuestMutation.mutate(questData);
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0] px-4 py-8 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-10 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center justify-center md:justify-start gap-4">
              <div className="
                w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center
                bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
              ">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
              </div>
              Shadow Self
            </h1>
            <p className="text-gray-500 mt-3 md:ml-18 font-medium">Persistent Accountability System</p>
          </div>
          
          <div className="flex flex-row w-full md:w-auto gap-4">
            <Link
              to={createPageUrl('ShadowVault')}
              className="
                flex-1 md:flex-none py-4 px-6 md:px-8 rounded-2xl
                bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]
                hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
                active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                transition-all duration-200
                text-gray-800 font-bold text-sm
                flex items-center justify-center gap-2
              "
            >
              <Store className="w-5 h-5" />
              Store
            </Link>

            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="
                  flex-1 md:flex-none py-4 px-6 md:px-8 rounded-2xl
                  bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]
                  hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
                  active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]
                  transition-all duration-200
                  text-gray-800 font-bold text-sm
                  flex items-center justify-center gap-2
                "
              >
                <Plus className="w-5 h-5" />
                New Quest
              </button>
            )}
          </div>
        </div>

        {/* Level Progress */}
        <LevelProgress totalXp={wallet?.total_xp || 0} />

        {/* Metrics */}
        <MetricsDisplay 
          todayCount={todayCount} 
          totalCount={totalCount} 
          wallet={wallet}
          currentRank={currentRank}
        />

        {/* Create Quest Form */}
        <AnimatePresence>
          {showCreateForm && (
            <CreateQuestForm
              onSubmit={handleCreateQuest}
              onCancel={() => setShowCreateForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Quest List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Quests</h2>
          
          {questsLoading ? (
            <div className="text-center py-12 text-gray-500">Loading quests...</div>
          ) : quests.length === 0 ? (
            <div className="
              text-center py-16 rounded-3xl
              bg-[#e0e0e0] shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]
            ">
              <p className="text-gray-500 text-lg">No active quests yet</p>
              <p className="text-gray-400 text-sm mt-2">Create your first quest to get started</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <AnimatePresence>
                {quests.map((quest) => {
                  const isCompleted = quest.type === "DAILY_HABIT" && completedToday.has(quest.id);
                  const streak = quest.type === "DAILY_HABIT" ? calculateStreak(quest.id) : 0;
                  return (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={handleCompleteQuest}
                      isCompleted={isCompleted}
                      streak={streak}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Perfect Day Banner */}
        <AnimatePresence>
          <PerfectDayBanner show={showPerfectDayBanner} />
        </AnimatePresence>
      </div>
    </div>
  );
}
