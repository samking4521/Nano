import { StyleSheet } from 'react-native';
import SignUp from './src/Authentication/screens/signUp';
import { AuthContextProvider } from './src/Authentication/context/AuthContextProvider';
import { AuthUserNavigation } from './src/Navigation/AuthUserNavigation';
import { NavigationContainer } from "@react-navigation/native";
export default function App() {
  return (
    <AuthContextProvider>
      <NavigationContainer>
        <AuthUserNavigation />
      </NavigationContainer>

    </AuthContextProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
