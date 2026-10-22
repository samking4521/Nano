import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Colors } from '../constants/theme/colors';
import { BORDER_RADIUS } from '../constants/theme/font';

export default function ImageLoadingPlaceHolder() {
     const opacity = useSharedValue(0.7);
        
        
            useEffect(()=> {
                opacity.value = withRepeat(withTiming(1, {
                    duration: 500
                }), -1, true);
            }, [])
        
            const animatedStyles = useAnimatedStyle(()=>(
                 {opacity: opacity.value}
            ))
  return (
     <Animated.View style={[styles.placeholderImage, animatedStyles]}/>
  )
}

const styles = StyleSheet.create({
    placeholderImage: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.backBtnGray,
        borderRadius: BORDER_RADIUS.md
    }
})