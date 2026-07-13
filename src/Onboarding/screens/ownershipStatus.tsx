import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import ProgressLevel from './components/progressLevel'
import { Colors } from '../../constants/colors'
import { useNavigation } from '@react-navigation/native'
import { OwnershipStatusNavigationProp } from '../../Navigation/OnboardingNavigation'


export default function OwnershipStatus() {
    const navigation = useNavigation<OwnershipStatusNavigationProp>();
     const DATA_LEVEL = useRef(2);
        const DETAILS_LEVEL = DATA_LEVEL.current

     const goToPreviousScreen = () => {
        navigation.goBack()
    }


  return (
     <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1, paddingHorizontal: 15, }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}

            >
                <View style={styles.headerContainer}>
                    <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                        <Feather name="arrow-left" size={22} color={Colors.text.black} />
                    </Pressable>
                    <Text style={styles.headerText}>Details</Text>
                    <View style={{ ...styles.backBtn, backgroundColor: undefined }}>
                    </View>
                </View>




                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="never"
                    showsVerticalScrollIndicator={false}
                    style={styles.body}>

                    <ProgressLevel progressLevel={DETAILS_LEVEL} />

                    <View style={styles.infoCont}>
                        <Text style={styles.headerText}>Ownership status</Text>
                    </View>
                </ScrollView>
         </KeyboardAvoidingView>
         </SafeAreaView>
  )
}

const styles = StyleSheet.create({
 container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    body: {
        flex: 1,
        paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight,
    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text.black

    },
   
    infoCont: {
        marginTop: 20
    },
    headerDesc: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 5,
        color: Colors.text.gray,

    },
   
})