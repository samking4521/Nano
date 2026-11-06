import { StyleSheet, View, Alert, Linking, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import UserDisplay from '../../Account/components/UserDisplay'
import { Ionicons } from '@expo/vector-icons'
import { useDriverStore } from '../../../store/DriverStore'
import GoOnlineErrorView from '../components/GoOnlineErrorView'
import GoOnline from '../components/GoOnline'
import NoOrders from '../components/NoOrders'
import { requestNotificationPermission, showNotificationSettingsAlert } from '../../../../utils/notificationPermission'
import { registerDeviceToken } from '../../../../notifications/registerDeviceToken'
import { USER_ROLES } from '../../../../constants/shared_user'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp } from '../../../../Navigation/DriverNavigation'



export type goOnlineErrorType = "network" | "offline" | "status";

export default function Home() {
  const driverVerificationStatus = useDriverStore((store) => store.driverVerificationStatus);
  const hasUnreadNotifications = useDriverStore((store)=> store.hasUnreadNotifications);
  const [showGoOnlineError, setShowGoOnlineError] = useState<goOnlineErrorType | null>(null);
  const navigation = useNavigation<DriverNavigationProp>();


  const showToggleOnlineStatusError = (value: goOnlineErrorType | null) => {
    setShowGoOnlineError(value);
  }

  const getNotificationPermission = async () => {
    const permission = await requestNotificationPermission();

    if (!permission.granted) {
      if (!permission.canAskAgain) {
         showNotificationSettingsAlert();
      }
      return;
    }
     await registerDeviceToken(USER_ROLES.DRIVER);

  }

  useEffect(() => {
    getNotificationPermission()
  }, [])

  const goToDriverNotifications = ()=>{
      navigation.navigate("DriverNotifications");
  }

  

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.headerSectionCont}>
          <UserDisplay />
          <GoOnline showToggleOnlineStatusError={showToggleOnlineStatusError} />
          <Pressable onPress={goToDriverNotifications}>
            <Ionicons
              name="notifications-outline"
              size={28}
              color={Colors.text.gray}
            />

            {hasUnreadNotifications && <View style={styles.notificationBadgeCont}/>}
            
          </Pressable>
        </View>

        <View style={styles.bodyCont}>
          <NoOrders />
        </View>

      </View>

      {showGoOnlineError && <GoOnlineErrorView
        showGoOnlineError={showGoOnlineError}
        driverVerificationStatus={driverVerificationStatus}
        setShowGoOnlineError={setShowGoOnlineError}
      />
      }

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: 15
  },
  bodyCont: {
    flex: 1
  },
  headerSectionCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  notificationBadgeCont: {
    width: 12,
    height: 12,
    backgroundColor: Colors.error,
    borderRadius: 12,
    position: "absolute",
    top: 0,
    right: 0
  }
})