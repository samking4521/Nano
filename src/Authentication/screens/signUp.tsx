import { Pressable, StyleSheet, Text, TextInput, View, Image, StatusBar, ScrollView, ActivityIndicator, Alert, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { supabase } from '../../lib/supabase'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import * as WebBrowser from "expo-web-browser";
import CountryPicker, { Country } from 'react-native-country-picker-modal'
import { useAuthStore } from '../../store/authStore'

const countryPickerProps = {
    withFilter: true,
    withFlag: true,
    withCountryNameButton: false,
    withAlphaFilter: true,
    withCallingCode: true,
    withEmoji: true,
};

WebBrowser.maybeCompleteAuthSession();

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "SignUp">;
type errorType = "emptyMobileNo";
const googleIcon = require("../../../assets/google_icon.png");

export default function SignUp() {
    const setSession = useAuthStore((store)=> store.setSession);
    const [mobileNo, setMobileNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<errorType | null>(null);
    const navigation = useNavigation<SignUpScreenNavigationProp>();
    const [country, setCountry] = useState<Country>();
    const [inputFocus, setInputFocus] = useState(false);


    const callingCode = country?.callingCode[0] ?? "234";
    const countryCode = country?.cca2 ?? 'NG';
    const countryName = typeof country?.name === 'string'
        ? country.name
        : country?.name?.common ?? 'Nigeria'

    const onSelect = (country: Country) => {
        console.log("country: ", country);
        setCountry(country);
       
    }

    const signUpWithMobileNumber = async () => {
         if (loading) {
            return;
        }
        
        if (mobileNo.length == 0) {
            setError("emptyMobileNo");
            return;
        }
       
        const phone_number = formatNigerianPhone(mobileNo);
        console.log("phone_number: ", phone_number);
        setLoading(true)
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phone_number,
        })
        if (error) {
            console.log("OTP send error:", error.message);
            Alert.alert(
                "Unable to Continue",
                "We couldn't verify your phone number. Please check the number or your internet connection, then try again."
            );
            setLoading(false);
            return;
        }

        console.log("OTP sent successfully:", data);

        setLoading(false);
        const formatedPhoneNumber = removePlus(phone_number);
        navigation.navigate("VerificationCode", {
            mobileNo: formatedPhoneNumber,
            country: countryName,
            countryCode: countryCode,
            callingCode: callingCode
        })


    }




    function removePlus(phone: string) {
        return phone.replace(/^\+/, "");
    }

    const formatNigerianPhone = (input: string) => {
        let phone = input.trim();

        // remove spaces
        phone = phone.replace(/\s+/g, "");

        // if starts with 0 → remove it
        if (phone.startsWith("0")) {
            phone = phone.slice(1);
        }

        // if already starts with callingCode → don't double add
        if (phone.startsWith(callingCode)) {
            return `+${phone}`;
        }

        // if already has +
        if (phone.startsWith("+")) {
            return phone;
        }

        // default case → add +callingCode
        return `+${callingCode}${phone}`;
    }

    const goToPreviousScreen = () => {
        navigation.goBack()
    }



    const signInWithGoogle = async () => {
        if (loading) return;

        try {
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: "nano://auth/callback",
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (!data?.url) throw new Error("No OAuth URL returned");

            const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                "nano://auth/callback"
            );

            if (result.type !== "success") return;

            let code: string | null = null;
            try {
                code = new URL(result.url).searchParams.get("code");
            } catch {
                throw new Error("Failed to parse redirect URL");
            }

            if (!code) throw new Error("No code in redirect URL");

            const { data: sessionData, error: sessionError } =
                await supabase.auth.exchangeCodeForSession(code);

            if (sessionError) throw sessionError;

             setSession(sessionData.session);
            
            console.log("Signed in:", sessionData.session?.user?.email);

            navigation.navigate("RoleSelection", {
                 mobileNo: null,
                email: sessionData.session?.user?.email || null,
                country: null,
                countryCode: null,
                callingCode: null,
               
            })


        } catch (err) {
            console.error("Google sign-in failed:", err);    
                 Alert.alert(
                "Google Sign-In Failed",
                "Something went wrong while signing in with Google. Check your connection and try again."
                  );
        }
    };


   

    useEffect(()=>{
         if (error == "emptyMobileNo" && mobileNo.length == 1) {
        setError(null);
    }
    }, [error, mobileNo])


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
                        <Feather name="arrow-left" size={22} color={Colors.text.black} />
                    </Pressable>

                    <View>

                        <View>
                            <View style={styles.headerLabel}>
                                <Text style={styles.headerText}>Create an Account</Text>
                                <Text style={styles.headerDesc}>Get access to Trusted truck drivers, transparent pricing, live tracking, reliable deliveries.</Text>
                            </View>

                            <View style={styles.infoCont}>
                                <Text style={styles.mobileLabel}>Mobile Number</Text>
                                <View style={{ ...styles.mobileTextInputContainer, borderColor: error == "emptyMobileNo" ? Colors.error : inputFocus ? Colors.primary : Colors.borderColor }}>
                                    <View style={{ ...styles.mobileCodeCont, borderRightColor: error == "emptyMobileNo" ? Colors.error : inputFocus ? Colors.primary : Colors.borderColor }}>
                                        <CountryPicker
                                            {...countryPickerProps}
                                            countryCode={countryCode}
                                            onSelect={onSelect}

                                        />
                                    </View>
                                    <View style={styles.mobileInputCont}>
                                        <Text style={styles.mobileCodeText}>+{callingCode}</Text>
                                        <TextInput
                                            value={mobileNo}
                                            onChangeText={setMobileNo}
                                            placeholder='Enter number here'
                                            keyboardType="phone-pad"
                                            style={styles.mobileTextInput}
                                            onFocus={() => setInputFocus(true)}
                                            onBlur={() => setInputFocus(false)}

                                        />
                                    </View>

                                </View>
                                {error == "emptyMobileNo" && <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>Mobile number cannot be empty</Text>
                                </View>}
                            </View>

                            <Pressable onPress={signUpWithMobileNumber} style={styles.nextBtn}>
                                {loading ? <ActivityIndicator size={'large'} color={Colors.text.white} /> : <Text style={styles.continueText}>Continue</Text>}
                            </Pressable>

                        </View>



                    </View>
                    <View>
                        <View style={styles.horizontalLineCont}>
                            <View style={styles.horizontalLine} />
                            <Text style={styles.orText}>or continue with</Text>
                            <View style={styles.horizontalLine} />
                        </View>

                        <View>
                            <Pressable onPress={signInWithGoogle} style={styles.actionBtnCont}>
                                <Image source={googleIcon} style={styles.googleIcon} />
                                <Text style={styles.actionBtnText}>Continue with Google</Text>
                            </Pressable>
                        </View>
                    </View>



                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    body: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight

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
        paddingHorizontal: 5,


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
    mobileInputCont: {
        flexDirection: "row", alignItems: "center"
    },
    mobileLabel: {
        marginBottom: 10,
        fontSize: 16,
        color: Colors.text.black,
        fontWeight: "600"
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
    horizontalLine: {
        width: "20%",
        height: 1,
        backgroundColor: Colors.text.gray
    },
    horizontalLineCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 25
    },
    orText: {
        marginHorizontal: 10,
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text.gray
    },
    googleIcon: {
        width: 30,
        height: 30,
        resizeMode: "contain",

    },
    actionBtnCont: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

    },
    actionBtnText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text.gray
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
    }

})