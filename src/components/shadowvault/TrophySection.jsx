import React from "react";
import { Award, ShieldCheck, Flame, Zap, Trophy, Target, Star, ShieldAlert } from "lucide-react";

export default function TrophySection({ profile, progress, completionsCount }) {
  const milestones = [
    {
      id: "novice_initiate",
      name: "Novice Initiate",
      description: "First Protocol Validated",
      icon: <Target className="w-6 h-6" />,
      color: "text-blue-500",
      condition: completionsCount >= 1,
    },
    {
      id: "shadow_scholar",
      name: "Shadow Scholar",
      description: "10 Protocols Executed",
      icon: <Award className="w-6 h-6" />,
      color: "text-purple-500",
      condition: completionsCount >= 10,
    },
    {
      id: "iron_will",
      name: "Iron Will",
      description: "7-Day Compliance Streak",
      icon: <Flame className="w-6 h-6" />,
      color: "text-orange-500",
      condition: profile?.best_streak >= 7,
    },
    {
      id: "perfect_sync",
      name: "Perfect Sync",
      description: "One Week of 'Perfect Days'",
      icon: <Star className="w-6 h-6" />,
      color: "text-yellow-500",
      condition: (progress?.perfect_days || 0) >= 7,
    },
    {
      id: "titan_resolve",
      name: "Titan of Resolve",
      description: "30-Day Compliance Streak",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "text-green-500",
      condition: profile?.best_streak >= 30,
    },
    {
      id: "guild_stalwart",
      name: "Guild Stalwart",
      description: "Earn 5,000 Total Merit",
      icon: <Trophy className="w-6 h-6" />,
      color: "text-blue-400",
      condition: (progress?.xp || 0) >= 5000,
    }
  ];

  return (
    <div className="mt-16 border-t border-white/5 pt-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-widest uppercase">System Milestones</h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Institutional Audit - Achievement Progress</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {milestones.map((milestone) => (
          <div 
            key={milestone.id}
            className={`p-6 rounded-4xl transition-all duration-500 relative overflow-hidden ${
              milestone.condition 
                ? "nm-flat-lg border border-white/5" 
                : "nm-inset opacity-40 grayscale"
            }`}
          >
            {/* Background Decorative Icon */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 transition-transform duration-700 ${milestone.condition ? "group-hover:scale-110" : ""}`}>
               {milestone.icon}
            </div>

            <div className="flex items-start gap-5 relative z-10">
              <div className={`w-14 h-14 rounded-2xl nm-inset-sm flex items-center justify-center shrink-0 ${milestone.condition ? milestone.color : ""}`}>
                {milestone.condition ? milestone.icon : <ShieldAlert className="w-6 h-6 opacity-40" />}
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-2">
                  {milestone.name}
                </h3>
                <p className="text-xs text-(--text-secondary) opacity-60 leading-snug">
                  {milestone.description}
                </p>
                
                {!milestone.condition && (
                  <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full nm-inset-sm text-[8px] font-black uppercase tracking-widest opacity-40 border border-white/5">
                    <Zap className="w-3 h-3" />
                    <span>Locked Clearance</span>
                  </div>
                )}
                {milestone.condition && (
                  <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full nm-inset-sm text-[8px] font-black uppercase tracking-tighter text-green-400/60 border border-green-500/10">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verification Sync: COMPLIANT</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
