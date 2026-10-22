import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import VehiclePhotoDesc from '../../../../Onboarding/screens/components/vehiclePhotoDesc'
import { Colors } from '../../../../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { useMemo } from 'react';
import { photoType, vehiclePhotoType } from './AddVehicleModal';
import { CompressToLimit } from '../../../../utils/imageCompressor';
import VehicleLicenseDesc from '../../../../Onboarding/screens/components/vehicleLicenseDesc';

type VehiclePhotoBottomSheetProps = {
    openVehiclePhotoBottomSheet: photoType | null
    setOpenVehiclePhotoBottomSheet: React.Dispatch<React.SetStateAction<photoType | null>>
    setVehiclePhotos: React.Dispatch<React.SetStateAction<vehiclePhotoType[]>>
    setVehicleLicensePhoto: React.Dispatch<React.SetStateAction<vehiclePhotoType | null>>
}

let idCounter = 0
const genId = () => `route_${idCounter++}_${Date.now()}`


export default function VehiclePhotoBottomSheet({ openVehiclePhotoBottomSheet, setOpenVehiclePhotoBottomSheet, setVehiclePhotos, setVehicleLicensePhoto }: VehiclePhotoBottomSheetProps) {
    const snapPoints = useMemo(() => ['90%'], []);

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
            allowsMultipleSelection: openVehiclePhotoBottomSheet == "vehicle" ? true : false,
            allowsEditing: false,
            aspect: undefined,
            quality: 0.8,
        });

        if (result.canceled) {
            return null;
        } else {

            return result.assets

        }

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
            allowsEditing: false,
            aspect: undefined,
            quality: 0.8,
        });

        if (result.canceled) return null;

        return result.assets[0];
    };

    const handleCamera = async () => {
        try {
            const image = await takePhoto();

            if (!image) {
                setOpenVehiclePhotoBottomSheet(null);
                return
            }
            if (openVehiclePhotoBottomSheet == "vehicle") {
                setVehiclePhotos((prev) => [...prev, { id: genId(), type: "loading" as const, uri: "" }]);

            }else {
                setVehicleLicensePhoto({ id: genId(), type: "loading" as const, uri: "" })
            }
            setOpenVehiclePhotoBottomSheet(null);

            const compressedOrderImage = await CompressToLimit(image.uri, {
                maxSizeBytes: 2 * 1024 * 1024,
            });

            console.log("order Image compressed: ", compressedOrderImage);
            if(openVehiclePhotoBottomSheet == "vehicle"){
                     setVehiclePhotos((prev) => {
                const realImgs = prev.filter((prevImg) => prevImg.type != "loading");
                return [...realImgs, {
                    id: genId(),
                    type: "uri" as const,
                    uri: compressedOrderImage.uri
                }]
            });
            }else{
                setVehicleLicensePhoto({ 
                    id: genId(), 
                    type: "uri" as const, 
                    uri: compressedOrderImage.uri
                })
            }
           
        } catch (error) {
            setOpenVehiclePhotoBottomSheet(null);
            Alert.alert(
                'Camera Unavailable',
                'Unable to open the camera. Please try again.',
            );
        }
    };

    const handleGallery = async () => {
        try {
            const image = await pickImageFromGallery();
            if (!image) {
                setOpenVehiclePhotoBottomSheet(null);
                return
            }
            const loadingImages = Array.from({ length: image.length }, (_, i) => ({ id: genId(), type: "loading" as const, uri: "" }))
          if (openVehiclePhotoBottomSheet == "vehicle") {
                setVehiclePhotos((prev) => [...prev, ...loadingImages]);

            }else {
                setVehicleLicensePhoto({ id: genId(), type: "loading" as const, uri: "" })
            }
            setOpenVehiclePhotoBottomSheet(null);

            const compressedImageArr = await Promise.all(
                image.map(async (item) =>
                    CompressToLimit(item.uri, {
                        maxSizeBytes: 2 * 1024 * 1024,
                    })
                )
            );

            console.log("compressed Images: ", compressedImageArr);

            const uriImages = compressedImageArr.map((item) => item.uri);

            const orderPhotos = uriImages.map((uri) => (
                {
                    id: genId(),
                    type: "uri" as const,
                    uri: uri
                }
            ))

            if(openVehiclePhotoBottomSheet == "vehicle"){
                     setVehiclePhotos((prev) => {
                const realImgs = prev.filter((prevImg) => prevImg.type != "loading");
                return [...realImgs, ...orderPhotos]
            });
            }else {
                    setVehicleLicensePhoto(orderPhotos[0]);
            }

        } catch (error) {
            setOpenVehiclePhotoBottomSheet(null);
            Alert.alert(
                'Gallery Unavailable',
                'Unable to open the gallery. Please try again.',
            );
        }
    };




    return (
        <BottomSheet
            style={{ flex: 1 }}
            containerStyle={{ backgroundColor: openVehiclePhotoBottomSheet ? "rgba(0,0,0,0.5)" : undefined }}
            handleIndicatorStyle={{ display: "none" }}
            handleComponent={() => null}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enableContentPanningGesture={false}
        >


            <View style={styles.bottomSheetContHeader}>
                <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={() => setOpenVehiclePhotoBottomSheet(null)}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>

            <BottomSheetScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                style={styles.bottomSheetCont}
                showsVerticalScrollIndicator={false}

            >
                <View style={styles.bottomSheetViewCont}>
                    {openVehiclePhotoBottomSheet == "vehicle" ? <VehiclePhotoDesc /> : <VehicleLicenseDesc />}
                    <View style={{ paddingBottom: 50 }}>
                        <TouchableOpacity onPress={handleCamera} style={styles.takePhotoBtns}>
                            <Text style={styles.takePhotoBtnText}>Capture with Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleGallery} style={{ ...styles.takePhotoBtns, marginTop: 20 }}>
                            <Text style={styles.takePhotoBtnText}>Take from gallery</Text>
                        </TouchableOpacity>
                    </View>


                </View>

            </BottomSheetScrollView>


        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    bottomSheetCont: {
        height: "100%",
    },
    bottomSheetViewCont: {
        flex: 1,
        paddingHorizontal: 15,
        marginTop: 15
    },
    takePhotoBtns: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 50,

    },
    takePhotoBtnText: {
        color: Colors.text.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.md
    },
    bottomSheetContHeader: {
        paddingHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.borderColor,
        paddingTop: 15,
        paddingBottom: 10
    },
    closeText: {
        color: Colors.text.gray,
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        alignSelf: "flex-end",

    }
})