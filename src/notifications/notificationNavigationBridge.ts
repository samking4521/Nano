import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { RootDriverStackParamList } from '../Driver/screens/driverStack';
import { RootShipperStackParamList } from '../Shipper/screens/shipperStack';

type DriverNavigation = NativeStackNavigationProp<RootDriverStackParamList>;
type ShipperNavigation = NativeStackNavigationProp<RootShipperStackParamList>;

let driverNavigation: DriverNavigation | null = null;
let shipperNavigation: ShipperNavigation | null = null;

export function registerDriverNavigation(
    navigation: DriverNavigation
) {
    driverNavigation = navigation;

    return () => {
        if (driverNavigation === navigation) {
            driverNavigation = null;
        }
    };
}

export function registerShipperNavigation(
    navigation: ShipperNavigation
) {
    shipperNavigation = navigation;

    return () => {
        if (shipperNavigation === navigation) {
            shipperNavigation = null;
        }
    };
}

export function getDriverNavigation() {
    return driverNavigation;
}

export function getShipperNavigation() {
    return shipperNavigation;
}