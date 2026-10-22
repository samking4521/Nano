import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES, SPACING } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp } from '../../../../Navigation/DriverNavigation'
import AddVehicleModal from '../components/AddVehicleModal'
import React, { useCallback, useEffect, useState } from 'react'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { supabase } from '../../../../lib/supabase'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import NanoLoadingSpinner from '../../../../utils/nanoLoadingSpinner'
import { useDriverStore } from '../../../store/DriverStore'
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder'

const addVehicleImg = require("../../../../../assets/driver/addVehicleImg.png");

interface infoDataInterface {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  desc: string
}

const infoData: infoDataInterface[] = [
  {
    icon: "shield-checkmark-outline",
    label: "Get Verified",
    desc: "Complete your identity and driver verification",
  },
  {
    icon: "person-add-outline",
    label: "Get Assigned",
    desc: "Don't own a vehicle? Wait to be assigned to one by a vehicle owner",
  },
  {
    icon: "add-circle-outline",
    label: "Add Your Vehicle",
    desc: "Own a vehicle? Add it and assign a verified driver to get started",
  },
]

interface verification_obj {
  verification_status: VERIFICATION_STATUS
}



export interface vehicles_data_type {
  id: string
  vehicle_type: string
  vehicle_year: string
  vehicle_capacity: string
  plate_number: string
  url: string
  vehicle_manufacturer: string | null
  vehicle_model: string | null
  Vehicle_Verification: verification_obj,
  Vehicle_Verification_Issues: {
    count: number
  }[],
  Vehicle_Documents: {
    status: VERIFICATION_STATUS
  }[]
}


