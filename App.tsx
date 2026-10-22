import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigation } from './src/Navigation/RootNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/Providers/AuthProvider';
import { NetworkProvider } from './src/Providers/Network/NetworkProvider';


export default function App() {

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <NavigationContainer>
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
