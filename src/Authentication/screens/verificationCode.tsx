import { Pressable, StyleSheet, Text, TextInput, View, StatusBar, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Colors } from '../../constants/theme/colors'
import { supabase } from '../../lib/supabase'
import { useNavigation } from '@react-navigation/native'
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from '../store/authStore'
import { VerificationCodeNavigationProp, VerificationCodeRouteProp } from '../../Navigation/AuthUserNavigation'
import { AuthNavigationProp } from '../../Navigation/RootNavigation'
import { USER_ROLES } from '../../constants/shared_user'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES, SPACING } from '../../constants/theme/font'


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

        const formattedPhoneNo = removePlus(mobileNo);
        const {
            data: { session },
            error,
        } = await supabase.auth.verifyOtp({
            phone: formattedPhoneNo,
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



        console.log("session", session?.user.id)
        console.log("user logged in successfully")

        const { data: select_user_data, error: select_user_data_err } = await supabase
            .from("User")
            .select("*")
            .eq("id", session?.user.id)
            .maybeSingle();

        if (select_user_data_err) {
            console.log(`Error querying if User exists: ${select_user_data_err.message}`);
            Alert.alert(
                "Connection Problem",
                "Please check your internet connection and try again."
            );
            setLoading(false);
            return
        }

        if (select_user_data) {
            if (select_user_data.active_role === USER_ROLES.SHIPPER && select_user_data.has_shipper_profile) {
                setSession(session);
                setLoading(false);
                replaceNavigation.replace("Shipper");

            } else if (select_user_data.active_role === USER_ROLES.DRIVER && select_user_data.has_driver_profile) {
                setSession(session);
                setLoading(false);
                replaceNavigation.replace("Driver");
            }
            else {
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

        } else {
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

    }




    function removePlus(phone: string) {
        return phone.replace(/^\+/, "");
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
        <SafeAreaView edges={["top"]} style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    style={styles.body}>
                    <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                        <Feather name="arrow-left" size={ICON_SIZES.xl} color={Colors.text.black} />
                    </Pressable>

                    <View>
                        <View style={styles.headerLabel}>
                            <Text style={styles.headerText}>Enter Verification Code</Text>
                            <Text style={styles.headerDesc}>Enter the 6-digit verification code sent to your phone at {mobileNo} to proceed to login. This code expires in 10 minutes.</Text>
                        </View>

                        <View style={styles.infoCont}>
                            <Text style={styles.otpLabel}>Enter Code</Text>
                            <View style={[styles.otpTextInputContainer, { borderColor: error ? Colors.error : inputFocus ? Colors.primary : Colors.borderColor }]}>

                                <TextInput
                                    value={otp}
                                    onChangeText={setOtp}
                                    placeholder='Enter 6 digit code'
                                    placeholderTextColor={Colors.text.placeholder}
                                    selectionColor={Colors.primary}
                                    keyboardType="number-pad"
                                    style={styles.otpTextInput}
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
                            {resendCode ? <View style={styles.resendLoading}><ActivityIndicator size={"small"} color={Colors.text.gray} /><Text style={styles.resendText}>Resending</Text></View> : <Text style={[styles.resendText, { color: countDownTime <= 0 ? Colors.primary : Colors.text.gray }]}>Resend Code {countDownTime <= 0 ? "" : "in "}</Text>}
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
    },
    otpTextInputContainer: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        backgroundColor: Colors.borderBackground,
        borderRadius: BORDER_RADIUS.round,
        flexDirection: "row",
        alignItems: "center",
    },
    otpTextInput: {
        flex: 1,
        height: 50,
        borderTopRightRadius: BORDER_RADIUS.round,
        borderBottomRightRadius: BORDER_RADIUS.round,
        paddingHorizontal: 15,
        color: Colors.text.black,
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold
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
    otpLabel: {
        marginBottom: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: Colors.text.black,
        fontFamily: FONTS.semiBold
    },
    nextBtn: {
        height: 50,
        borderRadius: BORDER_RADIUS.round,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        marginTop: 20
    },
    verifyText: {
        color: Colors.text.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.md
    },
    footerText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray
    },
    resendText: {
         fontSize: FONT_SIZES.sm,
         fontFamily: FONTS.semiBold,
        color: Colors.text.gray,
        marginLeft: 5
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
        borderRadius: BORDER_RADIUS.lg

    },
    errorText: {
         color: Colors.error,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium
    },
    resendLoading: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 5
    },
    timerText: {
        color: Colors.primary,  
        fontFamily: FONTS.semiBold, 
        letterSpacing: 0.5
    }

})