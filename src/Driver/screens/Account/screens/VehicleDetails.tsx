import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp, VehicleDetailsDriverNavigationRouteProp } from '../../../../Navigation/DriverNavigation'
import VehicleDetailsShimmer from '../components/VehicleDetailsShimmer'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { vehicleType } from '../../../../../assets/truck_data'
import { getVehicleImgUrl } from './Vehicle'
import { VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder'
import { driverDetailsType } from '../components/AssignDriver'
import { useAuthStore } from '../../../../Authentication/store/authStore'



const { width } = Dimensions.get("window");
const WIDTH = width - 30;

export interface vehicle_data_type {
  id: string,
  vehicle_type: vehicleType
  vehicle_capacity: string,
  plate_number: string,
  vehicle_year: string
  vehicle_manufacturer: string | null,
  vehicle_model: string | null,
  vehicle_color: string | null,
  pending_plate_number: string | null,
  pending_vehicle_color: string | null,
  Vehicle_Verification: {
    verification_status: VERIFICATION_STATUS
  },
  Vehicle_Photos: {
    pending_vehicle_photos_keys: {
      key_1: string | undefined,
      key_2: string | undefined
    } | null
  },
  Vehicle_Documents: {
    pending_document_img_key: string | null
  }[]
}

export interface vehicle_info_type {
  id: string,
  vehicle_type: vehicleType
  vehicle_capacity: string,
  plate_number: string,
  vehicle_year: string
  vehicle_manufacturer: string | null,
  vehicle_model: string | null,
  vehicle_color: string | null,
  pending_plate_number: string | null,
  pending_vehicle_color: string | null,
  Vehicle_Verification: {
    verification_status: VERIFICATION_STATUS
  },
  Vehicle_Photos: {
    pending_vehicle_photos_keys: {
      key_1: string | undefined,
      key_2: string | undefined
    }
  }
}

export interface vehicle_document_type {
  vehicle_id: string,
  document_number: string,
  document_img_key: string,
  expiry_date: string,
  pending_document_img_key: string | null,
  pending_expiry_date: string | null,
  document_owner_name: string | null,
  model: string | null,
  color: string | null,
  manufacturer: string | null,
}

export interface vehicle_document_data_type {
  vehicle_id: string,
  document_number: string,
  expiry_date: string,
  document_img_key: string,
  document_owner_name: string | null,
  pending_document_img_key: string | null,
  pending_expiry_date: string | null,
  model: string | null,
  color: string | null,
  manufacturer: string | null
}


export type vehicleImgsType = {
  url: string
}

type vehicleImgsProps = {
  item: vehicleImgsType
}

type vehicleHorizontalImgsProps = {
  item: vehicleImgsType
  index: number
  currentIndex: number
}

const VehicleImages = ({ item }: vehicleImgsProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <View style={styles.vehicleImageCont}>
      <Image source={{ uri: item.url }} onLoad={() => setImageLoading(false)} style={styles.vehicleImage} />
      {imageLoading && <ImageLoadingPlaceHolder />}
    </View>
  )
}

type Props = {
  route: VehicleDetailsDriverNavigationRouteProp;
};


