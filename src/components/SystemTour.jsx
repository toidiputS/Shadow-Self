import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Play, 
  Pause, 
  SkipForward, 
  X, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  Zap,
  ShieldCheck,
  Activity,
  Archive,
  Lock,
  Cpu,
  Target,
  Palette,
  Users,
  LayoutDashboard,
  Heart,
  Bell,
  FileText,
  Settings,
  Coins
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const steps = [
  // ──── LOGIN ────
  // We only show login steps if the user is NOT logged in.
  // Otherwise we skip straight to Dashboard.
  {
    id: 'login-gateway',
    title: 'Welcome to Shadow Self',
    description: 'This is where you sign in each day. Your login is tied to your house — so everything stays private and secure.',
    route: '/login',
    icon: ShieldCheck,
    narrative: "Let's walk through everything together.",
    targetId: 'auth-container',
    requiresAuth: false
  },
  {
    id: 'login-credentials',
    title: 'Your Login',
    description: 'Type in your email and password. Your house manager set these up for you when you moved in.',
    route: '/login',
    icon: Target,
    narrative: "Simple and secure.",
    targetId: 'auth-input-email',
    requiresAuth: false
  },
  // ──── DASHBOARD ────
  {
    id: 'dashboard-checkin',
    title: 'Daily Check-In',
    description: 'This is your first thing each morning. It asks how you\'re feeling — mood, cravings, sleep, energy. Takes 30 seconds. It helps the house know when someone might need extra support.',
    route: '/dashboard',
    icon: Heart,
    narrative: "Just be honest. That's all it takes.",
    targetId: 'dashboard-checkin-btn',
    requiresAuth: true
  },
  {
    id: 'dashboard-notifications',
    title: 'Your Messages',
    description: 'The bell shows you any new messages — reminders about your tasks, encouragement from housemates, or check-ins from your sponsor. The red dot means you have unread ones.',
    route: '/dashboard',
    icon: Bell,
    narrative: "Stay connected with your house.",
    targetId: 'dashboard-notifications-btn',
    requiresAuth: true
  },
  {
    id: 'dashboard-theme',
    title: 'Change the Colors',
    description: 'Want a different look? Tap this to switch between dark mode, light mode, or pick your own color scheme. Make it yours.',
    route: '/dashboard',
    icon: Palette,
    narrative: "Your space, your vibe.",
    targetId: 'dashboard-theme-btn',
    requiresAuth: true
  },
  {
    id: 'dashboard-tasks',
    title: 'Today\'s Tasks',
    description: 'These are your daily habits — things like morning meetings, journaling, exercise, or check-ins. Complete them to build your streak. Missed ones show up at the top so you can catch up.',
    route: '/dashboard',
    icon: Activity,
    narrative: "One day at a time. One task at a time.",
    targetId: 'dashboard-today-queue',
    requiresAuth: true
  },
  {
    id: 'dashboard-progress',
    title: 'Your Progress',
    description: 'This shows your streak and a calendar view of how you\'ve been doing. Green means you showed up. It\'s not about being perfect — it\'s about staying consistent.',
    route: '/dashboard',
    icon: LayoutDashboard,
    narrative: "Every green square is a win.",
    targetId: 'dashboard-streak-stats',
    requiresAuth: true
  },
  // ──── GUILD ────
  {
    id: 'guild-feed',
    title: 'House Feed',
    description: 'See what your housemates are up to. When someone completes a task or hits a milestone, it shows up here. Recovery is easier when you can see you\'re not doing it alone.',
    route: '/guild',
    icon: Users,
    narrative: "Your house has your back.",
    targetId: 'guild-house-feed',
    requiresAuth: true
  },
  {
    id: 'guild-rally',
    title: 'Rally Support',
    description: 'If someone in your house is struggling, this button sends a care rally — a group encouragement that lets them know people are pulling for them. No judgment, just solidarity.',
    route: '/guild',
    icon: Zap,
    narrative: "We rise together.",
    targetId: 'guild-signal-button',
    requiresAuth: true
  },
  {
    id: 'guild-pot',
    title: 'House Fund',
    description: 'The House Fund (Trust) is where everyone contributes. It can be used to resolve "support alerts" for housemates who are falling behind. It\'s a collective safety net.',
    route: '/guild',
    icon: Coins,
    narrative: "Trust is our currency.",
    targetId: 'pot-fund-card',
    requiresAuth: true
  },
  // ──── ADMIN ────
  {
    id: 'admin-roster',
    title: 'Resident List',
    description: 'Staff can see everyone in the house here. Green means someone is doing well. Orange means they might need a check-in. Click anyone to see their full picture.',
    route: '/admin',
    icon: Lock,
    narrative: "For house staff and managers.",
    targetId: 'admin-roster-grid',
    requiresAuth: true,
    requiresRole: 'admin'
  },
  {
    id: 'admin-tabs',
    title: 'House Management',
    description: 'Staff can manage house setup, daily task templates, and system settings from these tabs. Some features unlock after 30 days so your team can learn the basics first.',
    route: '/admin',
    icon: FileText,
    narrative: "Set it up once, it runs itself.",
    targetId: 'admin-tabs',
    requiresAuth: true,
    requiresRole: 'admin'
  },
  // ──── SYSTEM ────
  {
    id: 'system-config',
    title: 'Settings',
    description: 'This is where admins control the behind-the-scenes stuff — your profile info, house branding, and system preferences.',
    route: '/system',
    icon: Settings,
    narrative: "The control room.",
    targetId: 'admin-setup-wizard',
    requiresAuth: true,
    requiresRole: 'admin'
  },
  {
    id: 'system-plans',
    title: 'House Plans',
    description: 'Manage your house subscription and resident capacity here. You can upgrade to add more rooms or unlock advanced features like private servers.',
    route: '/system',
    icon: Lock,
    narrative: "Scale your house.",
    targetId: 'plan-upgrade-grid',
    requiresAuth: true,
    requiresRole: 'admin'
  },
  {
    id: 'system-kernel',
    title: 'Colors & Theme',
    description: 'Click here to change how the whole app looks. Pick your house colors, switch between dark and light mode, or dial in specific colors with the sliders.',
    route: '/system',
    icon: Cpu,
    narrative: "Make it feel like home.",
    targetId: 'system-theme-panel',
    requiresAuth: true,
    requiresRole: 'admin'
  },
  // ──── FINISH ────
  {
    id: 'finish',
    title: 'You\'re All Set',
    description: 'That\'s the whole app. Check in every morning, do your daily tasks, and lean on your house when it gets hard. Shadow Self is here to make recovery a little easier, one day at a time.',
    route: '/dashboard',
    icon: ShieldCheck,
    narrative: "You got this.",
    requiresAuth: true
  }
];

