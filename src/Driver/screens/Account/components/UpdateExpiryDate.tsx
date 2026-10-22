import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/theme/colors';
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font';
import DatePicker from 'react-native-date-picker';
import UpdateExpiryDatePhoto from './UpdateExpiryDatePhoto';
import { uploadToStorage } from '../../../../utils/imageUploader';
import { DRIVER_DOCUMENT_TYPE, VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver';
import { supabase } from '../../../../lib/supabase';
import { deleteFileIfExists } from '../../../../utils/deletePhoto';
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder';

type UpdateVehicleRegExpiryDateProps = {
    setOpenUpdateRegExpiry: React.Dispatch<React.SetStateAction<boolean>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    vehicleId: string
    setVehicleDocumentVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
    onUpdateVehicleDocumentVerificationIssues: (verification_issues: any[] | null) => void
    pendingExpiryDate: string | null
    setPendingExpiryDate: React.Dispatch<React.SetStateAction<string | null>>
    onUpdateVehicleDocuments: (vehicleDocumentsData: any) => void
    pendingDocumentImgKey: string | null
    setPendingDocumentImgKey: React.Dispatch<React.SetStateAction<string | null>>
    pending_vehicle_expiry_date_issues_code: string | undefined
    vehicle_reg_pending_photo_issues_code: string | undefined
}

export default function UpdateVehicleRegExpiryDate({ setShowLoadingSpinner, setShowErrorAlert, setOpenUpdateRegExpiry, vehicleId, setVehicleDocumentVerificationIssues, onUpdateVehicleDocumentVerificationIssues, pendingExpiryDate, setPendingExpiryDate, onUpdateVehicleDocuments, pendingDocumentImgKey, setPendingDocumentImgKey, pending_vehicle_expiry_date_issues_code, vehicle_reg_pending_photo_issues_code }: UpdateVehicleRegExpiryDateProps) {
    const [open, setOpen] = useState(false);
    const [isDateSelected, setIsDateSelected] = useState(false);
    const [expiryDate, setExpiryDate] = useState<Date>(pendingExpiryDate ? new Date(pendingExpiryDate) : new Date());
    const [regPhoto, setRegPhoto] = useState<string | null>(null);
    const [isImageCompressing, setIsImageCompressing] = useState(false);
    const [imageLoading, setImageLoading] = useState(!!pendingDocumentImgKey);
    const [openRegPhotoPicker, setOpenRegPhotoPicker] = useState(false);

    const snapPoints = useMemo(() => ['90%'], []);

    const formatDate = (date: Date): string => {
        return date.toISOString().slice(0, 10);
    };





    const isUpdatable = regPhoto && expiryDate ? true : false;

    const isNewPhoto = !!regPhoto && regPhoto.startsWith('file://');


    const getVehicleRegPhotoUrl = async () => {
        const imgKey = pendingDocumentImgKey;
        if (!imgKey) return;

        const { data: signedImage, error: signedImageError } =
            await supabase.storage
                .from("vehicle-documents")
                .createSignedUrl(imgKey, 60 * 60);

        if (signedImageError) {
            throw new Error(
                `Error creating pending vehicle registration photo URL: ${signedImageError.message}`
            );
        }

        const imageUrl = signedImage.signedUrl;
        setRegPhoto(imageUrl);
    }

    useEffect(() => {
        if (!pendingDocumentImgKey) return;
        getVehicleRegPhotoUrl();
    }, [pendingDocumentImgKey])


    const updateVehicleRegistrationExpiryDate = async () => {
        try {
            if (!isUpdatable) return;
            setOpenUpdateRegExpiry(false);
            setShowLoadingSpinner(true);

            const pendingRegPhotoPath = `vehicle/pending/${DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE.toLowerCase()}/${vehicleId}/vehicleLicense.jpeg`;
            if (isNewPhoto) {
                await uploadToStorage(
                    "vehicle-documents",
                    pendingRegPhotoPath,
                    regPhoto
                );
            }

            const { error: vehicle_documents_update_err } = await supabase
                .from("Vehicle_Documents")
                .update({ pending_expiry_date: expiryDate, pending_document_img_key: pendingRegPhotoPath, pending_document_img_key_at: new Date().toISOString() })
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
                        VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_PHOTO,
                        VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_EXPIRY_DATE,
                    ]);

            if (vehicle_verification_issue_delete_error) {
                throw new Error(
                    `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                );
            }

            await getVehicleDocsVerificationIssues();

            setPendingExpiryDate(formatDate(expiryDate));
            setPendingDocumentImgKey(pendingRegPhotoPath);
            onUpdateVehicleDocuments({
                pending_expiry_date: formatDate(expiryDate),
                pending_document_img_key: pendingRegPhotoPath
            })


            setShowLoadingSpinner(false);

            Alert.alert(
                'Vehicle Registration Expiry Date Updated',
                'Your vehicle registration expiry date has been updated successfully. It will be reviewed and verified within 24 hours.',
                [
                    {
                        text: 'OK',
                        style: 'default',
                    },
                ]
            );



        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }
    }


    const deletePendingVehicleRegistrationExpiryDate = async () => {
        try {
            setOpenUpdateRegExpiry(false);
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

                const { error: vehicle_documents_update_err } = await supabase
                    .from("Vehicle_Documents")
                    .update({ pending_expiry_date: null, pending_document_img_key: null, pending_document_img_key_at: null })
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
                            VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_PHOTO,
                            VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_EXPIRY_DATE,
                        ]);

                if (vehicle_verification_issue_delete_error) {
                    throw new Error(
                        `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                    );
                }

                await getVehicleDocsVerificationIssues();

            } else {
                const { error: vehicle_documents_update_err } = await supabase
                    .from("Vehicle_Documents")
                    .update({ pending_expiry_date: null, pending_document_img_key: null, pending_document_img_key_at: null })
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
                            VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_PHOTO,
                            VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_EXPIRY_DATE,
                        ]);

                if (vehicle_verification_issue_delete_error) {
                    throw new Error(
                        `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                    );
                }

                await getVehicleDocsVerificationIssues();

                const vehicleRegImgPath = `vehicle/pending/vehicle_registration_certificate/${vehicleId}/vehicleLicense.jpeg`;


                await deleteFileIfExists("vehicle-documents", vehicleRegImgPath, "vehicleLicense.jpeg", "Pending Vehicle License Photo");
            }

            setPendingExpiryDate(null);
            setPendingDocumentImgKey(null);
            onUpdateVehicleDocuments({
                pending_expiry_date: null,
                pending_document_img_key: null
            })

            setShowLoadingSpinner(false);

        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }
    }


    const getVehicleDocsVerificationIssues = async () => {
        const { data: verification_issues_data, error: verification_issues_data_err } = await supabase
            .from("Vehicle_Verification_Issues")
            .select("*")
            .eq("vehicle_id", vehicleId)
            .eq("section", VERIFICATION_ISSUES_SECTION.VEHICLE_DOCS);

        if (verification_issues_data_err) {
            throw new Error(`Error querying Verification Issues: ${verification_issues_data_err.message}`);
        }

        setVehicleDocumentVerificationIssues(verification_issues_data);
        onUpdateVehicleDocumentVerificationIssues(verification_issues_data);

        return verification_issues_data
    }


    const issuesPresent = !!pending_vehicle_expiry_date_issues_code || !!vehicle_reg_pending_photo_issues_code

    const descText = issuesPresent ? "There are issues with your expiry date. Fix the issues and resubmit for review." : pendingExpiryDate ? "Your vehicle registration expiry date is currently under review and will be updated within 24 hours if approved." : "Enter your vehicle registration expiry date and upload your vehicle registration photo for verification.";
    const descColor = issuesPresent ? Colors.error : pendingExpiryDate ? Colors.primary : Colors.text.gray;



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
                        <Pressable onPress={() => setOpenUpdateRegExpiry(false)} style={styles.closeBtn}>
                            <AntDesign name="close" color={Colors.text.black} size={18} />
                        </Pressable>
                    </View>

                    <View style={{ gap: 5, marginBottom: 20 }}>
                        <Text style={styles.headerLabelText}>Update Vehicle Registration Expiry</Text>
                        <Text style={[styles.headerLabelDesc, { color: descColor }]}>{descText}</Text>
                    </View>

                    <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ gap: 10 }}>
                            <View style={styles.identityLabelInfoCont}>
                                <Text style={styles.identityLabelText}>Expiry Date</Text>
                                <Pressable onPress={() => setOpen(true)} style={[styles.identityLabelCont]}>
                                    <Text style={[styles.identityLabelNo, { color: isDateSelected || pendingExpiryDate ? Colors.text.black : Colors.text.boxContPlaceholderText }]}>{isDateSelected ? formatDate(expiryDate) : pendingExpiryDate || "Enter license expiry"}</Text>
                                    {
                                        open && <DatePicker
                                            modal
                                            mode="date"
                                            open={open}
                                            date={expiryDate}
                                            onConfirm={(date) => {
                                                setOpen(false)
                                                setExpiryDate(date)
                                                setIsDateSelected(true)
                                            }}
                                            onCancel={() => {
                                                setOpen(false)
                                            }}
                                        />
                                    }
                                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
                                </Pressable>
                                {pending_vehicle_expiry_date_issues_code && <Text style={styles.issuesText}>{pending_vehicle_expiry_date_issues_code}</Text>}
                            </View>

                            <View style={styles.identityLabelInfoCont}>
                                <Text style={styles.identityLabelText}>Registration Photo</Text>
                                <View style={[styles.addPhotoCont, { borderColor: vehicle_reg_pending_photo_issues_code ? Colors.error : Colors.borderColor }]}>
                                    {regPhoto ? <View style={styles.licensePhotoCont}>
                                        <Image source={{ uri: regPhoto }} style={styles.licensePhoto}
                                            onLoad={() => {
                                                setImageLoading(false);
                                            }}
                                        />
                                        {!imageLoading && <Pressable onPress={() => setRegPhoto(null)} style={styles.removeImgCont}>
                                            <AntDesign name="close" color={Colors.text.white} size={16} />
                                        </Pressable>}

                                    </View> :
                                        isImageCompressing ? <View style={styles.loadingImageCont}>
                                            <ActivityIndicator size={"large"} color={Colors.text.white} />
                                        </View> :
                                            <>
                                                {!imageLoading && <Pressable onPress={() => setOpenRegPhotoPicker(true)} style={styles.addBtn}>
                                                    <AntDesign name="plus" size={24} color={Colors.text.black} />
                                                </Pressable>}
                                            </>

                                    }

                                    {imageLoading && <ImageLoadingPlaceHolder />}

                                </View>
                                {vehicle_reg_pending_photo_issues_code && <Text style={styles.issuesText}>{vehicle_reg_pending_photo_issues_code}</Text>}
                            </View>
                        </View>

                        <Pressable onPress={updateVehicleRegistrationExpiryDate} style={[styles.updateBtn, { backgroundColor: isUpdatable ? Colors.primary : Colors.disabledBtn }]}>
                            <Text style={[styles.updateBtnText, { color: isUpdatable ? Colors.text.white : Colors.text.gray }]}>Update</Text>
                        </Pressable>

                        {pendingExpiryDate && <Pressable onPress={deletePendingVehicleRegistrationExpiryDate} style={styles.deleteBtn}>
                            <Text style={styles.deleteBtnText}>Delete</Text>
                        </Pressable>}

                    </BottomSheetScrollView>

                </BottomSheetView>
            </BottomSheet>
            {
                openRegPhotoPicker && <UpdateExpiryDatePhoto
                    openRegPhotoPicker={openRegPhotoPicker}
                    setIsImageCompressing={setIsImageCompressing}
                    setRegPhoto={setRegPhoto}
                    setOpenRegPhotoPicker={setOpenRegPhotoPicker}
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
    }

})