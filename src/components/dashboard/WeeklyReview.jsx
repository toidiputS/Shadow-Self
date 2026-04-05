import React, { useMemo } from "react";
import { X, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { startOfDay, subDays, format } from "date-fns";

export default function WeeklyReview({ onClose, completionLogs, quests }) {
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(startOfDay(subDays(new Date(), i)));
    }
    return days;
  }, []);

  const stats = useMemo(() => {
    const dailyHabits = quests.filter(q => q.type === "DAILY_HABIT" || q.type === "daily");
    const totalPossibleCompletions = dailyHabits.length * 7;
    
    if (totalPossibleCompletions === 0) return { rate: 0, reliable: "N/A", missedPatterns: [] };

    const logsLast7Days = completionLogs.filter(log => {
      const logDate = new Date(log.completed_at);
      return logDate >= last7Days[0];
    });

    const completionRate = Math.round((logsLast7Days.length / totalPossibleCompletions) * 100);

    // Find most reliable quest
    const counts = {};
    logsLast7Days.forEach(log => {
      counts[log.quest_id] = (counts[log.quest_id] || 0) + 1;
    });

    let mostReliableId = null;
    let maxCount = -1;
    Object.entries(counts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostReliableId = id;
      }
    });

    const reliableQuest = quests.find(q => q.id === mostReliableId)?.title || "N/A";

    // Strongest time of day
    const hours = new Array(24).fill(0);
    logsLast7Days.forEach(log => {
      const hour = new Date(log.completed_at).getHours();
      hours[hour]++;
    });
    const strongestHour = hours.indexOf(Math.max(...hours));

    return {
      rate: completionRate,
      reliable: reliableQuest,
      strongestTime: `${strongestHour}:00 - ${strongestHour + 1}:00`,
      count: logsLast7Days.length
    };
  }, [completionLogs, quests, last7Days]);

  const dailyData = useMemo(() => {
    return last7Days.map(day => {
      const count = completionLogs.filter(log => 
        startOfDay(new Date(log.completed_at)).getTime() === day.getTime()
      ).length;
      return { day, count };
    });
  }, [completionLogs, last7Days]);

  const MotionDiv = motion.div;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-4xl nm-flat-lg border border-white/10 p-8 md:p-12 relative text-(--text-primary)"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full nm-button flex items-center justify-center hover:text-red-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
             <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-blue-500">
               <Calendar className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-black uppercase tracking-widest">Weekly Progress Report</h2>
          </div>
          <p className="text-(--text-secondary) font-bold uppercase tracking-[0.3em] text-[10px] opacity-40 ml-14">Your Weekly Review</p>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-3xl nm-inset-sm flex flex-col justify-between border-t border-white/5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-(--text-secondary) opacity-50 mb-4">Completion Rate</p>
              <h3 className="text-5xl font-black text-blue-500">{stats.rate}<span className="text-xl">%</span></h3>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-secondary) opacity-40 mt-6 italic">Consistency Score</p>
          </div>

          <div className="p-8 rounded-3xl nm-inset-sm flex flex-col justify-between border-t border-white/5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-(--text-secondary) opacity-50 mb-4">Strongest Habit</p>
              <h3 className="text-xl font-black leading-tight uppercase line-clamp-2">{stats.reliable}</h3>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-secondary) opacity-40 mt-6 italic">Most Consistent Habit</p>
          </div>

          <div className="p-8 rounded-3xl nm-inset-sm flex flex-col justify-between border-t border-white/5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-(--text-secondary) opacity-50 mb-4">Best Time of Day</p>
              <h3 className="text-xl font-black uppercase">{stats.strongestTime}</h3>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-secondary) opacity-40 mt-6 italic">Peak Habit Window</p>
          </div>
        </div>

        {/* Daily Chart Placeholder Logic */}
        <div className="mb-16">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-(--text-secondary) opacity-40 flex items-center gap-3">
            <TrendingUp className="w-4 h-4" />
            Daily Progress
          </h3>
          <div className="flex items-end justify-between gap-2 md:gap-4 h-48 px-4">
             {dailyData.map((data, idx) => {
               const height = data.count > 0 ? (data.count / 10) * 100 : 5; // Simplified scale
               return (
                 <div key={idx} className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full relative group">
                        <MotionDiv 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 8)}%` }}
                          className={`w-full rounded-t-xl transition-all duration-500 ${idx === 6 ? 'bg-blue-500' : 'nm-flat-sm'}`}
                        />
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.count} Units
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">
                      {format(data.day, 'EEE')}
                    </span>
                 </div>
               )
             })}
          </div>
        </div>

        {/* Insight Section */}
        <div className="p-8 rounded-3xl nm-flat-sm bg-blue-500/5 border border-blue-500/10 mb-8">
           <div className="flex items-start gap-4">
             <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
             <div>
               <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-2">Weekly Insights</p>
               <p className="text-sm font-medium leading-relaxed opacity-80">
                 You've maintained a completion rate of {stats.rate}%. You're most consistent with <span className="text-blue-400 font-bold">"{stats.reliable}"</span>, and you tend to get the most done during the {stats.strongestTime} window. Keep up the good work!
               </p>
             </div>
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-6 rounded-2xl nm-button font-black text-xs uppercase tracking-[0.5rem] text-(--text-secondary) hover:text-blue-500 transition-all"
        >
          Finish Review
        </button>
      </MotionDiv>
    </div>
  );
}
