import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/colors'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import { RouteProp } from "@react-navigation/native";

type RoleSelectionRouteProp = RouteProp<
    RootAuthStackParamList,
    "RoleSelection"
>;

type Props = {
    route: RoleSelectionRouteProp;
};


type RoleSelectionNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "RoleSelection">;


type roleType = "Merchant" | "Driver"

export default function RoleSelection({ route }: Props) {
    const { mobileNo, email, country, countryCode, callingCode } = route.params;
    const [role, setRole] = useState<roleType>("Merchant");
    const navigation = useNavigation<RoleSelectionNavigationProp>();


    const goToPreviousScreen = () => {
        navigation.goBack()
    }

    const navigateToUserDetailsScreen = () => {
        const phone_number = !mobileNo || !callingCode? mobileNo : mobileNo.slice(callingCode.length)
        navigation.navigate("MerchantInfo", {
            mobileNo: phone_number,
            email: email,
            role: role,
            country: country,
            countryCode: countryCode,
            callingCode: callingCode
            
        })
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.body}>
                <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                    <Feather name="arrow-left" size={22} color="#111827" />
                </Pressable>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.headerText}>What are you using{"\n"} Nano for?</Text>
                    <Text style={styles.headerDesc}>Select your role to personalize your experience</Text>
                </View>

                <View>

                    <Pressable onPress={() => setRole("Merchant")} style={{ ...styles.borderBox, borderColor: role == "Merchant" ? Colors.primary : "gray", borderWidth: role == "Merchant" ? 2 : 1 }}>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <View style={{ justifyContent: "center", alignItems: "center", width: 20, height: 20, backgroundColor: role == "Merchant" ? Colors.primary : undefined, borderRadius: 20, marginRight: 10 }}>
                                    <View style={{ width: 10, height: 10, backgroundColor: role == "Merchant" ? "#ffffff" : undefined, borderRadius: 10 }}></View>
                                </View>

                                <View>
                                    <Text style={{ fontWeight: "600", color: "#111827", fontSize: 15 }}>Merchant</Text>
                                    <View>
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



                    <Pressable onPress={() => setRole("Driver")} style={{ ...styles.borderBox, borderColor: role == "Driver" ? Colors.primary : "gray", borderWidth: role == "Driver" ? 2 : 2 }}>
                        <View >
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <View style={{ justifyContent: "center", alignItems: "center", width: 20, height: 20, backgroundColor: role == "Driver" ? Colors.primary : undefined, borderRadius: 20, marginRight: 10, borderColor: role == "Driver" ? "#111827" : undefined, borderWidth: role == "Driver" ? 0 : 1 }}>
                                    <View style={{ width: 10, height: 10, backgroundColor: role == "Driver" ? "#ffffff" : undefined, borderRadius: 10 }}></View>
                                </View>

                                <View>
                                    <Text style={{ fontWeight: "600", color: "#111827", fontSize: 15 }}>Driver</Text>
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
                <View style={{ marginTop: 30 }}>
                    <Pressable onPress={navigateToUserDetailsScreen} style={styles.nextBtn}>
                        <Text style={styles.nextText}>Next</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
    borderBox: {
        marginTop: 20,
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.primary
    },
    nextBtn: {
        width: "100%",
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        marginTop: 20
    },
    nextText: {
        color: Colors.text.white,
        fontWeight: "bold",
        fontSize: 16
    },
})