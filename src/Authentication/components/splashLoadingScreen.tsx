import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../../constants/theme/font'

export default function SplashLoadingScreen() {
  return (
    <View style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.appName}>Nano</Text>
            <Text style={styles.desc}>Trusted Drivers &bull; Transparent Pricing &bull;{`\n`}Real-time Tracking</Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background
    },
    content: {
        justifyContent: "center",
        alignItems: "center"
    },
    appName: {
        fontSize: FONT_SIZES.appName,
        fontFamily: FONTS.semiBold,
        color: Colors.primary
    },
    desc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        color: Colors.text.gray,
        textAlign: "center"
    }
})