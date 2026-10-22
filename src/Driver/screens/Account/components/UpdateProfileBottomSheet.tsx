import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign } from '@expo/vector-icons'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { fieldType } from '../screens/PersonalInfo'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'

type UpdateBottomSheetProps = {
    openEditBottomSheet: fieldType | null
    setOpenEditBottomSheet: React.Dispatch<React.SetStateAction<fieldType | null>>
    setFirstName: React.Dispatch<React.SetStateAction<string>>
    setLastName: React.Dispatch<React.SetStateAction<string>>
    setBirthday: React.Dispatch<React.SetStateAction<string>>
    setPhone: React.Dispatch<React.SetStateAction<string>>
    setEmail: React.Dispatch<React.SetStateAction<string>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    firstname: string
    lastname: string
    birthday: string
    phone: string
    email: string
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    setPersonalInfoVerificationIssues: (data: any[] | null) => void
    setDriverVerificationStatus: (status: VERIFICATION_STATUS) => void
}

export default function UpdateProfileBottomSheet({ openEditBottomSheet, setOpenEditBottomSheet, setFirstName: setParentFirstName, setLastName: setParentLastName, setBirthday: setParentBirthday, setPhone: setParentPhone, setEmail: setParentEmail, setShowLoadingSpinner, firstname: parentFirstName, lastname: parentLastName, birthday: parentBirthday, email: parentEmail, phone: parentPhone, setShowErrorAlert, setPersonalInfoVerificationIssues, setDriverVerificationStatus }: UpdateBottomSheetProps) {
    const [firstname, setFirstname] = useState(() => (parentFirstName) ?? "");
    const [lastname, setLastname] = useState(() => (parentLastName) ?? "");
    const [phone, setPhone] = useState(() => (parentPhone) ?? "");
    const [email, setEmail] = useState(() => (parentEmail) ?? "");
    const [dob, setDob] = useState(() => (parentBirthday) ?? "");


    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isDobValid = (dob: string): boolean => {
        return /^\d{4}-\d{2}-\d{2}$/.test(dob);
    }

    const isNameValid = (name: string): boolean => {
        return /^\s*\S+\s*$/.test(name)
    }



    const isInputValid = openEditBottomSheet == "firstname" ? isNameValid(firstname) : openEditBottomSheet == "lastname" ? isNameValid(lastname) : openEditBottomSheet == "email" ? isValidEmail(email) : openEditBottomSheet == "phone" ? (phone.trim() !== "" && phone.length == 11) : isDobValid(dob);

    const SheetEditHeaderText = openEditBottomSheet == "firstname" ? "Edit Firstname" : openEditBottomSheet == "lastname" ? "Edit Lastname" : openEditBottomSheet == "email" ? "Edit Email" : openEditBottomSheet == "phone" ? "Edit Phone" : "Edit Birthday";
    const SheetEditKeyboardType = openEditBottomSheet == "phone" ? "number-pad" : openEditBottomSheet == "email" ? "email-address" : openEditBottomSheet == "birthday" ? "number-pad" : "default";
    const SheetEditTextValue = openEditBottomSheet == "firstname" ? firstname : openEditBottomSheet == "lastname" ? lastname : openEditBottomSheet == "email" ? email : openEditBottomSheet == "phone" ? phone : dob;
    const SheetEditTextOnChangeValue = openEditBottomSheet == "firstname" ? setFirstname : openEditBottomSheet == "lastname" ? setLastname : openEditBottomSheet == "email" ? setEmail : setPhone;
    const SheetEditPlaceholder = openEditBottomSheet == "firstname" ? "Enter your firstname" : openEditBottomSheet == "lastname" ? "Enter your lastname" : openEditBottomSheet == "email" ? "Enter your email" : openEditBottomSheet == "phone" ? "Enter your phone" : "yyyy-mm-dd";
    const SheetEditMaxLength = openEditBottomSheet == "firstname" ? 30 : openEditBottomSheet == "lastname" ? 30 : openEditBottomSheet == "email" ? undefined : openEditBottomSheet == "phone" ? 11 : 10;


    
    const setBirthday = (value: string) => {
        setDob(formatDateInput(value));
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


    const updateProfileField = async () => {
        try {
            if (!isInputValid) return;
            setShowLoadingSpinner(true);
            setOpenEditBottomSheet(null);

            const field = openEditBottomSheet;
            const value =
                field === 'email' ? email.trim() :
                    field === 'phone' ? phone.trim() :
                        field === 'firstname' ? firstname.trim() :
                            field === 'lastname' ? lastname.trim() :
                                dob;

            const { data, error } = await supabase.rpc('update_profile_field', {
                p_field: field,
                p_value: value,
            });

            if (error) {
                throw new Error(`Error updating profile: ${error.message}`);
            }

            const { updated, verification_issues, verification_status } = data;

            if (field === 'email') setParentEmail(updated.email);
            else if (field === 'phone') setParentPhone(updated.phone);
            else if (field === 'firstname') setParentFirstName(updated.firstname);
            else if (field === 'lastname') setParentLastName(updated.lastname);
            else if (field === 'birthday') setParentBirthday(updated.birthday);

            setPersonalInfoVerificationIssues(verification_issues);
            setDriverVerificationStatus(verification_status);

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
                            onChangeText={openEditBottomSheet == "birthday" ? (value) => setBirthday(value) : SheetEditTextOnChangeValue}
                            keyboardType={SheetEditKeyboardType}
                            style={styles.inputBox}
                            selectionColor={Colors.primary}
                            autoFocus={true}
                            placeholder={SheetEditPlaceholder}
                            placeholderTextColor={Colors.text.placeholder}
                            maxLength={SheetEditMaxLength}
                        />
                        <Pressable onPress={updateProfileField} style={[styles.confirmBtn, { backgroundColor: isInputValid ? Colors.primary : Colors.disabledBtn }]}>
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