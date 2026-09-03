import { Image, StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../../constants/theme/colors';
import { AntDesign } from '@expo/vector-icons';
import { FONT_SIZES, FONTS, SPACING } from '../../../constants/theme/font';

const vehicle_photo_img = require("../../../../assets/onboarding/vehicle_photo_img_desc.png");
export default function VehiclePhotoDesc() {
    return (
        <View>
            <View>
                <Text style={styles.headerText}>Vehicle Photos</Text>
            </View>
            <View>
                <View style={styles.descCont}>
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}} />
                    <Text style={styles.headerDesc}>Upload 2 clear vehicle photos with the plate number visible</Text>
                </View>
                <View style={styles.descCont} >
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}}/>
                    <Text style={styles.headerDesc}>The photos must include the front view and the side view of the vehicle.</Text>
                </View>
                <View style={styles.imageCont}>
                    <Image
                        source={vehicle_photo_img}
                        style={styles.image}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
   
    headerText: {
           fontSize: FONT_SIZES.lg,
           fontFamily: FONTS.semiBold,
           color: Colors.text.black
   
       },
       headerDesc: {
           fontSize: FONT_SIZES.sm,
           fontFamily: FONTS.medium,
           marginTop: SPACING.xs,
           color: Colors.text.gray,
           lineHeight: 20,
           flexShrink: 1
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