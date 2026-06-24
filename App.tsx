import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthContextProvider } from './src/Authentication/context/AuthContextProvider';
import { AuthUserNavigation } from './src/Navigation/AuthUserNavigation';
import { NavigationContainer } from "@react-navigation/native";
import { PaystackProvider } from 'react-native-paystack-webview';
const PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY!;


export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>

      <AuthContextProvider>
        <PaystackProvider publicKey={PAYSTACK_PUBLIC_KEY}>
          <NavigationContainer>
            <AuthUserNavigation />
          </NavigationContainer>
        </PaystackProvider>


      </AuthContextProvider>
    </GestureHandlerRootView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
