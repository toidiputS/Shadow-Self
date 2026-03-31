import React from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Users, 
  Building2, 
  History, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Database,
  Clock,
  Settings2,
  Calendar,
  User,
  ArrowUpCircle,
  AlertCircle,
  HelpCircle,
  Scale,
  Receipt,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

export default function SubscriptionNode() {
  const [activeTab, setActiveTab] = React.useState("summary");

  const planSummary = {
    name: "Legacy Institutional",
    active: true,
    renewal: "2026-12-31",
    billingModel: "Grant-Funded Flat Rate",
    healthStatus: "Excellent",
    grantSource: "State Recovery Block Grant #9920",
    lastFinalization: "INV-SC-2026-03-A"
  };

  const usageMeters = [
    { label: "Vested Residents", current: 121, max: 150, unit: "Seats", icon: Users },
    { label: "Staff & Sponsors", current: 14, max: 20, unit: "Heads", icon: User },
    { id: 'hooks', label: "Notification Hooks", current: 8, max: 10, unit: "Hooks", icon: Zap },
    { label: "Active Houses", current: 3, max: 5, unit: "Nodes", icon: Building2 },
  ];

  const features = [
    { name: "Sponsor Review Workflow", unlocked: true, desc: "Mandatory verification for locked quests" },
    { name: "Real-time SMS Escalation", unlocked: true, desc: "Priority bypass for protocol breaches" },
    { name: "Compliance Ledger Exports", unlocked: true, desc: "One-click 90-day activity snapshots" },
    { name: "Multi-House Hierarchy", unlocked: false, desc: "Aggregate reporting for county-wide ops" },
    { name: "Custom Quest Templates", unlocked: true, desc: "Personalized recovery protocols" },
  ];

  const invoices = [
    { id: "INV-2026-03", date: "Mar 01, 2026", status: "Paid", amount: "Flat Rate", method: "Grant-Direct" },
    { id: "INV-2026-02", date: "Feb 01, 2026", status: "Paid", amount: "Flat Rate", method: "Grant-Direct" },
    { id: "INV-2026-01", date: "Jan 01, 2026", status: "Paid", amount: "Flat Rate", method: "Grant-Direct" },
  ];

  const tabs = [
    { id: "summary", name: "Institutional Summary", icon: CreditCard },
    { id: "capacity", name: "Capacity Manager", icon: Database },
    { id: "entitlements", name: "Entitlements Panel", icon: ShieldCheck },
    { id: "billing", name: "Billing & Records", icon: Receipt },
    { id: "upgrade", name: "Upgrade Path", icon: ArrowUpCircle },
    { id: "rules", name: "Persistence Rules", icon: Scale },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Tabs Header */}
      <div className="flex gap-2 p-2 rounded-[2.5rem] nm-inset-sm overflow-x-auto no-scrollbar">
         {tabs.map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`
                 flex items-center gap-3 px-6 py-4 rounded-3xl transition-all duration-500 whitespace-nowrap
                 ${isActive 
                   ? 'nm-button text-green-500 shadow-[inset_0_2px_10px_rgba(34,197,94,0.1)]' 
                   : 'text-(--text-secondary) opacity-40 hover:opacity-100 hover:text-green-400'
                 }
               `}
             >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none pt-0.5">{tab.name}</span>
             </button>
           );
         })}
      </div>

      <AnimatePresence mode="wait">
        <MotionDiv
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3 }}
        >
          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="space-y-6">
              <div className="p-10 rounded-4xl nm-flat-lg border border-green-500/10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                   <CreditCard className="w-32 h-32 text-green-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500 mb-2">Active Entitlement</p>
                      <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-8">{planSummary.name}</h2>
                      <div className="grid gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-blue-500">
                               <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Next Renewal Assessment</p>
                               <p className="text-sm font-black uppercase tabular-nums">{planSummary.renewal}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-green-500">
                               <Heart className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Account Health Score</p>
                               <p className="text-sm font-black uppercase text-green-500">{planSummary.healthStatus}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col justify-between items-end text-right">
                      <div className="px-5 py-2 rounded-2xl nm-inset-sm border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                         Status: Global Operational
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-20">Billing Protocol</p>
                         <p className="text-2xl font-black uppercase tracking-tighter text-blue-500 italic">{planSummary.billingModel}</p>
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic mt-2">Source: {planSummary.grantSource}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Capacity Manager Tab */}
          {activeTab === "capacity" && (
            <div className="space-y-6">
               <div className="flex items-center gap-3 ml-2 opacity-60">
                  <Database className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest leading-none">Utilization Metrics</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usageMeters.map((meter, i) => {
                    const percentage = (meter.current / meter.max) * 100;
                    return (
                      <div key={i} className="p-8 rounded-4xl nm-flat border border-white/5 space-y-6 group hover:nm-inset transition-all duration-500">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center text-blue-500">
                                  <meter.icon className="w-6 h-6" />
                               </div>
                               <div>
                                  <p className="text-xs font-black uppercase tracking-widest">{meter.label}</p>
                                  <p className="text-[9px] opacity-20 font-black uppercase tracking-tighter">{meter.current}/{meter.max} {meter.unit} Allocated</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-2xl font-black italic tracking-tighter tabular-nums text-blue-500/80">{Math.round(percentage)}%</p>
                               <p className="text-[8px] font-black uppercase tracking-widest opacity-10">Usage Load</p>
                            </div>
                         </div>
                         <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden nm-inset-sm">
                            <MotionDiv 
                               initial={{ width: 0 }}
                               animate={{ width: `${percentage}%` }}
                               className={`h-full ${percentage > 90 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : percentage > 70 ? 'bg-orange-500' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`}
                            />
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
          )}

          {/* Entitlements Panel Tab */}
          {activeTab === "entitlements" && (
            <div className="space-y-6">
               <div className="flex items-center gap-3 ml-2 opacity-60">
                  <ShieldCheck className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest leading-none">Resource Entitlement Checklist</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, i) => (
                    <div key={i} className={`p-6 rounded-4xl border transition-all duration-500 flex items-start gap-5 ${feature.unlocked ? 'nm-flat border-green-500/5' : 'nm-inset-sm border-gray-500/5 opacity-30 grayscale'}`}>
                       <div className={`w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center ${feature.unlocked ? 'text-green-500' : 'text-gray-500'}`}>
                          {feature.unlocked ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                       </div>
                       <div className="pt-1">
                          <p className="text-xs font-black uppercase tracking-widest mb-1">{feature.name}</p>
                          <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter leading-tight italic">"{feature.desc}"</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Billing & Records Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                     <div className="flex items-center gap-3 ml-2 opacity-60">
                        <FileText className="w-4 h-4" />
                        <h3 className="text-xs font-black uppercase tracking-widest leading-none">Archive Ledger</h3>
                     </div>
                     <div className="space-y-3">
                        {invoices.map((inv, i) => (
                          <div key={i} className="p-5 rounded-3xl nm-inset-sm flex items-center justify-between group hover:nm-inset transition-all">
                             <div className="flex items-center gap-8">
                                <span className="text-[10px] font-black opacity-20 tabular-nums">{inv.date}</span>
                                <span className="text-[11px] font-black uppercase tracking-widest text-blue-500/80">{inv.id}</span>
                             </div>
                             <div className="flex items-center gap-8">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">{inv.method}</span>
                                <div className="flex items-center gap-3">
                                   <div className="px-3 py-1 rounded bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/10">
                                      {inv.status}
                                   </div>
                                   <button className="w-8 h-8 rounded-lg nm-button flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                      <FileText className="w-4 h-4" />
                                   </button>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 ml-2 opacity-60">
                        <AlertCircle className="w-4 h-4" />
                        <h3 className="text-xs font-black uppercase tracking-widest leading-none">Finalization Info</h3>
                     </div>
                     <div className="p-8 rounded-4xl nm-flat-sm border border-blue-500/5 h-full flex flex-col justify-center">
                        <div className="space-y-6">
                           <div>
                              <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-1">Grant UID</p>
                              <p className="text-sm font-black uppercase tracking-tight text-blue-500">SRBG_2026_LEGAL_9920</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-1">Last Finalization ID</p>
                              <p className="text-sm font-black uppercase tracking-tight text-green-500">{planSummary.lastFinalization}</p>
                           </div>
                           <div className="pt-4 border-t border-white/5 flex items-center gap-3 text-red-500/40">
                              <AlertCircle className="w-4 h-4" />
                              <p className="text-[8px] font-black uppercase tracking-widest leading-tight">Billing contacts verified for manual reconciliation.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Upgrade Path Tab */}
          {activeTab === "upgrade" && (
            <div className="space-y-6">
               <div className="flex items-center gap-3 ml-2 opacity-60">
                  <ArrowUpCircle className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest leading-none">Future Entitlement Expansion</h3>
               </div>
               <div className="p-12 rounded-[3.5rem] nm-flat border border-blue-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-12 translate-y-12">
                     <ArrowUpCircle className="w-64 h-64 text-blue-500" />
                  </div>
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                     <div className="space-y-8">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Next Tier Strategy</p>
                           <h3 className="text-4xl font-black uppercase tracking-tighter italic">Elite Command Node</h3>
                        </div>
                        <div className="grid gap-4">
                           {[
                             "Aggregate Multi-House Reporting (+10 Nodes)",
                             "County-Wide Resident Mobility Matrix",
                             "Unlimited SMS Priority Routing Hooks",
                             "White-Label Facility Branded Portals",
                             "Custom Biometric Verification Integration"
                           ].map((item, i) => (
                             <div key={i} className="flex items-center gap-3 group">
                                <div className="w-6 h-6 rounded-lg nm-inset-sm flex items-center justify-center text-blue-500">
                                   <Zap className="w-3 h-3" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-tight opacity-60 group-hover:opacity-100 transition-opacity">{item}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col justify-between items-end border-l border-white/5 pl-16">
                        <div className="text-right">
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-2">Institutional Delta</p>
                           <p className="text-4xl font-black italic tracking-tighter text-blue-500">+$2,400<span className="text-sm opacity-40 not-italic"> / QTR</span></p>
                           <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mt-4 leading-relaxed">Includes professional onboarding<br/>and local hardware lease options.</p>
                        </div>
                        <button className="py-6 px-12 rounded-4xl nm-button text-[11px] font-black uppercase tracking-widest text-blue-500 italic hover:nm-flat transition-all group">
                           Request Expansion RFP
                           <ChevronRight className="w-4 h-4 ml-4 inline-block group-hover:translate-x-2 transition-transform" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Persistence Rules Tab */}
          {activeTab === "rules" && (
            <div className="space-y-6">
               <div className="flex items-center gap-3 ml-2 opacity-60">
                  <Scale className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest leading-none">Fallback & Persistence Protocols</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "Billing Lapse Mode", mode: "Static Read-Only", desc: "Members can view progress; new quest chains and sponsor reviews are frozen.", icon: Lock, status: "Active" },
                    { title: "Grace Window", mode: "14-Day Cycle", desc: "Full bridge functionality persists during administrative grant renewal periods.", icon: Clock, status: "Verified" },
                    { title: "Channel Downgrade", mode: "In-App Focus", desc: "External relays (SMS/Email) are paused until operational node sync is restored.", icon: Zap, status: "Authorized" }
                  ].map((rule, i) => (
                    <div key={i} className="p-8 rounded-4xl nm-flat-sm border border-red-500/5 group hover:nm-inset transition-all flex flex-col justify-between">
                       <div className="space-y-6">
                          <div className="flex justify-between items-start">
                             <div className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center text-red-400 opacity-40 group-hover:opacity-100 transition-all">
                                <rule.icon className="w-6 h-6" />
                             </div>
                             <div className="px-3 py-1 rounded-lg border border-red-500/10 text-[8px] font-black uppercase tracking-widest text-red-500/40">
                                {rule.status}
                             </div>
                          </div>
                          <div>
                             <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-1">{rule.title}</p>
                             <p className="text-sm font-black uppercase tracking-tight mb-2">{rule.mode}</p>
                             <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter leading-relaxed italic">"{rule.desc}"</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-10 rounded-[2.5rem] nm-inset-sm border border-blue-500/10 flex items-center gap-8 group">
                  <div className="w-16 h-16 rounded-3xl nm-button flex items-center justify-center text-blue-500">
                     <HelpCircle className="w-8 h-8 opacity-40 group-hover:opacity-100" />
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest mb-1">Administrative Support</p>
                     <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter leading-relaxed italic">
                        Questions regarding institutional grant allocation or compliance reporting? Contact our 
                        <span className="text-blue-500 opacity-100 ml-1 underline cursor-pointer">Protocol Lead (Tier-1)</span>.
                     </p>
                  </div>
               </div>
            </div>
          )}
        </MotionDiv>
      </AnimatePresence>
    </div>
  );
}
