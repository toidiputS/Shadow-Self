import React, { useState } from "react";
import { 
  Home, 
  Users, 
  ShieldCheck, 
  Bell, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Plus, 
  FileUp, 
  ClipboardList,
  Sparkles
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MotionDiv = motion.div;

const STEPS = [
  { id: "profile", title: "House Profile", icon: Home, description: "Set your house details" },
  { id: "capacity", title: "Scale & Roles", icon: Users, description: "Define your member limits" },
  { id: "sponsors", title: "Sponsor Setup", icon: ShieldCheck, description: "Configure support structure" },
  { id: "notifications", title: "Alert Frequency", icon: Bell, description: "How often to send alerts" },
  { id: "launch", title: "House Launch", icon: Sparkles, description: "Start with 14-day habit plan" }
];

export default function SetupWizard({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    houseName: "",
    houseType: null,
    residentCount: 12,
    staffRoles: ["Admin", "Sponsor", "Member"],
    sponsorMethod: "Manual",
    notificationFreq: "Standard",
    launchMode: false
  });

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-[4rem] nm-flat border border-blue-500/10 min-h-[600px] flex flex-col relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px]"></div>

      {/* Progress Header */}
      <div className="flex items-center justify-between mb-16 px-4 relative z-10">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                idx <= currentStepIndex ? 'nm-button text-blue-500' : 'opacity-20 grayscale'
              }`}
            >
              <step.icon className={`w-5 h-5 ${idx === currentStepIndex ? 'animate-pulse' : ''}`} />
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-4 transition-all duration-700 ${
                idx < currentStepIndex ? 'bg-blue-500/40' : 'bg-white/10'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-4xl font-black uppercase tracking-widest italic text-blue-500">{currentStep.title}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-3">{currentStep.description}</p>
            </div>

            {currentStep.id === "profile" && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest ml-4 opacity-40">House Name</label>
                  <input 
                    type="text" 
                    name="houseName"
                    value={formData.houseName}
                    onChange={handleInputChange}
                    placeholder="e.g. North Recovery House"
                    className="w-full px-8 py-6 rounded-3xl nm-inset-sm bg-transparent border-none focus:outline-hidden text-sm font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                   <div 
                    onClick={() => setFormData(p => ({...p, houseType: 'Standard'}))}
                    className={`p-8 rounded-4xl transition-all cursor-pointer border ${
                      formData.houseType === 'Standard' 
                      ? 'nm-inset border-blue-500/20 bg-blue-500/2' 
                      : 'nm-flat hover:nm-flat-lg border-blue-500/0 hover:border-blue-500/20'
                    }`}
                   >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center transition-colors ${formData.houseType === 'Standard' ? 'text-blue-500' : 'text-white/20'}`}>
                          <Home className="w-6 h-6" />
                        </div>
                        {formData.houseType === 'Standard' && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                      </div>
                      <h3 className={`text-xs font-black uppercase transition-colors ${formData.houseType === 'Standard' ? 'text-blue-500' : 'text-white/40'}`}>Standard Housing</h3>
                      <p className="text-[9px] opacity-40 mt-2 font-bold uppercase leading-relaxed">Baseline recovery environment with standard habits.</p>
                   </div>
                   <div 
                    onClick={() => setFormData(p => ({...p, houseType: 'Intensive'}))}
                    className={`p-8 rounded-4xl transition-all cursor-pointer border ${
                      formData.houseType === 'Intensive' 
                      ? 'nm-inset border-orange-500/20 bg-orange-500/2' 
                      : 'nm-flat hover:nm-flat-lg border-orange-500/0 hover:border-orange-500/20'
                    }`}
                   >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center transition-colors ${formData.houseType === 'Intensive' ? 'text-orange-500' : 'text-white/20'}`}>
                          <Sparkles className="w-6 h-6" />
                        </div>
                        {formData.houseType === 'Intensive' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                      </div>
                      <h3 className={`text-xs font-black uppercase transition-colors ${formData.houseType === 'Intensive' ? 'text-orange-500' : 'text-white/40'}`}>Intensive Support</h3>
                      <p className="text-[9px] opacity-40 mt-2 font-bold uppercase leading-relaxed">High-engagement recovery with advanced reward systems.</p>
                   </div>
                </div>
              </div>
            )}

            {currentStep.id === "capacity" && (
              <div className="space-y-10">
                <div className="flex items-center justify-between p-10 rounded-[2.5rem] nm-inset bg-blue-500/5">
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-widest">Resident Capacity</h3>
                      <p className="text-[10px] font-black uppercase opacity-30 mt-2">Maximum member slots</p>
                   </div>
                   <div className="flex items-center gap-6">
                      <button onClick={() => setFormData(p => ({...p, residentCount: Math.max(1, p.residentCount - 1)}))} className="w-12 h-12 rounded-xl nm-button text-xl font-black">-</button>
                      <span className="text-3xl font-black italic min-w-12 text-center text-blue-500">{formData.residentCount}</span>
                      <button onClick={() => setFormData(p => ({...p, residentCount: p.residentCount + 1}))} className="w-12 h-12 rounded-xl nm-button text-xl font-black">+</button>
                   </div>
                </div>

                <div className="p-10 rounded-[2.5rem] nm-flat border border-blue-500/10">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black uppercase tracking-widest">Import Members</h3>
                      <FileUp className="w-4 h-4 text-orange-500" />
                   </div>
                   <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/2 transition-colors cursor-pointer group">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-blue-500 transition-colors">Click to upload Member List (CSV)</p>
                   </div>
                </div>
              </div>
            )}

            {currentStep.id === "sponsors" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <button 
                  onClick={() => setFormData(p => ({...p, sponsorMethod: 'Direct'}))}
                  className={`p-10 rounded-[2.5rem] text-left transition-all ${formData.sponsorMethod === 'Direct' ? 'nm-inset border border-blue-500/20 bg-blue-500/2' : 'nm-flat opacity-50 hover:opacity-100'}`}
                 >
                    <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-blue-500 mb-6 font-black">1:1</div>
                    <h3 className="text-sm font-black uppercase tracking-widest">One-on-One</h3>
                    <p className="text-[9px] opacity-40 mt-3 font-bold uppercase leading-relaxed">Sponsors are assigned directly to individual members for close support.</p>
                 </button>
                 <button 
                  onClick={() => setFormData(p => ({...p, sponsorMethod: 'Pool'}))}
                  className={`p-10 rounded-[2.5rem] text-left transition-all ${formData.sponsorMethod === 'Pool' ? 'nm-inset border border-orange-500/20 bg-orange-500/2' : 'nm-flat opacity-50 hover:opacity-100'}`}
                 >
                    <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-orange-500 mb-6 font-black">Team</div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Group Support</h3>
                    <p className="text-[9px] opacity-40 mt-3 font-bold uppercase leading-relaxed">A team of sponsors works together to support all house members.</p>
                 </button>
              </div>
            )}

            {currentStep.id === "notifications" && (
              <div className="space-y-6">
                 {[
                   { id: 'low', name: 'Minimal Alerts', desc: 'Fewest alerts possible. Only critical updates are sent.' },
                   { id: 'standard', name: 'Standard Support', desc: 'Balanced support. Daily morning and evening check-ins.' },
                   { id: 'high', name: 'Full Support', desc: 'Real-time updates. Immediate alerts for all missed habits.' },
                 ].map((opt) => (
                   <button 
                    key={opt.id}
                    onClick={() => setFormData(p => ({...p, notificationFreq: opt.id}))}
                    className={`w-full p-8 rounded-3xl flex items-center justify-between transition-all ${
                      formData.notificationFreq === opt.id ? 'nm-inset border border-blue-500/20' : 'nm-flat opacity-40 hover:opacity-100'
                    }`}
                   >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black uppercase tracking-widest mb-1">{opt.name}</span>
                        <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">{opt.desc}</span>
                      </div>
                      {formData.notificationFreq === opt.id && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                   </button>
                 ))}
              </div>
            )}

            {currentStep.id === "launch" && (
              <div className="flex flex-col items-center justify-center py-10 space-y-12">
                 <div className="w-32 h-32 rounded-full nm-flat flex items-center justify-center text-orange-500 relative">
                    <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-ping opacity-20"></div>
                    <Sparkles className="w-16 h-16 relative z-10" />
                 </div>
                 <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-widest italic">Ready to Start</h3>
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                      Starting the house will set up default habits and a 14-day intro period.
                    </p>
                 </div>
                 <label className="flex items-center gap-6 cursor-pointer p-8 rounded-[3rem] nm-inset bg-orange-500/5 group hover:nm-flat transition-all">
                    <input 
                      type="checkbox" 
                      name="launchMode"
                      checked={formData.launchMode}
                      onChange={handleInputChange}
                      className="w-8 h-8 rounded-xl appearance-none nm-inset cursor-pointer checked:bg-orange-500 checked:nm-flat transition-all border-none focus:ring-0"
                    />
                    <div className="flex flex-col">
                       <span className="text-sm font-black uppercase tracking-widest text-orange-500">Enable House Habits</span>
                       <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Set up default recovery habits (14 Days)</span>
                    </div>
                 </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="mt-16 flex justify-between px-4 relative z-10">
        <button 
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-3 px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${
            currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'nm-button opacity-40 hover:opacity-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <button 
          onClick={nextStep}
          disabled={currentStep.id === 'profile' && !formData.houseType}
          className={`flex items-center gap-3 px-12 py-5 rounded-3xl nm-button font-black text-[10px] uppercase tracking-widest transition-all group ${
            (currentStep.id === 'profile' && !formData.houseType) 
            ? 'opacity-20 grayscale pointer-events-none' 
            : 'text-blue-500 hover:scale-105 active:scale-95'
          }`}
        >
          {currentStepIndex === STEPS.length - 1 ? 'Finish Setup' : 'Continue'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
