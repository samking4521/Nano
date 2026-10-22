import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import * as ImagePicker from 'expo-image-picker';
import { CompressToLimit } from '../../../../utils/imageCompressor'
import VehicleLicenseDesc from '../../../../Onboarding/screens/components/vehicleLicenseDesc'
import { uploadToStorage } from '../../../../utils/imageUploader'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { useDriverStore } from '../../../store/DriverStore'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'



type UpdateVehicleLicensePhotoBottomSheetProps = {
  openVehicleLicensePhoto: boolean
  setOpenVehicleLicensePhoto: React.Dispatch<React.SetStateAction<boolean>>
  setVehicleLicensePhoto: React.Dispatch<React.SetStateAction<string>>
  setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
  regPhotoKey: string
  vehicleId: string
  setVehicleDocumentVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
  onUpdateVehicleDocumentVerificationIssues: (verification_issues: any[] | null) => void
  vehicleDocumentVerificationStatus: VERIFICATION_STATUS | undefined
  setVehicleDocumentVerificationStatus: React.Dispatch<React.SetStateAction<VERIFICATION_STATUS | undefined>>
  onUpdateVehicleDocumentVerificationStatus: (verification_status: VERIFICATION_STATUS) => void
}

export default function UpdateVehicleLicensePhotoBottomSheet({ openVehicleLicensePhoto, setOpenVehicleLicensePhoto, setVehicleLicensePhoto, setShowLoadingSpinner, setShowErrorAlert, regPhotoKey, vehicleId, setVehicleDocumentVerificationIssues, onUpdateVehicleDocumentVerificationIssues, vehicleDocumentVerificationStatus, setVehicleDocumentVerificationStatus, onUpdateVehicleDocumentVerificationStatus }: UpdateVehicleLicensePhotoBottomSheetProps) {
  const pendingVehicleUpdate = useDriverStore((store) => store.pendingVehicleUpdate);
  const setPendingVehicleUpdate = useDriverStore((store) => store.setPendingVehicleUpdate);

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



  const updateVehicleRegPhoto = async (uri: string) => {
    await uploadToStorage(
      "vehicle-documents",
      regPhotoKey,
      uri
    );

    const {
      error: vehicle_verification_issue_delete_error,
    } = await supabase
      .from("Vehicle_Verification_Issues")
      .delete()
      .eq("vehicle_id", vehicleId)
      .eq(
        "field",
        VERIFICATION_ISSUES_FIELD.VEHICLE_REGISTRATION_PHOTO
      );

    if (vehicle_verification_issue_delete_error) {
      throw new Error(
        `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
      );
    }

    const vehicleDocumentIssues = await getVehicleDocsVerificationIssues();

    if (vehicleDocumentIssues.length === 0) {
      const { error } = await supabase
        .from("Vehicle_Documents")
        .update({ status: VERIFICATION_STATUS.PENDING })
        .eq("vehicle_id", vehicleId)

      if (error) {
        throw new Error(`Error updating vehicle document status: ${error.message}`);
      }


      setVehicleDocumentVerificationStatus(VERIFICATION_STATUS.PENDING);
      onUpdateVehicleDocumentVerificationStatus(VERIFICATION_STATUS.PENDING);
      setPendingVehicleUpdate({
        vehicleId: vehicleId,
        vehicleDocumentVerificationStatus: VERIFICATION_STATUS.PENDING,
        vehicleDocumentVerificationIssues: vehicleDocumentIssues.length,
        vehicleVerificationStatus: pendingVehicleUpdate?.vehicleVerificationStatus,
        vehicleInfoVerificationIssues: pendingVehicleUpdate?.vehicleInfoVerificationIssues,
        vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
        vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
        vehicle_year: pendingVehicleUpdate?.vehicle_year,
        vehicle_type: pendingVehicleUpdate?.vehicle_type,
        vehicle_url: pendingVehicleUpdate?.vehicle_url,
      })
    }


  }


  const getVehicleDocsVerificationIssues = async () => {
    const { data: verification_issues_data, error: verification_issues_data_err } = await supabase
      .from("Vehicle_Verification_Issues")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .eq("section", VERIFICATION_ISSUES_SECTION.VEHICLE_DOCS);

    if (verification_issues_data_err) {
      throw new Error(`Error querying Verification Issues: ${verification_issues_data_err.message}`);
    }

    setVehicleDocumentVerificationIssues(verification_issues_data);
    onUpdateVehicleDocumentVerificationIssues(verification_issues_data);
    setPendingVehicleUpdate({
      vehicleId: vehicleId,
      vehicleDocumentVerificationStatus: vehicleDocumentVerificationStatus,
      vehicleDocumentVerificationIssues: verification_issues_data.length,
      vehicleVerificationStatus: pendingVehicleUpdate?.vehicleVerificationStatus,
      vehicleInfoVerificationIssues: pendingVehicleUpdate?.vehicleInfoVerificationIssues,
      vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
      vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
      vehicle_year: pendingVehicleUpdate?.vehicle_year,
      vehicle_type: pendingVehicleUpdate?.vehicle_type,
      vehicle_url: pendingVehicleUpdate?.vehicle_url,
    })

    return verification_issues_data
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
        await updateVehicleRegPhoto(compressedImage.uri)
        setVehicleLicensePhoto(compressedImage.uri)



      }

      setShowLoadingSpinner(false);

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
        await updateVehicleRegPhoto(compressedImage.uri);
        setVehicleLicensePhoto(compressedImage.uri)
      }

      setShowLoadingSpinner(false);

    } catch (error) {
      console.log("error mesage: ", error);
      setShowLoadingSpinner(false);
      setShowErrorAlert(true);

    }

  };


  const closeBottomSheet = () => {
    setOpenVehicleLicensePhoto(false);
  }



  return (
    <BottomSheet
      style={{ flex: 1 }}
      containerStyle={{ backgroundColor: openVehicleLicensePhoto ? "rgba(0,0,0,0.5)" : undefined }}
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
          <VehicleLicenseDesc />
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