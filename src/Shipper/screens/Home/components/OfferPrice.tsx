import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import BottomSheet, { BottomSheetFooter, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors';
import { AntDesign, Feather, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font';


type OfferPriceProps = {
    setShowOfferPriceBottomSheet:  React.Dispatch<React.SetStateAction<boolean>>
    getOrderPriceData: (price: string) => void
    orderPrice: string
}

function OfferPrice({ setShowOfferPriceBottomSheet, getOrderPriceData, orderPrice }: OfferPriceProps) {
    const [offerPrice, setOfferPrice] = useState(()=> orderPrice ?? "");
    const [highlightInput, setHighlightInput] = useState(false);
    const [errorPrice, setErrorPrice] = useState(false);


    const formatPrice = (text: string) => {
        // Strip everything except digits
        const numericValue = text.replace(/[^0-9]/g, '');

        if (!numericValue) return '';

        // Add commas every 3 digits from the right
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const SetOfferPrice = (value: string) => {
        const formatted = formatPrice(value);

        setOfferPrice(formatted);

        const numericPrice = Number(formatted.replace(/,/g, ''));

        if (numericPrice >= 1000) {
            setErrorPrice(false);
        }
    }

    const closeOfferPriceBottomSheet = () => {
        setShowOfferPriceBottomSheet(false);
    }


   


    const submitOfferPrice = () => {
        if(offerPrice.trim() == "") return;
        const numericPrice = Number(offerPrice.replace(/,/g, ''));
       
        if (numericPrice < 1000) {
            setErrorPrice(true);
            return;
        };
        setShowOfferPriceBottomSheet(false);
        getOrderPriceData(offerPrice);
    }


    return (
        <BottomSheet
            index={0}
            enableDynamicSizing={true}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustPan"
            enablePanDownToClose={false}
            enableOverDrag={false}
            backgroundStyle={{ backgroundColor: Colors.background }}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            handleStyle={styles.handleStyle}
        >
            <BottomSheetView style={styles.orderBottomSheetBody}>
                <View style={styles.headerCont}>
                    <View style={styles.tagIconCont}>
                        <MaterialCommunityIcons name="tag-outline" size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.headerTextCont}>
                        <Text style={styles.offerPriceText}>Offer a price</Text>
                        <Text style={styles.offerPriceDesc}>Enter the amount you are willing to pay for this delivery.</Text>
                    </View>
                    <Pressable onPress={closeOfferPriceBottomSheet} style={styles.closeBtn}>
                        <AntDesign name="close" color={Colors.text.black} size={18} />
                    </Pressable>
                </View>

                <View style={[styles.inputBoxViewCont, { borderColor: errorPrice ? Colors.error : highlightInput ? Colors.primary : undefined, borderWidth: highlightInput ? 1.5 : undefined, backgroundColor: errorPrice ? Colors.errorBackground : Colors.boxBackground }]}>
                    <View>
                        <FontAwesome6 name="naira-sign" size={20} color={Colors.text.black} />
                    </View>
                    <BottomSheetTextInput
                        value={offerPrice}
                        onChangeText={(value) => SetOfferPrice(value)}
                        keyboardType="number-pad"
                        style={styles.inputBox}
                        selectionColor={Colors.primary}
                        autoFocus={true}
                        onFocus={() => setHighlightInput(true)}
                        onBlur={() => setHighlightInput(false)}
                    />
                    {offerPrice.length >= 1 && <Pressable
                        style={styles.clearTextCont}
                        onPress={
                            () => {
                                setOfferPrice("");
                                setErrorPrice(false);
                            }
                        }
                    >
                        <AntDesign name="close" size={10} color={Colors.text.white} />
                    </Pressable>}

                </View>
                {errorPrice && <View style={styles.errorBox}>
                    <Text style={styles.errorText}>Minimum price is N1,000</Text>
                </View>}
                <View
                >
                    <View>
                        <View style={styles.paymentNoteCont}>
                            <View style={styles.payNoteIconCont}>
                                <Feather name="shield" size={15} color={Colors.text.white} />
                            </View>
                            <View style={styles.headerTextCont}>
                                <Text style={styles.payNoteText}>How it works</Text>
                                <View>
                                    <Text style={styles.payNoteDesc}>1. Set the price you're willing to pay.</Text>
                                    <Text style={styles.payNoteDesc}>2. The driver can accept, negotiate or decline your offer.</Text>
                                    <Text style={styles.payNoteDesc}>3. If driver accepts, you make payment and driver heads to pickup goods</Text>
                                    <Text style={styles.payNoteDesc}>4. Your funds stay secured until you confirm delivery.</Text>
                                </View>
                            </View>
                        </View>


                    </View>
                </View>
               <View style={styles.footerCont}>
                        <Pressable onPress={submitOfferPrice} style={[styles.saveOfferPriceBtn, { backgroundColor: offerPrice ? Colors.primary : Colors.boxBackground }]}>
                            <Text style={[styles.saveOfferPriceText, { color: offerPrice ? Colors.text.white : Colors.text.boxContPlaceholderText }]}>
                                Confirm
                            </Text>
                        </Pressable>
                    </View>
            </BottomSheetView>
              
        </BottomSheet>
    )
}

export default React.memo(OfferPrice)

const styles = StyleSheet.create({
    orderBottomSheetBody: {
        backgroundColor: Colors.background,
        paddingHorizontal: 20
    },
    handleStyle: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.boxBackground
    },
    tagIconCont: {
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: Colors.primaryTransparent,
        justifyContent: "center",
        alignItems: "center"
    },
    offerPriceText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black
    },
    offerPriceDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center",
    },
    headerCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10
    },
    headerTextCont: {
        flexShrink: 1
    },
    inputBox: {
        flex: 1,
        flexShrink: 1,
        height: 60,
        fontSize: FONT_SIZES.xxl,
        fontFamily: FONTS.bold,
        color: Colors.text.black,
        letterSpacing: 0.5,
        marginLeft: 30
    },
    inputBoxViewCont: {
        height: 60,
        backgroundColor: Colors.boxBackground,
        borderRadius: 10,
        padding: 15,
        marginTop: 30,
        flexDirection: "row",
        alignItems: "center",
    },
    clearTextCont: {
        width: 20,
        height: 20,
        borderRadius: 20,
        backgroundColor: Colors.routeTypeIcons.search,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10
    },
    payNoteText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
        marginBottom: 5
    },
    payNoteDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray,
        marginBottom: 10
    },
    paymentNoteCont: {
        backgroundColor: Colors.primaryTransparent,
        padding: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 15,
        gap: 10
    },
    payNoteIconCont: {
        width: 25,
        height: 25,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center"
    },
    offerPriceInstructionsCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        marginBottom: 15
    },
    saveOfferPriceBtn: {
        width: "100%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        borderRadius: 10
    },
    saveOfferPriceText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.white
    },

    footerCont: {
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: Colors.background
    },
    errorBox: {
        marginTop: 10,
        width: "100%",
        padding: 10,
        backgroundColor: Colors.errorBackground,
        borderRadius: 12

    },
    errorText: {
        color: Colors.error,
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold
    },

})