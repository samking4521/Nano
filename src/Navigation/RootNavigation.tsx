import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthUserNavigation } from "./AuthUserNavigation";
import { OnboardingNavigation } from "./OnboardingNavigation";
import { RootNavigationStackParamList } from "./RootNav";
import { RouteProp } from "@react-navigation/native";
import { useAuthStore } from "../Authentication/store/authStore";

const Stack = createNativeStackNavigator<RootNavigationStackParamList>();

export type AuthNavigationProp = NativeStackNavigationProp<
    RootNavigationStackParamList,
    "Auth"
>;

export type OnboardNavigationProp = NativeStackNavigationProp<
    RootNavigationStackParamList,
    "Onboard"
>;

export type OnboardNavigationRouteProp = RouteProp<RootNavigationStackParamList, "Onboard">;

export type routeName = "Auth" | "Onboard";

export function RootNavigation() {
    const initialRouteName = useAuthStore((store)=> store.initialRouteName);
   
    return (
        <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthUserNavigation} />
            <Stack.Screen name="Onboard" component={OnboardingNavigation} />
        </Stack.Navigator>
    );
}