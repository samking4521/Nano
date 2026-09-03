import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign, Entypo, FontAwesome6, MaterialIcons } from '@expo/vector-icons'
import CountryPicker, { Country } from 'react-native-country-picker-modal'
import React, { useRef, useState } from 'react'
import SelectCategory from './SelectCategory'
import BottomSheet from '@gorhom/bottom-sheet'
import SelectVehicleType, { VehicleTypeObj } from './SelectVehicleType'
import AddItemsPhoto from './AddItemsPhoto'
import { ContactPickerButton } from './ContactPicker'
import { orderDetailsObjType } from './OrderHome'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'

export type specialHandlingDataType = {
    type: string
    selected: boolean
}

const initialSpecialHandlingData: specialHandlingDataType[] = [
    {
        type: "fragile",
        selected: false
    },
    {
        type: "harzardous",
        selected: false
    },
    {
        type: "Perishable",
        selected: false
    },
    {
        type: "Oversized/Heavy",
        selected: false
    },
    {
        type: "Liquid",
        selected: false
    }
]

const countryPickerProps = {
    withFilter: true,
    withFlag: true,
    withCountryNameButton: false,
    withAlphaFilter: true,
    withCallingCode: true,
    withEmoji: true,
};

export type orderPhotoObj = {
    id: string
    uri: string
    type: "uri" | "loading"
}


type highlightTextType = "describe_order" | "recipent_phone" | "recipent_name";
const maxOrderDescLength = 200;

export type vehicleTypeVal = "Pickup Truck" | "Flatbed Truck" | "Tipper Truck" | "Box Truck" | "Van Truck" | "Container Truck";

type orderDetailModalProps = {
    setShowOrderDetailsModal: React.Dispatch<React.SetStateAction<boolean>>
    getOrderDetailsData: (orderDetailsObj: orderDetailsObjType) => void
    orderDetailsData: orderDetailsObjType | null
}

