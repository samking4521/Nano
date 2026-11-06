import * as Notifications from 'expo-notifications';
import { Alert, Linking } from 'react-native';

type PermissionResult =
  | { granted: true }
  | { granted: false; canAskAgain: boolean };

  
export async function requestNotificationPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } =
    await Notifications.getPermissionsAsync();

  if (status === 'granted') {
    return { granted: true };
  }

  if (!canAskAgain) {
    return { granted: false, canAskAgain: false };
  }

  const permission = await Notifications.requestPermissionsAsync();

  if (permission.status === 'granted') {
    return { granted: true };
  }

  return {
    granted: false,
    canAskAgain: permission.canAskAgain,
  };
}


export function showNotificationSettingsAlert() {
    Alert.alert(
        'Enable Notifications',
        'Notifications are disabled for Nano. Enable them in your device settings to receive important updates about your operations on Nano.',
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Open Settings',
                onPress: () => {
                    Linking.openSettings();
                },
            },
        ],
    );
}
