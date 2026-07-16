import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRef, useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons'

import { Colors } from '../../../constants/colors'
import { useNavigation } from '@react-navigation/native'
import BottomSheet from '@gorhom/bottom-sheet'
import { driverStorage } from '../../../localStorage/driverStorage'
import { VehicleInfoNavigationProp } from '../../../Navigation/OnboardingNavigation'
import VehicleInfoBottomSheet from './vehicleInfoBottomSheet'
import { vehicleType } from '../../../../assets/truck_data'
import PhotoBottomSheet, { photoTypeData } from './PhotoBottomSheet'
import { ownershipType } from '../ownershipStatus'

export type vehiclePhotoType = {
    id: string,
    uri: string
}


type inputFocusType = "vehicle_capacity" | "plate_number";

type vehicleModalProps = {
    setOpenVehicleModal: React.Dispatch<React.SetStateAction<boolean>>;
    setOwnershipStatus: React.Dispatch<React.SetStateAction<ownershipType | null>>;
}

export default function VehicleInfoModal({ setOpenVehicleModal, setOwnershipStatus }: vehicleModalProps) {
    const [plateNumber, setPlateNumber] = useState(() => driverStorage.getString("plateNumber") ?? "");
    const [inputFocus, setInputFocus] = useState<inputFocusType | null>(null);
    const [vehicleCapacity, setVehicleCapacity] = useState(() => driverStorage.getString("vehicleCapacity") ?? "");
    const [vehiclePhotos, setVehiclePhotos] = useState<vehiclePhotoType[]>(() => {
        const vehicleArrString = driverStorage.getString("vehiclePhotos");

        if (!vehicleArrString) return [];
        return JSON.parse(vehicleArrString);

    });

    const [photoType, setPhotoType] = useState<photoTypeData>(null);


    const [vehicleLicensePhoto, setVehicleLicensePhoto] = useState(() => driverStorage.getString("vehicleLicensePhoto") ?? "");

    const [vehicleType, setVehicleType] = useState<vehicleType>(() => (driverStorage.getString("vehicleType") ?? "") as vehicleType);

    const [editVehiclePhotos, setEditVehiclePhotos] = useState(false);
    const [isVehicleBottomSheetOpen, setIsVehicleBottomSheetOpen] = useState<boolean>(false);
    const navigation = useNavigation<VehicleInfoNavigationProp>();
    const [clickedContinue, setClickedContinue] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const vehicleTypeBottomSheetRef = useRef<BottomSheet>(null);


    const selectVehicleType = (truck: vehicleType) => {
        setVehicleType(truck);
    }

    const selectVehiclePhotos = () => {
        setPhotoType("VehiclePhotos");
        bottomSheetRef.current?.expand();
    }

    const selectVehicleLicensePhoto = () => {
        setPhotoType("VehicleLicensePhoto")
        bottomSheetRef.current?.expand();
    }

    const deleteVehiclePhotos = (img: vehiclePhotoType) => {
        const filteredImg = vehiclePhotos.filter((item) => item.id != img.id);
        setVehiclePhotos([...filteredImg])

    }




    const vehicle_type_err = clickedContinue && !vehicleType;
    const vehicle_plate_no_err = clickedContinue && plateNumber.trim() == "";
    const vehicle_capacity_err = clickedContinue && vehicleCapacity.trim() == "";
    const vehicle_photo_empty_err = clickedContinue && vehiclePhotos.length == 0;
    const vehicle_photo_length_err = clickedContinue && (vehiclePhotos.length < 2 || vehiclePhotos.length > 2);
    const driver_license_photo_err = clickedContinue && !vehicleLicensePhoto;



    const continueToSubmitScreen = () => {
        setClickedContinue(true);

        const hasErrors = [
            !vehicleType,
            plateNumber.trim() == "",
            vehicleCapacity.trim() == "",
            vehiclePhotos.length == 0,
            (vehiclePhotos.length < 2 || vehiclePhotos.length > 2),
            !vehicleLicensePhoto
        ].some(Boolean);

        if (hasErrors) return;

        driverStorage.set("vehicleType", vehicleType ?? "");
        driverStorage.set("vehicleCapacity", vehicleCapacity);
        driverStorage.set("plateNumber", plateNumber);
        driverStorage.set("vehiclePhotos", JSON.stringify(vehiclePhotos));
        driverStorage.set("vehicleLicensePhoto", vehicleLicensePhoto);
        driverStorage.set("isVehicleInfoComplete", true);
        driverStorage.set("ownershipStatus", "OWNER")

        setOwnershipStatus("OWNER");
        setOpenVehicleModal(false);
        navigation.navigate("SubmitScreen")
    };


    const openBottomSheet = () => {
        vehicleTypeBottomSheetRef.current?.expand();
        setIsVehicleBottomSheetOpen(true)

    }


    const closeVehicleModal = ()=>{
         setOpenVehicleModal(false);
        if( driverStorage.getString("vehicleType") && 
        driverStorage.getString("vehicleCapacity") && 
        driverStorage.getString("plateNumber") && 
        driverStorage.getString("vehiclePhotos") && 
        driverStorage.getString("vehicleLicensePhoto") 
        
           ){
           
             return;
        }
       setVehicleType("");
       setVehicleCapacity("");
       setPlateNumber("");
       setVehiclePhotos([]);
       setVehicleLicensePhoto("");
       setClickedContinue(false);
       
    }


    return (
        <Modal visible={true} onRequestClose={closeVehicleModal} animationType="slide" transparent={false} presentationStyle="fullScreen" >
            <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={{ flex: 1, paddingHorizontal: 15, }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}

                >
                    <View style={styles.headerContainer}>
                        <Pressable onPress={closeVehicleModal} style={styles.backBtn}>
                            <AntDesign name="close" size={20} color={Colors.text.black} />
                        </Pressable>


                    </View>


                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="never"
                        showsVerticalScrollIndicator={false}
                        style={styles.body}>


                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.headerText}>Vehicle Details</Text>
                        </View>


                        <View style={styles.infoCont}>
                            <Text style={styles.mobileLabel}>Vehicle Type</Text>
                            <Text style={styles.headerDesc}>Select the type of truck you use for deliveries.</Text>
                            <Pressable onPress={openBottomSheet} style={{ ...styles.mobileTextInputContainer, borderColor: vehicle_type_err ? Colors.error : Colors.borderColor }}>
                                <Text style={styles.placeHolderText}>{vehicleType ? vehicleType : "Select Truck"}</Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.text.gray} />
                            </Pressable>
                            {vehicle_type_err && <View style={styles.errorBox}>
                                <Text style={styles.errorText}>Select your vehicle type</Text>
                            </View>}
                        </View>



                        <View style={styles.infoCont}>
                            <Text style={styles.mobileLabel}>Vehicle Load Capacity (tonnes)</Text>
                            <View style={{ ...styles.mobileTextInputContainer, borderColor: vehicle_capacity_err ? Colors.error : inputFocus == "vehicle_capacity" ? Colors.primary : Colors.borderColor }}>
                                <TextInput
                                    value={vehicleCapacity}
                                    onChangeText={setVehicleCapacity}

                                    placeholder='2 tonnes'
                                    keyboardType="decimal-pad"
                                    style={styles.mobileTextInput}
                                    onFocus={() => setInputFocus("vehicle_capacity")}
                                    onBlur={() => setInputFocus(null)}

                                />
                            </View>
                            {vehicle_capacity_err && <View style={styles.errorBox}>
                                <Text style={styles.errorText}>Enter vehicle load capacity</Text>
                            </View>}
                        </View>



                        <View style={styles.infoCont}>
                            <Text style={styles.mobileLabel}>Vehicle Plate Number</Text>
                            <View style={{ ...styles.mobileTextInputContainer, borderColor: vehicle_plate_no_err ? Colors.error : inputFocus == "plate_number" ? Colors.primary : Colors.borderColor }}>
                                <TextInput
                                    value={plateNumber}
                                    onChangeText={setPlateNumber}

                                    placeholder='LND-123AB'
                                    keyboardType="default"
                                    style={styles.mobileTextInput}
                                    onFocus={() => setInputFocus("plate_number")}
                                    onBlur={() => setInputFocus(null)}

                                />
                            </View>
                            {vehicle_plate_no_err && <View style={styles.errorBox}>
                                <Text style={styles.errorText}>Plate number cannot be empty</Text>
                            </View>}
                        </View>



                        <View>
                            <View  style={{ ...styles.pictureVehicleCont, borderColor: (vehicle_photo_empty_err || vehicle_photo_length_err) ? Colors.error : Colors.borderColor }}>
                                <View style={{ ...styles.pictureVehicleHeader, borderBottomColor: (vehicle_photo_empty_err || vehicle_photo_length_err) ? Colors.error : Colors.borderColor }}>
                                    <View style={styles.vehicleIcon}>
                                        <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                    </View>
                                    <View>
                                        <Text style={{ ...styles.mobileLabel, marginBottom: 5 }}>Vehicle Photo</Text>
                                    </View>
                                    {vehiclePhotos.length == 1 ? <Pressable onPress={selectVehiclePhotos} style={styles.editBtn}> 
                                                    <AntDesign name="plus" size={18} color={Colors.text.black} />
                                    </Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />}
                                </View>
                                <View>
                                    {
                                        vehiclePhotos.length >= 1 ? <FlatList
                                            scrollEnabled={false}
                                            data={vehiclePhotos}
                                            contentContainerStyle={{ columnGap: "10%" }}
                                            numColumns={2}
                                            renderItem={({ item }: { item: vehiclePhotoType }) => (
                                                <View style={{ width: "50%", height: 150, padding: 10 }}>

                                                    <View style={{ flex: 1, }}>
                                                        <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%", borderRadius: 10 }} resizeMode="cover" />
                                                        {vehiclePhotos.length >= 1 && <Pressable onPress={() => deleteVehiclePhotos(item)} style={{ ...styles.bottomSheetCloseIconCont, backgroundColor: "rgba(0,0,0,0.8)", position: "absolute", top: 15, left: 10 }}>
                                                            <AntDesign name="close" size={16} color={Colors.text.white} />
                                                        </Pressable>}
                                                    </View>

                                                </View>
                                            )}

                                        /> :
                                       <Pressable style={{flex: 1}} onPress={selectVehiclePhotos}>
                                        <View  style={styles.addVehicleIcon}>
                                                <AntDesign name="plus" size={24} color={Colors.text.black} />
                                            </View>
                                        </Pressable>
                                            
                                    }
                                </View>
                            </View>

                            {(vehicle_photo_empty_err || vehicle_photo_length_err) && <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{vehicle_photo_empty_err ? "Enter your vehicle photos" : "Upload 2 photos of your vehicle, Front and Side View"}</Text>
                            </View>}

                        </View>


                        <View>
                            <View style={{ ...styles.pictureVehicleCont, borderColor: driver_license_photo_err ? Colors.error : Colors.borderColor }}>
                                <View style={{ ...styles.pictureVehicleHeader, borderBottomColor: driver_license_photo_err ? Colors.error : Colors.borderColor }}>
                                    <View style={styles.vehicleIcon}>
                                        <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                    </View>
                                    <View>
                                        <Text style={{ ...styles.mobileLabel, marginBottom: 5 }}>Vehicle License Photo</Text>
                                    </View>
                                    {vehicleLicensePhoto ? <Pressable onPress={() => setVehicleLicensePhoto("")} style={styles.editBtn}>
                                        <MaterialCommunityIcons name="delete-outline" size={22} color={Colors.text.gray} />
                                    </Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />
                                    }
                                </View>
                                <View>
                                    {vehicleLicensePhoto ? <View>
                                        <Image source={{ uri: vehicleLicensePhoto }} style={{ width: "100%", height: 150, borderBottomLeftRadius: 10, borderBottomRightRadius: 10}} resizeMode="cover" />
                                    </View> : <Pressable style={{flex: 1}} onPress={selectVehicleLicensePhoto}>
                                        <View  style={styles.addVehicleIcon}>
                                                <AntDesign name="plus" size={24} color={Colors.text.black} />
                                            </View>
                                        </Pressable>}
                                </View>

                            </View>
                            {driver_license_photo_err && <View style={styles.errorBox}>
                                <Text style={styles.errorText}>Upload photo of your driver license</Text>
                            </View>}

                        </View>



                       


                    </ScrollView>
                    <View style={{paddingVertical: 10}}>
                          <Pressable onPress={continueToSubmitScreen} style={styles.nextBtn}>
                            <Text style={styles.continueText}>Continue</Text>
                        </Pressable>
                    </View>
                    

                </KeyboardAvoidingView>

                <VehicleInfoBottomSheet vehicleTypeBottomSheetRef={vehicleTypeBottomSheetRef} isVehicleBottomSheetOpen={isVehicleBottomSheetOpen} setIsVehicleBottomSheetOpen={setIsVehicleBottomSheetOpen} selectVehicleType={selectVehicleType} parentVehicleType={vehicleType} />
                <PhotoBottomSheet bottomSheetRef={bottomSheetRef} photoType={photoType} setPhotoType={setPhotoType} setVehiclePhotos={setVehiclePhotos} setVehicleLicensePhoto={setVehicleLicensePhoto} />

            </SafeAreaView>
       </SafeAreaProvider>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight,
    },
    body: {
        flex: 1,

    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text.black

    },
    mobileTextInputContainer: {

        marginTop: 10,
        width: "100%",
        height: 50,
        borderWidth: 1,
        backgroundColor: Colors.borderBackground,
        borderRadius: 50,
        flexDirection: "row",
        alignItems: "center",
        borderColor: Colors.borderColor,
        paddingHorizontal: 15
    },
    infoCont: {
        marginTop: 20
    },
    mobileLabel: {
        fontSize: 14,
        color: Colors.text.black,
        fontWeight: "600"
    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 5,
        color: Colors.text.gray,

    },
    placeHolderText: {
        color: Colors.text.gray,
        fontWeight: "500",
        marginRight: "auto"

    },
    mobileTextInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,



    },
    pictureVehicleCont: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.borderColor,

        borderRadius: 10
    },
    pictureVehicleHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomColor: Colors.borderColor,
        borderBottomWidth: 1,
        paddingVertical: 5,
        paddingHorizontal: 5

    },
    vehicleIcon: {
        width: 35,
        height: 35,
        borderRadius: 35,
        borderColor: Colors.borderColor,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 35,
        height: 35,
        borderRadius: 35,
        backgroundColor: Colors.backBtnGray,

    },
    addVehicleIcon: {
        width: 70,
        height: 70,
        borderRadius: 70,
        backgroundColor: Colors.backBtnGray,
        marginVertical: 20,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    nextBtn: {
        height: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
       
    },
    continueText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },

    bottomSheetCloseIconCont: {
        width: 30,
        height: 30,
        borderRadius: 30,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    bottomSheetHeaderCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    selectRegionModalCont: {
        width: "80%",
        padding: 15,
        backgroundColor: Colors.background,
        borderRadius: 10

    },
    checkBox: {
        marginRight: 10
    },
    regionContView: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: Colors.borderColor
    },
    regionText: {
        fontSize: 16,
        fontWeight: "500"
    },
    takePhotoBtns: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 10
    },
    takePhotoBtnText: {
        color: Colors.text.black,
        fontWeight: "600",
        fontSize: 16
    },
    errorBox: {
        marginTop: 10,
        width: "100%",
        padding: 10,
        backgroundColor: Colors.errorBackground,
        borderRadius: 12

    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        fontWeight: "500"
    },


})