export default function VehicleDetails({ route }: Props) {
  const session = useAuthStore((store) => store.session);
  const { vehicleId, updateVehicles } = route.params;
  const [vehicleVerificationStatus, setVehicleVerificationStatus] = useState<VERIFICATION_STATUS | undefined>(undefined)
  const [vehicleDocumentVerificationStatus, setVehicleDocumentVerificationStatus] = useState<VERIFICATION_STATUS | undefined>(undefined)
  const [vehicleInfoVerificationIssues, setVehicleInfoVerificationIssues] = useState<any[] | null>(null)
  const [vehicleDocumentVerificationIssues, setVehicleDocumentVerificationIssues] = useState<any[] | null>(null)
  const navigation = useNavigation<DriverNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [vehicleData, setVehicleData] = useState<vehicle_data_type | null>(null);
  const [vehicleDocumentData, setVehicleDocumentData] = useState<vehicle_document_type | null>(null);
  const [vehicleCurrentDriverData, setVehicleCurrentDriverData] = useState<driverDetailsType | null>(null);
  const [vehicleImages, setVehicleImages] = useState<vehicleImgsType[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const isVehicleOwner = useRef<boolean | null>(null);
  const vehicleImageFlatListRef = useRef<FlatList>(null);
  const pending_license_photo_key = useRef<string | null>(null)




  const isIssuesMoreThanOne = (vehicleInfoVerificationIssues?.length ?? 0) > 1 ? true : false;
  const isDocIssuesMoreThanOne = (vehicleDocumentVerificationIssues?.length ?? 0) > 1 ? true : false;



  const isVehicleApproved = vehicleVerificationStatus == VERIFICATION_STATUS.APPROVED && vehicleDocumentVerificationStatus == VERIFICATION_STATUS.APPROVED

  const vehicleVerificationStatusText = vehicleVerificationStatus == VERIFICATION_STATUS.APPROVED ? "Verified" : vehicleVerificationStatus == VERIFICATION_STATUS.PENDING ? "Pending" : "Not Verified";

  const vehicleVerificationStatusTextColor = vehicleVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.green : vehicleVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.text.gray;

  const vehicleVerificationStatusBgColor = vehicleVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : vehicleVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.backBtnGray;







  const vehicleDocumentStatusText = vehicleDocumentVerificationStatus == VERIFICATION_STATUS.APPROVED ? "Verified" : vehicleDocumentVerificationStatus == VERIFICATION_STATUS.PENDING ? "Pending" : `${vehicleDocumentVerificationIssues?.length} ${isDocIssuesMoreThanOne ? 'issues' : 'issue'}`;

  const vehicleDocumentStatusTextColor = vehicleDocumentVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.green : vehicleDocumentVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.error;

  const vehicleDocumentStatusBgColor = vehicleDocumentVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : vehicleDocumentVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.errorBackground;

  const vehicleDocumentStatusIcon = vehicleDocumentVerificationStatus == VERIFICATION_STATUS.APPROVED ? "checkmark-circle" : vehicleDocumentVerificationStatus == VERIFICATION_STATUS.PENDING ? "time-outline" : "alert-circle";


  const getPendingVehicleLicensePhotoKey = async () => {

    const { data: select_vehicle_documents, error: error_select_vehicle_documents } =
      await supabase
        .from("Vehicle_Documents")
        .select(
          "pending_document_img_key"
        )
        .eq("vehicle_id", vehicleId)
        .maybeSingle();


    if (error_select_vehicle_documents) {
      throw new Error(`Error querying vehicle document: ${error_select_vehicle_documents.message}`);
    }

    pending_license_photo_key.current = select_vehicle_documents?.pending_document_img_key;

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
  }

  const getVehicleInfoVerificationIssues = async () => {
    const { data: verification_issues_data, error: verification_issues_data_err } = await supabase
      .from("Vehicle_Verification_Issues")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .eq("section", VERIFICATION_ISSUES_SECTION.VEHICLE_INFO);

    if (verification_issues_data_err) {
      throw new Error(`Error querying Verification Issues: ${verification_issues_data_err.message}`);
    }

    setVehicleInfoVerificationIssues(verification_issues_data);
  }


  const getVehicleCurrentDriver = async (current_driver_id: string) => {
    if (!current_driver_id) return;

    const { data, error } = await supabase.rpc('find_assigned_driver_by_id', {
      p_driver_id: current_driver_id,
    });

    if (error) {
      throw new Error(`Error querying driver details: ${error.message}`);
    }

    setVehicleCurrentDriverData(data);
  };

  console.log("current driver: ", vehicleCurrentDriverData)


  const getVehicleData = async () => {
    try {
      await Promise.all([
        getVehicleDetails(),
        getVehicleInfoVerificationIssues(),
        getVehicleDocsVerificationIssues(),
        getPendingVehicleLicensePhotoKey(),
      ]);
      setLoadingStatus(false);
    } catch (e) {
      console.log("Error: ", e)
    }
  }

  useEffect(() => {
    getVehicleData();
  }, [vehicleId]);




  const getVehicleDetails = async () => {
    const { data: select_vehicle, error: error_select_vehicle } =
      await supabase
        .from("Vehicle")
        .select(
          "*, Vehicle_Verification(verification_status), Vehicle_Photos(*), Vehicle_Documents(*)"
        )
        .eq("id", vehicleId)
        .maybeSingle();

    if (error_select_vehicle) {
      console.log("error: ", select_vehicle);
      throw new Error(
        `Error querying vehicle details: ${error_select_vehicle.message}`
      );
    }

    console.log("select_vehicle", select_vehicle);

    const isOwnerDriver = select_vehicle.owner_driver_id === session?.user.id;

    isVehicleOwner.current = isOwnerDriver;

    await getVehicleCurrentDriver(select_vehicle.current_driver_id)


    setVehicleData(select_vehicle);

    setVehicleDocumentData(select_vehicle.Vehicle_Documents[0]);

    setVehicleVerificationStatus(
      select_vehicle.Vehicle_Verification.verification_status
    );

    setVehicleDocumentVerificationStatus(
      select_vehicle.Vehicle_Documents[0].status
    );

    const vehicleImgs = await Promise.all(
      Object.values(
        select_vehicle.Vehicle_Photos.vehicle_photos_keys
      ).map(async (key) => ({
        url: await getVehicleImgUrl(key as string),
      }))
    );

    console.log("vehicle images:", vehicleImgs)
    setVehicleImages(vehicleImgs);

  };


  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setCurrentIndex((viewableItems[0].index ?? 0) + 1);
      }
    }
  ).current;


  const goBack = () => {
    navigation.goBack();
  }


  const renderItem = useCallback(({ item }: { item: vehicleImgsType }) => {
    return (
      <VehicleImages item={item} />
    )
  }, [])

  const VehicleHorizontalImages = useCallback(({ item, index, currentIndex }: vehicleHorizontalImgsProps) => {
    const [imageLoading, setImageLoading] = useState(true);

    const itemIndex = index + 1;

    return (
      <Pressable onPress={() => scrollToImage(index)} style={[styles.vehicleHorizontalImageCont, { borderColor: itemIndex == currentIndex ? Colors.primary : undefined, borderWidth: itemIndex == currentIndex ? 2 : undefined }]}>
        <Image source={{ uri: item.url }} onLoad={() => setImageLoading(false)} style={styles.vehicleHorizontalImage} />
        {
          imageLoading && <ImageLoadingPlaceHolder />
        }
      </Pressable>
    )
  }, [currentIndex]);


  const scrollToImage = (index: number) => {
    vehicleImageFlatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const onUpdateVehicle = (vehicleData: any) => {

    setVehicleData((prev) => ({
      ...prev,
      ...vehicleData,
    }));

  }

  const onUpdateVehicleImg = (vehicleImg: vehicleImgsType[]) => {
    setVehicleImages(vehicleImg)
  }

  const onUpdateVehicleVerificationStatus = (verification_status: VERIFICATION_STATUS) => {
    setVehicleVerificationStatus(verification_status)
  }

  const onUpdateVehicleInfoVerificationIssues = (verification_issues: any[] | null) => {
    setVehicleInfoVerificationIssues(verification_issues)
  }

  const onUpdatePendingVehicleLicenseImgKey = (vehicleLicensePhotoKey: string | null) => {
    pending_license_photo_key.current = vehicleLicensePhotoKey
  }

  const navigateToVehicleInfo = () => {
    if (!vehicleData) return
    const vehicle_info = {
      id: vehicleId,
      vehicle_type: vehicleData.vehicle_type,
      vehicle_capacity: vehicleData.vehicle_capacity,
      plate_number: vehicleData.plate_number,
      vehicle_year: vehicleData.vehicle_year,
      vehicle_manufacturer: vehicleData.vehicle_manufacturer,
      vehicle_model: vehicleData.vehicle_model,
      vehicle_color: vehicleData.vehicle_color,
      pending_plate_number: vehicleData.pending_plate_number,
      pending_vehicle_color: vehicleData.pending_vehicle_color,
      Vehicle_Verification: {
        verification_status: vehicleData.Vehicle_Verification.verification_status
      },
      Vehicle_Photos: {
        pending_vehicle_photos_keys: {
          key_1: vehicleData.Vehicle_Photos.pending_vehicle_photos_keys?.key_1,
          key_2: vehicleData.Vehicle_Photos.pending_vehicle_photos_keys?.key_2
        }
      }
    }


    navigation.navigate("VehicleInfo", {
      vehicle_data: vehicle_info,
      isVehicleOwner: isVehicleOwner,
      onUpdateVehicle,
      onUpdateVehicleImg,
      onUpdatePendingVehicleLicenseImgKey,
      pending_license_photo_key: pending_license_photo_key.current,
      vehicleImages: vehicleImages,
      vehicleVerificationStatus: vehicleVerificationStatus,
      vehicleInfoVerificationIssues: vehicleInfoVerificationIssues,
      onUpdateVehicleVerificationStatus,
      onUpdateVehicleInfoVerificationIssues
    });
  }


  const onUpdateCurrentDriver = (driverObj: driverDetailsType | null) => {
    setVehicleCurrentDriverData(driverObj)
  }

  const navigateToVehicleDriver = () => {
    navigation.navigate("VehicleDriver", {
      currentDriver: vehicleCurrentDriverData,
      vehicleId: vehicleId,
      onUpdateCurrentDriver,
      vehicleVerificationStatus: vehicleVerificationStatus,
      updateVehicles,
        isVehicleOwner: isVehicleOwner,
    });
  }


  const onUpdateVehicleDocumentVerificationStatus = (verification_status: VERIFICATION_STATUS) => {
    setVehicleDocumentVerificationStatus(verification_status)
  }

  const onUpdateVehicleDocumentVerificationIssues = (verification_issues: any[] | null) => {
    setVehicleDocumentVerificationIssues(verification_issues)
  }

  const onUpdateVehicleDocuments = (vehicleDocumentsData: any) => {
    setVehicleDocumentData((prev) => ({
      ...prev,
      ...vehicleDocumentsData,
    }));
  }

  const navigateToVehicleRegistration = () => {
    if (!vehicleDocumentData) return;

    const vehicle_document_data = {
      vehicle_id: vehicleDocumentData.vehicle_id,
      document_number: vehicleDocumentData.document_number,
      expiry_date: vehicleDocumentData.expiry_date,
      document_img_key: vehicleDocumentData.document_img_key,
      pending_document_img_key: vehicleDocumentData.pending_document_img_key,
      pending_expiry_date: vehicleDocumentData.pending_expiry_date,
      model: vehicleDocumentData.model,
      color: vehicleDocumentData.color,
      manufacturer: vehicleDocumentData.manufacturer,
      document_owner_name: vehicleDocumentData.document_owner_name
    }

    navigation.navigate("VehicleRegistration", {
      vehicle_document: vehicle_document_data,
       isVehicleOwner: isVehicleOwner,
      vehicle_document_verification_issues: vehicleDocumentVerificationIssues,
      vehicle_document_status: vehicleDocumentVerificationStatus,
      onUpdateVehicleDocumentVerificationStatus,
      onUpdateVehicleDocumentVerificationIssues,
      onUpdateVehicleDocuments
    });
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
        </Pressable>

        <View style={{ marginVertical: 15 }}>
          <Text style={styles.headerText}>Vehicle Details</Text>
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          {
            loadingStatus ? <VehicleDetailsShimmer />
              :
              <View>
                <View>
                  <FlatList
                    ref={vehicleImageFlatListRef}
                    data={vehicleImages}
                    renderItem={renderItem}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    bounces={false}
                    overScrollMode="never"
                  />
                  <View style={styles.vehicleCountCont}>
                    <Text style={styles.vehicleCount}>{`${currentIndex} / ${vehicleImages.length}`}</Text>
                  </View>

                  <View style={[styles.statusCont, { backgroundColor: vehicleVerificationStatusBgColor }]}>
                    {vehicleVerificationStatus == VERIFICATION_STATUS.REJECTED ?

                      <MaterialCommunityIcons name='shield-off' size={18} color={vehicleVerificationStatusTextColor} />
                      :
                      vehicleVerificationStatus == VERIFICATION_STATUS.PENDING ?

                        <Ionicons name='time-outline' size={18} color={vehicleVerificationStatusTextColor} /> :

                        <Ionicons name='checkmark-circle' size={18} color={vehicleVerificationStatusTextColor} />
                    }

                    <Text style={[styles.statusText, { color: vehicleVerificationStatusTextColor }]}>{vehicleVerificationStatusText}</Text>
                  </View>

                </View>

                <View style={{ marginTop: 10 }}>
                  <FlatList
                    data={vehicleImages}
                    renderItem={({ item, index }) => <VehicleHorizontalImages item={item} index={index} currentIndex={currentIndex} />}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    overScrollMode="never"
                    contentContainerStyle={{ gap: 10 }}
                  />
                </View>

                {!isVehicleApproved && ((vehicleVerificationStatus == VERIFICATION_STATUS.REJECTED || vehicleDocumentVerificationStatus == VERIFICATION_STATUS.REJECTED) ?
                  <View style={[styles.infoCont, { backgroundColor: Colors.errorBackground, marginTop: 20 }]}>
                    <View style={[styles.iconCont, { borderRadius: 40, backgroundColor: "#F9D3D3" }]}>
                      <Ionicons name="alert-circle" size={28} color={Colors.error} />
                    </View>
                    <View style={styles.reviewCont}>
                      <Text style={[styles.labelText, { color: Colors.error }]}>Verification Issue Found</Text>
                      <Text style={styles.labelDesc}>There's an issue with the information you submitted. Please review and update it to continue your verification.</Text>
                    </View>
                  </View>
                  :
                  <View style={[styles.infoCont, { backgroundColor: Colors.primaryTransparent, marginTop: 20 }]}>
                    <View style={[styles.iconCont, { borderRadius: 40, backgroundColor: "#FFE4D1" }]}>
                      <Ionicons name="time-outline" size={28} color={Colors.primary} />
                    </View>
                    <View style={styles.reviewCont}>
                      <Text style={[styles.labelText, { color: Colors.primary }]}>Verification in progress</Text>
                      <Text style={styles.labelDesc}>We are reviewing your information. This should be completed within 24 hours.</Text>
                    </View>
                  </View>)}

                <View style={styles.cardSectionCont}>
                  <Pressable onPress={navigateToVehicleInfo} style={styles.sectionCont}>
                    <View style={styles.labelIconCont}>
                      <Ionicons name="document-outline" size={24} color={Colors.text.gray} />
                    </View>
                    <View style={styles.sectionDetailCont}>
                      <Text style={styles.sectionHeaderText}>Vehicle Information</Text>
                      <Text style={styles.sectionDescText}>View full vehicle information</Text>
                    </View>

                    {(vehicleInfoVerificationIssues?.length ?? 0) >= 1 && <View style={[styles.sectionStatusCont, { backgroundColor: Colors.errorBackground }]}>
                      <Ionicons name='alert-circle' size={18} color={Colors.error} />
                      <Text style={[styles.statusText, { color: Colors.error }]}>{vehicleInfoVerificationIssues?.length} {isIssuesMoreThanOne ? 'issues' : 'issue'}</Text>
                    </View>}

                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} style={styles.rightArrow} />



                  </Pressable>

                  <Pressable onPress={navigateToVehicleDriver} style={styles.sectionCont}>
                    <View style={styles.labelIconCont}>
                      <Ionicons name="person-outline" size={24} color={Colors.text.gray} />
                    </View>
                    <View style={styles.sectionDetailCont}>
                      <Text style={styles.sectionHeaderText}>Current Driver</Text>
                      <Text style={styles.sectionDescText}>View or assign a driver to vehicle</Text>
                    </View>



                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} style={styles.rightArrow} />

                  </Pressable>

                  <Pressable onPress={navigateToVehicleRegistration} style={styles.sectionCont}>
                    <View style={styles.labelIconCont}>
                      <Ionicons name="document-outline" size={24} color={Colors.text.gray} />
                    </View>
                    <View style={styles.sectionDetailCont}>
                      <Text style={styles.sectionHeaderText}>Vehicle Documents</Text>
                      <Text style={styles.sectionDescText}>View vehicle documents</Text>
                    </View>

                    <View style={[styles.sectionStatusCont, { backgroundColor: vehicleDocumentStatusBgColor }]}>
                      <Ionicons name={vehicleDocumentStatusIcon} size={18} color={vehicleDocumentStatusTextColor} />
                      <Text style={[styles.statusText, { color: vehicleDocumentStatusTextColor }]}>{vehicleDocumentStatusText}</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} style={styles.rightArrow} />

                  </Pressable>


                </View>


              </View>
          }

        </ScrollView>
      </View>
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
  vehicleImageCont: {
    width: WIDTH,
    height: 200,
    borderRadius: BORDER_RADIUS.md
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: BORDER_RADIUS.md
  },
  vehicleCountCont: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.semiBlackBackground,
    position: "absolute",
    right: 10,
    bottom: 10
  },
  labelIconCont: {
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backBtnGray,
    marginRight: 10,
    alignSelf: "center"
  },
  vehicleCount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: Colors.text.white
  },
  vehicleHorizontalImageCont: {
    width: 100,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },

  vehicleHorizontalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: BORDER_RADIUS.md,
  },
  statusCont: {
    backgroundColor: Colors.primaryTransparent,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: "flex-start",
    position: "absolute",
    top: 10,
    left: 10
  },
  statusText: {
    color: Colors.primary,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium
  },
  reviewCont: {
    flexShrink: 1
  },
  labelText: {
    color: Colors.text.black,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
  },
  labelDesc: {
    color: Colors.text.gray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginTop: 5
  },
  infoCont: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.text.white,
    padding: 15,
    borderRadius: BORDER_RADIUS.md
  },
  iconCont: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  sectionCont: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.text.white,
    padding: 15,
    borderRadius: BORDER_RADIUS.md,
  },
  sectionHeaderText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black
  },
  sectionDescText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: Colors.text.gray
  },
  sectionDetailCont: {
    marginRight: "auto",
    gap: 5,
    flexShrink: 1
  },
  sectionStatusCont: {
    backgroundColor: Colors.errorBackground,
    flexDirection: "row",
    gap: 2,
    alignSelf: "flex-start",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    alignItems: "center"
  },
  rightArrow: {
    marginLeft: 10,
  },
  cardSectionCont: {
    marginVertical: 15,
    gap: 10
  }

})