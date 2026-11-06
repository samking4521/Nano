import { useNavigation } from "@react-navigation/native";
import { ShipperNavigationProp } from "../../../../Navigation/ShipperNavigation";
import { useAuthStore } from "../../../../Authentication/store/authStore";
import { useNetworkStore } from "../../../../Providers/Network/NetworkStore";
import { useShipperStore } from "../../../store/ShipperStore";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from "../../../../constants/theme/font";
import { Colors } from "../../../../constants/theme/colors";
import PersonalInfoShimmer from "../../../../Driver/screens/Account/components/PersonalInfoShimmer";
import ProfilePhotoPlaceholder from "../../../../utils/profilePhotoPlaceholder";
import NanoLoadingSpinner from "../../../../utils/nanoLoadingSpinner";
import UpdateShipperProfile from "../components/UpdateShipperProfile";
import UpdateShipperProfilePhoto from "../components/UpdateShipperProfilePhoto";


export type fieldType = "firstname" | "lastname" | "email" | "phone" | "birthday";
type signInType = "phone" | "email";

export default function PersonalInfo() {
    const session = useAuthStore((store) => store.session);
    const isOnline = useNetworkStore((store) => store.isOnline);
    const navigation = useNavigation<ShipperNavigationProp>();
    const shipperImgKey = useShipperStore((store) => store.shipperImgKey)
    const [shipperImgUrl, setShipperImgUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [openEditBottomSheet, setOpenEditBottomSheet] = useState<fieldType | null>(null);
    const [userSignInMethod, setUserSignInMethod] = useState<signInType | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [birthday, setBirthday] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [showPhotoBottomSheet, setShowPhotoBottomSheet] = useState<boolean>(false);


    const goBack = () => {
        navigation.goBack();
    }




    const getUserSignInMethod = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            throw new Error(`Error querying getUser: ${error.message}`)
        }

        const provider = user?.app_metadata?.provider;
        setUserSignInMethod(provider as signInType);
    }


    const getUserData = async () => {
        const { data: userData, error: userData_err } = await supabase
            .from('User')
            .select('email, phone')
            .eq('id', session?.user.id)
            .single();

        if (userData_err) {
            throw new Error(`Error querying User Data: ${userData_err.message}`);

        }

        setEmail(userData.email);
        setPhone(userData.phone);
    }

    const getShipperData = async () => {
        const { data: shipperData, error: shipperDataError } = await supabase
            .from('Shipper')
            .select('*')
            .eq('id', session?.user.id)
            .single();

        if (shipperDataError) {
            throw new Error(`Error querying Shipper Data: ${shipperDataError.message}`);

        }

        setFirstName(shipperData.firstname);
        setLastName(shipperData.lastname);
        setBirthday(shipperData.birthday);
    }



    const getShipperImage = async () => {
        if (!shipperImgKey) {
            setImageLoading(false);
            return
        }
        const { data: signedImage, error: signedImageError } =
            await supabase.storage
                .from("shipper-photos")
                .createSignedUrl(shipperImgKey, 60 * 60);

        if (signedImageError) {
            throw new Error(
                `Error creating shipper image URL: ${signedImageError.message}`
            );
        }

        const imageUrl = signedImage.signedUrl;
        setShipperImgUrl(imageUrl);
    }



    const getShipperProfile = async () => {
        try {
            await Promise.all([
                getUserData(),
                getShipperImage(),
                getShipperData(),
                getUserSignInMethod(),
            ])
            setLoadingStatus(false);
        } catch (e) {
            console.log("error: ", e)
        }
    }

    useEffect(() => {
        if (!isOnline || !loadingStatus) return;
        getShipperProfile();
    }, [isOnline, loadingStatus])

    useEffect(() => {
        if (!showErrorAlert) return;
        const timeoutId = setTimeout(() => {
            setShowErrorAlert(false);
        }, 3000)

        return () => clearTimeout(timeoutId)
    }, [showErrorAlert])



    const editProfileData = (field: fieldType) => {
        if (field == "email") {
            if (userSignInMethod == "email") {

            } else {
                setOpenEditBottomSheet(field);
            }
        } else if (field == "phone") {
            if (userSignInMethod == "phone") {

            } else {
                setOpenEditBottomSheet(field)
            }
        } else {

            setOpenEditBottomSheet(field)
        }

    }

    const updateProfilePhoto = () => {
        setShowPhotoBottomSheet(true)
    }








    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <View style={styles.body}>
                <Pressable onPress={goBack} style={styles.backBtn}>
                    <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
                </Pressable>

                <View style={{ marginVertical: 15 }}>
                    <Text style={styles.headerText}>Profile</Text>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
                    {loadingStatus ? <PersonalInfoShimmer /> :
                        <View>

                            <View style={styles.shipperHeaderLabelCont}>
                                <View style={[styles.shipperImageCont, { backgroundColor: !shipperImgKey ? Colors.backBtnGray : undefined }]}>
                                    {shipperImgUrl ? <Image source={{ uri: shipperImgUrl }} onLoad={() => setImageLoading(false)} style={styles.shipperImage} /> : <Ionicons name="person" size={50} color={Colors.text.gray} />}
                                    {!imageLoading && <Pressable onPress={updateProfilePhoto} style={styles.editIconCont}>
                                        <View style={styles.editInnerIcon}>
                                            <Ionicons name="camera" size={18} color={Colors.text.white} />
                                        </View>
                                    </Pressable>}
                                    {imageLoading && <ProfilePhotoPlaceholder />}
                                </View>
                                <View style={styles.shipperLabelCont}>
                                    <Text style={styles.shipperName}>{`${firstName} ${lastName}`}</Text>

                                </View>

                            </View>

                            <View style={styles.shipperProfileDetailsCont}>
                                <Pressable onPress={() => editProfileData("firstname")} style={styles.profileDetailContainer}>
                                    <View style={styles.profileLabelCont}>
                                        <View style={styles.profileLabelIconCont}>
                                            <Ionicons name="person-outline" size={24} color={Colors.text.gray} />
                                        </View>

                                        <View style={styles.profileLabelDetailsCont}>
                                            <Text style={styles.profileNameLabel}>First name</Text>
                                            <Text style={styles.profileName}>{firstName}</Text>
                                        </View>

                                        <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />

                                    </View>




                                </Pressable>


                                <Pressable onPress={() => editProfileData("lastname")} style={styles.profileDetailContainer}>
                                    <View style={styles.profileLabelCont}>
                                        <View style={styles.profileLabelIconCont}>
                                            <Ionicons name="person-outline" size={24} color={Colors.text.gray} />
                                        </View>
                                        <View style={styles.profileLabelDetailsCont}>
                                            <Text style={styles.profileNameLabel}>Last name</Text>
                                            <Text style={styles.profileName}>{lastName}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />

                                    </View>



                                </Pressable>

                                <Pressable onPress={() => editProfileData("phone")} style={styles.profileDetailContainer}>
                                    <View style={styles.profileLabelCont}>
                                        <View style={styles.profileLabelIconCont}>
                                            <Ionicons name="call-outline" size={24} color={Colors.text.gray} />
                                        </View>
                                        <View style={styles.profileLabelDetailsCont}>
                                            <Text style={styles.profileNameLabel}>Phone number</Text>
                                            <Text style={styles.profileName}>{phone}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />

                                    </View>
                                </Pressable>


                                <Pressable onPress={() => editProfileData("email")} style={styles.profileDetailContainer}>
                                    <View style={styles.profileLabelCont}>
                                        <View style={styles.profileLabelIconCont}>
                                            <Ionicons name="mail-outline" size={24} color={Colors.text.gray} />
                                        </View>
                                        <View style={styles.profileLabelDetailsCont}>
                                            <Text style={styles.profileNameLabel}>Email</Text>
                                            <Text style={styles.profileName}>{email}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />

                                    </View>
                                </Pressable>

                                <Pressable onPress={() => editProfileData("birthday")} style={[styles.profileDetailContainer, { borderBottomWidth: undefined, borderBottomColor: undefined }]}>
                                    <View style={styles.profileLabelCont}>
                                        <View style={styles.profileLabelIconCont}>
                                            <Ionicons name="calendar-outline" size={24} color={Colors.text.gray} />
                                        </View>
                                        <View style={styles.profileLabelDetailsCont}>
                                            <Text style={styles.profileNameLabel}>Birthday</Text>
                                            <Text style={styles.profileName}>{birthday}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />

                                    </View>


                                </Pressable>
                            </View>
                        </View>
                    }
                </ScrollView>

            </View>
            {(openEditBottomSheet || showPhotoBottomSheet) && <View style={styles.bottomSheetCoverContainer} />}



            {openEditBottomSheet && <UpdateShipperProfile
                openEditBottomSheet={openEditBottomSheet}
                setOpenEditBottomSheet={setOpenEditBottomSheet}
                setFirstName={setFirstName}
                setLastName={setLastName}
                setBirthday={setBirthday}
                setPhone={setPhone}
                setEmail={setEmail}
                setShowLoadingSpinner={setShowLoadingSpinner}
                firstname={firstName}
                lastname={lastName}
                birthday={birthday}
                phone={phone}
                email={email}
                setShowErrorAlert={setShowErrorAlert}
            />}

            {showPhotoBottomSheet && <UpdateShipperProfilePhoto
                setShipperImgUrl={setShipperImgUrl}
                setShowPhotoBottomSheet={setShowPhotoBottomSheet}
                setShowLoadingSpinner={setShowLoadingSpinner}
                setShowErrorAlert={setShowErrorAlert}
            />}


            {showLoadingSpinner && <Pressable onPress={() => { return }} style={styles.fillScreen}>
                <NanoLoadingSpinner />
            </Pressable>}

            {showErrorAlert && <View style={styles.fillScreen}>
                <View style={styles.errorCont}>
                    <Text style={styles.errorText}>Internet connection seems to be offline</Text>
                </View>
            </View>}

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
        paddingHorizontal: 15
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
        fontSize: FONT_SIZES.xl,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black
    },
    shipperImageCont: {
        width: 100,
        height: 100,
        borderRadius: BORDER_RADIUS.round,
        justifyContent: "center",
        alignItems: "center"
    },
    shipperImage: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.round
    },
    shipperHeaderLabelCont: {
        backgroundColor: Colors.text.white,
        padding: 15,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: "center",
        alignItems: "center"
    },
    shipperName: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
    },
    shipperLabelCont: {
        marginTop: 10,
        alignItems: "center"
    },

    shipperProfileDetailsCont: {
        marginTop: 15,
        backgroundColor: Colors.text.white,
        padding: 15,
        borderRadius: BORDER_RADIUS.md,

    },
    profileLabelIconCont: {
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: Colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15
    },
    profileLabelCont: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15
    },
    profileDetailContainer: {
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.borderColor,

    },
    profileNameLabel: {
        fontSize: FONT_SIZES.sm,
        color: Colors.text.gray,
        fontFamily: FONTS.medium
    },
    profileName: {
        marginTop: 2,
        fontSize: FONT_SIZES.md,
        color: Colors.text.black,
        fontFamily: FONTS.medium
    },
    profileLabelDetailsCont: {
        marginRight: "auto"
    },
    editIconCont: {
        width: 30,
        height: 30,
        borderRadius: 30,
        backgroundColor: Colors.text.white,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 70,
        left: 70
    },
    editInnerIcon: {
        width: 25,
        height: 25,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    bottomSheetCoverContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    fillScreen: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center"
    },
    errorCont: {
        width: "80%",
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.xmd
    },
    errorText: {
        fontSize: FONT_SIZES.md,
        color: Colors.text.white,
        fontFamily: FONTS.regular,
        textAlign: "center"
    },


})