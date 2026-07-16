import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, Feather, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons'
import ProgressLevel from './components/progressLevel'
import { Colors } from '../../constants/colors'
import { useNavigation } from '@react-navigation/native'
import { IdentityVerificationNavigationProp } from '../../Navigation/OnboardingNavigation'
import { driverStorage } from '../../localStorage/driverStorage'
import BottomSheet from '@gorhom/bottom-sheet'
import PhotoBottomSheet, { photoTypeData } from './components/PhotoBottomSheet'


type inputFocusType = "nin" | "license";


export default function IdentityVerification() {
    const [nin, setNin] = useState(() => driverStorage.getString("nin") ?? "");
    const [ninImage, setNinImage] = useState(() => driverStorage.getString("ninImage") ?? "");
    const [driverLicenseNumber, setDriverLicenseNumber] = useState(() => driverStorage.getString("driverLicenseNo") ?? "");
    const [driverLicenseImage, setDriverLicenseImage] = useState(() => driverStorage.getString("driverLicensePhoto") ?? "");
    const [inputFocus, setInputFocus] = useState<inputFocusType | null>(null);
    const [photoType, setPhotoType] = useState<photoTypeData>(null);

    const [clickedContinue, setClickedContinue] = useState(false);

    const navigation = useNavigation<IdentityVerificationNavigationProp>();
    const DATA_LEVEL = useRef(2);
    const DETAILS_LEVEL = DATA_LEVEL.current
    const bottomSheetRef = useRef<BottomSheet>(null);


    const goToPreviousScreen = () => {
        navigation.goBack()
    }


    console.log("type: ", photoType)

    const showNinBottomSheet = () => {
        setPhotoType("NinPhoto");
        bottomSheetRef.current?.expand();
    }

    const showLicenseBottomSheet = () => {
        setPhotoType("DriverLicense");
        bottomSheetRef.current?.expand();
    }

    const nin_empty = clickedContinue && nin.length === 0;
    const nin_length_err = clickedContinue && nin.length > 0 && nin.length < 11;
    const nin_image_empty = clickedContinue && !ninImage;
    const license_empty = clickedContinue && driverLicenseNumber.length === 0;
    const license_length_err = clickedContinue && driverLicenseNumber.length > 0 && driverLicenseNumber.length < 11;
    const license_image_empty = clickedContinue && !driverLicenseImage;


    const deleteNinImage = () => {
        setNinImage("");
    }

    const deleteLicenseImage = () => {
        setDriverLicenseImage("");
    }


    const continueToOwnershipStatus = ()=>{
        setClickedContinue(true);
              
                const hasErrors = [
                   
                    nin.length === 0,
                    nin.length > 0 && nin.length < 11,
                    !ninImage,
                    driverLicenseNumber.length === 0,
                    driverLicenseNumber.length > 0 && driverLicenseNumber.length < 11,
                   !driverLicenseImage
                ].some(Boolean);
        
                if (hasErrors) return;
               
                driverStorage.set("nin", nin);
                driverStorage.set("ninImage", ninImage);
                driverStorage.set("driverLicenseNo", driverLicenseNumber);
                driverStorage.set("driverLicensePhoto", driverLicenseImage);
               
                 console.log("navigates")
        
                navigation.navigate("OwnershipStatus");
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
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
                    keyboardShouldPersistTaps="never"
                    showsVerticalScrollIndicator={false}
                    style={styles.body}>

                    <ProgressLevel progressLevel={DETAILS_LEVEL} />

                    <View style={styles.infoCont}>
                        <Text style={styles.headerText}>Identity Verification</Text>
                    </View>
                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>NIN</Text>
                        <View style={{ ...styles.inputBoxCont, borderColor: (nin_empty || nin_length_err) ? Colors.error : inputFocus == "nin" ? Colors.primary : Colors.borderColor }}>
                            <TextInput
                                value={nin}
                                onChangeText={setNin}
                                maxLength={11}
                                placeholder='12345678901'
                                keyboardType="decimal-pad"
                                style={styles.mobileTextInput}
                                onFocus={() => setInputFocus("nin")}
                                onBlur={() => setInputFocus(null)}

                            />
                        </View>
                        {(nin_empty || nin_length_err) && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{nin_empty ? "NIN cannot be empty" : "NIN must be 11 digits"}</Text>
                        </View>}
                    </View>

                    <View>
                        <View  style={styles.pictureNinCont}>
                            <View style={styles.pictureNinHeader}>
                                <View style={styles.ninIcon}>
                                    <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                </View>
                                <View>
                                    <Text style={{ ...styles.mobileLabel, marginBottom: 5 }}>Picture of NIN</Text>
                                  
                                </View>
                                {ninImage ? <Pressable onPress={deleteNinImage} style={styles.editBtn}>
                                    <MaterialCommunityIcons name="delete-outline" size={22} color={Colors.text.gray} />

                                </Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />}
                            </View>
                            <View>
                                {ninImage ? <Image style={styles.ninImageStyle} source={{ uri: ninImage }} /> : <Pressable style={{flex: 1}} onPress={showNinBottomSheet}>
                                                                        <View  style={styles.addNinIcon}>
                                                                                <AntDesign name="plus" size={24} color={Colors.text.black} />
                                                                            </View>
                                                                        </Pressable>
                                }
                            </View>




                        </View>
                        {nin_image_empty && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Add NIN image</Text>
                        </View>}
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Driver License Number</Text>
                        <View style={{ ...styles.inputBoxCont, borderColor: (license_empty || license_length_err) ? Colors.error : inputFocus == "license" ? Colors.primary : Colors.borderColor }}>
                            <TextInput
                                value={driverLicenseNumber}
                                onChangeText={setDriverLicenseNumber}
                                maxLength={12}
                                placeholder='ABC123456789'
                                keyboardType="default"
                                style={styles.mobileTextInput}
                                onFocus={() => setInputFocus("license")}
                                onBlur={() => setInputFocus(null)}

                            />
                        </View>
                        {(license_empty || license_length_err) && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{license_empty ? "License number cannot be empty" : "Enter a valid License number"}</Text>
                        </View>}
                    </View>

                    <View>
                        <View style={styles.pictureNinCont}>
                            <View style={styles.pictureNinHeader}>
                                <View style={styles.ninIcon}>
                                    <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                </View>
                                <View>
                                    <Text style={{ ...styles.mobileLabel, marginBottom: 5 }}>Photo of Driver License</Text>
                                </View>
                                {driverLicenseImage ? <Pressable onPress={deleteLicenseImage} style={styles.editBtn}>
                                    <MaterialCommunityIcons name="delete-outline" size={22} color={Colors.text.gray} />

                                </Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />}
                            </View>
                            <View>
                                {driverLicenseImage ? <Image style={styles.ninImageStyle} source={{ uri: driverLicenseImage }} /> : 
                                <Pressable style={{flex: 1}} onPress={showLicenseBottomSheet}>
                                                                        <View  style={styles.addNinIcon}>
                                                                                <AntDesign name="plus" size={24} color={Colors.text.black} />
                                                                            </View>
                                                                        </Pressable>
                                }
                            </View>




                        </View>
                        {license_image_empty && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Add Driver license image</Text>
                        </View>}
                    </View>

                      
                </ScrollView>
                <View style={{paddingVertical: 5}}>
                                                         <Pressable onPress={continueToOwnershipStatus} style={styles.nextBtn}>
                                                           <Text style={styles.continueText}>Continue</Text>
                                                       </Pressable>
                                                   </View>
            </KeyboardAvoidingView>
            <PhotoBottomSheet bottomSheetRef={bottomSheetRef} photoType={photoType} setPhotoType={setPhotoType} setNinImage={setNinImage} setDriverLicense={setDriverLicenseImage}/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
         paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight,
    },
    body: {
        flex: 1,
       
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
        marginTop: 20
    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 5,
        color: Colors.text.gray,

    },
    mobileLabel: {
        marginBottom: 10,
        fontSize: 14,
        color: Colors.text.black,
        fontWeight: "600"
    },
    inputBoxCont: {
        height: 50,
        borderWidth: 1,
        backgroundColor: Colors.borderBackground,
        borderRadius: 50,
    },
    mobileTextInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,



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
    pictureNinCont: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.borderColor,

        borderRadius: 10
    },
    pictureNinHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomColor: Colors.borderColor,
        borderBottomWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 5

    },
    ninIcon: {
        width: 30,
        height: 30,
        borderRadius: 30,
        borderColor: Colors.borderColor,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,

    },
    ninImageStyle: {
        width: "100%",
        height: 150,
        resizeMode: "cover",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    addNinIcon: {
        width: 70,
        height: 70,
        borderRadius: 70,
        backgroundColor: Colors.backBtnGray,
        marginVertical: 20,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    bottomSheetCont: {

        height: "100%",
    },
    bottomSheetViewCont: {
        flex: 1,

        paddingHorizontal: 10,
        paddingTop: 20
    },
    takePhotoBtns: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 10
    },
    takePhotoBtnText: {
        color: Colors.text.black,
        fontWeight: "600",
        fontSize: 16
    },
     nextBtn: {
        height: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
    },
    continueText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },


})