import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';


type MerchantInfoNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "MerchantInfo">;
export default function MerchantInfo() {
    const navigation = useNavigation<MerchantInfoNavigationProp>()

     const goToPreviousScreen = ()=>{
        navigation.goBack()
    }
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.body}>
               <Pressable onPress={goToPreviousScreen} style={styles.backBtn}>
                    <Feather name="arrow-left" size={22} color="#111827" />
                </Pressable>
                <View>
                    <View>
                         <Text></Text>
                    </View>
                </View>
        </View>
     
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        padding: 15
    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 40,
        backgroundColor: "#EAEAEA",
        justifyContent: "center",
        alignItems: "center"
    },
})