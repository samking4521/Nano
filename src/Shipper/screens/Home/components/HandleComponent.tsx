import { Image, StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import { AntDesign } from '@expo/vector-icons'
import React from 'react'
import { DriverViewedRequestType } from './OrderHome'

type HandleComponentsProp = {
    driversViewedRequest: DriverViewedRequestType[]
}

function HandleComponent({driversViewedRequest}: HandleComponentsProp) {

    return (
        <View style={styles.container}>
            <Text style={styles.descText}>{driversViewedRequest.length} drivers viewed your request</Text>
            <View style={styles.driverImagesContainer}>
                {

                    driversViewedRequest.slice(0, 3).map((item, index) => {
                        return (
                            <View style={[styles.imgCont, { marginRight: (driversViewedRequest.length - 1) == index ? 0 : -10 }]} key={item.id}>
                                <Image source={{uri: item.img}} style={styles.driverImg} />
                            </View>
                        )
                    })


                }
                {
                    driversViewedRequest.length > 3 && <View style={styles.plusCont}>
                        <AntDesign name="plus" size={ICON_SIZES.xs} color={Colors.primary} />
                    </View>
                }
            </View>
        </View>

    )
}

export default React.memo(HandleComponent);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.boxBackground,
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        paddingVertical: 5,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    driverImagesContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    imgCont: {
        width: 25,
        height: 25,
    },
    driverImg: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: "100%"
    },
    descText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.black
    },
    plusCont: {
        backgroundColor: Colors.background,
         width: 20,
        height: 20,
        borderRadius: BORDER_RADIUS.xl,
        justifyContent: "center",
        alignItems: "center"
    }
})