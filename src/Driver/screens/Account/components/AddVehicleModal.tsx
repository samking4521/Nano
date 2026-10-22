import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, FontAwesome, FontAwesome6, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import DatePicker from 'react-native-date-picker'
import { vehicleType } from '../../../../../assets/truck_data'
import VehicleInfoBottomSheet from '../../../../Onboarding/screens/components/vehicleInfoBottomSheet'
import { FONT_SIZES, FONTS, SPACING } from '../../../../constants/theme/font'
import { formatDate } from '../../../../utils/formatDate'
import VehiclePhotoBottomSheet from './VehiclePhotoBottomSheet'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import * as Crypto from 'expo-crypto';
import { DRIVER_DOCUMENT_TYPE } from '../../../../constants/driver'
import { uploadToStorage } from '../../../../utils/imageUploader'
import { getVehicleImgUrl, vehicles_data_type } from '../screens/Vehicle'

export type vehiclePhotoType = {
    id: string,
    uri: string,
    type: "loading" | "uri";
}

export type photoType = "vehicle" | "vehicle_reg_cert";


type inputFocusType = "vehicle_capacity" | "plate_number" | "vehicle_year";

type vehicleModalProps = {
    setOpenAddVehicleModal: React.Dispatch<React.SetStateAction<boolean>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setVehicles: React.Dispatch<React.SetStateAction<vehicles_data_type[]>>
}


