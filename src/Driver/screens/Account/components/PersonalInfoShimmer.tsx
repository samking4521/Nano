import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS } from '../../../../constants/theme/font'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export default function PersonalInfoShimmer() {
     const opacityValue = useSharedValue(0.5);
    
    
        useEffect(()=> {
           opacityValue.value = withRepeat(
               withTiming(1, {
            duration: 1000
           }), -1, true
           ) 
        }, [])
    
        const animatedStyle = useAnimatedStyle(()=> (
            {
                opacity: opacityValue.value
            }
        ))

    return (
        <View style={styles.cardContainer}>
            <View style={styles.cardCont}>
                <Animated.View style={[styles.cardImage, animatedStyle]} />
                <View style={styles.cardLabelCont}>
                    <Animated.View style={[styles.cardLabelText, animatedStyle]} />
                    <Animated.View style={[styles.cardLabelDesc, animatedStyle]} />
                </View>

            </View>

            <View style={styles.detailsCardCont}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <View style={styles.profileContentCont} key={`item-${index}`}>
                        <Animated.View style={[styles.profileContentIconCont, animatedStyle]} />
                        <View style={styles.profileContentLabelCont}>
                            <Animated.View style={[styles.cardLabelText, animatedStyle]} />
                            <Animated.View style={[styles.cardLabelDesc, animatedStyle]} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        gap: 15
    },
    cardCont: {
        padding: 15,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.text.white,
        gap: 10,
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 100,
        backgroundColor: Colors.backBtnGray,


    },
    cardLabelText: {
        width: 80,
        height: 10,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: Colors.backBtnGray,

    },
    cardLabelDesc: {
        width: 70,
        height: 10,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: Colors.backBtnGray,
    },
    profileContentCont: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15
    },
    profileContentIconCont: {
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15
    },
    profileContentLabelCont: {
        gap: 3
    },
    detailsCardCont: {
        padding: 15,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.text.white,
        gap: 10,
    },
    cardLabelCont: {
        gap: 5,
        alignItems: "center"
    }
})