import { Image, StyleSheet, Text, View } from 'react-native'
import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { labelData } from '../types';
import { FONT_SIZES, FONTS, SPACING } from '../../../../constants/theme/font';
import { Colors } from '../../../../constants/theme/colors';

const { width, height } = Dimensions.get("window");
const WIDTH = width;
const HEIGHT = 60 / 100 * height;

export default function OnBoardingSwipes({ item }: { item: labelData }) {

    return (
        <View style={styles.mainCont}>
            <View style={styles.truck_imgcont}>
                <Image source={item.image} style={styles.truck_img} />
                <LinearGradient
                    colors={["transparent", Colors.semiBlackBackground , Colors.blackBackground]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.7, 1]}
                    style={styles.bottomLinearGradient}
                />
                <LinearGradient
                    colors={[Colors.blackBackground, Colors.semiBlackBackground, "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.3, 1]}
                    style={styles.topLinearGradient}
                />
            </View>

            <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainCont: {
        width: WIDTH,
        justifyContent: "center",
        alignItems: "center"
    },
    truck_imgcont: {
        width: WIDTH,
        height: HEIGHT,
        

    },
    truck_img: {
        width: "100%",
        height: "100%",
       
    },
    bottomLinearGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "25%",
        pointerEvents: "none"
    },
    topLinearGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: "25%",
        pointerEvents: "none"
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontFamily: FONTS.semiBold,
        color: Colors.text.white,
        letterSpacing: 0.5,
        marginTop: SPACING.sm,
        textAlign: "center"

    },
    desc: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.white,
        opacity: 0.8,
        marginTop: SPACING.sm,
        textAlign: "center"

    },
})