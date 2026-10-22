import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { Ionicons } from '@expo/vector-icons'
import { deleteFileIfExists } from '../../../../utils/deletePhoto'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { supabase } from '../../../../lib/supabase'

type PendingPhotoBottomSheetProps = {
    setShowPendingPhotoBottomSheet: React.Dispatch<React.SetStateAction<boolean>>
    pendingDriverImgUrl: string
    setShowPhotoBottomSheet: React.Dispatch<React.SetStateAction<boolean>>
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    setPendingDriverImgUrl: React.Dispatch<React.SetStateAction<string | null>>
     setPendingDriverImgKey: React.Dispatch<React.SetStateAction<string | null>>
    pendingPhotoIssue: string | undefined
    setPersonalInfoVerificationIssues: (data: any[] | null) => void

}

export default function PendingPhotoBottomSheet({ setShowPendingPhotoBottomSheet, pendingDriverImgUrl, setShowPhotoBottomSheet, setShowLoadingSpinner, setShowErrorAlert, setPendingDriverImgUrl, pendingPhotoIssue, setPersonalInfoVerificationIssues, setPendingDriverImgKey }: PendingPhotoBottomSheetProps) {
    const session = useAuthStore((store) => store.session);
    const snapPoints = useMemo(() => ['90%'], []);


    const deletePendingPhoto = async () => {
        try {
            setShowPendingPhotoBottomSheet(false);
            setShowLoadingSpinner(true);

            const pending_path = `driver/pending/${session?.user.id}`;

            const { data, error } = await supabase.rpc('clear_pending_driver_photo');

            if (error) {
                throw new Error(`Error clearing pending driver photo: ${error.message}`);
            }

            try {
                await deleteFileIfExists("driver-photos", pending_path, "driverImage.jpg", "Pending Driver Photo");
            } catch (e) {
                console.log("Error clearing pending driver photo: ", e);
            }


            if (pendingPhotoIssue) {
                setPersonalInfoVerificationIssues(data.verification_issues);
            }

            setPendingDriverImgKey(null);
            setPendingDriverImgUrl(null);
            setShowLoadingSpinner(false);

        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }
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
            <BottomSheetView style={styles.body}>
                <View style={styles.bottomSheetContHeader}>
                    <TouchableOpacity style={{ alignSelf: "flex-end" }} onPress={() => setShowPendingPhotoBottomSheet(false)}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.pendingPhotoCont}>
                    <Text style={styles.headerText}>Pending Photo</Text>
                    <View style={styles.imageCont}>
                        <Image style={styles.pendingImage} source={{ uri: pendingDriverImgUrl }} />
                    </View>
                    <View style={styles.reviewCont}>
                        <Ionicons name="time-outline" size={20} color={Colors.primary} />
                        <Text style={styles.reviewText}>Under Review</Text>
                    </View>

                    <View style={{ gap: 10 }}>
                        <Text style={styles.reviewTextDesc}>Your photo is currently being reviewed. If approved, it will be updated within 24 hours.</Text>
                        {pendingPhotoIssue && <View style={styles.issueCont}>
                            <Text style={styles.issueText}>{pendingPhotoIssue}</Text>
                        </View>}
                    </View>

                    <TouchableOpacity onPress={() => setShowPhotoBottomSheet(true)} style={[styles.takePhotoBtns, { marginTop: 20 }]}>
                        <Text style={styles.takePhotoBtnText}>Update photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={deletePendingPhoto} style={[styles.takePhotoBtns, { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: undefined }]}>
                        <Text style={[styles.takePhotoBtnText, { color: Colors.primary }]}>Delete photo</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetView>



        </BottomSheet>

    )
}

const styles = StyleSheet.create({
    body: {
        height: "100%"
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
    },
    imageCont: {
        width: 100,
        height: 100,
        borderRadius: BORDER_RADIUS.round
    },
    pendingImage: {
        width: "100%",
        height: "100%",
        borderRadius: BORDER_RADIUS.round,
        resizeMode: "cover"
    },
    pendingPhotoCont: {
        alignItems: "center",
        padding: 15,
        gap: 15
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        color: Colors.text.black,
        fontFamily: FONTS.semiBold
    },
    reviewCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: 10,
        paddingVertical: 5

    },
    reviewText: {
        color: Colors.primary,
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.md
    },
    reviewTextDesc: {
        color: Colors.text.gray,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        textAlign: "center"
    },
    takePhotoBtns: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: 10,
        height: 45,

    },
    takePhotoBtnText: {
        color: Colors.text.white,
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.md
    },
    issueCont: {
        backgroundColor: Colors.errorBackground,
        borderRadius: BORDER_RADIUS.md,
        padding: 5,
        marginBottom: 5,
    },
    issueText: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        color: Colors.error,
        textAlign: "center"
    },
})