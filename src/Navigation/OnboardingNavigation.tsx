import { createNativeStackNavigator, NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { OnboardingStackParamList } from "../Onboarding/onboarding";
import RoleSelection from "../Onboarding/screens/roleSelection";
import ShipperInfo from "../Onboarding/screens/shipperInfo";
import DriverInfo from "../Onboarding/screens/driverInfo";
import SubmitScreen from "../Onboarding/screens/submitScreen";
import { RootNavigationStackParamList } from "./RootNav";
import IdentityVerification from "../Onboarding/screens/identityVerification";
import OwnershipStatus from "../Onboarding/screens/ownershipStatus";



const Stack = createNativeStackNavigator<OnboardingStackParamList>();
export type DriverInfoNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "DriverInfo">;
export type DriverInfoRouteProp = RouteProp<
  OnboardingStackParamList,
  "DriverInfo"
>;


export type ShipperInfoNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "ShipperInfo">;
export type ShipperInfoRouteProp = RouteProp<
  OnboardingStackParamList,
  "ShipperInfo"
>;
export type OwnershipStatusNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "OwnershipStatus">;

export type IdentityVerificationNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "IdentityVerification">;

export type SubmitScreenNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "SubmitScreen">;

type Props = NativeStackScreenProps<RootNavigationStackParamList, "Onboard">;

export type RoleSelectionNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, "RoleSelection">;



export function OnboardingNavigation({ route }: Props) {
  console.log("route: ", route.params)
  return (
    <Stack.Navigator initialRouteName="RoleSelection" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelection} initialParams={route.params} />
      <Stack.Screen name="ShipperInfo" component={ShipperInfo} />
      <Stack.Screen name="DriverInfo" component={DriverInfo} />
      <Stack.Screen name="SubmitScreen" component={SubmitScreen} />
      <Stack.Screen name="IdentityVerification" component={IdentityVerification} />
      <Stack.Screen name="OwnershipStatus" component={OwnershipStatus} />




    </Stack.Navigator>
  );
}