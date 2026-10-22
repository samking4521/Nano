import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import { Colors } from '../../../../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import VehiclePhotoDesc from '../../../../Onboarding/screens/components/vehiclePhotoDesc'
import * as ImagePicker from 'expo-image-picker';
import { CompressToLimit } from '../../../../utils/imageCompressor'
import { pendingVehicleImgType, vehicleImgType, vehicleInfoPhotoType } from '../screens/VehicleInfo'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { useDriverStore } from '../../../store/DriverStore'
import { uploadToStorage } from '../../../../utils/imageUploader'


type UpdateVehicleInfoPhotoBottomSheetProps = {
    openVehicleInfoPhotoBottomSheet: vehicleInfoPhotoType | null
    setOpenVehicleInfoPhotoBottomSheet: React.Dispatch<React.SetStateAction<vehicleInfoPhotoType | null>>
    vehiclePhotos: vehicleImgType[]
    setVehiclePhotos: React.Dispatch<React.SetStateAction<vehicleImgType[]>>
    vehicleId: string
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    onUpdateVehicle: (vehicleData: any) => void
    onUpdateVehicleImg: (vehicleImg: any) => void
    set_pending_vehicle_photos_keys: React.Dispatch<React.SetStateAction<pendingVehicleImgType>>
    pending_vehicle_photos_keys: pendingVehicleImgType
    vehicleVerificationStatus: VERIFICATION_STATUS | undefined
    setVehicleVerificationStatus: React.Dispatch<React.SetStateAction<VERIFICATION_STATUS | undefined>>
    onUpdateVehicleVerificationStatus: (verification_status: VERIFICATION_STATUS) => void
    setVehicleInfoVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
    onUpdateVehicleInfoVerificationIssues: (verification_issues: any[] | null) => void
}

