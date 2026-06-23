import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { data } from './components/data';
import OnBoardingSwipes from './components/onBoardingSwipes';
import { labelData } from './types';
import { useRef, useState } from 'react';
import { Colors } from '../constants/colors';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootAuthStackParamList } from '../Navigation/auth';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootAuthStackParamList, "Welcome">;
export default function Welcome() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigation = useNavigation<WelcomeScreenNavigationProp>();
    const viewabilityConfig = useRef({
  itemVisiblePercentThreshold: 50,
}).current;

    const onViewableItemsChanged = useRef(
  ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }
).current;

    const renderItem = ({item}: {item: labelData})=>{
        return (
           <OnBoardingSwipes item={item}/>
        )
    }

    const goToAuthScreen = ()=>{
        navigation.navigate("SignUp");
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.body}>
                <View>
                    <FlatList
                    data={data}
                    renderItem={renderItem}
                    horizontal
                    keyExtractor={(_, index) => index.toString()}
                    pagingEnabled
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}  
                    showsHorizontalScrollIndicator={false}
                />
                </View>
                
                <View style={styles.infoCont}>
                    <View style={styles.sliderContainer}>
                        <View style={{...styles.sliderBox, width: currentIndex == 0? 20: 10, backgroundColor: currentIndex == 0? Colors.primary : Colors.text.white}} />
                        <View style={{ ...styles.sliderBox, width: currentIndex == 1? 20: 10, backgroundColor: currentIndex == 1? Colors.primary : Colors.text.white }} />
                        <View style={{ ...styles.sliderBox, width: currentIndex == 2? 20: 10, backgroundColor: currentIndex == 2? Colors.primary : Colors.text.white }} />
                    </View>
                    <Pressable onPress={goToAuthScreen} style={styles.goToSignUp}>
                        <View style={styles.truckBtnIconCont}>
                            <Feather name="truck" size={24} color={Colors.text.white} />
                        </View>
                        <Text style={styles.startedText}>Get Started</Text>
                        <View style={styles.arrowIconsCont}>
                            <MaterialIcons name="arrow-forward-ios" size={20} color="#454545" />
                            <MaterialIcons name="arrow-forward-ios" size={20} color="#616161" style={styles.arrowIcon} />
                            <MaterialIcons name="arrow-forward-ios" size={20} color="#B6B6B6" style={styles.arrowIcon} />
                        </View>
                    </Pressable>


                </View>


            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        backgroundColor: "#030303",
    },

     infoCont: {
        paddingHorizontal: 15,
        justifyContent: "center",
        alignItems: "center",
        flex: 1
    },
    sliderContainer: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    sliderBox: {
        width: 20,
        height: 5,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        marginRight: 5
    },
    truckBtnIconCont: {
        width: 40,
        height: 40,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,
    },
    goToSignUp: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "90%",
        height: 50,
        borderRadius: 50,
        backgroundColor: "#333333",
        color: Colors.text.white,
        marginTop: 20,
        marginBottom: 10,
        padding: 5
    },
    startedText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 14
    },
    arrowIconsCont: {
        flexDirection: "row",
        alignItems: "center"
    },
    innerFooterText: {
        fontSize: 14,
        fontWeight: "bold",
        color: Colors.primary
    },
    arrowIcon: {
         marginLeft: -10
    }
})

