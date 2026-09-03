import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BottomSheet, { BottomSheetFooter, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors';
import { AntDesign, Feather, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import OrderDetailsModal, { orderPhotoObj, specialHandlingDataType } from './OrderDetailsModal';
import OfferPrice from './OfferPrice';
import { VehicleTypeObj } from './SelectVehicleType';
import Map from './Map';
import EnterRoutesModal, { locationObj } from './EnterRoutesModal';
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font';


export type orderDetailsObjType = {
    order_category: string,
    order_desc: string,
    order_vehicle_data: VehicleTypeObj | null,
    order_photos: orderPhotoObj[],
    special_handling_data: specialHandlingDataType[] | null,
    order_recipent_name: string | null,
    order_recipent_phone: string | null
}

const RouteTypeIcon = ({ outer_color, inner_color }: { outer_color: string, inner_color: string }) => {
    return (
        <View style={[styles.routeTypeIcon, { backgroundColor: outer_color }]}>
            <View style={[styles.innerRouteTypeIcon, { backgroundColor: Colors.text.white }]}>
                <View style={[styles.coloredIcon, { backgroundColor: inner_color }]} />
            </View>
        </View>
    )
}


export type completedRouteType = {
    id: string
    value: string
    type: "pickup" | "destination" | "stop_1" | "stop_2" | "stop_3"
    location_obj: locationObj
}

export default function OrderHome() {
    const snapPoints = useMemo(() => ["25%"], []);
    const [showEnterRoutesModal, setShowEnterRoutesModal] = useState(false);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [showOfferPriceBottomSheet, setShowOfferPriceBottomSheet] = useState(false);
    const [orderRoutesData, setOrderRoutesData] = useState<completedRouteType[]>([]);
    const [orderDetailsData, setOrderDetailsData] = useState<orderDetailsObjType | null>(null)
    const [orderPrice, setOrderPrice] = useState("");
    const [shipperLocation, setShipperLocation] = useState<Location.LocationObject | null>(null);

    useEffect(() => {
        getCurrentLocation();
    }, []);


    console.log("location: ", shipperLocation);

    async function getCurrentLocation() {

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }


        let location = await Location.getCurrentPositionAsync({});
        setShipperLocation(location);
    }

    const enableLocation = async () => {
        const permission = await Location.getForegroundPermissionsAsync();

        if (permission.canAskAgain) {
            const { granted } =
                await Location.requestForegroundPermissionsAsync();

            if (!granted) {
                console.log("Permission to access location was denied");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setShipperLocation(location);
            return;
        }

        Alert.alert(
            "Enable Location Access",
            "Location access is currently disabled for Nano. To enable it, open Settings → Nano → Location, then select 'While Using the App'.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Open Settings",
                    onPress: () => Linking.openSettings(),
                },
            ]
        )
    };




    const getRoutesData = useCallback((routesData: completedRouteType[]) => {
        setOrderRoutesData(routesData)
    }, [])

    const getOrderDetailsData = useCallback((orderDetailsObj: orderDetailsObjType) => {
        setOrderDetailsData(orderDetailsObj)
    }, [])

    const getOrderPriceData = useCallback((orderPrice: string) => {
        setOrderPrice(orderPrice)
    }, [])

    const showOfferPriceUI = () => {
        setShowOfferPriceBottomSheet(true);
    }

    const showRoutesUI = () => {
        setShowEnterRoutesModal(true);
    }

    const showOrderDetailsUI = () => {
        setShowOrderDetailsModal(true);
    }




    const pickup = orderRoutesData[0]?.type == "pickup";
    const destination = orderRoutesData[orderRoutesData.length - 1]?.type == "destination";
    const stopsCount = orderRoutesData?.filter((item) => item.type !== "pickup" && item.type !== "destination");
    const orderDetailsCategory = orderDetailsData?.order_category;

    return (
        <>
            <Map orderRoutesData={orderRoutesData} shipperLocation={shipperLocation} />
            <BottomSheet
                handleIndicatorStyle={styles.handleIndicatorStyle}
                enableOverDrag={false}
                handleStyle={styles.handleStyle}
                enableDynamicSizing={true}
                index={1}
                snapPoints={snapPoints}
            >
                <BottomSheetView style={styles.orderBottomSheetBody}>
                    <View>
                        <View>
                            <Text style={styles.headerText}>Book a truck</Text>
                        </View>

                        <View style={styles.orderDetailsCont}>
                            {pickup ?
                                <Pressable onPress={showRoutesUI} style={styles.orderDetailsBoxCont}>
                                    <RouteTypeIcon outer_color={Colors.routeTypeIcons.outer_pickup} inner_color={Colors.routeTypeIcons.inner_pickup} />
                                    <View style={styles.detailsTextCont}>
                                        <Text style={styles.orderDetailsText}>{orderRoutesData[0].location_obj.value}</Text>
                                    </View>
                                </Pressable>

                                :

                                <Pressable onPress={showRoutesUI} style={styles.detailsBoxCont}>
                                    <Feather name="search" size={25} color={Colors.routeTypeIcons.search} style={styles.detailsBoxIcon} />
                                    <Text style={styles.detailsText}>From?</Text>
                                </Pressable>}

                            {destination ?

                                <Pressable onPress={showRoutesUI} style={styles.orderDetailsBoxCont}>
                                    <RouteTypeIcon outer_color={Colors.routeTypeIcons.outer_destination} inner_color={Colors.routeTypeIcons.inner_destination} />
                                    <View style={styles.detailsTextCont}>
                                        <Text style={styles.orderDetailsText}>{orderRoutesData[orderRoutesData.length - 1].location_obj.value}</Text>
                                    </View>
                                    {stopsCount.length >= 1 ? <View style={styles.stopsCountCont}>
                                        <Text style={styles.stopsCountText}>{stopsCount.length} Stop{stopsCount.length > 1 ? "s" : undefined}</Text>
                                    </View> : <View style={styles.stopsCont}>
                                        <AntDesign name="plus" size={20} color={Colors.text.black} />

                                        <Text style={styles.stopsText}>Add stops</Text>
                                    </View>}
                                </Pressable>
                                :

                                <Pressable onPress={showRoutesUI} style={styles.detailsBoxCont}>
                                    <Feather name="search" size={25} color={Colors.routeTypeIcons.search} style={styles.detailsBoxIcon} />
                                    <Text style={styles.detailsText}>To?</Text>
                                </Pressable>}

                            {
                                orderDetailsCategory ?
                                    <Pressable onPress={showOrderDetailsUI} style={styles.orderDetailsBoxCont}>
                                        <MaterialCommunityIcons name="package-variant-closed" size={25} color={Colors.primary} style={styles.detailsBoxIcon} />
                                        <View style={styles.detailsTextCont}>
                                            <Text style={styles.orderDetailsText}>{orderDetailsData.order_category}</Text>
                                        </View>
                                        <MaterialIcons name="keyboard-arrow-right" size={24} color={Colors.text.black} style={styles.arrowRightIcon} />

                                    </Pressable>
                                    :
                                    <Pressable onPress={showOrderDetailsUI} style={styles.detailsBoxCont}>
                                        <Feather name="truck" size={25} color={Colors.routeTypeIcons.search} style={styles.detailsBoxIcon} />
                                        <Text style={styles.detailsText}>What are you moving?</Text>
                                        <MaterialIcons name="keyboard-arrow-right" size={24} color={Colors.routeTypeIcons.search} style={styles.arrowRightIcon} />

                                    </Pressable>}

                            {orderPrice ?
                                <Pressable onPress={showOfferPriceUI} style={styles.orderDetailsBoxCont}>
                                    <MaterialCommunityIcons name="cash-multiple" size={25} color={Colors.text.black} style={styles.detailsBoxIcon} />
                                    <View style={styles.orderPriceTextCont}>
                                        <FontAwesome6 name="naira-sign" size={16} color={Colors.text.black} />
                                        <Text style={styles.orderDetailsText}>{orderPrice}</Text>
                                    </View>
                                    <MaterialIcons name="keyboard-arrow-right" size={24} color={Colors.text.black} style={styles.arrowRightIcon} />

                                </Pressable>
                                :
                                <Pressable onPress={showOfferPriceUI} style={styles.detailsBoxCont}>
                                    <MaterialCommunityIcons name="cash-multiple" size={25} color={Colors.routeTypeIcons.search} style={styles.detailsBoxIcon} />
                                    <Text style={styles.detailsText}>Set your price</Text>
                                    <MaterialIcons name="keyboard-arrow-right" size={24} color={Colors.routeTypeIcons.search} style={styles.arrowRightIcon} />
                                </Pressable>}
                        </View>
                        <View style={styles.footerCont}>
                            <Pressable style={styles.findTruckBtn}>
                                <Text style={styles.findTruckText}>Find a Truck</Text>
                            </Pressable>
                        </View>
                    </View>

                </BottomSheetView>
            </BottomSheet>
            {showEnterRoutesModal && <EnterRoutesModal getRoutesData={getRoutesData} orderRoutesData={orderRoutesData} setShowEnterRoutesModal={setShowEnterRoutesModal} />}
            {showOrderDetailsModal && <OrderDetailsModal orderDetailsData={orderDetailsData} getOrderDetailsData={getOrderDetailsData} setShowOrderDetailsModal={setShowOrderDetailsModal} />}
            {showOfferPriceBottomSheet && <OfferPrice orderPrice={orderPrice} getOrderPriceData={getOrderPriceData} setShowOfferPriceBottomSheet={setShowOfferPriceBottomSheet} />}
        </>
    )
}


