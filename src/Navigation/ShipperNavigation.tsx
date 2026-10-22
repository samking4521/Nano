import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Shipper/screens/Home/Home';
import Orders from '../Shipper/screens/Orders/Orders';
import Payments from '../Shipper/screens/Payments/Payments';
import Account from '../Shipper/screens/Account/Account';
import { RootShipperStackParamList } from '../Shipper/shipper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme/colors';
import { FONT_SIZES, FONTS } from '../constants/theme/font';

const Tab = createBottomTabNavigator<RootShipperStackParamList>();

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootShipperStackParamList, "Home">;
export type OrdersScreenNavigationProp = NativeStackNavigationProp<RootShipperStackParamList, "Orders">;
export type PaymentsScreenNavigationProp = NativeStackNavigationProp<RootShipperStackParamList, "Payments">;
export type AccountScreenNavigationProp = NativeStackNavigationProp<RootShipperStackParamList, "Account">;


export function ShipperNavigation() {

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
            <Ionicons
              name={focused ? config.activeIcon : config.icon}
              size={size}
              color={color}
            />
          );
        },
      })}
        >
            <Tab.Screen name="Home" component={Home}  />
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
})