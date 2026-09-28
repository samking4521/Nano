import { create } from "zustand";

export type NetworkStore = {
    isConnected: boolean | null
    isInternetReachable: boolean | null
    isOnline: boolean
    setIsOnline: (value: boolean) => void
    setIsConnected: (value: boolean | null) => void
    setIsInternetReachable: (value: boolean | null) => void

};

export const useNetworkStore = create<NetworkStore>((set) => (
    {
        isConnected: null,
        isInternetReachable: null,
        isOnline: false,
        setIsOnline: (value: boolean) => set({isOnline: value}),
        setIsConnected: (value: boolean | null) => set({ isConnected: value }),
        setIsInternetReachable: (value: boolean | null) => set({ isInternetReachable: value }),
    }
));