import { StyleSheet, View } from 'react-native'
import { useEffect } from 'react'
import { Colors } from '../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../constants/theme/font'
import Animated, {
    useAnimatedStyle,
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'

const INITIAL_SCALE = 1
const MAX_SCALE = 1.2
const CIRCLE_SIZE = 80
const INNER_SIZE = 50
const ARC_FRACTION = 0.3

const CENTER = CIRCLE_SIZE / 2
const OUTER_RADIUS = CIRCLE_SIZE / 2 
const BASE_INNER_RADIUS = INNER_SIZE / 2 

const ARC_ANGLE_RAD = ARC_FRACTION * 2 * Math.PI
const ARC_START = {
    x: CENTER + OUTER_RADIUS * Math.cos(0),
    y: CENTER + OUTER_RADIUS * Math.sin(0),
}
const ARC_END = {
    x: CENTER + OUTER_RADIUS * Math.cos(ARC_ANGLE_RAD),
    y: CENTER + OUTER_RADIUS * Math.sin(ARC_ANGLE_RAD),
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export default function NanoLoadingSpinner() {
    const scale = useSharedValue(INITIAL_SCALE)
    const rotation = useSharedValue(0)

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(MAX_SCALE, { duration: 500 }),
            -1,
            true
        )
        rotation.value = withRepeat(
            withTiming(360, { duration: 1200, easing: Easing.linear }),
            -1,
            false
        )
    }, [])

    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const rotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }))

    
    const animatedArcProps = useAnimatedProps(() => {
        const currentInnerRadius = BASE_INNER_RADIUS * scale.value
        const gap = OUTER_RADIUS - currentInnerRadius
        const arcRadius = currentInnerRadius + gap / 2 
        const circumference = 2 * Math.PI * arcRadius
        const arcLength = circumference * ARC_FRACTION

        return {
            r: arcRadius,
            strokeWidth: gap,
            strokeDasharray: `${arcLength} ${circumference}`,
        }
    })

    return (
        <View style={styles.containerCircle}>
            <Animated.View style={[styles.arcWrapper, rotateStyle]}>
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                    <Defs>
                        <LinearGradient
                            id="fade"
                            gradientUnits="userSpaceOnUse"
                            x1={ARC_START.x}
                            y1={ARC_START.y}
                            x2={ARC_END.x}
                            y2={ARC_END.y}
                        >
                            <Stop offset="0" stopColor="white" stopOpacity={0} />
                            <Stop offset="0.15" stopColor="white" stopOpacity={0.2} />
                            <Stop offset="0.85" stopColor="white" stopOpacity={0.2} />
                            <Stop offset="1" stopColor="white" stopOpacity={0} />
                        </LinearGradient>
                    </Defs>
                    <AnimatedCircle
                        cx={CENTER}
                        cy={CENTER}
                        stroke="url(#fade)"
                        strokeLinecap="round"
                        fill="none"
                        animatedProps={animatedArcProps}
                    />
                </Svg>
            </Animated.View>

            <Animated.View style={[styles.innerContainerCircle, scaleStyle]}>
                <Animated.Text style={[styles.nanoIconText, scaleStyle]}>N</Animated.Text>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: CIRCLE_SIZE / 2,
        overflow: 'hidden',
    },
    arcWrapper: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainerCircle: {
        width: INNER_SIZE,
        height: INNER_SIZE,
        borderRadius: INNER_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.text.white,
    },
    nanoIconText: {
        fontSize: FONT_SIZES.xl,
        fontFamily: FONTS.extraBold,
        color: Colors.primary,
        fontStyle: 'italic',
    },
})