const styles = StyleSheet.create({
    orderBottomSheetBody: {
        paddingHorizontal: 20,
        backgroundColor: Colors.background,
    },
    handleStyle: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.boxBackground
    },
   
    headerText: {
        fontSize: FONT_SIZES.xl,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black

    },
    detailsBoxCont: {
        width: "100%",
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        backgroundColor: Colors.boxBackground,
        marginBottom: 10,

    },
    detailsText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.medium,
        color: Colors.text.boxContPlaceholderText
    },
    orderDetailsCont: {
        marginTop: 10
    },
    findTruckBtn: {
        width: "100%",
        height: 50,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",

    },
    findTruckText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.white
    },
    detailsBoxIcon: {
        marginRight: 10
    },
    orderDetailsBoxCont: {
        width: "100%",
        minHeight: 50,
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    orderDetailsText: {
       fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black
    },
    routeTypeIcon: {
        width: 25,
        height: 25,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10
    },
    innerRouteTypeIcon: {
        width: 15,
        height: 15,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    coloredIcon: {
        width: 13,
        height: 13,
        borderRadius: 13
    },
    detailsTextCont: {
        flexShrink: 1
    },
    stopsCont: {
        alignItems: "center",
        gap: 2,
        marginLeft: "auto"
    },
    stopsText: {
       fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        color: Colors.text.gray
    },
    stopsCountText: {
         fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.routeTypeIcons.inner_stop
    },
    stopsCountCont: {
        marginLeft: "auto"
    },
    orderPriceTextCont: {
        flexShrink: 1,
        flexDirection: "row",
        alignItems: "center"
    },
    arrowRightIcon: {
        marginLeft: "auto"
    },
    footerCont: {
        paddingBottom: 5,
    },

})