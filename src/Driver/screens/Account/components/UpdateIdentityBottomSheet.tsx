import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign } from '@expo/vector-icons'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { identityFieldType } from '../screens/IdentityInfo'
import { supabase } from '../../../../lib/supabase'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { DRIVER_DOCUMENT_TYPE, VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { identityInfoVerificationType } from '../screens/Profile'

type UpdateIdentityProps = {
    openEditBottomSheet: identityFieldType
    setOpenEditBottomSheet: React.Dispatch<React.SetStateAction<identityFieldType | null>>
    ninNo: string
    setNinNo: React.Dispatch<React.SetStateAction<string>>
    driverLicenseNo: string
    setDriverLicenseNo: React.Dispatch<React.SetStateAction<string>>
    driverLicenseExpiryDate: string
    setDriverLicenseExpiryDate: React.Dispatch<React.SetStateAction<string>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    identityInfoVerificationIssues: any[] | null
    setIdentityInfoVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
    setNinVerificationStatus: React.Dispatch<React.SetStateAction<identityInfoVerificationType>>
    setDriverLicenseVerificationStatus: React.Dispatch<React.SetStateAction<identityInfoVerificationType>>

}

export default function UpdateIdentityBottomSheet({ openEditBottomSheet, setOpenEditBottomSheet, ninNo: parentNinNo, setNinNo: setParentNinNo, driverLicenseNo: parentDriverLicenseNo, setDriverLicenseNo: setParentDriverLicenseNo, driverLicenseExpiryDate: parentDriverLicenseExpiryDate, setDriverLicenseExpiryDate: setParentDriverLicenseExpiryDate, setShowLoadingSpinner, setShowErrorAlert, identityInfoVerificationIssues, setIdentityInfoVerificationIssues, setNinVerificationStatus, setDriverLicenseVerificationStatus }: UpdateIdentityProps) {
    const session = useAuthStore((store) => store.session);
    const [ninNo, setNinNo] = useState(() => parentNinNo ?? "");
    const [driverLicenseNo, setDriverLicenseNo] = useState(() => parentDriverLicenseNo ?? "");
    const [driverLicenseExpiryDate, setDriverLicenseExpiryDate] = useState(() => parentDriverLicenseExpiryDate ?? "");


    const SheetEditHeaderText = openEditBottomSheet == "nin_no" ? "Edit Nin Number" : openEditBottomSheet == "license_no" ? "Edit License Number" : "Edit License Expiry Date";
    const SheetEditKeyboardType = openEditBottomSheet == "license_no" ? "default" : "number-pad";
    const SheetEditTextValue = openEditBottomSheet == "nin_no" ? ninNo : openEditBottomSheet == "license_no" ? driverLicenseNo : driverLicenseExpiryDate;
    const SheetEditTextOnChangeValue = openEditBottomSheet == "nin_no" ? setNinNo : setDriverLicenseNo;
    const SheetEditPlaceholder = openEditBottomSheet == "nin_no" ? "Enter nin number" : openEditBottomSheet == "license_no" ? "Enter driver license number" : "yyyy-mm-dd";
    const SheetEditMaxLength = openEditBottomSheet == "nin_no" ? 11 : openEditBottomSheet == "license_no" ? 12 : 10;


    const setExpiryDate = (value: string) => {
        setDriverLicenseExpiryDate(formatDateInput(value));
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

    function isUppercaseAlphanumeric(text: string): boolean {
        return /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]+$/.test(text);
    }

    const isDateValid = (date: string): boolean => {
        return /^\d{4}-\d{2}-\d{2}$/.test(date);
    }

    const isInputValid = openEditBottomSheet == "nin_no" ? (ninNo.trim() !== "" && ninNo.length == 11) : openEditBottomSheet == "license_no" ? (isUppercaseAlphanumeric(driverLicenseNo) && driverLicenseNo.length == 12) : isDateValid(driverLicenseExpiryDate);


    const udpateIdentityInfo = async () => {
        try {
            if (!isInputValid) return;
            setShowLoadingSpinner(true);
            setOpenEditBottomSheet(null);

            const field = openEditBottomSheet;
            const value =
                field === 'nin_no' ? ninNo.trim() :
                    field === 'license_no' ? driverLicenseNo.trim() :
                        driverLicenseExpiryDate;

            const { data, error } = await supabase.rpc('update_identity_info', {
                p_field: field,
                p_value: value,
            });

            if (error) {
                throw new Error(`Error updating identity info: ${error.message}`);
            }

            const { updated, verification_issues, nin_verification_status, driver_license_verification_status } = data;

            if (field === 'nin_no') {
                setParentNinNo(updated.document_number);
            } else if (field === 'license_no') {
                setParentDriverLicenseNo(updated.document_number);
            } else {
                setParentDriverLicenseExpiryDate(updated.expiry_date);
            }

            setIdentityInfoVerificationIssues(verification_issues);
            setNinVerificationStatus(nin_verification_status);
            setDriverLicenseVerificationStatus(driver_license_verification_status);

            setShowLoadingSpinner(false);

        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }
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
                    <Pressable onPress={() => setOpenEditBottomSheet(null)} style={styles.closeBtn}>
                        <AntDesign name="close" color={Colors.text.black} size={18} />
                    </Pressable>
                    <View>
                        <Text style={styles.headerLabelText}>{SheetEditHeaderText}</Text>
                    </View>
                    <View style={{ marginTop: 20, gap: 15 }}>
                        <BottomSheetTextInput
                            value={SheetEditTextValue}
                            onChangeText={openEditBottomSheet == "license_expiry_date" ? (value) => setExpiryDate(value) : SheetEditTextOnChangeValue}
                            keyboardType={SheetEditKeyboardType}
                            style={styles.inputBox}
                            selectionColor={Colors.primary}
                            autoFocus={true}
                            placeholder={SheetEditPlaceholder}
                            placeholderTextColor={Colors.text.placeholder}
                            maxLength={SheetEditMaxLength}
                        />
                        <Pressable onPress={udpateIdentityInfo} style={[styles.confirmBtn, { backgroundColor: isInputValid ? Colors.primary : Colors.disabledBtn }]}>
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