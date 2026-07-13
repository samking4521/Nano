import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import Welcome from "../Authentication/screens/Welcome";
import SignUp from "../Authentication/screens/signUp";
import { RootAuthStackParamList } from "../Authentication/auth";
import { RouteProp } from "@react-navigation/native";

import VerificationCode from "../Authentication/screens/verificationCode";

const Stack = createNativeStackNavigator<RootAuthStackParamList>();

export type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "Welcome">;
export type SignUpScreenNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "SignUp">;
export type VerificationCodeNavigationProp = NativeStackNavigationProp<
    RootAuthStackParamList,
    "VerificationCode"
>;
export type VerificationCodeRouteProp = RouteProp<
    RootAuthStackParamList,
    "VerificationCode"
>;




export function AuthUserNavigation() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="SignUp" component={SignUp} />
       <Stack.Screen name="VerificationCode" component={VerificationCode} />
    </Stack.Navigator>
  );
}