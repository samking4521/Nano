import { Alert, Linking, Platform, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker';
import { RefObject } from 'react';
import { Colors } from '../../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhotoDesc from './photoDesc';
import NinDesc from './ninDesc';
import LicenseDesc from './licenseDesc';

export type photoTypeData = "DriverPhoto" | "DriverLicense" | "NinPhoto" | null;

type photoBottomSheetTypes = {
    bottomSheetRef: RefObject<BottomSheet | null>;
    photoType: photoTypeData;
    setDriverImage?: React.Dispatch<React.SetStateAction<string>>;
    setPhotoType: React.Dispatch<React.SetStateAction<photoTypeData>>;
    setNinImage?: React.Dispatch<React.SetStateAction<string>>;
    setDriverLicense?: React.Dispatch<React.SetStateAction<string>>;
}


function PhotoBottomSheet({ bottomSheetRef, photoType, setDriverImage, setPhotoType, setNinImage, setDriverLicense }: photoBottomSheetTypes) {

    const snapPoints = useMemo(() => ['90%'], []);

    async function pickImageFromGallery() {
        if (Platform.OS === 'ios') {
            const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                if (canAskAgain) {
                    const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (newStatus !== 'granted') return null;
                } else {
                    Alert.alert(
                        'Photos Permission Required',
                        'Please enable photo access in your device settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );
                    return null;
                }
            }
        } else {
            // Android: launch handles the prompt, only intercept if permanently denied
            const { canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (!canAskAgain) {
                Alert.alert(
                    'Photos Permission Required',
                    'Please enable photo access in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
                return null;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: photoType == "DriverPhoto" ? true : undefined,
            aspect: photoType == "DriverPhoto" ? [4, 3] : undefined,
            quality: 0.8,
        });

        return result.canceled ? null : result.assets[0];
    }

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            if (!permission.canAskAgain) {
                Alert.alert(
                    'Camera Permission Required',
                    'Please enable camera access in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
            }
            return null;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: photoType === 'DriverPhoto' ? true : undefined,
            aspect: photoType === 'DriverPhoto' ? [4, 3] : undefined,
            quality: 0.8,
        });

        if (result.canceled) return null;

        return result.assets[0];
    };


    const handleCamera = async () => {
        try {
            const image = await takePhoto();

            if (image) {
                if (photoType == "DriverPhoto" && setDriverImage) {

                    setDriverImage(image.uri);
                    return
                }
                if (photoType == "NinPhoto" && setNinImage) {

                    setNinImage(image.uri);
                    return
                }
                if (photoType == "DriverLicense" && setDriverLicense) {

                    setDriverLicense(image.uri);
                    return
                }

            }

            bottomSheetRef.current?.close();
        } catch (error) {
            Alert.alert(
                'Camera Unavailable',
                'Unable to open the camera. Please try again.',
            );
            bottomSheetRef.current?.close();
            return null
        }


    };

    const handleGallery = async () => {
        try {
            const image = await pickImageFromGallery();

            if (image) {
                if (photoType == "DriverPhoto" && setDriverImage) {

                    setDriverImage(image.uri);
                }
                 if (photoType == "NinPhoto" && setNinImage) {

                    setNinImage(image.uri);
                }
                if (photoType == "DriverLicense" && setDriverLicense) {
                    setDriverLicense(image.uri);
                   
                }


            }
            bottomSheetRef.current?.close();
        } catch (error) {
            Alert.alert(
                'Gallery Unavailable',
                'Unable to open the gallery. Please try again.',
            );
            bottomSheetRef.current?.close();
            return null

        }

    };

    const closeBottomSheet = () => {
        bottomSheetRef.current?.close();
        setPhotoType(null);

    }




    return (
        <>
            {
                photoType ? <Pressable onPress={closeBottomSheet} style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)" }]} /> : null
            }



            <BottomSheet
                ref={bottomSheetRef}
                style={{ flex: 1 }}
                containerStyle={{ backgroundColor: photoType ? "rgba(0,0,0,0.5)" : undefined }}
                handleIndicatorStyle={{ display: "none" }}
                handleComponent={() => null}
                index={-1}
                onClose={closeBottomSheet}
                snapPoints={snapPoints}
                enablePanDownToClose
                enableDynamicSizing={false}
                enableContentPanningGesture={false}
            >



                <TouchableOpacity onPress={closeBottomSheet} style={styles.bottomSheetContHeader}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
                <BottomSheetScrollView
                    style={styles.bottomSheetCont}
                    showsVerticalScrollIndicator={false}

                >
                    <View style={styles.bottomSheetViewCont}>
                        {photoType === "DriverPhoto" ? <PhotoDesc /> : photoType === "NinPhoto"? <NinDesc /> : <LicenseDesc/>}

                        <View style={{ paddingBottom: 50 }}>
                            <TouchableOpacity onPress={handleCamera} style={styles.takePhotoBtns}>
                                <Text style={styles.takePhotoBtnText}>Capture with Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleGallery} style={{ ...styles.takePhotoBtns, marginTop: 20 }}>
                                <Text style={styles.takePhotoBtnText}>Take from gallery</Text>
                            </TouchableOpacity>
                        </View>


                    </View>

                </BottomSheetScrollView>


            </BottomSheet>
        </>


    )
}

export default React.memo(PhotoBottomSheet);

const styles = StyleSheet.create({
    bottomSheetCont: {
        height: "100%",



    },
    bottomSheetViewCont: {
        flex: 1,
        paddingHorizontal: 15,
        marginTop: 15

    },
    takePhotoBtns: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 50,

    },
    takePhotoBtnText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },
    bottomSheetContHeader: {
        paddingHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.borderColor,
        paddingTop: 15,
        paddingBottom: 10
    },
    closeText: {
        color: Colors.text.gray,
        fontWeight: "500",
        fontSize: 15,
        alignSelf: "flex-end",

    }
})