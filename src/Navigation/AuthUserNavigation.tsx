import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "../Welcome";
import SignUp from "../Authentication/screens/signUp";
import { RootAuthStackParamList } from "./auth";
import RoleSelection from "../Authentication/screens/roleSelection";
import MerchantInfo from "../Authentication/screens/merchantInfo";
import VerificationCode from "../Authentication/screens/verificationCode";
import DriverInfo from "../Authentication/screens/driverInfo";
import VehicleInfo from "../Authentication/screens/vehicleInfo";
import PaymentInfo from "../Authentication/screens/paymentInfo";

const Stack = createNativeStackNavigator<RootAuthStackParamList>();

export function AuthUserNavigation() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="RoleSelection" component={RoleSelection} />
      <Stack.Screen name="MerchantInfo" component={MerchantInfo} />
      <Stack.Screen name="VerificationCode" component={VerificationCode} />
      <Stack.Screen name="DriverInfo" component={DriverInfo} />
      <Stack.Screen name="VehicleInfo" component={VehicleInfo} />
      <Stack.Screen name="PaymentInfo" component={PaymentInfo} />

    </Stack.Navigator>
  );
}