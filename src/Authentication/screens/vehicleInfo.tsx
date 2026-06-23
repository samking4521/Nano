import { Alert, Dimensions, FlatList, Image, ImageSourcePropType, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Entypo, Feather, FontAwesome, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons'
import ProgressLevel from './components/progressLevel'
import { Colors } from '../../constants/colors'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import { RouteProp, useNavigation } from '@react-navigation/native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';


type VehicleInfoNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "VehicleInfo">;
type VehicleInfoRouteProp = RouteProp<
    RootAuthStackParamList,
    "VehicleInfo"
>;

type Props = {
    route: VehicleInfoRouteProp;
};

type bottomSheetType = "base_location" | "vehicle_type" | "photos" | "license";


const initialPreferredRegion = {
    withinCity: false,
    interCity: false,
    interState: false,
    openToAnyRoute: false,
};

type vehicleDataType = {
    image: ImageSourcePropType,
    name: vehicleType,
}

const vehicleTypeData: vehicleDataType[] = [
    {
        image: require("../../../assets/truck_types/pickup_truck.png"),
        name: "Pickup Truck",

    },
    {
        image: require("../../../assets/truck_types/flatbed_truck.png"),
        name: "Flatbed Truck",

    },
    {
        image: require("../../../assets/truck_types/tipper_truck.png"),
        name: "Tipper Truck",

    },
    {
        image: require("../../../assets/truck_types/box_truck.png"),
        name: "Box Truck",

    },
    {
        image: require("../../../assets/truck_types/van_truck.png"),
        name: "Van Truck",

    },
    {
        image: require("../../../assets/truck_types/container_truck.png"),
        name: "Container Truck",

    }
]

const VehicleType = ({ item, index, vehicleType, selectVehicleType }: { item: vehicleDataType, index: number, vehicleType: vehicleType | null, selectVehicleType: (truck: vehicleType | null) => void }) => {
    return (
        <Pressable onPress={() => selectVehicleType(item.name)} style={{ borderRadius: 10, flex: 1, height: 200, borderWidth: vehicleType == item.name ? 2 : 0.5, justifyContent: "center", alignItems: "center", borderColor: vehicleType == item.name ? Colors.primary : Colors.text.gray }}>
            <Image source={item.image} style={{ width: "100%", height: 100 }} resizeMode="contain" />
            <Text style={styles.headerDesc}>{item.name}</Text>
            <MaterialCommunityIcons style={{ position: "absolute", top: 10, left: 10 }} size={24} color={vehicleType == item.name ? Colors.primary : Colors.text.gray} name={vehicleType == item.name ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} />
        </Pressable>
    )
}

type vehiclePhotoType = {
    id: string,
    asset: ImagePicker.ImagePickerAsset
}

type vehicleType = "Pickup Truck" | "Flatbed Truck" | "Tipper Truck" | "Box Truck" | "Van Truck" | "Container Truck";

export default function VehicleInfo({route}: Props) {
    const { mobileNo, email, role, country } = route.params;
    const [plateNumber, setPlateNumber] = useState("");
    const [inputFocus, setInputFocus] = useState<"plate_number" | null>(null);
    const [openBottomSheet, setOpenBottomSheet] = useState<bottomSheetType | null>(null);
    const [vehicleBaseCity, setVehicleBaseCity] = useState<string | null>("Oko oba");
    const [vehicleBaseState, setVehicleBaseState] = useState<string | null>("Lagos");
    const [vehiclePhotos, setVehiclePhotos] = useState<vehiclePhotoType[]>([]);
    const [vehicleLicensePhotos, setVehicleLicensePhotos] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [vehicleType, setVehicleType] = useState<vehicleType | null>(null);
    const [editVehiclePhotos, setEditVehiclePhotos] = useState(false);
    const [preferredRegion, setPreferredRegion] = useState(initialPreferredRegion);
    const navigation = useNavigation<VehicleInfoNavigationProp>();
     const [clickedContinue, setClickedContinue] = useState(false);

    const DATA_LEVEL = useRef(2);
    const DETAILS_LEVEL = DATA_LEVEL.current

    const snapPoints = useMemo(() => [(openBottomSheet == "photos" || openBottomSheet == "license") ? '30%' : '90%'], [openBottomSheet]);

    const selectVehicleType = (truck: vehicleType | null) => {
        setVehicleType(truck);
    }

    const goToPreviousScreen = () => {
        navigation.goBack()
    }

    const closeBottomSheet = () => {
        setOpenBottomSheet(null);
    }

    const shouldSelectRegionBtnClick = preferredRegion.withinCity || preferredRegion.interCity || preferredRegion.interState || preferredRegion.openToAnyRoute;


    const cancelSelectRegionModal = () => {
        setPreferredRegion({ ...initialPreferredRegion });
        setModalVisible(false);
    }

    const submitSelectRegionForm = () => {
        if (!shouldSelectRegionBtnClick) {
            return
        }
        setModalVisible(false);
    }

    const selectPrefferedRegion = (key: keyof typeof preferredRegion) => {
        setPreferredRegion(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const getPreferredRegionText = () => {
        if (preferredRegion.openToAnyRoute) {
            return "Open to Any Route";
        }

        const selected = [];

        if (preferredRegion.withinCity) selected.push("Within City");
        if (preferredRegion.interCity) selected.push("Inter City");
        if (preferredRegion.interState) selected.push("Inter State");

        if (selected.length === 0) {
            return "Select preferred region";
        }

        if (selected.length <= 2) {
            return selected.join(", ");
        }

        return `${selected.slice(0, 2).join(", ")} +${selected.length - 2} more`;
    };

    const closeVehicleTypeBottomSheet = () => {
        setVehicleType(null);
        setOpenBottomSheet(null);
    }

    const submitVehicleType = () => {
        setOpenBottomSheet(null);
    }

    async function pickImageFromGallery() {
        if (Platform.OS === 'ios') {
            const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                if (canAskAgain) {
                    const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (newStatus !== 'granted') return null;
                } else {
                    Alert.alert(
                        'Photos Permission Required',
                        'Please enable photo access in your device settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );
                    return null;
                }
            }
        } else {
            // Android: launch handles the prompt, only intercept if permanently denied
            const { canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (!canAskAgain) {
                Alert.alert(
                    'Photos Permission Required',
                    'Please enable photo access in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
                return null;
            }
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            aspect: undefined,
            quality: 0.8,
            allowsMultipleSelection: openBottomSheet == "photos" ? true : undefined,
            selectionLimit: openBottomSheet == "photos" ? 4 : undefined
        });

        if (result.canceled) return null;

        return result.assets;
    }

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            if (!permission.canAskAgain) {
                Alert.alert(
                    'Camera Permission Required',
                    'Please enable camera access in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
            }
            return null;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,


        });

        if (result.canceled) return null;

        return result.assets;
    };

    const handleCamera = async () => {
        try {
            const image = await takePhoto();

            if (image) {
                if (openBottomSheet == "photos") {
                    const the_Image = image.map((assets) => ({
                        id: Crypto.randomUUID(),
                        asset: assets
                    }))
                    setVehiclePhotos((prev) => [...prev, ...the_Image])
                } else {
                    setVehicleLicensePhotos(image[0])
                }

            }
            setOpenBottomSheet(null);
        } catch (error) {
            Alert.alert(
                'Camera Unavailable',
                'Unable to open the camera. Please try again.',
            );
            setOpenBottomSheet(null);
            return null
        }


    };


    const handleGallery = async () => {
        try {
            const image_arr = await pickImageFromGallery();

            if (image_arr) {

                if (openBottomSheet == "photos") {
                    const images = image_arr.map((assets) => ({
                        id: Crypto.randomUUID(),
                        asset: assets
                    }))
                    setVehiclePhotos((prev) => [...prev, ...images])
                } else {
                    setVehicleLicensePhotos(image_arr[0])
                }


            }
            setOpenBottomSheet(null);
        } catch (error) {
            console.error(error)
            Alert.alert(
                'Gallery Unavailable',
                'Unable to open the gallery. Please try again.',
            );
            setOpenBottomSheet(null);
            return null

        }

    };



    const selectVehiclePhotos = () => {
        if (vehiclePhotos.length >= 1) {
            console.log("mea")
            return;
        }
        setOpenBottomSheet("photos")
    }

    const selectDriverLicensePhoto = () => {
        if (vehicleLicensePhotos) {
            return
        }
        setOpenBottomSheet("license")
    }

    const deleteVehiclePhotos = (img: vehiclePhotoType) => {
        const filteredImg = vehiclePhotos.filter((item) => item.id != img.id);
        setVehiclePhotos([...filteredImg])

    }


    const renderItem = ({ item, index }: { item: vehicleDataType, index: number }) => {
        return <VehicleType item={item} index={index} selectVehicleType={selectVehicleType} vehicleType={vehicleType} />
    }

const base_location_err  = clickedContinue && (!vehicleBaseCity || !vehicleBaseState); 
const preffered_region_err       = clickedContinue && (!preferredRegion.interCity && !preferredRegion.interState && !preferredRegion.withinCity && !preferredRegion.openToAnyRoute);
const vehicle_type_err      = clickedContinue && !vehicleType;
const vehicle_plate_no_err   = clickedContinue && plateNumber.trim() == "";
const vehicle_photo_empty_err    = clickedContinue && vehiclePhotos.length == 0;
const vehicle_photo_length_err         = clickedContinue && (vehiclePhotos.length < 4 || vehiclePhotos.length >4);
const driver_license_photo_err     = clickedContinue && !vehicleLicensePhotos;



const continueToPaymentInfo = () => {
    setClickedContinue(true);
   
    const hasErrors = [
       (!vehicleBaseCity || !vehicleBaseState),
       (!preferredRegion.interCity && !preferredRegion.interState && !preferredRegion.withinCity && !preferredRegion.openToAnyRoute),
        !vehicleType,
        plateNumber.trim() == "",
        vehiclePhotos.length == 0,
        vehiclePhotos.length < 4,
        !vehicleLicensePhotos
    ].some(Boolean);

    if (hasErrors) return;

    navigation.navigate("PaymentInfo", {
        mobileNo: mobileNo,
        email: email,
        role: role,
        country: country,
    });
};

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1, paddingHorizontal: 15, }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                
            >
                <View style={styles.headerContainer}>
                    <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                        <Feather name="arrow-left" size={22} color={Colors.text.black} />
                    </Pressable>
                    <Text style={styles.headerText}>Details</Text>
                    <View style={{ ...styles.backBtn, backgroundColor: undefined }}>
                    </View>
                </View>


                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="never"
                    showsVerticalScrollIndicator={false}
                    style={styles.body}>

                    <ProgressLevel progressLevel={DETAILS_LEVEL} />

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.headerText}>Vehicle Details</Text>
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Base Location</Text>
                        <Text style={styles.headerDesc}>Where is this truck usually located and available for jobs?</Text>
                        <Pressable onPress={() => setOpenBottomSheet("base_location")} style={{...styles.mobileTextInputContainer, borderColor: base_location_err? Colors.error : Colors.borderColor}}>
                            <Text style={styles.placeHolderText}>{(vehicleBaseCity || vehicleBaseState) ? `${vehicleBaseCity}, ${vehicleBaseState}` : "Select location"}</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.text.gray} />
                        </Pressable>
                        {base_location_err && <View style={styles.errorBox}>
                                                    <Text style={styles.errorText}>Select your base location</Text>
                                                </View>}
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Preffered Region</Text>
                        <Text style={styles.headerDesc}>Enter your preferred operating areas to move goods. This helps us match you, but you may still get other available trips.</Text>
                        <Pressable onPress={() => setModalVisible(true)} style={{...styles.mobileTextInputContainer, borderColor: preffered_region_err? Colors.error : Colors.borderColor}}>
                            <Text style={styles.placeHolderText}>{getPreferredRegionText()}</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.text.gray} />
                        </Pressable>
                         {preffered_region_err && <View style={styles.errorBox}>
                                                    <Text style={styles.errorText}>Select your preffered region</Text>
                                                </View>}
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Vehicle Type</Text>
                        <Text style={styles.headerDesc}>Select the type of truck you use for deliveries.</Text>
                        <Pressable onPress={() => setOpenBottomSheet("vehicle_type")} style={{...styles.mobileTextInputContainer, borderColor: vehicle_type_err? Colors.error : Colors.borderColor}}>
                            <Text style={styles.placeHolderText}>{vehicleType ? vehicleType : "Select Truck"}</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.text.gray} />
                        </Pressable>
                         {vehicle_type_err && <View style={styles.errorBox}>
                                                    <Text style={styles.errorText}>Select your vehicle type</Text>
                                                </View>}
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Vehicle Plate Number</Text>
                        <View style={{ ...styles.mobileTextInputContainer, borderColor: vehicle_plate_no_err? Colors.error :  inputFocus ? Colors.primary : Colors.borderColor }}>
                            <TextInput
                                value={plateNumber}
                                onChangeText={setPlateNumber}

                                placeholder='IKJ-200.....'
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
                        <Pressable onPress={selectVehiclePhotos} style={{...styles.pictureVehicleCont, borderColor: (vehicle_photo_empty_err || vehicle_photo_length_err)? Colors.error : Colors.borderColor}}>
                            <View style={{...styles.pictureVehicleHeader, borderBottomColor: (vehicle_photo_empty_err || vehicle_photo_length_err)? Colors.error : Colors.borderColor}}>
                                <View style={styles.vehicleIcon}>
                                    <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                </View>
                                <View>
                                    <Text style={{ ...styles.mobileLabel, marginBottom: 5 }}>Vehicle Photos</Text>
                                    <Text style={styles.headerDesc}>Upload 4 clear photos {"\n"}showing all sides of your vehicle {"\n"}(front, back, left, and right).</Text>
                                </View>
                                {vehiclePhotos.length >= 1 ? <Pressable onPress={() => setEditVehiclePhotos(true)} style={styles.editBtn}><Text>Edit</Text></Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />}
                            </View>
                            <View>
                                {
                                    vehiclePhotos.length >= 1 ? <FlatList
                                        scrollEnabled={false}
                                        data={[...vehiclePhotos,]}
                                        contentContainerStyle={{ columnGap: "10%" }}
                                        numColumns={2}
                                        renderItem={({ item }: { item: vehiclePhotoType }) => (
                                            <View style={{ width: "50%", height: 150, padding: 10 }}>

                                                <View style={{ flex: 1, }}>
                                                    <Image source={{ uri: item.asset.uri }} style={{ width: "100%", height: "100%", borderRadius: 10 }} resizeMode="cover" />
                                                    {editVehiclePhotos && <Pressable onPress={() => deleteVehiclePhotos(item)} style={{ ...styles.bottomSheetCloseIconCont, backgroundColor: "rgba(0,0,0,0.8)", position: "absolute", top: 15, left: 10 }}>
                                                        <AntDesign name="close" size={16} color={Colors.text.white} />
                                                    </Pressable>}
                                                </View>

                                            </View>
                                        )}

                                        ListFooterComponent={() => {
                                            if (vehiclePhotos.length >= 4) {
                                                return <></>
                                            }
                                            return (
                                                <View style={{ width: "50%", height: 150, padding: 10 }}>
                                                    <Pressable onPress={() => setOpenBottomSheet("photos")} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderWidth: 1, borderStyle: "dashed", borderRadius: 10, backgroundColor: Colors.background }}>
                                                        <View style={{
                                                            width: 70,
                                                            height: 70,
                                                            borderRadius: 70,
                                                            backgroundColor: Colors.backBtnGray,
                                                            marginBottom: 10,
                                                            justifyContent: "center",
                                                            alignItems: "center"
                                                        }}>
                                                            <AntDesign name="plus" size={24} color={Colors.text.black} />
                                                        </View>
                                                        <Text style={styles.headerDesc}>Add more</Text>
                                                    </Pressable>
                                                </View>

                                            )
                                        }}
                                    /> :

                                        <View style={styles.addVehicleIcon}>
                                            <AntDesign name="plus" size={24} color={Colors.text.black} />
                                        </View>
                                }
                            </View>
                        </Pressable>

                        {(vehicle_photo_empty_err || vehicle_photo_length_err) && <View style={styles.errorBox}>
                                                    <Text style={styles.errorText}>{vehicle_photo_empty_err? "Enter your vehicle photos" : "Upload 4 photos of your vehicle"}</Text>
                                                </View>}

                    </View>


                    <View>
                        <Pressable onPress={selectDriverLicensePhoto} style={{...styles.pictureVehicleCont, borderColor: driver_license_photo_err? Colors.error : Colors.borderColor}}>
                            <View style={{...styles.pictureVehicleHeader, borderBottomColor: driver_license_photo_err? Colors.error : Colors.borderColor}}>
                                <View style={styles.vehicleIcon}>
                                    <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                </View>
                                <View>
                                    <Text style={{ ...styles.mobileLabel, marginBottom: 5 }}>Driver License Photo</Text>
                                    <Text style={styles.headerDesc}>upload a clear driver license {"\n"}photo for verification.</Text>
                                </View>
                                {vehicleLicensePhotos ? <Pressable onPress={() => setVehicleLicensePhotos(null)} style={styles.editBtn}>
                                    <MaterialCommunityIcons name="delete-outline" size={22} color={Colors.text.gray} />
                                </Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />
                                }
                            </View>
                            <View>
                                {vehicleLicensePhotos ? <View>
                                    <Image source={{ uri: vehicleLicensePhotos.uri }} style={{ width: "100%", height: 200 }} resizeMode="cover" />
                                </View> : <View style={styles.addVehicleIcon}>
                                    <AntDesign name="plus" size={24} color={Colors.text.black} />
                                </View>}
                            </View>

                        </Pressable>
                              {driver_license_photo_err && <View style={styles.errorBox}>
                                                    <Text style={styles.errorText}>Upload photo of your driver license</Text>
                                                </View>}

                    </View>



                    <Pressable onPress={continueToPaymentInfo}  style={styles.nextBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>



                </ScrollView>

            </KeyboardAvoidingView>
            {openBottomSheet && <Pressable onPress={closeBottomSheet} style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" }} />}

            {openBottomSheet && <BottomSheet

                handleIndicatorStyle={{ display: "none" }}
                index={1}
                snapPoints={snapPoints}
                onClose={closeBottomSheet}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: Colors.background }}
            >
                <BottomSheetView style={styles.bottomSheetCont}>
                    {openBottomSheet == "base_location" ? <View style={styles.bottomSheetViewCont}>

                        <View style={styles.bottomSheetHeaderCont}>
                            <Pressable onPress={closeBottomSheet} style={styles.bottomSheetCloseIconCont}>
                                <AntDesign name="close" size={16} color={Colors.text.gray} />
                            </Pressable>
                            <View>
                                <Text style={styles.headerText}>Base Location</Text>
                            </View>
                            <View style={{ ...styles.bottomSheetCloseIconCont, backgroundColor: undefined }} />
                        </View>
                        <GooglePlacesAutocomplete
                            placeholder="Search location"
                            fetchDetails={true}
                            onPress={(data, details = null) => {
                                console.log("Place:", data.description);

                                const location = details?.geometry?.location;
                                console.log("Lat:", location?.lat);
                                console.log("Lng:", location?.lng);
                            }}
                            query={{
                                key: "AIzaSyDHKtAMnx-yofvk_9eqEjX_djl6WDN18y4",
                                language: "en",

                            }}
                            styles={{
                                textInput: {
                                    height: 50,
                                    borderWidth: 1,
                                    borderColor: "#ccc",
                                    borderRadius: 50,
                                    paddingHorizontal: 10,
                                },
                            }}
                        />
                    </View>

                        :

                        openBottomSheet == "vehicle_type" ?
                            <View style={{ ...styles.bottomSheetViewCont, paddingHorizontal: undefined }}>

                                <View style={{ ...styles.bottomSheetHeaderCont, paddingHorizontal: 15 }}>
                                    <Pressable onPress={closeVehicleTypeBottomSheet} style={styles.bottomSheetCloseIconCont}>
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
                                            paddingBottom: 100
                                        }}
                                        columnWrapperStyle={{
                                            paddingHorizontal: 10,
                                            gap: 10,

                                        }}
                                        ListFooterComponent={() => <Pressable onPress={submitVehicleType} style={{ ...styles.nextBtn, width: "80%", alignSelf: "center", backgroundColor: vehicleType ? Colors.primary : Colors.backBtnGray }}>
                                            <Text style={styles.continueText}>Continue</Text>
                                        </Pressable>}

                                    />
                                </View>

                            </View>

                            :
                            <View style={styles.bottomSheetViewCont}>
                                <TouchableOpacity onPress={handleCamera} style={styles.takePhotoBtns}>
                                    <Text style={styles.takePhotoBtnText}>Capture with Camera</Text>
                                    <Feather name="camera" size={24} color={Colors.text.gray} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleGallery} style={{ ...styles.takePhotoBtns, marginTop: 20 }}>
                                    <Text style={styles.takePhotoBtnText}>Take from gallery</Text>
                                    <MaterialCommunityIcons name="view-gallery-outline" size={24} color={Colors.text.gray} />
                                </TouchableOpacity>

                            </View>

                    }
                </BottomSheetView>
            </BottomSheet>}

            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)} animationType="slide" >
                <View style={styles.modalContainer}>
                    <View style={styles.selectRegionModalCont}>
                        <View style={styles.bottomSheetHeaderCont}>
                            <Pressable onPress={cancelSelectRegionModal} style={styles.bottomSheetCloseIconCont}>
                                <AntDesign name="close" size={16} color={Colors.text.gray} />
                            </Pressable>
                            <View>
                                <Text style={styles.headerText}>Select Region</Text>
                            </View>
                            <View style={{ ...styles.bottomSheetCloseIconCont, backgroundColor: undefined }} />
                        </View>

                        <TouchableOpacity onPress={() => selectPrefferedRegion("withinCity")} style={styles.regionContView}>
                            <MaterialCommunityIcons
                                name={preferredRegion.withinCity ? "checkbox-marked" : "checkbox-blank-outline"}
                                size={28}
                                color={preferredRegion.withinCity ? Colors.primary : Colors.text.gray}
                                style={styles.checkBox}
                            />
                            <Text style={styles.regionText}>Within city only</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => selectPrefferedRegion("interCity")} style={styles.regionContView}>
                            <MaterialCommunityIcons
                                name={preferredRegion.interCity ? "checkbox-marked" : "checkbox-blank-outline"}
                                size={28}
                                color={preferredRegion.interCity ? Colors.primary : Colors.text.gray}
                                style={styles.checkBox}
                            />
                            <Text style={styles.regionText}>Inter-city (city to city)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => selectPrefferedRegion("interState")} style={styles.regionContView}>
                            <MaterialCommunityIcons
                                name={preferredRegion.interState ? "checkbox-marked" : "checkbox-blank-outline"}
                                size={28}
                                color={preferredRegion.interState ? Colors.primary : Colors.text.gray}

                                style={styles.checkBox}
                            />
                            <Text style={styles.regionText}>Interstate (state to state)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => selectPrefferedRegion("openToAnyRoute")} style={{ ...styles.regionContView, borderBottomWidth: undefined }}>
                            <MaterialCommunityIcons
                                name={preferredRegion.openToAnyRoute ? "checkbox-marked" : "checkbox-blank-outline"}
                                size={28}
                                color={preferredRegion.openToAnyRoute ? Colors.primary : Colors.text.gray}

                                style={styles.checkBox}
                            />
                            <Text style={styles.regionText}>Open to any route</Text>
                        </TouchableOpacity>

                        <Pressable onPress={submitSelectRegionForm} style={{ ...styles.nextBtn, backgroundColor: shouldSelectRegionBtnClick ? Colors.primary : Colors.backBtnGray }}>
                            <Text style={styles.continueText}>Continue</Text>
                        </Pressable>


                    </View>

                </View>
            </Modal>

        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    body: {
        flex: 1,
        paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight,
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
        paddingVertical: 10,
        paddingHorizontal: 5

    },
    vehicleIcon: {
        width: 30,
        height: 30,
        borderRadius: 30,
        borderColor: Colors.borderColor,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 40,
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
        marginTop: 30
    },
    continueText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },
    bottomSheetCont: {
        height: "100%"

    },
    bottomSheetViewCont: {
        flex: 1,
        paddingHorizontal: 15,

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