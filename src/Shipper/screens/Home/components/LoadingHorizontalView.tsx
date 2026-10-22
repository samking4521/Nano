import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { Colors } from '../../../../constants/theme/colors'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

export default function LoadingHorizontalView() {
     const WIDTH = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(()=> ({
        width: `${WIDTH.value}%`
    }))

    useEffect(()=>{
       WIDTH.value = withRepeat(
        withTiming(100, {
        duration: 30000
       }),
       -1,
       false
    );
    }, [])

  return (
    <View style={styles.container}>
       
            <View style={styles.bottomView}/>
            <Animated.View style={[styles.topView, animatedStyles]}/>
        
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    bottomView: {
        width: "100%",
        height: 5,
        borderRadius: 10,
        backgroundColor: Colors.boxBackground
    },
    topView: {
        height: 5,
        borderRadius: 10,
        backgroundColor: Colors.primary,
        position: "absolute",
        top: 0
    }
})