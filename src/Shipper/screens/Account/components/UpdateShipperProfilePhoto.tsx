import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import * as ImagePicker from 'expo-image-picker';
import { CompressionResult, CompressToLimit } from '../../../../utils/imageCompressor';
import PhotoDesc from '../../../../Onboarding/screens/components/photoDesc';
import { Colors } from '../../../../constants/theme/colors';
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font';
import { uploadToStorage } from '../../../../utils/imageUploader';
import { useAuthStore } from '../../../../Authentication/store/authStore';
import { supabase } from '../../../../lib/supabase';
import { useShipperStore } from '../../../store/ShipperStore';


type UpdateShipperProfilePhotoProps = {
    setShipperImgUrl: React.Dispatch<React.SetStateAction<string | null>>
    setShowPhotoBottomSheet: React.Dispatch<React.SetStateAction<boolean>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>

}


function UpdateShipperProfilePhoto({ setShipperImgUrl, setShowPhotoBottomSheet, setShowLoadingSpinner, setShowErrorAlert }: UpdateShipperProfilePhotoProps) {
    const session = useAuthStore((store) => store.session);
    const setShipperImgKey = useShipperStore((store) => store.setShipperImgKey);
    const shipperImgKeyVersion = useShipperStore((store) => store.shipperImgKeyVersion);
    const setShipperImgKeyVersion = useShipperStore((store) => store.setShipperImgKeyVersion);



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
            allowsEditing: true,
            aspect: [4, 3],
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
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (result.canceled) return null;

        return result.assets[0];
    };






    const updateShipperPhoto = async (path: string, compressedImage: CompressionResult) => {
        await uploadToStorage(
            "shipper-photos",
            path,
            compressedImage.uri
        );


        const { error } = await supabase
            .from('Shipper')
            .update({ profile_photo_key: path })
            .eq('id', session?.user.id)
            .single();

        if (error) {
            throw new Error(`Error updating Shipper: ${error.message}`);
        }

        setShipperImgKey(path);
        setShipperImgKeyVersion(shipperImgKeyVersion + 1);
        setShipperImgUrl(compressedImage.uri);
        setShowLoadingSpinner(false);
    }



    const handleCamera = async () => {

        try {
            const image = await takePhoto();
            closeBottomSheet();

            if (image) {
                setShowLoadingSpinner(true);
                const compressedImage = await CompressToLimit(image.uri, {
                    maxSizeBytes: 2 * 1024 * 1024,
                });

                console.log("compressed Image: ", compressedImage);
                const path = `shipper/${session?.user.id}/shipperImage.jpg`;

                await updateShipperPhoto(path, compressedImage)

            }

        } catch (error) {
            console.log("error mesage: ", error);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);


        }


    };


    const handleGallery = async () => {

        try {
            const image = await pickImageFromGallery();
            closeBottomSheet();
            if (image) {
                setShowLoadingSpinner(true);
                const compressedImage = await CompressToLimit(image[0].uri, {
                    maxSizeBytes: 2 * 1024 * 1024,
                });

                console.log("compressed Image: ", compressedImage);
                const path = `shipper/${session?.user.id}/shipperImage.jpg`;

                await updateShipperPhoto(path, compressedImage)
            }

        } catch (error) {
            console.log("error mesage: ", error);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);

        }

    };

    const closeBottomSheet = () => {
        setShowPhotoBottomSheet(false);
    }




    return (

        <BottomSheet
            style={{ flex: 1 }}
            handleIndicatorStyle={{ display: "none" }}
            handleComponent={() => null}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enableContentPanningGesture={false}
        >


            <View style={styles.bottomSheetContHeader}>
                <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={closeBottomSheet}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>

            <BottomSheetScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                style={styles.bottomSheetCont}
                showsVerticalScrollIndicator={false}

            >
                <View style={styles.bottomSheetViewCont}>
                    <PhotoDesc />
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

export default React.memo(UpdateShipperProfilePhoto);

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