import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabase";
import { 
  ShieldCheck, 
  Users, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronRight,
  Shield,
  Activity,
  Sparkles,
  AlertCircle,
  Home,
  Hash,
  Fingerprint,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";

const MotionDiv = motion.div;

export default function Auth({ mode = "login" }) {
  const { session, loading, role, profile } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  console.log("📍 Auth Status:", { mode, isLoading, hasError: !!error });

  useEffect(() => {
    // Check for skipAuto parameter to prevent auto-routing (useful for seeing the login page while logged in)
    const params = new URLSearchParams(window.location.search);
    const skipAuto = params.get('skipAuto') === 'true';

    // If we have a session and aren't loading, auto-route the user (unless skipAuto is true)
    if (session && !loading && !skipAuto) {
      const targetRole = role || profile?.role;
      if (targetRole) {
          const currentPath = window.location.pathname;
          console.log("⚡ Session detected. Current:", currentPath, "Target for role:", targetRole);
          
          if (targetRole === 'admin' && !currentPath.startsWith('/admin') && currentPath !== '/system') {
            navigate('/admin');
          } else if (targetRole === 'sponsor' && !currentPath.startsWith('/sponsor')) {
            navigate('/sponsor');
          } else if (targetRole === 'member' && !['/dashboard', '/guild', '/shadowvault'].includes(currentPath)) {
            navigate('/dashboard');
          }
      }
    }
  }, [session, loading, role, profile, navigate]);

  // Request Access Fields
  const [name, setName] = useState("");
  const [house, setHouse] = useState("");
  const [sponsorCode, setSponsorCode] = useState("");

  const handleLogin = async (e) => {
    console.log("🖱️ Login started. Mode:", mode);
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("📍 Login started. Mode:", mode);
      console.log("🔐 Checking account:", email.toLowerCase());
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase(), 
        password 
      });
      
      if (signInError) {
          console.error("❌ Login failed:", signInError.message);
          throw signInError;
      }
      
      console.log("🛠️ Logged in. Loading profile...");
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
          console.error("❌ Profile load failed:", profileError.message);
          throw profileError;
      }

      console.log("👤 Identity Verified. Role:", profile?.role);
      
      // Verification check for Admin mode
      if (mode === 'admin-login' && profile?.role !== 'admin') {
          console.warn("⚠️ Unauthorized: Manager access required.");
          await supabase.auth.signOut();
          throw new Error("Sorry, you need manager access for this.");
      }

      // Dynamic Institutional Routing
      const role = profile?.role || 'member';
      console.log("🚀 Redirecting to:", role);
      
      switch(role) {
          case 'admin':
              navigate("/admin");
              break;
          case 'sponsor':
              navigate("/sponsor");
              break;
          default:
              navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Logic for request-access: Sign up as 'pending'
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            role: 'member',
            status: 'pending',
            house_program: house,
            sponsor_code: sponsorCode
          }
        }
      });

      if (signUpError) throw signUpError;
      navigate("/request-access/status");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-(--bg-color) text-(--text-primary) flex flex-col items-center pt-12 md:pt-24 pb-32 px-6 transition-all duration-700 overflow-y-auto overflow-x-hidden hide-scrollbar">
      {/* Background Ambience */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse ${mode === 'admin-login' ? 'bg-purple-500/5' : 'bg-blue-500/5'}`}></div>
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] -ml-20 -mb-20 opacity-30 ${mode === 'admin-login' ? 'bg-red-500/5' : 'bg-orange-500/5'}`}></div>

      <MotionDiv 
        key={mode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md z-10"
      >
        {/* Brand Core */}
        <div className="flex flex-col items-center mb-10">
            <div className={`w-16 h-16 rounded-4xl nm-flat flex items-center justify-center mb-6 relative group transition-all duration-500`}>
                <div className={`w-12 h-12 rounded-2xl nm-inset-sm flex items-center justify-center overflow-hidden ${mode === 'admin-login' ? 'text-purple-500' : 'text-blue-500'}`}>
                    {mode === 'admin-login' ? <ShieldCheck className="w-6 h-6" /> : <Activity className="w-6 h-6 animate-pulse" />}
                </div>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-[0.4rem] leading-none mb-3 italic">Shadow Self</h1>
            <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">
                  {mode === 'admin-login' ? "Manager Login" : "Secure Login"}
                </p>
            </div>
        </div>

        {/* Institutional / Executive Switch (Only shown on Standard Login) */}
        {mode === 'login' && (
            <Link 
              to="/admin/login"
              className="mb-8 w-full p-6 rounded-4xl nm-button border border-purple-500/10 flex items-center justify-between group hover:nm-flat transition-all"
            >
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-purple-500">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Manager Portal</p>
                     <p className="text-[8px] opacity-40 font-bold uppercase tracking-tighter">For House Managers & Staff</p>
                  </div>
               </div>
               <ArrowRight className="w-4 h-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-purple-500" />
            </Link>
        )}

        {/* Auth Interface Hub */}
        <div id="auth-container" className={`p-10 rounded-[3rem] nm-flat relative overflow-hidden group border border-white/5`}>
            {error && (
                <MotionDiv 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6 p-4 rounded-xl nm-inset-sm bg-red-500/5 border border-red-500/10 flex items-center gap-3 text-red-500"
                >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-[9px] font-bold uppercase tracking-tight leading-relaxed">{error}</p>
                </MotionDiv>
            )}

            {mode === 'pending-status' ? (
                <div className="py-8 text-center">
                    <div className="w-20 h-20 rounded-full nm-inset-sm mx-auto mb-8 flex items-center justify-center text-orange-500">
                        <Timer className="w-10 h-10 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-widest mb-4">Request Pending</h2>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-8 leading-relaxed max-w-xs mx-auto">
                        Your details have been submitted for review. 
                        A house manager will verify your account shortly.
                    </p>
                    <Link to="/login" className="px-8 py-4 rounded-xl nm-button text-[9px] font-black uppercase tracking-widest text-blue-500">
                        Return to Entry
                    </Link>
                </div>
            ) : (
                <form onSubmit={mode === 'request-access' ? handleRequestAccess : handleLogin}>
                    <div className="mb-8 border-b border-white/5 pb-6">
                        <h2 className="text-xl font-black uppercase tracking-widest leading-none mb-3">
                            {mode === 'request-access' ? "Join a House" : mode === 'admin-login' ? "Manager Login" : "Sign In"}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 leading-relaxed italic">
                            {mode === 'request-access' 
                              ? "Joining a house? Link your profile using the code from your manager." 
                              : "Sign in to continue your progress."}
                        </p>
                    </div>

                    <div className="space-y-5">
                        {mode === 'request-access' && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Your Name</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/30 group-focus-within:text-blue-500 transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input 
                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className="w-full bg-transparent p-5 pl-14 rounded-3xl nm-inset-sm border border-transparent focus:border-blue-500/20 focus:outline-hidden transition-all text-[11px] font-bold uppercase tracking-widest"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/30 group-focus-within:text-blue-500 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input 
                                    id="auth-input-email"
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-transparent p-5 pl-14 rounded-3xl nm-inset-sm border border-transparent focus:border-blue-500/20 focus:outline-hidden transition-all text-[11px] font-bold uppercase tracking-widest"
                                />
                            </div>
                        </div>

                        {mode === 'request-access' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">House Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/30 group-focus-within:text-blue-500 transition-colors">
                                            <Home className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type="text" required value={house} onChange={(e) => setHouse(e.target.value)}
                                            placeholder="House Name"
                                            className="w-full bg-transparent p-5 pl-14 rounded-3xl nm-inset-sm border border-transparent focus:border-blue-500/20 focus:outline-hidden transition-all text-[11px] font-bold uppercase tracking-widest"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Signup Code</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/30 group-focus-within:text-blue-500 transition-colors">
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type="text" required value={sponsorCode} onChange={(e) => setSponsorCode(e.target.value)}
                                            placeholder="Code"
                                            className="w-full bg-transparent p-5 pl-14 rounded-3xl nm-inset-sm border border-transparent focus:border-blue-500/20 focus:outline-hidden transition-all text-[11px] font-bold uppercase tracking-widest"
                                        />
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-20 ml-4 italic">Provided by your Sponsor or Program Coordinator</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Create Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/30 group-focus-within:text-blue-500 transition-colors">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-transparent p-5 pl-14 rounded-3xl nm-inset-sm border border-transparent focus:border-blue-500/20 focus:outline-hidden transition-all text-[11px] tracking-widest"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/30 group-focus-within:text-blue-500 transition-colors">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-transparent p-5 pl-14 rounded-3xl nm-inset-sm border border-transparent focus:border-blue-500/20 focus:outline-hidden transition-all text-[11px] tracking-widest"
                                        />
                                    </div>
                                </div>

                                {mode === 'admin-login' && (
                                    <div className="space-y-2 pt-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4 text-purple-500">Verification Code</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-500/40 group-focus-within:text-purple-500 transition-colors">
                                                <Fingerprint className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)}
                                                placeholder="000000"
                                                className="w-full bg-transparent p-5 pl-14 rounded-3xl nm-inset-sm border border-purple-500/20 focus:border-purple-500/40 focus:outline-hidden transition-all text-[11px] font-black tracking-[1em] text-center text-purple-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        onClick={() => console.log("🔥 Direct Click Event Fired on Submission Node")}
                        className={`w-full mt-10 py-5 rounded-3xl nm-button flex items-center justify-center gap-4 group transition-all relative overflow-hidden ${mode === 'admin-login' ? 'text-purple-500' : 'text-blue-500'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3rem] italic pl-2">
                            {isLoading ? "Checking..." : mode === 'request-access' ? "Submit Request" : "Login"}
                        </span>
                        {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
                    </button>

                    <div className="mt-8 flex flex-col items-center gap-3">
                        {mode === 'login' && (
                            <Link to="/request-access" className="text-[8px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all flex items-center gap-2">
                                Request Access <ChevronRight className="w-3 h-3" />
                            </Link>
                        )}
                        {mode === 'request-access' && (
                            <Link to="/login" className="text-[8px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all flex items-center gap-2">
                                Already have an account? <ChevronRight className="w-3 h-3" />
                            </Link>
                        )}
                        {mode === 'admin-login' && (
                            <Link to="/login" className="text-[8px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all flex items-center gap-2">
                                Back to Resident Login <ChevronRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                </form>
            )}
        </div>

        {mode === 'admin-login' && (
            <div className="mt-6 flex flex-col items-center gap-4">
                <button 
                    onClick={() => {
                        console.log("🚨 Emergency Admin Bypass Triggered");
                        navigate("/admin");
                    }}
                    className="text-[8px] font-black uppercase tracking-[0.3em] opacity-10 hover:opacity-100 transition-all italic border-b border-white/5 pb-1"
                >
                    Emergency Bypass
                </button>
            </div>
        )}

        {mode !== 'admin-login' && mode !== 'login' && (
            <div className="mt-10 flex justify-center">
                <Link to="/admin/login" className="text-[8px] font-black uppercase tracking-widest opacity-15 hover:opacity-100 transition-all flex items-center gap-2 italic">
                    Manager Login <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        )}

        <p className="mt-8 text-center text-[8px] font-black uppercase tracking-[0.2em] opacity-10">
            Securely Encrypted
        </p>
      </MotionDiv>
    </div>
  );
}
