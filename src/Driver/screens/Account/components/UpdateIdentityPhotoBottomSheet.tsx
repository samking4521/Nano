import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { identityPhotoType } from '../screens/IdentityInfo'
import * as ImagePicker from 'expo-image-picker';
import { CompressionResult, CompressToLimit } from '../../../../utils/imageCompressor'
import { uploadToStorage } from '../../../../utils/imageUploader'
import NinDesc from '../../../../Onboarding/screens/components/ninDesc'
import LicenseDesc from '../../../../Onboarding/screens/components/licenseDesc'
import { identityInfoVerificationType } from '../screens/Profile'
import { VERIFICATION_ISSUES_FIELD } from '../../../../constants/driver'
import { supabase } from '../../../../lib/supabase'
import { useAuthStore } from '../../../../Authentication/store/authStore'



type IdentityPhotoBottomSheetProps = {
  showPhotoBottomSheet: identityPhotoType | null
  setShowPhotoBottomSheet: React.Dispatch<React.SetStateAction<identityPhotoType | null>>
  setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
  driverLicenseImgPath: React.RefObject<string | null>
  ninImgPath: React.RefObject<string | null>
  setNinImage: React.Dispatch<React.SetStateAction<string>>
  setDriverLicenseImage: React.Dispatch<React.SetStateAction<string>>
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
  identityInfoVerificationIssues: any[] | null
  setIdentityInfoVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
  setNinVerificationStatus: React.Dispatch<React.SetStateAction<identityInfoVerificationType>>
  setDriverLicenseVerificationStatus: React.Dispatch<React.SetStateAction<identityInfoVerificationType>>


}

export default function UpdateIdentityPhotoBottomSheet({ showPhotoBottomSheet, setShowPhotoBottomSheet, setShowLoadingSpinner, driverLicenseImgPath, ninImgPath, setNinImage, setDriverLicenseImage, setShowErrorAlert, identityInfoVerificationIssues, setIdentityInfoVerificationIssues, setDriverLicenseVerificationStatus, setNinVerificationStatus }: IdentityPhotoBottomSheetProps) {
  const snapPoints = useMemo(() => ['90%'], []);


  const ninPhotoIssue = identityInfoVerificationIssues?.find(item => item.field == VERIFICATION_ISSUES_FIELD.NIN_PHOTO);
  const driverLicensePhotoIssue = identityInfoVerificationIssues?.find(item => item.field == VERIFICATION_ISSUES_FIELD.DRIVER_LICENSE_PHOTO);




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



  const updateIdentityPhoto = async (compressedImage: CompressionResult) => {
    if (showPhotoBottomSheet == "nin") {
      if (!ninImgPath.current) return;
      await uploadToStorage(
        "driver-documents",
        ninImgPath.current,
        compressedImage.uri
      );

      if (ninPhotoIssue) {
        const { data, error } = await supabase.rpc('resolve_identity_photo_issue', {
          p_document_type: 'nin',
        });

        if (error) {
          throw new Error(`Error resolving verification issue: ${error.message}`);
        }

        setIdentityInfoVerificationIssues(data.verification_issues);
        setNinVerificationStatus(data.nin_verification_status);
      }

      setNinImage(compressedImage.uri);

    } else {
      if (!driverLicenseImgPath.current) return;
      await uploadToStorage(
        "driver-documents",
        driverLicenseImgPath.current,
        compressedImage.uri
      );

      if (driverLicensePhotoIssue) {
        const { data, error } = await supabase.rpc('resolve_identity_photo_issue', {
          p_document_type: 'license',
        });

        if (error) {
          throw new Error(`Error resolving verification issue: ${error.message}`);
        }

        setIdentityInfoVerificationIssues(data.verification_issues);
        setDriverLicenseVerificationStatus(data.driver_license_verification_status);
      }

      setDriverLicenseImage(compressedImage.uri);
    }

    setShowLoadingSpinner(false);

  }


  const handleCamera = async () => {

    try {
      const image = await takePhoto();
      closeBottomSheet();

      if (image) {
        setShowLoadingSpinner(true);
        const compressedImage = await CompressToLimit(image.uri, {
          maxSizeBytes: 8 * 1024 * 1024,
        });

        console.log("compressed Image: ", compressedImage);
        await updateIdentityPhoto(compressedImage)



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
          maxSizeBytes: 8 * 1024 * 1024,
        });

        console.log("compressed Image: ", compressedImage);
        await updateIdentityPhoto(compressedImage);
      }

    } catch (error) {
      console.log("error mesage: ", error);
      setShowLoadingSpinner(false);
      setShowErrorAlert(true);

    }

  };


  const closeBottomSheet = () => {
    setShowPhotoBottomSheet(null);
  }



  return (
    <BottomSheet
      style={{ flex: 1 }}
      containerStyle={{ backgroundColor: showPhotoBottomSheet ? "rgba(0,0,0,0.5)" : undefined }}
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
          {showPhotoBottomSheet == "nin" ? <NinDesc /> : <LicenseDesc />}
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