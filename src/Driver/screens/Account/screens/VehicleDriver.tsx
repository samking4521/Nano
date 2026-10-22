import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp, VehicleDriverNavigationRouteProp } from '../../../../Navigation/DriverNavigation'
import { useEffect, useState } from 'react'
import AssignDriver, { driverDetailsType } from '../components/AssignDriver'
import NanoLoadingSpinner from '../../../../utils/nanoLoadingSpinner'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { supabase } from '../../../../lib/supabase'
import ProfilePhotoPlaceholder from '../../../../utils/profilePhotoPlaceholder'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { getVehicleImgUrl } from './Vehicle'


type Props = {
  route: VehicleDriverNavigationRouteProp
}



export default function VehicleDriver({ route }: Props) {
  const session = useAuthStore((store) => store.session);
  const { currentDriver: parentCurrentDriver, onUpdateCurrentDriver, vehicleId, vehicleVerificationStatus, updateVehicles, isVehicleOwner } = route.params;
  const navigation = useNavigation<DriverNavigationProp>();
  const [currentDriver, setCurrentDriver] = useState<driverDetailsType | null>(parentCurrentDriver)
  const [showAssignDriverBottomSheet, setShowAssignDriverBottomSheet] = useState(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [driverImage, setDriverImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [showErrorAlert, setShowErrorAlert] = useState(false);



  const goBack = () => {
    navigation.goBack();
  }


  const updateCurrentDriver = (driverObj: driverDetailsType) => {
    setCurrentDriver(driverObj);
  }


  const getDriverImageUrl = async () => {
    const imgKey = currentDriver?.driver_img_key;

    if (!imgKey) return
    const { data: signedImage, error: signedImageError } =
      await supabase.storage
        .from("driver-photos")
        .createSignedUrl(imgKey, 60 * 60);

    if (signedImageError) {
      throw new Error(
        `Error creating driver image URL: ${signedImageError.message}`
      );
    }

    const imageUrl = signedImage.signedUrl;
    setDriverImage(imageUrl);
  }

  useEffect(() => {
    if (!currentDriver?.driver_img_key) return;
    getDriverImageUrl();
  }, [currentDriver?.driver_img_key])



  const driverVerificationStatusText = currentDriver?.verification_status === VERIFICATION_STATUS.APPROVED ? "Verified" : currentDriver?.verification_status === VERIFICATION_STATUS.PENDING ? "Pending" : "Not verified";
  const driverVerificationStatusTextColor = currentDriver?.verification_status === VERIFICATION_STATUS.APPROVED ? Colors.green : currentDriver?.verification_status === VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.text.gray;
  const driverVerificationStatusBgColor = currentDriver?.verification_status === VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : currentDriver?.verification_status === VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.backBtnGray;

  useEffect(() => {
    if (!showErrorAlert) return;
    const timeoutId = setTimeout(() => {
      setShowErrorAlert(false);
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [showErrorAlert])


  const showInfoAlert = () => {
    Alert.alert(
      'Unassign Driver?',
      'Are you sure you want to unassign this driver? This vehicle will no longer be able to go online until another driver is assigned.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unassign',
          style: 'destructive',
          onPress: unAssignDriver,
        },
      ]
    );
  }

  const getVehiclesData = async (vehicle_id: string) => {
    const { data: vehicles, error } = await supabase
      .from("Vehicle")
      .select(`
           *,
           Vehicle_Verification(verification_status),
          Vehicle_Verification_Issues(count),
           Vehicle_Photos(*),
           Vehicle_Documents(status)
         `)
      .or(`current_driver_id.eq.${session?.user.id},owner_driver_id.eq.${session?.user.id}`);

    if (error) {
      throw new Error(`Error querying vehicles: ${error.message}`);
    }

    const isVehiclesPresent = vehicles.length > 0;

    if (isVehiclesPresent) {
      const filteredVehicles = vehicles.filter((item) => item.id !== vehicle_id);

      const vehicles_data = await Promise.all(
        filteredVehicles.map(async (item) => {
          const vehicleImgUrl = await getVehicleImgUrl(item.Vehicle_Photos.vehicle_photos_keys.key_1);
          return (
            {
              ...item,
              url: vehicleImgUrl
            }
          )
        })
      )

      return vehicles_data

    } else {
      return []
    }
  }

  const unAssignDriver = async () => {
    try {
      setShowLoadingSpinner(true);

      if (isVehicleOwner.current) {

        const { error: unAssignErr } = await supabase
          .from('Vehicle')
          .update({
            current_driver_id: null,
          })
          .eq('id', vehicleId);

        if (unAssignErr) {
          throw new Error(`Error unassigning driver: ${unAssignErr.message}`);
        }

        setCurrentDriver(null);
        onUpdateCurrentDriver(null);
        setShowLoadingSpinner(false);

        Alert.alert(
        'Driver Unassigned Successfully',
        'The driver has been unassigned from this vehicle. The vehicle can no longer go live until a driver is assigned.',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );


      } else {

        const vehicles = await getVehiclesData(vehicleId);

        const { error: unAssignErr } = await supabase.rpc(
          'unassign_vehicle_as_assigned_driver',
          {
            p_vehicle_id: vehicleId,
          }
        );

        if (unAssignErr) {

          throw new Error(`Error unassigning driver: ${unAssignErr.message}`);
        }

        setCurrentDriver(null);
        onUpdateCurrentDriver(null);
        updateVehicles(vehicles);
        setShowLoadingSpinner(false);

        navigation.pop(2);

      }

      

    } catch (e) {
      console.log("Error: ", e);
      setShowLoadingSpinner(false);
      setShowErrorAlert(true);
    }
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
        </Pressable>

        <View style={{ marginVertical: 15 }}>
          <Text style={styles.headerText}>Driver Details</Text>
        </View>

        {currentDriver ? <>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
          >

            <View style={{ gap: 15 }}>
              <View style={styles.driverHeaderLabelCont}>
                <View style={styles.driverImageCont}>
                  {driverImage && <Image source={{ uri: driverImage }} onLoad={() => setImageLoading(false)} style={styles.driverImage} />}
                  {imageLoading && <ProfilePhotoPlaceholder />}
                </View>
                <View style={styles.driverLabelCont}>
                  <Text style={styles.driverName}>{`${currentDriver?.firstname} ${currentDriver?.lastname}`}</Text>
                  <View style={styles.badgeCont}>
                    <View style={[styles.badgeIconCont, { backgroundColor: driverVerificationStatusBgColor }]}>
                      {
                        currentDriver?.verification_status === VERIFICATION_STATUS.APPROVED ?
                          <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
                          :
                          currentDriver?.verification_status === VERIFICATION_STATUS.PENDING ?
                            <Ionicons name="time-outline" size={18} color={Colors.primary} />
                            :
                            <MaterialCommunityIcons name="shield-off" size={18} color={Colors.text.gray} />
                      }

                    </View>

                    <Text style={[styles.badgeText, { color: driverVerificationStatusTextColor, backgroundColor: driverVerificationStatusBgColor }]}>{driverVerificationStatusText}</Text>
                  </View>

                </View>
              </View>

              <View style={styles.cardCont}>

                <View style={styles.driverDetailCont}>
                  <View style={styles.driverInnerLabelCont}>
                    <Text style={styles.driverLabelText}>Mobile</Text>
                  </View>
                  <View style={styles.driverInnerLabelCont}>
                    <Text style={styles.driverLabelInfo}>{currentDriver?.phone}</Text>
                  </View>
                </View>

                <View style={styles.driverDetailCont}>
                  <View style={styles.driverInnerLabelCont}>
                    <Text style={styles.driverLabelText}>Email</Text>
                  </View>
                  <View style={styles.driverInnerLabelCont}>
                    <Text style={styles.driverLabelInfo}>{currentDriver?.email}</Text>
                  </View>
                </View>

                <View style={styles.driverDetailCont}>
                  <View style={styles.driverInnerLabelCont}>
                    <Text style={styles.driverLabelText}>License class</Text>
                  </View>
                  <View style={styles.driverInnerLabelCont}>
                    <Text style={styles.driverLabelInfo}>{currentDriver?.license_class}</Text>
                  </View>
                </View>

              </View>

            </View>

          </ScrollView>


        </>
          :

          <View>
            <View style={styles.verifiedHeaderIconCont}>
              <View style={styles.verifiedInnerHeaderIconCont}>
                <Ionicons name="person" size={50} color={Colors.primary} />
              </View>

            </View>

            <View style={styles.labelCont}>
              <Text style={styles.labelText}>No driver assigned yet</Text>
              <Text style={styles.labelDesc}>Add a driver so this vehicle can go live and operate on Nano.</Text>
            </View>

            <Pressable onPress={() => setShowAssignDriverBottomSheet(true)} style={styles.assignDriverBtn}>
              <Text style={styles.assignDriverText}>Assign Driver</Text>
            </Pressable>

          </View>
        }

      </View>
      {currentDriver && <View style={styles.footerCont}>
        <Pressable onPress={showInfoAlert} style={styles.unassignDriverBtn}>
          <Text style={styles.unassignDriverBtnText}>Unassign driver</Text>
        </Pressable>
      </View>}

      {showAssignDriverBottomSheet && <View style={styles.bottomSheetCoverContainer} />}

      {
        showAssignDriverBottomSheet && <AssignDriver vehicleVerificationStatus={vehicleVerificationStatus} onUpdateCurrentDriver={onUpdateCurrentDriver} updateCurrentDriver={updateCurrentDriver} setShowAssignDriverBottomSheet={setShowAssignDriverBottomSheet} vehicleId={vehicleId} setShowLoadingSpinner={setShowLoadingSpinner} setShowErrorAlert={setShowErrorAlert} />
      }

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
  driverHeaderLabelCont: {
    backgroundColor: Colors.text.white,
    padding: 15,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center"
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
  verifiedHeaderIconCont: {
    width: 120,
    height: 120,
    borderRadius: 120,
    backgroundColor: Colors.primaryTransparent,
    alignSelf: "center"
  },
  verifiedInnerHeaderIconCont: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.round,

  },
  labelCont: {
    gap: 8,
    marginVertical: 20

  },
  labelText: {
    fontSize: FONT_SIZES.lg,
    color: Colors.text.black,
    fontFamily: FONTS.semiBold,
    textAlign: "center"
  },
  labelDesc: {
    fontSize: FONT_SIZES.md,
    color: Colors.text.gray,
    fontFamily: FONTS.medium,
    textAlign: "center"

  },
  assignDriverBtn: {
    marginTop: 15,
    width: "100%",
    height: 45,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  assignDriverText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: Colors.text.white
  },
  driverImageCont: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round
  },
  driverImage: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.round
  },
  driverName: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black,
  },
  driverLabelCont: {
    marginTop: 10,
    alignItems: "center"
  },
  badgeCont: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2
  },
  badgeIconCont: {
    backgroundColor: Colors.transparentGreen,
    width: 30,
    height: 30,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: -8,
    zIndex: 2
  },
  badgeText: {
    backgroundColor: Colors.transparentGreen,
    paddingVertical: 4,
    paddingRight: 4,
    paddingLeft: 10,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: Colors.green,
    zIndex: 1
  },
  driverDetailCont: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverInnerLabelCont: {
    flex: 1,
    alignItems: "flex-start",
    paddingVertical: 10
  },
  driverLabelText: {
    color: Colors.text.gray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  driverLabelInfo: {
    color: Colors.text.black,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  cardCont: {
    backgroundColor: Colors.text.white,
    padding: 15,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 0.5,
    borderColor: Colors.borderColor
  },
  highlightText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black,
  },
  assignedVehicleHeaderCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  assignedVehicleInnerCont: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 15
  },
  vehicleImageCont: {
    width: 100,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: BORDER_RADIUS.md
  },
  vehicleInfoText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: Colors.text.black,
  },
  vehicleInfoDesc: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: Colors.text.gray
  },
  vehicleInfoCont: {
    gap: 5,
    marginRight: "auto"
  },
  currentCont: {
    backgroundColor: Colors.transparentGreen,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm
  },
  currentText: {
    color: Colors.green,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium
  },
  unassignDriverBtn: {
    width: "100%",
    height: 45,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary
  },
  unassignDriverBtnText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: Colors.primary
  },
  vehicleInfoDescIconCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  footerCont: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    paddingHorizontal: 15
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