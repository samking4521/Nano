import React, { useEffect } from 'react';
import { useDriverStore } from '../../Driver/store/DriverStore';
import { supabase } from '../../lib/supabase';
import { USER_ROLES } from '../../constants/shared_user';

export default function DriverNotificationRealtimeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const setNotifications = useDriverStore(
        store => store.setNotifications
    );

    const setHasUnreadNotifications = useDriverStore(
        store => store.setHasUnreadNotifications
    );

    useEffect(() => {
        let active = true;

        const hasUnreadNotifications = async (userId: string) => {
            const { data, error } = await supabase
                .from('Notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('app_role', USER_ROLES.DRIVER)
                .is('read_at', null)
                .limit(1)
                .maybeSingle();

            if (!active) return;

            if (error) {
                console.log('Failed to check unread notifications:', error);
                setHasUnreadNotifications(false);
                return;
            }

            setHasUnreadNotifications(!!data);
        };

        let channel: ReturnType<typeof supabase.channel> | null = null;

        const initialize = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error || !session?.user.id || !active) return;

            const userId = session.user.id;

            // Initial unread notification check.
            await hasUnreadNotifications(userId);

            if (!active) return;

            // Listen only for newly inserted notifications.
            channel = supabase
                .channel(`driver-notifications-${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'Notifications',
                        filter: `user_id=eq.${userId}`,
                    },
                    async (payload) => {
                        if (payload.new.app_role !== USER_ROLES.DRIVER) return;

                        const { data, error } = await supabase
                            .from('Notifications')
                            .select('*')
                            .eq('id', payload.new.id)
                            .eq('user_id', userId)
                            .eq('app_role', USER_ROLES.DRIVER)
                            .single();

                        if (error) {
                            console.log('Failed to fetch new notification:', error);
                            return;
                        }

                        if (!active || !data) return;
                        console.log("insert called: ", data.length, data);
                        setNotifications(prev =>
                            [data, ...prev].sort(
                                (a, b) =>
                                    new Date(b.created_at).getTime() -
                                    new Date(a.created_at).getTime()
                            )
                        );

                        void hasUnreadNotifications(userId);
                    }
                )
                .subscribe();
        };

        void initialize();

        return () => {
            active = false;

            if (channel) {
                void supabase.removeChannel(channel);
            }
        };
    }, []);

    return <>{children}</>;
}