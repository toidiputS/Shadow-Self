import React, { useState } from "react";
import { supabase } from "@/api/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, 
  Users, 
  Activity, 
  Zap, 
  TrendingUp, 
  ArrowLeft, 
  Heart,
  Skull,
  Coins,
  History,
  Lock,
  Plus,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Trophy,
  Store,
  Clock,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import GuildStatus from "../components/dashboard/GuildStatus";
import AuditLog from "../components/dashboard/AuditLog";
import GuildRoster from "../components/guild/GuildRoster";
import GuildPotDetails from "../components/guild/GuildPotDetails";
import ContractBuilder from "../components/guild/ContractBuilder";

const MotionDiv = motion.div;

// --- Inline Edit Modal ---
function EditItemModal({ isOpen, onClose, onSave, item, type, isSaving }) {
  const [label, setLabel] = useState(item?.label || "");
  const [value, setValue] = useState(item?.value || "");
  const [extra, setExtra] = useState(item?.extra || "");

  React.useEffect(() => {
    if (item) {
      setLabel(item.label || "");
      setValue(item.value || "");
      setExtra(item.extra || "");
    }
  }, [item]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="nm-flat-lg p-8 rounded-4xl max-w-md w-full space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-widest">
            {item?.id ? `Edit ${type}` : `Add ${type}`}
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl nm-button flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 mb-2 block">Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={type === 'Award' ? "e.g. Perfect Week" : "e.g. Missed Check-in"}
              className="w-full px-6 py-4 rounded-2xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold"
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 mb-2 block">
              {type === 'Award' ? 'Point Bonus (e.g. +500 SP)' : 'Point Cost (e.g. -50 SP)'}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === 'Award' ? "+500 SP" : "-50 SP"}
              className="w-full px-6 py-4 rounded-2xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold"
            />
          </div>
          {type === 'Protocol' && (
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 mb-2 block">Effect Description</label>
              <input
                type="text"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="e.g. House Alert"
                className="w-full px-6 py-4 rounded-2xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold"
              />
            </div>
          )}
        </div>

        <button
          onClick={() => onSave({ id: item?.id, label, value, extra })}
          disabled={!label.trim() || !value.trim() || isSaving}
          className="w-full py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-blue-500 disabled:opacity-30 flex items-center justify-center gap-3"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </MotionDiv>
    </div>
  );
}

