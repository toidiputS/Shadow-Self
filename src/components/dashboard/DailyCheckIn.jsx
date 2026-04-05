import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { supabase } from "@/api/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Zap, Moon, Flame, Check, X, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DailyCheckIn({ onComplete }) {
  const { user, profile } = useAuth();
  const userId = user?.id;
  const [guildId, setGuildId] = useState(profile?.guild_id);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    mood: 3,
    craving_level: 1,
    is_relapse: false,
    sleep_quality: 3,
    energy: 3,
    message: "",
    started_at: new Date().toISOString()
  });
  const [graceTimeRemaining, setGraceTimeRemaining] = useState(null);
  const [isGraceActive, setIsGraceActive] = useState(false);

  // Security: Fetch guild identity if not present in profile cache
  useEffect(() => {
    if (userId && !guildId) {
       const fetchGuild = async () => {
         // Priority 1: Check member identity
         const { data: memberData } = await supabase
           .from('guild_members')
           .select('guild_id')
           .eq('user_id', userId)
           .maybeSingle();
         
         if (memberData?.guild_id) {
            setGuildId(memberData.guild_id);
            return;
         }

         // Priority 2: Check profile
         if (profile?.guild_id) {
            setGuildId(profile.guild_id);
            return;
         }

         // Priority 3: Fallback for admins/owners - find first available guild
         const { data: firstGuild } = await supabase.from('guilds').select('id').limit(1).maybeSingle();
         if (firstGuild?.id) {
            setGuildId(firstGuild.id);
         }
       };
       fetchGuild();
    }
  }, [profile?.guild_id, userId, guildId]);

  // Grace Period Logic: 15-minute intermediary support step
  useEffect(() => {
    // Grace period starts from mounting (when the user opens the modal)
    const graceEnd = new Date(data.started_at).getTime() + 15 * 60 * 1000;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = graceEnd - now;
      
      if (diff <= 0) {
        setGraceTimeRemaining(0);
        setIsGraceActive(false);
        clearInterval(timer);
      } else {
        setGraceTimeRemaining(Math.floor(diff / 1000));
        setIsGraceActive(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data.started_at]);

  const formatGraceTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async (checkInData) => {
      if (!userId || !guildId) {
         throw new Error("Missing Information: Connection unstable.");
      }
      
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
      console.error("Check-in Failed:", err);
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
      labels: ["Upset", "Low", "Neutral", "Good", "Very Happy"]
    },
    {
      id: 2,
      question: "Rate your current craving level",
      field: "craving_level",
      min: 1,
      max: 5,
      icon: <Flame className="w-8 h-8 text-orange-500" />,
      labels: ["None", "Faint", "Manageable", "Strong", "Very Strong"]
    },
    {
      id: 3,
      question: "How are you doing today?",
      field: "is_relapse",
      type: "toggle",
      icon: <AlertCircle className="w-8 h-8 text-red-600" />,
      labels: ["I'm doing well", "I need extra help today"]
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
      className="fixed inset-0 z-150 flex items-center justify-center px-6 bg-black/85 backdrop-blur-3xl"
    >
      <div className="w-full max-w-lg nm-flat-lg rounded-[3rem] p-10 relative overflow-hidden ring-1 ring-white/10">
        {!guildId && step === steps.length && (
          <div className="absolute inset-0 z-160 bg-(--bg-color) flex flex-col items-center justify-center p-10 text-center backdrop-blur-md">
            <AlertCircle className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
            <h3 className="text-xl font-black uppercase tracking-widest text-red-500 mb-4 italic">Unable to connect to your house</h3>
            <p className="text-[10px] font-bold opacity-60 leading-relaxed italic uppercase">"We couldn't find your house information. Please ask a house manager for help so you can start your daily check-in."</p>
            <button
              onClick={onComplete}
              className="mt-10 px-10 py-5 rounded-2xl nm-button font-black text-[10px] uppercase tracking-widest text-blue-500 active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Success Splash */}
        {checkInMutation.isSuccess && (
          <div className="absolute inset-0 z-160 bg-(--bg-color) flex flex-col items-center justify-center p-10 text-center backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full nm-inset flex items-center justify-center mb-8 ring-4 ring-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2 text-green-500">Check-In Complete</h3>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.4em] mb-12">"Every day clean is a victory."</p>
            <button
              onClick={onComplete}
              className="px-12 py-5 rounded-3xl nm-button font-black text-[10px] uppercase tracking-[0.4em] text-blue-500 hover:scale-105 transition-all active:nm-inset-sm"
            >
              Back to Guild
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

        {/* Grace Period Indicator (Intermediary Support Step) */}
        {isGraceActive && step === 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 rounded-2xl nm-inset-sm bg-orange-500/5 border border-orange-500/20 z-10 animate-in fade-in slide-in-from-top-2 duration-700">
             <Clock className="w-3 h-3 text-orange-500 animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest text-orange-500/80">Support Grace Period: {formatGraceTime(graceTimeRemaining)}</span>
          </div>
        )}

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
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-10">Daily Progress Review</p>

              {currentStep.type === "text" ? (
                <textarea
                  autoFocus
                  placeholder="Share a thought about your day..."
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
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${data[currentStep.field] === val
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
            className="flex-2 py-5 rounded-2xl nm-button font-black text-[10px] uppercase tracking-[0.2rem] text-blue-500 flex items-center justify-center gap-3 relative overflow-visible"
          >
            <span className={checkInMutation.isLoading ? "animate-pulse" : ""}>
              {checkInMutation.isLoading ? "SAVING..." : step === steps.length ? "Finish Check-in" : "Next Question"}
            </span>
            {checkInMutation.isError && (
              <div className="absolute -top-12 left-0 right-0 py-2 px-4 rounded-xl bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">
                ERROR: FAILED TO SAVE (Check Connection)
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

