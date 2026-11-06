import * as Notifications from 'expo-notifications';

type NotificationResponseHandler = (
    response: Notifications.NotificationResponse,
) => Promise<void>;

export function registerNotificationResponseListener(
    onResponse: NotificationResponseHandler,
) {
    let active = true;

    // Prevent the same response being processed concurrently
    // by the live listener and startup check.
    const processing = new Set<string>();

    const handleResponse = async (
        response: Notifications.NotificationResponse,
    ) => {
        const key = [
            response.notification.request.identifier,
            response.actionIdentifier,
        ].join(':');

        if (!active || processing.has(key)) return;

        processing.add(key);

        try {
            console.log("handled response: ", response)
            await onResponse(response);

            // Clear only after successful processing.
            await Notifications.clearLastNotificationResponseAsync();

            console.log(
                'After clear:',
                Notifications.getLastNotificationResponse()
            );

        } catch (error) {
            console.error('Notification response handling failed:', error);
        } finally {
            processing.delete(key);
        }
    };

    // Listen for notification interactions while Nano is running.
    const subscription =
        Notifications.addNotificationResponseReceivedListener(
            response => {
                console.log("addNotificationResponseReceivedListener: ", response)
                void handleResponse(response);
            },
        );

    // Recover an interaction that launched Nano.
    void Notifications.getLastNotificationResponseAsync()
        .then(response => {
            if (response) {
                console.log("getLastNotificationResponseAsync: ", response)
                return handleResponse(response);
            }
        })
        .catch(error => {
            console.error(
                'Failed to retrieve last notification response:',
                error,
            );
        });

    return () => {
        active = false;
        subscription.remove();
    };
}