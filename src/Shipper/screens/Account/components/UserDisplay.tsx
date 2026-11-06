import { Image, StyleSheet, Text, View } from 'react-native'
import { useEffect, useState } from 'react'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors'
import { supabase } from '../../../../lib/supabase'
import ProfilePhotoPlaceholder from '../../../../utils/profilePhotoPlaceholder'
import { useShipperStore } from '../../../store/ShipperStore'
import { Ionicons } from '@expo/vector-icons'


export default function UserDisplay() {
    const shipperImgKey = useShipperStore((store) => store.shipperImgKey);
    const shipperImgKeyVersion = useShipperStore((store) => store.shipperImgKeyVersion);
    const shipperFirstName = useShipperStore((store) => store.shipperFirstName)
    const shipperLastName = useShipperStore((store) => store.shipperLastName)
    const [shipperImgUrl, setShipperImgUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        getShipperImage();
    }, [shipperImgKeyVersion])

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

    



    return (
        <View style={styles.container}>
            <View style={[styles.imgCont, {backgroundColor: !shipperImgKey? Colors.backBtnGray : undefined}]}>

                {shipperImgUrl? <Image onLoad={() => setImageLoading(false)} source={{ uri: shipperImgUrl }} style={styles.shipperImage} /> : !imageLoading? <Ionicons name="person" size={26} color={Colors.text.gray} /> : undefined}
                {imageLoading && <ProfilePhotoPlaceholder/>}

            </View>
            <View>
                <Text style={styles.userName}>{shipperFirstName} {shipperLastName}</Text>
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
        marginRight: 5,
        justifyContent: "center",
        alignItems: "center"
    },
    shipperImage: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.round
    },
    userName: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.black,
        marginBottom: 2
    }
})