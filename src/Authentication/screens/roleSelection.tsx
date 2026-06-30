import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/colors'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import { RouteProp } from "@react-navigation/native";
import { useAuthStore } from '../../store/authStore'
import { driverStorage } from '../../localStorage/driverStorage'
import { shipperStorage } from '../../localStorage/shipperStorage'

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
    const userId = useAuthStore((store) => store.session?.user.id);
    const navigation = useNavigation<RoleSelectionNavigationProp>();


    const goToPreviousScreen = () => {
        navigation.goBack()
    }


    // useEffect(()=>{
    //       shipperStorage.clearAll();
    //       driverStorage.clearAll();
    //       console.log("cleared")
    // }, [])
   


    const navigateToUserDetailsScreen = () => {

        const phone_number = !mobileNo || !callingCode ? mobileNo : mobileNo.slice(callingCode.length);

        if (!userId) {
            return;
        }

        if (role === "Merchant") {
              
              const localShipperStorageId = shipperStorage.getString("id");
              console.log("localShipperStorageId: ", localShipperStorageId);
            if (localShipperStorageId) {
                if (localShipperStorageId !== `shipper-${userId}`) {
                    console.log("not equals shipper");
                    shipperStorage.clearAll();
                    shipperStorage.set("id", `shipper-${userId}`);
                    shipperStorage.set("role", role);
                }
                
            } else {
                shipperStorage.set("id", `shipper-${userId}`);
                shipperStorage.set("role", role);
            }
            
            navigation.navigate("MerchantInfo", {
                mobileNo: phone_number,
                email: email,
                role: role,
                country: country,
                countryCode: countryCode,
                callingCode: callingCode,
            })
        } else {
            const localDriverStorageId = driverStorage.getString("id");
                          console.log("localDriverStorageId: ", localDriverStorageId);

            if (localDriverStorageId) {
                if (localDriverStorageId !==  `driver-${userId}`) {
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
                mobileNo: phone_number,
                email: email,
                role: role,
                country: country,
                countryCode: countryCode,
                callingCode: callingCode,
            })
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.body}>
                <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                    <Feather name="arrow-left" size={22} color={Colors.text.black} />
                </Pressable>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.headerText}>What are you using{"\n"} Nano for?</Text>
                    <Text style={styles.headerDesc}>Select your role to personalize your experience</Text>
                </View>

                <View>

                    <Pressable onPress={() => setRole("Merchant")} style={{ ...styles.borderBox, borderColor: role == "Merchant" ? Colors.primary : Colors.borderColor, borderWidth: role == "Merchant" ? 2 : 1 }}>
                        <View>
                            <View style={styles.roleContainer}>
                                <View style={{ ...styles.roleRadioButton, backgroundColor: role == "Merchant" ? Colors.primary : undefined, borderColor: role == "Merchant" ? undefined : Colors.borderColor, borderWidth: role == "Merchant" ? 0 : 1 }}>
                                    <View style={{ ...styles.roleButtonInnerCont, backgroundColor: role == "Merchant" ? Colors.text.white : undefined }}></View>
                                </View>

                                <View>
                                    <Text style={styles.roleText}>Merchant</Text>
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



                    <Pressable onPress={() => setRole("Driver")} style={{ ...styles.borderBox, borderColor: role == "Driver" ? Colors.primary : Colors.borderColor, borderWidth: role == "Driver" ? 2 : 1 }}>
                        <View >
                            <View style={styles.roleContainer}>
                                <View style={{ ...styles.roleRadioButton, backgroundColor: role == "Driver" ? Colors.primary : undefined, borderRadius: 20, marginRight: 10, borderColor: role == "Driver" ? undefined : Colors.borderColor, borderWidth: role == "Driver" ? 0 : 1 }}>
                                    <View style={{ ...styles.roleButtonInnerCont, backgroundColor: role == "Driver" ? Colors.text.white : undefined }}></View>
                                </View>

                                <View>
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
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    headerText: {
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.text.black
    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 10,
        color: Colors.text.gray
    },
    borderBox: {
        marginTop: 20,
        padding: 10,
        borderRadius: 10,

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
    roleContainer: {
        flexDirection: "row", alignItems: "flex-start"
    },
    roleRadioButton: {
        justifyContent: "center", alignItems: "center", width: 20, height: 20, borderRadius: 20, marginRight: 10,
    },
    roleButtonInnerCont: {
        width: 10, height: 10, borderRadius: 10,
    },
    roleText: {
        fontWeight: "600", color: Colors.text.black, fontSize: 15
    }
})