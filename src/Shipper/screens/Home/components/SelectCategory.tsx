import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { RefObject, useCallback, useMemo, useRef } from 'react'
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font';

type selectCategoryProps = {
    categoryBottomSheetRef: RefObject<BottomSheet | null>
    setOpenCategoryBottomSheet: React.Dispatch<React.SetStateAction<boolean>>
    orderCategory: string
    setOrderCategory: React.Dispatch<React.SetStateAction<string>>
}

type categoriesDataType = {
    iconBackground: string
    name: keyof typeof MaterialCommunityIcons.glyphMap
    icon_color: string
    type: string
    value: string
}

const categoriesData: categoriesDataType[] = [
    {
        iconBackground: "rgba(198, 93, 58, 0.15)",
        name: "wall",
        icon_color: "#C65D3A",
        type: "Building Material",
        value: "cement, blocks, sand, tiles, roofing, wood, etc"
    },
    {
        iconBackground: "rgba(217, 164, 65, 0.15)",
        name: "food",
        icon_color: "#D9A441",
        type: "Food & Beverages",
        value: "Packaged foods, drinks, water, frozen foods, etc"
    },
    {
        iconBackground: "rgba(57, 117, 183, 0.15)",
        name: "monitor",
        icon_color: "#3975B7",
        type: "Electronics",
        value: "TVs, computers, phones, equipment, gadgets, etc."
    },
    {
        iconBackground: "rgba(54, 143, 145, 0.15)",
        name: "home-outline",
        icon_color: "#368F91",
        type: "Household & Personal Items",
        value: "Moving loads, clothes, boxes, kitchen items, etc"
    },
    {
        iconBackground: "rgba(102, 88, 166, 0.15)",
        name: "cog-outline",
        icon_color: "#6658A6",
        type: "Machinery & Equipment",
        value: "Industrial machines, pumps, genrators, tools, etc"
    },
    {
        iconBackground: "rgba(54, 153, 153, 0.15)",
        name: "calendar-star",
        icon_color: "#369999",
        type: "Event & Commercial Equipment",
        value: "Canopies, chairs, tables, sound systems, decorations"
    },
    {
        iconBackground: "rgba(78, 159, 90, 0.15)",
        name: "sofa",
        icon_color: "#4E9F5A",
        type: "Funiture & Appliances",
        value: "Sofas, beds, fridges, tables, generators, etc"
    },
    {
        iconBackground: "rgba(115, 86, 182, 0.15)",
        name: "sprout",
        icon_color: "#7356B6",
        type: "Agricultural Goods",
        value: "Yams, grains, fruits, vegetables, animal feed, etc"
    },
    {
        iconBackground: "rgba(216, 102, 61, 0.15)",
        name: "car",
        icon_color: "#D8663D",
        type: "Automotive",
        value: "Spare parts, tires, batteries, engines, accessories, etc"
    },
    {
        iconBackground: "rgba(200, 88, 131, 0.15)",
        name: "shopping-outline",
        icon_color: "#C85883",
        type: "Retail & Merchandise",
        value: "Shop stock, wholesale goods, market goods, e-commerce"
    },
    {
        iconBackground: "rgba(71, 124, 181, 0.15)",
        name: "factory",
        icon_color: "#477CB5",
        type: "Industrial Materials",
        value: "Steel, metal products, plastics, chemicals, raw materials, etc"
    },
    {
        iconBackground: "rgba(138, 129, 119, 0.15)",
        name: "package-variant-closed",
        icon_color: "#8A8177",
        type: "Other",
        value: "Anything that doesn't fit the above categories"
    }
]

type categoriesItemProps = {
  item: categoriesDataType, 
  setOrderCategory:  React.Dispatch<React.SetStateAction<string>>
  orderCategory: string,
  closeCategoryBottomSheet: ()=> void
}

const CategoryItem = ({ item, orderCategory, setOrderCategory, closeCategoryBottomSheet}: categoriesItemProps) => {
    const selectOrderCategory = ()=>{
       setOrderCategory(item.type);
       closeCategoryBottomSheet();
    }

    return (
        <Pressable onPress={selectOrderCategory} style={[styles.categoryItemCont, { borderWidth: orderCategory == item.type? 2: undefined, borderColor: orderCategory == item.type? Colors.primary: undefined, marginBottom: item.type == "Other" ? 50 : 10 }]}>
            <View style={[styles.iconBackground, { backgroundColor: item.iconBackground }]}>
                <MaterialCommunityIcons name={item.name} size={22} color={item.icon_color} />
            </View>
            <View style={styles.textCont}>
                <Text style={styles.categoryLabelText}>{item.type.toUpperCase()}</Text>
                <Text style={styles.categoryLabelDesc}>{item.value}</Text>
            </View>
        </Pressable>
    )
}

function SelectCategory({ categoryBottomSheetRef, setOpenCategoryBottomSheet, setOrderCategory, orderCategory }: selectCategoryProps) {

    const snapPoints = useMemo(() => ['85%'], []);

    const renderItem = useCallback(({ item }: { item: categoriesDataType }) =>
        <CategoryItem key={`${item.type}`} item={item} setOrderCategory={setOrderCategory} orderCategory={orderCategory} closeCategoryBottomSheet={closeCategoryBottomSheet} />
        ,[orderCategory])

    const closeCategoryBottomSheet = () => {
        categoryBottomSheetRef.current?.close();
        setOpenCategoryBottomSheet(false);
    }



    


    return (

        <BottomSheet
            ref={categoryBottomSheetRef}
            style={styles.container}
            handleStyle={styles.handleStyle}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={() => setOpenCategoryBottomSheet(false)}
            enableDynamicSizing={false}
            enableOverDrag={false}
        >

            <BottomSheetView style={styles.bottomSheetCont}>
                <Pressable onPress={closeCategoryBottomSheet} style={styles.closeModalBtn}>
                    <AntDesign name="close" size={18} color={Colors.text.black} />
                </Pressable>
                <View style={styles.headerCont}>
                    <Text style={styles.headerText}>Select goods category</Text>
                    <Text style={styles.headerDesc}>Choose the category that best describes what you are moving</Text>
                </View>

                <View>
                    <BottomSheetFlatList
                        data={categoriesData}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 100
                        }}

                    />

                </View>
            </BottomSheetView>
        </BottomSheet>


    )
}

export default React.memo(SelectCategory);

const styles = StyleSheet.create({
    container: {
        flex: 1,


    },
    closeModalBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        alignSelf: "flex-end"
    },
    handleStyle: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.boxBackground
    },
    bottomSheetCont: {
        height: "100%",
        backgroundColor: Colors.background,
        paddingHorizontal: 15
    },
    headerCont: {
        marginBottom: 15,
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.bold,
        color: Colors.text.black
    },
    headerDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        marginTop: 5,
        color: Colors.text.gray
    },
    categoryItemCont: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.boxBackground,
        padding: 10,
        borderRadius: 10,
        marginBottom: 10


    },
    iconBackground: {
        width: 40,
        height: 40,
        borderRadius: 40,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    categoryLabelText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
        
    },
    categoryLabelDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray,
        marginTop: 5
    },
    textCont: {
        flexShrink: 1
    }
})