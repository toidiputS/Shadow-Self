import React from "react";
import { 
  Shield, 
  Users, 
  Zap, 
  Globe, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Target,
  BarChart,
  HardDrive as Harddrive,
  Cpu,
  FileText,
  CreditCard,
  History,
  Info,
  Clock,
  Sparkles,
  ChevronRight,
  Settings,
  MoreHorizontal,
  X,
  ShieldCheck,
  Activity,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/api/supabase";
import { useMutation } from "@tanstack/react-query";

const MotionDiv = motion.div;

export default function SubscriptionNode() {
  const [activePlan, setActivePlan] = React.useState("legacy");

  const [isRFPModalOpen, setIsRFPModalOpen] = React.useState(false);
  const [rfpForm, setRFPForm] = React.useState({
    facilities: "1-5",
    jurisdiction: "Private Facility",
    requirements: ""
  });
  const [rfpSuccess, setRFPSuccess] = React.useState(false);
  const [clearanceCode, setClearanceCode] = React.useState("");

  const [isUpdatingCard, setIsUpdatingCard] = React.useState(false);
  const [updateProgress, setUpdateProgress] = React.useState(0);
  const [cardData, setCardData] = React.useState({
    number: "•••• •••• •••• 4242",
    expiry: "12/28",
    cvv: "•••"
  });

  const handleUpdateCard = () => {
    setUpdateProgress(10);
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUpdatingCard(false);
            setUpdateProgress(0);
            // Simulate platform record update
            setCardData(prevData => ({ ...prevData })); 
            alert("MATRIX SUCCESS: Billing method synchronized with secure tactical gateway.");
          }, 800);
          return 100;
        }
        return prev + 12;
      });
    }, 400);
  };

  const rfpMutation = useMutation({
    mutationFn: async (formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: rfpError } = await supabase
        .from('rfp_requests')
        .insert({
          user_id: user.id,
          facility_count: parseInt(formData.facilities.split('-')[0]) || 1,
          jurisdiction: formData.jurisdiction,
          requirements: formData.requirements
        });
      
      if (rfpError) throw rfpError;

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'alert',
          title: 'Infrastructure Expansion Requested',
          message: `Formal RFP submitted for ${formData.facilities} facilities (${formData.jurisdiction}). System evaluation in progress.`,
          metadata: { icon: "Globe", color: "text-purple-500" }
        });
        
      if (notifError) throw notifError;
    },
    onSuccess: () => {
      setClearanceCode(`EXP-${Math.random().toString(36).substring(7).toUpperCase()}`);
      setRFPSuccess(true);
      setTimeout(() => {
        setIsRFPModalOpen(false);
        setRFPSuccess(false);
        setClearanceCode("");
      }, 6000);
    }
  });

  const plans = [
    {
      id: "legacy",
      name: "Legacy Protocol",
      price: "127",
      interval: "/mo",
      stripeId: "prod_U0jZKUpVIaJtES",
      tier: "Standard",
      color: "text-blue-500",
      description: "Baseline recovery command for small facilities.",
      features: [
        "Up to 25 Resident Slots",
        "Standard Encryption Node",
        "Sponsor Dashboard Access",
        "Basic Audit Logs (30D)",
        "In-App Notification Engine"
      ],
      utilization: 18,
      limit: 25
    },
    {
      id: "squad",
      name: "Tactical Squad",
      price: "297",
      interval: "/mo",
      stripeId: "prod_U0jcGJ7XqXqNS0",
      tier: "Professional",
      color: "text-orange-500",
      highlight: true,
      description: "Enhanced monitoring for growing recovery guilds.",
      features: [
        "Up to 100 Resident Slots",
        "Advanced Heuristic Tracking",
        "Leader & Admin Permission Tiers",
        "Extended Audit Logs (90D)",
        "Priority SMS/Push Relay",
        "Custom Quest Architect"
      ],
      utilization: 42,
      limit: 100
    },
    {
      id: "platoon",
      name: "Institutional Platoon",
      price: "1997",
      interval: "/yr",
      stripeId: "prod_U0je0430MWI4Vz",
      tier: "Enterprise",
      color: "text-purple-500",
      description: "Full-scale governance for multi-facility ops.",
      features: [
        "Unlimited Resident Capacity",
        "Dedicated Matrix Instance",
        "White-Label Governance UI",
        "Full Data Sovereignty",
        "SLA Guarantee (99.9%)",
        "API Command Access"
      ],
      utilization: 0,
      limit: "∞"
    }
  ];


  return (
    <div className="space-y-8 py-4">
      {/* Active Entitlement Header */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 p-8 rounded-4xl nm-flat relative overflow-hidden group border border-white/5">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-500/10 to-transparent blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 transition-opacity duration-1000 opacity-50`} />
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl nm-inset flex items-center justify-center text-blue-500">
                     <Shield className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Active Authorization</h3>
                     <p className="text-xl font-black italic tracking-tighter uppercase text-(--text-primary)">Legacy Protocol Node</p>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Renews In</p>
                     <div className="flex items-center gap-2 text-sm font-black italic tracking-tight">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span>14 DAYS</span>
                     </div>
                  </div>
                  <div className="w-px h-10 bg-(--border-color) opacity-10" />
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Instance ID</p>
                     <p className="text-sm font-black tabular-nums tracking-tighter opacity-80">SHW-RX-00921</p>
                  </div>
               </div>
               <div className="pt-2">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Capacity Utilization</span>
                     <span className="text-[10px] font-black italic tracking-tighter text-blue-500">18 / 25 RESIDENTS</span>
                  </div>
                  <div className="h-2 w-full bg-black/10 rounded-full nm-inset-sm overflow-hidden">
                     <MotionDiv 
                        initial={{ width: 0 }}
                        animate={{ width: '72%' }}
                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                     />
                  </div>
               </div>
            </div>
         </div>
         
         <div className="p-8 rounded-4xl nm-inset-sm flex flex-col justify-between border border-white/5">
            <div>
               <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4">Billing Method</h3>
               <div className="flex items-center gap-4 p-4 rounded-2xl nm-flat-sm bg-white/5 border border-white/5">
                  <CreditCard className="w-6 h-6 opacity-40" />
                  <div>
                     <p className="text-xs font-black tracking-tighter italic">VISA •••• 4242</p>
                     <p className="text-[8px] opacity-20 uppercase font-bold tracking-widest">Expires 12/28</p>
                  </div>
               </div>
            </div>
            <button 
               onClick={() => setIsUpdatingCard(true)}
               className="w-full py-4 mt-6 rounded-3xl nm-button text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-all active:scale-95 flex items-center justify-center gap-4"
            >
               <ShieldCheck className="w-4 h-4" />
               Update Matrix Card
            </button>
         </div>
      </section>

      <AnimatePresence>
        {isUpdatingCard && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-8">
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => updateProgress === 0 ? setIsUpdatingCard(false) : null}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            <MotionDiv
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-(--bg-color) nm-flat-lg rounded-[3rem] p-12 border border-white/5 overflow-hidden"
            >
              {updateProgress > 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-10">
                  <div className="relative">
                     <div className="w-24 h-24 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
                     <Activity className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                  <div className="text-center space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.5rem] text-blue-500">Uplinking Matrix Key</p>
                     <div className="w-48 h-1 nm-inset-sm rounded-full overflow-hidden mx-auto">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300" 
                          style={{ width: `${updateProgress}%` }}
                        />
                     </div>
                     <p className="text-[8px] font-black opacity-30 uppercase tabular-nums">SYNCHRONIZATION: {updateProgress}%</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-5 mb-12">
                    <div className="w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500">
                      <CreditCard className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-widest leading-none">Matrix Update</h3>
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-1 italic">Secure Billing Uplink</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-8 rounded-3xl nm-inset-sm bg-white/2 border border-white/5 space-y-8">
                      <div className="flex justify-between items-center opacity-40">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">Node: SHW-RX-02</span>
                      </div>
                      
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest opacity-20 ml-1">Card Payload</label>
                         <input 
                           type="text" 
                           placeholder="CARD NUMBER" 
                           className="w-full bg-transparent border-none text-sm font-black tracking-[0.2em] focus:outline-none placeholder:opacity-10"
                           value={cardData.number}
                           onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest opacity-20 ml-1">Expiry</label>
                           <input 
                             type="text" 
                             placeholder="MM/YY" 
                             className="w-full bg-transparent border-none text-[11px] font-black tracking-widest focus:outline-none placeholder:opacity-10"
                             value={cardData.expiry}
                             onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest opacity-20 ml-1">Secure Key</label>
                           <input 
                             type="text" 
                             placeholder="CVV" 
                             className="w-full bg-transparent border-none text-[11px] font-black tracking-widest focus:outline-none placeholder:opacity-10"
                             value={cardData.cvv}
                             onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                           />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl nm-inset-xs bg-orange-500/5 flex gap-4">
                       <ShieldAlert className="w-4 h-4 text-orange-500/40 shrink-0" />
                       <p className="text-[9px] opacity-40 italic font-black leading-relaxed uppercase tracking-widest">
                          Encryption protocol enforced. Payload remains within your tactical local domain.
                       </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleUpdateCard}
                        className="flex-1 py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 hover:scale-105 transition-all active:scale-95"
                      >
                        Uplink Payload
                      </button>
                      <button 
                        onClick={() => setIsUpdatingCard(false)}
                        className="px-8 py-5 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 hover:text-red-500 transition-all active:scale-95"
                      >
                        Abort
                      </button>
                    </div>
                  </div>
                </>
              )}
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      {/* Plan Selection Command */}
      <section className="space-y-6">
         <div className="flex items-center gap-3 ml-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-black uppercase tracking-widest leading-none">Infrastructure Expansion</h3>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActivePlan(plan.id)}
                className={`
                  relative p-8 rounded-4xl transition-all duration-500 text-left flex flex-col gap-8
                  ${activePlan === plan.id 
                    ? 'nm-flat border border-blue-500/20' 
                    : 'nm-button border border-transparent hover:nm-flat'
                  }
                `}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-orange-500 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
                    Recommended
                  </div>
                )}
                
                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${plan.color}`}>{plan.tier}</p>
                      <div className={`w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center ${activePlan === plan.id ? plan.color : 'opacity-20'}`}>
                         {plan.id === 'legacy' ? <Harddrive className="w-5 h-5" /> : plan.id === 'squad' ? <Cpu className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                      </div>
                   </div>
                   <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{plan.name}</h4>
                   <p className="text-[9px] opacity-40 font-black uppercase tracking-tighter leading-relaxed">
                      {plan.description}
                   </p>
                </div>

                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-black italic tracking-tighter">$</span>
                   <span className="text-4xl font-black tracking-tighter tabular-nums">{plan.price}</span>
                   <span className="text-sm font-black italic opacity-20">{plan.interval}</span>
                </div>

                <ul className="space-y-3 flex-1">
                   {plan.features.map((feature, i) => (
                     <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter opacity-60 italic group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 ${activePlan === plan.id ? 'text-green-500' : 'opacity-40'}`} />
                        <span>{feature}</span>
                     </li>
                   ))}
                </ul>

                <div className={`w-full py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${activePlan === plan.id ? 'bg-blue-500 text-white shadow-xl translate-y-2' : 'nm-inset-sm opacity-40'}`}>
                   {activePlan === plan.id ? (
                     <>
                        <span>Active Configuration</span>
                        <CheckCircle2 className="w-4 h-4" />
                     </>
                   ) : (
                     <>
                        <span>Select Node</span>
                        <ChevronRight className="w-3 h-3" />
                     </>
                   )}
                </div>
              </button>
            ))}
         </div>
      </section>

      {/* Strategic Integration Call to Action */}
      <section className="bg-(--border-color)/5 rounded-5xl p-10 border border-white/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="w-24 h-24 rounded-4xl nm-flat flex items-center justify-center text-purple-500">
               <Globe className="w-12 h-12" />
            </div>
            <div className="flex-1 space-y-3">
               <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Institutional Scaling</h3>
               <p className="text-xs font-black uppercase tracking-tighter opacity-40 leading-relaxed italic max-w-xl">
                  Deploying Shadow Self across multiple facilities or government jurisdictions requires a custom-architected instance. Request an expansion RFP for bulk tier pricing and dedicated matrix support.
               </p>
            </div>
            <button 
              onClick={() => setIsRFPModalOpen(true)}
              className="px-12 py-6 rounded-4xl nm-button text-xs font-black uppercase tracking-[0.4em] text-purple-400 hover:text-purple-300 transition-all hover:scale-105 active:scale-95"
            >
               REQUEST EXPANSION RFP
            </button>
         </div>
      </section>

      {/* RFP Intake Modal Overlay */}
      <AnimatePresence>
        {isRFPModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl nm-flat bg-(--bg-color) rounded-[3rem] p-10 relative overflow-hidden border border-purple-500/10"
            >
              {rfpSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full nm-inset-sm flex items-center justify-center text-green-500 mb-8">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Request Authorized</h3>
                  <div className="px-6 py-3 rounded-xl nm-inset-sm text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">
                    Clearance Code: {clearanceCode}
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-40 leading-relaxed italic max-w-xs">
                    Institutional evaluation in progress. A system architect will contact your node within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-purple-500">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-black italic tracking-tighter uppercase">RFP Expansion Request</h3>
                    </div>
                    <button onClick={() => setIsRFPModalOpen(false)} className="w-10 h-10 rounded-xl nm-button flex items-center justify-center text-red-500 hover:scale-110 transition-all active:scale-90" title="Abort Request">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 italic">Facility Scale</label>
                        <select 
                          value={rfpForm.facilities}
                          onChange={(e) => setRFPForm({ ...rfpForm, facilities: e.target.value })}
                          className="w-full p-5 rounded-2xl nm-inset-sm bg-transparent text-[11px] font-black uppercase tracking-widest border-none focus:outline-none"
                        >
                          <option>1-5 Facilities</option>
                          <option>5-15 Facilities</option>
                          <option>15-50 Facilities</option>
                          <option>Government/Multi-State</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 italic">Jurisdictional Scope</label>
                        <select 
                          value={rfpForm.jurisdiction}
                          onChange={(e) => setRFPForm({ ...rfpForm, jurisdiction: e.target.value })}
                          className="w-full p-5 rounded-2xl nm-inset-sm bg-transparent text-[11px] font-black uppercase tracking-widest border-none focus:outline-none"
                        >
                          <option>Private Facility</option>
                          <option>State-Run Recovery</option>
                          <option>Federal Contract</option>
                          <option>Academic Research</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 italic">Strategic Requirements</label>
                      <textarea 
                        value={rfpForm.requirements}
                        onChange={(e) => setRFPForm({ ...rfpForm, requirements: e.target.value })}
                        placeholder="Detail specific institutional needs (e.g., custom API, on-prem hosting, white-label UI)..."
                        className="w-full h-32 p-5 rounded-2xl nm-inset-sm bg-transparent text-[11px] font-black uppercase tracking-wide border-none focus:outline-none resize-none"
                      />
                    </div>
                    
                    <button 
                      onClick={() => rfpMutation.mutate(rfpForm)}
                      disabled={rfpMutation.isPending}
                      className="w-full py-6 rounded-3xl nm-button text-[11px] font-black uppercase tracking-[0.4em] text-purple-500 hover:text-purple-300 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {rfpMutation.isPending ? 'AUTHORIZING TRANSMISSION...' : 'TRANSMIT RFP SIGNAL'}
                    </button>
                    
                    <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] opacity-10">
                      SHA-256 SECURED PROVINCIAL ENTRY CHANNEL
                    </p>
                  </div>
                </>
              )}
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      {/* Billing Ledger */}
      <section className="space-y-6">
         <div className="flex items-center justify-between ml-2">
            <div className="flex items-center gap-3 opacity-60">
               <History className="w-4 h-4" />
               <h3 className="text-xs font-black uppercase tracking-widest leading-none">Transmission Ledger</h3>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">Showing last 3 cycles</p>
         </div>
         
         <div className="space-y-3">
            {[
              { id: 'TX-9921', date: 'SEP 01, 2024', amount: '$127.00', status: 'PAID', type: 'Legacy Node' },
              { id: 'TX-9842', date: 'AUG 01, 2024', amount: '$127.00', status: 'PAID', type: 'Legacy Node' },
              { id: 'TX-9755', date: 'JUL 01, 2024', amount: '$127.00', status: 'PAID', type: 'Legacy Node' },
            ].map((tx, i) => (
              <div key={i} className="p-6 rounded-3xl nm-inset-sm flex flex-col md:flex-row md:items-center justify-between text-[11px] font-black uppercase tracking-tight group hover:nm-flat transition-all border border-white/5 bg-white/2">
                 <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 flex-1">
                    <span className="opacity-20 tabular-nums w-24">{tx.date}</span>
                    <div className="flex items-center gap-4">
                       <FileText className="w-4 h-4 opacity-30" />
                       <span className="text-(--text-primary) italic">{tx.type} • {tx.id}</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between md:justify-end gap-12 mt-4 md:mt-0">
                    <span className="tabular-nums opacity-60 text-lg italic">{tx.amount}</span>
                    <div className="flex items-center gap-4 w-28 justify-end text-green-500">
                       <CheckCircle2 className="w-4 h-4" />
                       <span className="text-[10px]">VERIFIED</span>
                    </div>
                    <button 
                       onClick={() => alert(`TRANSMISSION AUDIT: ${tx.id}\nStatus: ${tx.status}\nGateway: Secured Stripe Relay`)}
                       className="p-2 opacity-20 hover:opacity-100 transition-opacity active:scale-90"
                     >
                       <MoreHorizontal className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
