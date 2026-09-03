import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../../../constants/theme/font';

const gray = "#9FA1AC";


function ProgressLevel({ progressLevel }: { progressLevel: number }) {

    return (
        <View style={styles.container}>
            <View
                style={styles.progressCont}
            >

                <View style={{ alignItems: 'center' }}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: progressLevel <= 1 ? undefined : Colors.primary,
                            borderWidth: progressLevel <= 1 ? 1 : undefined,
                            borderColor: progressLevel <= 1 ? Colors.primary : undefined,
                        }}
                    >
                        <Text style={{ color: progressLevel <= 1 ? Colors.primary : Colors.text.white, fontFamily: FONTS.semiBold }}>1</Text>
                    </View>
                    <Text style={{ color: progressLevel <= 1 ? Colors.text.black : Colors.primary, marginTop: 8, fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.xs }}>Personal</Text>
                </View>
                <View
                    style={{
                        flex: 1,
                        height: 2,
                        backgroundColor: progressLevel <= 1 ? gray : Colors.primary,
                        marginBottom: 25,
                    }}
                />


                <View style={{ alignItems: 'center' }}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 20,
                            backgroundColor: progressLevel <= 1 ? gray : progressLevel <= 2 ? undefined : Colors.primary,
                            borderWidth: progressLevel <= 1 ? undefined : progressLevel <= 2 ? 1 : undefined,
                            borderColor: progressLevel <= 1 ? undefined : progressLevel <= 2 ? Colors.primary : undefined,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: progressLevel <= 1 ? Colors.text.white : progressLevel <= 2 ? Colors.primary : Colors.text.white, fontFamily: FONTS.semiBold }}>2</Text>
                    </View>

                    <Text style={{
                        color: progressLevel <= 1 ? "#9CA3AF" : progressLevel <= 2 ? Colors.text.black : Colors.primary, marginTop: 8,
                        fontFamily: progressLevel <= 1 ? FONTS.medium : progressLevel <= 2 ? FONTS.semiBold : FONTS.semiBold,
                        fontSize: FONT_SIZES.xs
                    }}>
                        Identity
                    </Text>
                </View>


                <View
                    style={{
                        flex: 1,
                        height: 2,
                        backgroundColor: progressLevel <= 2 ? gray : Colors.primary,
                        marginBottom: 25,
                    }}
                />


                <View style={{ alignItems: 'center' }}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 20,
                            backgroundColor: progressLevel <= 2 ? gray : progressLevel <= 3 ? undefined : Colors.primary,
                            borderWidth: progressLevel <= 2 ? undefined : progressLevel <= 3 ? 1 : undefined,
                            borderColor: progressLevel <= 2 ? undefined : progressLevel <= 3 ? Colors.primary : undefined,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: progressLevel <= 2 ? Colors.text.white : progressLevel <= 3 ? Colors.primary : Colors.text.white, fontFamily: FONTS.semiBold }}>3</Text>
                    </View>

                    <Text
                        style={{
                            marginTop: 8,
                            color: progressLevel <= 2 ? '#9CA3AF' : progressLevel <= 3 ? Colors.text.black : Colors.primary,
                            fontFamily: progressLevel <= 2 ? FONTS.medium : progressLevel <= 3 ? FONTS.semiBold : FONTS.semiBold,
                            fontSize: FONT_SIZES.xs
                        }}
                    >
                        Ownership
                    </Text>
                </View>


                <View
                    style={{
                        flex: 1,
                        height: 2,
                        backgroundColor: progressLevel <= 3 ? gray : Colors.primary,
                        marginBottom: 25,
                    }}
                />


                <View style={{ alignItems: 'center' }}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 20,
                            backgroundColor: progressLevel > 3 ? undefined : gray,
                            borderWidth: progressLevel > 3 ? 1 : undefined,
                            borderColor: progressLevel > 3 ? Colors.primary : undefined,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: progressLevel > 3 ? Colors.primary : Colors.text.white, fontFamily: FONTS.semiBold }}>4</Text>
                    </View>

                    <Text
                        style={{
                            marginTop: 8,
                            color: progressLevel > 3 ? Colors.text.black : '#9CA3AF',
                            fontFamily: progressLevel > 3 ? FONTS.semiBold : FONTS.medium,
                            fontSize: FONT_SIZES.xs
                        }}
                    >
                        Preview
                    </Text>
                </View>
            </View>
        </View>



    )
}

export default React.memo(ProgressLevel);

const styles = StyleSheet.create({
    container: {
        marginTop: 5
    },
    progressCont: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})