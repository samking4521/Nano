import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, TouchableOpacity, Alert } from 'react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { useNavigation, usePreventRemove } from '@react-navigation/native'
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal'
import DatePicker from 'react-native-date-picker'
import { Colors } from '../../constants/theme/colors'
import { shipperStorage } from '../../localStorage/shipperStorage'
import { ShipperInfoNavigationProp, ShipperInfoRouteProp } from '../../Navigation/OnboardingNavigation'
import { useAuthStore } from '../../Authentication/store/authStore'
import { supabase } from '../../lib/supabase'
import { USER_ROLES } from '../../constants/shared_user'
import { uploadUser } from '../../utils/uploadUser'
import { ShipperAppNavigationProp } from '../../Navigation/RootNavigation'
import { signUpDataStorage } from '../../localStorage/signUpDataStorage'
import LoadingSpinner from '../../utils/loadingSpinner'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES, SPACING } from '../../constants/theme/font'



type errorType = "emptyMobileNo" | "empty_email" | "incorrect_email" | "empty_firstname" | "empty_lastname" | "empty_business" | "empty_dob";
type inputFocusType = "mobile_number" | "email" | "first_name" | "last_name" | "business_name" | "birthday";

const countryPickerProps = {
    withFilter: true,
    withFlag: true,
    withCountryNameButton: false,
    withAlphaFilter: true,
    withCallingCode: true,
    withEmoji: true,
};

type Props = {
    route: ShipperInfoRouteProp;
}

