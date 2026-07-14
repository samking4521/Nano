import { createNativeStackNavigator, NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { OnboardingStackParamList } from "../Onboarding/onboarding";
import RoleSelection from "../Onboarding/screens/roleSelection";
import MerchantInfo from "../Onboarding/screens/merchantInfo";
import DriverInfo from "../Onboarding/screens/driverInfo";
import VehicleInfo from "../Onboarding/screens/vehicleInfo";
import PaymentInfo from "../Onboarding/screens/paymentInfo";
import SubmitScreen from "../Onboarding/screens/submitScreen";
import { RootNavigationStackParamList } from "./RootNav";
import IdentityVerification from "../Onboarding/screens/identityVerification";



const Stack = createNativeStackNavigator<OnboardingStackParamList>();
export type DriverInfoNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "DriverInfo">;
export type DriverInfoRouteProp = RouteProp<
    OnboardingStackParamList,
    "DriverInfo"
>;


export type MerchantInfoNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "MerchantInfo">;
export type MerchantInfoRouteProp = RouteProp<
    OnboardingStackParamList,
    "MerchantInfo"
>;

export type IdentityVerificationNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "IdentityVerification">;

type Props = NativeStackScreenProps<RootNavigationStackParamList, "Onboard">;

export type RoleSelectionNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "RoleSelection">;

export type VehicleInfoNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "VehicleInfo">;
export type PaymentInfoNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "PaymentInfo">;


export function OnboardingNavigation({route}: Props) {
   console.log("route: ", route.params)
  return (
    <Stack.Navigator initialRouteName="RoleSelection" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelection} initialParams={route.params} />
      <Stack.Screen name="MerchantInfo" component={MerchantInfo} />
      <Stack.Screen name="DriverInfo" component={DriverInfo} />
      <Stack.Screen name="VehicleInfo" component={VehicleInfo} />
      <Stack.Screen name="PaymentInfo" component={PaymentInfo} />
      <Stack.Screen name="SubmitScreen" component={SubmitScreen} />
            <Stack.Screen name="IdentityVerification" component={IdentityVerification} />

    </Stack.Navigator>
  );
}