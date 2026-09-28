import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp } from '../../../../Navigation/DriverNavigation'
import PersonalInfoShimmer from '../components/PersonalInfoShimmer'
import { supabase } from '../../../../lib/supabase'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { useEffect, useState } from 'react'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { useDriverStore } from '../../../store/DriverStore'
import NanoLoadingSpinner from '../../../../utils/nanoLoadingSpinner'
import UpdateProfileBottomSheet from '../components/UpdateProfileBottomSheet'
import { DRIVER_PHOTO_ISSUES_CODE, FIRST_NAME_ISSUES_CODE, LAST_NAME_ISSUES_CODE, PENDING_DRIVER_PHOTO_ISSUES_CODE, VERIFICATION_ISSUES_CODE, VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import UpdateDriverPhotoBottomSheet from '../components/UpdateDriverPhotoBottomSheet'
import PendingPhotoBottomSheet from '../components/PendingPhotoBottomSheet'
import { useNetworkStore } from '../../../../Providers/Network/NetworkStore'


export type driverVerificationStatusType = "APPROVED" | "PENDING" | "REJECTED";


export type fieldType = "firstname" | "lastname" | "email" | "phone" | "birthday";
type signInType = "phone" | "email";

export default function PersonalInfo() {
    const session = useAuthStore((store) => store.session);
    const isOnline = useNetworkStore((store) => store.isOnline);
    const navigation = useNavigation<DriverNavigationProp>();
    const driverImgKey = useDriverStore((store) => store.driverImgKey)
    const [driverVerificationStatus, setDriverVerificationStatus] = useState<driverVerificationStatusType | null>(null);
    const [driverImgUrl, setDriverImgUrl] = useState("");
    const [pendingDriverImgUrl, setPendingDriverImgUrl] = useState<string | null>(null);
    const [pendingDriverImgKey, setPendingDriverImgKey] = useState<string | null>(null);
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
    const [personalVerificationIssues, setPersonalVerificationIssues] = useState<any[] | null>(null);
    const [showPendingPhotoBottomSheet, setShowPendingPhotoBottomSheet] = useState(false);


    const goBack = () => {
        navigation.goBack();
    }


    const driverVerificationStatusText = driverVerificationStatus == VERIFICATION_STATUS.APPROVED ? "Verified" : driverVerificationStatus == VERIFICATION_STATUS.PENDING ? "Pending" : "Not Verified";

    const driverVerificationStatusTextColor = driverVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.green : driverVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.text.gray;

    const driverVerificationStatusBgColor = driverVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : driverVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.backBtnGray;

    const driver_photo_issue = personalVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.DRIVER_PHOTO);

    const driver_photo_issue_code = driver_photo_issue ? driver_photo_issue.ISSUES_CODE == DRIVER_PHOTO_ISSUES_CODE.PROFILE_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.PROFILE_PHOTO_BLURRY :
        driver_photo_issue.ISSUES_CODE == DRIVER_PHOTO_ISSUES_CODE.PROFILE_PHOTO_INVALID ? VERIFICATION_ISSUES_CODE.PROFILE_PHOTO_INVALID : VERIFICATION_ISSUES_CODE.PROFILE_PHOTO_MULTIPLE_PEOPLE : undefined;

    const pending_driver_photo_issue = personalVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_DRIVER_PHOTO);

    const pending_driver_photo_issue_code = pending_driver_photo_issue ? pending_driver_photo_issue.ISSUES_CODE == PENDING_DRIVER_PHOTO_ISSUES_CODE.PENDING_PROFILE_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.PENDING_PROFILE_PHOTO_BLURRY :
        pending_driver_photo_issue.ISSUES_CODE == PENDING_DRIVER_PHOTO_ISSUES_CODE.PENDING_PROFILE_PHOTO_INVALID ? VERIFICATION_ISSUES_CODE.PENDING_PROFILE_PHOTO_INVALID : VERIFICATION_ISSUES_CODE.PENDING_PROFILE_PHOTO_MULTIPLE_PEOPLE : undefined;


    const firstname_issue = personalVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.FIRST_NAME);

    const firstname_issue_code = firstname_issue ?
        firstname_issue.ISSUES_CODE == FIRST_NAME_ISSUES_CODE.FIRST_NAME_MISMATCH_NIN ? VERIFICATION_ISSUES_CODE.FIRST_NAME_MISMATCH_NIN
            : firstname_issue.ISSUES_CODE == FIRST_NAME_ISSUES_CODE.FIRST_NAME_MISMATCH_DRIVER_LICENSE ? VERIFICATION_ISSUES_CODE.FIRST_NAME_MISMATCH_DRIVER_LICENSE
                : VERIFICATION_ISSUES_CODE.FIRST_NAME_MISMATCH_IDENTITY_DOCUMENTS
        : undefined;

    const lastname_issue = personalVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.LAST_NAME);

    const lastname_issue_code = lastname_issue ?
        lastname_issue.ISSUES_CODE == LAST_NAME_ISSUES_CODE.LAST_NAME_MISMATCH_NIN ? VERIFICATION_ISSUES_CODE.LAST_NAME_MISMATCH_NIN
            : lastname_issue.ISSUES_CODE == LAST_NAME_ISSUES_CODE.LAST_NAME_MISMATCH_DRIVER_LICENSE ? VERIFICATION_ISSUES_CODE.LAST_NAME_MISMATCH_DRIVER_LICENSE
                : VERIFICATION_ISSUES_CODE.LAST_NAME_MISMATCH_IDENTITY_DOCUMENTS
        : undefined;

    const birthday_issue = personalVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.BIRTH_DAY);

    const birthday_issue_code = birthday_issue ? VERIFICATION_ISSUES_CODE.DATE_OF_BIRTH_MISMATCH_DRIVER_LICENSE : undefined;





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

    const getDriverData = async () => {
        const { data: driverData, error: driverDataError } = await supabase
            .from('Driver')
            .select('*')
            .eq('id', session?.user.id)
            .single();

        if (driverDataError) {
            throw new Error(`Error querying Driver Data: ${driverDataError.message}`);

        }

        setFirstName(driverData.firstname);
        setLastName(driverData.lastname);
        setBirthday(driverData.birthday);
        setPendingDriverImgKey(driverData.pending_driver_img_key);
    }

    const getDriverVerificationStatus = async () => {
        const { data: verification_status, error: verification_status_err } = await supabase
            .from('Driver_Verification')
            .select('verification_status')
            .eq('driver_id', session?.user.id)
            .single();

        if (verification_status_err) {
            throw new Error(`Error querying Driver Verification Status: ${verification_status_err.message}`);

        }

        setDriverVerificationStatus(verification_status.verification_status);
    }

    const getDriverImage = async () => {
        if (!driverImgKey) return
        const { data: signedImage, error: signedImageError } =
            await supabase.storage
                .from("driver-photos")
                .createSignedUrl(driverImgKey, 60 * 60);

        if (signedImageError) {
            throw new Error(
                `Error creating driver image URL: ${signedImageError.message}`
            );
        }

        const imageUrl = signedImage.signedUrl;
        setDriverImgUrl(imageUrl);
    }

    const getPendingDriverImage = async () => {
        const pending_path = `driver/pending/${session?.user.id}/driverImage.jpg`;
        const { data: signedImage, error: signedImageError } =
            await supabase.storage
                .from("driver-photos")
                .createSignedUrl(pending_path, 60 * 60);

        if (signedImageError) {
            setPendingDriverImgUrl(null);
            return
        }

        setPendingDriverImgUrl(signedImage.signedUrl);
    }

    const getDriverProfile = async () => {
        try {
            await Promise.all([
                await getUserData(),
                await getDriverImage(),
                await getPendingDriverImage(),
                await getDriverData(),
                await getDriverVerificationStatus(),
                await getUserSignInMethod(),
                await getPersonalInfoVerificationIssues()
            ])
            setLoadingStatus(false);
        } catch (e) {
            console.log("error: ", e)
        }
    }

    useEffect(() => {
        if (!isOnline || !loadingStatus) return;
        getDriverProfile();
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
            if (driverVerificationStatus == VERIFICATION_STATUS.APPROVED) return

            setOpenEditBottomSheet(field)
        }

    }

    const updateProfilePhoto = () => {
        if (pendingDriverImgUrl) {
            setShowPendingPhotoBottomSheet(true);
        } else {
            setShowPhotoBottomSheet(true)
        }
    }



    const getPersonalInfoVerificationIssues = async () => {
        const { data: verification_issues_data, error: select_verification_issues_err } = await supabase
            .from("Verification_Issues")
            .select("*")
            .eq("driver_id", session?.user.id)
            .eq("section", VERIFICATION_ISSUES_SECTION.PERSONAL_INFO);

        if (select_verification_issues_err) {
            throw new Error(`Error querying Verification Issues: ${select_verification_issues_err.message}`);
        }

        setPersonalVerificationIssues(verification_issues_data);
    }

    const openPendingPhotoUI = () => {
        setShowPendingPhotoBottomSheet(true);
    }


    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <View style={styles.body}>
                <Pressable onPress={goBack} style={styles.backBtn}>
                    <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
                </Pressable>

                <View style={{ marginVertical: 15 }}>
                    <Text style={styles.headerText}>Personal information</Text>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
                    {loadingStatus ? <PersonalInfoShimmer /> :
                        <View>

                            <View style={styles.driverHeaderLabelCont}>
                                <View style={styles.driverImageCont}>
                                    <Image source={{ uri: driverImgUrl }} style={styles.driverImage} />
                                    <Pressable onPress={updateProfilePhoto} style={styles.editIconCont}>
                                        <View style={styles.editInnerIcon}>
                                            <Ionicons name="camera" size={18} color={Colors.text.white} />
                                        </View>
                                    </Pressable>
                                </View>
                                <View style={styles.driverLabelCont}>
                                    <Text style={styles.driverName}>{`${firstName} ${lastName}`}</Text>
                                    <View style={styles.badgeCont}>
                                        <View style={[styles.badgeIconCont, { backgroundColor: driverVerificationStatusBgColor }]}>
                                            {driverVerificationStatus == "REJECTED" ?
                                                <MaterialCommunityIcons
                                                    name={"shield-off"}
                                                    size={20}
                                                    color={driverVerificationStatusTextColor}
                                                />
                                                :
                                                driverVerificationStatus == "PENDING" ?
                                                    <Ionicons
                                                        name="time-outline"
                                                        size={20}
                                                        color={driverVerificationStatusTextColor}
                                                    />
                                                    :
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={20}
                                                        color={driverVerificationStatusTextColor}
                                                    />
                                            }
                                            {/* <Image source={driverBadge} style={styles.badgeImg}/> */}
                                        </View>
                                        <Text style={[styles.badgeText, { color: driverVerificationStatusTextColor, backgroundColor: driverVerificationStatusBgColor }]}>{driverVerificationStatusText}</Text>
                                    </View>
                                </View>
                                {driver_photo_issue && <View style={styles.issueCont}>
                                    <Text style={styles.issueText}>{driver_photo_issue_code}</Text>
                                </View>}

                                {pendingDriverImgKey && <Pressable onPress={openPendingPhotoUI} style={[styles.pendingPhotoCont, { backgroundColor: pending_driver_photo_issue ? Colors.errorBackground : Colors.primaryTransparent }]}>
                                    <Ionicons name={pending_driver_photo_issue ? "alert-circle" : "time-outline"} size={18} color={pending_driver_photo_issue ? Colors.error : Colors.primary} />
                                    <Text style={[styles.pendingPhotoText, { color: pending_driver_photo_issue ? Colors.error : Colors.primary }]}>Pending photo</Text>
                                </Pressable>}

                            </View>

                            <View style={styles.driverProfileDetailsCont}>
                                <Pressable onPress={() => editProfileData("firstname")} style={styles.profileDetailContainer}>
                                    <View style={styles.profileLabelCont}>
                                        <View style={styles.profileLabelIconCont}>
                                            <Ionicons name="person-outline" size={24} color={Colors.text.gray} />
                                        </View>

                                        <View style={styles.profileLabelDetailsCont}>
                                            <Text style={styles.profileNameLabel}>First name</Text>
                                            <Text style={styles.profileName}>{firstName}</Text>
                                        </View>

                                        {driverVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />}

                                    </View>

                                    {firstname_issue && <View style={styles.issueCont}>
                                        <Text style={styles.issueText}>{firstname_issue_code}</Text>
                                    </View>}


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
                                        {driverVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />}

                                    </View>

                                    {lastname_issue && <View style={styles.issueCont}>
                                        <Text style={styles.issueText}>{lastname_issue_code}</Text>
                                    </View>}

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
                                        {driverVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />}
                                    </View>
                                    {birthday_issue && <View style={styles.issueCont}>
                                        <Text style={styles.issueText}>{birthday_issue_code}</Text>
                                    </View>}

                                </Pressable>
                            </View>
                        </View>
                    }
                </ScrollView>

            </View>
            {(openEditBottomSheet || showPendingPhotoBottomSheet) && <View style={styles.bottomSheetCoverContainer} />}
            {openEditBottomSheet && <UpdateProfileBottomSheet openEditBottomSheet={openEditBottomSheet} setOpenEditBottomSheet={setOpenEditBottomSheet} setFirstName={setFirstName} setLastName={setLastName} setBirthday={setBirthday} setEmail={setEmail} setPhone={setPhone} firstname={firstName} lastname={lastName} birthday={birthday} email={email} phone={phone} setShowLoadingSpinner={setShowLoadingSpinner} setShowErrorAlert={setShowErrorAlert} setPersonalVerificationIssues={setPersonalVerificationIssues} setDriverVerificationStatus={setDriverVerificationStatus} />}


            {showPendingPhotoBottomSheet && <PendingPhotoBottomSheet setShowLoadingSpinner={setShowLoadingSpinner} setShowErrorAlert={setShowErrorAlert} pendingDriverImgUrl={pendingDriverImgUrl as string} setShowPendingPhotoBottomSheet={setShowPendingPhotoBottomSheet} setShowPhotoBottomSheet={setShowPhotoBottomSheet} setPendingDriverImgUrl={setPendingDriverImgUrl} pendingPhotoIssue={pending_driver_photo_issue_code} setPersonalVerificationIssues={setPersonalVerificationIssues} setPendingDriverImgKey={setPendingDriverImgKey} />}

            {showPhotoBottomSheet && <UpdateDriverPhotoBottomSheet setDriverImgUrl={setDriverImgUrl} showPhotoBottomSheet={showPhotoBottomSheet} setShowPhotoBottomSheet={setShowPhotoBottomSheet} setShowLoadingSpinner={setShowLoadingSpinner} setShowErrorAlert={setShowErrorAlert} personalVerificationIssues={personalVerificationIssues} setPersonalVerificationIssues={setPersonalVerificationIssues} setDriverVerificationStatus={setDriverVerificationStatus} driverVerificationStatus={driverVerificationStatus} setPendingDriverImgUrl={setPendingDriverImgUrl} setPendingDriverImgKey={setPendingDriverImgKey} pendingPhotoIssue={pending_driver_photo_issue_code} />}
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
    driverImageCont: {
        width: 100,
        height: 100,
        borderRadius: BORDER_RADIUS.round
    },
    driverImage: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.round
    },
    driverHeaderLabelCont: {
        backgroundColor: Colors.text.white,
        padding: 15,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: "center",
        alignItems: "center"
    },
    driverName: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
    },
    driverLabelCont: {
        marginTop: 10,
        alignItems: "center"
    },
    badgeCont: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
        marginBottom: 5
    },
    badgeImg: {
        width: "100%",
        height: "100%",
        borderRadius: 30
    },
    badgeText: {
        backgroundColor: Colors.transparentGreen,
        paddingVertical: 4,
        paddingRight: 4,
        paddingLeft: 10,
        borderTopRightRadius: BORDER_RADIUS.lg,
        borderBottomRightRadius: BORDER_RADIUS.lg,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        color: Colors.green,
        zIndex: 1
    },
    badgeIconCont: {
        backgroundColor: Colors.transparentGreen,
        width: 30,
        height: 30,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginRight: -8,
        zIndex: 2
    },
    driverProfileDetailsCont: {
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
    issueCont: {
        backgroundColor: Colors.errorBackground,
        borderRadius: BORDER_RADIUS.md,
        padding: 5,
        marginBottom: 5,
    },
    issueText: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        color: Colors.error,
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
    pendingPhotoCont: {
        top: 10,
        right: 5,
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: Colors.primaryTransparent,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.md

    },
    pendingPhotoText: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.regular,
        color: Colors.primary
    }

})