import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font';
import { Colors } from '../../../../constants/theme/colors';

const vehicleIcon = require("../../../../../assets/driver/noOrders.jpg");

export default function NoOrders() {
    return (
        <View style={styles.container}>
            <View style={styles.vehicleIconImageCont}>
                <Image source={vehicleIcon} style={styles.vehicleIconImage} />
            </View>
            <View style={styles.textCont}>
                <Text style={styles.headerText}>No orders available yet</Text>
                <Text style={styles.headerDesc}>You'll see active and scheduled orders here as soon as they become available in your area.</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    headerText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.lg,
        color: Colors.text.black,
        textAlign: "center"
    },
    headerDesc: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: Colors.text.gray,
        lineHeight: 20,
        textAlign: "center"
    },
    textCont: {
        gap: 10
    },
    vehicleIconImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain"
    },
    vehicleIconImageCont: {
      width: 250,
        height: 200,
    }
})