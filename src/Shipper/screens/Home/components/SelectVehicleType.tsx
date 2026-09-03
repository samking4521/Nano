import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React, { RefObject, useCallback, useMemo } from 'react'
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet'
import { AntDesign } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import { vehicleDataType } from '../../../../../assets/truck_data'
import { vehicleTypeVal } from './OrderDetailsModal'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'

// export type vehicleTypeVal = "Pickup Truck" | "Flatbed Truck" | "Tipper Truck" | "Box Truck" | "Van Truck" | "Container Truck";

export type VehicleTypeObj = {
    type: vehicleTypeVal | null
    image: number
    value: string
}
const vehicleTypeData: VehicleTypeObj[] = [
    {
        type: "Pickup Truck",
        image: require("../../../../../assets/truck_types/pickup_truck.png"),
        value: "An open, versatile cargo bed for moving goods"
    },
    {
        type: "Flatbed Truck",
        image: require("../../../../../assets/truck_types/flatbed_truck.png"),
        value: "Open back for large, oversize and long goods"
    },
    {
        type: "Box Truck",
        image: require("../../../../../assets/truck_types/box_truck.png"),
        value: "Larger enclosed cargo body for goods that need space and protection"
    },
    {
        type: "Van Truck",
        image: require("../../../../../assets/truck_types/van_truck.png"),
        value: "Enclosed cargo space for goods that need protection"
    },
    {
        type: "Tipper Truck",
        image: require("../../../../../assets/truck_types/tipper_truck.png"),
        value: "Good for sand, gravel and building materials"
    },
    {
        type: "Container Truck",
        image: require("../../../../../assets/truck_types/container_truck.png"),
        value: "Carries large shipping containers and heavy goods"
    },

]

type VehicleItemProps = {
    item: VehicleTypeObj
    vehicleType: vehicleTypeVal | null
    closeSelectVehicleTypeBottomSheet: () => void
    setVehicleType: React.Dispatch<React.SetStateAction<vehicleTypeVal | null>>
    index: number
    setVehicleTypeObjectData: React.Dispatch<React.SetStateAction<VehicleTypeObj | null>>

}

const VehicleItem = ({ item, vehicleType, closeSelectVehicleTypeBottomSheet, setVehicleType, index, setVehicleTypeObjectData }: VehicleItemProps) => {

    const selectVehicle = (vehicleObj: VehicleTypeObj) => {
        setVehicleType(vehicleObj.type);
        setVehicleTypeObjectData(vehicleObj)
        closeSelectVehicleTypeBottomSheet();
    }

    return (
        <Pressable onPress={() => selectVehicle(item)} style={[styles.vehicleItemContainer, { borderColor: vehicleType == item.type ? Colors.primary : Colors.borderColor, marginBottom: index == (vehicleTypeData.length - 1) ? 50 : 10 }]}>
            <View style={styles.imgCont}>
                <Image source={item.image} style={styles.vehicleImage} />
            </View>
            <View style={styles.textCont}>
                <Text style={styles.labelText}>{item.type}</Text>
                <Text style={styles.labelDesc}>{item.value}</Text>
            </View>

        </Pressable>
    )
}

type SelectVehicleTypeProps = {
    vehicleType: vehicleTypeVal | null
    selectVehicleBottomSheetRef: RefObject<BottomSheet | null>
    setOpenSelectVehicleBottomSheet: React.Dispatch<React.SetStateAction<boolean>>
    setVehicleType: React.Dispatch<React.SetStateAction<vehicleTypeVal | null>>
    setVehicleTypeObjectData: React.Dispatch<React.SetStateAction<VehicleTypeObj | null>>
}

function SelectVehicleType({ vehicleType, selectVehicleBottomSheetRef, setOpenSelectVehicleBottomSheet, setVehicleType, setVehicleTypeObjectData }: SelectVehicleTypeProps) {

    const snapPoints = useMemo(() => ['85%'], []);

    const renderItem = useCallback(({ item, index }: { item: VehicleTypeObj, index: number }) =>
        <VehicleItem key={`${item.type}`} item={item} vehicleType={vehicleType} closeSelectVehicleTypeBottomSheet={closeSelectVehicleTypeBottomSheet} setVehicleType={setVehicleType} index={index} setVehicleTypeObjectData={setVehicleTypeObjectData} />
        , [vehicleType])


    const closeSelectVehicleTypeBottomSheet = () => {
        selectVehicleBottomSheetRef.current?.close();
        setOpenSelectVehicleBottomSheet(false);
    }

    return (
        <BottomSheet
            ref={selectVehicleBottomSheetRef}
            style={styles.container}
            handleStyle={styles.handleStyle}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={() => setOpenSelectVehicleBottomSheet(false)}
            enableDynamicSizing={false}
            enableOverDrag={false}
        >

            <BottomSheetView style={styles.bottomSheetCont}>

                <Pressable onPress={closeSelectVehicleTypeBottomSheet} style={styles.closeModalBtn}>
                    <AntDesign name="close" size={18} color={Colors.text.black} />
                </Pressable>
                <View style={styles.headerCont}>

                    <Text style={styles.headerText}>Select Vehicle Type</Text>

                    <Text style={styles.headerDesc}>Choose a truck that fits your goods.</Text>
                </View>



                <View>
                    <BottomSheetFlatList
                        data={vehicleTypeData}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 100
                        }}

                    />

                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

export default React.memo(SelectVehicleType);

const styles = StyleSheet.create({
    container: {
        flex: 1,


    },
    closeModalBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        alignSelf: "flex-end"
    },
    handleStyle: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.boxBackground
    },
    bottomSheetCont: {
        height: "100%",
        backgroundColor: Colors.background,
        paddingHorizontal: 15
    },
    headerCont: {
        marginBottom: 15,
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.bold,
        color: Colors.text.black
    },
    headerDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        marginTop: 5,
        color: Colors.text.gray
    },
    vehicleImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    imgCont: {
        width: 150,
        height: 120,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    labelText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black
    },
    labelDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray,
        marginTop: 5
    },

    vehicleItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderRadius: 10,
        borderColor: Colors.borderColor,
        padding: 10,
        marginBottom: 10
    },
    textCont: {
        flexShrink: 1,


    }
})