export default function AddVehicleModal({ setOpenAddVehicleModal, setShowLoadingSpinner, setVehicles }: vehicleModalProps) {
    const session = useAuthStore((store) => store.session);
    const [plateNumber, setPlateNumber] = useState("");
    const [vehicleYear, setVehicleYear] = useState("");
    const [inputFocus, setInputFocus] = useState<inputFocusType | null>(null);
    const [vehicleCapacity, setVehicleCapacity] = useState("");
    const [vehiclePhotos, setVehiclePhotos] = useState<vehiclePhotoType[]>([])
    const [open, setOpen] = useState(false)
    const [vehicleRegExpiryDate, setVehicleRegExpiryDate] = useState<Date>(new Date());
    const [datePicked, setDatePicked] = useState(false);
    const [vehicleLicensePhoto, setVehicleLicensePhoto] = useState<vehiclePhotoType | null>(null);
    const [openVehiclePhotoBottomSheet, setOpenVehiclePhotoBottomSheet] = useState<photoType | null>(null);
    const [vehicleType, setVehicleType] = useState<vehicleType>("");
    const [isVehicleBottomSheetOpen, setIsVehicleBottomSheetOpen] = useState<boolean>(false);
    const [clickedContinue, setClickedContinue] = useState(false);

    const selectVehicleType = (truck: vehicleType) => {
        setVehicleType(truck);
    }

    const vehicle_type_err = clickedContinue && !vehicleType;
    const vehicle_plate_no_err = clickedContinue && plateNumber.trim() == "";
    const vehicle_year_err = clickedContinue && vehicleYear.trim() == "";
    const vehicle_capacity_err = clickedContinue && vehicleCapacity.trim() == "";
    const vehicle_photo_empty_err = clickedContinue && vehiclePhotos.length == 0;
    const vehicle_photo_length_err = clickedContinue && (vehiclePhotos.length < 2 || vehiclePhotos.length > 2);
    const driver_license_photo_err = clickedContinue && !vehicleLicensePhoto;
    const vehicleRegExpiryDate_err = clickedContinue && !datePicked;


    const addVehiclePhotos = (value: photoType) => {
        setOpenVehiclePhotoBottomSheet(value)
    }


    const uploadVehicleData = async () => {
        try {
            const vehicleId = Crypto.randomUUID();


            const imagesUriArr = vehiclePhotos.map((img) => img.uri);
            console.log("imagesUriArr: ", imagesUriArr);

            const path = `vehicle/active/${DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE.toLowerCase()}/${vehicleId}/vehicleLicense.jpeg`;

            await Promise.all([
                Promise.all(
                    imagesUriArr.map((uri, index) =>
                        uploadToStorage(
                            "vehicle-photos",
                            `vehicle/active/${vehicleId}/vehiclePhoto_${index + 1}.jpeg`,
                            uri
                        )
                    )
                ),

                uploadToStorage(
                    "vehicle-documents",
                    path,
                    vehicleLicensePhoto?.uri as string
                )

            ])


            const { data, error } = await supabase
                .from("Vehicle")
                .insert({
                    id: vehicleId,
                    owner_driver_id: session?.user.id,
                    plate_number: plateNumber,
                    vehicle_type: vehicleType,
                    vehicle_capacity: vehicleCapacity,
                    vehicle_year: vehicleYear,
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Error uploading vehicle info: ${error.message}`)
            }

            console.log("Success: Vehicle info uploaded successfully");

            const { error: err_vehicle_verification } = await supabase
                .from("Vehicle_Verification")
                .insert({
                    vehicle_id: data.id,
                    verification_status: VERIFICATION_STATUS.PENDING,
                })

            if (err_vehicle_verification) {
                throw new Error(`Error uploading Vehicle Verification info: ${err_vehicle_verification.message}`)
            }

            console.log("Success: Vehicle verification info uploaded");

            const vehicle_photos_keys_obj = {
                key_1: `vehicle/active/${data.id}/vehiclePhoto_1.jpeg`,
                key_2: `vehicle/active/${data.id}/vehiclePhoto_2.jpeg`
            }

            const { error: err_vehicle_photos } = await supabase
                .from("Vehicle_Photos")
                .insert({
                    vehicle_id: data.id,
                    vehicle_photos_keys: vehicle_photos_keys_obj
                })

            if (err_vehicle_photos) {
                throw new Error(`Error uploading vehicle photos: ${err_vehicle_photos.message}`)
            }

            console.log("Success: Vehicle photos uploaded to db");

            const regImgpath = `vehicle/active/${DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE.toLowerCase()}/${data.id}/vehicleLicense.jpeg`;


            const { error: err_vehicle_docs } = await supabase
                .from("Vehicle_Documents")
                .insert({
                    vehicle_id: data.id,
                    document_type: DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE,
                    expiry_date: vehicleRegExpiryDate.toISOString().slice(0, 10),
                    document_number: plateNumber,
                    document_img_key: regImgpath
                })

            if (err_vehicle_docs) {
                throw new Error(`Error uploading vehicle documents - Registration certificate: ${err_vehicle_docs.message}`)
            }

            console.log("Success: Vehicle documents uploaded successfully");

            const { data: select_vehicle, error: error_select_vehicle } = await supabase
                .from("Vehicle")
                .select(
                            `
                                *,
                                Vehicle_Verification(verification_status),
                            Vehicle_Verification_Issues(count),
                                Vehicle_Photos(*),
                                Vehicle_Documents(status)
                              `
                )
                .eq("id", vehicleId)
                .maybeSingle();

            if (error_select_vehicle) {
                throw new Error(`Error querying vehicle: ${error_select_vehicle.message}`)
            }


            const vehicleData = {
                ...select_vehicle,
                url: await getVehicleImgUrl(select_vehicle.Vehicle_Photos.vehicle_photos_keys.key_1)
            }

            setVehicles((prev) => [...prev, vehicleData]);

            setShowLoadingSpinner(false);


        } catch (error) {
            console.log("Error: ", error);
            setShowLoadingSpinner(false);
            Alert.alert(
                "Vehicle Upload Failed",
                "We couldn't add your vehicle right now. Please try again.",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Try Again",
                        onPress: () => {
                            setShowLoadingSpinner(true);
                            uploadVehicleData()
                        }
                    },
                ]
            );
        }
    }


    const uploadVehicle = async () => {
        setClickedContinue(true);

        const hasErrors = [
            !vehicleType,
            plateNumber.trim() == "",
            vehicleYear.trim() == "",
            vehicleCapacity.trim() == "",
            vehiclePhotos.length == 0,
            (vehiclePhotos.length < 2 || vehiclePhotos.length > 2),
            !vehicleLicensePhoto,
            !datePicked
        ].some(Boolean);

        if (hasErrors) return;


        setOpenAddVehicleModal(false);
        setShowLoadingSpinner(true);
        uploadVehicleData();

    };


    const openBottomSheet = () => {
        setIsVehicleBottomSheetOpen(true)
    }


    const closeVehicleModal = () => {
        setOpenAddVehicleModal(false);
    }

    const removeVehiclePhotos = (id: string) => {
        const newOrderPhotos = vehiclePhotos.filter((imgObj) => imgObj.id != id)
        setVehiclePhotos(newOrderPhotos);
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
                                <Pressable onPress={openBottomSheet} style={[styles.mobileTextInputContainer, { borderColor: vehicle_type_err ? Colors.error : Colors.borderColor }]}>
                                    <Text style={[styles.placeHolderText, { color: vehicleType ? Colors.text.gray : Colors.text.placeholder }]}>{vehicleType ? vehicleType : "Select Truck"}</Text>
                                    <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.text.gray} />
                                </Pressable>
                                {vehicle_type_err && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>Select your vehicle type</Text>
                                </View>}
                            </View>



                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Vehicle Load Capacity (tonnes)</Text>
                                <View style={[styles.mobileTextInputContainer, { borderColor: vehicle_capacity_err ? Colors.error : inputFocus == "vehicle_capacity" ? Colors.primary : Colors.borderColor }]}>
                                    <TextInput
                                        value={vehicleCapacity}
                                        onChangeText={setVehicleCapacity}
                                        placeholder='2 tonnes'
                                        keyboardType="decimal-pad"
                                        placeholderTextColor={Colors.text.placeholder}
                                        selectionColor={Colors.primary}
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
                                <View style={[styles.mobileTextInputContainer, { borderColor: vehicle_plate_no_err ? Colors.error : inputFocus == "plate_number" ? Colors.primary : Colors.borderColor }]}>
                                    <TextInput
                                        value={plateNumber}
                                        onChangeText={setPlateNumber}
                                        placeholder='LND-123AB'
                                        keyboardType="default"
                                        placeholderTextColor={Colors.text.placeholder}
                                        selectionColor={Colors.primary}
                                        style={styles.mobileTextInput}
                                        onFocus={() => setInputFocus("plate_number")}
                                        onBlur={() => setInputFocus(null)}
                                    />
                                </View>
                                {vehicle_plate_no_err && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>Plate number cannot be empty</Text>
                                </View>}
                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Vehicle Production Year</Text>
                                <View style={[styles.mobileTextInputContainer, { borderColor: vehicle_year_err ? Colors.error : inputFocus == "vehicle_year" ? Colors.primary : Colors.borderColor }]}>
                                    <TextInput
                                        value={vehicleYear}
                                        onChangeText={setVehicleYear}
                                        placeholder='e.g 2008'
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors.text.placeholder}
                                        selectionColor={Colors.primary}
                                        style={styles.mobileTextInput}
                                        onFocus={() => setInputFocus("vehicle_year")}
                                        onBlur={() => setInputFocus(null)}

                                    />
                                </View>
                                {vehicle_year_err && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>Vehicle year cannot be empty</Text>
                                </View>}
                            </View>




                            <View>
                                <View style={[styles.pictureVehicleCont, { borderColor: (vehicle_photo_empty_err || vehicle_photo_length_err) ? Colors.error : Colors.borderColor }]}>
                                    <View style={[styles.pictureVehicleHeader, { borderBottomColor: (vehicle_photo_empty_err || vehicle_photo_length_err) ? Colors.error : Colors.borderColor }]}>
                                        <View style={styles.vehicleIcon}>
                                            <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                        </View>
                                        <View>
                                            <Text style={styles.mobileLabel}>Vehicle Photo</Text>
                                        </View>
                                        {vehiclePhotos.length == 1 ? <Pressable onPress={() => addVehiclePhotos("vehicle")} style={styles.editBtn}>
                                            <AntDesign name="plus" size={18} color={Colors.text.black} />
                                        </Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />}
                                    </View>
                                    <View>
                                        {
                                            vehiclePhotos.length >= 1 ?
                                                <View style={[styles.vehicleImageCont, { justifyContent: vehiclePhotos.length > 1 ? "center" : "flex-start" }]}>
                                                    {vehiclePhotos.map((item: vehiclePhotoType) => {
                                                        return (
                                                            item.type == "loading" ?
                                                                <View key={item.id} style={styles.addPhotoCont}>
                                                                    <View>
                                                                        <FontAwesome6 name="image" size={24} color={Colors.text.gray} style={{ opacity: 0.5 }} />
                                                                    </View>

                                                                    <View style={styles.compressingImageSpinner}>
                                                                        <ActivityIndicator color={Colors.background} />

                                                                    </View>
                                                                </View>
                                                                :
                                                                <View key={item.id} style={styles.addPhotoCont}>
                                                                    <Image source={{ uri: item.uri }} style={styles.vehicleImg} />
                                                                    <Pressable onPress={() => removeVehiclePhotos(item.id)} style={styles.removeImgBtn}>
                                                                        <AntDesign name="close" size={14} color={Colors.text.white} />
                                                                    </Pressable>
                                                                </View>
                                                        )
                                                    })}
                                                </View>


                                                :
                                                <Pressable style={{ flex: 1 }} onPress={() => addVehiclePhotos("vehicle")}>
                                                    <View style={styles.addVehicleIcon}>
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


                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Vehicle Reg Expiry Date</Text>
                                <TouchableOpacity onPress={() => setOpen(true)} style={{ ...styles.mobileTextInputContainer, flexDirection: "row", alignItems: "center", borderColor: vehicleRegExpiryDate_err ? Colors.error : Colors.borderColor, paddingHorizontal: 10 }}>
                                    <Text style={[styles.vehicleRegExpiry, { color: (datePicked) ? Colors.text.gray : Colors.text.placeholder }]}>{(datePicked) ? formatDate(vehicleRegExpiryDate) : "Enter vehicle reg expiry date"}</Text>
                                    <FontAwesome name="calendar" size={22} color={Colors.primary} />
                                    {
                                        open && <DatePicker
                                            modal
                                            mode="date"
                                            open={open}
                                            date={vehicleRegExpiryDate}
                                            onConfirm={(date) => {
                                                setOpen(false)
                                                setVehicleRegExpiryDate(date)
                                                setDatePicked(true)
                                            }}
                                            onCancel={() => {
                                                setOpen(false)
                                            }}
                                        />
                                    }
                                </TouchableOpacity>

                                {(vehicleRegExpiryDate_err) && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{vehicleRegExpiryDate_err && "Vehicle Reg expiry date cannot be empty"}</Text>
                                </View>}
                            </View>

                            <View>
                                <View style={{ ...styles.pictureVehicleCont, borderColor: driver_license_photo_err ? Colors.error : Colors.borderColor }}>
                                    <View style={{ ...styles.pictureVehicleHeader, borderBottomColor: driver_license_photo_err ? Colors.error : Colors.borderColor }}>
                                        <View style={styles.vehicleIcon}>
                                            <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                        </View>
                                        <View>
                                            <Text style={{ ...styles.mobileLabel, marginBottom: 5 }}>Vehicle Registration Certificate</Text>
                                        </View>
                                        {vehicleLicensePhoto ? <Pressable onPress={() => setVehicleLicensePhoto(null)} style={styles.editBtn}>
                                            <MaterialCommunityIcons name="delete-outline" size={22} color={Colors.text.gray} />
                                        </Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />
                                        }
                                    </View>
                                    <View>
                                        {vehicleLicensePhoto ?
                                            vehicleLicensePhoto.type == "loading" ?
                                                <View key={vehicleLicensePhoto.id} style={styles.addVehicleLicenseLoadingPhotoCont}>
                                                    <View>
                                                        <FontAwesome6 name="image" size={24} color={Colors.text.gray} style={{ opacity: 0.5 }} />
                                                    </View>

                                                    <View style={styles.compressingImageSpinner}>
                                                        <ActivityIndicator color={Colors.background} />

                                                    </View>
                                                </View>
                                                :
                                                <View>
                                                    <Image source={{ uri: vehicleLicensePhoto.uri }} style={{ width: "100%", height: 150, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }} resizeMode="contain" />
                                                </View> : <Pressable style={{ flex: 1 }} onPress={() => addVehiclePhotos("vehicle_reg_cert")}>
                                                <View style={styles.addVehicleIcon}>
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
                        <View style={{ paddingVertical: 10 }}>
                            <Pressable onPress={uploadVehicle} style={styles.nextBtn}>
                                <Text style={styles.continueText}>Continue</Text>
                            </Pressable>
                        </View>


                    </KeyboardAvoidingView>

                    {isVehicleBottomSheetOpen && <VehicleInfoBottomSheet
                        isVehicleBottomSheetOpen={isVehicleBottomSheetOpen}
                        setIsVehicleBottomSheetOpen={setIsVehicleBottomSheetOpen}
                        selectVehicleType={selectVehicleType}
                        parentVehicleType={vehicleType}
                    />}

                    {openVehiclePhotoBottomSheet && <VehiclePhotoBottomSheet openVehiclePhotoBottomSheet={openVehiclePhotoBottomSheet} setOpenVehiclePhotoBottomSheet={setOpenVehiclePhotoBottomSheet} setVehiclePhotos={setVehiclePhotos} setVehicleLicensePhoto={setVehicleLicensePhoto} />}

                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
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
        fontSize: FONT_SIZES.sm,
        color: Colors.text.black,
        fontFamily: FONTS.medium
    },
    headerDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        marginTop: SPACING.xs,
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
        color: Colors.text.gray,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
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
    vehicleRegExpiry: {
        marginRight: "auto",
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        color: Colors.text.gray
    },
    vehicleImageCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 10
    },
    addPhotoCont: {
        width: "45%",
        height: 120,
        backgroundColor: Colors.boxBackground,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 10,
    },
    compressingImageSpinner: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    vehicleImg: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 10
    },
    removeImgBtn: {
        width: 30,
        height: 30,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "rgba(0,0,0,0.6)"
    },
    addVehicleLicenseLoadingPhotoCont: {
        width: "100%",
        height: 150,
        backgroundColor: Colors.boxBackground,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 10,
    },
    fillScreen: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center"
    },


})