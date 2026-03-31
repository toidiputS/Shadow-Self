import React, { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsHub from "../../components/system/NotificationsHub";
import SubscriptionNode from "../../components/system/SubscriptionNode";

const MotionDiv = motion.div;

const TABS = [
  { id: "roster", name: "Member Roster", icon: Users },
  { id: "roles", name: "Roles & Sponsors", icon: ShieldCheck },
  { id: "quests", name: "Quest Builder", icon: FileText },
  { id: "audit", name: "Audit & Log", icon: BarChart3 },
  { id: "governance", name: "Grace & Guild", icon: HeartHandshake },
  { id: "system", name: "System Node", icon: Settings },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("roster");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock Data for the Admin Roster
  const rosterData = [
    { id: 1, name: "Marcus Thorne", status: "Active", tier: "Gold", streak: 42, active: "2m ago", house: "North House" },
    { id: 2, name: "Elena Vance", status: "Warning", tier: "Silver", streak: 5, active: "1h ago", house: "East House" },
    { id: 3, name: "Julian Reed", status: "Breach", tier: "Bronze", streak: 0, active: "Offline", house: "North House" },
    { id: 4, name: "Sarah Chen", status: "Active", tier: "Gold", streak: 128, active: "Now", house: "West Wing" },
    { id: 5, name: "David Miller", status: "Pending", tier: "None", streak: 0, active: "Requested", house: "Pending Approval" },
  ];

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) p-4 md:p-12 transition-colors duration-400">
      <div className="max-w-7xl mx-auto">
        
        {/* Admin Command Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-4xl nm-flat flex items-center justify-center text-purple-500 relative group">
                <div className="absolute inset-0 bg-purple-500/10 rounded-4xl animate-pulse"></div>
                <ShieldCheck className="w-10 h-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-[0.5rem] leading-none mb-4 italic">Admin Panel</h1>
              <div className="flex items-center gap-2 opacity-40">
                  <Activity className="w-3 h-3" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Oversight Protocol Active</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <button className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-purple-500 hover:scale-105 transition-all flex items-center gap-3">
                <Plus className="w-4 h-4" /> Create Quest Template
             </button>
             <button className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
                Export Audit Log
             </button>
          </div>
        </div>

        {/* Tactical Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 p-3 rounded-[2.5rem] nm-inset overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl transition-all duration-500 whitespace-nowrap ${
                activeTab === tab.id 
                ? 'nm-button text-purple-500 font-bold' 
                : 'opacity-40 hover:opacity-100 hover:nm-flat-sm text-[11px] font-black uppercase tracking-widest'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              <span className={activeTab === tab.id ? '' : 'text-[10px]'}>{tab.name}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-[500px]"
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
                             <button className="p-3 rounded-xl nm-button opacity-0 group-hover:opacity-100 transition-all text-purple-500">
                                <ArrowRight className="w-4 h-4" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "quests" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <div className="p-10 rounded-[2.5rem] nm-flat border-2 border-dashed border-purple-500/20 flex flex-col items-center justify-center text-center group hover:border-purple-500/40 transition-all cursor-pointer">
                      <div className="w-20 h-20 rounded-4xl nm-inset-sm flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                         <Plus className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-widest mb-2">New Template</h3>
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Architect a fresh recovery objective</p>
                   </div>
                   {/* Mock Templates */}
                   {[
                     { title: "AM Stabilization", reward: "50-100 XP", type: "Daily" },
                     { title: "Evening Reflection", reward: "25-75 XP", type: "Daily" },
                     { title: "Guild Contribution", reward: "200-500 SP", type: "Weekly" },
                   ].map((template, i) => (
                     <div key={i} className="p-10 rounded-[2.5rem] nm-flat hover:nm-flat-lg transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-all italic">{template.type}</span>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-widest mb-2">{template.title}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-8 italic">Band: {template.reward}</p>
                        <div className="flex gap-4">
                           <button className="flex-1 py-4 rounded-xl nm-button text-[9px] font-black uppercase tracking-widest text-purple-500">Edit</button>
                           <button className="px-6 py-4 rounded-xl nm-button text-[9px] font-black uppercase tracking-widest">Assign</button>
                        </div>
                     </div>
                   ))}
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

            {/* Placeholder for other tabs */}
            {!["roster", "quests", "system"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-20">
                <Lock className="w-16 h-16 mb-8" />
                <h2 className="text-2xl font-black uppercase tracking-[0.5rem] italic">Module Isolated</h2>
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">Sector logic currently in cold storage. Initializing hardware sync...</p>
              </div>
            )}

          </MotionDiv>
        </AnimatePresence>

      </div>
    </div>
  );
}
