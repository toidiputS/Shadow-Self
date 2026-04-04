import React from "react";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft,
  Skull,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

export default function GuildPotDetails({ potData, onClearDebuff, onWithdraw }) {
  // Mock history of contributions/redemptions
  const history = [
    { id: 1, type: "fine", amount: -50, description: "Protocol Breach: Marcus T.", time: "2h ago", icon: <ShieldAlert className="text-red-500" /> },
    { id: 2, type: "contribution", amount: 100, description: "AM Milestone: Elena V.", time: "4h ago", icon: <ShieldCheck className="text-green-500" /> },
    { id: 3, type: "redemption", amount: -500, description: "Cleared 'SP Yield' Debuff", time: "1d ago", icon: <Zap className="text-yellow-500" /> },
    { id: 4, type: "fine", amount: -25, description: "Missed Reflection: Julian R.", time: "1d ago", icon: <Skull className="text-orange-500" /> },
    { id: 5, type: "contribution", amount: 200, description: "Weekly Chain Clear: Sarah C.", time: "2d ago", icon: <TrendingUp className="text-blue-500" /> },
  ];

  return (
    <div className="space-y-10">
       <div className="p-8 rounded-[2.5rem] nm-flat-lg border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center text-yellow-500">
                   <Coins className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-black uppercase tracking-widest leading-none">Institutional Reserve</h3>
                   <p className="text-[10px] font-black uppercase opacity-30 tracking-widest mt-1 italic">Collective SP Liquidity</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-2xl font-black">{potData?.sp_balance || 0} <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">SP</span></p>
                <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] font-black uppercase tracking-widest text-green-500">
                   <TrendingUp className="w-3 h-3" /> +12% Growth
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
              <button 
                onClick={onClearDebuff}
                className="flex-1 p-5 rounded-3xl nm-button text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4" /> Clear Debuff
              </button>
              <button 
                onClick={onWithdraw}
                className="flex-1 p-5 rounded-3xl nm-button text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <ArrowDownLeft className="w-4 h-4" /> Withdraw (N/A)
              </button>
          </div>
       </div>

       <div className="p-8 rounded-[2.5rem] nm-flat border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-blue-400">
                   <History className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest">Ledger History</h3>
             </div>
             <div className="px-5 py-2 rounded-xl nm-inset-sm text-[9px] font-black uppercase tracking-widest opacity-30">Last 25 Entries</div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
             {history.map((entry) => (
               <div key={entry.id} className="p-5 rounded-3xl nm-inset-sm border border-white/5 flex items-center justify-between group hover:nm-flat transition-all">
                  <div className="flex items-center gap-5">
                     <div className="w-10 h-10 rounded-xl nm-flat flex items-center justify-center">
                        {entry.icon}
                     </div>
                     <div>
                        <h4 className="text-xs font-black uppercase tracking-wider">{entry.description}</h4>
                        <p className="text-[10px] font-black opacity-30 uppercase racking-widest mt-0.5">{entry.time}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className={`text-sm font-black font-mono tracking-widest ${
                       entry.amount > 0 ? 'text-green-500' : 'text-red-500'
                     }`}>
                       {entry.amount > 0 ? '+' : ''}{entry.amount} <span className="text-[9px] opacity-40">SP</span>
                     </span>
                  </div>
               </div>
             ))}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-(--bg-color) to-transparent pointer-events-none" />
       </div>
    </div>
  );
}
