import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/theme/colors';
import { AntDesign } from '@expo/vector-icons';
import { BORDER_RADIUS, FONT_SIZES, FONTS, SPACING } from '../../../constants/theme/font';

const nin_desc_img = require("../../../../assets/onboarding/nin_img_desc.png");

export default function NinDesc() {
    return (
        <View>
            <View>
                <Text style={styles.headerText}>NIN</Text>
            </View>
            <View>
                <View style={styles.descCont}>
                    <AntDesign name="check" size={18} color="black" style={{ marginRight: 10 }} />
                    <Text style={styles.headerDesc}>Take a good clear photo of your NIN (National ID)</Text>
                </View>
                <View style={styles.descCont} >
                    <AntDesign name="check" size={18} color="black" style={{ marginRight: 10 }} />
                    <Text style={styles.headerDesc}>Do not use screenshots, or blurry photo</Text>
                </View>
                <View style={styles.imageCont}>
                    <Image
                        source={nin_desc_img}
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
        height: 250,
        marginVertical: 20,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "stretch",
        borderRadius: BORDER_RADIUS.lg
    },
    descCont: {
        flexDirection: "row",
        alignItems: "center",
    }
})