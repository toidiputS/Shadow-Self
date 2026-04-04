import React, { useState } from "react";
import { supabase } from "@/api/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { 
  Users, 
  ShieldCheck, 
  FileText, 
  BarChart3, 
  Settings, 
  Bell, 
  CreditCard, 
  HeartHandshake, 
  ShieldAlert,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  Zap,
  Lock,
  ArrowRight,
  ClipboardList,
  Sparkles,
  FileDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsHub from "../../components/system/NotificationsHub";
import SubscriptionNode from "../../components/system/SubscriptionNode";
import SetupWizard from "../../components/admin/SetupWizard";
import TemplateManager from "../../components/admin/TemplateManager";
import ImportTools from "../../components/admin/ImportTools";
import CreateQuestForm from "../../components/dashboard/CreateQuestForm";
import { RECOVERY_TEMPLATES } from "@/constants/recoveryTemplates";
import { useAuth } from "@/hooks/useAuth";
import MemberIntelligenceModal from "../../components/guild/MemberIntelligenceModal";

const MotionDiv = motion.div;

const TABS = [
  { id: "roster", name: "Member Roster", icon: Users },
  { id: "setup", name: "House Setup", icon: Sparkles },
  { id: "quests", name: "Quest Library", icon: ClipboardList },
  { id: "growth", name: "Growth Node", icon: Activity },
  { id: "system", name: "System Node", icon: Settings },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("roster");
  const [searchTerm, setSearchTerm] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [showCreateQuest, setShowCreateQuest] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();


  const createQuestMutation = useMutation({
    mutationFn: async (questData) => {
      const dataToInsert = {
        ...questData,
        creator_id: user?.id,
        guild_id: profile?.guild_id,
        quest_source: 'admin_template'
      };
      const { data, error } = await supabase.from('quests').insert([dataToInsert]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setShowCreateQuest(false);
    },
    onError: (error) => {
      console.error("❌ Protocol Creation Breach:", error.message);
    }
  });

  const cloneMutation = useMutation({
    mutationFn: async (templateIds) => {
      const templatesToClone = RECOVERY_TEMPLATES.filter(t => templateIds.includes(t.id));
      const questsToInsert = templatesToClone.map(t => ({
        title: t.name,
        xp_reward: t.xp,
        sp_reward: t.sp,
        type: t.freq.toLowerCase().includes('daily') ? 'daily' : t.freq.toLowerCase() === 'once' ? 'once' : 'single',
        category: 'recovery',
        active: true,
        description: t.desc,
        creator_id: user?.id,
        guild_id: profile?.guild_id,
        quest_source: 'admin_template'
      }));
      const { data, error } = await supabase.from('quests').insert(questsToInsert).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
    onError: (error) => {
      console.error("❌ Template Cloning Breach:", error.message);
    }
  });

  const handleViewIntelligence = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // Mock Data for the Admin Roster (In production this would correspond to real user profiles)
  const rosterData = [
    { id: 1, name: "Marcus Thorne", status: "Active", tier: "Gold", streak: 42, active: "2m ago", house: "North House", user_id: "mock_1" },
    { id: 2, name: "Elena Vance", status: "Warning", tier: "Silver", streak: 5, active: "1h ago", house: "North House", user_id: "mock_2" },
    { id: 3, name: "Julian Reed", status: "Breach", tier: "Bronze", streak: 0, active: "Offline", house: "North House", user_id: "mock_3" },
    { id: 4, name: "Sarah Chen", status: "Active", tier: "Gold", streak: 128, active: "Now", house: "North House", user_id: "mock_4" },
    { id: 5, name: "David Miller", status: "Pending", tier: "None", streak: 0, active: "Requested", house: "North House", user_id: "mock_5" },
  ];

  return (
    <div className="bg-(--bg-color) text-(--text-primary) p-4 md:p-12 transition-colors duration-400">

      <div className="max-w-7xl mx-auto">
        
        {/* Admin Command Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-4">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-4xl nm-flat flex items-center justify-center text-purple-500 relative group cursor-pointer" onClick={() => setShowWizard(true)}>
                <div className="absolute inset-0 bg-purple-500/10 rounded-4xl animate-pulse"></div>
                <ShieldCheck className="w-10 h-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-[0.5rem] leading-none mb-4 italic">Admin Panel</h1>
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 opacity-40">
                    <Activity className="w-3 h-3" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Oversight Protocol Active</p>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-purple-500/20"></span>
                  <button 
                    onClick={() => setShowWizard(true)}
                    className="text-[9px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Quick Setup Guide
                  </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
              <button 
                onClick={() => {
                  setActiveTab("quests");
                  setShowCreateQuest(true);
                }}
                className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-purple-500 hover:scale-105 transition-all flex items-center gap-3"
              >
                <Plus className="w-4 h-4" /> Create Quest Template
             </button>

             <button className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all flex items-center gap-3">
                <FileDown className="w-4 h-4" /> Export Audit Log
             </button>
          </div>
        </div>

        {/* Tactical Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 p-3 rounded-[2.5rem] nm-inset overflow-x-auto mx-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowWizard(false);
              }}
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl transition-all duration-500 whitespace-nowrap ${
                activeTab === tab.id && !showWizard
                ? 'nm-button text-purple-500 font-bold' 
                : 'opacity-40 hover:opacity-100 hover:nm-flat-sm text-[11px] font-black uppercase tracking-widest'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${(activeTab === tab.id && !showWizard) ? 'animate-pulse' : ''}`} />
              <span className={(activeTab === tab.id && !showWizard) ? '' : 'text-[10px]'}>{tab.name}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {showWizard ? (
            <MotionDiv
              key="wizard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12"
            >
              <SetupWizard onComplete={() => setShowWizard(false)} />
            </MotionDiv>
          ) : (
            <MotionDiv
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-[500px] px-4"
            >
              {activeTab === "roster" && (
                <div className="space-y-8">
                  {/* Tactical Search & Filter */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/30 group-focus-within:text-purple-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search member roster..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-6 rounded-4xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold placeholder:opacity-20"
                      />
                    </div>
                    <button className="px-10 py-6 rounded-4xl nm-button text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                      <Filter className="w-4 h-4" /> Filter Status
                    </button>
                  </div>

                  {/* Member Roster Grid */}
                  <div className="rounded-[3rem] nm-flat overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-purple-500/5">
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Identity Node</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Current Status</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Clearance</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Streak</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Last Activity</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rosterData.map((member) => (
                          <tr key={member.id} className="group hover:bg-purple-500/2 transition-colors border-b border-purple-500/5 last:border-none">
                            <td className="p-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-purple-300 font-black">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="text-sm font-black uppercase tracking-wider">{member.name}</h3>
                                  <p className="text-[10px] font-bold opacity-30 italic">{member.house}</p>
                                </div>
                              </div>
                            </td>
                             <td className="p-8">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl nm-inset-sm ${
                                member.status === 'Active' ? 'text-green-500' : 
                                member.status === 'Warning' ? 'text-orange-500' : 
                                member.status === 'Breach' ? 'text-red-500' : 'text-blue-500'
                              }`}>
                                <Zap className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{member.status}</span>
                              </div>
                            </td>
                            <td className="p-8 text-center">
                               <div className="inline-block px-3 py-1 rounded-lg nm-flat-sm text-[9px] font-black uppercase text-purple-500 tracking-tighter">
                                 {member.tier}
                               </div>
                            </td>
                            <td className="p-8 text-center text-sm font-black tracking-widest">{member.streak}d</td>
                            <td className="p-8 text-[10px] font-black opacity-30 uppercase tracking-widest">{member.active}</td>
                            <td className="p-8 text-right">
                               <button 
                                 onClick={() => handleViewIntelligence(member)}
                                 className="p-3 rounded-xl nm-button opacity-0 group-hover:opacity-100 transition-all text-purple-500 active:scale-90"
                                 title="View Intel"
                                >
                                  <Search className="w-4 h-4" />
                                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "setup" && (
                <div className="py-8">
                   <SetupWizard onComplete={() => setActiveTab("roster")} />
                </div>
              )}

              {activeTab === "quests" && (
                <div className="pb-12 space-y-12">
                   {showCreateQuest ? (
                      <CreateQuestForm 
                        onCancel={() => setShowCreateQuest(false)} 
                        onSubmit={(data) => {
                          createQuestMutation.mutate(data);
                        }} 
                      />

                   ) : (
                      <TemplateManager 
                        onClone={(ids) => cloneMutation.mutate(ids)} 
                        onCreate={() => setShowCreateQuest(true)}
                      />

                   )}
                </div>
              )}


              {activeTab === "growth" && (
                <div className="pb-12">
                   <ImportTools />
                </div>
              )}

              {activeTab === "system" && (
                  <div className="space-y-12 pb-12">
                     <div className="p-12 rounded-[3.5rem] nm-inset space-y-12">
                        <NotificationsHub />
                        <div className="border-t border-purple-500/10 pt-12">
                          <SubscriptionNode />
                        </div>
                     </div>
                  </div>
              )}
            </MotionDiv>
          )}
        </AnimatePresence>

      </div>

      <MemberIntelligenceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        member={selectedMember} 
      />
    </div>
  );
}
