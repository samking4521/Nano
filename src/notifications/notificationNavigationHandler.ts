import {
  NavigationContainerRef,
} from '@react-navigation/native';

import * as Notifications from 'expo-notifications';

import { USER_ROLES } from '../constants/shared_user';
import { RootNavigationStackParamList } from '../Navigation/RootNav';
import { useAuthStore } from '../Authentication/store/authStore';
import { DRIVER_NOTIFICATION_TYPE } from '../constants/driver';
import { getDriverNavigation, getShipperNavigation } from './notificationNavigationBridge';

type NotificationData = {
  notification_id?: string;
  notification_type?: string;
  app_role?: string;
  [key: string]: unknown;
};

type Props = {
  response: Notifications.NotificationResponse;
  navigationRef: NavigationContainerRef<RootNavigationStackParamList>;
};

export async function handleNotificationNavigation({
  response,
  navigationRef,
}: Props): Promise<void> {
  const appRole = useAuthStore.getState().appRole;

  const data = response.notification.request.content
    .data as NotificationData;


  console.log("data: ", data);

  const {
    notification_id,
    notification_type,
    app_role,
  } = data;

  // 1. Validate the common notification payload.
  if (!notification_id || !notification_type || !app_role) {
    console.warn('Invalid notification payload:', data);
    return;
  }

  // 2. Ensure the root navigator is ready.
  if (!navigationRef.isReady()) {
    throw new Error('Navigation is not ready.');
  }

  // 3. Determine the active app context and resolve its navigator.
  if (appRole === USER_ROLES.DRIVER) {
    const navigation = getDriverNavigation();

    if (!navigation) {
      console.warn('Driver navigation is not registered yet.');
      return;
    }

    // Notification belongs to another app role.
    if (app_role !== appRole) {
      navigation.navigate('HomeScreen');
      return;
    }

    // Driver-specific notification routing.
    switch (notification_type) {
      case DRIVER_NOTIFICATION_TYPE.VEHICLE_VERIFICATION_APPROVED:
      case DRIVER_NOTIFICATION_TYPE.VEHICLE_VERIFICATION_ISSUE:
      case DRIVER_NOTIFICATION_TYPE.VEHICLE_LICENSE_EXPIRY:
      case DRIVER_NOTIFICATION_TYPE.VEHICLE_LICENSE_RENEWAL_APPROVED:
      case DRIVER_NOTIFICATION_TYPE.VEHICLE_LICENSE_RENEWAL_ISSUE:
        navigation.navigate('Vehicle');
        break;

      case DRIVER_NOTIFICATION_TYPE.DRIVER_VERIFICATION_APPROVED:
        navigation.navigate('HomeScreen');
        break;

      case DRIVER_NOTIFICATION_TYPE.DRIVER_VERIFICATION_ISSUE:
        navigation.navigate('Profile');
        break;

      case DRIVER_NOTIFICATION_TYPE.DRIVER_LICENSE_EXPIRY:
      case DRIVER_NOTIFICATION_TYPE.DRIVER_LICENSE_RENEWAL_APPROVED:
      case DRIVER_NOTIFICATION_TYPE.DRIVER_LICENSE_RENEWAL_ISSUE:
        navigation.navigate('IdentityInfo');
        break;

      default:
        console.warn('Unsupported Driver notification:', notification_type);
    }

    return;
  }

  if (appRole === USER_ROLES.SHIPPER) {
    const navigation = getShipperNavigation();

    if (!navigation) {
      console.warn('Shipper navigation is not registered yet.');
      return;
    }

    // Notification belongs to another app role.
    if (app_role !== appRole) {
      navigation.navigate("HomeScreen");
      return;
    }

    // Shipper-specific notification routing.
    switch (notification_type) {
      // Add Shipper notification cases here.

      default:
        console.warn('Unsupported Shipper notification:', notification_type);
    }

    return;
  }

  console.warn('Unsupported active app role:', appRole);
}
