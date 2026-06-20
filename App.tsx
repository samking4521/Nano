import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthContextProvider } from './src/Authentication/context/AuthContextProvider';
import { AuthUserNavigation } from './src/Navigation/AuthUserNavigation';
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
     <GestureHandlerRootView style={styles.container}>
    <AuthContextProvider>
      <NavigationContainer>
        <AuthUserNavigation />
      </NavigationContainer>
    </AuthContextProvider>
    </GestureHandlerRootView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
