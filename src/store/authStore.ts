import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthStore = {
    session: Session | null;
    setSession: (session: Session | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => (
    {
        session: null,

        setSession: (session) => set({ session: session }),
    }
));