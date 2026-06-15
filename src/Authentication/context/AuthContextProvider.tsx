import React, { useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import SplashLoadingScreen from "../components/splashLoadingScreen";
import {
  AuthUserContext,
  AuthSessionContext,
  AuthLoadingContext,
} from "../../Context/AuthContext";
import { Session, User } from "@supabase/supabase-js";


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

    const timer = setTimeout(()=>{
       getSession();
    }, 2000);

   

    // 2. Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  if(loading){
      return <SplashLoadingScreen/>
  }


  

  return (
    <AuthSessionContext.Provider value={session}>
      <AuthUserContext.Provider value={user}>
        <AuthLoadingContext.Provider value={loading}>
          {children}
        </AuthLoadingContext.Provider>
      </AuthUserContext.Provider>
    </AuthSessionContext.Provider>
  );
};

export const useAuthUser = () => useContext(AuthUserContext);

export const useAuthSession = () => useContext(AuthSessionContext);

export const useAuthLoading = () => useContext(AuthLoadingContext);