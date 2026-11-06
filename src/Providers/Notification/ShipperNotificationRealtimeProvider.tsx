import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { USER_ROLES } from '../../constants/shared_user';
import { useShipperStore } from '../../Shipper/store/ShipperStore';

export default function ShipperNotificationRealtimeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const setNotifications = useShipperStore(
        store => store.setNotifications
    );

    const setHasUnreadNotifications = useShipperStore(
        store => store.setHasUnreadNotifications
    );

    useEffect(() => {
        let active = true;

        const hasUnreadNotifications = async (userId: string) => {
            const { data, error } = await supabase
                .from('Notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('app_role', USER_ROLES.SHIPPER)
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
                .channel(`shipper-notifications-${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'Notifications',
                        filter: `user_id=eq.${userId}`,
                    },
                    async (payload) => {
                        if (payload.new.app_role !== USER_ROLES.SHIPPER) return;

                        const { data, error } = await supabase
                            .from('Notifications')
                            .select('*')
                            .eq('id', payload.new.id)
                            .eq('user_id', userId)
                            .eq('app_role', USER_ROLES.SHIPPER)
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