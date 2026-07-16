import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { Colors } from '../../../constants/colors'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { vehicleTypeData, vehicleDataType, vehicleType } from '../../../../assets/truck_data'

type VehicleTypeItemProps = {
    item: vehicleDataType;
    vehicleType: vehicleType;
    parentVehicleType: vehicleType;
    setVehicleType: React.Dispatch<React.SetStateAction<vehicleType>>;    
}

const VehicleTypeItem = ({ item, vehicleType, setVehicleType, parentVehicleType }: VehicleTypeItemProps) => {
    return (
        <Pressable onPress={() => setVehicleType(item.name)} style={{ borderRadius: 10, flex: 1, height: 200, borderWidth: (vehicleType || parentVehicleType) == item.name ? 2 : 0.5, justifyContent: "center", alignItems: "center", borderColor: (vehicleType || parentVehicleType) == item.name ? Colors.primary : Colors.text.gray }}>
            <Image source={item.image} style={{ width: "100%", height: 100 }} resizeMode="contain" />
            <Text style={styles.headerDesc}>{item.name}</Text>
            <MaterialCommunityIcons style={{ position: "absolute", top: 10, left: 10 }} size={24} color={(vehicleType || parentVehicleType) == item.name ? Colors.primary : Colors.text.gray} name={(vehicleType || parentVehicleType) == item.name ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} />
        </Pressable>
    )
}


type vehicleTypeProps = {
    closeVehicleTypeBottomSheet: (vehicleTypeVal: vehicleType)=> void;
    submitVehicleType: (vehicleTypeVal: vehicleType)=> void;
    parentVehicleType: vehicleType;
}

export default function VehicleType({ closeVehicleTypeBottomSheet, submitVehicleType, parentVehicleType}: vehicleTypeProps) {
      const [vehicleType, setVehicleType] = useState<vehicleType>("");
    
    const renderItem = useCallback(({ item }: { item: vehicleDataType }) => {
        return <VehicleTypeItem item={item} setVehicleType={setVehicleType} vehicleType={vehicleType} parentVehicleType={parentVehicleType} />
    }, [vehicleType]);

    const closeVehicleBottomSheet = ()=>{
         setVehicleType("");
         if(parentVehicleType){
                closeVehicleTypeBottomSheet(parentVehicleType);
                return;
         }
         closeVehicleTypeBottomSheet("");
         
    }
    
   
    return (
        <View style={[styles.bottomSheetViewCont]}>

            <View style={{ ...styles.bottomSheetHeaderCont, paddingHorizontal: 15 }}>
                <Pressable onPress={closeVehicleBottomSheet} style={styles.bottomSheetCloseIconCont}>
                    <AntDesign name="close" size={16} color={Colors.text.gray} />
                </Pressable>
                <View>
                    <Text style={styles.headerText}>Select Vehicle Type</Text>
                </View>
                <View style={{ ...styles.bottomSheetCloseIconCont, backgroundColor: undefined }} />
            </View>

            <View>
                <FlatList
                    data={vehicleTypeData}
                    renderItem={renderItem}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        rowGap: 10,
                     
                    }}
                    columnWrapperStyle={{
                        paddingHorizontal: 10,
                        gap: 10,

                    }}
                 
                />
                       
            </View>
  
 <View style={{paddingBottom: 20}}>
                                              <Pressable onPress={()=> submitVehicleType(vehicleType)} style={styles.nextBtn}>
                                                <Text style={styles.continueText}>Continue</Text>
                                            </Pressable>
                                        </View>
        </View>
    )
}

const styles = StyleSheet.create({
    bottomSheetViewCont: {
        flex: 1,
        paddingHorizontal: 5,

    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
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
        fontSize: 18,
        fontWeight: "bold",
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
})