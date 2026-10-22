import { Alert, Image, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import HexagonSpinner from '../../../../utils/HexagonSpinner'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { supabase } from '../../../../lib/supabase'
import ProfilePhotoPlaceholder from '../../../../utils/profilePhotoPlaceholder'

type AssignDriverProps = {
    setShowAssignDriverBottomSheet: React.Dispatch<React.SetStateAction<boolean>>
    vehicleId: string
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    updateCurrentDriver: (driverObj: driverDetailsType) => void
    onUpdateCurrentDriver: (driverObj: driverDetailsType) => void
    vehicleVerificationStatus: VERIFICATION_STATUS | undefined
}


export interface driverDetailsType {
    driver_id: string
    driver_img_key: string
    firstname: string
    lastname: string
    verification_status: VERIFICATION_STATUS
    license_class: string
    email: string
    phone: string
    isAssigned: boolean
}

type notFoundType = "Network_Error" | "Driver_Not_Found";

export default function AssignDriver({ setShowAssignDriverBottomSheet, vehicleId, setShowErrorAlert, setShowLoadingSpinner, updateCurrentDriver, onUpdateCurrentDriver, vehicleVerificationStatus }: AssignDriverProps) {
    const [phone, setPhone] = useState("");
    const [driverInfo, setDriverInfo] = useState<driverDetailsType | null>(null);
    const [findingDriver, setFindingDriver] = useState(false);
    const [showDriverNotFound, setShowDriverNotFound] = useState<notFoundType | null>(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [driverPhoto, setDriverPhoto] = useState<string | null>(null)
    const snapPoints = useMemo(() => ['90%'], []);


    const driverVerificationStatusText = driverInfo?.verification_status === VERIFICATION_STATUS.APPROVED ? "Verified" : driverInfo?.verification_status === VERIFICATION_STATUS.PENDING ? "Pending" : "Not verified";
    const driverVerificationStatusTextColor = driverInfo?.verification_status === VERIFICATION_STATUS.APPROVED ? Colors.green : driverInfo?.verification_status === VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.text.gray;
    const driverVerificationStatusBgColor = driverInfo?.verification_status === VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : driverInfo?.verification_status === VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.backBtnGray;


    const isValidPhone = (value: string): boolean => {
        return /^\d{11}$/.test(value.trim());
    };


    const getDriverImageUrl = async (imgKey: string) => {
        if (!imgKey) return

        const { data: signedImage, error: signedImageError } =
            await supabase.storage
                .from("driver-photos")
                .createSignedUrl(imgKey, 60 * 60);

        if (signedImageError) {
            console.log("error: ", signedImageError.message)
            throw new Error(
                `Error creating driver image URL: ${signedImageError.message}`
            );
        }

        const imageUrl = signedImage.signedUrl;
        setDriverPhoto(imageUrl);
    }




    const setInputValue = (value: string) => {
        const isValid = isValidPhone(value);
        
        if (isValid) {
            Keyboard.dismiss();
            setDriverInfo(null);
            setShowDriverNotFound(null);
            setFindingDriver(true);
            setImageLoading(true);
            setDriverPhoto(null);
            const formattedPhone = value.trim().replace(/^0/, '+234');
            findDriver(formattedPhone);
        }

        setPhone(value);
    }



    const findDriver = async (phone: string) => {
        try {

            const { data, error } = await supabase.rpc(
                'find_assignable_driver_by_phone',
                { p_phone: phone.trim() }
            );

            if (error) {
                throw new Error(`Error finding driver: ${error.message}`);
            }

            console.log("data: ", data);

            if (!data) {
                setFindingDriver(false);
                setShowDriverNotFound("Driver_Not_Found");
                return;
            }

            await getDriverImageUrl(data.driver_img_key);
            setFindingDriver(false);
            setDriverInfo(data);

        } catch (e) {
            console.log("Error: ", e);
            setFindingDriver(false);
            setShowDriverNotFound("Network_Error");
        }



    }


    const assignDriver = async () => {
        try {
            if (!driverInfo?.driver_id || !isDriverAssignable) return;

            setShowAssignDriverBottomSheet(false);
            setShowLoadingSpinner(true);

            
            const { error: assignErr } = await supabase
                .from('Vehicle')
                .update({ current_driver_id: driverInfo.driver_id })
                .eq('id', vehicleId);

            if (assignErr) {
                throw new Error(`Error assigning driver: ${assignErr.message}`);
            }

            updateCurrentDriver(driverInfo);
            onUpdateCurrentDriver(driverInfo);
            setShowLoadingSpinner(false);

            Alert.alert(
                'Driver Assigned Successfully',
                'The driver has been assigned to this vehicle. The vehicle can now go live.',
                [
                    {
                        text: 'OK',
                        style: 'default',
                    },
                ]
            );

        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);

        }

    }

    const isDriverAssignable = vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED && !driverInfo?.isAssigned && driverInfo?.verification_status === VERIFICATION_STATUS.APPROVED;
    const isDriverAssignableText = !isDriverAssignable && (vehicleVerificationStatus !== VERIFICATION_STATUS.APPROVED ? "Vehicle must be approved before assigning a driver." : driverInfo?.isAssigned ? "This driver is already assigned to a vehicle. They have to be Unassigned first before reassignment." : "Driver must be approved before they can be assigned.");

    return (
        <BottomSheet
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose={false}
            enableOverDrag={false}
            backgroundStyle={{ backgroundColor: Colors.background }}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            handleStyle={styles.handleStyle}
        >
            <BottomSheetView style={styles.body}>
                <View>
                    <Pressable onPress={() => setShowAssignDriverBottomSheet(false)} style={styles.closeBtn}>
                        <AntDesign name="close" color={Colors.text.black} size={18} />
                    </Pressable>
                </View>

                <View style={{ gap: 5, marginBottom: 20 }}>
                    <Text style={styles.headerLabelText}>Assign a driver</Text>
                    <Text style={styles.headerLabelDesc}>Find a driver using their phone number</Text>
                </View>
                <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.inputBox}>
                        <Ionicons name="search-outline" size={20} color={Colors.text.gray} />
                        <TextInput
                            value={phone}
                            onChangeText={(value) => setInputValue(value)}
                            placeholder='e.g 08012345678'
                            placeholderTextColor={Colors.text.gray}
                            keyboardType="number-pad"
                            style={styles.textInput}
                            maxLength={11}
                        />
                        <Ionicons name="close-circle" onPress={() => setPhone("")} size={20} color={Colors.text.boxContPlaceholderText} />
                    </View>

                    {
                        (showDriverNotFound && phone.length === 11) && <View style={styles.notFoundCardContainer}>
                            <View style={styles.iconCont}>
                                <Ionicons name="search" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.notFoundLabelCont}>
                                <Text style={styles.notFoundLabel}>{showDriverNotFound === "Driver_Not_Found" ? "No driver found" : "Connection problem"}</Text>
                                <Text style={styles.notFoundLabelText}>{showDriverNotFound === "Driver_Not_Found" ? "No driver exists with the phone number provided." : "Driver search failed. Check your internet connection and try again."}</Text>
                            </View>
                        </View>
                    }

                    {findingDriver && <View style={styles.searchingDriverBox}>
                        <HexagonSpinner />
                        <View style={styles.searchingTextCont}>
                            <Text style={styles.searchTextLabel}>Searching for a driver...</Text>
                            <Text style={styles.searchTextDesc}>Please wait while we find a driver matching the phone number you provided</Text>
                        </View>
                    </View>}

                    {(driverInfo && phone.length === 11) && <View style={styles.driverCardCont}>
                        <View style={styles.mainDetailsCont}>
                            <View style={styles.driverImage}>
                                {driverPhoto && <Image source={{ uri: driverPhoto }} onLoad={() => setImageLoading(false)} style={styles.image} />}
                                {imageLoading && <ProfilePhotoPlaceholder />}
                            </View>
                            <View style={styles.driverDetailsCont}>
                                <Text style={styles.driverName}>{`${driverInfo.firstname} ${driverInfo.lastname}`}</Text>
                                <View style={[styles.driverStatusBgCont, { backgroundColor: driverVerificationStatusBgColor }]}>
                                    {
                                        driverInfo.verification_status === VERIFICATION_STATUS.APPROVED ?
                                            <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
                                            :
                                            driverInfo.verification_status === VERIFICATION_STATUS.PENDING ?
                                                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                                                :
                                                <MaterialCommunityIcons name="shield-off" size={18} color={Colors.text.gray} />
                                    }
                                    <Text style={[styles.driverStatusText, { color: driverVerificationStatusTextColor }]}>{driverVerificationStatusText}</Text>
                                </View>
                                <View style={styles.ratingsCont}>
                                    <Ionicons name="star" size={14} color={Colors.primary} />
                                    <Text style={styles.ratingsText}>4.8 <Text style={{ color: Colors.text.gray }}>(125)</Text></Text>
                                </View>
                            </View>

                        </View>
                        <View style={styles.sectionCardCont}>
                            <View style={styles.sectionCont}>
                                <View style={styles.sectionIconCont}>
                                    <MaterialCommunityIcons
                                        name="card-account-details-outline"
                                        size={18}
                                        color={Colors.text.gray}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.sectionLabel}>License class</Text>
                                    <Text style={styles.sectionLabelText}>{driverInfo.license_class}</Text>
                                </View>
                            </View>

                            <View style={styles.sectionCont}>
                                <View style={styles.sectionIconCont}>
                                    <MaterialCommunityIcons
                                        name="truck-outline"
                                        size={18}
                                        color={Colors.text.gray}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.sectionLabel}>Orders Assigned</Text>
                                    <Text style={styles.sectionLabelText}>348</Text>
                                </View>
                            </View>
                        </View>

                        <Pressable onPress={assignDriver} style={[styles.assignBtn, { backgroundColor: isDriverAssignable ? Colors.primary : Colors.backBtnGray }]}>
                            <Text style={[styles.assignBtnText, { color: isDriverAssignable ? Colors.text.white : Colors.text.gray }]}>Assign driver</Text>
                        </Pressable>
                        {isDriverAssignableText && <View style={styles.info}>
                            <Ionicons
                                name="information-circle-outline"
                                size={20}
                                color={Colors.text.gray}
                            />
                            <Text style={styles.infoText}>{isDriverAssignableText}</Text>
                        </View>}

                    </View>}


                </BottomSheetScrollView>
            </BottomSheetView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    body: {
        height: "100%",
        backgroundColor: Colors.background,
        paddingHorizontal: 15
    },
    handleStyle: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.boxBackground
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end"
    },
    headerLabelText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
    },
    headerLabelDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 45,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: BORDER_RADIUS.md,
        padding: 10,
        backgroundColor: Colors.text.white

    },
    textInput: {
        width: "100%",
        height: "100%",
        flexShrink: 1,
        marginHorizontal: 10

    },
    searchingDriverBox: {
        marginTop: 50,
        gap: 10,
        alignItems: "center"
    },
    searchingTextCont: {
        gap: 5,
        alignItems: "center"
    },
    searchTextDesc: {
        textAlign: "center",
        fontFamily: FONTS.regular,
        lineHeight: 20,
        color: Colors.text.gray
    },
    searchTextLabel: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 70
    },
    mainDetailsCont: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10
    },
    driverName: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.black
    },
    driverStatusBgCont: {
        backgroundColor: Colors.transparentGreen,
        flexDirection: "row",
        gap: 2,
        alignSelf: "flex-start",
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.round,
        alignItems: "center"

    },
    driverStatusText: {
        color: Colors.green,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium
    },
    ratingsCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    ratingsText: {
        color: Colors.text.black,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium
    },
    driverDetailsCont: {
        gap: 5
    },
    driverCardCont: {
        marginTop: 20,
        gap: 15,
        borderColor: Colors.borderColor,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: 10,
        backgroundColor: Colors.text.white
    },
    sectionCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    sectionLabelText: {
        color: Colors.text.black,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        marginTop: 2
    },
    sectionLabel: {
        color: Colors.text.gray,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium
    },
    sectionIconCont: {
        width: 30,
        height: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        justifyContent: "center",
        alignItems: "center"
    },
    sectionCardCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    assignBtn: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.primary
    },
    assignBtnText: {
        color: Colors.text.white,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium
    },
    driverImage: {
        width: 70,
        height: 70,
        borderRadius: 70
    },
    iconCont: {
        width: 40,
        height: 40,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFE4D1",
        alignSelf: "center"
    },
    notFoundLabelCont: {
        gap: 5,
    },
    notFoundLabel: {
        color: Colors.text.black,
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        textAlign: "center"
    },
    notFoundLabelText: {
        color: Colors.text.gray,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.regular,
        lineHeight: 20,
        textAlign: "center"
    },
    notFoundCardContainer: {
        marginTop: 50,
        gap: 15
    },
    info: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 5,

    },
    infoText: {
        color: Colors.text.gray,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.regular,
        lineHeight: 20,
        flexShrink: 1
    }
})