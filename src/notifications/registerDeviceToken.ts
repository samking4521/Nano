import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { USER_ROLES } from '../constants/shared_user';
import { requestNotificationPermission } from '../utils/notificationPermission';
import { supabase } from '../lib/supabase';



export async function registerDeviceToken(
    appRole: USER_ROLES,
): Promise<boolean> {
    try {
        const permission = await requestNotificationPermission();

        if (!permission.granted) {
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
            });
        }

        const projectId = '8f27acf1-4733-4d2d-a93f-97388681900f';

        const { data: expoPushToken } =
            await Notifications.getExpoPushTokenAsync({ projectId });

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error('User is not authenticated.');
        }

        const { error } = await supabase
            .from('Device_Tokens')
            .upsert(
                {
                    user_id: user.id,
                    expo_push_token: expoPushToken,
                    app_role: appRole,
                    platform: Platform.OS,
                    is_active: true,
                    last_seen_at: new Date().toISOString(),
                },
                { onConflict: 'expo_push_token' },
            );

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Push token registration failed:', error);
        return false;
    }
}