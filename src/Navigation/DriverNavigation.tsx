import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Driver/screens/Home/Home';
import Earnings from '../Driver/screens/Earnings/Earnings';
import Orders from '../Driver/screens/Orders/Orders';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { FONT_SIZES, FONTS } from '../constants/theme/font';
import Account from '../Driver/screens/Account/screens/Account';
import Profile from '../Driver/screens/Account/screens/Profile';
import Vehicle from '../Driver/screens/Account/screens/Vehicle';
import { RootDriverTabsParamList } from '../Driver/driver';
import { RootDriverStackParamList } from '../Driver/screens/Account/account';
import PersonalInfo from '../Driver/screens/Account/screens/PersonalInfo';
import IdentityInfo from '../Driver/screens/Account/screens/IdentityInfo';
import VehicleInfo from '../Driver/screens/Account/screens/VehicleInfo';
import VehicleDriver from '../Driver/screens/Account/screens/VehicleDriver';
import VehicleRegistration from '../Driver/screens/Account/screens/VehicleRegistration';
import { useDriverStore } from '../Driver/store/DriverStore';
import { RouteProp } from '@react-navigation/native';
import { useNetworkStore } from '../Providers/Network/NetworkStore';
import { useEffect, useRef, useState } from 'react';
import NetworkBanner from '../Providers/Network/NetworkBanner';
import RealtimeProvider from '../Providers/RealtimeProvider';
import { VERIFICATION_STATUS } from '../constants/shared_user';
import VehicleDetails from '../Driver/screens/Account/screens/VehicleDetails';

const Tab = createBottomTabNavigator<RootDriverTabsParamList>();
const Stack = createNativeStackNavigator<RootDriverStackParamList>();


export type DriverNavigationProp = NativeStackNavigationProp<RootDriverStackParamList>;
export type VehicleDetailsDriverNavigationRouteProp = RouteProp<RootDriverStackParamList, "VehicleDetails">;
export type VehicleInfoDriverNavigationRouteProp = RouteProp<RootDriverStackParamList, "VehicleInfo">;
export type VehicleRegistrationNavigationRouteProp = RouteProp<RootDriverStackParamList, "VehicleRegistration">;
export type VehicleDriverNavigationRouteProp = RouteProp<RootDriverStackParamList, "VehicleDriver">;



export default function DriverNavigation() {

    const isOnline = useNetworkStore((store) => store.isOnline);
    const [showNetworkBanner, setShowNetworkBanner] = useState(false);

    const previousIsOnline = useRef(isOnline);

    useEffect(() => {
        const wasOnline = previousIsOnline.current;

        if (wasOnline && !isOnline) {
            setShowNetworkBanner(true);
        }

        if (!wasOnline && isOnline) {
            setShowNetworkBanner(true);

            const timeout = setTimeout(() => {
                setShowNetworkBanner(false);
            }, 3000);

            previousIsOnline.current = isOnline;

            return () => clearTimeout(timeout);
        }

        previousIsOnline.current = isOnline;
    }, [isOnline]);


    return (
        <RealtimeProvider>
            {showNetworkBanner && <NetworkBanner setShowNetworkBanner={setShowNetworkBanner} />}
            <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="HomeScreen" component={DriverTabNavigation} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="Vehicle" component={Vehicle} />
                <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
                <Stack.Screen name="IdentityInfo" component={IdentityInfo} />
                <Stack.Screen name="VehicleInfo" component={VehicleInfo} />
                <Stack.Screen name="VehicleDriver" component={VehicleDriver} />
                <Stack.Screen name="VehicleRegistration" component={VehicleRegistration} />
                <Stack.Screen name="VehicleDetails" component={VehicleDetails} />
            </Stack.Navigator>
        </RealtimeProvider>
    )
}

export function DriverTabNavigation() {
    const driverVerificationStatus = useDriverStore((store) => store.driverVerificationStatus);
    const isOwnerAllVehiclesApproved = useDriverStore((store) => store.isOwnerAllVehiclesApproved);


    const isDriverApproved = driverVerificationStatus == VERIFICATION_STATUS.APPROVED


    const TAB_CONFIG = {
        Home: {
            icon: "home-outline",
            activeIcon: "home",
        },
        Orders: {
            icon: "receipt-outline",
            activeIcon: "receipt",
        },
        Earnings: {
            icon: "card-outline",
            activeIcon: "card",
        },
        Account: {
            icon: "person-outline",
            activeIcon: "person",
        },
    } as const;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,

                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.text.gray,

                tabBarLabelStyle: styles.label,

                tabBarIcon: ({ focused, color, size }) => {
                    const config = TAB_CONFIG[route.name as keyof typeof TAB_CONFIG];

                    return (
                        <View>
                            <Ionicons
                                name={focused ? config.activeIcon : config.icon}
                                size={size}
                                color={color}
                            />
                            {(route.name == "Account" && (!isDriverApproved || !isOwnerAllVehiclesApproved)) && <View style={styles.dotIcon} />}
                        </View>

                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Orders" component={Orders} />
            <Tab.Screen name="Earnings" component={Earnings} />
            <Tab.Screen name="Account" component={Account} />

        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.semiBold,
    },
    dotIcon: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: Colors.error,
        position: "absolute",
        top: 0,
        right: 0
    }
})