import { StyleSheet, View, TextInput, Text, Platform, StatusBar, Dimensions, Alert, Pressable, ActivityIndicator, Button } from 'react-native'
import { RefObject, useEffect, useRef, useState } from 'react'
import Svg, { Circle, G } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/colors'
import { AntDesign } from '@expo/vector-icons'
import { useNavigation, usePreventRemove } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { driverStorage } from '../../localStorage/driverStorage'
import { USER_ROLES, VERIFICATION_STATUS } from '../../constants/shared_user'
import { DRIVER_DOCUMENT_TYPE, ONLINE_STATUS } from '../../constants/driver'
import { uploadToStorage } from '../../utils/imageUploader'
import { useAuthStore } from '../../Authentication/store/authStore'
import { vehiclePhotoType } from './components/vehicleInfoModal'
import { SubmitScreenNavigationProp } from '../../Navigation/OnboardingNavigation'
import { deleteFileIfExists } from '../../utils/deletePhoto'
import { uploadUser } from '../../utils/uploadUser'
import { DriverAppNavigationProp } from '../../Navigation/RootNavigation'
import { signUpDataStorage } from '../../localStorage/signUpDataStorage'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

const width = Dimensions.get("window").width;
const radius = (70 / 100 * width) / 2;
const strokeWidth = 10;
const duration = 500;
const max = 100;
const color = Colors.primary;


type loadingState = "initial" | "loading" | "done";
type animationType = "personal" | "identity" | "vehicle";






