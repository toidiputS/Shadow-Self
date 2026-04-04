import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert, Activity, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { session, loading, role, profile, isInitialized } = useAuth();
  const location = useLocation();

  // 1. Critical Wait: Do not evaluate permissions until system is initialized
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-(--bg-color) flex items-center justify-center">
        <MotionDiv 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-3xl nm-inset-sm flex items-center justify-center text-blue-500"
        >
          <Activity className="w-8 h-8" />
        </MotionDiv>
      </div>
    );
  }

  // 2. Authentication Gate
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If pending approval, redirect to status page
  if (profile?.status === 'pending') {
    return <Navigate to="/request-access/status" replace />;
  }

  // Role gatecheck: If no roles allowed or user's role is not in the matrix
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-(--bg-color) flex items-center justify-center p-6">
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-10 rounded-[3rem] nm-flat text-center"
        >
          <div className="w-20 h-20 rounded-4xl nm-inset-sm mx-auto mb-8 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Access Restricted</h2>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-8 leading-relaxed">
            Identity credentials unauthorized for this tactical sector. System oversight required.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="w-full py-4 rounded-2xl nm-button text-[10px] font-black uppercase tracking-widest text-blue-500"
          >
            Return to Authorized Sector
          </button>
        </MotionDiv>
      </div>
    );
  }

  return children;
}
