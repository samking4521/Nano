import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { OrderStateType } from './OrderHome'
import HexagonSpinner from '../../../../utils/HexagonSpinner'

type ProcessingOrderDetailsProps = {
    setFindTruck: React.Dispatch<React.SetStateAction<OrderStateType | null>>
}

export default function ProcessingOrderDetails({ setFindTruck }: ProcessingOrderDetailsProps) {

    const cancelOrder = () => {
        setFindTruck(null);
    }

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <Pressable onPress={() => setFindTruck("Searching")}>
                    <HexagonSpinner />
                </Pressable>

                <View style={styles.labelCont}>
                    <Text style={styles.labelText}>Processing your order</Text>
                    <Text style={styles.labelDesc}>Getting your order ready for drivers...</Text>
                </View>

                <Pressable onPress={cancelOrder} style={styles.cancelOrderRequestBtn}>
                    <Text style={styles.cancelOrderRequestText}>Cancel Order</Text>
                </Pressable>

            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    body: {
        justifyContent: "center",
        alignItems: "center",
    },
    hexagonCont: {

        width: 60,
        height: 60,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primaryTransparent
    },
    labelText: {
        fontSize: FONT_SIZES.xl,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
        textAlign: "center"
    },
    labelDesc: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.gray,
        textAlign: "center"
    },
    labelCont: {
        marginTop: 20,
        marginBottom: 30,
        gap: 5
    },
    cancelOrderRequestBtn: {
        width: "100%",
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.boxBackground,
        borderRadius: BORDER_RADIUS.md
    },
    cancelOrderRequestText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.gray
    }
})