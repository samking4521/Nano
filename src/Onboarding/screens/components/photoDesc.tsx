import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/colors';
import { AntDesign } from '@expo/vector-icons';

const photo_desc_img = require("../../../../assets/onboarding/photoDesc.png");
export default function PhotoDesc() {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.headerText}>Personal Picture</Text>
            </View>
            <View>
                <View style={styles.descCont}>
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}} />
                    <Text style={styles.headerDesc}>Taking a good clear selfie helps shippers trust you more</Text>
                </View>
                <View style={styles.descCont} >
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}}/>
                    <Text style={styles.headerDesc}>Make sure your face is fully visible. Remove hats, sunglasses, or anything that covers your face.</Text>
                </View>
                <View style={styles.imageCont}>
                    <Image
                        source={photo_desc_img}
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