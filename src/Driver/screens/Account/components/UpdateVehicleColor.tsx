import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import { AntDesign } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import UpdateVehicleColorPhotoBottomSheet from './UpdateVehicleColorPhotoBottomSheet'
import { uploadToStorage } from '../../../../utils/imageUploader'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { deleteFileIfExists } from '../../../../utils/deletePhoto'
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder'

type UpdateVehicleColorProps = {
    setShowVehicleColorBottomSheet: React.Dispatch<React.SetStateAction<boolean>>
    vehicleId: string
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    set_pending_vehicle_color: React.Dispatch<React.SetStateAction<string | null>>
    onUpdateVehicle: (vehicleData: any) => void
    pendingLicensePhotoKey: string | null
    setPendingLicensePhotoKey: React.Dispatch<React.SetStateAction<string | null>>
    pending_vehicle_color: string | null
    vehicle_pending_color_issues_code: string | undefined
    vehicle_reg_pending_photo_issues_code: string | undefined
    onUpdatePendingVehicleLicenseImgKey: (vehicleLicensePhotoKey: string | null) => void
    setVehicleInfoVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
    onUpdateVehicleInfoVerificationIssues: (verification_issues: any[] | null) => void
}

export default function UpdateVehicleColor({ setShowVehicleColorBottomSheet, vehicleId, setShowErrorAlert, setShowLoadingSpinner, set_pending_vehicle_color, onUpdateVehicle, pendingLicensePhotoKey, setPendingLicensePhotoKey, pending_vehicle_color, vehicle_pending_color_issues_code, vehicle_reg_pending_photo_issues_code, onUpdatePendingVehicleLicenseImgKey, setVehicleInfoVerificationIssues, onUpdateVehicleInfoVerificationIssues }: UpdateVehicleColorProps) {
    const [vehicleColor, setVehicleColor] = useState(() => pending_vehicle_color ?? "");
    const [regPhoto, setRegPhoto] = useState<string | null>(pendingLicensePhotoKey ?? null);
    const [isImageCompressing, setIsImageCompressing] = useState(false);
    const [imageLoading, setImageLoading] = useState(!!pendingLicensePhotoKey);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [openVehicleLicensePhotoBottomSheet, setOpenVehicleLicensePhotoBottomSheet] = useState(false)
    const snapPoints = useMemo(() => ['90%'], []);

    const getPendingVehicleLicensePhotoUrl = async () => {
        const imgKey = pendingLicensePhotoKey;
        if (!imgKey) return;

        const { data: signedImage, error: signedImageError } =
            await supabase.storage
                .from("vehicle-documents")
                .createSignedUrl(imgKey, 60 * 60);

        if (signedImageError) {
            throw new Error(
                `Error creating pending vehicle license document URL: ${signedImageError.message}`
            );
        }

        const imageUrl = signedImage.signedUrl;
        setRegPhoto(imageUrl);
    }

    useEffect(() => {
        if (!pendingLicensePhotoKey) return

            getPendingVehicleLicensePhotoUrl();
    }, [pendingLicensePhotoKey])

          


    const isUpdatable = !!(vehicleColor.trim() !== "") && !!(regPhoto);

    const issuesPresent = !!vehicle_pending_color_issues_code || !!vehicle_reg_pending_photo_issues_code

    const updateVehicleColor = async () => {
        try {
            if (!isUpdatable) return
            setShowVehicleColorBottomSheet(false);
            setShowLoadingSpinner(true);

            const isNewPhoto = !!regPhoto && regPhoto.startsWith('file://');
            const vehicleRegImgPath = `vehicle/pending/vehicle_registration_certificate/${vehicleId}/vehicleLicense.jpeg`;
            if (isNewPhoto) {
                await uploadToStorage(
                    "vehicle-documents",
                    vehicleRegImgPath,
                    regPhoto
                );
            }


            const { error: vehicle_documents_update_err } = await supabase
                .from("Vehicle_Documents")
                .update({ pending_document_img_key: vehicleRegImgPath, pending_document_img_key_at: new Date().toISOString() })
                .eq("vehicle_id", vehicleId)

            if (vehicle_documents_update_err) {
                throw new Error(`Error updating vehicle documents: ${vehicle_documents_update_err.message}`);
            }

            const { error: vehicle_update_err } = await supabase
                .from("Vehicle")
                .update({ pending_vehicle_color: vehicleColor })
                .eq("id", vehicleId)

            if (vehicle_update_err) {
                throw new Error(`Error updating vehicle: ${vehicle_update_err.message}`);
            }



            const { error: vehicle_verification_issue_delete_error } =
                await supabase
                    .from("Vehicle_Verification_Issues")
                    .delete()
                    .eq("vehicle_id", vehicleId)
                    .in("field", [
                        VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_COLOR,
                        VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_PHOTO,
                    ]);

            if (vehicle_verification_issue_delete_error) {
                throw new Error(
                    `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                );
            }

            await getVehicleInfoVerificationIssues();

            set_pending_vehicle_color(vehicleColor);
            onUpdateVehicle({
                pending_vehicle_color: vehicleColor,
            });
            setPendingLicensePhotoKey(vehicleRegImgPath);
            onUpdatePendingVehicleLicenseImgKey(vehicleRegImgPath);
            setShowLoadingSpinner(false);

            Alert.alert(
                'Vehicle Color Updated',
                'Your vehicle color has been updated successfully. It will be reviewed and verified within 24 hours.',
                [
                    {
                        text: 'OK',
                        style: 'default',
                    },
                ]
            );


        } catch (e) {
            console.log('Error: ', e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }
    }


    const deletePendingVehicleColor = async () => {
        try {
            setShowVehicleColorBottomSheet(false);
            setShowLoadingSpinner(true);

            const { data: select_vehicle, error: error_select_vehicle } =
                await supabase
                    .from("Vehicle")
                    .select(
                        "pending_vehicle_color, Vehicle_Documents(pending_expiry_date)"
                    )
                    .eq("id", vehicleId)
                    .maybeSingle();


            if (error_select_vehicle) {
                throw new Error(`Error querying vehicle: ${error_select_vehicle.message}`);
            }

            if (select_vehicle?.pending_vehicle_color && select_vehicle.Vehicle_Documents[0].pending_expiry_date) {

                const { error: vehicle_update_err } = await supabase
                    .from("Vehicle")
                    .update({ pending_vehicle_color: null })
                    .eq("id", vehicleId)

                if (vehicle_update_err) {
                    throw new Error(`Error updating vehicle: ${vehicle_update_err.message}`);
                }

                const { error: vehicle_verification_issue_delete_error } =
                    await supabase
                        .from("Vehicle_Verification_Issues")
                        .delete()
                        .eq("vehicle_id", vehicleId)
                        .in("field", [
                            VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_COLOR,
                            VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_PHOTO,
                        ]);

                if (vehicle_verification_issue_delete_error) {
                    throw new Error(
                        `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                    );
                }

                await getVehicleInfoVerificationIssues();


            } else {
                const { error: vehicle_update_err } = await supabase
                    .from("Vehicle")
                    .update({ pending_vehicle_color: null })
                    .eq("id", vehicleId)

                if (vehicle_update_err) {
                    throw new Error(`Error updating vehicle: ${vehicle_update_err.message}`);
                }
                const { error: vehicle_documents_update_err } = await supabase
                    .from("Vehicle_Documents")
                    .update({ pending_document_img_key: null, pending_document_img_key_at: null })
                    .eq("vehicle_id", vehicleId)

                if (vehicle_documents_update_err) {
                    throw new Error(`Error updating vehicle documents: ${vehicle_documents_update_err.message}`);
                }

                const { error: vehicle_verification_issue_delete_error } =
                    await supabase
                        .from("Vehicle_Verification_Issues")
                        .delete()
                        .eq("vehicle_id", vehicleId)
                        .in("field", [
                            VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_COLOR,
                            VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_PHOTO,
                        ]);

                if (vehicle_verification_issue_delete_error) {
                    throw new Error(
                        `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                    );
                }

                await getVehicleInfoVerificationIssues();


                const vehicleRegImgPath = `vehicle/pending/vehicle_registration_certificate/${vehicleId}/vehicleLicense.jpeg`;


                await deleteFileIfExists("vehicle-documents", vehicleRegImgPath, "vehicleLicense.jpeg", "Pending Vehicle License Photo");

            }

            set_pending_vehicle_color(null);
            onUpdateVehicle({
                pending_vehicle_color: null,
            });
            setPendingLicensePhotoKey(null);
            onUpdatePendingVehicleLicenseImgKey(null);
            setShowLoadingSpinner(false);

        } catch (e) {
            console.log('Error: ', e);
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


    const descText = issuesPresent ? "There are issues with your vehicle color information. Fix the issues and resubmit for review." : pending_vehicle_color ? "Your vehicle color is currently under review and will be updated within 24 hours if approved." : "Enter your vehicle color and upload your vehicle registration photo for verification.";
    const descColor = issuesPresent ? Colors.error : pending_vehicle_color ? Colors.primary : Colors.text.gray;

    return (
        <>
            <BottomSheet
                index={0}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                enablePanDownToClose={false}
                enableOverDrag={false}
                backgroundStyle={{ backgroundColor: Colors.background }}
                handleIndicatorStyle={styles.handleIndicatorStyle}
                handleStyle={styles.handleStyle}
            >
                <BottomSheetView style={styles.body}>
                    <View>
                        <Pressable onPress={() => setShowVehicleColorBottomSheet(false)} style={styles.closeBtn}>
                            <AntDesign name="close" color={Colors.text.black} size={18} />
                        </Pressable>
                    </View>

                    <View style={{ gap: 5, marginBottom: 20 }}>
                        <Text style={styles.headerLabelText}>Edit Vehicle Color</Text>
                        <Text style={[styles.headerLabelDesc, { color: descColor }]}>{descText}</Text>
                    </View>

                    <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ gap: 10 }}>
                            <View style={styles.identityLabelInfoCont}>
                                <Text style={styles.identityLabelText}>Vehicle color</Text>
                                <View style={[styles.identityLabelCont, { borderColor: isInputFocused ? Colors.primary : undefined, borderWidth: isInputFocused ? 2 : undefined }]}>
                                    <TextInput
                                        value={vehicleColor}
                                        onChangeText={setVehicleColor}
                                        keyboardType='default'
                                        placeholder='Enter color here'
                                        placeholderTextColor={Colors.text.boxContPlaceholderText}
                                        style={styles.inputBox}
                                        selectionColor={Colors.primary}
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setIsInputFocused(false)}

                                    />
                                </View>
                                {vehicle_pending_color_issues_code && <Text style={styles.issuesText}>{vehicle_pending_color_issues_code}</Text>}
                            </View>

                            <View style={styles.identityLabelInfoCont}>
                                <Text style={styles.identityLabelText}>Vehicle Registration Photo</Text>
                                <View style={[styles.addPhotoCont, { borderColor: vehicle_reg_pending_photo_issues_code ? Colors.error : Colors.borderColor }]}>
                                    {regPhoto ? <View style={styles.licensePhotoCont}>
                                        <Image source={{ uri: regPhoto }} style={styles.licensePhoto}
                                            onLoad={() => setImageLoading(false)}
                                        />
                                        {imageLoading && <ImageLoadingPlaceHolder />}
                                        {!imageLoading && <Pressable onPress={() => setRegPhoto(null)} style={styles.removeImgCont}>
                                            <AntDesign name="close" color={Colors.text.white} size={16} />
                                        </Pressable>}

                                    </View> :
                                        isImageCompressing ? <View style={styles.loadingImageCont}>
                                            <ActivityIndicator size={"large"} color={Colors.text.white} />
                                        </View> :
                                            <Pressable onPress={() => setOpenVehicleLicensePhotoBottomSheet(true)} style={styles.addBtn}>
                                                <AntDesign name="plus" size={24} color={Colors.text.black} />
                                            </Pressable>
                                    }

                                    {imageLoading && <ImageLoadingPlaceHolder />}

                                </View>
                                {vehicle_reg_pending_photo_issues_code && <Text style={styles.issuesText}>{vehicle_reg_pending_photo_issues_code}</Text>}
                            </View>
                        </View>

                        <Pressable onPress={updateVehicleColor} style={[styles.updateBtn, { backgroundColor: isUpdatable ? Colors.primary : Colors.disabledBtn }]}>
                            <Text style={[styles.updateBtnText, { color: isUpdatable ? Colors.text.white : Colors.text.gray }]}>Update</Text>
                        </Pressable>

                        {pending_vehicle_color && <Pressable onPress={deletePendingVehicleColor} style={styles.deleteBtn}>
                            <Text style={styles.deleteBtnText}>Delete</Text>
                        </Pressable>}

                    </BottomSheetScrollView>
                </BottomSheetView>
            </BottomSheet>
            {
                openVehicleLicensePhotoBottomSheet && <UpdateVehicleColorPhotoBottomSheet
                    openVehicleLicensePhotoBottomSheet={openVehicleLicensePhotoBottomSheet}
                    setOpenVehicleLicensePhotoBottomSheet={setOpenVehicleLicensePhotoBottomSheet}
                    setRegPhoto={setRegPhoto}
                    setIsImageCompressing={setIsImageCompressing}
                />
            }
        </>
    )
}

const styles = StyleSheet.create({
    body: {
        height: "100%",
        backgroundColor: Colors.background,
        paddingHorizontal: 15
    },
    handleStyle: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.boxBackground
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end"
    },
    headerLabelText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
    },
    headerLabelDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray,
    },
    identityLabelText: {
        color: Colors.text.black,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
    },
    identityLabelCont: {
        backgroundColor: Colors.boxBackground,
        width: "100%",
        height: 45,
        padding: 10,
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: BORDER_RADIUS.md,
        flexDirection: "row",
    },
    identityLabelNo: {
        color: Colors.text.boxContPlaceholderText,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
    },
    identityLabelInfoCont: {
        gap: 10
    },
    addPhotoCont: {
        width: "100%",
        height: 150,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.borderColor,
        borderRadius: 10,
        borderStyle: "dashed"
    },
    addBtn: {
        width: 80,
        height: 80,
        backgroundColor: Colors.boxBackground,
        borderRadius: 80,
        justifyContent: "center",
        alignItems: "center"
    },
    updateBtn: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        borderRadius: BORDER_RADIUS.md,
        width: "100%",
        height: 50,
        marginTop: 50
    },
    updateBtnText: {
        color: Colors.text.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.md
    },
    loadingImageCont: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: BORDER_RADIUS.md

    },
    licensePhotoCont: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.md,
    },
    licensePhoto: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.md,
        resizeMode: "contain"
    },
    removeImgCont: {
        width: 30,
        height: 30,
        borderRadius: 30,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 10,
        right: 10,
    },
    issuesText: {
        fontSize: FONT_SIZES.xs,
        color: Colors.error,
        fontFamily: FONTS.medium,
    },
    deleteBtn: {
        backgroundColor: undefined,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        marginTop: 15,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        height: 50,
        width: "100%"
    },
    deleteBtnText: {
        color: Colors.primary,
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.md
    },
    inputBox: {
        width: "100%",
        height: 45,
        fontSize: FONT_SIZES.md
    }

})