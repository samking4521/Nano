import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/colors'

export default function SplashLoadingScreen() {
  return (
    <View style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.appName}>Nano</Text>
            <Text style={styles.desc}>Trusted Drivers &bull; Transparent Pricing &bull; Real-time Tracking</Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff"
    },
    content: {
        justifyContent: "center",
        alignItems: "center"
    },
    appName: {
        fontSize: 70,
        fontWeight: "bold",
        color: Colors.primary
    },
    desc: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#4C4C4C",
        textAlign: "center"
    }
})