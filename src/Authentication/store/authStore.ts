import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { routeName } from "../../Navigation/RootNavigation";


type AuthStore = {
    session: Session | null;
    initialRouteName: routeName;
    setSession: (session: Session | null) => void;
    setInitialRouteName: (routeName: routeName) => void;
};

export const useAuthStore = create<AuthStore>((set) => (
    {
        session: null,
        initialRouteName: "Auth",
        setSession: (session) => set({ session: session }),
        setInitialRouteName: (routeName: routeName) => set({initialRouteName: routeName})
    }
));