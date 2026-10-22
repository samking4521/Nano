import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import LicenseDesc from '../../../../Onboarding/screens/components/licenseDesc'
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { CompressToLimit } from '../../../../utils/imageCompressor';

type UpdateExpiryDatePhotoProps = {
    openRegPhotoPicker: boolean
    setIsImageCompressing: React.Dispatch<React.SetStateAction<boolean>>
    setRegPhoto: React.Dispatch<React.SetStateAction<string | null>>
    setOpenRegPhotoPicker: React.Dispatch<React.SetStateAction<boolean>>
}


export default function UpdateExpiryDatePhoto({ openRegPhotoPicker, setIsImageCompressing, setRegPhoto, setOpenRegPhotoPicker}: UpdateExpiryDatePhotoProps) {
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
            allowsMultipleSelection: undefined,
            allowsEditing: false,
            aspect: undefined,
            quality: 0.8,
        });

        if (result.canceled) {
            return null;
        } else {

            return result.assets

        }

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
            allowsEditing: false,
            aspect: undefined,
            quality: 0.8,
        });

        if (result.canceled) return null;

        return result.assets[0];
    };


    const handleCamera = async () => {

        try {
            const image = await takePhoto();
            setOpenRegPhotoPicker(false);

            if (image) {
                setIsImageCompressing(true)
                const compressedImage = await CompressToLimit(image.uri, {
                    maxSizeBytes: 8 * 1024 * 1024,
                });
                console.log("Compressed Image: ", compressedImage);

                setIsImageCompressing(false)
                setRegPhoto(compressedImage.uri)
            }
        } catch (error) {
            console.log("error mesage: ", error);
            setOpenRegPhotoPicker(false);
        }


    };


    const handleGallery = async () => {

        try {
            const image = await pickImageFromGallery();
            setOpenRegPhotoPicker(false);
            if (image) {
                setIsImageCompressing(true)
                const compressedImage = await CompressToLimit(image[0].uri, {
                    maxSizeBytes: 8 * 1024 * 1024,
                });
                console.log("Compressed Image: ", compressedImage);

                setIsImageCompressing(false)
                setRegPhoto(compressedImage.uri)

            }

        } catch (error) {
            console.log("error mesage: ", error);
            setOpenRegPhotoPicker(false);


        }

    };




    return (
        <BottomSheet
            style={{ flex: 1 }}
            containerStyle={{ backgroundColor: openRegPhotoPicker ? "rgba(0,0,0,0.5)" : undefined }}
            handleIndicatorStyle={{ display: "none" }}
            handleComponent={() => null}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enableContentPanningGesture={false}
        >


            <View style={styles.bottomSheetContHeader}>
                <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={() => setOpenRegPhotoPicker(false)}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>

            <BottomSheetScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                style={styles.bottomSheetCont}
                showsVerticalScrollIndicator={false}

            >
                <View style={styles.bottomSheetViewCont}>
                    <LicenseDesc />
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
    )
}

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
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.md
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
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        alignSelf: "flex-end",

    }
})