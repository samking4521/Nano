import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef, RootNavigation } from './src/Navigation/RootNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/Providers/AuthProvider';
import { NetworkProvider } from './src/Providers/Network/NetworkProvider';
import { useEffect, useState } from 'react';
import { registerNotificationReceivedListener } from './src/notifications/notificationListener';
import { registerNotificationResponseListener } from './src/notifications/notificationResponseListener';
import { handleNotificationNavigation } from './src/notifications/notificationNavigationHandler';
import { useAuthStore } from './src/Authentication/store/authStore';


export default function App() {
  const authReady = useAuthStore((store) => store.authReady);
  const session = useAuthStore((store) => store.session);
  const [navigationReady, setNavigationReady] = useState(false);

  // Listen for incoming foreground notifications.
  useEffect(() => {
    return registerNotificationReceivedListener();
  }, []);

  // Listen for notification interactions only after
  // authentication and navigation are ready.
  useEffect(() => {
    if (!authReady || !session || !navigationReady) {
      return;
    }

    return registerNotificationResponseListener(
      async (response) => {
        await handleNotificationNavigation({
          response,
          navigationRef,
        });
      }
    );
  }, [authReady, session, navigationReady]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <NavigationContainer
              ref={navigationRef}
              onReady={() => setNavigationReady(true)}
            >
              <RootNavigation />
            </NavigationContainer>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
