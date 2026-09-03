import { Image, StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../../constants/theme/colors';
import { AntDesign } from '@expo/vector-icons';
import { BORDER_RADIUS, FONT_SIZES, FONTS, SPACING } from '../../../constants/theme/font';

const vehicle_license_img = require("../../../../assets/onboarding/vehicle_license_photo_desc.png");
export default function VehicleLicenseDesc() {
    return (
        <View>
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
              resizeMode: "contain",
              borderRadius: BORDER_RADIUS.xl
          },
          descCont: {
              flexDirection: "row",
              alignItems: "center",
          }
})