export default function UpdateVehicleInfoPhotoBottomSheet({ openVehicleInfoPhotoBottomSheet, setOpenVehicleInfoPhotoBottomSheet, vehiclePhotos, setVehiclePhotos, vehicleId, setShowLoadingSpinner, setShowErrorAlert, onUpdateVehicle, onUpdateVehicleImg, set_pending_vehicle_photos_keys, pending_vehicle_photos_keys, vehicleVerificationStatus, setVehicleInfoVerificationIssues, setVehicleVerificationStatus, onUpdateVehicleVerificationStatus, onUpdateVehicleInfoVerificationIssues }: UpdateVehicleInfoPhotoBottomSheetProps) {
    const pendingVehicleUpdate = useDriverStore((store) => store.pendingVehicleUpdate);
    const setPendingVehicleUpdate = useDriverStore((store) => store.setPendingVehicleUpdate);

    const snapPoints = useMemo(() => ['90%'], []);

    const uploadPendingVehiclePhoto = async (uri: string) => {
        const pendingVehiclePhotoPath = `vehicle/pending/${vehicleId}/vehiclePhoto_${openVehicleInfoPhotoBottomSheet == "photo_1" ? 1 : 2}.jpeg`;

        await uploadToStorage(
            "vehicle-photos",
            pendingVehiclePhotoPath,
            uri
        );

        const { error } = await supabase
            .from("Vehicle_Photos")
            .update({
                pending_vehicle_photos_keys: {
                    ...pending_vehicle_photos_keys,
                    [openVehicleInfoPhotoBottomSheet === "photo_1" ? "key_1" : "key_2"]: pendingVehiclePhotoPath,
                }, pending_vehicle_photos_keys_at: new Date().toISOString()
            })
            .eq("vehicle_id", vehicleId)

        if (error) {
            throw new Error(`Error updating vehicle photos: ${error.message}`);
        }

        const {
            error: vehicle_verification_issue_delete_error,
        } = await supabase
            .from("Vehicle_Verification_Issues")
            .delete()
            .eq("vehicle_id", vehicleId)
            .eq(
                "field",
                openVehicleInfoPhotoBottomSheet === "photo_1" ? VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_FRONT_PHOTO : VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_SIDE_PHOTO
            );

        if (vehicle_verification_issue_delete_error) {
            throw new Error(
                `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
            );
        }

        await getVehicleVerificationIssues();


        if (openVehicleInfoPhotoBottomSheet === "photo_1") {
            set_pending_vehicle_photos_keys(prev => (
                ({
                    ...prev,
                    key_1: pendingVehiclePhotoPath
                })
            ))


            onUpdateVehicle({
                Vehicle_Photos: {
                    pending_vehicle_photos_keys: {
                        key_1: pendingVehiclePhotoPath,
                        key_2: pending_vehicle_photos_keys.key_2
                    }
                }
            })

        } else {
            set_pending_vehicle_photos_keys(prev =>
            ({
                ...prev,
                key_2: pendingVehiclePhotoPath
            })
            )
            onUpdateVehicle({
                Vehicle_Photos: {
                    pending_vehicle_photos_keys: {
                        key_1: pending_vehicle_photos_keys.key_1,
                        key_2: pendingVehiclePhotoPath
                    }
                }
            })
        }




    }


    const uploadVehiclePhoto = async (uri: string) => {

        const vehicleImgPath = `vehicle/active/${vehicleId}/vehiclePhoto_${openVehicleInfoPhotoBottomSheet == "photo_1" ? 1 : 2}.jpeg`;

        await uploadToStorage(
            "vehicle-photos",
            vehicleImgPath,
            uri
        );




        const {
            error: vehicle_verification_issue_delete_error,
        } = await supabase
            .from("Vehicle_Verification_Issues")
            .delete()
            .eq("vehicle_id", vehicleId)
            .eq(
                "field",
                VERIFICATION_ISSUES_FIELD.VEHICLE_PHOTOS
            );

        if (vehicle_verification_issue_delete_error) {
            throw new Error(
                `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
            );
        }



        const vehicle_verification_issues = await getVehicleVerificationIssues();

        let isUpdatedToPending = false;

        if (vehicle_verification_issues.length == 0) {
            const { error } = await supabase
                .from("Vehicle_Verification")
                .update({ verification_status: VERIFICATION_STATUS.PENDING })
                .eq("vehicle_id", vehicleId)

            if (error) {
                throw new Error(`Error updating vehicle verification status: ${error.message}`);
            }

            isUpdatedToPending = true;

            setVehicleVerificationStatus(VERIFICATION_STATUS.PENDING);
            onUpdateVehicleVerificationStatus(VERIFICATION_STATUS.PENDING);
            setPendingVehicleUpdate({
                vehicleId: vehicleId,
                vehicleVerificationStatus: VERIFICATION_STATUS.PENDING,
                vehicleInfoVerificationIssues: vehicle_verification_issues.length,
                vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
                vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
                vehicle_year: pendingVehicleUpdate?.vehicle_year,
                vehicle_type: pendingVehicleUpdate?.vehicle_type,
                vehicle_url: pendingVehicleUpdate?.vehicle_url,
                vehicleDocumentVerificationStatus: pendingVehicleUpdate?.vehicleDocumentVerificationStatus,
                vehicleDocumentVerificationIssues: pendingVehicleUpdate?.vehicleDocumentVerificationIssues,
            })

        }

        if (openVehicleInfoPhotoBottomSheet == "photo_1") {
            const imgs = [{
                url: uri
            }, {
                url: vehiclePhotos[vehiclePhotos.length - 1].url
            }]

            setVehiclePhotos(imgs)
            onUpdateVehicleImg(imgs)
            setPendingVehicleUpdate({
                vehicleId: vehicleId,
                vehicle_url: uri,
                vehicleVerificationStatus: isUpdatedToPending ? VERIFICATION_STATUS.PENDING : vehicleVerificationStatus,
                vehicleInfoVerificationIssues: vehicle_verification_issues.length,
                vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
                vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
                vehicle_year: pendingVehicleUpdate?.vehicle_year,
                vehicle_type: pendingVehicleUpdate?.vehicle_type,
                vehicleDocumentVerificationStatus: pendingVehicleUpdate?.vehicleDocumentVerificationStatus,
                vehicleDocumentVerificationIssues: pendingVehicleUpdate?.vehicleDocumentVerificationIssues,
            })
        } else {
            const imgs = [{
                url: vehiclePhotos[0].url
            }, {
                url: uri
            }]
            setVehiclePhotos(imgs)
            onUpdateVehicleImg(imgs)
        }


    }

    const getVehicleVerificationIssues = async () => {
        const {
            data: vehicle_verification_issues,
            error: vehicle_verification_issues_error,
        } = await supabase
            .from("Vehicle_Verification_Issues")
            .select("*")
            .eq("vehicle_id", vehicleId)
            .eq("section", VERIFICATION_ISSUES_SECTION.VEHICLE_INFO);

        if (vehicle_verification_issues_error) {
            throw new Error(
                `Error querying vehicle verification issues: ${vehicle_verification_issues_error.message}`
            );
        }

        setVehicleInfoVerificationIssues(vehicle_verification_issues);
        onUpdateVehicleInfoVerificationIssues(vehicle_verification_issues);

        setPendingVehicleUpdate({
            vehicleId: vehicleId,
            vehicleInfoVerificationIssues: vehicle_verification_issues.length,
            vehicleVerificationStatus: vehicleVerificationStatus,
            vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
            vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
            vehicle_year: pendingVehicleUpdate?.vehicle_year,
            vehicle_type: pendingVehicleUpdate?.vehicle_type,
            vehicle_url: pendingVehicleUpdate?.vehicle_url,
            vehicleDocumentVerificationStatus: pendingVehicleUpdate?.vehicleDocumentVerificationStatus,
            vehicleDocumentVerificationIssues: pendingVehicleUpdate?.vehicleDocumentVerificationIssues,
        })

        return vehicle_verification_issues;

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
            allowsMultipleSelection: false,
            allowsEditing: false,
            aspect: undefined,
            quality: 0.8,
        });

        if (result.canceled) {
            return null;
        } else {

            return result.assets[0]

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
            closeBottomSheet();

            if (image) {
                setShowLoadingSpinner(true);
                const compressedImage = await CompressToLimit(image.uri, {
                    maxSizeBytes: 2 * 1024 * 1024,
                });

                console.log("compressed Image: ", compressedImage);

                if (vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED) {
                    await uploadPendingVehiclePhoto(compressedImage.uri)
                } else {
                    await uploadVehiclePhoto(compressedImage.uri);
                }

            }

            setShowLoadingSpinner(false);


        } catch (error) {
            console.log("error mesage: ", error);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }


    };


    const handleGallery = async () => {

        try {
            const image = await pickImageFromGallery();
            closeBottomSheet();
            if (image) {
                setShowLoadingSpinner(true);
                const compressedImage = await CompressToLimit(image.uri, {
                    maxSizeBytes: 2 * 1024 * 1024,
                });

                console.log("compressed Image: ", compressedImage);


                if (vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED) {

                    await uploadPendingVehiclePhoto(compressedImage.uri);


                } else {

                    await uploadVehiclePhoto(compressedImage.uri);

                }
            }

            setShowLoadingSpinner(false);

        } catch (error) {
            console.log("error mesage: ", error);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);

        }

    };


    const closeBottomSheet = () => {
        setOpenVehicleInfoPhotoBottomSheet(null);
    }

    return (
        <BottomSheet
            style={{ flex: 1 }}
            containerStyle={{ backgroundColor: true ? "rgba(0,0,0,0.5)" : undefined }}
            handleIndicatorStyle={{ display: "none" }}
            handleComponent={() => null}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enableContentPanningGesture={false}
        >


            <View style={styles.bottomSheetContHeader}>
                <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={() => setOpenVehicleInfoPhotoBottomSheet(null)}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>

            <BottomSheetScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                style={styles.bottomSheetCont}
                showsVerticalScrollIndicator={false}

            >
                <View style={styles.bottomSheetViewCont}>
                    <VehiclePhotoDesc />
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