// --- Inline Edit for Goals ---
function EditGoalModal({ isOpen, onClose, onSave, goal, isSaving }) {
  const [title, setTitle] = useState(goal?.title || "");
  const [targetPercent, setTargetPercent] = useState(goal?.target_percent || 90);
  const [daysRemaining, setDaysRemaining] = useState(goal?.days_remaining || 7);
  const [description, setDescription] = useState(goal?.description || "");

  React.useEffect(() => {
    if (goal) {
      setTitle(goal.title || "");
      setTargetPercent(goal.target_percent || 90);
      setDaysRemaining(goal.days_remaining || 7);
      setDescription(goal.description || "");
    }
  }, [goal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="nm-flat-lg p-8 rounded-4xl max-w-md w-full space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-widest">{goal?.id ? 'Edit Goal' : 'New Goal'}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl nm-button flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 mb-2 block">Goal Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Zero Breach Week"
              className="w-full px-6 py-4 rounded-2xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 mb-2 block">Target %</label>
              <input type="number" min="1" max="100" value={targetPercent} onChange={(e) => setTargetPercent(parseInt(e.target.value))}
                className="w-full px-6 py-4 rounded-2xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 mb-2 block">Days</label>
              <input type="number" min="1" max="90" value={daysRemaining} onChange={(e) => setDaysRemaining(parseInt(e.target.value))}
                className="w-full px-6 py-4 rounded-2xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold" />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 mb-2 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happens if this goal isn't met?"
              className="w-full px-6 py-4 rounded-2xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold min-h-[80px]" />
          </div>
        </div>

        <button
          onClick={() => onSave({ id: goal?.id, title, target_percent: targetPercent, days_remaining: daysRemaining, description })}
          disabled={!title.trim() || isSaving}
          className="w-full py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-blue-500 disabled:opacity-30 flex items-center justify-center gap-3"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Goal'}
        </button>
      </MotionDiv>
    </div>
  );
}


export default function Guild() {
  const [isContractBuilderOpen, setIsContractBuilderOpen] = useState(false);
  const [isAntiSpiralActive, setIsAntiSpiralActive] = useState(false);
  
  // Editable state for Awards, Protocol, Goals
  const [editingItem, setEditingItem] = useState(null); // { type: 'Award'|'Protocol', ...data }
  const [editingGoal, setEditingGoal] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

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

  const { data: potData } = useQuery({
    queryKey: ['guildPot', guildMember?.guild_id],
    queryFn: async () => {
      if (!guildMember?.guild_id) return null;
      const { data } = await supabase
        .from('guild_pot')
        .select('*')
        .eq('guild_id', guildMember.guild_id)
        .maybeSingle();
      return data;
    },
    enabled: !!guildMember?.guild_id,
  });

  const { data: debuffs = [] } = useQuery({
    queryKey: ['guildDebuffs', guildMember?.guild_id],
    queryFn: async () => {
      if (!guildMember?.guild_id) return [];
      const { data } = await supabase
        .from('guild_debuffs')
        .select('*')
        .eq('guild_id', guildMember.guild_id)
        .is('cleared_at', null);
      return data || [];
    },
    enabled: !!guildMember?.guild_id,
  });

  // ----- EDITABLE: House Awards from local state (persisted per session, can be wired to DB) -----
  const [houseAwards, setHouseAwards] = useState([
    { id: 'a1', label: "Perfect Week", value: "+500 SP", icon: Zap },
    { id: 'a2', label: "Community Leader", value: "+250 SP", icon: Heart },
    { id: 'a3', label: "Early Riser (7d)", value: "+100 SP", icon: Clock },
  ]);

  const [houseProtocols, setHouseProtocols] = useState([
    { id: 'p1', label: "Missed Check-in", value: "-50 SP", extra: "House Alert" },
    { id: 'p2', label: "Relapse Support", value: "- House Fund", extra: "Protocol Reset" },
    { id: 'p3', label: "Curfew Breach", value: "-250 SP", extra: "Restricted Mode" },
  ]);

  const [houseGoals, setHouseGoals] = useState([
    { id: 'g1', title: "Zero Breach Week", target_percent: 90, days_remaining: 4, progress: 85, description: "If we dip below 90%, it triggers a house-wide rally for encouragement." },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  // --- CRUD Handlers for Awards ---
  const handleSaveAward = (data) => {
    setIsSaving(true);
    setTimeout(() => {
      if (data.id && houseAwards.find(a => a.id === data.id)) {
        setHouseAwards(prev => prev.map(a => a.id === data.id ? { ...a, label: data.label, value: data.value } : a));
      } else {
        setHouseAwards(prev => [...prev, { id: `a_${Date.now()}`, label: data.label, value: data.value, icon: Trophy }]);
      }
      setIsSaving(false);
      setEditingItem(null);
    }, 400);
  };

  const handleDeleteAward = (id) => {
    if (confirm("Remove this award? This cannot be undone.")) {
      setHouseAwards(prev => prev.filter(a => a.id !== id));
    }
  };

  // --- CRUD Handlers for Protocols ---
  const handleSaveProtocol = (data) => {
    setIsSaving(true);
    setTimeout(() => {
      if (data.id && houseProtocols.find(p => p.id === data.id)) {
        setHouseProtocols(prev => prev.map(p => p.id === data.id ? { ...p, label: data.label, value: data.value, extra: data.extra } : p));
      } else {
        setHouseProtocols(prev => [...prev, { id: `p_${Date.now()}`, label: data.label, value: data.value, extra: data.extra }]);
      }
      setIsSaving(false);
      setEditingItem(null);
    }, 400);
  };

  const handleDeleteProtocol = (id) => {
    if (confirm("Remove this protocol? This cannot be undone.")) {
      setHouseProtocols(prev => prev.filter(p => p.id !== id));
    }
  };

  // --- CRUD Handlers for Goals ---
  const handleSaveGoal = (data) => {
    setIsSaving(true);
    setTimeout(() => {
      if (data.id && houseGoals.find(g => g.id === data.id)) {
        setHouseGoals(prev => prev.map(g => g.id === data.id ? { ...g, ...data } : g));
      } else {
        setHouseGoals(prev => [...prev, { id: `g_${Date.now()}`, ...data, progress: 0 }]);
      }
      setIsSaving(false);
      setEditingGoal(null);
    }, 400);
  };

  const handleDeleteGoal = (id) => {
    if (confirm("Remove this house goal?")) {
      setHouseGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const canManageGuild = profile?.role === 'admin' || guildMember?.role === 'leader';
  const guild = guildMember?.guilds;

  return (
    <div className="bg-(--bg-color) text-(--text-primary) px-4 py-8 md:p-12 transition-colors duration-400">

      <div className="max-w-7xl mx-auto">
        
        {/* Header Sector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black flex items-center justify-center md:justify-start gap-6 uppercase tracking-widest leading-none italic">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-4xl flex items-center justify-center nm-flat text-blue-500 relative">
                <div className="absolute inset-0 bg-blue-500/10 rounded-4xl animate-pulse"></div>
                <Shield className="w-8 h-8 md:w-10 md:h-10 relative z-10" />
              </div>
              The House
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-8 md:ml-26">
              <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] opacity-60">We support each other</span>
              {guild && (
                <div className="flex items-center gap-3 px-6 py-2.5 rounded-full nm-inset-sm text-[10px] font-black uppercase tracking-widest border border-white/5 opacity-80 backdrop-blur-md">
                   <Users className="w-4 h-4 text-blue-500" />
                   <span>{guild.name} Manager</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
              {canManageGuild && (
                <button 
                  id="guild-signal-button"
                  onClick={() => {
                    setIsAntiSpiralActive(!isAntiSpiralActive);
                    if (!isAntiSpiralActive) {
                      alert("HOUSE RALLY STARTED: Everyone has been notified that someone needs a little extra support. Let's look out for each other!");
                    }
                  }}
                  className={`flex-1 md:flex-none py-5 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all duration-500 hover:scale-105 active:scale-95 ${
                    isAntiSpiralActive 
                      ? 'nm-inset-sm text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-orange-500/30' 
                      : 'nm-button text-orange-500/60 hover:text-orange-500'
                  }`}
                  title="Toggle Guild Care Rally"
                >
                  <Heart className={`w-5 h-5 ${isAntiSpiralActive ? 'animate-pulse' : ''}`} />
                  {isAntiSpiralActive ? 'Care Rally Active' : 'Initiate Care Rally'}
                </button>
              )}
              <Link
                to={createPageUrl('ShadowVault')}
                className="w-16 h-16 rounded-2xl nm-button flex items-center justify-center text-yellow-500 hover:scale-105 transition-all"
                title="House Store"
              >
                <Store className="w-6 h-6" />
              </Link>
              <Link
                to={createPageUrl('Dashboard')}
                className="flex-1 md:flex-none py-5 px-10 rounded-2xl nm-button font-black text-[10px] uppercase tracking-[0.4rem] flex items-center justify-center gap-4 group transition-all"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </Link>
          </div>
        </div>

        {/* Tactical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Status & Oversight */}
          <div className="lg:col-span-4 space-y-12">
            <GuildStatus user_id={user?.id} />

            {/* Active System Debuffs (Consequences) */}
            <div className={`p-10 rounded-[3rem] nm-flat transition-all duration-700 border ${debuffs.length > 0 ? 'border-red-500/20' : 'border-white/5'}`}>
               <div className="flex items-center gap-5 mb-10">
                 <div className={`w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center ${debuffs.length > 0 ? 'text-red-500 animate-pulse' : 'opacity-20'}`}>
                    <Skull className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-widest leading-tight">Support Alerts</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1 italic">Active Guild Conditions</p>
                 </div>
               </div>

               {debuffs.length === 0 ? (
                  <div className="nm-inset-sm p-12 rounded-4xl text-center opacity-40">
                    <ShieldCheck className="w-12 h-12 mb-6 mx-auto text-green-500 opacity-60" />
                    <p className="text-xs font-black uppercase tracking-[0.3rem]">All Good Here</p>
                    <p className="text-[10px] mt-4 font-bold italic opacity-60">"Everyone is on track with their habits today."</p>
                  </div>
               ) : (
                 <div className="space-y-6">
                   {debuffs.map((debuff) => (
                     <div key={debuff.id} className="p-6 rounded-3xl nm-inset-sm border border-red-500/10 hover:border-red-500/30 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-xs font-black uppercase tracking-widest text-red-500">{debuff.debuff_type.replace(/_/g, ' ')}</span>
                           <div className="px-3 py-1 rounded-lg nm-flat-sm text-[9px] font-mono font-black text-red-400">-{Math.round((1 - debuff.sp_modifier) * 100)}% YIELD</div>
                        </div>
                        <div className="h-3 rounded-full nm-inset p-0.5 mb-2 relative overflow-hidden">
                           <div 
                             className="h-full rounded-full bg-red-500/40 relative z-10" 
                             style={{ width: `${(debuff.quests_cleared / debuff.quests_to_clear) * 100}%` }} 
                           />
                           <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Collective Progress</p>
                           <p className="text-xs font-black text-red-500/60">{debuff.quests_to_clear - debuff.quests_cleared} habits to catch up on</p>
                        </div>
                     </div>
                   ))}
                   <button className="w-full py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-all mt-4 border border-red-500/5">
                       See House Rules
                   </button>
                 </div>
               )}
            </div>

            {/* ===== EDITABLE: House Goals ===== */}
            <div className="p-10 rounded-[3rem] nm-flat border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
               
               <div className="flex items-center justify-between mb-10 relative z-10">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-orange-500">
                      <ShieldCheck className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="text-xl font-black uppercase tracking-widest">House Goals</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1 italic">What we're working on together</p>
                   </div>
                 </div>
                 {canManageGuild && (
                   <button 
                     onClick={() => setEditingGoal({ id: null, title: '', target_percent: 90, days_remaining: 7, description: '' })}
                     className="w-10 h-10 rounded-xl nm-button flex items-center justify-center text-orange-500 hover:scale-110 transition-all"
                     title="Add Goal"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                 )}
               </div>
               
               <div className="space-y-6 relative z-10">
                 <AnimatePresence>
                   {houseGoals.map((goal) => (
                     <MotionDiv
                       key={goal.id}
                       layout
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="p-6 rounded-3xl nm-inset-sm border border-orange-500/10 group/goal"
                     >
                        <div className="flex justify-between items-start mb-4">
                           <h4 className="text-sm font-black uppercase tracking-wider text-orange-400">{goal.title}</h4>
                           <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">{goal.days_remaining}D LEFT</span>
                             {canManageGuild && (
                               <>
                                 <button onClick={() => setEditingGoal(goal)} className="w-7 h-7 rounded-lg nm-button flex items-center justify-center opacity-0 group-hover/goal:opacity-100 transition-all text-blue-500" title="Edit">
                                   <Edit3 className="w-3 h-3" />
                                 </button>
                                 <button onClick={() => handleDeleteGoal(goal.id)} className="w-7 h-7 rounded-lg nm-button flex items-center justify-center opacity-0 group-hover/goal:opacity-100 transition-all text-red-500" title="Delete">
                                   <Trash2 className="w-3 h-3" />
                                 </button>
                               </>
                             )}
                           </div>
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                           <div className="h-1.5 flex-1 rounded-full nm-inset overflow-hidden">
                             <div className="h-full rounded-full bg-linear-to-r from-orange-500/40 to-yellow-500/40" style={{ width: `${goal.progress || 0}%` }}></div>
                           </div>
                           <span className="text-[10px] font-black text-orange-500">{goal.progress || 0}% on track</span>
                        </div>
                        {goal.description && (
                          <p className="text-[10px] font-bold opacity-60 leading-relaxed italic">{goal.description}</p>
                        )}
                     </MotionDiv>
                   ))}
                 </AnimatePresence>

                 {houseGoals.length === 0 && (
                   <div className="py-8 text-center opacity-30">
                     <p className="text-[10px] font-black uppercase tracking-widest">No active goals</p>
                     <p className="text-[9px] italic opacity-60 mt-2">Set a goal to motivate the house</p>
                   </div>
                 )}

                 {canManageGuild && (
                    <button 
                      onClick={() => setIsContractBuilderOpen(true)}
                      className="w-full py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Advanced Goal Builder
                    </button>
                 )}
               </div>
            </div>
          </div>

          {/* Collective Hub */}
          <div id="guild-house-feed" className="lg:col-span-8 space-y-12">
            <GuildRoster guildId={guildMember?.guild_id} />
            
            <div className="w-full">
                <GuildPotDetails 
                  potData={potData} 
                  onClearDebuff={() => {
                     if (debuffs.length === 0) {
                      alert("All clear — no one needs extra help right now.");
                      return;
                    }
                    if ((potData?.sp_balance || 0) < 500) {
                      alert("Not enough Trust in the House Fund to clear this yet. 500 Trust needed.");
                      return;
                    }
                    if (confirm("Resolve this support alert? This will use 500 of the House Fund to clear it.")) {
                      alert("Support alert resolved. House status back to normal.");
                    }
                  }}
                  onWithdraw={() => {
                    alert("ACCESS DENIED: Withdrawals are locked for now. Only a house manager can change this.");
                  }}
                />
            </div>

            {/* ===== EDITABLE: House Awards & House Protocol ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* House Awards */}
              <div className="p-10 rounded-[3rem] nm-flat border border-white/5 group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-yellow-500">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest leading-tight">House Awards</h3>
                  </div>
                  {canManageGuild && (
                    <button 
                      onClick={() => setEditingItem({ type: 'Award', id: null, label: '', value: '' })}
                      className="w-10 h-10 rounded-xl nm-button flex items-center justify-center text-yellow-500 hover:scale-110 transition-all"
                      title="Add Award"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <AnimatePresence>
                    {houseAwards.map((award) => {
                      const AwardIcon = award.icon || Trophy;
                      return (
                        <MotionDiv 
                          key={award.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between p-5 rounded-2xl nm-inset-sm border border-white/5 group/item"
                        >
                          <div className="flex items-center gap-4">
                            <AwardIcon className="w-4 h-4 opacity-40" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{award.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black italic text-yellow-500">{award.value}</span>
                            {canManageGuild && (
                              <>
                                <button onClick={() => setEditingItem({ type: 'Award', ...award })} className="w-7 h-7 rounded-lg nm-button flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all text-blue-500" title="Edit">
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleDeleteAward(award.id)} className="w-7 h-7 rounded-lg nm-button flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all text-red-500" title="Delete">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </MotionDiv>
                      );
                    })}
                  </AnimatePresence>
                  {houseAwards.length === 0 && (
                    <div className="py-6 text-center opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-widest">No awards set</p>
                    </div>
                  )}
                  <Link to={createPageUrl('ShadowVault')} className="block w-full text-center py-4 text-[9px] font-black uppercase tracking-[0.2rem] opacity-30 hover:opacity-100 transition-opacity mt-4 italic">
                    Visit the House Store to redeem points →
                  </Link>
                </div>
              </div>

              {/* House Protocol */}
              <div className="p-10 rounded-[3rem] nm-flat border border-white/5 group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-red-500">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest leading-tight">House Protocol</h3>
                  </div>
                  {canManageGuild && (
                    <button 
                      onClick={() => setEditingItem({ type: 'Protocol', id: null, label: '', value: '', extra: '' })}
                      className="w-10 h-10 rounded-xl nm-button flex items-center justify-center text-red-500 hover:scale-110 transition-all"
                      title="Add Protocol"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <AnimatePresence>
                    {houseProtocols.map((rule) => (
                      <MotionDiv 
                        key={rule.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-5 rounded-2xl nm-inset-sm border border-white/5 opacity-60 hover:opacity-100 transition-all group/item"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest">{rule.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-[9px] font-black text-red-500/60 leading-none mb-1 uppercase italic">{rule.value}</p>
                            <p className="text-[7px] font-black opacity-30 uppercase tracking-tighter">{rule.extra}</p>
                          </div>
                          {canManageGuild && (
                            <>
                              <button onClick={() => setEditingItem({ type: 'Protocol', ...rule })} className="w-7 h-7 rounded-lg nm-button flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all text-blue-500" title="Edit">
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDeleteProtocol(rule.id)} className="w-7 h-7 rounded-lg nm-button flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all text-red-500" title="Delete">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </MotionDiv>
                    ))}
                  </AnimatePresence>
                  {houseProtocols.length === 0 && (
                    <div className="py-6 text-center opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-widest">No protocols set</p>
                    </div>
                  )}
                  <p className="text-center py-4 text-[9px] font-bold opacity-20 uppercase italic">Protocols help us stay safe.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Insight (Non-Tactical Registry) */}
        <div className="mt-32 pt-20 border-t border-white/5">
            <div className="flex items-center gap-5 mb-12 pl-4 opacity-20 hover:opacity-60 transition-opacity cursor-default uppercase italic">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-black tracking-[0.5rem]">House Activity Log</h3>
            </div>
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-1000">
                <AuditLog />
            </div>
        </div>

        <div className="pb-40" />
      </div>

      <ContractBuilder isOpen={isContractBuilderOpen} onClose={() => setIsContractBuilderOpen(false)} />

      {/* Edit Modal for Awards & Protocols */}
      <AnimatePresence>
        {editingItem && (
          <EditItemModal
            isOpen={!!editingItem}
            onClose={() => setEditingItem(null)}
            onSave={editingItem?.type === 'Award' ? handleSaveAward : handleSaveProtocol}
            item={editingItem}
            type={editingItem?.type}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal for Goals */}
      <AnimatePresence>
        {editingGoal && (
          <EditGoalModal
            isOpen={!!editingGoal}
            onClose={() => setEditingGoal(null)}
            onSave={handleSaveGoal}
            goal={editingGoal}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

