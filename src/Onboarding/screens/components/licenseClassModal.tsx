import { StyleSheet, Text, View, Modal, Platform, StatusBar, FlatList, TouchableOpacity, Pressable } from 'react-native'
import React, { useCallback } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme/colors'
import { AntDesign } from '@expo/vector-icons'
import { FONT_SIZES, FONTS } from '../../../constants/theme/font'

export type licenseClassType = 'CLASS A' | 'CLASS B' | 'CLASS C' | 'CLASS D' | 'CLASS E' | 'CLASS F' | 'CLASS G' | 'CLASS H' | 'CLASS I' | 'CLASS J' | 'CLASS V'
const license_class_arr: licenseClassType[] = [
    'CLASS A',
    'CLASS B',
    'CLASS C',
    'CLASS D',
    'CLASS E',
    'CLASS F',
    'CLASS G',
    'CLASS H',
    'CLASS J',
    'CLASS V'

]

const LicenseClass = ({ item, index, setShowLicenseClassModal, setDriverLicenseClass }: { item: licenseClassType, index: number, setShowLicenseClassModal: React.Dispatch<React.SetStateAction<boolean>>, setDriverLicenseClass: React.Dispatch<React.SetStateAction<string>> }) => {
    const submitLicenseClass = () => {
        setDriverLicenseClass(item)
        setShowLicenseClassModal(false)
    }
    return (
        <Pressable onPress={submitLicenseClass} style={[styles.licenseTextCont, {borderBottomWidth: index == (license_class_arr.length - 1)? undefined: 1}]} key={`${item}-${index}`}>
            <Text style={styles.licenceClassText}>{item}</Text>
        </Pressable>
    )
}

type LicenseClassProps = {
    showLicenseClassModal: boolean,
    setShowLicenseClassModal: React.Dispatch<React.SetStateAction<boolean>>,
    setDriverLicenseClass: React.Dispatch<React.SetStateAction<string>>
}

function LicenseClassModal({ showLicenseClassModal, setShowLicenseClassModal, setDriverLicenseClass }: LicenseClassProps) {

    const renderItem = ({ item, index }: { item: licenseClassType, index: number }) => {
        return <LicenseClass item={item} index={index} setShowLicenseClassModal={setShowLicenseClassModal} setDriverLicenseClass={setDriverLicenseClass} />
    }

    return (
        <Modal visible={showLicenseClassModal} onRequestClose={() => setShowLicenseClassModal(false)} animationType="slide" transparent={true} presentationStyle="fullScreen" >
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>

                    <View style={styles.modalContainer}>
                        <View style={styles.headerTextCont}>
                            <TouchableOpacity style={styles.closeBtnCont} onPress={() => setShowLicenseClassModal(false)}>
                                <AntDesign name="close" size={16} color={Colors.text.white} />
                            </TouchableOpacity>
                            <Text style={styles.selectLicenseText}>Select License Class</Text>
                            <View>
                            </View>
                        </View>

                        <FlatList
                            data={license_class_arr}
                            renderItem={renderItem}

                        />
                    </View>

                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    )
}

export default React.memo(LicenseClassModal)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalContainer: {
        backgroundColor: Colors.background,
        padding: 10,
        borderRadius: 15,
        width: "80%",

    },
    headerTextCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10
    },
    selectLicenseText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
        textAlign: "center"
    },
    closeBtnCont: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 30
    },
    licenseTextCont: {
        paddingVertical: 10,
        borderBottomColor: Colors.borderColor,
        borderBottomWidth: 1
    },
    licenceClassText: {
        fontFamily: FONTS.semiBold,
        color: Colors.text.black,
        fontSize: FONT_SIZES.md
    }
})