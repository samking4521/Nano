import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { routeName } from "../../Navigation/RootNavigation";
import { USER_ROLES } from "../../constants/shared_user";


type AuthStore = {
    session: Session | null;
    initialRouteName: routeName;
    authReady: boolean;
    setSession: (session: Session | null) => void;
    setInitialRouteName: (routeName: routeName) => void;
    setAuthReady: (ready: boolean) => void;
    appRole: USER_ROLES | undefined,
    setAppRole: (role: USER_ROLES | undefined) => void;
};

export const useAuthStore = create<AuthStore>((set) => (
    {
        session: null,
        initialRouteName: "Auth",
        authReady: false,
        setSession: (session) => set({ session: session }),
        setInitialRouteName: (routeName: routeName) => set({ initialRouteName: routeName }),
        setAuthReady: (ready) => set({ authReady: ready }),
        appRole: undefined,
        setAppRole: (role: USER_ROLES | undefined) => set({appRole: role})
    }
));