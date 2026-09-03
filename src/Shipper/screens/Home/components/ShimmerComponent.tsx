import { Animated, Dimensions, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { useEffect, useRef } from 'react'
import { Colors } from '../../../../constants/theme/colors'

const WIDTH = Dimensions.get("screen").width


function ShimmerBlock({ style }: { style?: StyleProp<ViewStyle> }) {
    const opacity = useRef(new Animated.Value(0.3)).current
    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        )
        anim.start()
        return () => anim.stop()
    }, [])
    return <Animated.View style={[{ backgroundColor: Colors.boxBackground, borderRadius: 4 }, style, { opacity }]} />
}

function PlaceCardSkeleton() {
    return (
        <View style={[styles.placesCont, { borderBottomWidth: undefined, borderBottomColor: undefined }]}>
            <ShimmerBlock style={{ width: 28, height: 28, borderRadius: 14, marginRight: 10 }} />
            <View style={styles.placesTextCont}>
                <ShimmerBlock style={{ width: 60 / 100 * WIDTH, height: 16 }} />
                <ShimmerBlock style={{ width: 50 / 100 * WIDTH, height: 14 }} />
            </View>
            <ShimmerBlock style={{ width: 50, height: 16, marginLeft: 'auto' }} />
        </View>
    )
}

export default function ShimmerComponent() {
  return (
        <PlaceCardSkeleton/>
  )
}

const styles = StyleSheet.create({
    placesCont: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: Colors.borderColor,
        borderBottomWidth: 1,
        paddingVertical: 10
    },
     placesTextCont: {
        flexShrink: 1,
        gap: 3,

    },
})