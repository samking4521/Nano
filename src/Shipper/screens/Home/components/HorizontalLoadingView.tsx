import { StyleSheet, View, LayoutChangeEvent } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BORDER_RADIUS } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated'

const BAR_WIDTH_RATIO = 0.3 
const DURATION = 1200

export default function HorizontalLoadingView() {
    const [containerWidth, setContainerWidth] = useState(0)
    const progress = useSharedValue(0)

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: DURATION, easing: Easing.linear }),
            -1,
            false
        )
    }, [])

    const onLayout = (e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width)
    }

    const barWidth = containerWidth * BAR_WIDTH_RATIO
    // full travel: from fully off-screen left to fully off-screen right
    const totalDistance = containerWidth + barWidth

    const barAStyle = useAnimatedStyle(() => {
        const x = -barWidth + progress.value * totalDistance
        return { transform: [{ translateX: x }] }
    })

    const barBStyle = useAnimatedStyle(() => {
        const p = ((progress.value - 0.5) % 1 + 1) % 1
        const x = -barWidth + p * totalDistance
        return { transform: [{ translateX: x }] }
    })

    return (
        <View style={styles.container} onLayout={onLayout}>
            <View style={styles.lowerView} />
            {barWidth > 0 && (
                <>
                    <Animated.View style={[styles.bar, { width: barWidth }, barAStyle]} />
                    <Animated.View style={[styles.bar, { width: barWidth }, barBStyle]} />
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 5,
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.xmd,
    },
    lowerView: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: BORDER_RADIUS.xmd,
        backgroundColor: Colors.boxBackground,
    },
    bar: {
        position: 'absolute',
        height: 5,
        borderRadius: BORDER_RADIUS.xmd,
        backgroundColor: Colors.primary,
    },
})