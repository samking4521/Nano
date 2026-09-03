import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons';
import { Colors } from '../../../../constants/theme/colors';

const photo_desc_img = require("../../../../../assets/shipper/goods_desc.png");

export default function OrderPhotoDesc() {
    return (
        <View>
            <View>
                <Text style={styles.headerText}>Add Photos of your goods</Text>
            </View>
            <View>
                <View style={styles.descCont}>
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}} />
                    <View style={styles.textCont}>
                                            <Text style={styles.headerDesc}>Add at least 1 photo, up to 3 photos.</Text>

                    </View>
                </View>
                <View style={styles.descCont} >
                    <AntDesign name="check" size={18} color="black" style={{marginRight: 10}}/>
                    <View style={styles.textCont}>
                    <Text style={styles.headerDesc}>Show the full load clearly so the driver knows what to expect.</Text>

                    </View>
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
        width: "80%",
        height: 300,
         marginVertical: 20,
        borderRadius: 10,
        alignSelf: "center"
        },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
    },
    descCont: {
        flexDirection: "row",
        alignItems: "center",
    },
    textCont: {
        flexShrink: 1
    }
})