const VehicleItem = React.memo(({ item, goToVehicleDetails }: { item: vehicles_data_type, goToVehicleDetails: (vehicleId: string) => void }) => {

  const pendingVehicleUpdate = useDriverStore((store) => store.pendingVehicleUpdate);
  const [imageLoading, setImageLoading] = useState(true);
  const issuesCount = (pendingVehicleUpdate?.vehicleDocumentVerificationIssues ?? 0) + (pendingVehicleUpdate?.vehicleInfoVerificationIssues ?? 0);
  const isIssuesMoreThanOne = item.Vehicle_Verification_Issues[0].count > 1 ? true : false;
  const vehicleStatusText = (item.Vehicle_Verification.verification_status === VERIFICATION_STATUS.APPROVED && item.Vehicle_Documents[0].status === VERIFICATION_STATUS.APPROVED) ? "Verified" : item.Vehicle_Verification.verification_status === VERIFICATION_STATUS.REJECTED || item.Vehicle_Documents[0].status === VERIFICATION_STATUS.REJECTED ? `${item.Vehicle_Verification_Issues[0].count} ${isIssuesMoreThanOne ? 'issues' : 'issue'}` : "Pending";
  const isVehicleApproved = item.Vehicle_Verification.verification_status == VERIFICATION_STATUS.APPROVED;
  const vehicleStatusTextColor = (item.Vehicle_Verification.verification_status == VERIFICATION_STATUS.APPROVED && item.Vehicle_Documents[0].status == VERIFICATION_STATUS.APPROVED) ? Colors.green : (item.Vehicle_Verification.verification_status == VERIFICATION_STATUS.REJECTED || item.Vehicle_Documents[0].status == VERIFICATION_STATUS.REJECTED) ? Colors.error : Colors.primary;
  const vehicleStatusBgColor = (item.Vehicle_Verification.verification_status == VERIFICATION_STATUS.APPROVED && item.Vehicle_Documents[0].status == VERIFICATION_STATUS.APPROVED) ? Colors.transparentGreen : (item.Vehicle_Verification.verification_status == VERIFICATION_STATUS.REJECTED || item.Vehicle_Documents[0].status == VERIFICATION_STATUS.REJECTED) ? Colors.errorBackground : Colors.primaryTransparent;
  const vehicleStatusIcon = (item.Vehicle_Verification.verification_status == VERIFICATION_STATUS.APPROVED && item.Vehicle_Documents[0].status == VERIFICATION_STATUS.APPROVED) ? "checkmark-circle" : (item.Vehicle_Verification.verification_status == VERIFICATION_STATUS.REJECTED || item.Vehicle_Documents[0].status == VERIFICATION_STATUS.REJECTED) ? "alert-circle" : "time-outline";


  const updatedVehicleStatusText = (item.id === pendingVehicleUpdate?.vehicleId) && (pendingVehicleUpdate.vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED && pendingVehicleUpdate.vehicleDocumentVerificationStatus === VERIFICATION_STATUS.APPROVED ? "Verified" : pendingVehicleUpdate.vehicleVerificationStatus === VERIFICATION_STATUS.REJECTED || pendingVehicleUpdate.vehicleDocumentVerificationStatus === VERIFICATION_STATUS.REJECTED ? `${issuesCount} ${issuesCount > 1 ? 'issues' : 'issue'}` : "Pending");
  const updatedVehicleStatusTextColor = (item.id === pendingVehicleUpdate?.vehicleId) && (pendingVehicleUpdate.vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED && pendingVehicleUpdate.vehicleDocumentVerificationStatus === VERIFICATION_STATUS.APPROVED ? Colors.green : pendingVehicleUpdate.vehicleVerificationStatus === VERIFICATION_STATUS.REJECTED || pendingVehicleUpdate.vehicleDocumentVerificationStatus === VERIFICATION_STATUS.REJECTED ? Colors.error : Colors.primary);
  const updatedVehicleStatusBgColor = (item.id === pendingVehicleUpdate?.vehicleId) && (pendingVehicleUpdate.vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED && pendingVehicleUpdate.vehicleDocumentVerificationStatus === VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : pendingVehicleUpdate.vehicleVerificationStatus === VERIFICATION_STATUS.REJECTED || pendingVehicleUpdate.vehicleDocumentVerificationStatus === VERIFICATION_STATUS.REJECTED ? Colors.errorBackground : Colors.primaryTransparent);
  const updatedVehicleStatusIcon = (item.id === pendingVehicleUpdate?.vehicleId) && (pendingVehicleUpdate.vehicleVerificationStatus === VERIFICATION_STATUS.APPROVED && pendingVehicleUpdate.vehicleDocumentVerificationStatus === VERIFICATION_STATUS.APPROVED ? "checkmark-circle" : pendingVehicleUpdate.vehicleVerificationStatus === VERIFICATION_STATUS.REJECTED || pendingVehicleUpdate.vehicleDocumentVerificationStatus === VERIFICATION_STATUS.REJECTED ? "alert-circle" : "time-outline");

  const vehicleImgUrl = (item.id === pendingVehicleUpdate?.vehicleId) ? pendingVehicleUpdate.vehicle_url : undefined;
  const vehicleTypeText = (item.id === pendingVehicleUpdate?.vehicleId) ? pendingVehicleUpdate.vehicle_type : undefined;
  const vehicleCapacityText = (item.id === pendingVehicleUpdate?.vehicleId) ? pendingVehicleUpdate.vehicle_capacity : undefined;
  const vehicleYearText = (item.id === pendingVehicleUpdate?.vehicleId) ? pendingVehicleUpdate.vehicle_year : undefined;
  const vehiclePlateNumberText = (item.id === pendingVehicleUpdate?.vehicleId) ? pendingVehicleUpdate.vehicle_plate_number : undefined;


  return (
    <Pressable onPress={() => goToVehicleDetails(item.id)} style={styles.vehicleItemCont}>
      <View style={styles.vehicleImageCont}>
        <Image source={{ uri: vehicleImgUrl ?? item.url }} onLoad={() => setImageLoading(false)} style={styles.vehicleImage} resizeMode="cover" />
        {imageLoading && <ImageLoadingPlaceHolder />}
      </View>
      <View style={styles.vehicleItemLabelCont}>
        <Text style={styles.vehicleLabelText}>{isVehicleApproved ? `${item.vehicle_manufacturer} ${item.vehicle_model}` : vehicleTypeText || item.vehicle_type}</Text>
        <Text style={styles.vehicleInnerLabelText}>{vehicleYearText || item.vehicle_year} &bull; {vehicleCapacityText || item.vehicle_capacity} Ton</Text>
        <Text style={styles.vehiclePlateNumberText}>{vehiclePlateNumberText || item.plate_number}</Text>
      </View>

      <View style={[styles.vehicleStatusCont, { backgroundColor: updatedVehicleStatusBgColor || vehicleStatusBgColor }]}>
        <Ionicons name={updatedVehicleStatusIcon || vehicleStatusIcon} size={18} color={updatedVehicleStatusTextColor || vehicleStatusTextColor} />
        <Text style={[styles.vehicleStatusText, { color: updatedVehicleStatusTextColor || vehicleStatusTextColor }]}>{updatedVehicleStatusText || vehicleStatusText}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />

    </Pressable>
  )
})

