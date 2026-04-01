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
        .maybeSingle();
      
      if (error) {
        console.error("❌ Profile Retrieval Breach:", error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("❌ Crisis in Identity Fetching:", err);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    const initializeAuth = async () => {
      try {
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
        const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (!mounted) return;
          
          console.log(`🔐 System Auth Event: ${event}`);
          
          if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
            setIsInitialized(true);
          } else if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchProfile(currentSession.user.id);
          }
        });
        
        subscription = data.subscription;
      } catch (err) {
        console.error("❌ Auth Initialization Failure:", err);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []); // Run ONLY once on mount

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
