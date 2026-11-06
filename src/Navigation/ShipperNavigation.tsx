import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Orders from '../Shipper/screens/Orders/Orders';
import Payments from '../Shipper/screens/Payments/Payments';
import Account from '../Shipper/screens/Account/screens/Account';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme/colors';
import { FONT_SIZES, FONTS } from '../constants/theme/font';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { registerShipperNavigation } from '../notifications/notificationNavigationBridge';
import { RootShipperTabParamList } from '../Shipper/shipper';
import { RootShipperStackParamList } from '../Shipper/screens/shipperStack';
import NetworkBanner from '../Providers/Network/NetworkBanner';
import Profile from '../Shipper/screens/Account/screens/Profile';
import Notifications from '../Shipper/screens/Account/screens/Notifications';
import Home from '../Shipper/screens/Home/screens/Home';
import ShipperNotificationRealtimeProvider from '../Providers/Notification/ShipperNotificationRealtimeProvider';
import { useShipperStore } from '../Shipper/store/ShipperStore';


const Tab = createBottomTabNavigator<RootShipperTabParamList>();
const Stack = createNativeStackNavigator<RootShipperStackParamList>();


export type ShipperNavigationProp = NativeStackNavigationProp<RootShipperStackParamList>;
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootShipperTabParamList, "Home">;
export type OrdersScreenNavigationProp = NativeStackNavigationProp<RootShipperTabParamList, "Orders">;
export type PaymentsScreenNavigationProp = NativeStackNavigationProp<RootShipperTabParamList, "Payments">;
export type AccountScreenNavigationProp = NativeStackNavigationProp<RootShipperTabParamList, "Account">;


export function ShipperNavigation() {
  const [showNetworkBanner, setShowNetworkBanner] = useState(false);

  return (
    <ShipperNotificationRealtimeProvider>
      {showNetworkBanner && <NetworkBanner setShowNetworkBanner={setShowNetworkBanner} />}
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={ShipperTabNavigation} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Notifications" component={Notifications} />
      </Stack.Navigator>
    </ShipperNotificationRealtimeProvider>

  )
}

export function ShipperTabNavigation() {
      const hasUnreadNotifications = useShipperStore((store) => store.hasUnreadNotifications);
  
  const navigation =
    useNavigation<ShipperNavigationProp>();

  useEffect(() => {
    return registerShipperNavigation(navigation);
  }, [navigation]);


  const TAB_CONFIG = {
    Home: {
      icon: "home-outline",
      activeIcon: "home",
    },
    Orders: {
      icon: "receipt-outline",
      activeIcon: "receipt",
    },
    Payments: {
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
              {(route.name == "Account" && (hasUnreadNotifications)) && <View style={styles.dotIcon} />}
            </View>

          );
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Orders" component={Orders} />
      <Tab.Screen name="Payments" component={Payments} />
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