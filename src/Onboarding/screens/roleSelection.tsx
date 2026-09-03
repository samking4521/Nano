import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/theme/colors'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useAuthStore } from '../../Authentication/store/authStore'
import { driverStorage } from '../../localStorage/driverStorage'
import { RoleSelectionNavigationProp } from '../../Navigation/OnboardingNavigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { OnboardingStackParamList } from '../onboarding'
import { signUpDataStorage } from '../../localStorage/signUpDataStorage'
import { AuthNavigationProp } from '../../Navigation/RootNavigation'
import { supabase } from '../../lib/supabase'
import { shipperStorage } from '../../localStorage/shipperStorage'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES, SPACING } from '../../constants/theme/font'

type Props = NativeStackScreenProps<
    OnboardingStackParamList,
    "RoleSelection"
>;

type roleType = "Shipper" | "Driver"

const role_desc_img = require("../../../assets/onboarding/role_desc_img.png");

export default function RoleSelection({ route }: Props) {
    const [role, setRole] = useState<roleType>("Shipper");
    const userId = useAuthStore((store) => store.session?.user.id);
    const navigation = useNavigation<RoleSelectionNavigationProp>();
    const replaceNavigation = useNavigation<AuthNavigationProp>();
    const setSession = useAuthStore((store) => store.setSession);

    const mobileNo = route.params?.mobileNo ?? signUpDataStorage.getString("mobileNo");
    const email = route.params?.email ?? signUpDataStorage.getString("email");
    const country = route.params?.country ?? signUpDataStorage.getString("country");
    const countryCode = route.params?.countryCode ?? signUpDataStorage.getString("countryCode");
    const callingCode = route.params?.callingCode ?? signUpDataStorage.getString("callingCode");




    const storeSignUpData = () => {
        const localSignUpDataId = signUpDataStorage.getString("id");
        console.log("localSignUpDataId: ", localSignUpDataId);

        if (localSignUpDataId) {
            if (localSignUpDataId !== userId) {
                console.log("not equals user");
                signUpDataStorage.clearAll();
                signUpDataStorage.set("id", userId ?? "");
                signUpDataStorage.set("mobileNo", mobileNo ?? "");
                signUpDataStorage.set("email", email ?? "");
                signUpDataStorage.set("country", country ?? "");
                signUpDataStorage.set("countryCode", countryCode ?? "");
                signUpDataStorage.set("callingCode", callingCode ?? "");
            }

        } else {
            signUpDataStorage.set("id", userId ?? "");
            signUpDataStorage.set("mobileNo", mobileNo ?? "");
            signUpDataStorage.set("email", email ?? "");
            signUpDataStorage.set("country", country ?? "");
            signUpDataStorage.set("countryCode", countryCode ?? "");
            signUpDataStorage.set("callingCode", callingCode ?? "");
            console.log("data stored")
        }
    }

    useEffect(() => {
        if (!userId) {
            return
        }
        storeSignUpData();
    }, [userId])

    const signOut = async () => {
        const { error } = await supabase.auth.signOut({ scope: "local" })
        if (error) {
            console.log("error signing out");
            return;
        }
        console.log("Sign out successful")

    }

    const goToPreviousScreen = () => {

        Alert.alert(
            "Leave Onboarding?",
            "Going back will clear your current onboarding progress. Proceed?",
            [
                {
                    text: "Stay",
                    onPress: () => console.log("Cancelled"),
                },
                {
                    text: "Leave",
                    onPress: () => {
                        shipperStorage.clearAll();
                        driverStorage.clearAll();
                        signUpDataStorage.clearAll();
                        signOut();
                        replaceNavigation.replace("Auth");
                    },
                }
            ]
        )


    }



    const navigateToUserDetailsScreen = () => {

        if (!userId) {
            return;
        }


        if (role === "Shipper") {
            navigation.navigate("ShipperInfo", {
                mobileNo: mobileNo ?? "",
                email: email ?? "",
                country: country ?? "",
                countryCode: countryCode ?? "",
                callingCode: callingCode ?? ""
            })
        } else {
            const localDriverStorageId = driverStorage.getString("id");
            console.log("localDriverStorageId: ", localDriverStorageId);

            if (localDriverStorageId) {
                if (localDriverStorageId !== `driver-${userId}`) {
                    console.log("not equals driver");
                    driverStorage.clearAll();
                    driverStorage.set("id", `driver-${userId}`);
                    driverStorage.set("role", role);
                }

            } else {
                driverStorage.set("id", `driver-${userId}`);
                driverStorage.set("role", role);
            }

            navigation.navigate("DriverInfo", {
                mobileNo: mobileNo ?? "",
                email: email ?? "",
                country: country ?? "",
                countryCode: countryCode ?? "",
                callingCode: callingCode ?? ""
            })
        }
    }

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} style={styles.body}>
                <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                    <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
                </Pressable>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.headerText}>What are you using{"\n"}Nano for?</Text>
                    <Text style={styles.headerDesc}>Select your role to personalize your experience</Text>
                </View>

                <View style={styles.imageCont}>
                    <Image source={role_desc_img} style={styles.image} />
                </View>

                <View>

                    <Pressable onPress={() => setRole("Shipper")} style={[styles.borderBox, {borderColor: role == "Shipper" ? Colors.primary : Colors.borderColor, borderWidth: role == "Shipper" ? 2 : 1 }]}>
                        <View>
                            <View style={styles.roleContainer}>
                                <View style={[styles.roleRadioButton, {backgroundColor: role == "Shipper" ? Colors.primary : undefined, borderColor: role == "Shipper" ? undefined : Colors.borderColor, borderWidth: role == "Shipper" ? 0 : 1 }]}>
                                    <View style={[styles.roleButtonInnerCont, {backgroundColor: role == "Shipper" ? Colors.text.white : undefined }]}></View>
                                </View>

                                <View style={styles.viewTextCont}>
                                    <Text style={styles.roleText}>Shipper</Text>
                                    <View >
                                        <Text style={styles.headerDesc}>
                                            Find available trucks on demand
                                        </Text>
                                        <Text style={styles.headerDesc}>Track goods in real time</Text>
                                        <Text style={styles.headerDesc}>Get transparent pricing upfront</Text>
                                    </View>
                                </View>


                            </View>


                        </View>
                    </Pressable>



                    <Pressable onPress={() => setRole("Driver")} style={[styles.borderBox, {borderColor: role == "Driver" ? Colors.primary : Colors.borderColor, borderWidth: role == "Driver" ? 2 : 1 }]}>
                        <View >
                            <View style={styles.roleContainer}>
                                <View style={[styles.roleRadioButton, {backgroundColor: role == "Driver" ? Colors.primary : undefined, borderRadius: 20, marginRight: 10, borderColor: role == "Driver" ? undefined : Colors.borderColor, borderWidth: role == "Driver" ? 0 : 1 }]}>
                                    <View style={[styles.roleButtonInnerCont, {backgroundColor: role == "Driver" ? Colors.text.white : undefined }]}></View>
                                </View>

                                <View style={styles.viewTextCont}>
                                    <Text style={styles.roleText}>Driver</Text>
                                    <View>
                                        <Text style={styles.headerDesc}>
                                            Receive delivery jobs on demand
                                        </Text>
                                        <Text style={styles.headerDesc}>Reduce empty return trips</Text>
                                        <Text style={styles.headerDesc}>Manage availability in real time</Text>
                                    </View>
                                </View>


                            </View>


                        </View>
                    </Pressable>


                </View>

            </ScrollView>
            <View style={styles.footerCont}>
                <Pressable onPress={navigateToUserDetailsScreen} style={styles.nextBtn}>
                    <Text style={styles.nextText}>Next</Text>
                </Pressable>
            </View>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    body: {
        padding: 15,
    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
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
    },
    borderBox: {
        marginTop: 20,
        padding: 10,
        borderRadius: BORDER_RADIUS.lg,
    },
    nextBtn: {
        width: "100%",
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
    },
    nextText: {
        color: Colors.text.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.md
    },
    roleContainer: {
        flexDirection: "row", 
        alignItems: "flex-start"
    },
    roleRadioButton: {
        justifyContent: "center", 
        alignItems: "center", 
        width: 20, 
        height: 20, 
        borderRadius: 20, 
        marginRight: 10,
    },
    roleButtonInnerCont: {
        width: 10, 
        height: 10, 
        borderRadius: 10,
    },
    roleText: {
        fontFamily: FONTS.semiBold, 
        color: Colors.text.black, 
        fontSize: FONT_SIZES.md
    },
    imageCont: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginVertical: 10
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: BORDER_RADIUS.lg
    },
    viewTextCont: {
      
        flexShrink: 1
    },
    footerCont: {
        paddingHorizontal: 15, 
        paddingTop: 10, 
        paddingBottom: 20
    }
})