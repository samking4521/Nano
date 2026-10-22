import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/theme/colors';
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font';
import { licenseUpdateType } from '../screens/IdentityInfo';
import LicenseClassModal from '../../../../Onboarding/screens/components/licenseClassModal';
import UpdateLicensePhotoBottomSheet from './UpdateLicensePhotoBottomSheet';
import DatePicker from 'react-native-date-picker';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../Authentication/store/authStore';
import { uploadToStorage } from '../../../../utils/imageUploader';
import { deleteFileIfExists } from '../../../../utils/deletePhoto';
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder';

type UpdateLicenseInfoBottomSheetProps = {
    showUpdateLicenseInfoBottomSheet: licenseUpdateType | null
    setShowUpdateLicenseInfoBottomSheet: React.Dispatch<React.SetStateAction<licenseUpdateType | null>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    pendingLicensePhoto: string | null
    setPendingLicensePhoto: React.Dispatch<React.SetStateAction<string | null>>
    pendingLicenseClass: string | null
    setPendingLicenseClass: React.Dispatch<React.SetStateAction<string | null>>
    setPendingLicenseExpiryDate: React.Dispatch<React.SetStateAction<string | null>>
    setIdentityInfoVerificationIssues: (data: any[] | null) => void
    pendingLicenseExpiryDate: string | null
    pending_driver_license_photo_issues_code: string | undefined
    pending_driver_license_class_issues_code: string | undefined
    pending_driver_license_expiry_date_issues_code: string | undefined


}

