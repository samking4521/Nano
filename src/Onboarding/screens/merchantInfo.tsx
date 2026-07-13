import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, TouchableOpacity } from 'react-native'
import { useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal'
import DatePicker from 'react-native-date-picker'
import { Colors } from '../../constants/colors'
import { shipperStorage } from '../../localStorage/shipperStorage'
import { MerchantInfoNavigationProp, MerchantInfoRouteProp } from '../../Navigation/OnboardingNavigation'



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
    route: MerchantInfoRouteProp;
}

export default function MerchantInfo({route}: Props) {

    const { mobileNo: phone_number, email: emailVal, country: countryNameVal, countryCode: countryCodeVal, callingCode: callingCodeVal } = route.params;
    const [country, setCountry] = useState<Country | null>(() => {
           const jsonCountry = shipperStorage.getString("country");
           if (!jsonCountry) return null;
           return JSON.parse(jsonCountry);
       });
    const [mobileNo, setMobileNo] = useState(()=> shipperStorage.getString("mobileNo") ?? "");
    const [email, setEmail] = useState(()=> shipperStorage.getString("email") ?? "");
    const [firstname, setFirstName] = useState(()=> shipperStorage.getString("firstname") ?? "");
    const [lastname, setLastName] = useState(()=> shipperStorage.getString("lastname") ?? "");
    const [businessName, setBusinessName] = useState(()=> shipperStorage.getString("businessName") ?? "")
    const [dob, setDob] = useState<Date>(() => {
           const dobString = shipperStorage.getString("dob");
           console.log("dob string", dobString);
           return dobString ? new Date(dobString) : new Date();
       });
    const [open, setOpen] = useState(false)
    const [datePicked, setDatePicked] = useState(false);
    const [clickedContinue, setClickedContinue] = useState(false);
        const navigation = useNavigation<MerchantInfoNavigationProp>()

    const [inputFocus, setInputFocus] = useState<inputFocusType | null>(null);
    const [error, setError] = useState<errorType | null>(null);


    const callingCode = country?.callingCode[0] ?? "234";
    const countryCode = country?.cca2 ?? 'NG';
    const countryName = typeof country?.name === 'string'
        ? country.name
        : country?.name?.common ?? 'Nigeria'

    const onSelect = (country: Country) => {
        console.log("country: ", country);
        setCountry(country);

    }

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

     const  shipperLocalStorageDob = useMemo(()=> {
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
            const phone = phone_number || mobileNo;
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
            shipperStorage.set("businessName", businessName);
            shipperStorage.set("email", mail);
            shipperStorage.set("dob", dob.toISOString());
            shipperStorage.set("country", countryObj);
    
    
            console.log("Working")
        };
    
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    style={styles.body}>

                    <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                        <Feather name="arrow-left" size={22} color="#111827" />
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
                                    <View style={{ ...styles.inputBoxCont, height: 50, borderColor: firstname_err ? Colors.error : inputFocus == "first_name" ? Colors.primary : Colors.borderColor }}>
                                        <TextInput
                                            value={firstname}
                                            onChangeText={setFirstName}
                                            placeholder='John'
                                            keyboardType="default"
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
                                    <View style={{ ...styles.inputBoxCont, height: 50, borderColor: lastname_err ? Colors.error : inputFocus == "last_name" ? Colors.primary : Colors.borderColor }}>

                                        <TextInput
                                            value={lastname}
                                            onChangeText={setLastName}
                                            placeholder='Doe'
                                            keyboardType="default"
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
                                    <View style={{ ...styles.mobileCodeCont, borderRightColor: mobile_no_err ? Colors.error : inputFocus == "mobile_number" ? Colors.primary : Colors.borderColor }}>
                                        <CountryPicker
                                            {...countryPickerProps}
                                            countryCode={countryCodeVal as CountryCode ?? countryCode}
                                            onSelect={onSelect}

                                        />
                                    </View>
                                    <View style={styles.mobileInputCont}>
                                        <Text style={styles.mobileCodeText}>+{callingCodeVal ?? callingCode}</Text>
                                        <TextInput
                                            value={phone_number ?? mobileNo}
                                            onChangeText={setMobileNo}
                                            placeholder='Enter number here'
                                            keyboardType="phone-pad"
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
                                <View pointerEvents={emailVal ? "none" : "auto"} style={{ ...styles.inputBoxCont, borderColor: (email_length_err || email_valid_err) ? Colors.error : inputFocus == "email" ? Colors.primary : Colors.borderColor }}>
                                    <TextInput
                                        value={emailVal || email}
                                        onChangeText={setEmail}
                                        placeholder='johndoe@gmail.com'
                                        keyboardType="email-address"
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
                                <View style={{ ...styles.inputBoxCont, borderColor: error == "empty_business" ? Colors.error : inputFocus == "business_name" ? Colors.primary : Colors.borderColor }}>
                                    <TextInput
                                        value={businessName}
                                        onChangeText={setBusinessName}
                                        placeholder='John Furnitures'
                                        keyboardType="default"
                                        style={styles.mobileTextInput}
                                        onFocus={() => setInputFocus("business_name")}
                                        onBlur={() => setInputFocus(null)}

                                    />
                                </View>

                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Birthday</Text>
                                <TouchableOpacity onPress={() => setOpen(true)} style={{ ...styles.inputBoxCont, flexDirection: "row", alignItems: "center", borderColor: dob_err ? Colors.error : Colors.borderColor, paddingHorizontal: 10 }}>
                                    <Text style={{ marginRight: "auto", fontSize: 14, fontWeight: "500", color: Colors.text.gray }}>{ (shipperLocalStorageDob || datePicked)? formatDate(dob) : "Enter your birthday"}</Text>
                                    <FontAwesome name="calendar" size={22} color={Colors.primary} />
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
                                {(dob_err || dob_err_less_18 ) && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{dob_err? "Birthday cannot be empty" : "You must be at least 18 years of age"}</Text>
                                </View>}
                            </View>


                        </View>

                        <Pressable onPress={continueToHomeScreen} style={styles.nextBtn}>
                            <Text style={styles.continueText}>Continue</Text>
                        </Pressable>

                        <Text style={{ ...styles.headerDesc, marginTop: 20 }}>By signing up, you agree to Nano's Terms and Privacy Policy.</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        padding: 15
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
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.text.black

    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 10,
        color: Colors.text.gray
    },
    infoCont: {
        marginTop: 20
    },
    mobileLabel: {
        marginBottom: 10,
        fontSize: 14,
        color: Colors.text.black,
        fontWeight: "600"
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
        paddingHorizontal: 10
    },
    mobileCodeText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.text.gray,
        padding: 5
    },
    mobileTextInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,



    },
    mobileInputCont: {
        flexDirection: "row", alignItems: "center"
    },
    nameBoxContainer: {
        flexDirection: "row", alignItems: "flex-start"
    },
    errorBox: {
        marginTop: 10,
        width: "100%",
        padding: 10,
        backgroundColor: Colors.errorBackground,
        borderRadius: 12

    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        fontWeight: "500"
    },
    discountBox: {
        marginTop: 10,
        width: "100%",
        padding: 10,
        backgroundColor: "#FFF4EB",
        borderRadius: 12

    },
    discountText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: "500"
    },
    nextBtn: {
        height: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        marginTop: 20
    },
    continueText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },
})