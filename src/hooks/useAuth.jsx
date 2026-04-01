import { useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from '@/api/supabase';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Profile fetch exception:", err);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Combined initialization logic
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchProfile(initialSession.user.id);
      } else {
        setLoading(false);
        setIsInitialized(true);
      }

      // Start listener ONLY after initial check
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;
        
        console.log(`🔐 Auth Event: ${event}`);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Only trigger loading if we don't have a profile yet
          if (!profile) setLoading(true); 
          await fetchProfile(currentSession.user.id);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    const cleanupPromise = initializeAuth();

    return () => {
      mounted = false;
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [profile]);

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const logout = () => supabase.auth.signOut();

  // Memoize value to prevent unnecessary re-renders of the entire app tree
  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading: loading && !isInitialized, // Only truly loading on first mount/init
    isInitialized,
    login,
    logout,
    role: profile?.role
  }), [user, profile, session, loading, isInitialized]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
