import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Driver/screens/Home/Home';
import Account from '../Driver/screens/Account/Account';
import Earnings from '../Driver/screens/Earnings/Earnings';
import Orders from '../Driver/screens/Orders/Orders';
import { RootDriverStackParamList } from '../Driver/driver';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator<RootDriverStackParamList>();

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootDriverStackParamList, "Home">;
export type OrdersScreenNavigationProp = NativeStackNavigationProp<RootDriverStackParamList, "Orders">;
export type EarningsScreenNavigationProp = NativeStackNavigationProp<RootDriverStackParamList, "Earnings">;
export type AccountScreenNavigationProp = NativeStackNavigationProp<RootDriverStackParamList, "Account">;


export function DriverNavigation() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Account" component={Account} />
            <Tab.Screen name="Earnings" component={Earnings} />
            <Tab.Screen name="Orders" component={Orders} />
        </Tab.Navigator>
    );
}