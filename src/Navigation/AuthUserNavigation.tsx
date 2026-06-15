import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "../Welcome";
import SignUp from "../Authentication/screens/signUp";
import { RootAuthStackParamList } from "./auth";
import RoleSelection from "../Authentication/screens/roleSelection";
import MerchantInfo from "../Authentication/screens/merchantInfo";
import VerificationCode from "../Authentication/screens/verificationCode";
 
const Stack = createNativeStackNavigator<RootAuthStackParamList>();

export function AuthUserNavigation() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="RoleSelection" component={RoleSelection} />
            <Stack.Screen name="MerchantInfo" component={MerchantInfo} />
             <Stack.Screen name="VerificationCode" component={VerificationCode} />

    </Stack.Navigator>
  );
}