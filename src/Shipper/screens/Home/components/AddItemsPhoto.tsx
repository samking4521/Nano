import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native'
import React, { RefObject, useMemo } from 'react'
import BottomSheet, { BottomSheetScrollView, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors'
import * as ImagePicker from 'expo-image-picker';
import OrderPhotoDesc from './OrderPhotoDesc';
import { CompressToLimit } from '../../../../utils/imageCompressor';
import { orderPhotoObj } from './OrderDetailsModal';

type AddItemsPhotoProps = {
    setOrderPhotos: React.Dispatch<React.SetStateAction<orderPhotoObj[]>>,
    orderPhotosBottomSheetRef: RefObject<BottomSheet | null>
    setOpenOrderPhotosBottomSheet: React.Dispatch<React.SetStateAction<boolean>>


}

let idCounter = 0
const genId = () => `route_${idCounter++}_${Date.now()}`

export default function AddItemsPhoto({ setOrderPhotos, orderPhotosBottomSheetRef, setOpenOrderPhotosBottomSheet }: AddItemsPhotoProps) {
    const snapPoints = useMemo(() => ['85%'], []);

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
            allowsMultipleSelection: true,
            selectionLimit: 3, // caps selection at 5
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
            quality: 0.8,
        });

        if (result.canceled) return null;

        return result.assets[0];
    };

    const handleCamera = async () => {
        try {
            const image = await takePhoto();

            if (!image) {
                 closeOrderPhotosBottomSheet();
                return
            }

            setOrderPhotos((prev) => [...prev, { id: genId(), type: "loading" as const, uri: "" }]);
            closeOrderPhotosBottomSheet();

            const compressedOrderImage = await CompressToLimit(image.uri, {
                maxSizeBytes: 8 * 1024 * 1024,
            });

            console.log("order Image compressed: ", compressedOrderImage);
             setOrderPhotos((prev) => {
                const realImgs = prev.filter((prevImg) => prevImg.type != "loading");
                return [...realImgs,  {
                    id: genId(),
                    type: "uri" as const,
                    uri: compressedOrderImage.uri
                }]
            });
        } catch (error) {
            closeOrderPhotosBottomSheet();

            Alert.alert(
                'Camera Unavailable',
                'Unable to open the camera. Please try again.',
            );

        }


    };

    const handleGallery = async () => {
        try {
            const image = await pickImageFromGallery();
            if (!image) {
                closeOrderPhotosBottomSheet();
                return
            }
            const loadingImages = Array.from({ length: image.length }, (_, i) => ({ id: genId(), type: "loading" as const, uri: "" }))
            setOrderPhotos((prev) => [...prev, ...loadingImages]);
            closeOrderPhotosBottomSheet();

            const compressedImageArr = await Promise.all(
                image.map(async (item) =>
                    CompressToLimit(item.uri, {
                        maxSizeBytes: 2 * 1024 * 1024,
                    })
                )
            );

            console.log("compressed Images: ", compressedImageArr);

            const uriImages = compressedImageArr.map((item) => item.uri);

            const orderPhotos = uriImages.map((uri) => (
                {
                    id: genId(),
                    type: "uri" as const,
                    uri: uri
                }
            ))

            setOrderPhotos((prev) => {
                const realImgs = prev.filter((prevImg) => prevImg.type != "loading");
                return [...realImgs, ...orderPhotos]
            });

        } catch (error) {
            closeOrderPhotosBottomSheet();
            Alert.alert(
                'Gallery Unavailable',
                'Unable to open the gallery. Please try again.',
            );
        }
    };


    const closeOrderPhotosBottomSheet = () => {
        orderPhotosBottomSheetRef.current?.close();
        setOpenOrderPhotosBottomSheet(false);
    }


    return (
        <BottomSheet
            ref={orderPhotosBottomSheetRef}
            style={styles.container}
            handleComponent={() => null}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={closeOrderPhotosBottomSheet}
            enableDynamicSizing={false}
            enableOverDrag={false}
        >
            <BottomSheetView style={styles.bottomSheetCont}>
                <View style={styles.bottomSheetContHeader}>
                    <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={closeOrderPhotosBottomSheet}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>

                <BottomSheetScrollView
                    style={styles.bottomSheetCont}
                    showsVerticalScrollIndicator={false}

                >
                    <View style={styles.bottomSheetViewCont}>
                        <OrderPhotoDesc />
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
            </BottomSheetView>
        </BottomSheet>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomSheetCont: {
        height: "100%",
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
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

})