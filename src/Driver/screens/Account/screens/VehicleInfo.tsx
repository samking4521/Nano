import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp, VehicleInfoDriverNavigationRouteProp } from '../../../../Navigation/DriverNavigation'
import UpdateVehicleInfoBottomSheet from '../components/UpdateVehicleInfoBottomSheet'
import UpdateVehicleInfoPhotoBottomSheet from '../components/UpdateVehicleInfoPhotoBottomSheet'
import NanoLoadingSpinner from '../../../../utils/nanoLoadingSpinner'
import { vehicleType } from '../../../../../assets/truck_data'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { PENDING_VEHICLE_FRONT_PHOTO_ISSUES_CODE, PENDING_VEHICLE_REG_PHOTO_ISSUES_CODE, PENDING_VEHICLE_SIDE_PHOTO_ISSUES_CODE, VEHICLE_PHOTOS_ISSUES_CODE, VERIFICATION_ISSUES_CODE, VERIFICATION_ISSUES_FIELD } from '../../../../constants/driver'
import VehicleInfoBottomSheet from '../components/VehicleInfoBottomSheet'
import UpdateVehicleColor from '../components/UpdateVehicleColor'
import PendingVehiclePhotoBottomSheet from '../components/PendingVehiclePhotoBottomSheet'
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder'

export interface vehicleImgType {
  url: string
}

export interface pendingVehicleImgType {
  key_1: string | undefined,
  key_2: string | undefined
}



export type vehicleInfoType = "vehicle_capacity" | "plate_number" | "year";
export type vehicleInfoPhotoType = "photo_1" | "photo_2";

type Props = {
  route: VehicleInfoDriverNavigationRouteProp
}


