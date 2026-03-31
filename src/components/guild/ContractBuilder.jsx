import React, { useState } from "react";
import { 
  Plus, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Skull, 
  TrendingDown, 
  Zap, 
  Clock,
  Settings,
  ArrowRight
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const CONSEQUENCES = [
  { id: "sp_yield_reduction", name: "SP Yield Reduction", icon: TrendingDown, color: "text-red-400", description: "All members lose 20% of SP generation until cleared." },
  { id: "xp_debuff", name: "XP Gain Penalty", icon: Zap, color: "text-blue-400", description: "XP rewards globally reduced by 15%." },
  { id: "stabilization_mandate", name: "Stabilization Mandate", icon: Skull, color: "text-purple-400", description: "Requires 10 perfect days from all members to clear." },
];

export default function ContractBuilder({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    threshold: 90,
    consequence: "sp_yield_reduction",
    durationDays: 7
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-100"
          />
          <Motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-(--bg-color) nm-flat-lg z-110 p-12 rounded-4xl border border-white/5 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center text-blue-500">
                     <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-[0.4em] leading-none mb-3 italic">Contract Architect</h2>
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-widest leading-none">Drafting Collective Accountability Binding</p>
                  </div>
               </div>
               <button 
                onClick={onClose}
                className="w-14 h-14 rounded-2xl nm-button flex items-center justify-center hover:text-red-500 transition-colors"
               >
                <X className="w-6 h-6" />
               </button>
            </div>

            <div className="space-y-12">
               {/* Contract Identity */}
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Protocol Identity</label>
                  <input 
                    type="text" 
                    placeholder="Enter Contract Title (e.g. Zero Breach Week)"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-10 py-6 rounded-3xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold uppercase tracking-widest"
                  />
               </div>

               {/* Threshold Slider */}
               <div className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Compliance Threshold</label>
                     <span className="text-xl font-black text-blue-500">{formData.threshold}%</span>
                  </div>
                  <div className="relative h-4 rounded-full nm-inset-sm p-1 group">
                    <input 
                       type="range" 
                       min="50" 
                       max="100" 
                       step="5"
                       value={formData.threshold}
                       onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                       className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                    />
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        formData.threshold > 90 ? 'bg-green-500/40' : 
                        formData.threshold > 75 ? 'bg-blue-500/40' : 'bg-orange-500/40'
                      }`}
                      style={{ width: `${(formData.threshold - 50) / 0.5}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold opacity-30 italic px-4">"Collective failure below this threshold will trigger systemic penalties."</p>
               </div>

               {/* Consequence Selection */}
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Systemic Consequence</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {CONSEQUENCES.map((c) => (
                       <button
                         key={c.id}
                         onClick={() => setFormData({...formData, consequence: c.id})}
                         className={`p-6 rounded-4xl text-left transition-all relative overflow-hidden flex flex-col gap-4 ${
                           formData.consequence === c.id ? 'nm-flat-sm border border-red-500/20' : 'nm-inset-sm opacity-40 hover:opacity-100'
                         }`}
                       >
                          <div className={`w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center ${c.color}`}>
                             <c.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest mb-1">{c.name}</h4>
                            <p className="text-[9px] font-bold opacity-60 leading-tight italic">{c.description}</p>
                          </div>
                          {formData.consequence === c.id && (
                             <div className="absolute top-4 right-4">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                             </div>
                          )}
                       </button>
                     ))}
                  </div>
               </div>

               {/* Execution Summary */}
               <div className="p-8 rounded-3xl nm-inset-sm border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl nm-flat-sm flex items-center justify-center text-blue-500">
                        <Clock className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Duration Protocol</p>
                        <h4 className="text-xl font-black">{formData.durationDays} DAYS <span className="text-[10px] opacity-30 font-bold uppercase tracking-widest font-mono">(168h)</span></h4>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     {[3, 7, 14, 30].map(d => (
                       <button 
                        key={d}
                        onClick={() => setFormData({...formData, durationDays: d})}
                        className={`w-12 h-12 rounded-xl text-[10px] font-black border transition-all ${
                          formData.durationDays === d ? 'nm-button text-blue-500 border-blue-500/20' : 'nm-inset-sm opacity-30 border-transparent hover:opacity-100'
                        }`}
                       >
                         {d}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="pt-6">
                  <button className="w-full py-6 px-12 rounded-4xl nm-button text-[12px] font-black uppercase tracking-[0.4rem] text-blue-500 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                    Finalize Accountability Binding <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mt-8 italic">"All collective nodes will be bound by these terms upon execution."</p>
               </div>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
