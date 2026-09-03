import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { useEffect } from 'react'
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Colors } from '../constants/theme/colors';

const width = Dimensions.get("window").width;
const radius = (20 / 100 * width) / 2;
const strokeWidth = 10;
const duration = 900;
const color = Colors.primary;

// how much of the ring is drawn (0.25 = quarter-circle arc)
const arcFraction = 0.25;

export default function LoadingSpinner({text}: {text: string}) {
  const rotation = useSharedValue(0);
  const halfCircle = radius + strokeWidth;
  const circleCircumference = 2 * Math.PI * radius;
  const dashOffset = circleCircumference * (1 - arcFraction);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.2)"
      }}
    >
      <Animated.View style={animatedStyle}>
        <Svg
          width={halfCircle * 2}
          height={halfCircle * 2}
          viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
        >
          {/* Background track circle */}
          <G rotation="-90" origin={`${halfCircle},${halfCircle}`}>
            <Circle
              cx="50%"
              cy="50%"
              stroke={color}
              strokeWidth={strokeWidth}
              r={radius}
              fill="transparent"
              strokeOpacity={0.1}
            />
          </G>

          {/* Fixed arc, rotated by the parent Animated.View */}
          <G rotation="-90" origin={`${halfCircle},${halfCircle}`}>
            <Circle
              cx="50%"
              cy="50%"
              stroke={color}
              strokeWidth={strokeWidth}
              r={radius}
              fill="transparent"
              strokeDasharray={circleCircumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
      </Animated.View>
                    <Text style={styles.spinnerText}>{text}</Text>
      

    </View>
  )
}

const styles = StyleSheet.create({
     spinnerText: {
          fontSize: 16,
          fontWeight: "700",
          color: Colors.text.white,
          marginTop: 18
     }
})
