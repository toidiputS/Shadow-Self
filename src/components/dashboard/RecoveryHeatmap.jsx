import React from "react";
import { format, subDays, isSameDay, eachDayOfInterval, isToday } from "date-fns";
import { Activity, Info } from "lucide-react";

export default function RecoveryHeatmap({ completionLogs = [] }) {
  const today = new Date();
  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  });

  const getIntensity = (date) => {
    if (!Array.isArray(completionLogs)) return "bg-white/5";
    
    // Safety check filter for valid log entries
    const count = completionLogs.filter(log => {
      if (!log?.completed_at) return false;
      try {
        return isSameDay(new Date(log.completed_at), date);
      } catch (e) {
        return false;
      }
    }).length;

    if (count === 0) return "bg-white/5";
    if (count < 2) return "bg-blue-500/20";
    if (count < 4) return "bg-blue-500/50";
    return "bg-blue-500";
  };

  return (
    <div className="p-8 rounded-4xl nm-flat-lg border border-white/5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest leading-tight">Consistency Matrix</h3>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">30-Day Tactical Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full nm-inset-sm text-[9px] font-black uppercase tracking-tighter opacity-40">
           <Info className="w-3 h-3" />
           <span>Protocol Fidelity</span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-3">
        {last30Days.map((date, i) => {
          const intensityClass = getIntensity(date);
          const isTodayDate = isToday(date);
          
          return (
            <div 
              key={i}
              className={`aspect-square rounded-lg nm-inset-sm relative group overflow-hidden ${isTodayDate ? 'border border-blue-500/40' : ''}`}
              title={format(date, 'MMM dd, yyyy')}
            >
               <div className={`absolute inset-1 rounded-md transition-all duration-500 ${intensityClass} group-hover:inset-0`} />
               {isTodayDate && (
                 <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
               )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between opacity-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-sm bg-white/5" />
             <span className="text-[8px] font-black uppercase">Zero</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
             <span className="text-[8px] font-black uppercase">Max</span>
          </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest italic leading-none pt-1">Institutional Audit Log Locked</p>
      </div>
    </div>
  );
}
