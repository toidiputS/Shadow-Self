import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Store, Users, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = document.getElementById('root')?.scrollTop || 0;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    const rootElement = document.getElementById('root');
    rootElement?.addEventListener('scroll', handleScroll);
    return () => rootElement?.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const MotionNav = motion.nav;

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionNav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.5rem+var(--safe-bottom))] pt-4 bg-(--bg-color)/80 backdrop-blur-xl border-t border-white/5 md:hidden"
        >
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

            <NavLink
              to="/guild"
              className={({ isActive }) => `
                flex flex-col items-center gap-1 transition-all duration-300
                ${isActive ? 'text-blue-500' : 'text-(--text-secondary) opacity-50'}
              `}
            >
              <div className={`p-2 rounded-xl ${window.location.pathname === '/guild' ? 'nm-inset-sm' : ''}`}>
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Guild</span>
            </NavLink>

            <NavLink
              to="/system"
              className={({ isActive }) => `
                flex flex-col items-center gap-1 transition-all duration-300
                ${isActive ? 'text-blue-500' : 'text-(--text-secondary) opacity-50'}
              `}
            >
              <div className={`p-2 rounded-xl ${window.location.pathname === '/system' ? 'nm-inset-sm' : ''}`}>
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">System</span>
            </NavLink>
          </div>
        </MotionNav>
      )}
    </AnimatePresence>
  );
}

