import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { PaystackProvider } from 'react-native-paystack-webview';
import { AuthProvider } from './src/Authentication/providers/AuthProvider';
import { RootNavigation } from './src/Navigation/RootNavigation';
const PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY!;


export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <PaystackProvider publicKey={PAYSTACK_PUBLIC_KEY}>
          <NavigationContainer>
              <RootNavigation/>
          </NavigationContainer>
        </PaystackProvider>


      </AuthProvider>
    </GestureHandlerRootView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
