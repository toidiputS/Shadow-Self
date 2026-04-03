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
      
      console.log("Profile fetch result:", { data, error });
      
      if (error) {
        console.error("Profile Retrieval Breach:", error.message);
        setProfile(null);
      } else if (data) {
        setProfile(data);
        console.log("Profile loaded:", data.role, data.status);
      } else {
        console.warn("No profile found for user:", userId);
        setProfile(null);
      }
    } catch (err) {
      console.error("Crisis in Identity Fetching:", err);
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
        
        console.log("Initial session check:", !!initialSession);
        
        if (!mounted) return;

        if (initialSession) {
          console.log("Session found, fetching profile...");
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        } else {
          console.log("No session found");
          setLoading(false);
          setIsInitialized(true);
        }

        // Start listener ONLY after initial check
        const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (!mounted) return;
          
          console.log("Auth state change:", event);
          
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
        console.error("Auth Initialization Failure:", err);
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const logout = () => supabase.auth.signOut();

  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading: loading && !isInitialized,
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
