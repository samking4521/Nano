import React, { useEffect } from "react";
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStore } from "./NetworkStore";

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const setIsOnline = useNetworkStore((store) => store.setIsOnline);
  const setIsConnected = useNetworkStore((store) => store.setIsConnected);
  const setIsInternetReachable = useNetworkStore((store) => store.setIsInternetReachable);



  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected", state.isConnected);
      console.log("is reachable: ", state.isInternetReachable)
      const isOnline =
        state.isConnected === true &&
        state.isInternetReachable === true;
      console.log("isOnline: ", isOnline);
      setIsOnline(isOnline);
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);

    });
    return () => {
      unsubscribe()
    };
  }, []);


  return (
    <>
      {children}
    </>


  );
};
