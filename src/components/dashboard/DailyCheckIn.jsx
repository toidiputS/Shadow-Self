import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { supabase } from "@/api/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Zap, Moon, Flame, Check, X, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function DailyCheckIn({ onComplete }) {
  const { user, profile } = useAuth();
  const userId = user?.id;
  const guildId = profile?.guild_id; // Usually available in profile for this system
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    mood: 3,
    craving_level: 1,
    is_relapse: false,
    sleep_quality: 3,
    energy: 3,
    message: ""
  });

  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async (checkInData) => {
      const { data: result, error } = await supabase
        .from('guild_check_ins')
        .insert([{
          user_id: userId,
          guild_id: guildId,
          ...checkInData,
          date: new Date().toISOString().split('T')[0],
          check_in_type: 'daily'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyCheckIn', userId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      onComplete?.();
    },
    onError: (err) => {
      console.error("Uplink Protocol Failed:", err);
    }
  });

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
    else checkInMutation.mutate(data);
  };

  const steps = [
    {
      id: 1,
      question: "How is your mood right now?",
      field: "mood",
      min: 1,
      max: 5,
      icon: <Heart className="w-8 h-8 text-red-500" />,
      labels: ["Hostile", "Low", "Neutral", "Good", "Euphoric"]
    },
    {
      id: 2,
      question: "Rate your current craving level",
      field: "craving_level",
      min: 1,
      max: 5,
      icon: <Flame className="w-8 h-8 text-orange-500" />,
      labels: ["None", "Faint", "Manageable", "Strong", "Critical"]
    },
    {
      id: 3,
      question: "Protocol Breach Status (Relapse)",
      field: "is_relapse",
      type: "toggle",
      icon: <AlertCircle className="w-8 h-8 text-red-600" />,
      labels: ["Clean Protocol", "Relapse Incident"]
    },
    {
      id: 4,
      question: "How was your sleep last night?",
      field: "sleep_quality",
      min: 1,
      max: 5,
      icon: <Moon className="w-8 h-8 text-indigo-400" />,
      labels: ["Restless", "Poor", "Average", "Deep", "Perfect"]
    },
    {
      id: 5,
      question: "Current energy levels?",
      field: "energy",
      min: 1,
      max: 5,
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      labels: ["Depleted", "Drained", "Functional", "Active", "Peak"]
    },
    {
      id: 6,
      question: "Any notes for today's reflection?",
      field: "message",
      type: "text"
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl"
    >
      <div className="w-full max-w-lg nm-flat-lg rounded-[3rem] p-10 relative overflow-hidden ring-1 ring-white/10">
        {!user && step === steps.length && (
           <div className="absolute inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-10 text-center backdrop-blur-md">
              <AlertCircle className="w-16 h-16 text-orange-500 mb-6 animate-pulse" />
              <h3 className="text-xl font-black uppercase tracking-widest text-orange-500 mb-4 italic">Institutional Identity Lost</h3>
              <p className="text-[10px] font-bold opacity-60 leading-relaxed italic uppercase">"Your terminal session is missing identity tokens. Re-stabilize connection by reloading the command hub before attempting uplink."</p>
              <button 
                onClick={onComplete}
                className="mt-10 px-10 py-4 rounded-2xl nm-button font-black text-[10px] uppercase tracking-widest text-orange-400 group flex items-center gap-3"
              >
                Clear Node
              </button>
           </div>
        )}
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-black/10">
          <motion.div 
            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 w-10 h-10 rounded-full nm-button flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="py-6"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-4xl nm-inset flex items-center justify-center mb-8 ring-1 ring-white/5">
                {currentStep.icon || <Sparkles className="w-8 h-8 text-blue-500" />}
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-2 leading-tight">{currentStep.question}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-10">Daily Status Synchronization</p>

              {currentStep.type === "text" ? (
                <textarea
                  autoFocus
                  placeholder="Type your one-line journal entry..."
                  className="w-full nm-inset rounded-2xl p-6 text-sm min-h-[140px] resize-none focus:outline-none transition-all focus:ring-1 focus:ring-blue-500/20"
                  value={data.message}
                  onChange={(e) => updateField("message", e.target.value)}
                />
              ) : currentStep.type === "toggle" ? (
                <div className="flex flex-col w-full gap-5">
                   <button 
                      onClick={() => updateField(currentStep.field, false)}
                      className={`w-full py-6 rounded-3xl font-black text-center transition-all ${!data[currentStep.field] ? 'nm-inset-sm text-green-500 ring-1 ring-green-500/20' : 'nm-button opacity-60'}`}
                   >
                      <span className="uppercase tracking-[0.2em]">{currentStep.labels[0]}</span>
                   </button>
                   <button 
                      onClick={() => updateField(currentStep.field, true)}
                      className={`w-full py-6 rounded-3xl font-black text-center transition-all ${data[currentStep.field] ? 'nm-inset-sm text-red-500 ring-1 ring-red-500/20' : 'nm-button opacity-40'}`}
                   >
                      <span className="uppercase tracking-[0.2em]">{currentStep.labels[1]}</span>
                   </button>
                </div>
              ) : (
                <div className="flex flex-col w-full gap-8">
                  <div className="flex justify-between items-center px-4">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateField(currentStep.field, val)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                          data[currentStep.field] === val 
                            ? "nm-inset-sm text-blue-500" 
                            : "nm-button hover:text-blue-400"
                        }`}
                      >
                        <span className="text-lg font-black">{val}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{currentStep.labels[0]}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{currentStep.labels[4]}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-5 rounded-2xl nm-button font-black text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100"
            >
              Previous
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={checkInMutation.isLoading}
            className="flex-[2] py-5 rounded-2xl nm-button font-black text-[10px] uppercase tracking-[0.2rem] text-blue-500 flex items-center justify-center gap-3 relative overflow-visible"
          >
            <span className={checkInMutation.isLoading ? "animate-pulse" : ""}>
                {checkInMutation.isLoading ? "SYNCHRONIZING..." : step === steps.length ? "Initialize Uplink" : "Next Core Variable"}
            </span>
            {checkInMutation.isError && (
                <div className="absolute -top-12 left-0 right-0 py-2 px-4 rounded-xl bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">
                    ERROR: UPLINK_DENIED (Check ID)
                </div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

