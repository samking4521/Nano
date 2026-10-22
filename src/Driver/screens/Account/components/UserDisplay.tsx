import { Image, StyleSheet, Text, View } from 'react-native'
import { useEffect, useState } from 'react'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import { useDriverStore } from '../../../store/DriverStore'
import { supabase } from '../../../../lib/supabase'
import ProfilePhotoPlaceholder from '../../../../utils/profilePhotoPlaceholder'



export default function UserDisplay() {
    const driverImgKey = useDriverStore((store) => store.driverImgKey);
    const driverVerificationStatus = useDriverStore((store) => store.driverVerificationStatus)
    const driverFirstName = useDriverStore((store) => store.driverFirstName)
    const driverLastName = useDriverStore((store) => store.driverLastName)
    const [driverImgUrl, setDriverImgUrl] = useState("");
    const driver_verification_status_text = driverVerificationStatus == "APPROVED" ? "Verified" : driverVerificationStatus == "PENDING" ? "Pending" : "Not verified";
    const driver_verification_status_bg_color = driverVerificationStatus == "APPROVED" ? Colors.transparentGreen : driverVerificationStatus == "PENDING" ? Colors.primaryTransparent : Colors.backBtnGray;
    const driver_verification_status_text_color = driverVerificationStatus == "APPROVED" ? Colors.green : driverVerificationStatus == "PENDING" ? Colors.primary : Colors.text.gray;
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        getDriverImage();
    }, [])

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

    



    return (
        <View style={styles.container}>
            <View style={styles.imgCont}>

                <Image onLoad={() => setImageLoading(false)} source={{ uri: driverImgUrl }} style={styles.driverImage} />

                {imageLoading && <ProfilePhotoPlaceholder/>}

            </View>
            <View>
                <Text style={styles.userName}>{driverFirstName} {driverLastName}</Text>
                <View style={styles.badgeCont}>
                    <View style={[styles.badgeIconCont, { backgroundColor: driver_verification_status_bg_color }]}>
                        {driverVerificationStatus == "REJECTED" ?
                            <MaterialCommunityIcons
                                name={"shield-off"}
                                size={20}
                                color={driver_verification_status_text_color}
                            />
                            :
                            driverVerificationStatus == "PENDING" ?
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
    }
})