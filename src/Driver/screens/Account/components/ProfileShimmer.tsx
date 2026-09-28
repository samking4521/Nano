import { StyleSheet, Text, View } from 'react-native'
import { useEffect } from 'react'
import { BORDER_RADIUS } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

export default function ProfileShimmer() {
    const opacityValue = useSharedValue(0.3);


    useEffect(()=> {
       opacityValue.value = withRepeat(
           withTiming(0.7, {
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
    <View style={styles.shimmerCont}>
      <Animated.View  style={[styles.shimmerBox, animatedStyle]}/>
      <Animated.View  style={[styles.shimmerBox, animatedStyle]}/>
    </View>
  )
}

const styles = StyleSheet.create({
    shimmerCont: {
      gap: 10,
      marginTop: 20
    },
    shimmerBox: {
        width: "100%",
        height: 100,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: Colors.backBtnGray
    }
})