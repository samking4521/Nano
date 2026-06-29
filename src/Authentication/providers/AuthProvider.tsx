import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import SplashLoadingScreen from "../components/splashLoadingScreen";
import { useAuthStore } from "../../store/authStore";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const setSession = useAuthStore((store) => store.setSession);

  useEffect(() => {
    
    // 1. Get initial session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      
    
      console.log("the user : ", data.session?.user);

      setSession(data.session ?? null);
      setLoading(false);
    };

    const timer = setTimeout(()=>{
       getSession();
    }, 2000);

   

    // 2. Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, [setSession]);

  if(loading){
      return <SplashLoadingScreen/>
  }

  return (
    <>
            {children}
    </>
         
       
  );
};
