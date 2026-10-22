import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/theme/colors';
import { AntDesign } from '@expo/vector-icons';
import { FONT_SIZES, FONTS, ICON_SIZES, SPACING } from '../../../constants/theme/font';

const photo_desc_img = require("../../../../assets/onboarding/photoDesc.png");

export default function PhotoDesc() {
    return (
        <View>
            <View>
                <Text style={styles.headerText}>Personal Picture</Text>
            </View>
            <View>
                <View style={styles.descCont}>
                    <AntDesign name="check" size={ICON_SIZES.lg} color={Colors.text.black} style={{ marginRight: 10 }} />
                    <Text style={styles.headerDesc}>Taking a good clear selfie helps shippers trust you more</Text>
                </View>
                <View style={styles.descCont} >
                    <AntDesign name="check" size={ICON_SIZES.lg} color={Colors.text.black} style={{ marginRight: 10 }} />
                    <Text style={styles.headerDesc}>Make sure your face is fully visible. Remove hats, sunglasses, or anything that covers your face.</Text>
                </View>
                <View style={styles.imageCont}>
                    <Image
                        source={photo_desc_img}
                        style={styles.image}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    headerText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black

    },
    headerDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        marginTop: SPACING.xs,
        color: Colors.text.gray,
        lineHeight: 20,
        flexShrink: 1
    },
    imageCont: {
        width: "100%",
        height: 300,
        marginVertical: 20

    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain"
    },
    descCont: {
        flexDirection: "row",
        alignItems: "center",

    }
})