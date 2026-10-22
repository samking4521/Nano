import { Dimensions, StyleSheet, View } from 'react-native'
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import React, { useEffect, useRef, useState } from 'react'
import { Colors } from '../../../../constants/theme/colors'
import * as Location from 'expo-location';
import { completedRouteType } from './OrderHome';
import { RouteTypeIcon } from './EnterRoutesModal';
import { getRoute } from '../../../../utils/routesAPI';


const HEIGHT = Dimensions.get("screen").height;

type MapProps = {
    orderRoutesData: completedRouteType[]
    shipperLocation: Location.LocationObject | null
}

type coordsType = {
    latitude: number
    longitude: number
}

const initialRegion = {
    latitude: 6.6018,
    longitude: 3.3515,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
}

function Map({ orderRoutesData, shipperLocation }: MapProps) {
    const mapRef = useRef<MapView>(null);
    const [mapReady, setMapReady] = useState(false);

    const routeCoordinates = orderRoutesData.map((item) => ({
        latitude: item.location_obj.lat,
        longitude: item.location_obj.long
    }))

    const AnimateMapToLocationRegion = (coords: coordsType) => {
        const offset = 0.02
        const coordinates = [
            {
                latitude: coords.latitude - offset,
                longitude: coords.longitude - offset,
            },
            {
                latitude: coords.latitude + offset,
                longitude: coords.longitude + offset,
            },
        ]

        mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 80, right: 60, bottom: HEIGHT * 0.5 + 40, left: 60 },
            animated: true,
        })
    }

    const FitMapToRoutes = () => {
        if (!orderRoutesData || orderRoutesData.length === 0) return
        const coordinates = orderRoutesData.map((route) => ({
            latitude: route.location_obj.lat,
            longitude: route.location_obj.long,
        }))

        mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 80, right: 60, bottom: HEIGHT * 0.5 + 40, left: 60 },
            animated: true,
        })
    }


    useEffect(() => {
        if (!mapReady || !shipperLocation) return
        const shipper_coordinates = {
            latitude: shipperLocation.coords.latitude,
            longitude: shipperLocation.coords.longitude
        }
        AnimateMapToLocationRegion(shipper_coordinates)
    }, [mapReady, shipperLocation])




    useEffect(() => {
        if (!mapReady || !orderRoutesData || orderRoutesData.length === 0) return;
        FitMapToRoutes();
    }, [mapReady, orderRoutesData])


    const animateToRouteRegion = (route: completedRouteType) => {

        const coordinates = {
            latitude: route.location_obj.lat,
            longitude: route.location_obj.long
        }

        AnimateMapToLocationRegion(coordinates)
    }

    useEffect(() => {
        if (orderRoutesData.length == 0) return;
        const pickup = orderRoutesData.filter((item) => item.type == "pickup").map((item) => ({
            latitude: item.location_obj.lat,
            longitude: item.location_obj.long
        }))
        const stops = orderRoutesData.filter((item) => (item.type !== "pickup" && item.type !== "destination")).map((item) => ({
            latitude: item.location_obj.lat,
            longitude: item.location_obj.long
        }))
        const destination = orderRoutesData.filter((item) => item.type == "destination").map((item) => ({
            latitude: item.location_obj.lat,
            longitude: item.location_obj.long
        }))
        console.log("pickup, stops, destination", pickup, stops, destination);

        // (
        //     async () => {
        //         try {
        //             const result = await getRoute({
        //                 pickup: pickup[0],
        //                 stops: stops.length >= 1 ? stops : undefined,
        //                 destination: destination[0]
        //             })
        //             console.log("result : ", result)
        //         } catch (error) {
        //             console.log("error: ", error)
        //         }


        //     }

        // )()


    }, [orderRoutesData])






    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                ref={mapRef}
                onMapReady={() => setMapReady(true)}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                followsUserLocation={false}
            >
                {
                    orderRoutesData.map((route) => {
                        console.log("rendering marker for", route.type, route.location_obj.lat, route.location_obj.long)
                        const routeCoords = {
                            latitude: route.location_obj.lat,
                            longitude: route.location_obj.long
                        }
                        return (
                            <Marker
                                onPress={() => animateToRouteRegion(route)}
                                key={`${route.type}-${route.location_obj.lat}-${route.location_obj.long}`}
                                coordinate={routeCoords}
                                title={route.type == "pickup" ? "Pickup" : route.type == "destination" ? "Drop-off" : route.type == "stop_1" ? "Stop 1" : route.type == "stop_2" ? "Stop 2" : "Stop 3"}
                            >

                                {
                                    route.type == "pickup" ?
                                        <RouteTypeIcon inner_color={Colors.routeTypeIcons.inner_pickup} outer_color={Colors.routeTypeIcons.outer_pickup} />
                                        :
                                        route.type == "destination" ?
                                            <RouteTypeIcon inner_color={Colors.routeTypeIcons.inner_destination} outer_color={Colors.routeTypeIcons.outer_destination} />
                                            :
                                            <RouteTypeIcon inner_color={Colors.routeTypeIcons.inner_stop} outer_color={Colors.routeTypeIcons.outer_stop} />
                                }

                            </Marker>
                        )
                    })
                }


            </MapView>
        </View>
    )
}

export default React.memo(Map)

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        width: "100%",
        height: "100%"
    },
    routeMarkerCont: {
        alignItems: 'center',

    }

})