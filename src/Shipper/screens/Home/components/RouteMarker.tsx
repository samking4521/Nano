import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type RouteMarkerProps = {
    text: string
    backgroundColor?: string
    textColor?: string
}

function RouteMarker({
    text,
    backgroundColor = '#000',
    textColor = '#fff',
}: RouteMarkerProps) {
    return (
        <View style={styles.wrapper}>
            <View
                style={[
                    styles.bubble,
                    { backgroundColor },
                ]}
            >
                <Text
                    style={[styles.text, { color: textColor }]}
                    numberOfLines={1}
                >
                    {text}
                </Text>

                {/* Pointer */}
                <View
                    style={[
                        styles.pointer,
                        { borderTopColor: backgroundColor },
                    ]}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
    },

    bubble: {
        minHeight: 30,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        position: 'relative',
    },

    pointer: {
        position: 'absolute',
        bottom: -5,
        alignSelf: 'center',

        width: 0,
        height: 0,

        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,

        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },

    text: {
        fontSize: 12,
        fontWeight: '600',
    },
})

export default React.memo(RouteMarker)