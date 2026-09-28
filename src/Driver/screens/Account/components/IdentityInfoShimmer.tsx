import { StyleSheet, View } from 'react-native'
import { useEffect } from 'react'
import { BORDER_RADIUS } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export default function IdentityInfoShimmer() {
    const opacityValue = useSharedValue(0.5);


    useEffect(() => {
        opacityValue.value = withRepeat(
            withTiming(1, {
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
        <View style={styles.cardContainer}>
            <Animated.View style={[styles.identityDetailsCont, animatedStyle]} />
            <Animated.View style={[styles.identityDetailsCont, animatedStyle]} />
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        gap: 15
    },
    identityDetailsCont: {
        width: "100%",
        height: "40%",
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.backBtnGray
    }

})