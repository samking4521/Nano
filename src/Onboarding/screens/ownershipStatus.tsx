import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import ProgressLevel from './components/progressLevel'
import { useNavigation } from '@react-navigation/native'
import { OwnershipStatusNavigationProp } from '../../Navigation/OnboardingNavigation'
import VehicleInfoModal from './components/vehicleInfoModal'
import { driverStorage } from '../../localStorage/driverStorage'

const ownership_status_img = require("../../../assets/onboarding/ownership_status_img.png");

export type ownershipType = "OWNER" | "HIRED";

export default function OwnershipStatus() {
    const [ownershipStatus, setOwnershipStatus] = useState<ownershipType | null>(() => {
        const storedStatus = driverStorage.getString("ownershipStatus");
        return storedStatus === "OWNER" || storedStatus === "HIRED" ? storedStatus : null;
    });
    const [openVehicleModal, setOpenVehicleModal] = useState(false);
    const DATA_LEVEL = useRef(3);
    const DETAILS_LEVEL = DATA_LEVEL.current
    const navigation = useNavigation<OwnershipStatusNavigationProp>();


    const isVehicleInfoComplete = driverStorage.getBoolean("isVehicleInfoComplete");

    const goToPreviousScreen = () => {
        navigation.goBack()
    }

    const updateOwnershipStatus = (status: ownershipType) => {
        if (status == "OWNER") {
            setOpenVehicleModal(true);
        } else {
            setOwnershipStatus("HIRED");
        }
    }

    const continueToSubmitScreen = () => {
        if (!ownershipStatus) {
            Alert.alert(
                'Ownership status required',
                'Please choose whether you own the vehicle or are a hired driver to continue.'
            );
            return;
        }
        if (ownershipStatus === "HIRED") {
            driverStorage.set("ownershipStatus", "HIRED");
        }
        navigation.navigate("SubmitScreen");
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1, paddingHorizontal: 15, }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}

            >
                <View style={styles.headerContainer}>
                    <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                        <Feather name="arrow-left" size={22} color={Colors.text.black} />
                    </Pressable>
                    <Text style={styles.headerText}>Details</Text>
                    <View style={{ ...styles.backBtn, backgroundColor: undefined }}>
                    </View>
                </View>




                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="never"
                    showsVerticalScrollIndicator={false}
                    style={styles.body}>

                    <ProgressLevel progressLevel={DETAILS_LEVEL} />
                    <View style={styles.infoCont}>
                        <Text style={styles.headerText}>Ownership Status</Text>
                        <Text style={styles.headerDesc}>Tell us how you operate so we can set up your account correctly</Text>
                    </View>

                    <View style={styles.imageCont}>
                        <Image source={ownership_status_img} style={styles.image} />
                    </View>


                    <View>
                        <Pressable onPress={() => updateOwnershipStatus("OWNER")} style={[styles.roleCont, { borderColor: ownershipStatus == "OWNER" ? Colors.primary : Colors.borderColor }]}>
                            <View style={ownershipStatus == "OWNER" ? styles.selectCont : styles.unselectCont}>
                                {ownershipStatus !== "OWNER" ? undefined : <View style={styles.innerSelectCont} />}
                            </View>
                            <View>
                                <Text style={styles.roleText}>Owner Driver</Text>
                                <Text style={styles.headerDesc}>I own the truck i drive</Text>
                                <View>
                                    <View style={{ marginTop: 10 }}>
                                        <View style={styles.roleDescCont}>
                                            <Feather name="check-circle" size={20} color={isVehicleInfoComplete ? Colors.primary : "black"} />
                                            <Text style={styles.roleDesc}>Add your truck details</Text>
                                        </View>
                                        <View style={styles.roleDescCont}>
                                            <Feather name="check-circle" size={20} color="black" />
                                            <Text style={styles.roleDesc}>Assign yourself or another verified driver</Text>

                                        </View>
                                        <View style={styles.roleDescCont}>
                                            <Feather name="check-circle" size={20} color="black" />
                                            <Text style={styles.roleDesc}>Choose who receives payments</Text>

                                        </View>
                                    </View>

                                </View>
                            </View>
                        </Pressable>



                        <Pressable onPress={() => updateOwnershipStatus("HIRED")} style={[styles.roleCont, { borderColor: ownershipStatus == "HIRED" ? Colors.primary : Colors.borderColor }]}>
                            <View style={ownershipStatus == "HIRED" ? styles.selectCont : styles.unselectCont}>
                                {ownershipStatus !== "HIRED" ? undefined : <View style={styles.innerSelectCont} />}

                            </View>
                            <View>
                                <Text style={styles.roleText}>Hired Driver</Text>
                                <Text style={styles.headerDesc}>I drive the truck owned by someone else.</Text>
                                <View>
                                    <View style={{ marginTop: 10 }}>
                                        <View style={styles.roleDescCont}>
                                            <Feather name="check-circle" size={20} color="black" />
                                            <Text style={styles.roleDesc}>Receive truck assignments from owners.</Text>
                                        </View>
                                        <View style={styles.roleDescCont}>
                                            <Feather name="check-circle" size={20} color="black" />
                                            <Text style={styles.roleDesc}>Accept or decline assignments</Text>

                                        </View>
                                        <View style={styles.roleDescCont}>
                                            <Feather name="check-circle" size={20} color="black" />
                                            <Text style={styles.roleDesc}>Start delivering after verification</Text>

                                        </View>
                                    </View>

                                </View>
                            </View>
                        </Pressable>

                    </View>



                </ScrollView>
                <View style={{ paddingVertical: 5 }}>
                    <Pressable onPress={continueToSubmitScreen} style={styles.nextBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
            {openVehicleModal && <VehicleInfoModal setOpenVehicleModal={setOpenVehicleModal} setOwnershipStatus={setOwnershipStatus} />}

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
        paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight,
    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text.black

    },
    infoCont: {
        marginTop: 10
    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 5,
        color: Colors.text.gray,

    },
    imageCont: {
        width: "100%",
        height: 200,
        borderRadius: 10,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
    },
    selectCont: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.primary,
        width: 20,
        height: 20,
        borderRadius: 20,
        marginRight: 10,


    },
    unselectCont: {
        borderWidth: 2,
        borderColor: Colors.borderColor,
        width: 20,
        height: 20,
        borderRadius: 20,
        marginRight: 10,
    },
    innerSelectCont: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: Colors.primary


    },
    roleCont: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 2,
        borderColor: Colors.borderColor,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    roleText: {
        fontWeight: "600", color: Colors.text.black, fontSize: 15

    },
    roleDesc: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text.black,
        marginLeft: 10
    },
    roleDescCont: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    nextBtn: {
        height: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        marginTop: 15
    },
    continueText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },

})