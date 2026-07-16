import { Image, StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../../constants/colors';
import { AntDesign } from '@expo/vector-icons';

const vehicle_license_img = require("../../../../assets/onboarding/vehicle_license_photo_desc.png");
export default function VehicleLicenseDesc() {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.headerText}>Vehicle License</Text>
            </View>
            <View>
                <View style={styles.descCont}>
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}} />
                    <Text style={styles.headerDesc}>Upload a clear photo of your vehicle license.</Text>
                </View>
                <View style={styles.descCont} >
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}}/>
                    <Text style={styles.headerDesc}>Ensure all details are visible and readable.</Text>
                </View>
                <View style={styles.imageCont}>
                    <Image
                        source={vehicle_license_img}
                        style={styles.image}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {

    },
    headerText: {
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.text.black

    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 10,
        color: Colors.text.gray
    },
    imageCont: {
        width: "100%",
        height: 300,
         marginVertical: 20

    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain"
    },
    descCont: {
        flexDirection: "row",
        alignItems: "center",
    }
})