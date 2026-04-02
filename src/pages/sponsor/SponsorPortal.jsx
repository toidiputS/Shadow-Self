import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Zap, 
  MessageSquare, 
  Plus, 
  ClipboardCheck, 
  AlertCircle,
  Eye,
  History,
  Lock,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

const SP_TABS = [
  { id: "members", name: "My Members", icon: Users },
  { id: "reviews", name: "Review Queue", icon: ClipboardCheck },
  { id: "assignments", name: "Quest Assignments", icon: Plus },
  { id: "logs", name: "Activity Logs", icon: History },
];

export default function SponsorPortal() {
  const [activeTab, setActiveTab] = useState("members");

  // Mock Data for Sponsor's linked members
  const myMembers = [
    { id: 101, name: "Lucas Vance", house: "East Wing", status: "Active", streak: 12, lastCheck: "2h ago", alert: null },
    { id: 102, name: "Marcus Thorne", house: "North House", status: "Warning", streak: 42, lastCheck: "1d ago", alert: "Missed AM Check-in" },
    { id: 103, name: "Elena Vance", house: "East Wing", status: "Active", streak: 5, lastCheck: "15m ago", alert: null },
    { id: 104, name: "Julian Reed", house: "North House", status: "Breach", streak: 0, lastCheck: "3d ago", alert: "Protocol Deviation" },
  ];

  // Mock Review Queue
  const reviewQueue = [
    { id: 501, member: "Marcus Thorne", quest: "Morning Stabilization", proofType: "Photo", time: "10:30 AM", notes: "Self-captured identity verification required." },
    { id: 502, member: "Elena Vance", quest: "Community Reflection", proofType: "Journal Entry", time: "1:15 PM", notes: "Awaiting qualitative evaluation." },
  ];

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-primary) p-4 md:p-12 transition-colors duration-400">
      <div className="max-w-7xl mx-auto">

        {/* Sponsor Portal Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-4xl nm-flat flex items-center justify-center text-orange-500 relative group">
                <div className="absolute inset-0 bg-orange-500/10 rounded-4xl animate-pulse"></div>
                <ClipboardCheck className="w-10 h-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-[0.5rem] leading-none mb-4 italic text-orange-500">Sponsor Portal</h1>
              <div className="flex items-center gap-2 opacity-40">
                  <Activity className="w-3 h-3" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Direct Intervention Bridge Active</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <button className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-orange-500 hover:scale-105 transition-all flex items-center gap-3">
                <Plus className="w-4 h-4" /> Custom Alignment Task
             </button>
             <div className="px-6 py-4 rounded-2xl nm-inset-sm flex items-center gap-3 text-orange-500/60 font-black text-[9px] uppercase tracking-widest">
                Linked Subjects: {myMembers.length}
             </div>
          </div>
        </div>

        {/* Sponsor Nav Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 p-3 rounded-[2.5rem] nm-inset overflow-x-auto">
          {SP_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl transition-all duration-500 whitespace-nowrap relative ${
                activeTab === tab.id 
                ? 'nm-button text-orange-500 font-bold' 
                : 'opacity-40 hover:opacity-100 hover:nm-flat-sm text-[11px] font-black uppercase tracking-widest'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              <span className={activeTab === tab.id ? '' : 'text-[10px]'}>{tab.name}</span>
              {tab.id === 'reviews' && reviewQueue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 nm-flat flex items-center justify-center border-2 border-(--bg-color) animate-pulse scale-75">
                  <span className="text-[8px] font-black text-white">{reviewQueue.length}</span>
                </span>
              )}
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
            {activeTab === "members" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {myMembers.map((member) => (
                     <div key={member.id} className="p-8 rounded-[3rem] nm-flat group hover:nm-flat-lg transition-all relative overflow-hidden">
                        {member.alert && (
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase px-3 py-1 rounded-full animate-pulse border border-red-500/20">{member.alert}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-6 mb-8 mt-2">
                           <div className="w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center text-orange-500 font-black text-xl">
                              {member.name.charAt(0)}
                           </div>
                           <div>
                              <h3 className="text-xl font-black uppercase tracking-widest">{member.name}</h3>
                              <p className="text-[10px] font-black opacity-30 italic">{member.house}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                           <div className="p-4 rounded-2xl nm-inset-sm text-center">
                              <p className="text-[8px] opacity-40 font-black uppercase tracking-widest mb-1">Status</p>
                              <p className={`text-[10px] font-black uppercase underline decoration-2 ${
                                member.status === 'Active' ? 'text-green-500' : 
                                member.status === 'Warning' ? 'text-orange-500' : 'text-red-500'
                              }`}>{member.status}</p>
                           </div>
                           <div className="p-4 rounded-2xl nm-inset-sm text-center">
                              <p className="text-[8px] opacity-40 font-black uppercase tracking-widest mb-1">Streak</p>
                              <p className="text-[10px] font-black uppercase text-blue-500">{member.streak} Days</p>
                           </div>
                           <div className="p-4 rounded-2xl nm-inset-sm text-center">
                              <p className="text-[8px] opacity-40 font-black uppercase tracking-widest mb-1">Last Check</p>
                              <p className="text-[10px] font-black uppercase opacity-60">{member.lastCheck}</p>
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <button className="flex-1 py-4 rounded-2xl nm-button text-[9px] font-black uppercase tracking-widest text-orange-500 flex items-center justify-center gap-2">
                              <Activity className="w-3 h-3" /> Dashboard
                           </button>
                           <button className="flex-1 py-4 rounded-2xl nm-button text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-blue-400">
                              <MessageSquare className="w-3 h-3" /> Message
                           </button>
                           <button className="w-14 items-center justify-center flex py-4 rounded-2xl nm-button text-red-500 hover:scale-105 transition-all">
                              <ShieldAlert className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
            )}

            {activeTab === "reviews" && (
                <div className="space-y-6">
                   {reviewQueue.length > 0 ? reviewQueue.map((item) => (
                      <div key={item.id} className="p-10 rounded-[3rem] nm-flat flex flex-col md:flex-row items-center justify-between gap-8 border border-orange-500/5 hover:border-orange-500/20 transition-all">
                         <div className="flex items-center gap-8">
                             <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                                <ClipboardCheck className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="text-xl font-black uppercase tracking-widest">{item.member}</h3>
                                <p className="text-[10px] font-black opacity-30 mt-1">Proof Hub: <span className="text-blue-500">{item.quest}</span> • {item.proofType}</p>
                             </div>
                         </div>
                         
                         <div className="max-w-md bg-transparent p-6 rounded-2xl nm-inset-sm">
                            <p className="text-[9px] font-bold opacity-60 leading-relaxed italic">"{item.notes}"</p>
                         </div>

                         <div className="flex gap-4">
                             <button className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Approve
                             </button>
                             <button className="px-8 py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Deny
                             </button>
                             <button className="p-4 rounded-2xl nm-button text-blue-400">
                                <Eye className="w-4 h-4" />
                             </button>
                         </div>
                      </div>
                   )) : (
                      <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center">
                         <CheckCircle2 className="w-16 h-16 mb-8 text-green-500" />
                         <h2 className="text-2xl font-black uppercase tracking-[0.5rem]">Queue Expired</h2>
                         <p className="text-[10px] font-black text-center mt-4">No pending identity proofs currently awaiting validation.</p>
                      </div>
                   )}
                </div>
            )}

            {/* Placeholder for Assignments and Logs */}
            {!["members", "reviews"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-20">
                <Lock className="w-16 h-16 mb-8" />
                <h2 className="text-2xl font-black uppercase tracking-[0.5rem] italic text-orange-500/60">Restricted Link</h2>
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">Module synchronization required. Syncing with institutional node...</p>
              </div>
            )}

          </MotionDiv>
        </AnimatePresence>

      </div>
    </div>
  );
}
