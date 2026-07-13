import { StyleSheet, View, TextInput, Text, Platform, StatusBar, Dimensions, Pressable, ActivityIndicator, Button } from 'react-native'
import { useEffect, useState } from 'react'
import Svg, { Circle, G } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/colors'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { driverStorage } from '../../localStorage/driverStorage'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const radius = (70 / 100 * width) / 2;
const strokeWidth = 10;
const duration = 500;
const delay = 500;
const max = 100;
const percentage = 85;
const color = Colors.primary;

type loadingState = "initial" | "loading" | "done";
type animationType = "personal" | "vehicle" | "payment" | "photos";

export default function SubmitScreen() {
  const [personalInfoUploading, setPersonalInfoUploading] = useState<loadingState | null>("done");
  const [vehicleInfoUploading, setVehicleInfoUploading] = useState<loadingState | null>("initial");
  const [paymentInfoUploading, setPaymentInfoUploading] = useState<loadingState | null>("initial");
  const [photoUploading, setPhotosUploading] = useState<loadingState | null>("initial");

  const personalInfoValue = useSharedValue(1);
  const vehicleInfoValue = useSharedValue(1);
  const paymentInfoValue = useSharedValue(1);
  const photosInfoValue = useSharedValue(1);
  const animatedValue = useSharedValue(0);
  const halfCircle = radius + strokeWidth
  const circleCircumference = 2 * Math.PI * radius
  
  const uploadDriverPhoto = ()=>{
      
  }

  const uploadDriverInfo = async () => {
   const firstname = driverStorage.getString("firstname");
   const lastname = driverStorage.getString("lastname");
   const phone = driverStorage.getString("mobileNo");
   const email = driverStorage.getString("email");
   const birthday = driverStorage.getString("dob");
   const nin =  driverStorage.getString("nin");
  // driverStorage.getString("driverImage");
    // driverStorage.getString("ninImage");
   const country = driverStorage.getString("country");
   let countryObj: any = null;
   try {
     countryObj = country ? JSON.parse(country) : null;
   } catch (e) {
     countryObj = null;
   }
    const { error } = await supabase
      .from("Driver")
      .insert({
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            email: email,
            birthday: birthday,
            nin: nin,
            country_name: "",
            country_code: "",
            calling_code: "",
            nin_img_key: "",
            driver_img_key: ""
      })
  }


  // useEffect(() => {
  //   animatedValue.value =

  //         withTiming(percentage, {
  //           duration,
  //           easing: Easing.out(Easing.ease),
  //         })
  // }, [percentage, max])

  // Animated props for the circle stroke dash offset
  const animatedCircleProps = useAnimatedProps(() => {
    const maxPerc = (100 * animatedValue.value) / max
    const strokeDashoffset =
      circleCircumference - (circleCircumference * maxPerc) / 100
    return {
      strokeDashoffset,
    }
  })

  // Animated props for the text input displaying the percentage
  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(animatedValue.value)}%`,
      // TextInput requires `defaultValue` to not be undefined for animatedProps text to work
    } as any
  })

  const animateTo = (val: number) => {
    animatedValue.value =
      withTiming(val, {
        duration,
        easing: Easing.out(Easing.ease),
      })
  }

  const startAnimation = (value: animationType) => {
    if (value == "personal") {
      personalInfoValue.value = withRepeat(
        withTiming(1.05, { duration: 800 }),
        -1,
        true
      );
      return;
    }

    if (value == "vehicle") {
      vehicleInfoValue.value = withRepeat(
        withTiming(1.05, { duration: 800 }),
        -1,
        true
      );
      return;
    }

    if (value == "payment") {
      paymentInfoValue.value = withRepeat(
        withTiming(1.05, { duration: 800 }),
        -1,
        true
      );
      return;
    }

    if (value == "photos") {
      photosInfoValue.value = withRepeat(
        withTiming(1.05, { duration: 800 }),
        -1,
        true
      );
      return;
    }


  };

  const stopAnimation = (value: animationType) => {
    if (value == "personal") {
      cancelAnimation(personalInfoValue);
      setPersonalInfoUploading("done");
      return;
    }
    if (value == "vehicle") {
      cancelAnimation(vehicleInfoValue);
      setVehicleInfoUploading("done");
      return;
    }
    if (value == "payment") {
      cancelAnimation(paymentInfoValue);
      setPaymentInfoUploading("done");
      return;
    }
    if (value == "photos") {
      cancelAnimation(photosInfoValue);
      setPhotosUploading("done");
      return;
    }

  };

  const personalInfoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: personalInfoValue.value }],
    opacity: personalInfoValue.value,
  }));

  const vehicleInfoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: vehicleInfoValue.value }],
    opacity: vehicleInfoValue.value,
  }));

  const paymentInfoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: paymentInfoValue.value }],
    opacity: paymentInfoValue.value,
  }));

  const photosInfoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photosInfoValue.value }],
    opacity: photosInfoValue.value,
  }));


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View>
          <Text style={styles.headerText}>Creating your driver account</Text>
          <Text style={styles.headerDesc}>We are uploading your information and making sure everything is ready for verification</Text>
        </View>

        <View style={styles.svgCont}>
          <Svg
            width={radius * 2}
            height={radius * 2}
            viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
          >
            <G rotation="-90" origin={`${halfCircle},${halfCircle}`}>
              {/* Background track circle */}
              <Circle
                cx="50%"
                cy="50%"
                stroke={color}
                strokeWidth={strokeWidth}
                r={radius}
                fill="transparent"
                strokeOpacity={0.2}
              />
              {/* Animated foreground circle */}
              <AnimatedCircle
                animatedProps={animatedCircleProps}
                cx="50%"
                cy="50%"
                stroke={color}
                strokeWidth={strokeWidth}
                r={radius}
                fill="transparent"
                strokeDasharray={circleCircumference}
                strokeLinecap="round"
              />
            </G>
          </Svg>

          {/* Centered percentage text */}
          <AnimatedTextInput
            animatedProps={animatedTextProps}
            underlineColorAndroid="transparent"
            editable={false}
            defaultValue="0%"
            style={[
              StyleSheet.absoluteFillObject,

              styles.animatedText
              ,
            ]}
          />
        </View>

        <View style={{ marginTop: 20 }}>

          <View style={styles.infoCont}>
            {personalInfoUploading == "initial" ? <View style={styles.initialUploadingCont}>
              <Text style={styles.initialUploadingText}>1</Text>
            </View> : personalInfoUploading == "loading" ? <ActivityIndicator size={"small"} color={Colors.primary} style={styles.activityIndicatorStyle} /> :
              <View style={styles.uploadDoneCont}>
                <AntDesign name="check" size={14} color={Colors.text.white} />
              </View>}
            <Animated.Text style={[personalInfoAnimatedStyle, styles.uploadText]}>Uploading personal information</Animated.Text>
          </View >

          <View style={[styles.dividerCont, { backgroundColor: personalInfoUploading == "done" ? Colors.primary : Colors.borderColor }]} />

          <View style={styles.infoCont}>
            {vehicleInfoUploading == "initial" ? <View style={styles.initialUploadingCont}>
              <Text style={styles.initialUploadingText}>2</Text>
            </View> : vehicleInfoUploading == "loading" ? <ActivityIndicator size={"small"} color={Colors.primary} style={styles.activityIndicatorStyle} /> :
              <View style={styles.uploadDoneCont}>
                <AntDesign name="check" size={16} color={Colors.text.white} />
              </View>}
            <Animated.Text style={[vehicleInfoAnimatedStyle, styles.uploadText]}>Uploading vehicle information</Animated.Text>
          </View >

          <View style={[styles.dividerCont, { backgroundColor: vehicleInfoUploading == "done" ? Colors.primary : Colors.borderColor }]} />


          <View style={styles.infoCont}>
            {paymentInfoUploading == "initial" ? <View style={styles.initialUploadingCont}>
              <Text style={styles.initialUploadingText}>3</Text>
            </View> : paymentInfoUploading == "loading" ? <ActivityIndicator size={"small"} color={Colors.primary} style={styles.activityIndicatorStyle} /> :
              <View style={styles.uploadDoneCont}>
                <AntDesign name="check" size={16} color={Colors.text.white} />
              </View>}
            <Animated.Text style={[paymentInfoAnimatedStyle, styles.uploadText]}>Uploading payment details</Animated.Text>
          </View >

          <View style={[styles.dividerCont, { backgroundColor: paymentInfoUploading == "done" ? Colors.primary : Colors.borderColor }]} />

          <View style={styles.infoCont}>
            {photoUploading == "initial" ? <View style={styles.initialUploadingCont}>
              <Text style={styles.initialUploadingText}>4</Text>
            </View> : photoUploading == "loading" ? <ActivityIndicator size={"small"} color={Colors.primary} style={styles.activityIndicatorStyle} /> :
              <View style={styles.uploadDoneCont}>
                <AntDesign name="check" size={16} color={Colors.text.white} />
              </View>}
            <Animated.Text style={[photosInfoAnimatedStyle, styles.uploadText]}>Uploading photos</Animated.Text>
          </View >
        </View>
        <Button title="Start" onPress={() => startAnimation("photos")} />
        <Button title="Stop" onPress={() => stopAnimation("photos")} />
        <Text style={[styles.headerDesc, { marginTop: "auto", marginBottom: 40, color: Colors.primary }]}>Please don't leave until the upload is complete. This usually takes less than a minute.</Text>
      </View>

    </SafeAreaView>

  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight,
    paddingHorizontal: 15
  },

  headerContainer: {
    marginTop: 0
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.black,
    textAlign: "center"

  },
  headerDesc: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
    color: Colors.text.gray,
    textAlign: "center"

  },
  uploadText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
    color: Colors.text.black,


  },
  svgCont: {
    alignSelf: "center", marginVertical: 20
  },
  animatedText: {
    fontSize: radius / 3,
    color: color,
    fontWeight: '900',
    textAlign: 'center',
  },
  infoCont: {
    flexDirection: "row", alignItems: "center"
  },
  initialUploadingCont: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: Colors.borderColor,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center"
  },
  initialUploadingText: {
    fontSize: 14, fontWeight: "500", color: Colors.borderColor
  },
  dividerCont: {
    width: 2,
    backgroundColor: Colors.primary,
    height: 25,
    marginLeft: 10,
    marginVertical: 5
  },
  activityIndicatorStyle: {
    width: 25,
    height: 25,
    borderRadius: 25
  },
  uploadDoneCont: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    width: 25,
    height: 25,
    borderRadius: 25
  }
})