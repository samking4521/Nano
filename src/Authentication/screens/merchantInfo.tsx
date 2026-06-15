import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { RouteProp, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal'
import DatePicker from 'react-native-date-picker'
import { Colors } from '../../constants/colors'


type MerchantInfoNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "MerchantInfo">;
type MerchantInfoRouteProp = RouteProp<
    RootAuthStackParamList,
    "MerchantInfo"
>;

type Props = {
    route: MerchantInfoRouteProp;
};
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

export default function MerchantInfo({ route }: Props) {

    const { mobileNo: phone_number, email: emailVal, country: countryNameVal, countryCode: countryCodeVal, callingCode: callingCodeVal } = route.params;
    const [country, setCountry] = useState<Country | null>(null)
    const [mobileNo, setMobileNo] = useState("");
    const [email, setEmail] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [businessName, setBusinessName] = useState("")
    const [dob, setDob] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [datePicked, setDatePicked] = useState(false);
    const [loading, setLoading] = useState(false);

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


    const navigation = useNavigation<MerchantInfoNavigationProp>()

    const goToPreviousScreen = () => {
        navigation.goBack()
    }

    const continueToSignUp = ()=>{
        
        const phone = phone_number? phone_number : mobileNo;
        const mail = emailVal? emailVal : email;
       if(firstname.length <= 0){
      
           setError("empty_firstname");
           return;
       }
        if(lastname.length <= 0){
           setError("empty_lastname");
           return;
       }
        if(phone.length <=0){
            setError("emptyMobileNo");
            return;
        }
          if(mail.length <=0){
            setError("empty_email");
            return;
        }
          if(businessName.length <=0){
            setError("empty_business");
            return;
        }
         if(!datePicked){
            setError("empty_dob");
            return;
        }


    }
    
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
                                    <View style={{ ...styles.inputBoxCont, flex: 1, borderColor: error == "empty_firstname" ? Colors.error : inputFocus == "first_name" ? Colors.primary : Colors.borderColor }}>

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
                                    {error == "empty_firstname" && <View style={styles.errorBox}>
                                        <Text style={styles.errorText}>Mobile number cannot be empty</Text>
                                    </View>}
                                </View>


                                <View style={{ flex: 1, marginLeft: 5, }}>
                                    <Text style={styles.mobileLabel}>Last name</Text>
                                    <View style={{ ...styles.inputBoxCont, flex: 1, borderColor: error == "empty_lastname" ? Colors.error : inputFocus == "last_name" ? Colors.primary : Colors.borderColor }}>

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
                                    {error == "empty_lastname" && <View style={styles.errorBox}>
                                        <Text style={styles.errorText}>Lastname cannot be empty</Text>
                                    </View>}
                                </View>


                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Mobile Number</Text>
                                <View pointerEvents={phone_number ? "none" : "auto"} style={{ ...styles.mobileTextInputContainer, borderColor: error == "emptyMobileNo" ? Colors.error : inputFocus == "mobile_number" ? Colors.primary : Colors.borderColor }}>
                                    <View style={{ ...styles.mobileCodeCont, borderRightColor: error == "emptyMobileNo" ? Colors.error : inputFocus == "mobile_number" ? Colors.primary : Colors.borderColor }}>
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
                                {error == "emptyMobileNo" && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>Mobile number cannot be empty</Text>
                                </View>}
                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Email</Text>
                                <View pointerEvents={emailVal ? "none" : "auto"} style={{ ...styles.inputBoxCont, borderColor: error == "empty_email" ? Colors.error : inputFocus == "email" ? Colors.primary : Colors.borderColor }}>
                                    <TextInput
                                        value={emailVal ?? email}
                                        onChangeText={setEmail}
                                        placeholder='johndoe@gmail.com'
                                        keyboardType="email-address"
                                        style={styles.mobileTextInput}
                                        onFocus={() => setInputFocus("email")}
                                        onBlur={() => setInputFocus(null)}

                                    />
                                </View>
                                {error == "empty_email" || error == "incorrect_email" && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{error == "incorrect_email" ? "Email not valid" : "Email cannot be empty"}</Text>
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
                                <TouchableOpacity onPress={() => setOpen(true)} style={{ ...styles.inputBoxCont, flexDirection: "row", alignItems: "center", borderColor: error == "empty_dob"? Colors.error :  Colors.borderColor, paddingHorizontal: 10 }}>
                                    <Text style={{ marginRight: "auto", fontSize: 14, fontWeight: "500", color: Colors.text.gray }}>{datePicked ? formatDate(dob) : "Enter your birthday"}</Text>
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
                                {!error && <View style={styles.discountBox}>
                                    <Text style={styles.discountText}>Enjoy free delivery on your birthday.</Text>
                                </View>}
                                {error == "empty_dob" && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>Birthday cannot be empty</Text>
                                </View>}
                            </View>


                        </View>

                        <Pressable onPress={continueToSignUp} style={styles.nextBtn}>
                            <Text style={styles.continueText}>Continue</Text>
                        </Pressable>

                        <Text style={{...styles.headerDesc, marginTop: 20}}>By signing up, you agree to Nano's Terms and Privacy Policy.</Text>
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
        backgroundColor: "#EAEAEA",
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
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    inputBoxCont: {
        height: 50,
        borderWidth: 1,
        backgroundColor: Colors.borderBackground,
        borderRadius: 12,
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
        flexDirection: "row", alignItems: "center"
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
        borderRadius: 12,
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