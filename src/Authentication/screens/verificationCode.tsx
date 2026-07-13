import { Pressable, StyleSheet, Text, TextInput, View, StatusBar, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { supabase } from '../../lib/supabase'
import { useNavigation } from '@react-navigation/native'
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from '../store/authStore'
import { VerificationCodeNavigationProp, VerificationCodeRouteProp } from '../../Navigation/AuthUserNavigation'
import { onboardStorage } from '../../localStorage/onboardStorage'
import { AuthNavigationProp } from '../../Navigation/RootNavigation'


type Props = {
    route: VerificationCodeRouteProp;
};


WebBrowser.maybeCompleteAuthSession();

type otpErrorType = "emptyOtp" | "invalidOtpLength";

export default function VerificationCode({ route }: Props) {
    const { mobileNo, country, countryCode, callingCode } = route.params;
    const setSession = useAuthStore((store) => store.setSession);
    const [otp, setOtp] = useState("");
    const [resendCode, setResendCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<otpErrorType | null>(null);
    const navigation = useNavigation<VerificationCodeNavigationProp>();
    const replaceNavigation = useNavigation<AuthNavigationProp>();

    const [countDownTime, setCountDownTime] = useState(60);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [inputFocus, setInputFocus] = useState(false);
    const isMounted = useRef(true);

    console.log("mobileNo", mobileNo);
    useEffect(() => {
        startTimer()
    }, []);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };



    useEffect(() => {
        return () => {
            isMounted.current = false;
            clearTimer();
        };
    }, []);

    const startTimer = () => {
        clearTimer(); // clear any existing timer before starting
        setCountDownTime(60);

        timerRef.current = setInterval(() => {

            setCountDownTime((prev) => {
                if (!isMounted.current) return prev;
                if (prev <= 1) {
                    clearTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };



    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const verifyOtp = async (otp: string, mobileNo: string) => {
        if (loading) return;
        setLoading(true);

        console.log("edit phonenumber : ", mobileNo);
        const {
            data: { session },
            error,
        } = await supabase.auth.verifyOtp({
            phone: mobileNo,
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
        onboardStorage.set("isOnBoardComplete", false);
        setSession(session);
        setLoading(false);

        replaceNavigation.replace("Onboard", {
            mobileNo: mobileNo,
            email: null,
            country: country,
            countryCode: countryCode,
            callingCode: callingCode,
        })
    }


    const goToPreviousScreen = () => {
        navigation.goBack()
    }

    const validateOtp = (otp: string) => {
        if (loading) {
            return;
        }

        if (otp.length < 6) {
            if (otp.length == 0) {
                setError("emptyOtp");
                return
            }
            setError("invalidOtpLength");
            return;
        }

        verifyOtp(otp, mobileNo);
    }


    const resendVerificationCode = async () => {
        if (loading) {
            return
        }

        if (countDownTime > 0) {
            return
        }

        setResendCode(true);



        const { data, error } = await supabase.auth.signInWithOtp({
            phone: mobileNo,
        })
        if (error) {
            console.log("OTP send error:", error.message);
            Alert.alert(
                "Unable to Resend",
                "Please check your internet connection, then try again."
            );
            setResendCode(false);
            return;
        }

        console.log("OTP sent successfully:", data);
        Alert.alert("Success", "A new verification code has been sent.");
        setResendCode(false);
        startTimer();

    }


    useEffect(() => {
        if (error === "emptyOtp" && otp.length > 0) {
            setError(null);
        }

        if (error === "invalidOtpLength" && otp.length === 6) {
            setError(null);
        }
    }, [otp, error]);

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
                        <View style={styles.headerLabel}>
                            <Text style={styles.headerText}>Enter Verification Code</Text>
                            <Text style={styles.headerDesc}>Enter the 6-digit verification code sent to your phone at +{mobileNo} to proceed to login. This code expires in 10 minutes.</Text>
                        </View>

                        <View style={styles.infoCont}>
                            <Text style={styles.otpLabel}>Enter Code</Text>
                            <View style={{ ...styles.otpTextInputContainer, borderColor: error ? Colors.error : inputFocus ? Colors.primary : Colors.borderColor }}>

                                <TextInput
                                    value={otp}
                                    onChangeText={setOtp}
                                    placeholder='Enter 6 digit code'
                                    keyboardType="number-pad"
                                    style={{ ...styles.otpTextInput, paddingHorizontal: 10 }}
                                    maxLength={6}
                                    autoFocus={true}
                                    onFocus={() => setInputFocus(true)}
                                    onBlur={() => setInputFocus(false)}
                                    textContentType="oneTimeCode"
                                    autoComplete="sms-otp"
                                    inputMode="numeric"

                                />
                            </View>
                            {(error == "emptyOtp" || error == "invalidOtpLength") && <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error == "emptyOtp" ? "Otp cannot be empty" : "Please enter all 6 digits of the verification code"}</Text>
                            </View>}
                        </View>

                        <Pressable onPress={() => validateOtp(otp)} style={styles.nextBtn}>
                            {loading ? <ActivityIndicator size={'large'} color={Colors.text.white} /> : <Text style={styles.verifyText}>Verify</Text>}
                        </Pressable>

                    </View>

                    <View style={styles.footerCont}>
                        <Text style={styles.footerText}>Didn't receive code? </Text>
                        <TouchableOpacity onPress={resendVerificationCode}>
                            {resendCode ? <View style={styles.resendLoading}><ActivityIndicator size={"small"} color={Colors.text.gray} /><Text style={styles.resendText}>Resending</Text></View> : <Text style={{ ...styles.resendText, color: countDownTime <= 0 ? Colors.primary : Colors.text.gray }}>Resend Code {countDownTime <= 0 ? "" : "in "}</Text>}
                        </TouchableOpacity>
                        {countDownTime > 0 && <Text style={styles.timerText}>{formatTime(countDownTime)}</Text>}
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
    otpTextInputContainer: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        backgroundColor: Colors.borderBackground,
        borderRadius: 50,
        flexDirection: "row",
        alignItems: "center",
    },
    otpTextInput: {
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
    otpLabel: {
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
    verifyText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },
    footerText: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text.gray
    },
    resendText: {
        fontWeight: "600",
        color: Colors.text.gray
    },
    footerCont: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 30
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
    resendLoading: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 5
    },
    timerText: {
        color: Colors.primary, fontWeight: "600"
    }

})