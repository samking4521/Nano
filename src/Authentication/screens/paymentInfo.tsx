import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Entypo, Feather, MaterialIcons } from '@expo/vector-icons'
import ProgressLevel from './components/progressLevel'
import { Colors } from '../../constants/colors'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import { RouteProp, useNavigation } from '@react-navigation/native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

type PaymentInfoNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "PaymentInfo">;
type PaymentInfoRouteProp = RouteProp<
    RootAuthStackParamList,
    "PaymentInfo"
>;

type Props = {
    route: PaymentInfoRouteProp;
};

type Bank = {
    name: string;
    code: string;
};

const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY;
type resolveAccNoErrType = "invalid_account_number" | "network_request_failed";

export default function PaymentInfo({ route }: Props) {
    const { mobileNo, email, role, country } = route.params;
    const [accountNo, setAccountNo] = useState("");
    const [accountName, setAccountName] = useState<string | null>(null);
    const [inputFocus, setInputFocus] = useState(false);

    const [clickedContinue, setClickedContinue] = useState(false);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [search, setSearch] = useState("");
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [showBanksListBottomSheet, setShowBanksListBottomSheet] = useState(false);
    const [resolveAccNoErr, setResolveAccNoErr] = useState<resolveAccNoErrType | null>(null);
    const navigation = useNavigation<PaymentInfoNavigationProp>();
    const DATA_LEVEL = useRef(3);
    const DETAILS_LEVEL = DATA_LEVEL.current

    const snapPoints = useMemo(() => ['90%'], []);

    const goToPreviousScreen = () => {
        navigation.goBack()
    }

    const filteredBanks = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return banks;

        return banks.filter((bank) =>
            bank.name.toLowerCase().includes(query)
        );
    }, [banks, search]);


    const resolveAccount = async (
        accountNumber: string,
        bankCode: string
    ) => {
        try {
            const response = await fetch(
                `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    },
                }
            )

            const result = await response.json();
            if (!result.status) {
                console.log(result);
                if (result.code == "invalid_account_number") {
                    setResolveAccNoErr("invalid_account_number");
                }
                return null;
            }

            return result.data.account_name;
        } catch (error) {

            console.error(error);
            setResolveAccNoErr("network_request_failed")
            return null;
        }
    };

    useEffect(() => {
           if(accountNo.length !== 10  || !selectedBank?.code){
              if(accountName){
                  setAccountName(null)
              }
            return
           }

       
          

        (
            async () => {
                const name = await resolveAccount(accountNo, "001")
                if (!name) {
                    setAccountName(null)
                    return
                }
                setAccountName(name)
                setResolveAccNoErr(null)



            }
        )()

    }, [accountNo, selectedBank?.code])

    const getBanks = async () => {
        try {
            const response = await fetch("https://api.paystack.co/bank", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            });

            const result = await response.json();

            setBanks(result.data)
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {

        getBanks();

    }, [])






    const bank_acc_number_err = clickedContinue && accountNo.trim() == "";
    const bank_name_err = clickedContinue && !selectedBank;
    const bank_acc_length_incomplete = clickedContinue && accountNo.length < 10;

    console.log("Acc name: ", accountName)



    const continueToVehicleInfo = () => {
        setClickedContinue(true);

        if(!accountName){
            console.log("coolant")
            return;
        }

        navigation.navigate("VehicleInfo", {
            mobileNo: mobileNo,
            email: email,
            role: "Driver",
            country: country
        });
    };



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

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.headerText}>Payment Details</Text>
                        <Text style={styles.headerDesc}>Provide your bank account details to receive payments for completed deliveries.</Text>
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Bank Name</Text>
                        <Pressable onPress={() => setShowBanksListBottomSheet(true)} style={{ ...styles.mobileTextInputContainer, borderColor: bank_name_err ? Colors.error : Colors.borderColor }}>
                            <Text style={styles.placeHolderText}>{selectedBank ? selectedBank.name : "Enter Bank Name"}</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.text.gray} />
                        </Pressable>
                        {bank_name_err && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Select your bank account</Text>
                        </View>}
                    </View>
                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Bank Account Number</Text>
                        <View style={{ ...styles.mobileTextInputContainer, borderColor: (bank_acc_number_err || bank_acc_length_incomplete || resolveAccNoErr) ? Colors.error : inputFocus ? Colors.primary : Colors.borderColor }}>
                            <TextInput
                                value={accountNo}
                                onChangeText={setAccountNo}
                                placeholder='0121000000'
                                keyboardType="default"
                                maxLength={10}
                                style={styles.mobileTextInput}
                                onFocus={() => setInputFocus(true)}
                                onBlur={() => setInputFocus(false)}

                            />
                        </View>
                        {(bank_acc_number_err || resolveAccNoErr || bank_acc_length_incomplete) && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{bank_acc_number_err ? "Enter a bank account number" : bank_acc_length_incomplete? "Bank account number must be 10 digits" : resolveAccNoErr == "invalid_account_number" ? "Invalid account number. Please check and try again." : "Unable to verify account. Check your internet connection."}</Text>
                        </View>}
                    </View>

                    {accountName && <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: "500", color: "green" }}>{accountName}</Text>
                    </View>}

                    <Pressable onPress={continueToVehicleInfo} style={styles.nextBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>


                </ScrollView>
            </KeyboardAvoidingView>
            {showBanksListBottomSheet && <Pressable onPress={() => {
                setSearch("");
                setShowBanksListBottomSheet(false);
            }} style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" }} />}

            {showBanksListBottomSheet && <BottomSheet
                handleIndicatorStyle={{ display: "none" }}
                index={1}
                snapPoints={snapPoints}
                onClose={() => setShowBanksListBottomSheet(false)}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: Colors.background }}
            >
                <BottomSheetView style={{ height: "100%", paddingHorizontal: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <Pressable onPress={() => {
                            setSearch("");
                            setShowBanksListBottomSheet(false);
                        }} style={styles.bottomSheetCloseBtn}>
                            <AntDesign name="close" size={18} color={Colors.text.black} />
                        </Pressable>
                        <Text style={styles.headerText}>Select Bank</Text>
                        <View style={{ ...styles.bottomSheetCloseBtn, backgroundColor: undefined }} />

                    </View>
                    <TextInput
                        style={{ height: 50, borderRadius: 50, backgroundColor: Colors.borderBackground, paddingHorizontal: 15, marginBottom: 20, fontSize: 14, fontWeight: "500" }}
                        placeholder="Search bank"
                        value={search}
                        onChangeText={setSearch}
                    />
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={filteredBanks}
                            contentContainerStyle={{flex: 1}}
                            keyExtractor={(item) => item.name}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ backgroundColor: Colors.borderBackground, height: 50, paddingHorizontal: 15, borderRadius: 50, marginVertical: 5, justifyContent: "center" }}
                                    onPress={() => {
                                        setSelectedBank(item);
                                        setSearch("");
                                        setShowBanksListBottomSheet(false);
                                    }}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: "500" }}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => {
                                return (
                                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                                            <ActivityIndicator size={"large"} color={Colors.primary} />
                                            <Text style={{...styles.headerDesc, textAlign: "center"}}>Loading Bank List,{"\n"}check your internet connection and <Text onPress={getBanks} style={{fontWeight: "600", color: Colors.primary}}>Refresh</Text></Text>
                                        </View>
                                    </View>
                                )

                            }}
                        />
                    </View>

                </BottomSheetView>
            </BottomSheet>}
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
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 5,
        color: Colors.text.gray,

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
    infoCont: {
        marginTop: 20
    },
    mobileTextInputContainer: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        backgroundColor: Colors.borderBackground,
        borderRadius: 50,
        flexDirection: "row",
        alignItems: "center",
        borderColor: Colors.borderColor,
        paddingHorizontal: 15
    },
    mobileLabel: {
        marginBottom: 10,
        fontSize: 14,
        color: Colors.text.black,
        fontWeight: "600"
    },
    mobileTextInput: {
        flex: 1,
        height: 50,




    },
    placeHolderText: {
        color: Colors.text.gray,
        fontWeight: "500",
        marginRight: "auto"

    },
    nextBtn: {
        height: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        marginTop: 30
    },
    continueText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },
    bottomSheetCloseBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.backBtnGray,
        borderRadius: 40
    }

})