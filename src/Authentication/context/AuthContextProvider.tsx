import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import SplashLoadingScreen from "../components/splashLoadingScreen";

type AuthContextType = {
  user: any;
  session: any;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      console.log("user session : ", data.session);
      console.log("the user : ", data.session?.user);

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      
      setLoading(false);
    };

    getSession();

    // 2. Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if(loading){
      return <SplashLoadingScreen/>
  }

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};