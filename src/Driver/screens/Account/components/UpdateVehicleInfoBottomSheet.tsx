import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { AntDesign } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { vehicleInfoType } from '../screens/VehicleInfo'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { useDriverStore } from '../../../store/DriverStore'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'

type UpdateVehicleInfoBottomSheetProps = {
    openEditVehicleInfoBottomSheet: vehicleInfoType | null
    setOpenEditVehicleInfoBottomSheet: React.Dispatch<React.SetStateAction<vehicleInfoType | null>>
    vehicleCapacity: string
    plateNumber: string
    year: string
    vehicleId: string
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    setVehicleCapacity: React.Dispatch<React.SetStateAction<string>>
    setPlateNumber: React.Dispatch<React.SetStateAction<string>>
    setYear: React.Dispatch<React.SetStateAction<string>>
    onUpdateVehicle: (vehicleData: any) => void
    setVehicleInfoVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
    setVehicleVerificationStatus: React.Dispatch<React.SetStateAction<VERIFICATION_STATUS | undefined>>
    onUpdateVehicleInfoVerificationIssues: (verification_issues: any[] | null) => void
    onUpdateVehicleVerificationStatus: (verification_status: VERIFICATION_STATUS) => void
    vehicleVerificationStatus: VERIFICATION_STATUS | undefined
}