export const getVehicleImgUrl = async (vehicleImgKey: string) => {
  const { data: signedImage, error: signedImageError } =
    await supabase.storage
      .from("vehicle-photos")
      .createSignedUrl(vehicleImgKey, 60 * 60);

  if (signedImageError) {
    throw new Error(
      `Error creating vehicle image URL: ${signedImageError.message}`
    );
  }

  const imageUrl = signedImage.signedUrl;
  return imageUrl;
}

export default function Vehicle() {
  const session = useAuthStore((store) => store.session);
  const vehicleId = useDriverStore((store) => store.pendingVehicleUpdate?.vehicleId);
  const setPendingVehicleUpdate = useDriverStore((store) => store.setPendingVehicleUpdate);



  const [vehicles, setVehicles] = useState<vehicles_data_type[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [openAddVehicleModal, setOpenAddVehicleModal] = useState(false);
  const navigation = useNavigation<DriverNavigationProp>();




  const goBack = () => {
    navigation.goBack();
  }

  const openAddVehicleUI = () => {
    setOpenAddVehicleModal(true)
  }


  const goToVehicleDetails = (vehicleId: string) => {
    navigation.navigate("VehicleDetails", { vehicleId: vehicleId, updateVehicles })
  }


  const renderItem = useCallback(({ item }: { item: vehicles_data_type }) => {
    return (
      <VehicleItem item={item} goToVehicleDetails={goToVehicleDetails} />
    )
  }, [vehicleId])



  const updateVehicles = async (vehicles: any[]) => {
        setVehicles(vehicles)
  }



  const getVehicles = async () => {
    try {
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
        console.log("vehicles: ", vehicles);

        const vehicles_data = await Promise.all(
          vehicles.map(async (item) => {
            const vehicleImgUrl = await getVehicleImgUrl(item.Vehicle_Photos.vehicle_photos_keys.key_1);
            return (
              {
                ...item,
                url: vehicleImgUrl
              }
            )
          })
        )

        setPendingVehicleUpdate(undefined)
        setVehicles(vehicles_data)

      } else {
        console.log("no vehicles: ", vehicles);
        setVehicles(vehicles);
      }



      setLoadingStatus(false);
    } catch (error) {
      console.log("Error: ", error);

    }

  }

  useEffect(() => {
    getVehicles();
  }, [])




  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.body}>
      
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
        </Pressable>

        {vehicles.length == 0 ? <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

          <View style={{ marginTop: 15 }}>
            <Text style={styles.headerText}>Vehicle</Text>
          </View>

          <View style={styles.assignVehicleCont}>
            <View style={styles.assignVehicleLabelsCont}>
              <Image source={addVehicleImg} style={styles.addVehicleImage} />
              <View>
                <Text style={styles.noVehicleHeaderText}>You don’t have a vehicle yet</Text>
                <Text style={styles.noVehicleHeaderDesc}>Add your vehicle or get assigned to one to start receiving orders.</Text>
              </View>

              <Pressable onPress={openAddVehicleUI} style={styles.addVehicleBtn}>
                <AntDesign name="plus" size={22} color={Colors.text.white} />
                <Text style={styles.addVehicleText}>Add Vehicle</Text>
              </Pressable>
            </View>

            <View style={styles.infoCont}>
              <Text style={styles.howItWorksText}>How it works</Text>
              <View style={{ gap: 10 }}>
                {
                  infoData.map((item, index) => {
                    const itemNo = index + 1
                    return (
                      <View style={styles.infoFlexCont} key={`${item.label}-${index}`}>
                        <View style={styles.iconCont}>
                          <Ionicons name={item.icon} size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.infoLabelCont}>
                          <Text style={styles.labelText}>{`${itemNo}. ${item.label}`}</Text>
                          <Text style={styles.descText}>{item.desc}</Text>
                        </View>
                      </View>
                    )
                  })
                }
              </View>
            </View>
          </View>
        </ScrollView>
          :
          <View style={{ flex: 1 }}>
            <View style={{ marginTop: 15 }}>
              <Text style={styles.headerText}>Vehicle</Text>
            </View>

            <View style={styles.vehicleCountCont}>
              <Text style={styles.vehicleCountText}>{vehicles.length > 1 ? `${vehicles.length} Vehicles` : `${vehicles.length} Vehicle`}</Text>
            </View>

            <FlatList
              style={{ marginTop: 20 }}
              data={vehicles}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 50, gap: 10 }}
            />

          </View>

        }

      </View>
      {openAddVehicleModal && <AddVehicleModal
        setOpenAddVehicleModal={setOpenAddVehicleModal}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setVehicles={setVehicles}
      />}

      {vehicles.length >= 1 && <Pressable onPress={openAddVehicleUI} style={styles.addBtn}>
        <AntDesign name="plus" size={25} color={Colors.text.white} />
      </Pressable>}

      {loadingStatus &&

        <SafeAreaView style={styles.backgroundCover}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
          </Pressable>

          <View style={{ marginTop: 15 }}>
            <Text style={styles.headerText}>Vehicle</Text>
          </View>

          <View style={styles.fillScreen}>
            <NanoLoadingSpinner />
          </View>
        </SafeAreaView>



      }

      {
        showLoadingSpinner && <View style={styles.fillScreen}>
          <NanoLoadingSpinner />
        </View>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerDesc: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    marginTop: SPACING.xs,
    color: Colors.text.gray,
  },
  assignVehicleCont: {
    flex: 1,
    justifyContent: "center",
  },
  addVehicleImage: {
    width: 200,
    height: 200,
    aspectRatio: 4 / 3,
    resizeMode: "cover"
  },
  assignVehicleLabelsCont: {
    alignItems: "center",
    gap: 20
  },
  noVehicleHeaderText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black,
    textAlign: "center"
  },
  noVehicleHeaderDesc: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: Colors.text.gray,
    textAlign: "center",
    marginTop: 10
  },
  addVehicleBtn: {
    flexDirection: "row",
    width: "100%",
    height: 45,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    gap: 10,
    marginTop: 10
  },
  addVehicleText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: Colors.text.white,
  },
  howItWorksText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black,
  },
  infoFlexCont: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  iconCont: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(244, 108, 3, 0.10)'
  },
  labelText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black,
  },
  descText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: Colors.text.gray,
  },
  infoLabelCont: {
    flexShrink: 1,
    gap: 5
  },
  infoCont: {
    gap: 15,
    marginTop: 20,
    backgroundColor: Colors.primaryTransparent,
    padding: 15,
    borderRadius: BORDER_RADIUS.xl
  },
  vehicleImageCont: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.md

  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.backBtnGray
  },
  vehicleLabelText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black
  },
  vehicleInnerLabelText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: Colors.text.gray
  },
  vehiclePlateNumberText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: Colors.text.gray,
    padding: 5,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: Colors.background
  },
  vehicleStatusCont: {
    marginLeft: "auto",
    alignSelf: "flex-start",
    backgroundColor: Colors.transparentGreen,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,

  },
  vehicleStatusText: {
    color: Colors.green,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium
  },
  vehicleItemCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.text.white,
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    borderWidth: 0.5,
    borderColor: Colors.borderColor

  },
  vehicleItemLabelCont: {
    flexShrink: 1,
    gap: 5,
  },
  vehicleCountCont: {
    backgroundColor: Colors.backBtnGray,
    borderRadius: BORDER_RADIUS.md,
    padding: 5,
    alignSelf: "flex-end",
    marginTop: 20
  },
  vehicleCountText: {
    color: Colors.text.gray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: Colors.primary
  },
  fillScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  backgroundCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    paddingHorizontal: 15
  }

})