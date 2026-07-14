import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/colors';
import { AntDesign } from '@expo/vector-icons';

const nin_desc_img = require("../../../../assets/onboarding/nin_img_desc.png");

export default function NinDesc() {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.headerText}>NIN</Text>
            </View>
            <View>
                <View style={styles.descCont}>
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}} />
                    <Text style={styles.headerDesc}>Take a good clear photo of your NIN (National ID)</Text>
                </View>
                <View style={styles.descCont} >
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}}/>
                    <Text style={styles.headerDesc}>Do not use screenshots, or blurry photo</Text>
                </View>
                <View style={styles.imageCont}>
                    <Image
                        source={nin_desc_img}
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
        height: 250,
        marginVertical: 20

    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "stretch"
    },
    descCont: {
        flexDirection: "row",
        alignItems: "center",
    }
})