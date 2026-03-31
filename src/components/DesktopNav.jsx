import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Store, Settings } from "lucide-react";

export default function DesktopNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "The Guild", path: "/guild", icon: Users },
    { name: "Vault", path: "/shadowvault", icon: Store },
    { name: "System", path: "/system", icon: Settings },
  ];

  return (
    <div className="hidden md:flex justify-center fixed bottom-12 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-center gap-3 p-3 rounded-[2.5rem] nm-flat border border-white/5 backdrop-blur-xl bg-(--bg-color)/60 pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = path === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                px-8 py-4 rounded-3xl flex items-center gap-4 transition-all duration-500 group
                ${isActive 
                  ? 'nm-inset text-blue-500 shadow-[inset_0_2px_10px_rgba(59,130,246,0.1)]' 
                  : 'nm-button text-(--text-secondary) opacity-60 hover:opacity-100 hover:text-blue-400'
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.25rem] leading-none pt-0.5">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
