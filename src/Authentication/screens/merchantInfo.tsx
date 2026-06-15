import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../../Navigation/auth';
import CountryPicker, { CountryCode, Country } from 'react-native-country-picker-modal'


type MerchantInfoNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "MerchantInfo">;

const countryPickerProps = {
    withFilter: true,
    withFlag: true,
    withCountryNameButton: true,
    withAlphaFilter: true,
    withCallingCode: true,
    withEmoji: true,
};

export default function MerchantInfo() {


    const [countryCode, setCountryCode] = useState<CountryCode>('NG')
    const [country, setCountry] = useState<Country | null>(null)
   

    const onSelect = (country: any) => {
        setCountryCode(country.cca2)
        setCountry(country)
    }

    const navigation = useNavigation<MerchantInfoNavigationProp>()

    const goToPreviousScreen = () => {
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
                        <Text>Let's get you ready</Text>
                        <Text>Tell us a little about yourself and start booking pickup trucks in minutes</Text>
                    </View>

                    <View>
                        <View style={{ backgroundColor: "" }}>
                            <Text>Country</Text>
                            <CountryPicker
                                {...countryPickerProps}
                                countryCode={countryCode}
                                onSelect={onSelect}
                                visible
                            />
                        </View>
                        <View>
                            <Text></Text>
                        </View>
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