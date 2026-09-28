import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated'
import { AntDesign } from '@expo/vector-icons'
import { Colors } from '../../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../../constants/theme/font'
import { useNetworkStore } from './NetworkStore'

const { width, height } = Dimensions.get("screen");
const WIDTH = width;
const HEIGHT = 10 / 100 * height

type NetworkBannerProps = {
  setShowNetworkBanner: React.Dispatch<React.SetStateAction<boolean>>
}

export default function NetworkBanner({setShowNetworkBanner}: NetworkBannerProps) {
  const isOnline = useNetworkStore((store) => store.isOnline);

  return (
    <Animated.View entering={SlideInUp.duration(1000)}
      exiting={SlideOutUp.duration(1000)} style={[styles.banner, {backgroundColor: isOnline? Colors.green : Colors.error}]}>
      <View style={styles.innerCont}>
        <Text style={styles.connectionInfo}>{isOnline ? "Connection Restored" : "No Internet Connection"}</Text>
       { !isOnline && <AntDesign onPress={()=> setShowNetworkBanner(false)} name="close" color={Colors.text.white} size={20} />}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    zIndex: 9999,
    width: WIDTH,
    height: HEIGHT,
    paddingHorizontal: 15,
    paddingBottom: 10,
    justifyContent: "flex-end"

  },
  connectionInfo: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.medium,
    color: Colors.text.white
  },
  innerCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
})