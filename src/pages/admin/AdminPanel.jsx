import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import SetupWizard from "../../components/admin/SetupWizard";
import TemplateManager from "../../components/admin/TemplateManager";
import ImportTools from "../../components/admin/ImportTools";
import CreateQuestForm from "../../components/dashboard/CreateQuestForm";
import { RECOVERY_TEMPLATES } from "@/constants/recoveryTemplates";
import { useAuth } from "@/hooks/useAuth";
import { useEngagement } from "@/hooks/useEngagement";
import MemberProfileModal from "../../components/guild/MemberProfileModal";

const MotionDiv = motion.div;

const TABS = [
  { id: "roster", name: "Community Roster", icon: Users },
  { id: "setup", name: "House Alignment", icon: Sparkles },
  { id: "quests", name: "Wellness Library", icon: ClipboardList, requiresDays: 30 },
  { id: "growth", name: "Community Stats", icon: Activity, requiresDays: 30 },
  { id: "system", name: "Support Settings", icon: Settings },
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
  const navigate = useNavigate();
  const disclosure = useEngagement(profile);
  const daysEnrolled = disclosure.daysSinceEnrollment || 0;


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
      console.error("❌ Error Creating Habit:", error.message);
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
      console.error("❌ Error Cloning Templates:", error.message);
    }
  });

  const handleViewProfile = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // Mock Data for the Admin Roster (In production this would correspond to real user profiles)
  const rosterData = [
    { id: 1, name: "Marcus Thorne", status: "Active", level: "Resilient", streak: 42, active: "2m ago", house: "North House", user_id: "mock_1" },
    { id: 2, name: "Elena Vance", status: "Needs Support", level: "Anchor", streak: 5, active: "1h ago", house: "North House", user_id: "mock_2" },
    { id: 3, name: "Julian Reed", status: "Struggling", level: "Foundation", streak: 0, active: "Offline", house: "North House", user_id: "mock_3" },
    { id: 4, name: "Sarah Chen", status: "Active", level: "Resilient", streak: 128, active: "Now", house: "North House", user_id: "mock_4" },
    { id: 5, name: "David Miller", status: "New Resident", level: "None", streak: 0, active: "Requested", house: "North House", user_id: "mock_5" },
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
              <h1 className="text-4xl font-black uppercase tracking-[0.5rem] leading-none mb-4 italic">Manager Dashboard</h1>
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 opacity-40">
                    <Activity className="w-3 h-3" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Manager Mode Active</p>
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
                <Plus className="w-4 h-4" /> Create Habit
             </button>
             <button className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all flex items-center gap-3">
                <FileDown className="w-4 h-4" /> Download Member List
             </button>
          </div>
        </div>

        {/* House Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 px-4">
           {[
             { label: "Active Residents", value: "18", trend: "+2", icon: Users, color: "text-blue-500" },
             { label: "House Stability", value: "94%", trend: "+5%", icon: ShieldCheck, color: "text-green-500" },
             { label: "Help Requests", value: "0", trend: "-1", icon: ShieldAlert, color: "text-red-500" },
             { label: "House Morale", value: "72%", trend: "Good", icon: Activity, color: "text-orange-500" }
           ].map((stat, i) => (
             <div key={i} className="p-8 rounded-4xl nm-flat border border-white/5 group hover:nm-button transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                   <div className={`w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-black italic tracking-tighter opacity-20 uppercase">{stat.trend}</span>
                </div>
                <p className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{stat.label}</p>
             </div>
           ))}
        </div>

        {/* Menu */}
        <div id="admin-tabs" className="flex flex-wrap gap-4 mb-12 p-3 rounded-[2.5rem] nm-inset overflow-x-auto mx-4">
          {TABS.map((tab) => {
            const isLocked = tab.requiresDays && daysEnrolled < tab.requiresDays;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isLocked) {
                    alert(`This part unlocks after ${tab.requiresDays} days. This lets your team get the basics down before changing too much. ${tab.requiresDays - daysEnrolled} days to go.`);
                    return;
                  }
                  setActiveTab(tab.id);
                  setShowWizard(false);
                }}
                className={`flex items-center gap-3 px-8 py-4 rounded-3xl transition-all duration-500 whitespace-nowrap ${
                  isLocked
                    ? 'opacity-20 cursor-not-allowed'
                    : activeTab === tab.id && !showWizard
                    ? 'nm-button text-purple-500 font-bold' 
                    : 'opacity-40 hover:opacity-100 hover:nm-flat-sm text-[11px] font-black uppercase tracking-widest'
                }`}
              >
                {isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <tab.icon className={`w-4 h-4 ${(activeTab === tab.id && !showWizard) ? 'animate-pulse' : ''}`} />
                )}
                <span className={(activeTab === tab.id && !showWizard) ? '' : 'text-[10px]'}>{tab.name}</span>
                {isLocked && <span className="text-[7px] font-black uppercase tracking-widest opacity-50">Day {tab.requiresDays}</span>}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div id="admin-roster-grid" className="mb-20">
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
                  <div id="system-preset-grid" className="space-y-4">
                    {/* Member Search */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/30 group-focus-within:text-purple-500 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="Search member list..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-16 pr-8 py-6 rounded-4xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold placeholder:opacity-20"
                        />
                      </div>
                      <button className="px-10 py-6 rounded-4xl nm-button text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                        <Filter className="w-4 h-4" /> Filter Status
                      </button>
                    </div>

                    {/* Member Roster Grid / Card View */}
                    <div id="admin-roster-grid-inner" className="mx-4">
                      {/* Desktop Table View */}
                      <div className="hidden md:block rounded-[3rem] nm-flat overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-purple-500/5">
                              <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Member Name</th>
                              <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40">Current Status</th>
                              <th className="p-8 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Level</th>
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
                                    member.status === 'Needs Support' ? 'text-orange-500' : 
                                    member.status === 'Crisis' ? 'text-red-500' : 'text-blue-400'
                                  }`}>
                                    <Zap className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{member.status}</span>
                                  </div>
                                </td>
                                <td className="p-8 text-center">
                                  <div className="inline-block px-3 py-1 rounded-lg nm-flat-sm text-[9px] font-black uppercase text-purple-500 tracking-tighter">
                                    {member.level}
                                  </div>
                                </td>
                                <td className="p-8 text-center text-sm font-black tracking-widest">{member.streak}d</td>
                                <td className="p-8 text-[10px] font-black opacity-30 uppercase tracking-widest">{member.active}</td>
                                <td className="p-8 text-right">
                                  <button 
                                    onClick={() => handleViewProfile(member)}
                                    className="p-3 rounded-xl nm-button opacity-0 group-hover:opacity-100 transition-all text-purple-500 active:scale-90"
                                    title="View Profile"
                                  >
                                    <Search className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-6">
                        {rosterData.map((member) => (
                          <div 
                            key={member.id} 
                            onClick={() => handleViewProfile(member)}
                            className="p-6 rounded-[2.5rem] nm-flat border border-white/5 space-y-4 active:scale-[0.98] transition-transform"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-purple-300 font-black">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="text-sm font-black uppercase tracking-wider">{member.name}</h3>
                                  <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{member.house}</p>
                                </div>
                              </div>
                              <div className={`px-4 py-2 rounded-xl nm-inset-sm flex items-center gap-2 ${
                                member.status === 'Active' ? 'text-green-500' : 
                                member.status === 'Needs Support' ? 'text-orange-500' : 
                                member.status === 'Crisis' ? 'text-red-500' : 'text-blue-400'
                              }`}>
                                <Zap className="w-3 h-3" />
                                <span className="text-[8px] font-black uppercase">{member.status}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/5">
                              <div className="text-center">
                                <p className="text-[8px] font-black uppercase opacity-30 tracking-tighter mb-1">Standing</p>
                                <p className="text-[9px] font-black text-purple-500">{member.level}</p>
                              </div>
                              <div className="text-center border-x border-white/5">
                                <p className="text-[8px] font-black uppercase opacity-30 tracking-tighter mb-1">Consistency</p>
                                <p className="text-[9px] font-black">{member.streak}d</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] font-black uppercase opacity-30 tracking-tighter mb-1">Last Online</p>
                                <p className="text-[9px] font-black">{member.active}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                    <div className="py-24 px-4 max-w-4xl mx-auto text-center space-y-16">
                       <div className="mx-auto w-12 h-12 rounded-2xl nm-flat flex items-center justify-center border-4 border-(--bg-color) mb-10 overflow-hidden">
                          <Settings className="w-12 h-12" />
                       </div>
                       <div className="space-y-6">
                          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Support Settings</h2>
                          <p className="text-sm font-black uppercase tracking-widest opacity-30 leading-relaxed italic max-w-lg mx-auto">
                             Adjust your community's colors, guidance signals, and house settings.
                          </p>
                       </div>
                       <button 
                          onClick={() => navigate('/system')}
                          className="px-16 py-8 rounded-4xl nm-button text-sm font-black uppercase tracking-[0.5em] text-purple-500 hover:text-purple-400 hover:scale-105 transition-all active:scale-95 flex items-center gap-6 mx-auto"
                       >
                          <Lock className="w-5 h-5 font-black" />
                          OPEN SETTINGS
                          <ArrowRight className="w-5 h-5" />
                       </button>
                       <div className="pt-16 grid grid-cols-2 gap-12 opacity-10 text-[10px] font-black uppercase tracking-[0.4em]">
                          <div className="py-6 rounded-3xl nm-inset-sm">Version: 3.0</div>
                          <div className="py-6 rounded-3xl nm-inset-sm">Secured</div>
                       </div>
                    </div>
                )}
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>

      <MemberProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        member={selectedMember} 
      />
    </div>
  );
}
