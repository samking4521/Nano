import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useCallback, useMemo, useState } from 'react'
import BottomSheet, { BottomSheetFooter, BottomSheetFooterProps, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../constants/theme/colors'
import { vehicleDataType, vehicleType, vehicleTypeData } from '../../../../assets/truck_data'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { FONT_SIZES, FONTS } from '../../../constants/theme/font'

type vehicleInfoBottomSheetType = {
    selectVehicleType: (truck: vehicleType) => void;
    parentVehicleType: vehicleType;
    isVehicleBottomSheetOpen: boolean;
    setIsVehicleBottomSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type VehicleTypeItemProps = {
    item: vehicleDataType;
    vehicleType: vehicleType;
    setVehicleType: React.Dispatch<React.SetStateAction<vehicleType>>;
}

const VehicleTypeItem = ({ item, vehicleType, setVehicleType }: VehicleTypeItemProps) => {
    return (
        <Pressable onPress={() => setVehicleType(item.name)} style={{ borderRadius: 10, flex: 1, height: 200, borderWidth: (vehicleType) == item.name ? 2 : 1, justifyContent: "center", alignItems: "center", borderColor: (vehicleType) == item.name ? Colors.primary : Colors.borderColor }}>
            <Image source={item.image} style={{ width: "100%", height: 100 }} resizeMode="contain" />
            <Text style={styles.headerDesc}>{item.name}</Text>
            <MaterialCommunityIcons style={{ position: "absolute", top: 10, left: 10 }} size={24} color={(vehicleType) == item.name ? Colors.primary : Colors.borderColor} name={(vehicleType) == item.name ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} />
        </Pressable>
    )
}


export default function VehicleInfoBottomSheet({ selectVehicleType, isVehicleBottomSheetOpen, setIsVehicleBottomSheetOpen, parentVehicleType }: vehicleInfoBottomSheetType) {
    const snapPoints = useMemo(() => ['90%'], []);
    const [vehicleType, setVehicleType] = useState<vehicleType>(()=> parentVehicleType ?? "");


    const closeVehicleTypeBottomSheet = () => {
        setIsVehicleBottomSheetOpen(false);
    }



    const submitVehicleType = (vehicleTypeVal: vehicleType) => {
        if (!vehicleType) return;
        selectVehicleType(vehicleTypeVal);
        setIsVehicleBottomSheetOpen(false);
    }

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => (
            <BottomSheetFooter {...props}>
                <View style={styles.footerCont}>
                    <Pressable onPress={() => submitVehicleType(vehicleType)} style={styles.nextBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>
                </View>
            </BottomSheetFooter>
        ),
        [vehicleType]
    )


    const renderItem = useCallback(({ item }: { item: vehicleDataType }) => {
        return <VehicleTypeItem item={item} setVehicleType={setVehicleType} vehicleType={vehicleType} />
    }, [vehicleType]);


    return (


        <BottomSheet
            containerStyle={{ backgroundColor: isVehicleBottomSheetOpen ? "rgba(0,0,0,0.5)" : undefined }}
            handleIndicatorStyle={{ display: "none" }}
            index={1}
            snapPoints={snapPoints}
            backgroundStyle={{ backgroundColor: Colors.background }}
            footerComponent={renderFooter}
        >
            <BottomSheetView style={styles.bottomSheetCont}>
                <View style={[styles.bottomSheetViewCont]}>

                    <View style={{ ...styles.bottomSheetHeaderCont, paddingHorizontal: 15 }}>
                        <Pressable onPress={closeVehicleTypeBottomSheet} style={styles.bottomSheetCloseIconCont}>
                            <AntDesign name="close" size={16} color={Colors.text.gray} />
                        </Pressable>
                        <View>
                            <Text style={styles.headerText}>Select Vehicle Type</Text>
                        </View>
                        <View style={{ ...styles.bottomSheetCloseIconCont, backgroundColor: undefined }} />
                    </View>

                    <FlatList
                        data={vehicleTypeData}
                        renderItem={renderItem}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            rowGap: 10,
                            paddingBottom: 100

                        }}
                        columnWrapperStyle={{
                            paddingHorizontal: 10,
                            gap: 10,

                        }}

                    />



                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    bottomSheetCont: {
        height: "100%"
    },
    bottomSheetViewCont: {
        flex: 1,
        paddingHorizontal: 5,

    },
    headerDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        marginTop: 10,
        color: Colors.text.gray
    },
    bottomSheetHeaderCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15
    },
    bottomSheetCloseIconCont: {
        width: 30,
        height: 30,
        borderRadius: 30,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black

    },
    continueText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },
    nextBtn: {
        height: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,

    },
    footerCont: {
        backgroundColor: Colors.background,
        paddingTop: 10,
        paddingBottom: 30,
        paddingHorizontal: 10,
        borderTopWidth: 0.5,
        borderTopColor: Colors.borderColor
    }

})