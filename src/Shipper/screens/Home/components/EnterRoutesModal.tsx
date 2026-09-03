import { TextInput, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import { dummyData } from '../../../../../assets/shipper/placesDummyData'
import ShimmerComponent from './ShimmerComponent'
import { completedRouteType } from './OrderHome'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'


type destinationModalProps = {
    setShowEnterRoutesModal: React.Dispatch<React.SetStateAction<boolean>>
    getRoutesData: (routesData: completedRouteType[]) => void
    orderRoutesData: completedRouteType[]
}

type routeTypeVal = "pickup" | "destination" | "stop_1" | "stop_2" | "stop_3"

export type locationObj = {
    lat: number
    long: number
    value: string,
    area: string,
    formatted_address: string,
    distance: string,
    street?: string,
    city?: string,
    state: string,
    country: string
}

export type routeType = {
    id: string
    value: string
    type: routeTypeVal
    location_obj: locationObj | null
}

let idCounter = 0
const genId = () => `route_${idCounter++}_${Date.now()}`

const initialRoutesData: routeType[] = [
    { id: genId(), value: "", type: "pickup", location_obj: null },
    { id: genId(), value: "", type: "destination", location_obj: null },
]

export const RouteTypeIcon = ({ outer_color, inner_color }: { outer_color: string, inner_color: string }) => {
    return (
        <View style={[styles.routeTypeIcon, { backgroundColor: outer_color }]}>
            <View style={[styles.innerRouteTypeIcon, { backgroundColor: Colors.text.white }]}>
                <View style={[styles.coloredIcon, { backgroundColor: inner_color }]} />
            </View>
        </View>
    )
}




export default function EnterRoutesModal({ setShowEnterRoutesModal, getRoutesData, orderRoutesData }: destinationModalProps) {
    const [routesDataArr, setRoutesDataArr] = useState<routeType[]>(() => orderRoutesData.length >= 2 ? orderRoutesData : initialRoutesData)
    const [activeRouteId, setActiveRouteId] = useState<string | null>(null)
    const [searchingPlaces, setSearchingPlaces] = useState(false);
    const routeInputRefs = useRef<Record<string, TextInput | null>>({});
    const disableEffectOnChangeText = useRef<boolean>(true);

    const closeOrderRoutesDestinationModal = () => {
        setShowEnterRoutesModal(false);
    }


    const setRouteText = (value: string, routeId: string) => {
        disableEffectOnChangeText.current = true;
        setRoutesDataArr((prev) => {
            const updateActiveFocusedRouteBox = prev.map((item) => item.id !== routeId ? item : {
                ...item, value: value, location_obj: value ? null : item.location_obj
            });

            return updateActiveFocusedRouteBox
        });
    }


    const relabelStopsRouteArr = (stops: routeType[]) => {
        let stop_num = 0;
        const stopsRoutesData = stops.filter((item) => (item.type !== "pickup" && item.type !== "destination"));
        const stopsRelabelled = stopsRoutesData.map((item) => {
            stop_num++
            return {
                ...item, type: `${item.type.slice(0, -1)}${stop_num}`
            }
        })
        return stopsRelabelled as routeType[]
    }

    useEffect(() => {
        if (disableEffectOnChangeText.current) return;
        const firstUnenteredRouteBox = routesDataArr.find((item) => !item.location_obj);
        if (firstUnenteredRouteBox) {
            routeInputRefs.current[firstUnenteredRouteBox.id]?.focus()
            setActiveRouteId(firstUnenteredRouteBox.id)
        } else {
            setActiveRouteId(null)
            getRoutesData(routesDataArr as completedRouteType[])
            closeOrderRoutesDestinationModal();
        }
    }, [routesDataArr])


    const addStops = () => {
        disableEffectOnChangeText.current = false;
        setRoutesDataArr((prev) => {
            const stopObj = {
                id: genId(), value: "", type: "stop_1", location_obj: null
            } as routeType
            const relabelStops = relabelStopsRouteArr([...prev, stopObj])
            const newRoutesData = [prev[0], ...relabelStops, prev[prev.length - 1]]
            return newRoutesData
        })

    }

    const deleteRoute = (route: routeType) => {
        disableEffectOnChangeText.current = false;
        if (route.type === "destination") {
            setRoutesDataArr((prev) => {
                const getStops = prev.filter((item) => (item.type !== "pickup" && item.type !== "destination"));
                const reStructuredRoutes = [...getStops.slice(0, -1), {
                    id: getStops[getStops.length - 1].id,
                    value: getStops[getStops.length - 1].value,
                    location_obj: getStops[getStops.length - 1].location_obj,
                    type: "destination"
                }]
                const newRoutesData = [prev[0], ...reStructuredRoutes]
                return newRoutesData as routeType[]
            });
        } else {
            setRoutesDataArr((prev) => {
                const removeSelectedStopRoute = prev.filter((item) => item.id !== route.id);
                const relabelStops = relabelStopsRouteArr(removeSelectedStopRoute);
                const newRoutesData = [prev[0], ...relabelStops, prev[prev.length - 1]]
                return newRoutesData
            })
        }
    }


    const clearRouteText = (routeId: string) => {
        setRoutesDataArr((prev) => {
            const newRoutesData = prev.map((item) => item.id !== routeId ? item : { ...item, value: "" })
            return newRoutesData
        });
    }

    const togglePickupDestinationInput = () => {
        const selectedRoute = routesDataArr.filter((item) => item.id == activeRouteId);
        if (selectedRoute[0].type == "pickup") {
            const destinationRoute = routesDataArr[routesDataArr.length - 1]
            routeInputRefs.current[destinationRoute.id]?.focus()
            setActiveRouteId(destinationRoute.id);
        } else {
            const pickupRoute = routesDataArr[0];
            routeInputRefs.current[pickupRoute.id]?.focus()
            setActiveRouteId(pickupRoute.id);
        }
    }

    useEffect(() => {
        const pickupRoute = routesDataArr.filter((item) => item.type == "pickup");
        routeInputRefs.current[pickupRoute[0].id]?.focus()
        setActiveRouteId(pickupRoute[0].id);
    }, []);


    const setLocationRouteObj = (locationObj: locationObj) => {
        disableEffectOnChangeText.current = false;
        setRoutesDataArr((prev) => {
            const updatedRouteObjData = prev.map((item) => item.id === activeRouteId ? {
                ...item, value: "", location_obj: locationObj
            } : item);

            return updatedRouteObjData
        })
    }


    return (
        <Modal
            visible={true}
            onRequestClose={closeOrderRoutesDestinationModal}
            animationType="slide"
            presentationStyle={"overFullScreen"}
        >
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <View style={styles.body}>
                        <View style={styles.headerCont}>
                            <Pressable onPress={closeOrderRoutesDestinationModal} style={styles.closeModalBtn}>
                                <AntDesign name="close" size={18} color={Colors.text.black} />
                            </Pressable>

                            <Text style={styles.headerText}>Set your route</Text>
                            <View style={styles.view} />
                        </View>

                        <View style={styles.destinationBox}>
                            <View style={styles.destinationBox}>
                                {routesDataArr.map((route) => {
                                    const isActive = activeRouteId === route.id
                                    const routeValue = route.value

                                    return (
                                        <View key={route.id} style={styles.routeInputCont}>
                                            <View
                                                style={[
                                                    styles.routeInputBox,
                                                    {
                                                        borderWidth: isActive ? 1.5 : 0,
                                                        borderColor: isActive ? Colors.primary : undefined,
                                                    },
                                                ]}
                                            >
                                                {route.id !== activeRouteId ? (
                                                    route.location_obj ? (
                                                        route.type === "pickup" ? (
                                                            <RouteTypeIcon
                                                                outer_color={Colors.routeTypeIcons.outer_pickup}
                                                                inner_color={Colors.routeTypeIcons.inner_pickup}
                                                            />
                                                        ) : route.type === "destination" ? (
                                                            <RouteTypeIcon
                                                                outer_color={Colors.routeTypeIcons.outer_destination}
                                                                inner_color={Colors.routeTypeIcons.inner_destination}
                                                            />
                                                        ) : (
                                                            <RouteTypeIcon
                                                                outer_color={Colors.routeTypeIcons.outer_stop}
                                                                inner_color={Colors.routeTypeIcons.inner_stop}
                                                            />
                                                        )
                                                    ) : (
                                                        <Feather
                                                            name="search"
                                                            size={20}
                                                            color={Colors.routeTypeIcons.search}

                                                        />
                                                    )
                                                ) : (
                                                    <Feather
                                                        name="search"
                                                        size={20}
                                                        color={Colors.routeTypeIcons.search}

                                                    />
                                                )}

                                                <Pressable style={styles.inputBoxCont}>
                                                    <TextInput
                                                        ref={(ref) => { routeInputRefs.current[route.id] = ref }}
                                                        value={route?.location_obj?.value ?? routeValue}
                                                        autoCorrect={false}
                                                        onChangeText={(value) => setRouteText(value, route.id)}
                                                        style={styles.inputBox}
                                                        selectionColor={Colors.primary}
                                                        placeholder={
                                                            route.type === "pickup"
                                                                ? 'From'
                                                                : route.type === "destination"
                                                                    ? "To"
                                                                    : "Add Stop"
                                                        }
                                                        placeholderTextColor={Colors.text.boxContPlaceholderText}
                                                        onFocus={() => {
                                                            setActiveRouteId(route.id)

                                                        }}
                                                        onBlur={() => {
                                                            // setSearchingPlaces(false);
                                                        }}

                                                    />
                                                </Pressable>

                                                {isActive && routeValue.length >= 1 && (
                                                    // clearRouteText(route.id)
                                                    <Pressable
                                                        onPress={() => clearRouteText(route.id)}
                                                        style={styles.clearTextCont}
                                                    >
                                                        <AntDesign name="close" size={10} color={Colors.text.white} />
                                                    </Pressable>
                                                )}

                                                {route.location_obj && (
                                                    <FontAwesome5
                                                        name="map-marked-alt"
                                                        size={20}
                                                        color={Colors.routeTypeIcons.search}
                                                        style={styles.confirmLocationIcon}
                                                    />
                                                )}
                                            </View>

                                            {route.type === "pickup" ? (
                                                routesDataArr.length <= 4 ? (

                                                    <Pressable onPress={addStops} style={styles.routeEndBoxIcon}>
                                                        <AntDesign name="plus" size={20} color={Colors.text.black} />
                                                    </Pressable>
                                                ) : (
                                                    <Pressable style={styles.routeEndBoxIcon}>
                                                    </Pressable>
                                                )
                                            ) : routesDataArr.length > 2 ? (

                                                <Pressable
                                                    onPress={() => deleteRoute(route)}
                                                    style={styles.routeEndBoxIcon}
                                                >
                                                    <AntDesign name="close" size={20} color={Colors.error} />
                                                </Pressable>
                                            ) : (

                                                <Pressable onPress={togglePickupDestinationInput} style={styles.routeEndBoxIcon}>
                                                    <MaterialIcons name="swap-vert" size={20} color={Colors.text.black} />
                                                </Pressable>
                                            )}
                                        </View>
                                    )
                                })}
                            </View>

                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollBody}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps={"always"}
                            keyboardDismissMode="on-drag"
                        >
                            {routesDataArr.find(
                                (item) => item.id === activeRouteId && item.type === "pickup"
                            ) && (
                                    <Pressable onPress={() => setSearchingPlaces(!searchingPlaces)} style={styles.currentLocationCont}>
                                        <Ionicons name="navigate-outline" size={24} color={Colors.routeTypeIcons.search} />
                                        <Text style={styles.currentLocationText}>Use current location</Text>
                                    </Pressable>
                                )}

                            <View style={{ marginTop: 30 }}>
                                {
                                    searchingPlaces ?
                                        Array.from({ length: 5 }).map((_, i) => <ShimmerComponent key={i} />)
                                        :

                                        dummyData.map((item, index) => (
                                            <Pressable onPress={() => setLocationRouteObj(item)} key={`${item.value}-${index}`} style={styles.placesCont}>
                                                <View style={styles.locationOutlineIconCont}>
                                                    <Ionicons name="location-outline" size={28} color={Colors.routeTypeIcons.search} />
                                                </View>
                                                <View style={styles.placesTextCont}>
                                                    <Text style={styles.placeValueText}>{item.value}</Text>
                                                    <Text style={styles.placeValueArea}>{item.area}</Text>
                                                </View>
                                                <View style={styles.distanceTextCont}>
                                                    <Text style={styles.distanceText}>{item.distance}</Text>
                                                </View>
                                            </Pressable>
                                        ))
                                }
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    body: {
        flex: 1,
        paddingHorizontal: 15
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.bold,
        color: Colors.text.black
    },
    headerCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    closeModalBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center",
    },
    view: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    destinationBox: {
        marginVertical: 15
    },
    routeTypeIcon: {
        width: 25,
        height: 25,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center"
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
    routeInputCont: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    routeInputBox: {
        flex: 1,
        flexShrink: 1,
        height: 45,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.boxBackground,
        borderRadius: 10,
        padding: 10,
    },
    inputBoxCont: {
        flex: 1,
         height: 45,
        marginHorizontal: 10
    },
    inputBox: {
          flex: 1,
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.black,
    },
    clearTextCont: {
        width: 20,
        height: 20,
        borderRadius: 20,
        backgroundColor: Colors.routeTypeIcons.search,
        justifyContent: "center",
        alignItems: "center"
    },
    confirmLocationIcon: {
        marginLeft: 10
    },
    routeEndBoxIcon: {
        width: 40,
        height: 45,
        justifyContent: "center",
        alignItems: "center",

    },
    currentLocationCont: {
        flexDirection: "row",
        alignItems: "center"
    },
    currentLocationText: {
        fontSize: FONT_SIZES.md,
        color: Colors.text.black,
        letterSpacing: 0.5,
        fontFamily: FONTS.medium,
        marginLeft: 5
    },
    scrollBody: {
        flex: 1,
        paddingBottom: 100
    },
    placesCont: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: Colors.borderColor,
        borderBottomWidth: 1,
        paddingVertical: 10
    },
    locationOutlineIconCont: {
        marginRight: 10
    },
    placeValueText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.black
    },
    placeValueArea: {
         fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray
    },
    placesTextCont: {
        flexShrink: 1,
        gap: 3,

    },
    distanceTextCont: {
        marginLeft: "auto"
    },
    distanceText: {
         fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.gray
    }
})