function OrderDetailsModal({ setShowOrderDetailsModal, getOrderDetailsData, orderDetailsData }: orderDetailModalProps) {
    const [country, setCountry] = useState<Country>();
    const categoryBottomSheetRef = useRef<BottomSheet>(null);
    const [openCategoryBottomSheeet, setOpenCategoryBottomSheet] = useState(false);
    const [orderCategory, setOrderCategory] = useState(()=> orderDetailsData?.order_category ?? "");
    const [orderRecipentName, setOrderRecipentName] = useState(()=> orderDetailsData?.order_recipent_name ?? "");
    const [orderRecipentPhone, setOrderRecipentPhone] = useState(()=> orderDetailsData?.order_recipent_phone ?? "");
    const [orderDesc, setOrderDesc] = useState(()=> orderDetailsData?.order_desc ?? "");
    const [highlightText, setHighlightText] = useState<highlightTextType | null>(null);
    const selectVehicleBottomSheetRef = useRef<BottomSheet>(null);
    const [openSelectVehicleBottomSheet, setOpenSelectVehicleBottomSheet] = useState(false);
    const [vehicleType, setVehicleType] = useState<vehicleTypeVal | null>(orderDetailsData?.order_vehicle_data?.type  ?? null)
    const [vehicleTypeObjData, setVehicleTypeObjectData] = useState<VehicleTypeObj | null>(()=> orderDetailsData?.order_vehicle_data ?? null);
    const [orderPhotos, setOrderPhotos] = useState<orderPhotoObj[]>(()=> orderDetailsData?.order_photos ?? []);
    const [openOrderPhotosBottomSheet, setOpenOrderPhotosBottomSheet] = useState(false);
    const orderPhotosBottomSheetRef = useRef<BottomSheet>(null);
    const [specialHandlingData, setSpecialHandlingData] = useState(orderDetailsData?.special_handling_data ?? initialSpecialHandlingData);
    const [clickedSave, setClickedSave] = useState(false);

    const callingCode = country?.callingCode[0] ?? "234";
    const countryCode = country?.cca2 ?? 'NG';


    const onSelect = (country: Country) => {
        console.log("country: ", country);
        setCountry(country);

    }

    const openCategorySelector = () => {
        categoryBottomSheetRef.current?.expand();
        setOpenCategoryBottomSheet(true);
    }

    const openOrderPhotosSelector = () => {
        orderPhotosBottomSheetRef.current?.expand();
        setOpenOrderPhotosBottomSheet(true);
    }


    const openVehicleTypeSelector = () => {
        selectVehicleBottomSheetRef.current?.expand();
        setOpenSelectVehicleBottomSheet(true);
    }

    const SetOrderDescText = (value: string) => {
        setOrderDesc(value);
    }

    const selectSpecialHandling = (handlingData: specialHandlingDataType) => {
        if (handlingData.selected) {
            const newHandlingData = specialHandlingData.map((item) => item.type != handlingData.type ? item : { ...item, selected: false })
            setSpecialHandlingData(newHandlingData)
        } else {
            const newHandlingData = specialHandlingData.map((item) => item.type != handlingData.type ? item : { ...item, selected: true })
            setSpecialHandlingData(newHandlingData)
        }
    }


    const removeOrderPhotos = (id: string) => {
        const newOrderPhotos = orderPhotos.filter((imgObj) => imgObj.id != id)
        setOrderPhotos(newOrderPhotos);
    }

    const order_category_err = clickedSave && orderCategory.trim() == "";
    const order_desc_err = clickedSave && orderDesc.trim() == "";
    const order_vehicle_type_err = clickedSave && !vehicleTypeObjData;
    const order_photos_empty_err = clickedSave && orderPhotos.length == 0;
    const order_photos_above_limit = orderPhotos.length > 3;


    const SaveOrderDetails = () => {
        setClickedSave(true);
        const hasErrors = [
            !orderCategory,
            !orderDesc,
            !vehicleTypeObjData,
            orderPhotos.length == 0,
            orderPhotos.length > 3
        ].some(Boolean);

        if (hasErrors) return;



        const orderDetailsObj = {
            order_category: orderCategory,
            order_desc: orderDesc,
            order_vehicle_data: vehicleTypeObjData,
            order_photos: orderPhotos,
            special_handling_data: specialHandlingData ?? null,
            order_recipent_name: orderRecipentName.trim() == "" ? null : orderRecipentName,
            order_recipent_phone: orderRecipentPhone.trim() == "" ? null : orderRecipentPhone
        }

        getOrderDetailsData(orderDetailsObj);
        setShowOrderDetailsModal(false);
    }

    const closeOrderDetailsModal = () => {
        setShowOrderDetailsModal(false);
    }

    return (
        <Modal
            visible={true}
            onRequestClose={closeOrderDetailsModal}
            animationType="slide"
            presentationStyle={"overFullScreen"}
        >
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}

                    >
                        <View style={styles.headerCont}>
                            <Pressable onPress={closeOrderDetailsModal} style={styles.closeModalBtn}>
                                <AntDesign name="close" size={18} color={Colors.text.black} />
                            </Pressable>

                            <Text style={styles.headerText}>Order details</Text>
                            <View style={styles.view} />
                        </View>

                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            keyboardShouldPersistTaps="never"
                            showsVerticalScrollIndicator={false}
                            style={{ flex: 1 }}>
                            <View style={styles.body}>



                                <View style={styles.orderDetailsCont}>
                                    <View>
                                        <View>
                                            <Text style={styles.labelText}>What are you moving?</Text>
                                        </View>
                                        <View style={styles.textInputCont}>
                                            <Pressable onPress={openCategorySelector} style={[styles.selectBox, { backgroundColor: order_category_err ? Colors.errorBackground : Colors.boxBackground }]}>
                                                <Text style={[styles.placeholderText, {color: orderCategory ? Colors.text.black : Colors.text.boxContPlaceholderText }]}>{orderCategory || "Select goods category"}</Text>
                                                <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.routeTypeIcons.search} />
                                            </Pressable>
                                            {order_category_err && <View style={styles.errorBox}>
                                                <Text style={styles.errorText}>What you're moving is required</Text>
                                            </View>}
                                        </View>
                                    </View>

                                    <View style={styles.viewCont}>
                                        <View>
                                            <Text style={styles.labelText}>Describe what{"\n"}you are moving</Text>
                                        </View>
                                        <View style={[styles.textInputCont, { borderWidth: highlightText == "describe_order" ? 1.5 : undefined, borderColor: highlightText == "describe_order" ? Colors.primary : undefined, borderRadius: highlightText == "describe_order" ? 10 : 0 }]}>
                                            <TextInput
                                                value={orderDesc}
                                                onChangeText={(value) => SetOrderDescText(value)}
                                                multiline={true}
                                                style={[styles.inputBox, { backgroundColor: order_desc_err ? Colors.errorBackground : Colors.boxBackground }]}
                                                maxLength={maxOrderDescLength}
                                                selectionColor={Colors.primary}
                                                placeholder="e.g 20 bags of cement"
                                                placeholderTextColor={Colors.text.boxContPlaceholderText}
                                                onFocus={() => setHighlightText("describe_order")}
                                                onBlur={() => setHighlightText(null)}
                                            />

                                        </View>
                                        <Text style={styles.orderDescLength}>{`${orderDesc.length} / ${maxOrderDescLength}`}</Text>
                                        {order_desc_err && <View style={styles.errorBox}>
                                            <Text style={styles.errorText}>Please describe what you're moving</Text>
                                        </View>}
                                    </View>

                                    <View style={styles.viewCont}>
                                        <View>
                                            <Text style={styles.labelText}>What vehicle do you need?</Text>
                                        </View>
                                        <View style={styles.textInputCont}>
                                            {vehicleTypeObjData ?
                                                <Pressable onPress={openVehicleTypeSelector} style={styles.vehicleItemContainer}>
                                                    <View style={styles.imgCont}>
                                                        <Image source={vehicleTypeObjData.image} style={styles.vehicleImage} />
                                                    </View>
                                                    <View style={styles.textCont}>
                                                        <Text style={styles.labelText}>{vehicleTypeObjData.type}</Text>
                                                        <Text style={styles.labelDesc}>{vehicleTypeObjData.value}</Text>
                                                    </View>

                                                    <MaterialIcons name="keyboard-arrow-right" size={24} style={{ marginLeft: 10 }} color={Colors.routeTypeIcons.search} />


                                                </Pressable>
                                                : <Pressable onPress={openVehicleTypeSelector} style={[styles.selectBox, { backgroundColor: order_vehicle_type_err ? Colors.errorBackground : Colors.boxBackground }]}>
                                                    <Text style={[styles.placeholderText, { color: Colors.text.boxContPlaceholderText }]}>Select Vehicle Type</Text>
                                                    <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.routeTypeIcons.search} />
                                                </Pressable>}

                                            {order_vehicle_type_err && <View style={styles.errorBox}>
                                                <Text style={styles.errorText}>Please select a vehicle</Text>
                                            </View>}
                                        </View>
                                    </View>

                                    <View style={styles.viewCont}>
                                        <View>
                                            <Text style={styles.labelText}>Photos of your goods</Text>
                                            <Text style={styles.labelDesc}>Add 1-3 photos to help the driver understand your goods</Text>
                                        </View>
                                        <View style={{ marginTop: 10 }}>
                                            {
                                                orderPhotos.length == 0 ?
                                                    <Pressable onPress={openOrderPhotosSelector} style={[styles.addPhotoCont, { backgroundColor: order_photos_empty_err ? Colors.errorBackground : Colors.boxBackground }]}>
                                                        <View>
                                                            <AntDesign name="plus" size={24} color={Colors.text.black} />
                                                        </View>
                                                    </Pressable>
                                                    :
                                                    <View style={[styles.orderPhotosCont, { justifyContent: orderPhotos.length > 1 ? "center" : undefined }]}>
                                                        {
                                                            orderPhotos.map((imgObj) =>
                                                                imgObj.type == "loading" ?
                                                                    <View key={imgObj.id} style={styles.addPhotoCont}>
                                                                        <View>
                                                                            <FontAwesome6 name="image" size={24} color={Colors.text.gray} style={{ opacity: 0.5 }} />
                                                                        </View>

                                                                        <View style={styles.compressingImageSpinner}>
                                                                            <ActivityIndicator color={Colors.background} />

                                                                        </View>
                                                                    </View>
                                                                    :
                                                                    <View key={imgObj.id} style={styles.addPhotoCont}>
                                                                        <Image source={{ uri: imgObj.uri }} resizeMode="cover" style={styles.orderPhotosImage} />
                                                                        <Pressable onPress={() => removeOrderPhotos(imgObj.id)} style={styles.removeImgBtn}>
                                                                            <AntDesign name="close" size={14} color={Colors.text.white} />

                                                                        </Pressable>
                                                                    </View>
                                                            )


                                                        }

                                                        {orderPhotos.length < 3 && <Pressable onPress={openOrderPhotosSelector} style={styles.addPhotoCont}>
                                                            <View>
                                                                <AntDesign name="plus" size={24} color={Colors.text.black} />
                                                            </View>
                                                        </Pressable>}
                                                    </View>
                                            }
                                            {(order_photos_empty_err || order_photos_above_limit) && <View style={styles.errorBox}>
                                                <Text style={styles.errorText}>{order_photos_empty_err ? "Enter at least one photo" : "Maximum of 3 photos allowed"}</Text>
                                            </View>}
                                        </View>


                                    </View>

                                    <View style={styles.viewCont}>
                                        <View>
                                            <Text style={styles.labelText}>Does your load need{"\n"}special handling? (optional)</Text>
                                        </View>

                                        <View style={styles.specialLabelContainer}>
                                            {
                                                specialHandlingData.map((item) =>
                                                    <Pressable onPress={() => selectSpecialHandling(item)} key={`${item.type}`} style={[styles.specialItemsLabelCont, { backgroundColor: item.selected ? Colors.primary : Colors.boxBackground }]}>
                                                        <Text style={[styles.specialItemsLabelText, { color: item.selected ? Colors.text.white : Colors.text.black }]}>{item.type}</Text>
                                                    </Pressable>
                                                )
                                            }

                                        </View>

                                    </View>

                                    <View style={[styles.viewCont, { marginBottom: 10 }]}>
                                        <View>
                                            <Text style={styles.labelText}>Recipent's phone number</Text>
                                            <Text style={styles.labelDesc}>Driver may contact recipent when arriving. Skip if you're the recipient.</Text>
                                        </View>
                                        <View style={[styles.mobileTextInputContainer, { borderColor: highlightText == "recipent_phone" ? Colors.primary : undefined, borderWidth: highlightText == "recipent_phone" ? 1.5 : undefined }]}>
                                            <View style={styles.mobileCodeCont}>
                                                <CountryPicker
                                                    {...countryPickerProps}
                                                    countryCode={countryCode}
                                                    onSelect={onSelect}

                                                />
                                            </View>
                                            <View style={styles.mobileInputCont}>
                                                <Text style={styles.mobileCodeText}>+{callingCode}</Text>
                                                <TextInput
                                                    value={orderRecipentPhone}
                                                    onChangeText={setOrderRecipentPhone}
                                                    placeholder='Recipent phone number'
                                                    keyboardType="phone-pad"
                                                    selectionColor={Colors.primary}
                                                    style={styles.mobileTextInput}
                                                    placeholderTextColor={Colors.text.boxContPlaceholderText}
                                                    onFocus={() => setHighlightText("recipent_phone")}
                                                    onBlur={() => setHighlightText(null)}
                                                />
                                            </View>

                                            <ContactPickerButton
                                                onPicked={({ name, phoneNumber }) => {
                                                    setOrderRecipentName(name);
                                                    if (!phoneNumber) return
                                                    setOrderRecipentPhone(phoneNumber);
                                                }}
                                            />
                                        </View>


                                        <View style={[styles.textInputCont, { borderWidth: highlightText == "recipent_name" ? 1.5 : undefined, borderColor: highlightText == "recipent_name" ? Colors.primary : undefined, borderRadius: highlightText == "recipent_name" ? 10 : 0 }]}>
                                            <TextInput
                                                value={orderRecipentName}
                                                onChangeText={setOrderRecipentName}
                                                style={[styles.inputBox, { height: 50 }]}
                                                spellCheck={false}
                                                autoCorrect={false}
                                                selectionColor={Colors.primary}
                                                placeholder="Recipent Name"
                                                placeholderTextColor={Colors.text.boxContPlaceholderText}
                                                onFocus={() => setHighlightText("recipent_name")}
                                                onBlur={() => setHighlightText(null)}
                                            />

                                        </View>

                                    </View>



                                </View>
                            </View>

                        </ScrollView>
                        <View style={styles.footerCont}>
                            <Pressable onPress={SaveOrderDetails} style={styles.saveOrderDetailsBtn}>
                                <Text style={styles.saveOrderText}>Save</Text>
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>

                </SafeAreaView>
                {(openCategoryBottomSheeet || openSelectVehicleBottomSheet || openOrderPhotosBottomSheet) && <View style={styles.overlayViewCont} />}
                <SelectCategory orderCategory={orderCategory} categoryBottomSheetRef={categoryBottomSheetRef} setOpenCategoryBottomSheet={setOpenCategoryBottomSheet} setOrderCategory={setOrderCategory} />
                <SelectVehicleType vehicleType={vehicleType} selectVehicleBottomSheetRef={selectVehicleBottomSheetRef} setOpenSelectVehicleBottomSheet={setOpenSelectVehicleBottomSheet} setVehicleType={setVehicleType} setVehicleTypeObjectData={setVehicleTypeObjectData} />
                <AddItemsPhoto orderPhotosBottomSheetRef={orderPhotosBottomSheetRef} setOrderPhotos={setOrderPhotos} setOpenOrderPhotosBottomSheet={setOpenOrderPhotosBottomSheet} />
            </SafeAreaProvider>
        </Modal>
    )
}

