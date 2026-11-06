import { StyleSheet, View } from 'react-native'
import OrderHome from '../components/OrderHome'
import { requestNotificationPermission, showNotificationSettingsAlert } from '../../../../utils/notificationPermission'
import { registerDeviceToken } from '../../../../notifications/registerDeviceToken';
import { USER_ROLES } from '../../../../constants/shared_user';
import { useEffect } from 'react';


export default function Home() {

  const getNotificationPermission = async () => {
      const permission = await requestNotificationPermission();
  
      if (!permission.granted) {
        if (!permission.canAskAgain) {
           showNotificationSettingsAlert();
        }
        return;
      }
       await registerDeviceToken(USER_ROLES.SHIPPER);
    }

  useEffect(() => {
      getNotificationPermission()
    }, [])
  
  return (
    <View style={styles.container}>
      <OrderHome />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})