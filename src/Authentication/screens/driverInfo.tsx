import { Platform, ScrollView, StatusBar, StyleSheet, KeyboardAvoidingView, View, Pressable, Text, Dimensions, Image, TextInput, TouchableOpacity, Alert, Linking } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/colors'
import { AntDesign, Feather, FontAwesome, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons'
import { RouteProp, useNavigation } from '@react-navigation/native'
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import ProgressLevel from './components/progressLevel'
import DatePicker from 'react-native-date-picker'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';

type DriverInfoNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "DriverInfo">;
type DriverInfoRouteProp = RouteProp<
    RootAuthStackParamList,
    "DriverInfo"
>;

type Props = {
    route: DriverInfoRouteProp;
};

type bottomSheetType = "DriverPhoto" | "NinPhoto";

const countryPickerProps = {
    withFilter: true,
    withFlag: true,
    withCountryNameButton: false,
    withAlphaFilter: true,
    withCallingCode: true,
    withEmoji: true,
};

type inputFocusType = "mobile_number" | "email" | "first_name" | "last_name" | "birthday" | "nin";

export default function DriverInfo({ route }: Props) {
    const { mobileNo: phone_number, email: emailVal, country: countryNameVal, countryCode: countryCodeVal, callingCode: callingCodeVal } = route.params;
    const [country, setCountry] = useState<Country | null>(null)
    const [mobileNo, setMobileNo] = useState("");
    const [driverImage, setDriverImage] = useState<string | null>("");
    const [email, setEmail] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [inputFocus, setInputFocus] = useState<inputFocusType | null>(null);
    const [clickedContinue, setClickedContinue] = useState(false);
    const [nin, setNin] = useState("");
    const [openBottomSheet, setOpenBottomSheet] = useState<bottomSheetType | null>(null);
    const [dob, setDob] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [ninImage, setNinImage] = useState<string | null>(null);
    const [datePicked, setDatePicked] = useState(false);
    const navigation = useNavigation<DriverInfoNavigationProp>();
    const DATA_LEVEL = useRef(1);
    const DETAILS_LEVEL = DATA_LEVEL.current


    const snapPoints = useMemo(() => ['25%%'], []);




    const callingCode = country?.callingCode[0] ?? "234";
    const countryCode = country?.cca2 ?? 'NG';
    const countryName = typeof country?.name === 'string'
        ? country.name
        : country?.name?.common ?? 'Nigeria'

    const onSelect = (country: Country) => {
        console.log("country: ", country);
        setCountry(country);

    }

    const formatDate = (date: Date) => {
        const day = date.getDate();

        const getOrdinal = (n: number) => {
            if (n > 3 && n < 21) return `${n}th`;

            switch (n % 10) {
                case 1:
                    return `${n}st`;
                case 2:
                    return `${n}nd`;
                case 3:
                    return `${n}rd`;
                default:
                    return `${n}th`;
            }
        };

        const month = date.toLocaleString("en-US", {
            month: "short",
        });

        const year = date.getFullYear();

        return `${getOrdinal(day)} ${month}, ${year}`;
    };

    const goToPreviousScreen = () => {
        navigation.goBack()
    }

    const isAtLeast18YearsOld = (dateOfBirth: Date): boolean => {
        const today = new Date();

        let age = today.getFullYear() - dateOfBirth.getFullYear();

        const hasHadBirthdayThisYear =
            today.getMonth() > dateOfBirth.getMonth() ||
            (today.getMonth() === dateOfBirth.getMonth() &&
                today.getDate() >= dateOfBirth.getDate());

        if (!hasHadBirthdayThisYear) {
            age--;
        }

        return age >= 18;
    };

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    // const firstname_err = clickedContinue && (firstname.length <= 0) ? true : false;
    // const lastname_err = clickedContinue && (lastname.length <= 0) ? true : false;
    // const phone = phone_number ? phone_number : mobileNo;
    // const mail = emailVal ? emailVal : email;
    // const isMailValid = isValidEmail(mail);
    // const mobile_no_err = clickedContinue && (phone.length <= 0) ? true : false;
    // const email_length_err = clickedContinue && (mail.length <= 0) ? true : false;
    // const email_valid_err = clickedContinue && !isMailValid ? true : false;
    // const nin_empty = clickedContinue && (nin.length <= 0) ? true : false;
    // const nin_length_err = clickedContinue && (nin.length < 11) ? true : false;
    // const dob_err = clickedContinue && !datePicked ? true : false;
    // const isAgeValid = isAtLeast18YearsOld(dob);
    // const dob_err_less_18 = datePicked && !isAgeValid;
    // const nin_image_empty = clickedContinue && (!ninImage) ? true : false;
    // const driver_photo_empty = clickedContinue && (!driverImage) ? true : false;

    // const continueToVehicleInfo = () => {

    //     setClickedContinue(true);
    //     if (firstname_err || lastname_err || mobile_no_err || email_length_err || email_valid_err || dob_err || dob_err_less_18 || nin_empty || nin_length_err || nin_image_empty || driver_photo_empty) {
    //         return;
    //     }

    //     navigation.navigate("VehicleInfo", {
    //         mobileNo: phone_number ?? mobileNo,
    //         email: emailVal ?? email,
    //         role: "Driver",
    //         country: countryName ?? countryNameVal
    //     })
    
    // }

    const phone = phone_number || mobileNo;
const mail = emailVal || email;
const isMailValid = isValidEmail(mail);
const isAgeValid = isAtLeast18YearsOld(dob);

const firstname_err      = clickedContinue && firstname.trim() === "";
const lastname_err       = clickedContinue && lastname.trim() === "";
const mobile_no_err      = clickedContinue && phone.trim() === "";
const email_length_err   = clickedContinue && mail.trim() === "";
const email_valid_err    = clickedContinue && mail.length > 0 && !isMailValid;
const nin_empty          = clickedContinue && nin.length === 0;
const nin_length_err     = clickedContinue && nin.length > 0 && nin.length < 11;
const dob_err            = clickedContinue && !datePicked;
const dob_err_less_18    = datePicked && !isAgeValid;
const nin_image_empty    = clickedContinue && !ninImage;
const driver_photo_empty = clickedContinue && !driverImage;



const continueToVehicleInfo = () => {
    setClickedContinue(true);
     const phone = phone_number || mobileNo;
    const mail = emailVal || email;
    const isMailValid = isValidEmail(mail);
    const isAgeValid = isAtLeast18YearsOld(dob);

    const hasErrors = [
        firstname.trim() === "",
        lastname.trim() === "",
        phone.trim() === "",
        mail.trim() === "",
        mail.length > 0 && !isMailValid,
        !datePicked,
        datePicked && !isAgeValid,
        nin.length === 0,
        nin.length > 0 && nin.length < 11,
        !ninImage,
        !driverImage,
    ].some(Boolean);

    if (hasErrors) return;

    navigation.navigate("VehicleInfo", {
        mobileNo: phone_number ?? mobileNo,
        email: emailVal ?? email,
        role: "Driver",
        country: countryName ?? countryNameVal,
    });
};


    const showNinBottomSheet = () => {
        if (ninImage) {
            return;
        }
        setOpenBottomSheet("NinPhoto");
    }


    const showProfilePictureBottomSheet = () => {
        if (driverImage) {
            setDriverImage(null);
            return;
        }
        setOpenBottomSheet("DriverPhoto");
    }


    
    async function pickImageFromGallery() {
        if (Platform.OS === 'ios') {
            const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                if (canAskAgain) {
                    const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (newStatus !== 'granted') return null;
                } else {
                    Alert.alert(
                        'Photos Permission Required',
                        'Please enable photo access in your device settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );
                    return null;
                }
            }
        } else {
            // Android: launch handles the prompt, only intercept if permanently denied
            const { canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (!canAskAgain) {
                Alert.alert(
                    'Photos Permission Required',
                    'Please enable photo access in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
                return null;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: openBottomSheet == "DriverPhoto" ? true : undefined,
            aspect: openBottomSheet == "DriverPhoto" ? [4, 3] : undefined,
            quality: 0.8,
        });

        return result.canceled ? null : result.assets[0];
    }

   const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
        if (!permission.canAskAgain) {
            Alert.alert(
                'Camera Permission Required',
                'Please enable camera access in your device settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
        }
        return null;
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: openBottomSheet === 'DriverPhoto' ? true : undefined,
        aspect: openBottomSheet === 'DriverPhoto' ? [4, 3] : undefined,
        quality: 0.8,
    });

    if (result.canceled) return null;

    return result.assets[0];
};


    const handleCamera = async () => {
        try {
            const image = await takePhoto();

            if (image) {
                console.log(image.uri);
                if (openBottomSheet == "DriverPhoto") {
                    setDriverImage(image.uri);
                } else {
                    setNinImage(image.uri)
                }

            }
             setOpenBottomSheet(null);
        } catch (error) {
            Alert.alert(
            'Camera Unavailable',
            'Unable to open the camera. Please try again.',
        );
            setOpenBottomSheet(null);
            return null
        }
       

    };

    const handleGallery = async () => {
        try {
            const image = await pickImageFromGallery();

            if (image) {
                console.log(image.uri);
                if (openBottomSheet == "DriverPhoto") {
                    setDriverImage(image.uri);
                } else {
                    setNinImage(image.uri);
                }

            }
                 setOpenBottomSheet(null);
        } catch (error) {
            Alert.alert(
            'Gallery Unavailable',
            'Unable to open the gallery. Please try again.',
        );
         setOpenBottomSheet(null);
            return null
            
        }
       
    };


    const deleteNinImage = () => {
        setNinImage(null);
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

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.headerText}>Personal Details</Text>
                    </View>

                    <View style={{ marginVertical: 10 }}>
                        <View >
                            {driver_photo_empty ? <Text style={{ ...styles.mobileLabel, color: Colors.error }}>Add your photo</Text> : <Text style={styles.mobileLabel}>{driverImage ? "" : "Take your photo"}</Text>
                            }
                        </View>
                        <View style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                            <View style={styles.driverImageCont}>
                                {driverImage ? <Image source={{ uri: driverImage }} style={styles.driverImage} /> : <Feather name="user" size={80} color={Colors.text.gray} />}
                                <Pressable onPress={showProfilePictureBottomSheet} style={styles.editCont}>
                                    {driverImage ? <MaterialCommunityIcons name="delete-outline" size={24} color={Colors.text.white} /> : <AntDesign name="plus" size={22} color={Colors.text.white} />}
                                </Pressable>
                            </View>
                        </View>


                    </View>

                    <View style={styles.nameBoxContainer}>
                        <View style={{ flex: 1, marginRight: 5, }}>
                            <Text style={styles.mobileLabel}>First name</Text>
                            <View style={{ ...styles.inputBoxCont, height: 50, borderColor: firstname_err ? Colors.error : inputFocus == "first_name" ? Colors.primary : Colors.borderColor }}>
                                <TextInput
                                    value={firstname}
                                    onChangeText={setFirstName}
                                    placeholder='John'
                                    keyboardType="default"
                                    style={styles.mobileTextInput}
                                    onFocus={() => setInputFocus("first_name")}
                                    onBlur={() => setInputFocus(null)}

                                />
                            </View>
                            {firstname_err && <View style={styles.errorBox}>
                                <Text style={styles.errorText}>First name cannot be empty</Text>
                            </View>}
                        </View>


                        <View style={{ flex: 1, marginLeft: 5, }}>
                            <Text style={styles.mobileLabel}>Last name</Text>
                            <View style={{ ...styles.inputBoxCont, height: 50, borderColor: lastname_err ? Colors.error : inputFocus == "last_name" ? Colors.primary : Colors.borderColor }}>

                                <TextInput
                                    value={lastname}
                                    onChangeText={setLastName}
                                    placeholder='Doe'
                                    keyboardType="default"
                                    style={styles.mobileTextInput}
                                    onFocus={() => setInputFocus("last_name")}
                                    onBlur={() => setInputFocus(null)}

                                />
                            </View>
                            {lastname_err && <View style={styles.errorBox}>
                                <Text style={styles.errorText}>Lastname cannot be empty</Text>
                            </View>}
                        </View>




                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Mobile Number</Text>
                        <View pointerEvents={phone_number ? "none" : "auto"} style={{ ...styles.mobileTextInputContainer, borderColor: mobile_no_err ? Colors.error : inputFocus == "mobile_number" ? Colors.primary : Colors.borderColor }}>
                            <View style={{ ...styles.mobileCodeCont, borderRightColor: mobile_no_err ? Colors.error : inputFocus == "mobile_number" ? Colors.primary : Colors.borderColor }}>
                                <CountryPicker
                                    {...countryPickerProps}
                                    countryCode={countryCodeVal as CountryCode ?? countryCode}
                                    onSelect={onSelect}

                                />
                            </View>
                            <View style={styles.mobileInputCont}>
                                <Text style={styles.mobileCodeText}>+{callingCodeVal ?? callingCode}</Text>
                                <TextInput
                                    value={phone_number ?? mobileNo}
                                    onChangeText={setMobileNo}
                                    placeholder='Enter number here'
                                    keyboardType="phone-pad"
                                    style={styles.mobileTextInput}
                                    onFocus={() => setInputFocus("mobile_number")}
                                    onBlur={() => setInputFocus(null)}

                                />
                            </View>

                        </View>
                        {mobile_no_err && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Mobile number cannot be empty</Text>
                        </View>}
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Email</Text>
                        <View pointerEvents={emailVal ? "none" : "auto"} style={{ ...styles.inputBoxCont, borderColor: (email_length_err || email_valid_err) ? Colors.error : inputFocus == "email" ? Colors.primary : Colors.borderColor }}>
                            <TextInput
                                value={emailVal ?? email}
                                onChangeText={setEmail}
                                placeholder='johndoe@gmail.com'
                                keyboardType="email-address"
                                style={styles.mobileTextInput}
                                onFocus={() => setInputFocus("email")}
                                onBlur={() => setInputFocus(null)}

                            />
                        </View>
                        {(email_length_err || email_valid_err) && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{email_length_err ? "Email cannot be empty" : "Email not valid"}</Text>
                        </View>}
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>Birthday</Text>
                        <TouchableOpacity onPress={() => setOpen(true)} style={{ ...styles.inputBoxCont, flexDirection: "row", alignItems: "center", borderColor: dob_err ? Colors.error : Colors.borderColor, paddingHorizontal: 10 }}>
                            <Text style={{ marginRight: "auto", fontSize: 14, fontWeight: "500", color: Colors.text.gray }}>{datePicked ? formatDate(dob) : "Enter your birthday"}</Text>
                            <FontAwesome name="calendar" size={22} color={Colors.primary} />
                            {
                                open && <DatePicker
                                    modal
                                    mode="date"
                                    open={open}
                                    date={dob}
                                    onConfirm={(date) => {
                                        setOpen(false)
                                        setDob(date)
                                        setDatePicked(true)
                                    }}
                                    onCancel={() => {
                                        setOpen(false)
                                    }}
                                />
                            }
                        </TouchableOpacity>
                        <View style={styles.discountBox}>
                            <Text style={styles.discountText}>Get a free fuel voucher on your birthday, redeem any day within your month.</Text>
                        </View>
                        {(dob_err || dob_err_less_18) && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{dob_err ? "Birthday cannot be empty" : "You must be at least 18 years of age"}</Text>
                        </View>}
                    </View>

                    <View style={styles.infoCont}>
                        <Text style={styles.mobileLabel}>NIN</Text>
                        <View style={{ ...styles.inputBoxCont, borderColor: (nin_empty || nin_length_err) ? Colors.error : inputFocus == "nin" ? Colors.primary : Colors.borderColor }}>
                            <TextInput
                                value={nin}
                                onChangeText={setNin}
                                maxLength={11}
                                placeholder='00000000000'
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
                        <Pressable onPress={showNinBottomSheet} style={styles.pictureNinCont}>
                            <View style={styles.pictureNinHeader}>
                                <View style={styles.ninIcon}>
                                    <SimpleLineIcons name="picture" size={16} color={Colors.text.black} />
                                </View>
                                <View>
                                    <Text style={{ ...styles.mobileLabel, marginBottom: 5 }}>Picture of NIN</Text>
                                    <Text style={styles.headerDesc}>Picture should be your id</Text>
                                </View>
                                {ninImage ? <Pressable onPress={deleteNinImage} style={styles.editBtn}>
                                    <MaterialCommunityIcons name="delete-outline" size={22} color={Colors.text.gray} />

                                </Pressable> : <View style={{ ...styles.editBtn, backgroundColor: undefined }} />}
                            </View>
                            <View>
                                {ninImage ? <Image style={styles.ninImageStyle} source={{ uri: ninImage }} /> : <View style={styles.addNinIcon}>
                                    <AntDesign name="plus" size={24} color={Colors.text.black} />
                                </View>
                                }
                            </View>



                        </Pressable>
                        {nin_image_empty && <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Add NIN image</Text>
                        </View>}
                    </View>


                    <Pressable onPress={continueToVehicleInfo} style={styles.nextBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>

                </ScrollView>



            </KeyboardAvoidingView>
            {openBottomSheet && <Pressable onPress={() => setOpenBottomSheet(null)} style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" }} />}

            {openBottomSheet && <BottomSheet
                style={{ flex: 1 }}
                handleIndicatorStyle={{ display: "none" }}
                index={1}
                snapPoints={snapPoints}
                onClose={() => setOpenBottomSheet(null)}
                enablePanDownToClose
            >
                <BottomSheetView style={styles.bottomSheetCont}>
                    <View style={styles.bottomSheetViewCont}>
                        <TouchableOpacity onPress={handleCamera} style={styles.takePhotoBtns}>
                            <Text style={styles.takePhotoBtnText}>Capture with Camera</Text>
                            <Feather name="camera" size={24} color={Colors.text.gray} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleGallery} style={{ ...styles.takePhotoBtns, marginTop: 20 }}>
                            <Text style={styles.takePhotoBtnText}>Take from gallery</Text>
                            <MaterialCommunityIcons name="view-gallery-outline" size={24} color={Colors.text.gray} />
                        </TouchableOpacity>

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
    driverImageCont: {

        width: 140,
        height: 140,
        borderRadius: 140,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        justifyContent: "center",
        alignItems: "center"
    },
    driverImage: {
        width: "100%",
        height: "100%",
        borderRadius: 140,
        resizeMode: "cover",

    },
    takePhotoCont: {
        marginTop: 15,
        flexDirection: "row",

        alignItems: "flex-start"
    },

    editCont: {
        width: 40,
        height: 40,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 40,
        position: "absolute",
        left: 100,
        top: 100
    },
    nameBoxContainer: {
        flexDirection: "row", alignItems: "flex-start", marginTop: 15
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
    mobileInputCont: {
        flexDirection: "row", alignItems: "center"
    },
    mobileCodeText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.text.gray,
        padding: 5
    },
    discountBox: {
        marginTop: 10,
        width: "100%",
        padding: 10,
        backgroundColor: "#FFF4EB",
        borderRadius: 12

    },
    discountText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: "500"
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
    pictureNinCont: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.borderColor,

        borderRadius: 10
    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text.gray
    },
    editText: {
        marginLeft: 5, fontSize: 12, color: Colors.text.gray, fontWeight: "600"
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
    ninImageStyle: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
    }

})