export default React.memo(OrderDetailsModal)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    body: {
        flex: 1,
        paddingHorizontal: 15
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
    },
    headerCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingBottom: 15
    },
    closeModalBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center",
    },
    view: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    orderDetailsCont: {
        marginBottom: 10
    },
    labelText: {
         fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
    },
    overlayViewCont: {
        ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)"
    },
    labelDesc: {
        fontSize: FONT_SIZES.sm,
       fontFamily: FONTS.semiBold,
        marginTop: 5,
        color: Colors.text.gray
    },
    inputBox: {
        width: "100%",
        height: 60,
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.black,
        backgroundColor: Colors.boxBackground,
        borderRadius: 10,
        padding: 15,
        letterSpacing: 0.5,
        textAlignVertical: "top"
    },
    textInputCont: {
        marginTop: 10
    },
    viewCont: {
        marginTop: 15
    },
    placeholderText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.boxContPlaceholderText
    },
    addPhotoCont: {
        width: 120,
        height: 120,
        backgroundColor: Colors.boxBackground,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 10
    },
    selectBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 50,
        backgroundColor: Colors.boxBackground,
        borderRadius: 10,
        padding: 15
    },
    specialItemsLabelCont: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: Colors.boxBackground,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
        marginBottom: 10
    },
    specialItemsLabelText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.black,
        letterSpacing: 0.5
    },
    specialLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        marginTop: 10
    },
    recipentMeText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
        marginTop: 5
    },
    mobileTextInputContainer: {
        width: "100%",
        height: 50,
        backgroundColor: Colors.boxBackground,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    mobileCodeCont: {
        height: 50,
        borderRightWidth: 1,
        borderRightColor: Colors.borderColor,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10
    },
    mobileInputCont: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",


    },
    mobileCodeText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.text.gray,
        padding: 5
    },
    mobileTextInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 5,
        fontSize: 16,
        fontWeight: "500",
        color: Colors.text.black,
        letterSpacing: 0.5
    },
    saveOrderDetailsBtn: {
        width: "100%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
        borderRadius: 10
    },
    saveOrderText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.white
    },
    footerCont: {
        padding: 15
    },
    orderDescLength: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 5,
        alignSelf: "flex-end",
        color: Colors.text.gray
    },
    vehicleItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: Colors.boxBackground,
        borderColor: Colors.borderColor,
        padding: 10,
        marginBottom: 10
    },
    textCont: {
        flexShrink: 1,


    },

    imgCont: {
        width: 150,
        height: 120,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    vehicleImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    orderPhotosCont: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10
    },
    compressingImageSpinner: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    orderPhotosImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10
    },
    removeImgBtn: {
        width: 30,
        height: 30,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 10,
        left: 85,
        backgroundColor: "rgba(0,0,0,0.6)"
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
        fontSize: 12,
        fontWeight: "500"
    },

})