import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES, SPACING } from '../../../../constants/theme/font'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp } from '../../../../Navigation/DriverNavigation'
import ProfileShimmer from '../components/ProfileShimmer'
import { supabase } from '../../../../lib/supabase'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { DRIVER_DOCUMENT_TYPE, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { useNetworkStore } from '../../../../Providers/Network/NetworkStore'

export type personalInfoVerificationType = "APPROVED" | "PENDING" | "REJECTED";
export type identityInfoVerificationType = "APPROVED" | "PENDING" | "REJECTED";


export default function Profile() {
    const session = useAuthStore((store) => store.session);
    const isOnline = useNetworkStore((store) => store.isOnline);

    const navigation = useNavigation<DriverNavigationProp>();
    const [personalInfoVerified, setPersonalInfoVerified] = useState<personalInfoVerificationType>("PENDING");
    const [ninInfoVerified, setNinInfoVerified] = useState<identityInfoVerificationType>("PENDING");
    const [driverLicenseInfoVerified, setDriverLicenseInfoVerified] = useState<identityInfoVerificationType>("PENDING");
    const [personalInfoVerificationIssues, setPersonalInfoVerificationIssues] = useState<number | null>(null);

    const [identityVerificationIssues, setIdentityVerificationIssues] = useState<number | null>(null);

    const [loadingStatus, setLoadingStatus] = useState(true);

    const identityInfoVerified = (ninInfoVerified == VERIFICATION_STATUS.APPROVED && driverLicenseInfoVerified == VERIFICATION_STATUS.APPROVED) ? VERIFICATION_STATUS.APPROVED : identityVerificationIssues ? VERIFICATION_STATUS.REJECTED : VERIFICATION_STATUS.PENDING;

    const showTopInfoStatusCont = personalInfoVerified == VERIFICATION_STATUS.APPROVED && identityInfoVerified == VERIFICATION_STATUS.APPROVED;
    const personalInfoIconName = personalInfoVerified == VERIFICATION_STATUS.APPROVED ? "checkmark-circle" : personalInfoVerified == VERIFICATION_STATUS.PENDING ? "time-outline" : "alert-circle";
    const identityInfoIconName = identityInfoVerified == VERIFICATION_STATUS.APPROVED ? "checkmark-circle" : identityInfoVerified == VERIFICATION_STATUS.PENDING ? "time-outline" : "alert-circle";

    const personalInfoStatusText = personalInfoVerified == VERIFICATION_STATUS.APPROVED ? "Verified" : personalInfoVerified == VERIFICATION_STATUS.PENDING ? "Pending" : `${personalInfoVerificationIssues} issues`;
    const identityInfoStatusText = identityInfoVerified == VERIFICATION_STATUS.APPROVED ? "Verified" : identityInfoVerified == VERIFICATION_STATUS.PENDING ? "Pending" : `${identityVerificationIssues} issues`;

    const personalInfoStatusTextColor = personalInfoVerified == VERIFICATION_STATUS.APPROVED ? Colors.green : personalInfoVerified == VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.error;
    const identityInfoStatusTextColor = identityInfoVerified == VERIFICATION_STATUS.APPROVED ? Colors.green : identityInfoVerified == VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.error;

    const personalInfoStatusBgColor = personalInfoVerified == VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : personalInfoVerified == VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.errorBackground;
    const identityInfoStatusBgColor = identityInfoVerified == VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : identityInfoVerified == VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.errorBackground;




    const goBack = () => {
        navigation.goBack();
    }

    const goToPersonalInfo = () => {
        navigation.navigate("PersonalInfo")
    }

    const goToIdentityInfo = () => {
        navigation.navigate("IdentityInfo")
    }


    const getPersonalInfoVerificationStatus = async () => {
        const { data: select_driver_verification_data, error: select_driver_verification_data_err } = await supabase
            .from("Driver_Verification")
            .select("verification_status")
            .eq("driver_id", session?.user.id)
            .single();

        if (select_driver_verification_data_err) {
            throw new Error(`Error querying Driver Verification: ${select_driver_verification_data_err.message}`);
        }

        if (select_driver_verification_data.verification_status !== VERIFICATION_STATUS.REJECTED) {
            setPersonalInfoVerified(select_driver_verification_data.verification_status)
        } else {
            const { count: verification_issues_count, error: select_verification_issues_err } = await supabase
                .from("Verification_Issues")
                .select("*", { count: "exact", head: true })
                .eq("driver_id", session?.user.id)
                .eq("section", VERIFICATION_ISSUES_SECTION.PERSONAL_INFO);

            if (select_verification_issues_err) {
                throw new Error(`Error querying Verification Issues: ${select_verification_issues_err.message}`);
            }

            console.log("verification issues count: ", verification_issues_count)
            setPersonalInfoVerificationIssues(verification_issues_count)
            setPersonalInfoVerified(VERIFICATION_STATUS.REJECTED)

        }
    }

    const getIdentityVerificationIssues = async () => {
        const { count: verification_issues_count, error: select_verification_issues_err } = await supabase
            .from("Verification_Issues")
            .select("*", { count: "exact", head: true })
            .eq("driver_id", session?.user.id)
            .eq("section", VERIFICATION_ISSUES_SECTION.IDENTITY_INFO);

        if (select_verification_issues_err) {
            throw new Error(`Error querying Verification Issues: ${select_verification_issues_err.message}`);
        }

        setIdentityVerificationIssues(verification_issues_count);
    }


    const getNinInfoVerificationStatus = async () => {
        const { data: select_driver_nin_document, error: select_driver_nin_document_err } = await supabase
            .from("Driver_Documents")
            .select("status")
            .eq("driver_id", session?.user.id)
            .eq("document_type", DRIVER_DOCUMENT_TYPE.NIN)
            .single();

        if (select_driver_nin_document_err) {
            throw new Error(`Error querying Driver NIN status: ${select_driver_nin_document_err.message}`);
        }

        setNinInfoVerified(select_driver_nin_document.status);

    }

    const getDriverLicenseVerificationStatus = async () => {
        const { data: select_driver_license_document, error: select_driver_license_document_err } = await supabase
            .from("Driver_Documents")
            .select("status")
            .eq("driver_id", session?.user.id)
            .eq("document_type", DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE)
            .single();

        if (select_driver_license_document_err) {
            throw new Error(`Error querying Driver License status: ${select_driver_license_document_err.message}`);
        }

        setDriverLicenseInfoVerified(select_driver_license_document.status);
    }


    const getIdentityInfoVerificationStatus = async () => {
        await Promise.all([
            getNinInfoVerificationStatus(),
            getDriverLicenseVerificationStatus(),
            getIdentityVerificationIssues()
        ])
    }

    const fetchProfileData = async () => {
             try {
                    await Promise.all([
                        getPersonalInfoVerificationStatus(),
                        getIdentityInfoVerificationStatus()
                    ])
                    setLoadingStatus(false);
                } catch (e) {
                    console.log("Error: ", e)
                }
    }


    useEffect(()=>{
        if(!isOnline || !loadingStatus) return;
        fetchProfileData();

    }, [isOnline, loadingStatus])



    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <View style={styles.body}>
                <Pressable onPress={goBack} style={styles.backBtn}>
                    <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
                </Pressable>

                <View style={{ marginTop: 15 }}>
                    <Text style={styles.headerText}>Manage your information</Text>
                </View>

                <View>
                    {loadingStatus ? <ProfileShimmer />
                        :
                        <>
                            {!showTopInfoStatusCont && ((personalInfoVerified == VERIFICATION_STATUS.REJECTED || identityInfoVerified == VERIFICATION_STATUS.REJECTED) ?

                                <View style={[styles.infoCont, { backgroundColor: Colors.errorBackground, marginTop: 20 }]}>
                                    <View style={[styles.iconCont, { borderRadius: 40, backgroundColor: "#F9D3D3" }]}>
                                        <Ionicons name="alert-circle" size={28} color={Colors.error} />
                                    </View>
                                    <View style={styles.reviewCont}>
                                        <Text style={[styles.labelText, { color: Colors.error }]}>Verification Issue Found</Text>
                                        <Text style={styles.labelDesc}>There's an issue with the information you submitted. Please review and update it to continue your verification.</Text>
                                    </View>
                                </View>

                                :

                                <View style={[styles.infoCont, { backgroundColor: Colors.primaryTransparent, marginTop: 20 }]}>
                                    <View style={[styles.iconCont, { borderRadius: 40, backgroundColor: "#FFE4D1" }]}>
                                        <Ionicons name="time-outline" size={28} color={Colors.primary} />
                                    </View>
                                    <View style={styles.reviewCont}>
                                        <Text style={[styles.labelText, { color: Colors.primary }]}>Verification in progress</Text>
                                        <Text style={styles.labelDesc}>We are reviewing your information. This should be completed within 24 hours.</Text>
                                    </View>
                                </View>

                            )}

                            <View style={styles.cardsCont}>
                                <Pressable onPress={goToPersonalInfo} style={styles.infoCont}>
                                    <View style={[styles.iconCont, { backgroundColor: Colors.transparentBlue }]}>
                                        <Ionicons name="person-outline" size={24} color={Colors.blue} />
                                    </View>
                                    <View style={styles.labelCont}>
                                        <Text style={styles.labelText}>Personal Info</Text>
                                        <Text style={styles.labelDesc}>View and update your personal details</Text>
                                    </View>
                                    <View>
                                        <View style={[styles.statusCont, { backgroundColor: personalInfoStatusBgColor }]}>
                                            <Ionicons name={personalInfoIconName} size={18} color={personalInfoStatusTextColor} />
                                            <Text style={[styles.statusText, { color: personalInfoStatusTextColor }]}>{personalInfoStatusText}</Text>
                                        </View>

                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} style={styles.arrowIcon} />
                                </Pressable>

                                <Pressable onPress={goToIdentityInfo} style={styles.infoCont}>
                                    <View style={[styles.iconCont, { backgroundColor: Colors.transparentPurple }]}>
                                        <AntDesign name="idcard" size={24} color={Colors.purple} />
                                    </View>
                                    <View style={styles.labelCont}>
                                        <Text style={styles.labelText}>Identity Info</Text>
                                        <Text style={styles.labelDesc}>View and update your identity details</Text>
                                    </View>
                                    <View>
                                        <View style={[styles.statusCont, { backgroundColor: identityInfoStatusBgColor }]}>
                                            <Ionicons name={identityInfoIconName} size={18} color={identityInfoStatusTextColor} />
                                            <Text style={[styles.statusText, { color: identityInfoStatusTextColor }]}>{identityInfoStatusText}</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} style={styles.arrowIcon} />

                                </Pressable>

                            </View>
                        </>
                    }
                </View>

            </View>
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
    headerDesc: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        marginTop: SPACING.xs,
        color: Colors.text.gray,
    },
    borderBox: {
        marginTop: 20,
        padding: 10,
        borderRadius: BORDER_RADIUS.lg,
    },
    cardsCont: {
        marginTop: 20,
        gap: 10
    },
    statusText: {
        color: Colors.green,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium
    },
    infoCont: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: Colors.text.white,
        padding: 15,
        borderRadius: BORDER_RADIUS.md
    },
    labelCont: {
        flexShrink: 1
    },
    labelText: {
        color: Colors.text.black,
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
    },
    labelDesc: {
        color: Colors.text.gray,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.regular,
        marginTop: 5
    },
    iconCont: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15
    },
    statusCont: {
        backgroundColor: Colors.transparentGreen,
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.round
    },
    arrowIcon: {
        marginLeft: 20,
        alignSelf: "center"
    },
    reviewCont: {
        flexShrink: 1
    },

})