import { Pressable, StyleSheet, Text, TextInput, View, Image, StatusBar, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Foundation } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { supabase } from '../../lib/supabase'
import Animated, { SlideInLeft, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-web-browser"

WebBrowser.maybeCompleteAuthSession();

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "SignUp">;

const googleIcon = require("../../../assets/googleicon.png")

export default function SignUp() {
    const [mobileNo, setMobileNo] = useState("");

    const [otp, setOtp] = useState("");
    const [verifyCode, setVerifyCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<SignUpScreenNavigationProp>()
    const [countDownTime, setCountDownTime] = useState(60);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startTimer = () => {
        clearTimer(); // clear any existing timer before starting
        setCountDownTime(60);

        timerRef.current = setInterval(() => {
            setCountDownTime((prev) => {
                if (prev <= 1) {
                    clearTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // cleanup on unmount
    useEffect(() => () => clearTimer(), []);



    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const signUpWithMobileNumber = async () => {
        if (loading) {
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
                "We couldn't verify your phone number. Please check the number and your internet connection, then try again."
            );
            setLoading(false);
            return;
        }

        console.log("OTP sent successfully:", data);
        setVerifyCode(true);
        setLoading(false);
        startTimer();

    }

    const verifyOtp = async (otp: string, mobileNo: string) => {
        setLoading(true);
        const number = formatNigerianPhone(mobileNo);
        const phoneNumber = removePlus(number);
        console.log("edit phonenumber : ", phoneNumber);
        const {
            data: { session },
            error,
        } = await supabase.auth.verifyOtp({
            phone: phoneNumber,
            token: otp,
            type: 'sms',
        })

        if (error) {
            console.log("Error verifying otp", error.code, error.cause, error.message, error.name);
            Alert.alert(
                "Verification Failed",
                "Enter a valid verification code or check your internet connection."
            );
            setLoading(false);
            return
        }

        console.log("session", session)
        console.log("user logged in successfully")
        setLoading(false);


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

        // if already starts with 234 → don't double add
        if (phone.startsWith("234")) {
            return `+${phone}`;
        }

        // if already has +
        if (phone.startsWith("+")) {
            return phone;
        }

        // default case → add +234
        return `+234${phone}`;
    }

    const goToPreviousScreen = () => {
        if (verifyCode) {
            setVerifyCode(false);
            setLoading(false); // this is because it shares loading state with Create account view
            setCountDownTime(60);
            clearTimer();
            return
        }
        navigation.goBack()
    }

    const validateOtp = (otp: string) => {
        if (loading) {
            return;
        }
        if (otp.length < 6) {
            Alert.alert(
                "Invalid Code",
                "Please enter all 6 digits of the verification code."
            );
            return;
        }
        verifyOtp(otp, mobileNo);
    }


    const resendVerificationCode = async () => {
        if (countDownTime > 0) {
            return
        }
        const phone_number = formatNigerianPhone(mobileNo);
        console.log("phone_number: ", phone_number);

        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phone_number,
        })
        if (error) {
            console.log("OTP send error:", error.message);
            Alert.alert(
                "Unable to Resend",
                "Please check your internet connection, then try again."
            );

            return;
        }

        console.log("OTP sent successfully:", data);
        Alert.alert("Success", "A new verification code has been sent.");
        startTimer();
    }



    const signInWithGoogle = async () => {

        try {
            if (loading) {
                return
            }
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

            console.log("Signed in:", sessionData.session?.user?.email);
            // TODO: navigate to authenticated screen, e.g. router.replace("/home")


        } catch (err) {
            console.error("Google sign-in failed:", err);
            // TODO: show user-facing error toast/alert
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.body}>


                <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                    <Feather name="arrow-left" size={22} color="#111827" />
                </Pressable>

                <View>
                    {
                        verifyCode ?
                            <Animated.View key={"me"} entering={SlideInRight} exiting={SlideOutRight.duration(1000)}>
                                <View style={styles.headerLabel}>
                                    <Text style={styles.headerText}>Enter Verification Code</Text>
                                    <Text style={styles.headerDesc}>Enter the 6-digit verification code sent to your phone number to proceed to login</Text>
                                </View>

                                <View style={styles.infoCont}>
                                    <Text style={styles.mobileLabel}>Enter Code</Text>
                                    <View style={styles.mobileTextInputContainer}>

                                        <TextInput
                                            value={otp}
                                            onChangeText={setOtp}
                                            placeholder='Enter 6 digit code'
                                            keyboardType="phone-pad"
                                            style={styles.mobileTextInput}
                                            maxLength={6}

                                        />
                                    </View>
                                </View>

                                <Pressable onPress={() => validateOtp(otp)} style={styles.nextBtn}>
                                    {loading ? <ActivityIndicator size={'large'} color={"#ffffff"} /> : <Text style={styles.continueText}>Verify</Text>}
                                </Pressable>
                                {/* {(error && otp.length < 6) && <Text style={styles.errorText}>Verification code must be 6 digits.</Text>}
                                {error && <Text style={styles.errorText}>Unable to verify code, check your internet connection and try again.</Text>} */}
                            </Animated.View>
                            :
                            <View>
                                <View style={styles.headerLabel}>
                                    <Text style={styles.headerText}>Create an Account</Text>
                                    <Text style={styles.headerDesc}>Get access to Trusted truck drivers, transparent pricing, live tracking, reliable deliveries.</Text>
                                </View>

                                <View style={styles.infoCont}>
                                    <Text style={styles.mobileLabel}>Mobile Number</Text>
                                    <View style={styles.mobileTextInputContainer}>
                                        <View style={styles.mobileCodeCont}>
                                            <Text style={styles.mobileCodeText}>(NG) +234</Text>
                                        </View>
                                        <TextInput
                                            value={mobileNo}
                                            onChangeText={setMobileNo}
                                            keyboardType="phone-pad"
                                            style={styles.mobileTextInput}

                                        />
                                    </View>
                                </View>

                                <Pressable onPress={signUpWithMobileNumber} style={styles.nextBtn}>
                                    {loading ? <ActivityIndicator size={'large'} color={"#ffffff"} /> : <Text style={styles.continueText}>Continue</Text>}
                                </Pressable>

                            </View>

                    }

                </View>
                {!verifyCode && <View>
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
                </View>}
                {
                    verifyCode && <View style={styles.footerCont}>
                        <Text style={styles.footerText}>Didn't receive code? </Text>
                        <TouchableOpacity onPress={resendVerificationCode}>
                            <Text style={{ ...styles.resendText, color: countDownTime <= 0 ? Colors.primary : "#4B5563" }}>Resend Code {countDownTime <= 0 ? "" : "in "}</Text>
                        </TouchableOpacity>
                        {countDownTime > 0 && <Text style={{ color: Colors.primary, fontWeight: "600" }}>{formatTime(countDownTime)}</Text>}
                    </View>
                }



            </ScrollView>



        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        paddingHorizontal: 15,
        paddingTop: StatusBar.currentHeight

    },
    mobileTextInputContainer: {
        width: "100%",
        height: 50,
        borderWidth: 0.5,
        borderColor: "#4B5563",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",

    },
    mobileCodeCont: {
        height: 50,
        borderRightWidth: 0.5,
        borderRightColor: "#4B5563",
        justifyContent: "center",
        alignItems: "center"
    },
    mobileCodeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4B5563",
        padding: 5
    },
    mobileTextInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 16,

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
        color: "#111827"

    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 10,
        color: "#4B5563"
    },
    passCont: {
        width: "100%",
        height: 50,
        borderWidth: 0.5,
        borderColor: "#4B5563",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center"
    },
    infoCont: {
        marginTop: 20
    },
    mobileLabel: {
        marginBottom: 10,
        fontSize: 16,
        color: "#111827",
        fontWeight: "bold"
    },
    passwordLabel: {
        marginBottom: 10,
        fontSize: 16,
        color: "#111827",
        fontWeight: "bold"
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
        color: Colors.text.primary,
        fontWeight: "bold",
        fontSize: 16
    },
    horizontalLine: {
        width: "20%",
        height: 1,
        backgroundColor: "#4B5563"
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
        fontWeight: "600",
        color: "#4B5563"
    },
    googleIcon: {
        width: 30,
        height: 30,
        resizeMode: "contain",

    },
    actionBtnCont: {
        width: "100%",
        height: 50,
        borderWidth: 0.5,
        borderColor: "#4B5563",
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

    },
    actionBtnText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "600",
        color: "#4B5563"
    },
    eyeIcon: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center"
    },

    footerText: {

        fontSize: 14,

        color: "#4B5563"
    },
    resendText: {

        fontWeight: "600"
    },
    footerCont: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 30
    }

})