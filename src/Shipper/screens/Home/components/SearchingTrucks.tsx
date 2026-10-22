import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import { AntDesign, Feather, FontAwesome6 } from '@expo/vector-icons'
import HorizontalLoadingView from './HorizontalLoadingView'
import { OrderStateType } from './OrderHome'

const updatePrice = 100

type SearchingTrucksProps = {
    orderPrice: string
    setOrderPrice: React.Dispatch<React.SetStateAction<string>>
    setFindTruck: React.Dispatch<React.SetStateAction<OrderStateType | null>>
}

export default function SearchingTrucks({
    orderPrice, setOrderPrice, setFindTruck
}: SearchingTrucksProps) {
    const [offerPrice, setOfferPrice] = useState(() => orderPrice ?? "");
    const [raisedPrice, setRaisedPrice] = useState(false);

    const formatPrice = (text: string) => {
        // Strip everything except digits
        const numericValue = text.replace(/[^0-9]/g, '');

        if (!numericValue) return '';

        // Add commas every 3 digits from the right
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const formatPriceWithCommas = (price: string) => {
        const formattedPrice = formatPrice(price);
        return formattedPrice;
    }

    const incrementOfferPrice = () => {
        setRaisedPrice(true);
        setOfferPrice((prev) => String(Number(prev.replace(/,/g, "")) + updatePrice));
    }


    const decrementOfferPrice = () => {
        if(!raisedPrice) return
        setOfferPrice((prev) => String(Number(prev.replace(/,/g, "")) - updatePrice));
    }

    const cancelOrder = () => {
          setFindTruck(null);
    }

    return (
        <View style={styles.body}>
            <View>
                <Text style={styles.headerText}>Searching for drivers...</Text>
                <View style={styles.loadingViewCont}>
                    <HorizontalLoadingView />
                </View>
            </View>

            <View>
                <Text style={styles.offerPriceLabelText}>Your offer</Text>
            </View>

            <View style={styles.offerPriceCont}>
                <Pressable onPress={decrementOfferPrice} style={[styles.updateOfferPriceCont, { backgroundColor: raisedPrice ? Colors.primary : Colors.boxBackground }]}>
                    <View style={styles.updateOfferPriceInnerCont}>
                        <AntDesign name="minus" size={ICON_SIZES.xs} color={raisedPrice? Colors.text.white : Colors.text.gray} />
                        <Text style={[styles.updateText, { color: raisedPrice ? Colors.text.white : Colors.text.gray }]}>{updatePrice}</Text>
                    </View>
                </Pressable>
                <View style={styles.offerPriceTextCont}>
                    <FontAwesome6 name="naira-sign" size={ICON_SIZES.xl} color={Colors.text.black} />
                    <Text style={styles.offerPriceText}>{formatPriceWithCommas(offerPrice)}</Text>
                </View>
                <Pressable onPress={incrementOfferPrice} style={styles.updateOfferPriceCont}>
                    <View style={styles.updateOfferPriceInnerCont}>
                        <AntDesign name="plus" size={ICON_SIZES.xs} color={Colors.text.white} />
                        <Text style={styles.updateText}>{updatePrice}</Text>
                    </View>
                </Pressable>
            </View>

            <Pressable style={[styles.increaseOfferPriceBtn, { backgroundColor: raisedPrice? Colors.primary : Colors.boxBackground }]}>
                <Text style={[styles.increaseOfferPriceText, { color: raisedPrice ? Colors.text.white : Colors.text.gray }]}>Offer more</Text>
            </Pressable>
            <Pressable onPress={cancelOrder} style={styles.cancelOrderRequestBtn}>
                <Text style={styles.cancelOrderRequestText}>Cancel Order</Text>
            </Pressable>

        </View>
    )
}

const styles = StyleSheet.create({
    body: {
        paddingVertical: 15
    },
    loadingView: {
        width: "100%",
        height: 5,
        backgroundColor: Colors.primary,
        borderRadius: BORDER_RADIUS.xmd
    },
    loadingViewCont: {
        marginVertical: 15
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
        textAlign: "center"
    },
    offerPriceLabelText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.gray,
        textAlign: "center",
    },
    offerPriceText: {
        fontSize: FONT_SIZES.xxl,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
        textAlign: "center",
    },
    updateOfferPriceCont: {
        width: "20%",
        height: 40,
        backgroundColor: Colors.primary,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: "center",
        alignItems: "center",
    },
    updateOfferPriceInnerCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    updateText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.white,
    },
    offerPriceCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 15
    },
    offerPriceTextCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 1
    },
    increaseOfferPriceBtn: {
        width: "100%",
        height: 45,
        marginVertical: 15,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        borderRadius: BORDER_RADIUS.md

    },
    increaseOfferPriceText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.white
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