export default function SubmitScreen() {
  const session = useAuthStore((store) => store.session);
  const [personalInfoUploading, setPersonalInfoUploading] = useState<loadingState | null>("loading");
  const [vehicleInfoUploading, setVehicleInfoUploading] = useState<loadingState | null>("initial");
  const [identityInfoUploading, setIdentityInfoUploading] = useState<loadingState | null>("initial");
  const navigation = useNavigation<SubmitScreenNavigationProp>();
  const driver_navigation = useNavigation<DriverAppNavigationProp>();
  const [isSubmitting, setIsSubmitting] = useState(true);
  const personalInfoValue = useSharedValue(1);
  const vehicleInfoValue = useSharedValue(1);
  const identityInfoValue = useSharedValue(1);
  const animatedValue = useSharedValue(0);
  const controllerRef = useRef<AbortController | null>(null);
  const halfCircle = radius + strokeWidth
  const circleCircumference = 2 * Math.PI * radius


  const ownershipStatus = driverStorage.getString("ownershipStatus");
  console.log("ownership Status is : ", ownershipStatus);

  const uploadDriverPhoto = async (signal: AbortSignal) => {
    const driverImage = driverStorage.getString("driverImage");
    if (!driverImage) {
      console.log("driver photo not found")
      return
    }

    const path = `driver/active/${session?.user.id}/driverImage.jpg`;

    if (signal.aborted) return;
    const imagePath = await uploadToStorage(
      "driver-photos",
      path,
      driverImage
    )
    console.log("path : ", imagePath);
    return imagePath;
  }



  const uploadVehiclePhotos = async (vehicle_id: string, signal: AbortSignal) => {
    const vehiclePhotos = driverStorage.getString("vehiclePhotos");
    if (!vehiclePhotos) {
      console.log("Error: Vehicle photos not found");
      return;
    }

    const vehicleImages: vehiclePhotoType[] = JSON.parse(vehiclePhotos);

    const imagesUriArr = vehicleImages.map((img) => img.uri);
    console.log("imagesUriArr: ", imagesUriArr);

    if (signal.aborted) return;

    const imagePaths = await Promise.all(
      imagesUriArr.map((uri, index) =>
        uploadToStorage(
          "vehicle-photos",
          `vehicle/active/${vehicle_id}/vehiclePhoto_${index + 1}.jpeg`,
          uri
        )
      )
    );

    console.log("paths:", imagePaths);
    return imagePaths

  }

  const uploadVehicleRegistrationCertificatePhoto = async (vehicle_id: string, signal: AbortSignal) => {
    const vehicleLicenseImage = driverStorage.getString("vehicleLicensePhoto");
    if (!vehicleLicenseImage) {
      console.log("vehicle reg certificate photo not found")
      return
    }
    const path = `vehicle/active/${DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE.toLowerCase()}/${vehicle_id}/vehicleLicense.jpeg`;

    if (signal.aborted) return;

    const imagePath = await uploadToStorage(
      "vehicle-documents",
      path,
      vehicleLicenseImage
    )
    console.log("path : ", imagePath);
    return imagePath;
  }

  const uploadDriverVehicle = async (signal: AbortSignal) => {
    if (signal.aborted) return;
    const plate_number = driverStorage.getString("plateNumber");
    const vehicle_year = driverStorage.getString("vehicleYear");
    const vehicle_type = driverStorage.getString("vehicleType");
    const vehicle_capacity = driverStorage.getString("vehicleCapacity");
    const vehicle_reg_expiry_date = driverStorage.getString("vehicleRegExpiryDate");


    const { data: select_vehicle_data, error: select_vehicle_data_err } = await supabase
      .from("Vehicle")
      .select("id")
      .eq("owner_driver_id", session?.user.id)
      .abortSignal(signal)
      .maybeSingle();

    if (select_vehicle_data_err) {
      throw new Error(`Error querying if Vehicle exists: ${select_vehicle_data_err.message}`)
    }

    console.log("Vehicle id: ", select_vehicle_data?.id);

    if (!select_vehicle_data?.id) {
      const { error } = await supabase
        .from("Vehicle")
        .insert({
          owner_driver_id: session?.user.id,
          plate_number: plate_number,
          vehicle_type: vehicle_type,
          vehicle_capacity: vehicle_capacity,
          vehicle_year: vehicle_year,

        }).abortSignal(signal);

      if (error) {
        throw new Error(`Error uploading vehicle info: ${error.message}`)
      }


      console.log("Success: Vehicle info uploaded successfully");

    } else {
      const { error: err_update_vehicle } = await supabase
        .from("Vehicle")
        .update({
          plate_number: plate_number,
          vehicle_type: vehicle_type,
          vehicle_capacity: vehicle_capacity,
          vehicle_year: vehicle_year
        })
        .eq("vehicle_id", select_vehicle_data.id).abortSignal(signal);

      if (err_update_vehicle) {
        throw new Error(`Error updating vehicle info: ${err_update_vehicle.message}`)
      }

      console.log("Success: Vehicle info updated successfully");


    }

    const { data: select_vehicle, error: select_vehicle_err } = await supabase
      .from("Vehicle")
      .select("id")
      .eq("owner_driver_id", session?.user.id)
      .abortSignal(signal)
      .maybeSingle();

    if (select_vehicle_err) {
      throw new Error(`Error querying if Vehicle exists: ${select_vehicle_err.message}`)
    }


    const { data: select_vehicle_verification_data, error: select_vehicle_verification_data_err } = await supabase
      .from("Vehicle_Verification")
      .select("id")
      .eq("vehicle_id", select_vehicle?.id)
      .abortSignal(signal)
      .maybeSingle();


    if (select_vehicle_verification_data_err) {
      throw new Error(`Error querying if Vehicle Verification exists: ${select_vehicle_verification_data_err.message}`)
    }

    if (!select_vehicle_verification_data?.id) {
      const { error: err_vehicle_verification } = await supabase
        .from("Vehicle_Verification")
        .insert({
          vehicle_id: select_vehicle?.id,
          verification_status: VERIFICATION_STATUS.PENDING,
        }).abortSignal(signal);

      if (err_vehicle_verification) {
        throw new Error(`Error uploading Vehicle Verification info: ${err_vehicle_verification.message}`)
      }

      console.log("Success: Vehicle verification info uploaded");
    }

    const { data: select_vehicle_photos_data, error: select_vehicle_photos_data_err } = await supabase
      .from("Vehicle_Photos")
      .select("id")
      .eq("vehicle_id", select_vehicle?.id)
      .abortSignal(signal)
      .maybeSingle();

    if (select_vehicle_photos_data_err) {
      throw new Error(`Error querying if Vehicle Photos exists: ${select_vehicle_photos_data_err.message}`)
    }

    if (!select_vehicle_photos_data?.id) {
      const { error: err_vehicle_photos } = await supabase
        .from("Vehicle_Photos")
        .insert({
          vehicle_id: select_vehicle?.id,
        }).abortSignal(signal)

      if (err_vehicle_photos) {
        throw new Error(`Error uploading vehicle photos: ${err_vehicle_photos.message}`)
      }

      console.log("Success: Vehicle photos uploaded to db");

    }

    const vehicle_img_paths = await uploadVehiclePhotos(select_vehicle?.id, signal);
    
    if (signal.aborted) return;

    if (!vehicle_img_paths || vehicle_img_paths.length === 0) {
      console.log("No vehicle image paths returned");
      return;
    }

    const vehicle_photo_keys_obj = {
      key_1: vehicle_img_paths[0],
      key_2: vehicle_img_paths[1]
    }



    const { error: err_update_vehicle_photos } = await supabase
      .from("Vehicle_Photos")
      .update({ vehicle_photos_keys: vehicle_photo_keys_obj })
      .eq("vehicle_id", select_vehicle?.id).abortSignal(signal);


    if (err_update_vehicle_photos) {
      throw new Error(`Error updating vehicle_photos_keys: ${err_update_vehicle_photos.message}`)
    }

    console.log("Success: vehicle_photos_keys updated successfully in driver photos")


    const { data: select_vehicle_documents_data, error: select_vehicle_documents_data_err } = await supabase
      .from("Vehicle_Documents")
      .select("id")
      .eq("vehicle_id", select_vehicle?.id)
      .abortSignal(signal)
      .maybeSingle();

    if (select_vehicle_documents_data_err) {
      throw new Error(`Error querying if Vehicle Document exists: ${select_vehicle_documents_data_err.message}`)
    }

    if (!select_vehicle_documents_data?.id) {
      const { error: err_vehicle_docs } = await supabase
        .from("Vehicle_Documents")
        .insert({
          vehicle_id: select_vehicle?.id,
          document_type: DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE,
          expiry_date: vehicle_reg_expiry_date,
          document_number: plate_number,
        }).abortSignal(signal)

      if (err_vehicle_docs) {
        throw new Error(`Error uploading vehicle documents - Registration certificate: ${err_vehicle_docs.message}`)
      }

      console.log("Success: Vehicle documents uploaded successfully");

    } else {
      const { error: err_update_vehicle_documents_data } = await supabase
        .from("Vehicle_Documents")
        .update({
          document_number: plate_number,
          expiry_date: vehicle_reg_expiry_date
        })
        .eq("vehicle_id", select_vehicle?.id)
        .eq("document_type", DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE)
        .abortSignal(signal);

      if (err_update_vehicle_documents_data) {
        throw new Error(`Error updating vehicle documents - Registration certificate: ${err_update_vehicle_documents_data.message}`)
      }

      console.log("Success: Vehicle documents updated successfully");
    }

    const imagePath = await uploadVehicleRegistrationCertificatePhoto(select_vehicle?.id, signal);
    if (signal.aborted) return;

    const { error: err_update_vehicle_documents } = await supabase
      .from("Vehicle_Documents")
      .update({ document_img_key: imagePath })
      .eq("vehicle_id", select_vehicle?.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE)
      .abortSignal(signal);

    if (err_update_vehicle_documents) {
      throw new Error(`Error updating document_img_key in Vehicle_Documents: ${err_update_vehicle_documents}`)
    }


    console.log("Success: Updated document_img_key in Vehicle Documents");

    const { error: err_user } = await supabase
      .from("User")
      .update({ has_driver_profile: true })
      .eq("id", session?.user.id)
      .abortSignal(signal)


    if (err_user) {
      throw new Error(`Error updating User with key - has_driver_profile: ${err_user.message}`)
    }


  }





  const uploadDriverInfo = async (signal: AbortSignal) => {
     if (signal.aborted) return;
    const firstname = driverStorage.getString("firstname");
    const lastname = driverStorage.getString("lastname");
    const birthday = driverStorage.getString("dob");

    const { data: select_driver_data, error: select_driver_data_err } = await supabase
      .from("Driver")
      .select("id")
      .eq("id", session?.user.id)
      .abortSignal(signal)
      .maybeSingle();

    if (select_driver_data_err) {
      throw new Error(`Error querying if Driver exists: ${select_driver_data_err.message}`)
    }

    console.log("Driver id: ", select_driver_data?.id);

    if (!select_driver_data?.id) {
      const { error } = await supabase
        .from("Driver")
        .insert({
          firstname: firstname,
          lastname: lastname,
          birthday: birthday,
          online_status: ONLINE_STATUS.OFFLINE
        }).abortSignal(signal);

      if (error) {
        throw new Error(`Error uploading driver info: ${error.message}`)
      }

      console.log("Success: Driver info uploaded");
    } else {
      const { error: err_update_driver_info } = await supabase
        .from("Driver")
        .update({
          firstname: firstname,
          lastname: lastname,
          birthday: birthday,
          online_status: ONLINE_STATUS.OFFLINE
        })
        .eq("id", session?.user.id).abortSignal(signal)

      if (err_update_driver_info) {
        throw new Error(`Error updating driver info: ${err_update_driver_info.message}`)
      }

      console.log("Success: Driver info updated");



    }

    const { data: select_driver_verification_data, error: select_driver_verification_data_err } = await supabase
      .from("Driver_Verification")
      .select("driver_id")
      .eq("driver_id", session?.user.id)
      .abortSignal(signal)
      .maybeSingle();

    if (select_driver_verification_data_err) {
      throw new Error(`Error querying if Driver_Verification exists: ${select_driver_verification_data_err.message}`)
    }

    console.log("Driver verification, driver_id: ", select_driver_verification_data?.driver_id);

    if (!select_driver_verification_data?.driver_id) {
      const { error: err_driver_verification } = await supabase
        .from("Driver_Verification")
        .insert({
          driver_id: session?.user.id,
          verification_status: VERIFICATION_STATUS.PENDING,
        }).abortSignal(signal);

      if (err_driver_verification) {
        throw new Error(`Error uploading Driver Verification info: ${err_driver_verification.message}`)
      }

      console.log("Success: Driver verification info uploaded");
    }


    const imagePath = await uploadDriverPhoto(signal);
     if (signal.aborted) return;

    const { error: err_update_Driver } = await supabase
      .from("Driver")
      .update({ driver_img_key: imagePath })
      .eq("id", session?.user.id).abortSignal(signal);

    if (err_update_Driver) {
      throw new Error(`Error updating driver_img_key: ${err_update_Driver.message}`)
    }


  }


  const uploadNINPhoto = async (signal: AbortSignal) => {
    const ninImage = driverStorage.getString("ninImage");
    if (!ninImage) {
      console.log("nin photo not found")
      return
    }
    const path = `driver/active/${DRIVER_DOCUMENT_TYPE.NIN.toLowerCase()}/${session?.user.id}/ninImage.jpg`;

    if (signal.aborted) return;
    const imagePath = await uploadToStorage(
      "driver-documents",
      path,
      ninImage
    )
    console.log("Success: NIN image uploaded")

    return imagePath;
  }

  const uploadNIN = async (signal: AbortSignal) => {
     if (signal.aborted) return;
    const nin = driverStorage.getString("nin");

    const { data: select_driver_nin_data, error: select_driver_nin_data_err } = await supabase
      .from("Driver_Documents")
      .select("driver_id")
      .eq("driver_id", session?.user.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.NIN)
      .abortSignal(signal)
      .maybeSingle();

    if (select_driver_nin_data_err) {
      throw new Error(`Error querying if Driver Documents for NIN exists: ${select_driver_nin_data_err.message}`)
    }

    console.log("Driver Documents NIN, driver_id: ", select_driver_nin_data?.driver_id);

    if (!select_driver_nin_data?.driver_id) {
      const { error } = await supabase
        .from("Driver_Documents")
        .insert({
          document_number: nin,
          document_type: DRIVER_DOCUMENT_TYPE.NIN,
          driver_id: session?.user.id,
          status: VERIFICATION_STATUS.PENDING
        }).abortSignal(signal);

      if (error) {
        throw new Error(`Error uploading Nin data: ${error.message}`)
      }

      console.log("Success: Nin info uploaded");
    } else {
      const { error: err_update_Driver_nin } = await supabase
        .from("Driver_Documents")
        .update({ document_number: nin })
        .eq("driver_id", session?.user.id)
        .eq("document_type", DRIVER_DOCUMENT_TYPE.NIN).abortSignal(signal);

      if (err_update_Driver_nin) {
        throw new Error(`Error updating Nin data: ${err_update_Driver_nin.message}`)
      }

      console.log("Success: Nin info updated");


    }

    const imagePath = await uploadNINPhoto(signal);
     if (signal.aborted) return;

    const { error: err_update_Driver_Documents } = await supabase
      .from("Driver_Documents")
      .update({ document_img_key: imagePath })
      .eq("driver_id", session?.user.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.NIN).abortSignal(signal);


    if (err_update_Driver_Documents) {
      throw new Error(`Error updating document_img_key for NIN: ${err_update_Driver_Documents.message}`)
    }

  }




  const uploadPersonalInfo = async (signal: AbortSignal) => {
    if (!session) return;
    await uploadUser(session, driverStorage, USER_ROLES.DRIVER, signal);
    await uploadDriverInfo(signal);
    console.log("Personal info uploaded successfully");
  }

  const uploadDriverLicense = async (signal: AbortSignal) => {
    if (signal.aborted) return;
    const driver_license = driverStorage.getString("driverLicenseNo");
    const driver_license_class = driverStorage.getString("driverLicenseClass");
    const license_expiry = driverStorage.getString("licenseExpiryDate");

    const { data: select_driver_license_data, error: select_driver_license_data_err } = await supabase
      .from("Driver_Documents")
      .select("driver_id")
      .eq("driver_id", session?.user.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE)
      .abortSignal(signal)
      .maybeSingle();

    if (select_driver_license_data_err) {
      throw new Error(`Error querying if Driver Documents for Driver_License exists: ${select_driver_license_data_err.message}`)
    }

    console.log("Driver Documents Driver_License, driver_id: ", select_driver_license_data?.driver_id);

    if (!select_driver_license_data?.driver_id) {
      const { error } = await supabase
        .from("Driver_Documents")
        .insert({
          document_number: driver_license,
          document_type: DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE,
          expiry_date: license_expiry,
          driver_id: session?.user.id,
          status: VERIFICATION_STATUS.PENDING,
          license_class: driver_license_class,
        }).abortSignal(signal)

      if (error) {
        throw new Error(`Error uploading driver license info: ${error.message}`)
      }

      console.log("Success: Driver License info uploaded");
    } else {
      const { error: err_update_Driver_License } = await supabase
        .from("Driver_Documents")
        .update({
          document_number: driver_license,
          expiry_date: license_expiry,
          license_class: driver_license_class
        })
        .eq("driver_id", session?.user.id)
        .eq("document_type", DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE).abortSignal(signal);


      if (err_update_Driver_License) {
        throw new Error(`Error updating driver license info: ${err_update_Driver_License.message}`)
      }

      console.log("Success: Driver License info updated");

    }

    const imagePath = await uploadDriverLicensePhoto(signal);
    if (signal.aborted) return;

    const { error: err_update_Driver_Documents } = await supabase
      .from("Driver_Documents")
      .update({ document_img_key: imagePath })
      .eq("driver_id", session?.user.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE).abortSignal(signal);

    if (err_update_Driver_Documents) {
      throw new Error(`Error updating document_img_key for Driver License: ${err_update_Driver_Documents.message}`)
    }


    if (ownershipStatus == "HIRED") {

      const { data: select_vehicle, error: select_vehicle_err } = await supabase
        .from("Vehicle")
        .select("id")
        .eq("owner_driver_id", session?.user.id)
        .abortSignal(signal)
        .maybeSingle();

      if (select_vehicle_err) {
        throw new Error(`Error querying if Vehicle exists for HIRED driver: ${select_vehicle_err.message}`)
      }

      if (select_vehicle?.id) {
        await deleteFileIfExists("vehicle-photos", `vehicle/active/${select_vehicle.id}`, "vehiclePhoto_1.jpeg", "Vehicle Photo 1");
        await deleteFileIfExists("vehicle-photos", `vehicle/active/${select_vehicle.id}`, "vehiclePhoto_2.jpeg", "Vehicle Photo 2");
        await deleteFileIfExists("vehicle-documents", `vehicle/active/${DRIVER_DOCUMENT_TYPE.VEHICLE_REGISTRATION_CERTIFICATE.toLowerCase()}/${select_vehicle.id}`, "vehicleLicense.jpeg", "Vehicle Reg Certficate Photo");


        const { error: deleteVehicleError } = await supabase
          .from("Vehicle")
          .delete()
          .eq("owner_driver_id", session?.user.id).abortSignal(signal);

        if (deleteVehicleError) {
          throw new Error(`Error deleting vehicle for HIRED driver: ${deleteVehicleError.message}`);
        }

        console.log("Vehicle deleted successfully");
      }


      const { error: err_user } = await supabase
        .from("User")
        .update({ has_driver_profile: true })
        .eq("id", session?.user.id).abortSignal(signal)


      if (err_user) {
        throw new Error(`Error updating User with key - has_driver_profile: ${err_user.message}`)
      }
    }


  }

  const uploadDriverLicensePhoto = async (signal: AbortSignal) => {
    const driverLicenseImage = driverStorage.getString("driverLicensePhoto");
    if (!driverLicenseImage) {
      console.log("driverLicenseImage photo not found")
      return
    }
    const path = `driver/active/${DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE.toLowerCase()}/${session?.user.id}/driverLicenseImage.jpg`;

    if (signal.aborted) return;

    const imagePath = await uploadToStorage(
      "driver-documents",
      path,
      driverLicenseImage
    )

    console.log("Success: Driver license image uploaded");

    return imagePath;
  }

  const uploadIdentityInfo = async (signal: AbortSignal) => {
    await uploadNIN(signal);
    await uploadDriverLicense(signal);
    console.log("identity info uploaded successfully");
  }

  useEffect(() => {
    submitOnboarding();
  }, [])

  const submitOnboarding = async () => {

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      startAnimation("personal");
       if (controller.signal.aborted) return;
      await uploadPersonalInfo(controller.signal);
      if (controller.signal.aborted) return;
      animateTo(ownershipStatus === "OWNER" ? 30 : 40);
      setPersonalInfoUploading("done");
      stopAnimation("personal");
      startAnimation("identity");
      setIdentityInfoUploading("loading");
       if (controller.signal.aborted) return;
      await uploadIdentityInfo(controller.signal);
      if (controller.signal.aborted) return;
      animateTo(ownershipStatus === "OWNER" ? 55 : 100);
      setIdentityInfoUploading("done");
      stopAnimation("identity");


      if (driverStorage.getString("ownershipStatus") === "HIRED") {
        console.log("Success onboarding hired driver");

        signUpDataStorage.clearAll();
        setIsSubmitting(false);
        requestAnimationFrame(() => {
          driver_navigation.replace("Driver");
          driverStorage.clearAll();
        });

        return;
      }
      startAnimation("vehicle");
      setVehicleInfoUploading("loading");
       if (controller.signal.aborted) return;
      await uploadDriverVehicle(controller.signal);
       if (controller.signal.aborted) return;
      animateTo(100);
      setVehicleInfoUploading("done");
      stopAnimation("vehicle");
      console.log("Success onboarding owner driver");

      signUpDataStorage.clearAll();
      setIsSubmitting(false);
      requestAnimationFrame(() => {
        driver_navigation.replace("Driver");
        driverStorage.clearAll();
      });


    } catch (error) {
       if (controller.signal.aborted) {
                console.log("controller abort error")
                return;
            }
      console.log(error);
      setIsSubmitting(false);
        animateTo(0);
              cancelAnimation(personalInfoValue);
              cancelAnimation(identityInfoValue);
              cancelAnimation(vehicleInfoValue);
              personalInfoValue.value = 1;
              identityInfoValue.value = 1;
              vehicleInfoValue.value = 1;
              setPersonalInfoUploading("initial");
              setIdentityInfoUploading("initial");
              setVehicleInfoUploading("initial");

      Alert.alert(
        "Submission Failed",
        "We couldn't submit your driver information. Please check your internet connection and try again.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              navigation.goBack();
            },
          },
          {
            text: "Retry",
            onPress: () => {
              setIsSubmitting(true);
              animateTo(0);
              cancelAnimation(personalInfoValue);
              cancelAnimation(identityInfoValue);
              cancelAnimation(vehicleInfoValue);
              personalInfoValue.value = 1;
              identityInfoValue.value = 1;
              vehicleInfoValue.value = 1;
              setPersonalInfoUploading("loading");
              setIdentityInfoUploading("initial");
              setVehicleInfoUploading("initial");

              submitOnboarding()
            },
          },
        ]
      );
            
    }

  }



  usePreventRemove(isSubmitting, ({ data }) => {
    Alert.alert(
      "Exit Submission?",
      "Your driver details haven't finished submitting. If you exit now, you'll need to go through this step again.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Exit Anyway",
          style: "destructive",
          onPress: () => {
            controllerRef.current?.abort();
            navigation.dispatch(data.action);
          },
        },
      ]
    );
  });


  // Animated props for the circle stroke dash offset
  const animatedCircleProps = useAnimatedProps(() => {
    const maxPerc = (100 * animatedValue.value) / max
    const strokeDashoffset =
      circleCircumference - (circleCircumference * maxPerc) / 100
    return {
      strokeDashoffset,
    }
  })

  // Animated props for the text input displaying the percentage
  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(animatedValue.value)}%`,
      // TextInput requires `defaultValue` to not be undefined for animatedProps text to work
    } as any
  })


  const animateTo = (val: number) => {
    animatedValue.value =
      withTiming(val, {
        duration,
        easing: Easing.out(Easing.ease),
      })
  }

  const startAnimation = (value: animationType) => {
    if (value == "personal") {
      personalInfoValue.value = withRepeat(
        withTiming(1.05, { duration: 800 }),
        -1,
        true
      );
      return;
    }

    if (value == "vehicle") {
      vehicleInfoValue.value = withRepeat(
        withTiming(1.05, { duration: 800 }),
        -1,
        true
      );
      return;
    }



    if (value == "identity") {
      identityInfoValue.value = withRepeat(
        withTiming(1.05, { duration: 800 }),
        -1,
        true
      );
      return;
    }


  };

  const stopAnimation = (value: animationType) => {
    if (value == "personal") {

      cancelAnimation(personalInfoValue);
      personalInfoValue.value = withTiming(1, { duration: 800 });;
      setPersonalInfoUploading("done");
      return;
    }
    if (value == "vehicle") {
      cancelAnimation(vehicleInfoValue);
      vehicleInfoValue.value = withTiming(1, { duration: 800 });
      setVehicleInfoUploading("done");
      return;
    }
    if (value == "identity") {
      cancelAnimation(identityInfoValue);
      identityInfoValue.value = withTiming(1, { duration: 800 });;
      setIdentityInfoUploading("done");
      return;
    }

  };

  const personalInfoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: personalInfoValue.value }],
    opacity: personalInfoValue.value,
  }));

  const vehicleInfoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: vehicleInfoValue.value }],
    opacity: vehicleInfoValue.value,
  }));

  const identityInfoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: identityInfoValue.value }],
    opacity: identityInfoValue.value,
  }));


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View>
          <Text style={styles.headerText}>Creating your driver account</Text>
          <Text style={styles.headerDesc}>We are uploading your information and making sure everything is ready for verification</Text>
        </View>

        <View style={styles.svgCont}>
          <Svg
            width={radius * 2}
            height={radius * 2}
            viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
          >
            <G rotation="-90" origin={`${halfCircle},${halfCircle}`}>
              {/* Background track circle */}
              <Circle
                cx="50%"
                cy="50%"
                stroke={color}
                strokeWidth={strokeWidth}
                r={radius}
                fill="transparent"
                strokeOpacity={0.2}
              />
              {/* Animated foreground circle */}
              <AnimatedCircle
                animatedProps={animatedCircleProps}
                cx="50%"
                cy="50%"
                stroke={color}
                strokeWidth={strokeWidth}
                r={radius}
                fill="transparent"
                strokeDasharray={circleCircumference}
                strokeLinecap="round"
              />
            </G>
          </Svg>

          {/* Centered percentage text */}
          <AnimatedTextInput
            animatedProps={animatedTextProps}
            underlineColorAndroid="transparent"
            editable={false}
            defaultValue="0%"
            style={[
              StyleSheet.absoluteFillObject,

              styles.animatedText
              ,
            ]}
          />
        </View>

        <View style={{ marginTop: 20 }}>

          <View style={styles.infoCont}>
            {personalInfoUploading == "initial" ? <View style={styles.initialUploadingCont}>
              <Text style={styles.initialUploadingText}>1</Text>
            </View> : personalInfoUploading == "loading" ? <ActivityIndicator size={"small"} color={Colors.primary} style={styles.activityIndicatorStyle} /> :
              <View style={styles.uploadDoneCont}>
                <AntDesign name="check" size={14} color={Colors.text.white} />
              </View>}
            <Animated.Text style={[personalInfoAnimatedStyle, styles.uploadText]}>Uploading personal information</Animated.Text>
          </View >

          <View style={[styles.dividerCont, { backgroundColor: personalInfoUploading == "done" ? Colors.primary : Colors.borderColor }]} />

          <View style={styles.infoCont}>
            {identityInfoUploading == "initial" ? <View style={styles.initialUploadingCont}>
              <Text style={styles.initialUploadingText}>2</Text>
            </View> : identityInfoUploading == "loading" ? <ActivityIndicator size={"small"} color={Colors.primary} style={styles.activityIndicatorStyle} /> :
              <View style={styles.uploadDoneCont}>
                <AntDesign name="check" size={16} color={Colors.text.white} />
              </View>}
            <Animated.Text style={[identityInfoAnimatedStyle, styles.uploadText]}>Uploading Identity Information</Animated.Text>
          </View >

          {ownershipStatus === "OWNER" && <><View style={[styles.dividerCont, { backgroundColor: identityInfoUploading == "done" ? Colors.primary : Colors.borderColor }]} />


            <View style={styles.infoCont}>
              {vehicleInfoUploading == "initial" ? <View style={styles.initialUploadingCont}>
                <Text style={styles.initialUploadingText}>3</Text>
              </View> : vehicleInfoUploading == "loading" ? <ActivityIndicator size={"small"} color={Colors.primary} style={styles.activityIndicatorStyle} /> :
                <View style={styles.uploadDoneCont}>
                  <AntDesign name="check" size={16} color={Colors.text.white} />
                </View>}
              <Animated.Text style={[vehicleInfoAnimatedStyle, styles.uploadText]}>Uploading vehicle Information</Animated.Text>
            </View >
          </>
          }





        </View>

        <Text style={[styles.headerDesc, { marginTop: "auto", marginBottom: 40, color: Colors.primary }]}>Please don't leave until the upload is complete. This usually takes less than a minute.</Text>
      </View>

    </SafeAreaView>

  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS == "ios" ? null : StatusBar.currentHeight,
  },
  body: {
    flex: 1,

    paddingHorizontal: 15
  },

  headerContainer: {
    marginTop: 0
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.black,
    textAlign: "center"

  },
  headerDesc: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
    color: Colors.text.gray,
    textAlign: "center"

  },
  uploadText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
    color: Colors.text.black,


  },
  svgCont: {
    alignSelf: "center", marginVertical: 20
  },
  animatedText: {
    fontSize: radius / 3,
    color: color,
    fontWeight: '900',
    textAlign: 'center',
  },
  infoCont: {
    flexDirection: "row", alignItems: "center"
  },
  initialUploadingCont: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: Colors.borderColor,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center"
  },
  initialUploadingText: {
    fontSize: 14, fontWeight: "500", color: Colors.borderColor
  },
  dividerCont: {
    width: 2,
    backgroundColor: Colors.primary,
    height: 25,
    marginLeft: 10,
    marginVertical: 5
  },
  activityIndicatorStyle: {
    width: 25,
    height: 25,
    borderRadius: 25
  },
  uploadDoneCont: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    width: 25,
    height: 25,
    borderRadius: 25
  }
})