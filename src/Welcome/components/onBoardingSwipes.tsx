import { Image, StyleSheet, Text, View } from 'react-native'
import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { labelData } from '../types';

const { width, height } = Dimensions.get("window");
const WIDTH = width;
const HEIGHT = 60 / 100 * height;

export default function OnBoardingSwipes({item}: {item: labelData}) {
    return (
        <View style={styles.mainCont}>
            <View style={styles.truck_imgcont}>
                <Image source={item.image} style={styles.truck_img} />

                <LinearGradient
                    colors={["transparent", "#03030380", "#030303"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.7, 1]}
                    style={styles.bottomLinearGradient}
                />
                <LinearGradient
                    colors={["#030303", "#03030380", "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.3, 1]}
                    style={styles.topLinearGradient}
                />
            </View>
            <View style={styles.infoCont}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
   mainCont:{
    width: WIDTH,
   },
    truck_imgcont: {
        width: WIDTH,
        height: HEIGHT,
       
    },
    truck_img: {
         width: "100%", 
         height: "100%", 
         resizeMode: "cover"
    },
    bottomLinearGradient: {
         position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: "20%",
                        pointerEvents: "none"
    },
    topLinearGradient: {
         position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        height: "20%",
                        pointerEvents: "none"
    },
    infoCont: {
        paddingHorizontal: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: "white",
        letterSpacing: 0.5,
        marginTop: 10,
        textAlign: "center"
    },
    desc: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        opacity: 0.8,
        marginTop: 10,
        textAlign: "center"
    },
})