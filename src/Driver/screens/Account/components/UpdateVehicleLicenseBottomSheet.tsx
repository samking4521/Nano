import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { AntDesign } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { vehicleLicenseFieldType } from '../screens/VehicleRegistration'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { useDriverStore } from '../../../store/DriverStore'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'

type UpdateVehicleInfoBottomSheetProps = {
    openEditVehicleLicenseBottomSheet: vehicleLicenseFieldType | null
    setOpenEditVehicleLicenseBottomSheet: React.Dispatch<React.SetStateAction<vehicleLicenseFieldType | null>>
    regNumber: string
    expiryDate: string
    setRegNumber: React.Dispatch<React.SetStateAction<string>>
    setExpiryDate: React.Dispatch<React.SetStateAction<string>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    vehicleId: string
    setVehicleDocumentVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
    onUpdateVehicleDocumentVerificationIssues: (verification_issues: any[] | null) => void
    vehicleDocumentVerificationStatus: VERIFICATION_STATUS | undefined
    setVehicleDocumentVerificationStatus: React.Dispatch<React.SetStateAction<VERIFICATION_STATUS | undefined>>
    onUpdateVehicleDocumentVerificationStatus: (verification_status: VERIFICATION_STATUS) => void
    onUpdateVehicleDocuments: (vehicleDocumentsData: any) => void
}


