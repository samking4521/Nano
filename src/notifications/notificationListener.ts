import * as Notifications from 'expo-notifications';

export function registerNotificationReceivedListener() {
    const subscription =
        Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', {
                title: notification.request.content.title,
                body: notification.request.content.body,
                data: notification.request.content.data,
            });
        });

    return () => subscription.remove();
}