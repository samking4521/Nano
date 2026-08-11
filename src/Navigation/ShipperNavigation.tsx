import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Shipper/screens/Home/Home';
import Orders from '../Shipper/screens/Orders/Orders';
import Payments from '../Shipper/screens/Payments/Payments';
import Account from '../Shipper/screens/Account/Account';
import { RootShipperStackParamList } from '../Shipper/shipper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator<RootShipperStackParamList>();

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootShipperStackParamList, "Home">;
export type OrdersScreenNavigationProp = NativeStackNavigationProp<RootShipperStackParamList, "Orders">;
export type PaymentsScreenNavigationProp = NativeStackNavigationProp<RootShipperStackParamList, "Payments">;
export type AccountScreenNavigationProp = NativeStackNavigationProp<RootShipperStackParamList, "Account">;


export function ShipperNavigation() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Orders" component={Orders} />
            <Tab.Screen name="Payments" component={Payments} />
            <Tab.Screen name="Account" component={Account} />
        </Tab.Navigator>
    );
}