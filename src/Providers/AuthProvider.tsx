import React, { useEffect, useState } from "react";

import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import SplashLoadingScreen from "../Authentication/components/splashLoadingScreen";
import { useAuthStore } from "../Authentication/store/authStore";
import { getDriverVerificationDetails } from "../utils/getDriverVerificationDetails";
import { USER_ROLES } from "../constants/shared_user";
import { getShipperGlobalDetails } from "../utils/getShipperGlobalDetails";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const setSession = useAuthStore((store) => store.setSession);
  const setAuthReady = useAuthStore((store) => store.setAuthReady);
  const setInitialRouteName = useAuthStore((store) => store.setInitialRouteName);
  const setAppRole = useAuthStore((store) => store.setAppRole);

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
              await getShipperGlobalDetails(data.session);
              setInitialRouteName("Shipper");
              setAppRole(select_user_data.active_role);
            } else if (select_user_data?.active_role === USER_ROLES.DRIVER && select_user_data.has_driver_profile) {
              await getDriverVerificationDetails(data.session);
              console.log("Verification retrieved");
              setInitialRouteName("Driver");
              setAppRole(select_user_data.active_role);
            } else {
              setInitialRouteName("Onboard");
              setAppRole(undefined);
            }

          } else {
            setInitialRouteName("Onboard");
            setAppRole(undefined);
          }

        }

        setAuthReady(true);
        setLoading(false);

      } catch (error) {
        console.log("Error: ", error);

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
  }, []);

  if (loading) {
    return <SplashLoadingScreen />
  }

  return (
    <>
      {children}
    </>


  );
};
