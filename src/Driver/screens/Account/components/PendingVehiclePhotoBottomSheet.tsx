import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { pendingVehicleImgType, vehicleInfoPhotoType } from '../screens/VehicleInfo'
import { supabase } from '../../../../lib/supabase'
import { deleteFileIfExists } from '../../../../utils/deletePhoto'
import { VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder'

type PendingVehiclePhotoBottomSheetProps = {
    setOpenPendingVehiclePhotoBottomSheet: React.Dispatch<React.SetStateAction<vehicleInfoPhotoType | null>>
    pending_vehicle_photos_keys: pendingVehicleImgType
    openPendingVehiclePhotoBottomSheet: vehicleInfoPhotoType
    setOpenVehicleInfoPhotoBottomSheet: React.Dispatch<React.SetStateAction<vehicleInfoPhotoType | null>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    vehicleId: string
    onUpdateVehicle: (vehicleData: any) => void
    set_pending_vehicle_photos_keys: React.Dispatch<React.SetStateAction<pendingVehicleImgType>>
    pending_vehicle_front_photo_issues_code: string | undefined
    pending_vehicle_side_photo_issues_code: string | undefined
    setVehicleInfoVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
    onUpdateVehicleInfoVerificationIssues: (verification_issues: any[] | null) => void
}

export default function PendingVehiclePhotoBottomSheet({ setOpenPendingVehiclePhotoBottomSheet, pending_vehicle_photos_keys, openPendingVehiclePhotoBottomSheet, setOpenVehicleInfoPhotoBottomSheet, setShowLoadingSpinner, setShowErrorAlert, vehicleId, onUpdateVehicle, set_pending_vehicle_photos_keys, pending_vehicle_front_photo_issues_code, pending_vehicle_side_photo_issues_code, setVehicleInfoVerificationIssues, onUpdateVehicleInfoVerificationIssues}: PendingVehiclePhotoBottomSheetProps) {
    const [pendingVehiclePhoto, setPendingVehiclePhoto] = useState<string | null>(null);

    const snapPoints = useMemo(() => ['90%'], []);


    const deletePendingVehiclePhoto = async () => {
        try {
            setOpenPendingVehiclePhotoBottomSheet(null);
            setShowLoadingSpinner(true);

            const { error } = await supabase
                .from("Vehicle_Photos")
                .update({
                    pending_vehicle_photos_keys: {
                        ...pending_vehicle_photos_keys,
                        [openPendingVehiclePhotoBottomSheet === "photo_1" ? "key_1" : "key_2"]: undefined,
                    }, pending_vehicle_photos_keys_at: null
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
                    openPendingVehiclePhotoBottomSheet === "photo_1" ? VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_FRONT_PHOTO : VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_SIDE_PHOTO
                );

            if (vehicle_verification_issue_delete_error) {
                throw new Error(
                    `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                );
            }

            await getVehicleInfoVerificationIssues();

            const pending_path = `vehicle/pending/${vehicleId}`
            const fileName = openPendingVehiclePhotoBottomSheet === "photo_1" ? "vehiclePhoto_1.jpeg" : "vehiclePhoto_2.jpeg";

            await deleteFileIfExists("vehicle-photos", pending_path, fileName, "Pending Vehicle Photo");


            if (openPendingVehiclePhotoBottomSheet === "photo_1") {
                set_pending_vehicle_photos_keys(prev => (
                    ({
                        ...prev,
                        key_1: undefined
                    })
                ))


                onUpdateVehicle({
                    Vehicle_Photos: {
                        pending_vehicle_photos_keys: {
                            key_1: undefined,
                            key_2: pending_vehicle_photos_keys.key_2
                        }
                    }
                })

            } else {
                set_pending_vehicle_photos_keys(prev =>
                ({
                    ...prev,
                    key_2: undefined
                })
                )
                onUpdateVehicle({
                    Vehicle_Photos: {
                        pending_vehicle_photos_keys: {
                            key_1: pending_vehicle_photos_keys.key_1,
                            key_2: undefined
                        }
                    }
                })
            }


            setShowLoadingSpinner(false);



        } catch (e) {
            console.log("error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }
    }


     const getVehicleInfoVerificationIssues = async () => {
        const { data: verification_issues_data, error: verification_issues_data_err } = await supabase
          .from("Vehicle_Verification_Issues")
          .select("*")
          .eq("vehicle_id", vehicleId)
          .eq("section", VERIFICATION_ISSUES_SECTION.VEHICLE_INFO);
    
        if (verification_issues_data_err) {
          throw new Error(`Error querying Verification Issues: ${verification_issues_data_err.message}`);
        }
    
        setVehicleInfoVerificationIssues(verification_issues_data);
        onUpdateVehicleInfoVerificationIssues(verification_issues_data)
      }

    const getPendingVehiclePhotoUrl = async () => {

        const imgKey = openPendingVehiclePhotoBottomSheet === "photo_1" ? pending_vehicle_photos_keys.key_1 : pending_vehicle_photos_keys.key_2;

        if (!imgKey) return;

        const { data: signedImage, error: signedImageError } =
            await supabase.storage
                .from("vehicle-photos")
                .createSignedUrl(imgKey, 60 * 60);

        if (signedImageError) {
            throw new Error(
                `Error creating pending vehicle image URL: ${signedImageError.message}`
            );
        }

        const imageUrl = signedImage.signedUrl;
        setPendingVehiclePhoto(imageUrl);
    }


    useEffect(() => {
        setPendingVehiclePhoto(null);
        getPendingVehiclePhotoUrl();
    }, [pending_vehicle_photos_keys])


    const updatePendingVehiclePhoto = () => {
        setOpenVehicleInfoPhotoBottomSheet(openPendingVehiclePhotoBottomSheet === "photo_1" ? "photo_1" : "photo_2")
    }


    const issuesText = openPendingVehiclePhotoBottomSheet === "photo_1" ? pending_vehicle_front_photo_issues_code : pending_vehicle_side_photo_issues_code;

    return (
        <BottomSheet
            style={{ flex: 1 }}
            handleIndicatorStyle={{ display: "none" }}
            handleComponent={() => null}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enableContentPanningGesture={false}
        >
            <BottomSheetView style={styles.body}>
                <View style={styles.bottomSheetContHeader}>
                    <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={() => setOpenPendingVehiclePhotoBottomSheet(null)}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.pendingPhotoCont}>
                    <Text style={styles.headerText}>Pending Vehicle Photo</Text>
                    <View style={styles.imageCont}>
                        {
                            !pendingVehiclePhoto ? <ImageLoadingPlaceHolder /> : <Image style={styles.pendingImage} source={{ uri: pendingVehiclePhoto }} />
                        }
                    </View>
                    <View style={styles.reviewCont}>
                        <Ionicons name="time-outline" size={20} color={Colors.primary} />
                        <Text style={styles.reviewText}>Under Review</Text>
                    </View>

                    <View style={{ gap: 10 }}>
                        <Text style={styles.reviewTextDesc}>Your vehicle photo is currently being reviewed. If approved, it will be updated within 24 hours.</Text>
                        {issuesText && <View style={styles.issueCont}>
                            <Text style={styles.issueText}>{issuesText}</Text>
                        </View>}
                    </View>

                    <TouchableOpacity onPress={updatePendingVehiclePhoto} style={[styles.takePhotoBtns, { marginTop: 20 }]}>
                        <Text style={styles.takePhotoBtnText}>Update photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={deletePendingVehiclePhoto} style={[styles.takePhotoBtns, { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: undefined }]}>
                        <Text style={[styles.takePhotoBtnText, { color: Colors.primary }]}>Delete photo</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetView>



        </BottomSheet>

    )
}

const styles = StyleSheet.create({
    body: {
        height: "100%"
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
    },
    imageCont: {
        width: 100,
        height: 100,
        borderRadius: BORDER_RADIUS.md
    },
    pendingImage: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.md,
        resizeMode: "cover"
    },
    pendingPhotoCont: {
        alignItems: "center",
        padding: 15,
        gap: 15
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        color: Colors.text.black,
        fontFamily: FONTS.semiBold
    },
    reviewCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: 10,
        paddingVertical: 5

    },
    reviewText: {
        color: Colors.primary,
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.md
    },
    reviewTextDesc: {
        color: Colors.text.gray,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        textAlign: "center"
    },
    takePhotoBtns: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: 10,
        height: 45,

    },
    takePhotoBtnText: {
        color: Colors.text.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.md
    },
    issueCont: {
        backgroundColor: Colors.errorBackground,
        borderRadius: BORDER_RADIUS.md,
        padding: 5,
        marginBottom: 5,
    },
    issueText: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        color: Colors.error,
        textAlign: "center"
    },
})