import { Image, StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../../constants/theme/colors';
import { AntDesign } from '@expo/vector-icons';
import { FONT_SIZES, FONTS, SPACING } from '../../../constants/theme/font';

const driver_license_desc_img = require("../../../../assets/onboarding/driver_license_desc.png");

export default function LicenseDesc() {
    return (
        <View>
            <View>
                <Text style={styles.headerText}>Driver License</Text>
            </View>
            <View>
                <View style={styles.descCont}>
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}} />
                    <Text style={styles.headerDesc}>Place your license on a flat surface with all four corners visible.</Text>
                </View>
                <View style={styles.descCont} >
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}}/>
                    <Text style={styles.headerDesc}>Ensure the photo and text are clear,{"\n"}with no glare or blur.</Text>
                </View>
                <View style={styles.imageCont}>
                    <Image
                        source={driver_license_desc_img}
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