export default function UpdateVehicleLicenseBottomSheet({ openEditVehicleLicenseBottomSheet, setOpenEditVehicleLicenseBottomSheet, regNumber: parentRegNumber, expiryDate: parentExpiryDate, setRegNumber: setParentRegNumber, setExpiryDate: setParentExpiryDate, setShowLoadingSpinner, setShowErrorAlert, vehicleId, setVehicleDocumentVerificationIssues, onUpdateVehicleDocumentVerificationIssues, vehicleDocumentVerificationStatus, setVehicleDocumentVerificationStatus, onUpdateVehicleDocumentVerificationStatus, onUpdateVehicleDocuments}: UpdateVehicleInfoBottomSheetProps) {
    const pendingVehicleUpdate = useDriverStore((store) => store.pendingVehicleUpdate);
    const setPendingVehicleUpdate = useDriverStore((store) => store.setPendingVehicleUpdate);
    const [regNumber, setRegNumber] = useState(() => parentRegNumber ?? "");
    const [expiryDate, setExpiryDate] = useState(() => parentExpiryDate ?? "");

    function isUppercaseAlphanumeric(text: string): boolean {
        return /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]+$/.test(text);
    }

    const isDateValid = (date: string): boolean => {
        return /^\d{4}-\d{2}-\d{2}$/.test(date);
    }

    function formatDateInput(text: string) {
        // Strip everything except digits
        const digits = text.replace(/\D/g, '').slice(0, 8); // max 8 digits: YYYYMMDD

        let formatted = digits;

        if (digits.length > 4) {
            formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
        }
        if (digits.length > 6) {
            formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
        }

        return formatted;
    }


    const headerText = openEditVehicleLicenseBottomSheet == "expiry_date" ? "Edit Certificate Expiry" : "Edit Registration Number";
    const sheetValue = openEditVehicleLicenseBottomSheet == "expiry_date" ? expiryDate : regNumber;
    const sheetPlaceholderText = openEditVehicleLicenseBottomSheet == "expiry_date" ? "yyyy-mm-dd" : "enter Reg Number";
    const sheetMaxLength = openEditVehicleLicenseBottomSheet == "expiry_date" ? 10 : undefined;
    const sheetKeyboardType = openEditVehicleLicenseBottomSheet == "expiry_date" ? "number-pad" : "default";



    const isInputValid = openEditVehicleLicenseBottomSheet == "expiry_date" ? isDateValid(expiryDate) : isUppercaseAlphanumeric(regNumber);


    const updateVehicleLicenseInformation = async () => {
        try {
            if (!isInputValid) return

            setOpenEditVehicleLicenseBottomSheet(null);
            setShowLoadingSpinner(true);

            const { error: vehicle_documents_update_err } = await supabase
                .from("Vehicle_Documents")
                .update(openEditVehicleLicenseBottomSheet === "expiry_date" ? { expiry_date: expiryDate } : { document_number: regNumber })
                .eq("vehicle_id", vehicleId)

            if (vehicle_documents_update_err) {
                throw new Error(`Error updating vehicle documents: ${vehicle_documents_update_err.message}`);
            }

            const {
                error: vehicle_verification_issue_delete_error,
            } = await supabase
                .from("Vehicle_Verification_Issues")
                .delete()
                .eq("vehicle_id", vehicleId)
                .eq(
                    "field",
                    openEditVehicleLicenseBottomSheet === "expiry_date"
                        ? VERIFICATION_ISSUES_FIELD.VEHICLE_REGISTRATION_EXPIRY_DATE
                        : VERIFICATION_ISSUES_FIELD.VEHICLE_REGISTRATION_NUMBER
                );

            if (vehicle_verification_issue_delete_error) {
                throw new Error(
                    `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                );
            }

            const vehicleDocumentIssues = await getVehicleDocsVerificationIssues();

            if (vehicleDocumentIssues.length === 0) {
                const { error } = await supabase
                    .from("Vehicle_Documents")
                    .update({ status: VERIFICATION_STATUS.PENDING })
                    .eq("vehicle_id", vehicleId)

                if (error) {
                    throw new Error(`Error updating vehicle document status: ${error.message}`);
                }


                setVehicleDocumentVerificationStatus(VERIFICATION_STATUS.PENDING);
                onUpdateVehicleDocumentVerificationStatus(VERIFICATION_STATUS.PENDING);
                setPendingVehicleUpdate({
                    vehicleId: vehicleId,
                    vehicleDocumentVerificationStatus: VERIFICATION_STATUS.PENDING,
                    vehicleDocumentVerificationIssues: vehicleDocumentIssues.length,
                    vehicleVerificationStatus: pendingVehicleUpdate?.vehicleVerificationStatus,
                    vehicleInfoVerificationIssues: pendingVehicleUpdate?.vehicleInfoVerificationIssues,
                    vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
                    vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
                    vehicle_year: pendingVehicleUpdate?.vehicle_year,
                    vehicle_type: pendingVehicleUpdate?.vehicle_type,
                    vehicle_url: pendingVehicleUpdate?.vehicle_url,
                })
            }

            if (openEditVehicleLicenseBottomSheet === "reg_number") {
                setParentRegNumber(regNumber);
                onUpdateVehicleDocuments({
                    document_number: regNumber
                })
            } else {
                setParentExpiryDate(expiryDate)
                 onUpdateVehicleDocuments({
                    expiry_date: expiryDate
                })
            }

            setShowLoadingSpinner(false);

        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }
    }

    const setVehicleLicenseExpiryDate = (value: string) => {
        setExpiryDate(formatDateInput(value));
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
        setPendingVehicleUpdate({
            vehicleId: vehicleId,
            vehicleDocumentVerificationStatus: vehicleDocumentVerificationStatus,
            vehicleDocumentVerificationIssues: verification_issues_data.length,
            vehicleVerificationStatus: pendingVehicleUpdate?.vehicleVerificationStatus,
            vehicleInfoVerificationIssues: pendingVehicleUpdate?.vehicleInfoVerificationIssues,
            vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
            vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
            vehicle_year: pendingVehicleUpdate?.vehicle_year,
            vehicle_type: pendingVehicleUpdate?.vehicle_type,
            vehicle_url: pendingVehicleUpdate?.vehicle_url,
        })

        return verification_issues_data
    }

    return (
        <BottomSheet
            index={0}
            enableDynamicSizing={true}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustPan"
            enablePanDownToClose={false}
            enableOverDrag={false}
            backgroundStyle={{ backgroundColor: Colors.background }}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            handleStyle={styles.handleStyle}
        >
            <BottomSheetView style={styles.sheetContainer}>
                <View>
                    <Pressable onPress={() => setOpenEditVehicleLicenseBottomSheet(null)} style={styles.closeBtn}>
                        <AntDesign name="close" color={Colors.text.black} size={18} />
                    </Pressable>
                    <View>
                        <Text style={styles.headerLabelText}>{headerText}</Text>
                    </View>
                    <View style={{ marginTop: 20, gap: 15 }}>
                        <BottomSheetTextInput
                            value={sheetValue}
                            onChangeText={openEditVehicleLicenseBottomSheet == "expiry_date" ? (value) => setVehicleLicenseExpiryDate(value) : setRegNumber}
                            keyboardType={sheetKeyboardType}
                            style={styles.inputBox}
                            selectionColor={Colors.primary}
                            autoFocus={true}
                            placeholder={sheetPlaceholderText}
                            placeholderTextColor={Colors.text.placeholder}
                            maxLength={sheetMaxLength}
                        />
                        <Pressable onPress={updateVehicleLicenseInformation} style={[styles.confirmBtn, { backgroundColor: isInputValid ? Colors.primary : Colors.disabledBtn }]}>
                            <Text style={[styles.confirmBtnText, { color: isInputValid ? Colors.text.white : Colors.text.black }]}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    sheetContainer: {
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
        paddingBottom: 20
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
        textAlign: "center"
    },
    inputBox: {
        flex: 1,
        height: 50,
        fontSize: FONT_SIZES.md,
        paddingHorizontal: 10,
        fontFamily: FONTS.medium,
        color: Colors.text.black,
        backgroundColor: Colors.boxBackground,
        borderRadius: BORDER_RADIUS.md
    },
    confirmBtn: {
        width: "80%",
        height: 50,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center"
    },
    confirmBtnText: {
        fontSize: FONT_SIZES.md,
        color: Colors.text.white,
        fontFamily: FONTS.medium
    }
})