import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "../Welcome";
import { RootUserStackParamList } from "./auth";
 
const Stack = createNativeStackNavigator<RootUserStackParamList>();

export function AuthUserNavigation() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Welcome} />
    </Stack.Navigator>
  );
}