const MotionDiv = motion.div;

export default function SystemTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('demo') === 'true' ? 0 : -1;
  });
  const [isPlaying, setIsPlaying] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('demo') === 'true';
  });
  const [spotlight, setSpotlight] = useState(null);

  const { session, loading, role, profile } = useAuth();

  const availableSteps = React.useMemo(() => {
    return steps.filter(step => {
      const userRole = role || profile?.role;
      const hasSession = !!session;
      if (step.requiresAuth && !hasSession) return false;
      if (step.requiresAuth === false && hasSession) return false;
      if (step.requiresRole && userRole !== step.requiresRole) return false;
      return true;
    });
  }, [session, role, profile]);

  const handleNext = useCallback(() => {
    setActiveStep(current => {
      const currentId = steps[current]?.id;
      const currentIndex = availableSteps.findIndex(s => s.id === currentId);
      const nextRelativeIndex = currentIndex + 1;
      
      if (nextRelativeIndex < availableSteps.length) {
        const nextId = availableSteps[nextRelativeIndex].id;
        return steps.findIndex(s => s.id === nextId);
      }
      
      setIsPlaying(false);
      return current;
    });
  }, [availableSteps]);

  const handlePrev = useCallback(() => {
    setActiveStep(current => {
      const currentId = steps[current]?.id;
      const currentIndex = availableSteps.findIndex(s => s.id === currentId);
      const prevRelativeIndex = currentIndex - 1;
      
      if (prevRelativeIndex >= 0) {
        const prevId = availableSteps[prevRelativeIndex].id;
        return steps.findIndex(s => s.id === prevId);
      }
      
      return current;
    });
  }, [availableSteps]);

  const closeTour = useCallback(() => {
    setActiveStep(-1);
    setIsPlaying(false);
    setSpotlight(null);
  }, []);

  // Sync initial step based on auth status
  useEffect(() => {
    if (activeStep === 0 && session && !loading) {
      // If tour starts at 0 but we are logged in, jump to first auth step
      // Wrapped in timeout to avoid synchronous setState warning
      const timer = setTimeout(() => handleNext(), 0);
      return () => clearTimeout(timer);
    }
  }, [session, loading, activeStep, handleNext]);

  // Update spotlight coordinates based on targetId
  useEffect(() => {
    if (activeStep >= 0 && activeStep < steps.length) {
      const step = steps[activeStep];
      
      const updateSpotlight = () => {
        if (step.targetId) {
          const el = document.getElementById(step.targetId);
          if (el) {
            const rect = el.getBoundingClientRect();
            const padding = 16;
            setSpotlight({
              top: rect.top - padding,
              left: rect.left - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
            });
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
        setSpotlight(null);
      };

      // Faster spotlight trigger
      const timer = setTimeout(updateSpotlight, 300);
      
      const handleResize = () => setTimeout(updateSpotlight, 100);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    } else {
      // Use microtask or timeout to avoid synchronous setState warning
      const timer = setTimeout(() => setSpotlight(null), 0);
      return () => clearTimeout(timer);
    }
  }, [activeStep]);

  // Playback Timer - slightly faster for engagement
  useEffect(() => {
    let timer;
    if (isPlaying && activeStep >= 0 && activeStep < steps.length - 1) {
      timer = setTimeout(handleNext, 6000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStep, handleNext]);

  // Route Synchronization - prevents circular redirects
  useEffect(() => {
    if (activeStep >= 0 && activeStep < steps.length && !loading) {
      const step = steps[activeStep];
      
      // Only navigate if necessary and if we have the right auth state for the step
      const hasSession = !!session;
      const canNavigate = (step.requiresAuth && hasSession) || (!step.requiresAuth && !hasSession);

      if (canNavigate && location.pathname !== step.route) {
        console.log("Tour Navigating to:", step.route);
        navigate(step.route);
      }
    }
  }, [activeStep, navigate, location.pathname, session, loading]);

  const relativeStepIndex = availableSteps.findIndex(s => s.id === steps[activeStep]?.id);
  const displayStep = relativeStepIndex + 1;
  const totalSteps = availableSteps.length;

  if (activeStep === -1) {
    return (
      <button 
        onClick={() => {
          // Find the first available step index in the main steps array
          const firstStep = steps.findIndex(s => availableSteps[0]?.id === s.id);
          setActiveStep(firstStep >= 0 ? firstStep : 0);
        }}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 rounded-4xl nm-button flex items-center justify-center text-orange-500 z-1000 hover:scale-110 active:scale-95 transition-all group pointer-events-auto"
      >
        <div className="absolute inset-0 rounded-4xl animate-ping bg-orange-500/10" />
        <Info className="w-8 h-8 group-hover:hidden" />
        <Play className="w-8 h-8 hidden group-hover:block" />
      </button>
    );
  }

  const currentStep = steps[activeStep];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-10000 pointer-events-none overflow-hidden h-screen w-screen">
        {/* Spotlight Overlay */}
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: spotlight ? undefined : 'rgba(0,0,0,0.6)',
          }}
        >
          {spotlight && (
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect 
                    x={spotlight.left} 
                    y={spotlight.top} 
                    width={spotlight.width} 
                    height={spotlight.height} 
                    rx="24" 
                    ry="24" 
                    fill="black"
                  />
                </mask>
              </defs>
              <rect 
                x="0" y="0" width="100%" height="100%" 
                fill="rgba(0,0,0,0.65)" 
                mask="url(#spotlight-mask)" 
              />
              <rect 
                x={spotlight.left} 
                y={spotlight.top} 
                width={spotlight.width} 
                height={spotlight.height} 
                rx="24" 
                ry="24" 
                fill="none" 
                stroke="rgba(249,115,22,0.4)" 
                strokeWidth="2"
                className="animate-pulse"
              />
            </svg>
          )}
        </MotionDiv>

        {/* Top Bar */}
        <MotionDiv 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none"
        >
          <div className="nm-flat px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 italic">Guided Tour — {displayStep} of {totalSteps}</span>
          </div>
          
          <button 
            onClick={closeTour}
            className="nm-button w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-red-500 pointer-events-auto transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </MotionDiv>

        {/* Card */}
        <MotionDiv 
          key={activeStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute bottom-10 left-10 right-10 md:left-auto md:right-12 md:bottom-12 md:w-[450px] pointer-events-auto"
        >
          <div className="nm-flat rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
            <Icon className="absolute -bottom-4 -right-4 w-32 h-32 text-orange-500/5 rotate-12" />
            
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
              <MotionDiv 
                initial={{ width: 0 }}
                animate={{ width: `${(displayStep / totalSteps) * 100}%` }}
                className="h-full bg-orange-500 transition-all duration-700"
              />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl nm-inset flex items-center justify-center text-orange-500">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-orange-500/60 uppercase tracking-[0.2em] italic mb-1">
                    {displayStep} / {totalSteps}
                  </h4>
                  <h3 className="text-xl font-black uppercase tracking-tight leading-none">{currentStep.title}</h3>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-white/80 leading-relaxed italic border-l-2 border-orange-500/20 pl-4">
                  {currentStep.description}
                </p>
                
                <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-xl">
                  <Cpu className="w-3 h-3 text-orange-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-500/80">
                    "{currentStep.narrative}"
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrev}
                    disabled={activeStep === 0}
                    className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center disabled:opacity-10 transition-all active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={activeStep === steps.length -1}
                    className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center disabled:opacity-10 transition-all active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`h-12 px-5 rounded-2xl nm-button flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${isPlaying ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'opacity-40 hover:opacity-100'}`}
                  >
                    {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    {isPlaying ? 'AUTO' : 'MANUAL'}
                  </button>
                  <button 
                    onClick={activeStep === steps.length - 1 ? closeTour : handleNext}
                    className="h-12 px-6 rounded-2xl nm-button bg-orange-500 text-black flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                  >
                    {activeStep === steps.length - 1 ? 'Done' : 'Next'}
                    <SkipForward className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </AnimatePresence>
  );
}