export default function UpdateVehicleInfoBottomSheet({ openEditVehicleInfoBottomSheet, setOpenEditVehicleInfoBottomSheet, vehicleCapacity: parentVehicleCapacity, plateNumber: parentPlateNumber, year: parentYear, vehicleId, setVehicleCapacity: setParentVehicleCapacity, setPlateNumber: setParentPlateNumber, setYear: setParentYear, setShowLoadingSpinner, setShowErrorAlert, onUpdateVehicle, setVehicleInfoVerificationIssues, setVehicleVerificationStatus, onUpdateVehicleVerificationStatus, onUpdateVehicleInfoVerificationIssues, vehicleVerificationStatus }: UpdateVehicleInfoBottomSheetProps) {
    const pendingVehicleUpdate = useDriverStore((store) => store.pendingVehicleUpdate);
    const setPendingVehicleUpdate = useDriverStore((store) => store.setPendingVehicleUpdate);
    const [vehicleCapacity, setVehicleCapacity] = useState(parentVehicleCapacity);
    const [plateNumber, setPlateNumber] = useState(parentPlateNumber);
    const [year, setYear] = useState(parentYear);

    function isUppercaseAlphanumeric(text: string): boolean {
        return /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]+$/.test(text);
    }


    const headerText = openEditVehicleInfoBottomSheet == "vehicle_capacity" ? "Edit Vehicle Capacity" : openEditVehicleInfoBottomSheet == "plate_number" ? "Edit Plate Number" : "Edit Production Year";
    const sheetValue = openEditVehicleInfoBottomSheet == "vehicle_capacity" ? vehicleCapacity : openEditVehicleInfoBottomSheet == "plate_number" ? plateNumber : year;
    const sheetOnChangeValue = openEditVehicleInfoBottomSheet == "vehicle_capacity" ? setVehicleCapacity : openEditVehicleInfoBottomSheet == "plate_number" ? setPlateNumber : setYear;
    const sheetPlaceholderText = openEditVehicleInfoBottomSheet == "vehicle_capacity" ? "e.g 5 tons" : openEditVehicleInfoBottomSheet == "plate_number" ? "e.g ADK-123456778" : "e.g 2009";
    const sheetMaxLength = openEditVehicleInfoBottomSheet == "year" ? 4 : undefined;
    const sheetKeyboardType = openEditVehicleInfoBottomSheet == "plate_number" ? "default" : "number-pad";


    const isInputValid = openEditVehicleInfoBottomSheet == "vehicle_capacity" ? vehicleCapacity.trim() !== "" : openEditVehicleInfoBottomSheet == "plate_number" ? isUppercaseAlphanumeric(plateNumber) : year.trim() !== "" && year.length == 4;


    const updateVehicleInformation = async () => {
        try {
            if (!isInputValid) return
            setOpenEditVehicleInfoBottomSheet(null);
            setShowLoadingSpinner(true);

            const { error } = await supabase
                .from("Vehicle")
                .update(openEditVehicleInfoBottomSheet === "vehicle_capacity" ? { vehicle_capacity: vehicleCapacity } : openEditVehicleInfoBottomSheet === "plate_number" ? { plate_number: plateNumber } : { vehicle_year: year })
                .eq("id", vehicleId)

            if (error) {
                throw new Error(`Error updating vehicle: ${error.message}`);
            }


            const {
                error: vehicle_verification_issue_delete_error,
            } = await supabase
                .from("Vehicle_Verification_Issues")
                .delete()
                .eq("vehicle_id", vehicleId)
                .eq(
                    "field",
                    openEditVehicleInfoBottomSheet === "vehicle_capacity"
                        ? VERIFICATION_ISSUES_FIELD.VEHICLE_CAPACITY
                        : openEditVehicleInfoBottomSheet === "plate_number"
                            ? VERIFICATION_ISSUES_FIELD.VEHICLE_PLATE_NUMBER
                            : VERIFICATION_ISSUES_FIELD.VEHICLE_YEAR
                );

            if (vehicle_verification_issue_delete_error) {
                throw new Error(
                    `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
                );
            }



            const vehicle_verification_issues = await getVehicleVerificationIssues();


            let isUpdatedToPendng = false;

            if (vehicle_verification_issues.length == 0) {
                const { error } = await supabase
                    .from("Vehicle_Verification")
                    .update({ verification_status: VERIFICATION_STATUS.PENDING })
                    .eq("vehicle_id", vehicleId)

                if (error) {
                    throw new Error(`Error updating vehicle verification status: ${error.message}`);
                }

                isUpdatedToPendng = true;

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

           console.log("isUpdatedToPending: ", isUpdatedToPendng);
           
            setPendingVehicleUpdate({
                vehicleId: vehicleId,
                vehicle_capacity: openEditVehicleInfoBottomSheet === "vehicle_capacity" ? vehicleCapacity : pendingVehicleUpdate?.vehicle_capacity,
                vehicle_plate_number: openEditVehicleInfoBottomSheet === "plate_number" ? plateNumber : pendingVehicleUpdate?.vehicle_plate_number,
                vehicle_year: openEditVehicleInfoBottomSheet === "year" ? year : pendingVehicleUpdate?.vehicle_year,
                vehicleInfoVerificationIssues: vehicle_verification_issues.length,
                 vehicleVerificationStatus: isUpdatedToPendng? VERIFICATION_STATUS.PENDING : vehicleVerificationStatus,
                vehicle_type: pendingVehicleUpdate?.vehicle_type,
                vehicle_url: pendingVehicleUpdate?.vehicle_url,
                vehicleDocumentVerificationStatus: pendingVehicleUpdate?.vehicleDocumentVerificationStatus,
                vehicleDocumentVerificationIssues: pendingVehicleUpdate?.vehicleDocumentVerificationIssues,
            })

            if (openEditVehicleInfoBottomSheet == "vehicle_capacity") {
                setParentVehicleCapacity(vehicleCapacity);
                onUpdateVehicle({
                    vehicle_capacity: vehicleCapacity
                })
            } else if (openEditVehicleInfoBottomSheet == "plate_number") {
                setParentPlateNumber(plateNumber);
                onUpdateVehicle({
                    plate_number: plateNumber
                })
            } else {
                setParentYear(year)
                onUpdateVehicle({
                    vehicle_year: year
                })
            }
            setShowLoadingSpinner(false);

        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
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
                    <Pressable onPress={() => setOpenEditVehicleInfoBottomSheet(null)} style={styles.closeBtn}>
                        <AntDesign name="close" color={Colors.text.black} size={18} />
                    </Pressable>
                    <View>
                        <Text style={styles.headerLabelText}>{headerText}</Text>
                    </View>
                    <View style={{ marginTop: 20, gap: 15 }}>
                        <BottomSheetTextInput
                            value={sheetValue}
                            onChangeText={sheetOnChangeValue}
                            keyboardType={sheetKeyboardType}
                            style={styles.inputBox}
                            selectionColor={Colors.primary}
                            autoFocus={true}
                            placeholder={sheetPlaceholderText}
                            placeholderTextColor={Colors.text.placeholder}
                            maxLength={sheetMaxLength}
                        />
                        <Pressable onPress={updateVehicleInformation} style={[styles.confirmBtn, { backgroundColor: isInputValid ? Colors.primary : Colors.disabledBtn }]}>
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