export default function VehicleInfo({ route }: Props) {
  const { vehicle_data, isVehicleOwner, onUpdateVehicle, onUpdateVehicleImg, onUpdatePendingVehicleLicenseImgKey, pending_license_photo_key, vehicleImages, vehicleVerificationStatus: parentVehicleVerificationStatus, vehicleInfoVerificationIssues: parentVehicleInfoVerificationIssues, onUpdateVehicleInfoVerificationIssues, onUpdateVehicleVerificationStatus } = route.params
  const [vehicleVerificationStatus, setVehicleVerificationStatus] = useState<VERIFICATION_STATUS | undefined>(parentVehicleVerificationStatus)
  const [vehicleInfoVerificationIssues, setVehicleInfoVerificationIssues] = useState<any[] | null>(parentVehicleInfoVerificationIssues)
  const [vehicleCapacity, setVehicleCapacity] = useState(vehicle_data.vehicle_capacity);
  const [plateNumber, setPlateNumber] = useState(vehicle_data.plate_number);
  const [year, setYear] = useState(vehicle_data.vehicle_year);
  const [pending_vehicle_color, set_pending_vehicle_color] = useState(vehicle_data.pending_vehicle_color);
  const [pendingLicensePhotoKey, setPendingLicensePhotoKey] = useState(pending_license_photo_key);
  const [pending_vehicle_photos_keys, set_pending_vehicle_photos_keys] = useState<pendingVehicleImgType>(vehicle_data.Vehicle_Photos.pending_vehicle_photos_keys);
  const [openVehicleInfoPhotoBottomSheet, setOpenVehicleInfoPhotoBottomSheet] = useState<vehicleInfoPhotoType | null>(null)
  const [vehiclePhotos, setVehiclePhotos] = useState<vehicleImgType[]>(vehicleImages);
  const [vehicleType, setVehicleType] = useState<vehicleType>(vehicle_data.vehicle_type);
  const [isVehicleBottomSheetOpen, setIsVehicleBottomSheetOpen] = useState<boolean>(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [openEditVehicleInfoBottomSheet, setOpenEditVehicleInfoBottomSheet] = useState<vehicleInfoType | null>(null);
  const [showVehicleColorBottomSheet, setShowVehicleColorBottomSheet] = useState(false);
  const [openPendingVehiclePhotoBottomSheet, setOpenPendingVehiclePhotoBottomSheet] = useState<vehicleInfoPhotoType | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const navigation = useNavigation<DriverNavigationProp>();
  const opacityValue = useSharedValue(0.5);


  const vehicleVerificationStatusText = vehicleVerificationStatus == VERIFICATION_STATUS.APPROVED ? "Verified" : vehicleVerificationStatus == VERIFICATION_STATUS.PENDING ? "Pending" : "Not verified";

  const vehicleVerificationStatusTextColor = vehicleVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.green : vehicleVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.text.gray;

  const vehicleVerificationStatusBgColor = vehicleVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : vehicleVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.backBtnGray;


  const vehicle_photo_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.VEHICLE_PHOTOS);

  const vehicle_photo_issues_code = vehicle_photo_issue ? vehicle_photo_issue.ISSUES_CODE == VEHICLE_PHOTOS_ISSUES_CODE.VEHICLE_FRONT_PHOTO_BLURRY ?
    VERIFICATION_ISSUES_CODE.VEHICLE_FRONT_PHOTO_BLURRY :
    vehicle_photo_issue.ISSUES_CODE == VEHICLE_PHOTOS_ISSUES_CODE.VEHICLE_FRONT_PHOTO_INVALID ?
      VERIFICATION_ISSUES_CODE.VEHICLE_FRONT_PHOTO_INVALID :
      vehicle_photo_issue.ISSUES_CODE == VEHICLE_PHOTOS_ISSUES_CODE.VEHICLE_SIDE_PHOTO_BLURRY ?
        VERIFICATION_ISSUES_CODE.VEHICLE_SIDE_PHOTO_BLURRY :
        vehicle_photo_issue.ISSUES_CODE == VEHICLE_PHOTOS_ISSUES_CODE.VEHICLE_SIDE_PHOTO_INVALID ?
          VERIFICATION_ISSUES_CODE.VEHICLE_SIDE_PHOTO_INVALID :
          vehicle_photo_issue.ISSUES_CODE == VEHICLE_PHOTOS_ISSUES_CODE.VEHICLE_PHOTOS_BLURRY ?
            VERIFICATION_ISSUES_CODE.VEHICLE_PHOTOS_BLURRY :
            VERIFICATION_ISSUES_CODE.VEHICLE_PHOTOS_INVALID : undefined;

  const vehicle_type_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.VEHICLE_TYPE);
  const vehicle_type_issues_code = vehicle_type_issue ? VERIFICATION_ISSUES_CODE.VEHICLE_TYPE_MISMATCH : undefined;

  const vehicle_capacity_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.VEHICLE_CAPACITY);
  const vehicle_capacity_issues_code = vehicle_capacity_issue ? VERIFICATION_ISSUES_CODE.VEHICLE_CAPACITY_MISMATCH : undefined;

  const vehicle_plate_number_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.VEHICLE_PLATE_NUMBER);
  const vehicle_plate_number_issues_code = vehicle_plate_number_issue ? VERIFICATION_ISSUES_CODE.VEHICLE_PLATE_NUMBER_MISMATCH : undefined;

  const vehicle_prod_year_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.VEHICLE_YEAR);
  const vehicle_prod_year_issues_code = vehicle_prod_year_issue ? VERIFICATION_ISSUES_CODE.VEHICLE_YEAR_MISMATCH : undefined;

  const vehicle_pending_color_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_COLOR);
  const vehicle_pending_color_issues_code = vehicle_pending_color_issue ? VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_COLOR : undefined;

  const vehicle_reg_pending_photo_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_PHOTO);
  const vehicle_reg_pending_photo_issues_code = vehicle_reg_pending_photo_issue ? vehicle_reg_pending_photo_issue.ISSUES_CODE == PENDING_VEHICLE_REG_PHOTO_ISSUES_CODE.PENDING_VEHICLE_REGISTRATION_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_REGISTRATION_PHOTO_BLURRY : VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_REGISTRATION_PHOTO_INVALID : undefined;

  const pending_vehicle_front_photo_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_FRONT_PHOTO);
  const pending_vehicle_front_photo_issues_code = pending_vehicle_front_photo_issue ? pending_vehicle_front_photo_issue.ISSUES_CODE == PENDING_VEHICLE_FRONT_PHOTO_ISSUES_CODE.PENDING_VEHICLE_FRONT_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_FRONT_PHOTO_BLURRY : VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_FRONT_PHOTO_INVALID : undefined;

  const pending_vehicle_side_photo_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_SIDE_PHOTO);
  const pending_vehicle_side_photo_issues_code = pending_vehicle_side_photo_issue ? pending_vehicle_side_photo_issue.ISSUES_CODE == PENDING_VEHICLE_SIDE_PHOTO_ISSUES_CODE.PENDING_VEHICLE_SIDE_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_SIDE_PHOTO_BLURRY : VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_SIDE_PHOTO_INVALID : undefined;

  const pending_vehicle_color_issue = vehicleInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_COLOR);
  const pending_vehicle_color_issues_code = pending_vehicle_color_issue? VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_COLOR : undefined
  
  const animatedStyle = useAnimatedStyle(() => (
    {
      opacity: opacityValue.value
    }
  ))


  const goBack = () => {
    navigation.goBack();
  }

  const updateVehicleInfo = (type: vehicleInfoType) => {
    if (vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED) return;
    setOpenEditVehicleInfoBottomSheet(type)
  }

  const openPhotoSheet = (value: vehicleInfoPhotoType) => {
    setOpenVehicleInfoPhotoBottomSheet(value);
  }

  const selectVehicleType = (truck: vehicleType) => {
    setVehicleType(truck);
  }

  const openVehicleTypeBottomSheet = () => {
    if (vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED) return;
    setIsVehicleBottomSheetOpen(true)
  }



  useEffect(() => {
    if (!showErrorAlert) return;
    const timeoutId = setTimeout(() => {
      setShowErrorAlert(false);
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [showErrorAlert])

  const openVehiclePhotoSheet = (index: number) => {
    if (index === 0) {
      if (pending_vehicle_photos_keys.key_1) {
        setOpenPendingVehiclePhotoBottomSheet("photo_1")
      } else {
        openPhotoSheet("photo_1");
      }
    } else {
      if (pending_vehicle_photos_keys.key_2) {
        setOpenPendingVehiclePhotoBottomSheet("photo_2")
      } else {
        openPhotoSheet("photo_2");
      }
    }
  }



  const updateVehicleColor = ()=>{
       if(!isVehicleOwner.current) return;
       setShowVehicleColorBottomSheet(true)
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
        </Pressable>

        <View style={{ marginVertical: 15 }}>
          <Text style={styles.headerText}>Vehicle Information</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >

          <View>

            <View style={styles.headerImageCont}>
              {
                vehiclePhotos.length >= 1 ?
                  vehiclePhotos.map((item, index) => (
                    <View style={styles.vehicleImageCont} key={`${item.url}-${index}`}>
                      <Image source={{ uri: item.url }} onLoad={() => setImageLoading(false)} style={styles.vehicleImage} />
                      {imageLoading && <ImageLoadingPlaceHolder />}
                      {isVehicleOwner.current && <Pressable onPress={() => openVehiclePhotoSheet(index)} style={[styles.cameraIconCont, { backgroundColor: index === 0 ? pending_vehicle_photos_keys.key_1 ? pending_vehicle_front_photo_issues_code ? Colors.error : Colors.primary : Colors.semiBlackBackground : pending_vehicle_photos_keys.key_2 ? pending_vehicle_side_photo_issues_code ? Colors.error : Colors.primary : Colors.semiBlackBackground }]}>
                        <Ionicons name="camera-outline" size={18} color={Colors.text.white} />
                      </Pressable>}
                    </View>
                  ))
                  :
                  Array.from({ length: 2 }, (_, index) => (
                    <Animated.View key={index} style={[styles.vehicleImageCont, { backgroundColor: Colors.backBtnGray }, animatedStyle]} />
                  ))
              }


            </View>
            {vehicle_photo_issue && <View style={styles.issueCont}>
              <Text style={styles.issueText}>{vehicle_photo_issues_code}</Text>
            </View>}
          </View>






          <View style={[styles.sectionCont]}>
            <View style={styles.headerLabelCont}>
              <Text style={styles.labelHeaderText}>Vehicle</Text>
              <View style={[styles.relativeStatusCont, { backgroundColor: vehicleVerificationStatusBgColor }]}>
                {vehicleVerificationStatus == VERIFICATION_STATUS.REJECTED ?
                  <MaterialCommunityIcons name={"shield-off"} size={18} color={vehicleVerificationStatusTextColor} />
                  :
                  vehicleVerificationStatus == VERIFICATION_STATUS.PENDING ?
                    <Ionicons name={"time-outline"} size={18} color={vehicleVerificationStatusTextColor} />
                    :
                    <Ionicons name={"checkmark-circle"} size={18} color={vehicleVerificationStatusTextColor} />

                }
                <Text style={[styles.statusText, { color: vehicleVerificationStatusTextColor }]}>{vehicleVerificationStatusText}</Text>
              </View>
            </View>
            <View style={{ marginVertical: 10 }}>
              <View style={[styles.sectionDetailsCont, { borderTopColor: undefined, borderTopWidth: undefined }]}>
                <Pressable onPress={openVehicleTypeBottomSheet} style={styles.vehicleInfoDetailCont}>
                  <View style={styles.vehicleInfoIconCont}>
                    <Ionicons name="car-outline" size={24} color={Colors.text.gray} />
                  </View>
                  <View style={styles.vehicleInfoLabelDescBox}>
                    <Text style={styles.vehicleInfoLabel}>Vehicle Type</Text>
                    <Text style={styles.vehicleInfoDesc}>{vehicleType}</Text>
                  </View>
                  {vehicleVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />}

                </Pressable>
                {vehicle_type_issue && <View style={styles.issueCont}>
                  <Text style={styles.issueText}>{vehicle_type_issues_code}</Text>
                </View>}
              </View>

              <View style={styles.sectionDetailsCont}>
                <Pressable onPress={() => updateVehicleInfo("vehicle_capacity")} style={styles.vehicleInfoDetailCont}>
                  <View style={styles.vehicleInfoIconCont}>
                    <Ionicons name="scale-outline" size={24} color={Colors.text.gray} />
                  </View>
                  <View style={styles.vehicleInfoLabelDescBox}>
                    <Text style={styles.vehicleInfoLabel}>Vehicle Capacity</Text>
                    <Text style={styles.vehicleInfoDesc}>{vehicleCapacity} tons</Text>
                  </View>
                  {vehicleVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />}

                </Pressable>
                {vehicle_capacity_issue && <View style={styles.issueCont}>
                  <Text style={styles.issueText}>{vehicle_capacity_issues_code}</Text>
                </View>}
              </View>

              <View style={styles.sectionDetailsCont}>
                <Pressable onPress={() => updateVehicleInfo("plate_number")} style={styles.vehicleInfoDetailCont}>
                  <View style={styles.vehicleInfoIconCont}>
                    <Ionicons name="barcode-outline" size={24} color={Colors.text.gray} />
                  </View>
                  <View style={styles.vehicleInfoLabelDescBox}>
                    <Text style={styles.vehicleInfoLabel}>Plate Number</Text>
                    <Text style={styles.vehicleInfoDesc}>{plateNumber}</Text>
                  </View>
                  {vehicleVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />}

                </Pressable>

                {vehicle_plate_number_issue && <View style={styles.issueCont}>
                  <Text style={styles.issueText}>{vehicle_plate_number_issues_code}</Text>
                </View>}

              </View>



              <View style={styles.sectionDetailsCont}>
                <Pressable onPress={() => updateVehicleInfo("year")} style={styles.vehicleInfoDetailCont}>
                  <View style={styles.vehicleInfoIconCont}>
                    <Ionicons name="calendar-outline" size={24} color={Colors.text.gray} />
                  </View>
                  <View style={styles.vehicleInfoLabelDescBox}>
                    <Text style={styles.vehicleInfoLabel}>Production Year</Text>
                    <Text style={styles.vehicleInfoDesc}>{year}</Text>
                  </View>
                  {vehicleVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />}

                </Pressable>

                {vehicle_prod_year_issue && <View style={styles.issueCont}>
                  <Text style={styles.issueText}>{vehicle_prod_year_issues_code}</Text>
                </View>}
              </View>

              {
                vehicleVerificationStatus == VERIFICATION_STATUS.APPROVED &&
                <>
                  <View style={styles.sectionDetailsCont}>
                    <View style={styles.vehicleInfoDetailCont}>
                      <View style={styles.vehicleInfoIconCont}>
                        <Ionicons name="construct-outline" size={24} color={Colors.text.gray} />
                      </View>
                      <View style={styles.vehicleInfoLabelDescBox}>
                        <Text style={styles.vehicleInfoLabel}>Vehicle Model</Text>
                        <Text style={styles.vehicleInfoDesc}>{vehicle_data.vehicle_manufacturer}</Text>
                      </View>
                      {vehicleVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />}

                    </View>
                  </View>


                  <View style={styles.sectionDetailsCont}>
                    <View style={styles.vehicleInfoDetailCont}>
                      <View style={styles.vehicleInfoIconCont}>
                        <Ionicons name="ribbon-outline" size={24} color={Colors.text.gray} />
                      </View>
                      <View style={styles.vehicleInfoLabelDescBox}>
                        <Text style={styles.vehicleInfoLabel}>Vehicle Brand</Text>
                        <Text style={styles.vehicleInfoDesc}>{vehicle_data.vehicle_model}</Text>
                      </View>
                      {vehicleVerificationStatus !== VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />}

                    </View>
                  </View>


                  <Pressable onPress={updateVehicleColor} style={styles.sectionDetailsCont}>
                    <View style={styles.vehicleInfoDetailCont}>
                      <View style={styles.vehicleInfoIconCont}>
                        <Ionicons name="color-palette-outline" size={24} color={Colors.text.gray} />
                      </View>
                      <View style={styles.vehicleInfoLabelDescBox}>
                        <Text style={styles.vehicleInfoLabel}>Vehicle Color</Text>
                        <Text style={styles.vehicleInfoDesc}>{vehicle_data.vehicle_color}</Text>
                      </View>
                      {pending_vehicle_color &&
                        <Ionicons name={pending_vehicle_color_issues_code || vehicle_reg_pending_photo_issues_code? "alert-circle" : "time-outline"} size={18} color={pending_vehicle_color_issues_code || vehicle_reg_pending_photo_issues_code? Colors.error : Colors.primary} style={{ marginRight: 20 }} />
                      }
                     { isVehicleOwner.current && <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />}
                    </View>
                  </Pressable>
                </>
              }
            </View>
          </View>
        </ScrollView>
      </View>
      {(openEditVehicleInfoBottomSheet || showVehicleColorBottomSheet || openPendingVehiclePhotoBottomSheet) && <View style={styles.bottomSheetCoverContainer} />}

      {openEditVehicleInfoBottomSheet && <UpdateVehicleInfoBottomSheet
        openEditVehicleInfoBottomSheet={openEditVehicleInfoBottomSheet}
        setOpenEditVehicleInfoBottomSheet={setOpenEditVehicleInfoBottomSheet}
        vehicleCapacity={vehicleCapacity}
        plateNumber={plateNumber}
        year={year}
        vehicleId={vehicle_data.id}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        setVehicleCapacity={setVehicleCapacity}
        setPlateNumber={setPlateNumber}
        setYear={setYear}
        onUpdateVehicle={onUpdateVehicle}
        setVehicleInfoVerificationIssues={setVehicleInfoVerificationIssues}
        setVehicleVerificationStatus={setVehicleVerificationStatus}
        onUpdateVehicleInfoVerificationIssues={onUpdateVehicleInfoVerificationIssues}
        onUpdateVehicleVerificationStatus={onUpdateVehicleVerificationStatus}
        vehicleVerificationStatus={vehicleVerificationStatus}
      />}



      {isVehicleBottomSheetOpen && <VehicleInfoBottomSheet
        isVehicleBottomSheetOpen={isVehicleBottomSheetOpen}
        setIsVehicleBottomSheetOpen={setIsVehicleBottomSheetOpen}
        selectVehicleType={selectVehicleType}
        parentVehicleType={vehicleType}
        vehicleId={vehicle_data.id}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        onUpdateVehicle={onUpdateVehicle}
        setVehicleVerificationStatus={setVehicleVerificationStatus}
        setVehicleInfoVerificationIssues={setVehicleInfoVerificationIssues}
        onUpdateVehicleInfoVerificationIssues={onUpdateVehicleInfoVerificationIssues}
        onUpdateVehicleVerificationStatus={onUpdateVehicleVerificationStatus}
        vehicleVerificationStatus={vehicleVerificationStatus}

      />}

      {showVehicleColorBottomSheet && <UpdateVehicleColor
        setShowVehicleColorBottomSheet={setShowVehicleColorBottomSheet}
        vehicleId={vehicle_data.id}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        set_pending_vehicle_color={set_pending_vehicle_color}
        pending_vehicle_color={pending_vehicle_color}
        onUpdateVehicle={onUpdateVehicle}
        pendingLicensePhotoKey={pendingLicensePhotoKey}
        setPendingLicensePhotoKey={setPendingLicensePhotoKey}
        vehicle_pending_color_issues_code={vehicle_pending_color_issues_code}
        vehicle_reg_pending_photo_issues_code={vehicle_reg_pending_photo_issues_code}
        onUpdatePendingVehicleLicenseImgKey={onUpdatePendingVehicleLicenseImgKey}
        setVehicleInfoVerificationIssues={setVehicleInfoVerificationIssues}
        onUpdateVehicleInfoVerificationIssues={onUpdateVehicleInfoVerificationIssues}
      />
      }

      {openPendingVehiclePhotoBottomSheet && <PendingVehiclePhotoBottomSheet setOpenPendingVehiclePhotoBottomSheet={setOpenPendingVehiclePhotoBottomSheet}
        pending_vehicle_photos_keys={pending_vehicle_photos_keys}
        openPendingVehiclePhotoBottomSheet={openPendingVehiclePhotoBottomSheet}
        setOpenVehicleInfoPhotoBottomSheet={setOpenVehicleInfoPhotoBottomSheet}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        vehicleId={vehicle_data.id}
        onUpdateVehicle={onUpdateVehicle}
        set_pending_vehicle_photos_keys={set_pending_vehicle_photos_keys}
        pending_vehicle_front_photo_issues_code={pending_vehicle_front_photo_issues_code}
        pending_vehicle_side_photo_issues_code={pending_vehicle_side_photo_issues_code}
        setVehicleInfoVerificationIssues={setVehicleInfoVerificationIssues}
        onUpdateVehicleInfoVerificationIssues={onUpdateVehicleInfoVerificationIssues}

      />}

      {openVehicleInfoPhotoBottomSheet && <UpdateVehicleInfoPhotoBottomSheet
        openVehicleInfoPhotoBottomSheet={openVehicleInfoPhotoBottomSheet}
        setOpenVehicleInfoPhotoBottomSheet={setOpenVehicleInfoPhotoBottomSheet}
        vehiclePhotos={vehiclePhotos}
        setVehiclePhotos={setVehiclePhotos}
        vehicleId={vehicle_data.id}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        onUpdateVehicle={onUpdateVehicle}
        onUpdateVehicleImg={onUpdateVehicleImg}
        set_pending_vehicle_photos_keys={set_pending_vehicle_photos_keys}
        pending_vehicle_photos_keys={pending_vehicle_photos_keys}
        vehicleVerificationStatus={vehicleVerificationStatus}
        setVehicleVerificationStatus={setVehicleVerificationStatus}
        onUpdateVehicleVerificationStatus={onUpdateVehicleVerificationStatus}
        setVehicleInfoVerificationIssues={setVehicleInfoVerificationIssues}
        onUpdateVehicleInfoVerificationIssues={onUpdateVehicleInfoVerificationIssues}
      />}


      {showLoadingSpinner && <Pressable onPress={() => { return }} style={styles.fillScreen}>
        <NanoLoadingSpinner />
      </Pressable>}

      {showErrorAlert && <View style={styles.fillScreen}>
        <View style={styles.errorCont}>
          <Text style={styles.errorText}>Internet connection seems to be offline</Text>
        </View>
      </View>}

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  body: {
    flex: 1,
    paddingHorizontal: 15
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 40,
    backgroundColor: Colors.backBtnGray,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.lg,
    resizeMode: "cover"
  },
  vehicleImageCont: {
    width: "45%",
    height: 140,
    borderRadius: BORDER_RADIUS.md,
  },
  headerImageCont: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around"
  },
  sectionCont: {
    backgroundColor: Colors.text.white,
    padding: 15,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 15,
  },
  labelHeaderText: {
    color: Colors.text.black,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
  },
  vehicleInfoIconCont: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: Colors.backBtnGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  vehicleInfoDetailCont: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleInfoLabel: {
    fontSize: FONT_SIZES.sm,
    color: Colors.text.gray,
    fontFamily: FONTS.medium
  },
  vehicleInfoDesc: {
    marginTop: 2,
    fontSize: FONT_SIZES.md,
    color: Colors.text.black,
    fontFamily: FONTS.medium
  },
  vehicleInfoLabelDescBox: {
    marginRight: "auto"
  },
  headerLabelCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

  },
  relativeStatusCont: {
    backgroundColor: Colors.primaryTransparent,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,

  },
  statusText: {
    color: Colors.primary,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium
  },
  issueCont: {
    backgroundColor: Colors.errorBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: 5,
    marginTop: 5
  },
  issueText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: Colors.error,
  },
  sectionDetailsCont: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.borderColor,
    paddingVertical: 10
  },
  cameraIconCont: {
    position: "absolute",
    top: 10,
    right: 5,
    backgroundColor: Colors.semiBlackBackground,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignSelf: "flex-start"
  },
  bottomSheetCoverContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  fillScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  errorCont: {
    width: "80%",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.xmd
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: Colors.text.white,
    fontFamily: FONTS.regular,
    textAlign: "center"
  },
})