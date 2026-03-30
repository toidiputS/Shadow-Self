import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Store, Users, Settings } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.5rem+var(--safe-bottom))] pt-4 bg-(--bg-color)/80 backdrop-blur-xl border-t border-white/5 md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all duration-300
            ${isActive ? 'text-blue-500' : 'text-(--text-secondary) opacity-50'}
          `}
        >
          <div className={`p-2 rounded-xl ${window.location.pathname === '/dashboard' ? 'nm-inset-sm' : ''}`}>
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Core</span>
        </NavLink>

        <NavLink
          to="/shadowvault"
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all duration-300
            ${isActive ? 'text-blue-500' : 'text-(--text-secondary) opacity-50'}
          `}
        >
          <div className={`p-2 rounded-xl ${window.location.pathname === '/shadowvault' ? 'nm-inset-sm' : ''}`}>
            <Store className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Vault</span>
        </NavLink>

        <div className="flex flex-col items-center gap-1 text-(--text-secondary) opacity-50">
           <div className="p-2 rounded-xl">
             <Users className="w-6 h-6" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest">Guild</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-(--text-secondary) opacity-50">
           <div className="p-2 rounded-xl">
             <Settings className="w-6 h-6" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest">System</span>
        </div>
      </div>
    </nav>
  );
}
