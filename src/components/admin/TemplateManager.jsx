import React, { useState } from "react";
import { 
  ClipboardList, 
  Copy, 
  CheckCircle2, 
  Zap, 
  Plus, 
  Calendar, 
  Clock, 
  ShieldCheck,
  AlertCircle,
  Stethoscope,
  BookOpen,
  Briefcase,
  Users,
  ShieldAlert
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MotionDiv = motion.div;

const RECOVERY_TEMPLATES = [
  { id: "orientation", name: "Guild Orientation", icon: ShieldCheck, xp: 200, sp: 100, freq: "Once", desc: "System training and identity establishment protocols." },
  { id: "morning", name: "Morning Reset", icon: Zap, xp: 50, sp: 25, freq: "Daily", desc: "Identity verification and intention setting." },
  { id: "meeting", name: "Meeting Attendance", icon: Users, xp: 100, sp: 50, freq: "Daily", desc: "Proof of attendance at recovery community meetings." },
  { id: "meds", name: "Medication Compliance", icon: Stethoscope, xp: 25, sp: 10, freq: "Daily", desc: "Supervised or verified medical adherence." },
  { id: "hygiene", name: "Living Hygiene", icon: ClipboardList, xp: 25, sp: 10, freq: "Daily", desc: "Bed made, quarters inspected and validated." },
  { id: "job", name: "Job Search Activity", icon: Briefcase, xp: 150, sp: 75, freq: "Weekday", desc: "Proof of applications or interview attendance." },
  { id: "journaling", name: "Recovery Journal", icon: BookOpen, xp: 50, sp: 25, freq: "Daily", desc: "Qualitative reflection on progress and triggers." },
  { id: "curfew", name: "Curfew Verification", icon: Clock, xp: 50, sp: 25, freq: "Daily", desc: "Presence verification inside the house by 10 PM." },
  { id: "relapse", name: "Relapse Response", icon: ShieldAlert, xp: -500, sp: -250, freq: "Ad-hoc", desc: "Intensive stabilization protocols for deviation." }
];

export default function TemplateManager({ onClone }) {
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  const toggleTemplate = (id) => {
    setSelectedTemplates(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleClone = () => {
    onClone(selectedTemplates);
    setSuccessMessage(`Cloned ${selectedTemplates.length} protocols to House Command.`);
    setSelectedTemplates([]);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between ml-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest italic text-blue-500">Recovery Templates</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">Clone institutional standard protocols</p>
        </div>
        <button 
          onClick={handleClone}
          disabled={selectedTemplates.length === 0}
          className={`flex items-center gap-4 px-10 py-6 rounded-[2.5rem] nm-button text-[10px] font-black uppercase tracking-[0.2rem] text-blue-500 transition-all ${
            selectedTemplates.length === 0 ? 'opacity-20 pointer-events-none grayscale' : 'hover:scale-105 active:scale-95'
          }`}
        >
          <Copy className="w-5 h-5" /> Execute Clone ({selectedTemplates.length})
        </button>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 rounded-3xl nm-flat bg-green-500/5 border border-green-500/20 flex items-center justify-center gap-6"
          >
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {RECOVERY_TEMPLATES.map((template) => (
          <button 
            key={template.id}
            onClick={() => toggleTemplate(template.id)}
            className={`p-10 rounded-[3rem] text-left transition-all duration-500 relative group overflow-hidden ${
              selectedTemplates.includes(template.id) ? 'nm-inset border border-blue-500/20' : 'nm-flat opacity-60 hover:opacity-100 border border-transparent'
            }`}
          >
             {/* Gradient Shine */}
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000 opacity-0 group-hover:opacity-100"></div>

             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center transition-colors ${
                  selectedTemplates.includes(template.id) ? 'text-blue-500' : 'text-blue-500/40'
                }`}>
                   <template.icon className="w-7 h-7" />
                </div>
                {selectedTemplates.includes(template.id) && (
                   <div className="w-8 h-8 rounded-full nm-flat flex items-center justify-center bg-blue-500">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                   </div>
                )}
             </div>

             <div className="relative z-10">
               <h3 className="text-xl font-black uppercase tracking-widest mb-3 leading-none">{template.name}</h3>
               <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-6 line-clamp-2 leading-relaxed">{template.desc}</p>
             </div>

             <div className="flex items-center gap-6 pt-4 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest">{template.xp} XP</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-orange-500/40"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest">{template.sp} SP</span>
                </div>
                <div className="ml-auto">
                   <span className="text-[8px] font-black uppercase italic opacity-20 group-hover:opacity-100 transition-opacity">{template.freq}</span>
                </div>
             </div>
          </button>
        ))}

        <button className="p-10 rounded-[3rem] nm-flat border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-30 hover:opacity-100 hover:border-blue-500/30 transition-all group">
           <div className="w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
           </div>
           <h4 className="text-sm font-black uppercase tracking-widest">New Protocol</h4>
           <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-2">Architect custom guild alignment</p>
        </button>
      </div>
    </div>
  );
}