export default function ShipperInfo({ route }: Props) {
    const session = useAuthStore((store) => store.session);

    const { mobileNo: phone_number, email: emailVal, country: countryNameVal, countryCode: countryCodeVal, callingCode: callingCodeVal } = route.params;
    const [country, setCountry] = useState<Country | null>(() => {
        const jsonCountry = shipperStorage.getString("country");
        if (!jsonCountry) return null;
        return JSON.parse(jsonCountry);
    });
    const [isSubmitting, setIsSubmitting] = useState(true);
    const controllerRef = useRef<AbortController | null>(null);

    const [mobileNo, setMobileNo] = useState(() => shipperStorage.getString("mobileNo") ?? "");
    const [email, setEmail] = useState(() => shipperStorage.getString("email") ?? "");
    const [firstname, setFirstName] = useState(() => shipperStorage.getString("firstname") ?? "");
    const [lastname, setLastName] = useState(() => shipperStorage.getString("lastname") ?? "");
    const [businessName, setBusinessName] = useState(() => shipperStorage.getString("businessName") ?? "")
    const [dob, setDob] = useState<Date>(() => {
        const dobString = shipperStorage.getString("dob");
        console.log("dob string", dobString);
        return dobString ? new Date(dobString) : new Date();
    });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false)
    const [datePicked, setDatePicked] = useState(false);
    const [clickedContinue, setClickedContinue] = useState(false);
    const navigation = useNavigation<ShipperInfoNavigationProp>();
    const shipper_navigation = useNavigation<ShipperAppNavigationProp>();

    const [inputFocus, setInputFocus] = useState<inputFocusType | null>(null);
    const [error, setError] = useState<errorType | null>(null);


    const callingCode = country?.callingCode[0] ?? "234";
    const countryCode = country?.cca2 ?? 'NG';


    const onSelect = (country: Country) => {
        console.log("country: ", country);
        setCountry(country);

    }

    function stripCountryCode(fullPhone: string | null | undefined, callingCode: string | null | undefined) {
        if (!fullPhone) return "";
        if (!callingCode) return fullPhone;
        return fullPhone.replace(`+${callingCode}`, '');
    }

    const formatNigerianPhone = (input: string, callingCode: string): string => {
        let phone = input.trim().replace(/\s+/g, "");

        // strip a leading + if present, we'll re-add it consistently
        if (phone.startsWith("+")) {
            phone = phone.slice(1);
        }

        // strip callingCode if already present
        if (phone.startsWith(callingCode)) {
            phone = phone.slice(callingCode.length);
        }

        // now strip a leading 0 (handles both "0907..." and "+2340907..." cases)
        if (phone.startsWith("0")) {
            phone = phone.slice(1);
        }

        return `+${callingCode}${phone}`;
    };

    const formatDate = (date: Date) => {
        const day = date.getDate();

        const getOrdinal = (n: number) => {
            if (n > 3 && n < 21) return `${n}th`;

            switch (n % 10) {
                case 1:
                    return `${n}st`;
                case 2:
                    return `${n}nd`;
                case 3:
                    return `${n}rd`;
                default:
                    return `${n}th`;
            }
        };

        const month = date.toLocaleString("en-US", {
            month: "short",
        });

        const year = date.getFullYear();

        return `${getOrdinal(day)} ${month}, ${year}`;
    };

    const shipperLocalStorageDob = useMemo(() => {
        return shipperStorage.getString("dob");
    }, []);



    const goToPreviousScreen = () => {
        navigation.goBack()
    }

    const isAtLeast18YearsOld = (dateOfBirth: Date): boolean => {
        const today = new Date();

        let age = today.getFullYear() - dateOfBirth.getFullYear();

        const hasHadBirthdayThisYear =
            today.getMonth() > dateOfBirth.getMonth() ||
            (today.getMonth() === dateOfBirth.getMonth() &&
                today.getDate() >= dateOfBirth.getDate());

        if (!hasHadBirthdayThisYear) {
            age--;
        }

        return age >= 18;
    };

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    const phone = phone_number || mobileNo;
    const mail = emailVal || email;
    const isMailValid = isValidEmail(mail);
    const isAgeValid = isAtLeast18YearsOld(dob);
    const firstname_err = clickedContinue && firstname.trim() === "";
    const lastname_err = clickedContinue && lastname.trim() === "";
    const mobile_no_err = clickedContinue && phone.trim() === "";
    const email_length_err = clickedContinue && mail.trim() === "";
    const email_valid_err = clickedContinue && mail.length > 0 && !isMailValid;
    const dob_err = clickedContinue && (!datePicked && !shipperLocalStorageDob);
    const dob_err_less_18 = datePicked && !isAgeValid;



    const continueToHomeScreen = () => {
        setClickedContinue(true);
        const phone = phone_number || formatNigerianPhone(mobileNo, callingCode);
        const mail = emailVal || email;
        const isMailValid = isValidEmail(mail);
        const isAgeValid = isAtLeast18YearsOld(dob);

        const hasErrors = [
            firstname.trim() === "",
            lastname.trim() === "",
            phone.trim() === "",
            mail.trim() === "",
            mail.length > 0 && !isMailValid,
            (!datePicked && !shipperLocalStorageDob),
            datePicked && !isAgeValid,

        ].some(Boolean);

        if (hasErrors) return;

        const country_obj = {
            callingCode: callingCodeVal ?? country?.callingCode,
            countryCode: countryCode ?? country?.cca2,
            countryName: countryNameVal ?? country?.name
        }
        const countryObj = JSON.stringify(country_obj);
        shipperStorage.set("firstname", firstname);
        shipperStorage.set("lastname", lastname);
        shipperStorage.set("mobileNo", phone);
        if (businessName) {
            shipperStorage.set("businessName", businessName);
        }
        shipperStorage.set("email", mail);
        shipperStorage.set("dob", dob.toISOString().slice(0, 10));
        shipperStorage.set("country", countryObj);
        setLoading(true);
        submitOnboarding();
    };



    const uploadShipperInfo = async (signal: AbortSignal) => {
        const firstname = shipperStorage.getString("firstname");
        const lastname = shipperStorage.getString("lastname");
        const birthday = shipperStorage.getString("dob");
        const business_name = shipperStorage.getString("businessName");

        const { data: select_shipper_data, error: select_shipper_data_err } = await supabase
            .from("Shipper")
            .select("id")
            .eq("id", session?.user.id)
            .abortSignal(signal)
            .maybeSingle();

        if (select_shipper_data_err) {
            throw new Error(`Error querying if Shipper exists: ${select_shipper_data_err.message}`)
        }

        if (!select_shipper_data?.id) {
            const { error } = await supabase
                .from("Shipper")
                .insert({
                    firstname: firstname,
                    lastname: lastname,
                    birthday: birthday,
                    business_name: businessName ? business_name : null,
                }).abortSignal(signal);

            if (error) {
                throw new Error(`Error uploading shipper info: ${error.message}`)
            }

            console.log("Success: Shipper info uploaded");

        } else {
            const { error: err_update_shipper } = await supabase
                .from("Shipper")
                .update({
                    firstname: firstname,
                    lastname: lastname,
                    birthday: birthday,
                    business_name: businessName ? business_name : null,
                })
                .eq("id", session?.user.id).abortSignal(signal);


            if (err_update_shipper) {
                throw new Error(`Error updating shipper info: ${err_update_shipper.message}`)
            }
        }

        const { error: err_user } = await supabase
            .from("User")
            .update({ has_shipper_profile: true })
            .eq("id", session?.user.id).abortSignal(signal);


        if (err_user) {
            throw new Error(`Error updating User with key - has_shipper_profile: ${err_user.message}`)
        }


    }


    const submitOnboarding = async () => {
        const controller = new AbortController();
        controllerRef.current = controller;
        try {
            if (!session) return;
            if (controller.signal.aborted) return;

            await uploadUser(session, shipperStorage, USER_ROLES.SHIPPER, controller.signal);
            if (controller.signal.aborted) return;

            await uploadShipperInfo(controller.signal);
            if (controller.signal.aborted) return;

            console.log("Success onboarding");
            shipperStorage.clearAll();
            signUpDataStorage.clearAll();
            setLoading(false);
            requestAnimationFrame(() => {
                shipper_navigation.replace("Shipper");
            })
        } catch (error) {
            if (controller.signal.aborted) {
                console.log("controller abort error")
                return;
            }
            setLoading(false);
            console.log(error);
            Alert.alert(
                "Submission Failed",
                "We couldn't submit your information. Please check your internet connection and try again.",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => {
                            // do nothing
                        },
                    },
                    {
                        text: "Retry",
                        onPress: () => {
                            setLoading(true);
                            submitOnboarding();
                        },
                    },
                ]
            );
        }


    }



    useEffect(() => {
        return () => {
            console.log("unmount called")
            controllerRef.current?.abort();
        };
    }, []);


    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="never"
                    style={styles.body}>

                    <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                        <Feather name="arrow-left" size={ICON_SIZES.lg} color="#111827" />
                    </Pressable>
                    <View>
                        <View style={styles.headerLabel}>
                            <Text style={styles.headerText}>Let's get you ready</Text>
                            <Text style={styles.headerDesc}>Tell us a little about yourself and start booking pickup trucks in minutes</Text>
                        </View>

                        <View style={styles.infoCont}>

                            <View style={styles.nameBoxContainer}>
                                <View style={{ flex: 1, marginRight: 5, }}>
                                    <Text style={styles.mobileLabel}>First name</Text>
                                    <View style={[styles.inputBoxCont, { height: 50, borderColor: firstname_err ? Colors.error : inputFocus == "first_name" ? Colors.primary : Colors.borderColor }]}>
                                        <TextInput
                                            value={firstname}
                                            onChangeText={setFirstName}
                                            placeholder='John'
                                            keyboardType="default"
                                            placeholderTextColor={Colors.text.placeholder}
                                            selectionColor={Colors.primary}
                                            style={styles.mobileTextInput}
                                            onFocus={() => setInputFocus("first_name")}
                                            onBlur={() => setInputFocus(null)}
                                        />
                                    </View>
                                    {firstname_err && <View style={styles.errorBox}>
                                        <Text style={styles.errorText}>First name cannot be empty</Text>
                                    </View>}
                                </View>


                                <View style={{ flex: 1, marginLeft: 5, }}>
                                    <Text style={styles.mobileLabel}>Last name</Text>
                                    <View style={[styles.inputBoxCont, { height: 50, borderColor: lastname_err ? Colors.error : inputFocus == "last_name" ? Colors.primary : Colors.borderColor }]}>

                                        <TextInput
                                            value={lastname}
                                            onChangeText={setLastName}
                                            placeholder='Doe'
                                            keyboardType="default"
                                            placeholderTextColor={Colors.text.placeholder}
                                            selectionColor={Colors.primary}
                                            style={styles.mobileTextInput}
                                            onFocus={() => setInputFocus("last_name")}
                                            onBlur={() => setInputFocus(null)}

                                        />
                                    </View>
                                    {lastname_err && <View style={styles.errorBox}>
                                        <Text style={styles.errorText}>Lastname cannot be empty</Text>
                                    </View>}
                                </View>


                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Mobile Number</Text>
                                <View pointerEvents={phone_number ? "none" : "auto"} style={{ ...styles.mobileTextInputContainer, borderColor: mobile_no_err ? Colors.error : inputFocus == "mobile_number" ? Colors.primary : Colors.borderColor }}>
                                    <View style={[styles.mobileCodeCont, { borderRightColor: mobile_no_err ? Colors.error : inputFocus == "mobile_number" ? Colors.primary : Colors.borderColor }]}>
                                        <CountryPicker
                                            {...countryPickerProps}
                                            countryCode={countryCodeVal as CountryCode || countryCode}
                                            onSelect={onSelect}

                                        />
                                    </View>
                                    <View style={styles.mobileInputCont}>
                                        <Text style={styles.mobileCodeText}>+{callingCodeVal || callingCode}</Text>
                                        <TextInput
                                            value={stripCountryCode(phone_number, callingCodeVal) || mobileNo}
                                            onChangeText={setMobileNo}
                                            placeholder='Enter number here'
                                            placeholderTextColor={Colors.text.placeholder}
                                            keyboardType="number-pad"
                                            selectionColor={Colors.primary}
                                            style={styles.mobileTextInput}
                                            onFocus={() => setInputFocus("mobile_number")}
                                            onBlur={() => setInputFocus(null)}
                                        />
                                    </View>

                                </View>
                                {mobile_no_err && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>Mobile number cannot be empty</Text>
                                </View>}
                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Email</Text>
                                <View pointerEvents={emailVal ? "none" : "auto"} style={[styles.inputBoxCont, { borderColor: (email_length_err || email_valid_err) ? Colors.error : inputFocus == "email" ? Colors.primary : Colors.borderColor }]}>
                                    <TextInput
                                        value={emailVal || email}
                                        onChangeText={setEmail}
                                        placeholder='johndoe@gmail.com'
                                        keyboardType="email-address"
                                        placeholderTextColor={Colors.text.placeholder}
                                        selectionColor={Colors.primary}
                                        style={styles.mobileTextInput}
                                        onFocus={() => setInputFocus("email")}
                                        onBlur={() => setInputFocus(null)}

                                    />
                                </View>
                                {(email_length_err || email_valid_err) && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{email_length_err ? "Email cannot be empty" : "Email not valid"}</Text>
                                </View>}
                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Business name (optional)</Text>
                                <View style={[styles.inputBoxCont, { borderColor: error == "empty_business" ? Colors.error : inputFocus == "business_name" ? Colors.primary : Colors.borderColor }]}>
                                    <TextInput
                                        value={businessName}
                                        onChangeText={setBusinessName}
                                        placeholder='John Furnitures'
                                        keyboardType="default"
                                        placeholderTextColor={Colors.text.placeholder}
                                        selectionColor={Colors.primary}
                                        style={styles.mobileTextInput}
                                        onFocus={() => setInputFocus("business_name")}
                                        onBlur={() => setInputFocus(null)}

                                    />
                                </View>

                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Birthday</Text>
                                <TouchableOpacity onPress={() => setOpen(true)} style={[styles.inputBoxCont, { flexDirection: "row", alignItems: "center", borderColor: dob_err ? Colors.error : Colors.borderColor, paddingHorizontal: 10 }]}>
                                    <Text style={[styles.birthdayText, { color: (shipperLocalStorageDob || datePicked) ? Colors.text.gray : Colors.text.placeholder }]}>{(shipperLocalStorageDob || datePicked) ? formatDate(dob) : "Enter your birthday"}</Text>
                                    <FontAwesome name="calendar" size={ICON_SIZES.lg} color={Colors.primary} />
                                    {
                                        open && <DatePicker
                                            modal
                                            mode="date"
                                            open={open}
                                            date={dob}
                                            onConfirm={(date) => {
                                                setOpen(false)
                                                setDob(date)
                                                setDatePicked(true)
                                            }}
                                            onCancel={() => {
                                                setOpen(false)
                                            }}
                                        />
                                    }
                                </TouchableOpacity>
                                <View style={styles.discountBox}>
                                    <Text style={styles.discountText}>Enjoy free delivery on your birthday.</Text>
                                </View>
                                {(dob_err || dob_err_less_18) && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{dob_err ? "Birthday cannot be empty" : "You must be at least 18 years of age"}</Text>
                                </View>}
                            </View>


                        </View>


                    </View>

                </ScrollView>
                <View style={styles.footerCont}>
                    <Pressable onPress={continueToHomeScreen} style={styles.nextBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>

                </View>


            </KeyboardAvoidingView>
            <Text style={styles.footerText}>By signing up, you agree to Nano's Terms and Privacy Policy.</Text>

            {
                loading && <LoadingSpinner text={"Creating your profile"} />
            }

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        padding: 15,
        paddingBottom: 50
    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    headerLabel: {
        marginTop: 20,
    },
    headerText: {
        fontSize: FONT_SIZES.xxl,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black

    },
    headerDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        marginTop: SPACING.xs,
        color: Colors.text.gray,
        lineHeight: 20
    },
    infoCont: {
        marginTop: 20
    },
    mobileLabel: {
        marginBottom: SPACING.sm,
        fontSize: FONT_SIZES.sm,
        color: Colors.text.black,
        fontFamily: FONTS.medium
    },
    mobileTextInputContainer: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        backgroundColor: Colors.borderBackground,
        borderRadius: 50,
        flexDirection: "row",
        alignItems: "center",
    },
    inputBoxCont: {
        height: 50,
        borderWidth: 1,
        backgroundColor: Colors.borderBackground,
        borderRadius: 50,
    },
    mobileCodeCont: {
        height: 50,
        borderRightWidth: 1,
        borderRightColor: Colors.borderColor,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 12
    },
    mobileCodeText: {
        fontSize: 12,
        fontFamily: FONTS.semiBold,
        color: Colors.text.gray,
        padding: 5
    },
    mobileTextInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        color: Colors.text.gray,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
    },
    mobileInputCont: {
        flex: 1,
        flexShrink: 1,
        flexDirection: "row",
        alignItems: "center"
    },
    nameBoxContainer: {
        flexDirection: "row",
        alignItems: "flex-start"
    },
    errorBox: {
        marginTop: 10,
        width: "100%",
        padding: 10,
        backgroundColor: Colors.errorBackground,
        borderRadius: BORDER_RADIUS.lg

    },
    errorText: {
        color: Colors.error,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
    },
    discountBox: {
        marginTop: 10,
        width: "100%",
        padding: 10,
        backgroundColor: "#FFF4EB",
        borderRadius: BORDER_RADIUS.lg

    },
    discountText: {
        color: Colors.primary,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
    },
    nextBtn: {
        height: 50,
        borderRadius: BORDER_RADIUS.round,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        marginTop: 20
    },
    continueText: {
        color: Colors.text.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.md
    },
    birthdayText: {
        marginRight: "auto",
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        color: Colors.text.gray
    },
    footerText: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        marginTop: 5,
        color: Colors.text.gray,
        paddingHorizontal: 15,
        textAlign: "center"
    },
    footerCont: {
        paddingHorizontal: 15,
        paddingTop: 0,
        padding: 10
    }

})