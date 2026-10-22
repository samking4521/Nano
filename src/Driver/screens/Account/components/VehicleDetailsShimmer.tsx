import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { BORDER_RADIUS } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get("window");
const WIDTH = width - 30;

export default function VehicleDetailsShimmer() {

    const opacityValue = useSharedValue(0.3);


    useEffect(() => {
        opacityValue.value = withRepeat(
            withTiming(0.7, {
                duration: 1000
            }), -1, true
        )
    }, [])

    const animatedStyle = useAnimatedStyle(() => (
        {
            opacity: opacityValue.value
        }
    ))

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.largeImg, animatedStyle]} />
            <View style={styles.previewCont}>
                <Animated.View style={[styles.previewImg, animatedStyle]} />
                <Animated.View style={[styles.previewImg, animatedStyle]} />
            </View>
            <View style={styles.cardSectionCont}>
                <View style={styles.sectionCont}>
                    <Animated.View style={[styles.iconCircle, animatedStyle]} />
                    <View style={styles.labelCont}>
                        <Animated.View style={[styles.labelText, animatedStyle]} />
                        <Animated.View style={[styles.labelDesc, animatedStyle]} />
                    </View>
                </View>
                <View style={styles.sectionCont}>
                    <Animated.View style={[styles.iconCircle, animatedStyle]} />
                    <View style={styles.labelCont}>
                        <Animated.View style={[styles.labelText, animatedStyle]} />
                        <Animated.View style={[styles.labelDesc, animatedStyle]} />
                    </View>
                </View>
                <View style={styles.sectionCont}>
                    <Animated.View style={[styles.iconCircle, animatedStyle]} />
                    <View style={styles.labelCont}>
                        <Animated.View style={[styles.labelText, animatedStyle]} />
                        <Animated.View style={[styles.labelDesc, animatedStyle]} />
                    </View>
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {

    },
    previewCont: {
        marginTop: 10,
        flexDirection: "row",
        gap: 10
    },
    previewImg: {
        width: 100,
        height: 80,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.backBtnGray
    },
    largeImg: {
        width: WIDTH,
        height: 200,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.backBtnGray
    },

    cardSectionCont: {
        gap: 10,
        marginTop: 20
    },
    sectionCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        width: "100%",
        height: 80,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.text.white,
        padding: 15,

    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray

    },
    labelCont: {
        gap: 5
    },
    labelText: {
        width: 50,
        height: 10,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.backBtnGray
    },
    labelDesc: {
        width: 30,
        height: 10,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.backBtnGray
    }

})