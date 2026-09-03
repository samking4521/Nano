import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import SplashLoadingScreen from "../components/splashLoadingScreen";
import { useAuthStore } from "../store/authStore";
import { USER_ROLES } from "../../constants/shared_user";
import { Alert } from "react-native";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const setSession = useAuthStore((store) => store.setSession);
  const setInitialRouteName = useAuthStore((store) => store.setInitialRouteName);

  useEffect(() => {

    // 1. Get initial session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(`Error getting user session: ${error.message}`)
        }

        if (!(data.session)) {
          setInitialRouteName("Auth");
        } else {

          const { data: select_user_data, error: select_user_data_err } = await supabase
            .from("User")
            .select("*")
            .eq("id", data.session?.user.id)
            .maybeSingle();

          if (select_user_data_err) {
            throw new Error(`Error querying if User exists: ${select_user_data_err.message}`)
          }

          if (select_user_data) {
            if (select_user_data?.active_role === USER_ROLES.SHIPPER && select_user_data.has_shipper_profile) {
              setInitialRouteName("Shipper");
            } else if (select_user_data?.active_role === USER_ROLES.DRIVER && select_user_data.has_driver_profile) {
              setInitialRouteName("Driver");
            } else {
              setInitialRouteName("Onboard");
            }
          } else {
            setInitialRouteName("Onboard")
          }

        }

        setLoading(false);

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Connection Problem",
          "Please check your internet connection and try again.",
          [
            { text: "Retry", onPress: () => getSession() },
            { text: "Cancel", style: "cancel" },
          ]
        );

      }

    };

    const timer = setTimeout(() => {
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

  if (loading) {
    return <SplashLoadingScreen />
  }

  return (
    <>
      {children}
    </>


  );
};