export default function UpdateLicenseInfoBottomSheet({ setShowUpdateLicenseInfoBottomSheet, showUpdateLicenseInfoBottomSheet, setShowLoadingSpinner, setShowErrorAlert, pendingLicenseClass, pendingLicensePhoto, setPendingLicenseClass, setPendingLicensePhoto, pendingLicenseExpiryDate, setPendingLicenseExpiryDate, pending_driver_license_class_issues_code, pending_driver_license_expiry_date_issues_code, pending_driver_license_photo_issues_code, setIdentityInfoVerificationIssues }: UpdateLicenseInfoBottomSheetProps) {
    const session = useAuthStore((store) => store.session);
    const [showLicenseClassModal, setShowLicenseClassModal] = useState(false);
    const [driverLicenseClass, setDriverLicenseClass] = useState(() => pendingLicenseClass ?? "");
    const [open, setOpen] = useState(false);
    const [isDateSelected, setIsDateSelected] = useState(() => pendingLicenseExpiryDate ? true : false);
    const [driverLicenseExpiryDate, setDriverLicenseExpiryDate] = useState<Date>(() => pendingLicenseExpiryDate ? new Date(pendingLicenseExpiryDate) : new Date());
    const [licensePhoto, setLicensePhoto] = useState<string | null>(() => pendingLicensePhoto ?? null);
    const [isImageCompressing, setIsImageCompressing] = useState(false);
    const [openLicensePhotoBottomSheet, setOpenLicensePhotoBottomSheet] = useState(false);
    const [imageLoading, setImageLoading] = useState(!!licensePhoto);


    const snapPoints = useMemo(() => ['90%'], []);

    const formatDate = (date: Date): string => {
        return date.toISOString().slice(0, 10);
    };

    const showFieldModal = () => {
        if (showUpdateLicenseInfoBottomSheet == "license_class") {
            setShowLicenseClassModal(true);
        } else {
            setOpen(true);
        }
    }

    const isFieldTrue = showUpdateLicenseInfoBottomSheet === "license_class"? driverLicenseClass : isDateSelected 
    const isUpdatable = licensePhoto && isFieldTrue ? true : false;

    const isNewPhoto = !!licensePhoto && licensePhoto.startsWith('file://');

    const updateLicenseData = async () => {
        try {
            if (!isUpdatable) return;
            setShowUpdateLicenseInfoBottomSheet(null);
            setShowLoadingSpinner(true);

            const pendingLicensePath = `driver/pending/driver_license/${session?.user.id}/driverLicenseImage.jpg`;
            if (isNewPhoto) {
                await uploadToStorage(
                    "driver-documents",
                    pendingLicensePath,
                    licensePhoto
                );
            }

            const field = showUpdateLicenseInfoBottomSheet === "license_class" ? 'license_class' : 'expiry_date';
            const value = field === 'license_class' ? driverLicenseClass : formatDate(driverLicenseExpiryDate);

            const { data, error } = await supabase.rpc('update_pending_license_data', {
                p_field: field,
                p_value: value,
                p_photo_path: pendingLicensePath,
            });

            if (error) {
                throw new Error(`Error updating pending license data: ${error.message}`);
            }

            if (pending_license_issue) {
                setIdentityInfoVerificationIssues(data.verification_issues);
            }

            if (showUpdateLicenseInfoBottomSheet == "license_class") {
                setPendingLicenseClass(data.updated.pending_license_class);
            } else {
                setPendingLicenseExpiryDate(data.updated.pending_expiry_date);
            }
            setPendingLicensePhoto(licensePhoto);
            setShowLoadingSpinner(false);

            Alert.alert(
                'Driver License Updated',
                'Your driver license has been updated successfully. It will be reviewed and verified within 24 hours.',
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

    const pending_license_issue = !!pending_driver_license_photo_issues_code || !!pending_driver_license_expiry_date_issues_code || !!pending_driver_license_class_issues_code
    const license_class_issues = !!pending_driver_license_photo_issues_code || !!pending_driver_license_class_issues_code
    const license_expiry_issues = !!pending_driver_license_photo_issues_code || !!pending_driver_license_expiry_date_issues_code
    const headerText = showUpdateLicenseInfoBottomSheet == "license_class" ? pendingLicenseClass ? "Pending License Class" : "Update License class" : pendingLicenseExpiryDate ? "Pending License Expiry" : "Update License Expiry";
    const headerDescText = showUpdateLicenseInfoBottomSheet == "license_class" ? license_class_issues ? "There are issues with your driver license information. Fix the issues and resubmit for review." : pendingLicenseClass ? "Your driver license class is currently under review and will be updated within 24 hours if approved." : "Enter your driver license class and upload your license photo for verification." : license_expiry_issues ? "There are issues with your driver license information. Fix the issues and resubmit for review." : pendingLicenseExpiryDate ? "Your driver license expiry is currently under review and will be updated within 24 hours if approved." : "Enter your driver license expiry date and upload your license photo for verification.";
    const headerDescTextColor = showUpdateLicenseInfoBottomSheet == "license_class" ? license_class_issues ? Colors.error : pendingLicenseClass ? Colors.primary : Colors.text.gray : license_expiry_issues ? Colors.error : pendingLicenseExpiryDate ? Colors.primary : Colors.text.gray;
    const fieldBgColor = showUpdateLicenseInfoBottomSheet == "license_class" ? pending_driver_license_class_issues_code ? Colors.errorBackground : Colors.boxBackground : pending_driver_license_expiry_date_issues_code ? Colors.errorBackground : Colors.boxBackground;
    const imgBorderColor = pending_driver_license_photo_issues_code ? Colors.error : Colors.borderColor;
    const fieldTextColor = showUpdateLicenseInfoBottomSheet == "license_class" ? driverLicenseClass ? Colors.text.gray : Colors.text.boxContPlaceholderText : isDateSelected ? Colors.text.gray : Colors.text.boxContPlaceholderText;

    const deletePendingDriverLicense = async () => {
        try {
            setShowUpdateLicenseInfoBottomSheet(null);
            setShowLoadingSpinner(true);

            const field = showUpdateLicenseInfoBottomSheet === "license_class" ? 'license_class' : 'expiry_date';

            const { data, error } = await supabase.rpc('delete_pending_license_data', {
                p_field: field,
            });

            if (error) {
                throw new Error(`Error deleting pending license data: ${error.message}`);
            }

            if (data.cleared_photo) {
                const pending_path = `driver/pending/driver_license/${session?.user.id}`;
                try {
                    await deleteFileIfExists("driver-documents", pending_path, "driverLicenseImage.jpg", "Pending Driver License Photo");
                } catch (storageErr) {
                    console.log("Storage cleanup failed (non-critical):", storageErr);
                }
            }

            if (pending_license_issue) {
                setIdentityInfoVerificationIssues(data.verification_issues);
            }

            if (field === "license_class") {
                setPendingLicenseClass(null);
                if (data.cleared_photo) {
                    setPendingLicensePhoto(null);
                }
            } else {
                setPendingLicenseExpiryDate(null);
                if (data.cleared_photo) {
                    setPendingLicensePhoto(null);
                }
            }

            setShowLoadingSpinner(false);

        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }
    }


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
                        <Pressable onPress={() => setShowUpdateLicenseInfoBottomSheet(null)} style={styles.closeBtn}>
                            <AntDesign name="close" color={Colors.text.black} size={18} />
                        </Pressable>
                    </View>

                    <View style={{ gap: 5, marginBottom: 20 }}>
                        <Text style={styles.headerLabelText}>{headerText}</Text>
                        <Text style={[styles.headerLabelDesc, { color: headerDescTextColor }]}>{headerDescText}</Text>
                    </View>

                    <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ gap: 10 }}>
                            <View style={styles.identityLabelInfoCont}>
                                <Text style={styles.identityLabelText}>{showUpdateLicenseInfoBottomSheet == "license_class" ? "License Class" : "License Expiry Date"}</Text>
                                <Pressable onPress={showFieldModal} style={[styles.identityLabelCont, { backgroundColor: fieldBgColor }]}>
                                    <Text style={[styles.identityLabelNo, { color: fieldTextColor }]}>{showUpdateLicenseInfoBottomSheet == "license_class" ? driverLicenseClass || "Enter license class" : isDateSelected ? formatDate(driverLicenseExpiryDate) : "Enter license expiry"}</Text>
                                    {
                                        open && <DatePicker
                                            modal
                                            mode="date"
                                            open={open}
                                            date={driverLicenseExpiryDate}
                                            onConfirm={(date) => {
                                                setOpen(false)
                                                setDriverLicenseExpiryDate(date)
                                                setIsDateSelected(true)
                                            }}
                                            onCancel={() => {
                                                setOpen(false)
                                            }}
                                        />
                                    }
                                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
                                </Pressable>
                                {(pending_driver_license_class_issues_code || pending_driver_license_expiry_date_issues_code) && <Text style={styles.issuesText}>{showUpdateLicenseInfoBottomSheet == "license_class" ? pending_driver_license_class_issues_code : pending_driver_license_expiry_date_issues_code}</Text>}
                            </View>

                            <View style={styles.identityLabelInfoCont}>
                                <Text style={styles.identityLabelText}>License Photo</Text>
                                <View style={[styles.addPhotoCont, { borderColor: imgBorderColor }]}>
                                    {licensePhoto ? <View style={styles.licensePhotoCont}>
                                        <Image source={{ uri: licensePhoto }} style={styles.licensePhoto}
                                            onLoad={() => {
                                                console.log("IMAGE LOAD");
                                                setImageLoading(false);
                                            }}
                                            onError={() => {
                                                setImageLoading(false);
                                            }}

                                        />
                                        {!imageLoading && <Pressable onPress={() => setLicensePhoto(null)} style={styles.removeImgCont}>
                                            <AntDesign name="close" color={Colors.text.white} size={16} />
                                        </Pressable>}

                                    </View> :
                                        isImageCompressing ? <View style={styles.loadingImageCont}>
                                            <ActivityIndicator size={"large"} color={Colors.text.white} />
                                        </View> :
                                            <Pressable onPress={() => setOpenLicensePhotoBottomSheet(true)} style={styles.addBtn}>
                                                <AntDesign name="plus" size={24} color={Colors.text.black} />
                                            </Pressable>
                                    }

                                    {imageLoading && <ImageLoadingPlaceHolder />}

                                </View>
                                {pending_driver_license_photo_issues_code && <Text style={styles.issuesText}>{pending_driver_license_photo_issues_code}</Text>}
                            </View>
                        </View>

                        <Pressable onPress={updateLicenseData} style={[styles.updateBtn, { backgroundColor: isUpdatable ? Colors.primary : Colors.disabledBtn }]}>
                            <Text style={[styles.updateBtnText, { color: isUpdatable ? Colors.text.white : Colors.text.gray }]}>Update</Text>
                        </Pressable>

                        {(showUpdateLicenseInfoBottomSheet == "license_class" ? pendingLicenseClass : pendingLicenseExpiryDate) && <Pressable onPress={deletePendingDriverLicense} style={styles.deleteBtn}>
                            <Text style={styles.deleteBtnText}>Delete</Text>
                        </Pressable>}

                    </BottomSheetScrollView>

                </BottomSheetView>
                <LicenseClassModal showLicenseClassModal={showLicenseClassModal} setShowLicenseClassModal={setShowLicenseClassModal} setDriverLicenseClass={setDriverLicenseClass} />
            </BottomSheet>
            {openLicensePhotoBottomSheet && <UpdateLicensePhotoBottomSheet openLicensePhotoBottomSheet={openLicensePhotoBottomSheet} setOpenLicensePhotoBottomSheet={setOpenLicensePhotoBottomSheet} setIsImageCompressing={setIsImageCompressing} setLicensePhoto={setLicensePhoto} />}

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