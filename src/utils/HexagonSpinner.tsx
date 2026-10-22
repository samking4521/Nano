import { StyleSheet, View } from 'react-native'
import { useEffect } from 'react'
import { Colors } from '../constants/theme/colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

const duration = 2000;
const easing = Easing.bezier(0.25, -0.5, 0.25, 1);

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export default function HexagonSpinner() {
    const rotate = useSharedValue(0);

    useEffect(() => {
        rotate.value = withRepeat(
            withTiming(1, { duration, easing }), -1);
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value * 360}deg` }],
    }));


    return (
            <View style={styles.hexagonCont}>
                <AnimatedIcon name="hexagon" size={40} color={Colors.primary} style={animatedStyle} />
            </View>
    )
}

const styles = StyleSheet.create({
    hexagonCont: {
        width: 60,
        height: 60,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(244, 108, 3, 0.15)"
    }  
})