import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import { useDriverStore } from '../../../store/DriverStore'
import { supabase } from '../../../../lib/supabase'


// const driverBadge = require("../../../../../assets/driverLevelBadge/gold_badge.png")

export default function UserDisplay() {
    const driverStore = useDriverStore((store) => store);
    const [driverImgUrl, setDriverImgUrl] = useState("");
    const driver_verification_status_text = driverStore.driverVerificationStatus == "APPROVED" ? "Verified" : driverStore.driverVerificationStatus == "PENDING" ? "Pending verification" : "Not verified";
    const driver_verification_status_bg_color = driverStore.driverVerificationStatus == "APPROVED" ? Colors.transparentGreen : driverStore.driverVerificationStatus == "PENDING" ? Colors.primaryTransparent : Colors.backBtnGray;
    const driver_verification_status_text_color = driverStore.driverVerificationStatus == "APPROVED" ? Colors.green : driverStore.driverVerificationStatus == "PENDING" ? Colors.primary : Colors.text.gray;

    useEffect(()=>{
      getDriverImage();
    }, [])

    const getDriverImage = async () => {
        if(!driverStore.driverImgKey) return
        const { data: signedImage, error: signedImageError } =
            await supabase.storage
                .from("driver-photos")
                .createSignedUrl(driverStore.driverImgKey, 60 * 60);

        if (signedImageError) {
            throw new Error(
                `Error creating driver image URL: ${signedImageError.message}`
            );
        }

        const imageUrl = signedImage.signedUrl;
        setDriverImgUrl(imageUrl);
    }


    return (
        <View style={styles.container}>
            <View style={styles.imgCont}>
                { driverImgUrl? 
                    <Image source={{ uri: driverImgUrl }} style={styles.driverImage} />
                   : 
                    <View style={styles.placeholderImage}/>
                }
            </View>
            <View>
                <Text style={styles.userName}>{driverStore.driverFirstName} {driverStore.driverLastName}</Text>
                <View style={styles.badgeCont}>
                    <View style={[styles.badgeIconCont, { backgroundColor: driver_verification_status_bg_color }]}>
                        {driverStore.driverVerificationStatus == "REJECTED" ?
                            <MaterialCommunityIcons
                                name={"shield-off"}
                                size={20}
                                color={driver_verification_status_text_color}
                            />
                            :
                            driverStore.driverVerificationStatus == "PENDING" ?
                                <Ionicons
                                    name="time-outline"
                                    size={20}
                                    color={driver_verification_status_text_color}
                                />
                                :
                                <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color={driver_verification_status_text_color}
                                />
                        }
                        {/* <Image source={driverBadge} style={styles.badgeImg}/> */}
                    </View>

                    <Text style={[styles.badgeText, { color: driver_verification_status_text_color, backgroundColor: driver_verification_status_bg_color }]}>{driver_verification_status_text}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    imgCont: {
        width: 50,
        height: 50,
        borderRadius: BORDER_RADIUS.round,
        marginRight: 5
    },
    driverImage: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.round
    },
    userName: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.black,
        marginBottom: 2
    },
    badgeCont: {
        flexDirection: "row",
        alignItems: "center"
    },
    badgeImg: {
        width: "100%",
        height: "100%",
        borderRadius: 30
    },
    badgeText: {
        backgroundColor: Colors.backBtnGray,
        paddingVertical: 4,
        paddingRight: 4,
        paddingLeft: 10,
        borderTopRightRadius: BORDER_RADIUS.lg,
        borderBottomRightRadius: BORDER_RADIUS.lg,
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        color: Colors.text.black,
        zIndex: 1
    },
    badgeIconCont: {
        backgroundColor: Colors.backBtnGray,
        width: 30,
        height: 30,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginRight: -8,
        zIndex: 2
    },
    placeholderImage: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: Colors.backBtnGray
    }
})