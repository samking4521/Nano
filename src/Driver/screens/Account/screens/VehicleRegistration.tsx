import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp, VehicleRegistrationNavigationRouteProp } from '../../../../Navigation/DriverNavigation'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import UpdateVehicleLicenseBottomSheet from '../components/UpdateVehicleLicenseBottomSheet'
import UpdateVehicleLicensePhotoBottomSheet from '../components/UpdateVehicleLicensePhotoBottomSheet'
import NanoLoadingSpinner from '../../../../utils/nanoLoadingSpinner'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder'
import { PENDING_VEHICLE_REG_PHOTO_ISSUES_CODE, VEHICLE_REGISTRATION_PHOTO_ISSUES_CODE, VERIFICATION_ISSUES_CODE, VERIFICATION_ISSUES_FIELD } from '../../../../constants/driver'
import UpdateVehicleRegExpiryDate from '../components/UpdateExpiryDate'


export type vehicleLicenseFieldType = "expiry_date" | "reg_number";

type Props = {
  route: VehicleRegistrationNavigationRouteProp;
};

export default function VehicleRegistration({ route }: Props) {
  const { vehicle_document, isVehicleOwner, vehicle_document_status, vehicle_document_verification_issues, onUpdateVehicleDocumentVerificationIssues, onUpdateVehicleDocumentVerificationStatus, onUpdateVehicleDocuments } = route.params;
  const [regNumber, setRegNumber] = useState(vehicle_document.document_number);
  const [expiryDate, setExpiryDate] = useState(vehicle_document.expiry_date);
  const [vehicleLicensePhoto, setVehicleLicensePhoto] = useState<string>(vehicle_document.document_img_key);
  const [vehicleDocumentVerificationStatus, setVehicleDocumentVerificationStatus] = useState(vehicle_document_status);
  const [openEditVehicleLicenseBottomSheet, setOpenEditVehicleLicenseBottomSheet] = useState<vehicleLicenseFieldType | null>(null);
  const [vehicleDocumentVerificationIssues, setVehicleDocumentVerificationIssues] = useState(vehicle_document_verification_issues);
  const [pendingExpiryDate, setPendingExpiryDate] = useState(vehicle_document.pending_expiry_date)
  const [pendingDocumentImgKey, setPendingDocumentImgKey] = useState(vehicle_document.pending_document_img_key)
  const [openVehicleLicensePhoto, setOpenVehicleLicensePhoto] = useState(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [openUpdateRegExpiry, setOpenUpdateRegExpiry] = useState(false);
  const navigation = useNavigation<DriverNavigationProp>();


  const vehicle_reg_number_issue = vehicleDocumentVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.VEHICLE_REGISTRATION_NUMBER);
  const vehicle_reg_number_issues_code = vehicle_reg_number_issue ? VERIFICATION_ISSUES_CODE.VEHICLE_REGISTRATION_NUMBER_MISMATCH : undefined;

  const vehicle_expiry_date_issue = vehicleDocumentVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.VEHICLE_REGISTRATION_EXPIRY_DATE);
  const vehicle_expiry_date_issues_code = vehicle_expiry_date_issue ? VERIFICATION_ISSUES_CODE.VEHICLE_REGISTRATION_EXPIRY_DATE_MISMATCH : undefined;

  const vehicle_reg_photo_issue = vehicleDocumentVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.VEHICLE_REGISTRATION_PHOTO);
  const vehicle_reg_photo_issues_code = vehicle_reg_photo_issue ? vehicle_reg_photo_issue.ISSUES_CODE === VEHICLE_REGISTRATION_PHOTO_ISSUES_CODE.VEHICLE_REGISTRATION_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.VEHICLE_REGISTRATION_PHOTO_BLURRY : VERIFICATION_ISSUES_CODE.VEHICLE_REGISTRATION_PHOTO_INVALID : undefined;


  const pending_vehicle_expiry_date_issue = vehicleDocumentVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_EXPIRY_DATE);
  const pending_vehicle_expiry_date_issues_code = pending_vehicle_expiry_date_issue ? VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_REGISTRATION_EXPIRY_DATE_MISMATCH : undefined;

  const vehicle_reg_pending_photo_issue = vehicleDocumentVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_VEHICLE_REGISTRATION_PHOTO);
  const vehicle_reg_pending_photo_issues_code = vehicle_reg_pending_photo_issue ? vehicle_reg_pending_photo_issue.ISSUES_CODE == PENDING_VEHICLE_REG_PHOTO_ISSUES_CODE.PENDING_VEHICLE_REGISTRATION_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_REGISTRATION_PHOTO_BLURRY : VERIFICATION_ISSUES_CODE.PENDING_VEHICLE_REGISTRATION_PHOTO_INVALID : undefined;


  const getVehicleRegistrationPhotoUrl = async () => {
    const imgKey = vehicle_document.document_img_key;
    if (!imgKey) return;

    const { data: signedImage, error: signedImageError } =
      await supabase.storage
        .from("vehicle-documents")
        .createSignedUrl(imgKey, 60 * 60);

    if (signedImageError) {
      throw new Error(
        `Error creating vehicle license document URL: ${signedImageError.message}`
      );
    }

    const imageUrl = signedImage.signedUrl;
    setVehicleLicensePhoto(imageUrl);
  }


  useEffect(() => {
    if (vehicleDocumentVerificationStatus === VERIFICATION_STATUS.APPROVED) return;
    getVehicleRegistrationPhotoUrl();
  }, [])


  const goBack = () => {
    navigation.goBack();
  }

  const openUpdateVehicleLicenseInfoUi = (value: vehicleLicenseFieldType) => {
    setOpenEditVehicleLicenseBottomSheet(value)
  }

  useEffect(() => {
    if (!showErrorAlert) return;
    const timeoutId = setTimeout(() => {
      setShowErrorAlert(false);
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [showErrorAlert])



  const vehicleDocumentStatusText = vehicleDocumentVerificationStatus === VERIFICATION_STATUS.PENDING ? "Pending" : "Not Verified";
  const vehicleDocumentStatusTextColor = vehicleDocumentVerificationStatus === VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.text.gray;
  const vehicleDocumentStatusBgColor = vehicleDocumentVerificationStatus === VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.backBtnGray;

  const isVehicleDocumentApproved = vehicleDocumentVerificationStatus === VERIFICATION_STATUS.APPROVED;

  const updateExpiryDate = ()=>{
      if(!isVehicleOwner.current) return;
      setOpenUpdateRegExpiry(true);
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.body}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
        </Pressable>

        <View style={{ marginVertical: 15 }}>
          <Text style={styles.headerText}>Vehicle Documents</Text>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>


          {!isVehicleDocumentApproved && (vehicleDocumentVerificationStatus === VERIFICATION_STATUS.PENDING ?
            <View style={[styles.infoCont, { backgroundColor: Colors.primaryTransparent }]}>
              <View style={[styles.iconCont, { borderRadius: 40, backgroundColor: "#FFE4D1" }]}>
                <Ionicons name="time-outline" size={28} color={Colors.primary} />
              </View>
              <View style={styles.reviewCont}>
                <Text style={[styles.labelText, { color: Colors.primary }]}>Verification in progress</Text>
                <Text style={styles.labelDesc}>We are reviewing your information. This should be completed within 24 hours.</Text>
              </View>
            </View>
            :
            <View style={[styles.infoCont, { backgroundColor: Colors.errorBackground }]}>
              <View style={[styles.iconCont, { borderRadius: 40, backgroundColor: "#F9D3D3" }]}>
                <Ionicons name="alert-circle" size={28} color={Colors.error} />
              </View>
              <View style={styles.reviewCont}>
                <Text style={[styles.labelText, { color: Colors.error }]}>Verification Issue Found</Text>
                <Text style={styles.labelDesc}>There's an issue with the information you submitted. Please review and update it to continue your verification.</Text>
              </View>
            </View>
          )
          }




          <View style={styles.identityDetailsContainer}>
            {
              vehicleDocumentVerificationStatus === VERIFICATION_STATUS.APPROVED ?
                <View style={styles.cardCont}>
                  <View style={styles.headerLabelCont}>
                    <Text style={styles.headerLabelText}>Vehicle Registration {`\n`}Certificate</Text>
                    <View style={[styles.statusCont, { backgroundColor: Colors.transparentGreen }]}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
                      <Text style={[styles.statusText, { color: Colors.green }]}>Verified</Text>
                    </View>
                  </View>

                  <View>

                    <View style={styles.verifiedLabelCont}>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelText}>Reg Number</Text>
                      </View>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelInfo}>{vehicle_document.document_number}</Text>
                      </View>
                    </View>

                    <View style={styles.verifiedLabelCont}>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelText}>Owner's Name</Text>
                      </View>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelInfo}>{vehicle_document.document_owner_name}</Text>
                      </View>
                    </View>

                    <View style={styles.verifiedLabelCont}>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelText}>Vehicle Make</Text>
                      </View>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelInfo}>{vehicle_document.manufacturer}</Text>
                      </View>
                    </View>

                    <View style={styles.verifiedLabelCont}>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelText}>Vehicle Model</Text>
                      </View>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelInfo}>{vehicle_document.model}</Text>
                      </View>
                    </View>

                    <View style={styles.verifiedLabelCont}>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelText}>Vehicle Color</Text>
                      </View>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelInfo}>{vehicle_document.color}</Text>
                      </View>
                    </View>

                    <View style={styles.verifiedLabelCont}>
                      <View style={styles.verifiedInnerLabelCont}>
                        <Text style={styles.verifiedLabelText}>Expiry Date</Text>
                      </View>
                      <Pressable onPress={updateExpiryDate} style={[styles.verifiedInnerLabelCont, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
                        <Text style={styles.verifiedLabelInfo}>{vehicle_document.expiry_date}</Text>
                        {pendingExpiryDate && <Ionicons name={pending_vehicle_expiry_date_issues_code || vehicle_reg_pending_photo_issues_code ? "alert-circle" : "time-outline"} size={18} color={pending_vehicle_expiry_date_issues_code || vehicle_reg_pending_photo_issues_code ? Colors.error : Colors.primary} />}

                        {isVehicleOwner.current && <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />}
                      </Pressable>
                    </View>

                  </View>
                </View>
                :
                <View style={{ gap: 15 }}>
                  <View style={styles.cardCont}>
                    <View style={styles.headerLabelCont}>
                      <Text style={styles.headerLabelText}>Vehicle Registration Certificate</Text>
                      <View style={[styles.statusCont, { backgroundColor: vehicleDocumentStatusBgColor }]}>
                        {vehicleDocumentVerificationStatus === VERIFICATION_STATUS.PENDING ? <Ionicons name="time-outline" size={18} color={Colors.primary} /> : <MaterialCommunityIcons name="shield-off" size={18} color={Colors.text.gray} />}
                        <Text style={[styles.statusText, { color: vehicleDocumentStatusTextColor }]}>{vehicleDocumentStatusText}</Text>
                      </View>
                    </View>


                    <View style={styles.identityLabelInfoCont}>
                      <Text style={styles.identityLabelText}>Reg Number</Text>
                      <Pressable onPress={() => openUpdateVehicleLicenseInfoUi("reg_number")} style={styles.identityLabelCont}>
                        <Text style={styles.identityLabelNo}>{regNumber}</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
                      </Pressable>
                      {vehicle_reg_number_issue && <View style={styles.issueCont}>
                        <Text style={styles.issueText}>{vehicle_reg_number_issues_code}</Text>
                      </View>}

                    </View>

                    <View style={styles.identityLabelInfoCont}>
                      <Text style={styles.identityLabelText}>Expiry Date</Text>
                      <Pressable onPress={() => openUpdateVehicleLicenseInfoUi("expiry_date")} style={styles.identityLabelCont}>
                        <Text style={styles.identityLabelNo}>{expiryDate}</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
                      </Pressable>
                      {vehicle_expiry_date_issue && <View style={styles.issueCont}>
                        <Text style={styles.issueText}>{vehicle_expiry_date_issues_code}</Text>
                      </View>}
                    </View>

                    <View style={styles.identityLabelInfoCont}>
                      <Text style={styles.identityLabelText}>Vehicle Reg Certificate Image</Text>
                      <View style={[styles.identityDocumentImageContainer, { borderColor: vehicle_reg_photo_issue ? Colors.error : Colors.borderColor }]}>
                        <Image source={{ uri: vehicleLicensePhoto as string }} onLoad={() => setImageLoading(false)} style={styles.identityDocumentImage} />
                        {!imageLoading && <TouchableOpacity onPress={() => setOpenVehicleLicensePhoto(true)} style={styles.changePhotoCont}>
                          <Text style={styles.changePhotoText}>change photo</Text>
                        </TouchableOpacity>}
                        {imageLoading && <ImageLoadingPlaceHolder />}
                      </View>
                      {vehicle_reg_photo_issue && <View style={styles.issueCont}>
                        <Text style={styles.issueText}>{vehicle_reg_photo_issues_code}</Text>
                      </View>}
                    </View>

                  </View>


                </View>
            }
          </View>
        </ScrollView>
      </View>
      {(openEditVehicleLicenseBottomSheet || openUpdateRegExpiry) && <View style={styles.bottomSheetCoverContainer} />}

      {openEditVehicleLicenseBottomSheet && <UpdateVehicleLicenseBottomSheet
        openEditVehicleLicenseBottomSheet={openEditVehicleLicenseBottomSheet}
        setOpenEditVehicleLicenseBottomSheet={setOpenEditVehicleLicenseBottomSheet}
        regNumber={regNumber}
        expiryDate={expiryDate}
        setRegNumber={setRegNumber}
        setExpiryDate={setExpiryDate}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        vehicleId={vehicle_document.vehicle_id}
        vehicleDocumentVerificationStatus={vehicleDocumentVerificationStatus}
        setVehicleDocumentVerificationStatus={setVehicleDocumentVerificationStatus}
        onUpdateVehicleDocumentVerificationStatus={onUpdateVehicleDocumentVerificationStatus}
        setVehicleDocumentVerificationIssues={setVehicleDocumentVerificationIssues}
        onUpdateVehicleDocumentVerificationIssues={onUpdateVehicleDocumentVerificationIssues}
        onUpdateVehicleDocuments={onUpdateVehicleDocuments}
      />}

      {openVehicleLicensePhoto && <UpdateVehicleLicensePhotoBottomSheet
        openVehicleLicensePhoto={openVehicleLicensePhoto}
        setOpenVehicleLicensePhoto={setOpenVehicleLicensePhoto}
        setVehicleLicensePhoto={setVehicleLicensePhoto}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        regPhotoKey={vehicle_document.document_img_key}
        vehicleId={vehicle_document.vehicle_id}
        setVehicleDocumentVerificationIssues={setVehicleDocumentVerificationIssues}
        onUpdateVehicleDocumentVerificationIssues={onUpdateVehicleDocumentVerificationIssues}
        vehicleDocumentVerificationStatus={vehicleDocumentVerificationStatus}
        setVehicleDocumentVerificationStatus={setVehicleDocumentVerificationStatus}
        onUpdateVehicleDocumentVerificationStatus={onUpdateVehicleDocumentVerificationStatus}
      />}

      {openUpdateRegExpiry && <UpdateVehicleRegExpiryDate
        setOpenUpdateRegExpiry={setOpenUpdateRegExpiry}
        setShowErrorAlert={setShowErrorAlert}
        setShowLoadingSpinner={setShowLoadingSpinner}
        vehicleId={vehicle_document.vehicle_id}
        setVehicleDocumentVerificationIssues={setVehicleDocumentVerificationIssues}
        onUpdateVehicleDocumentVerificationIssues={onUpdateVehicleDocumentVerificationIssues}
        pendingExpiryDate={pendingExpiryDate}
        setPendingExpiryDate={setPendingExpiryDate}
        onUpdateVehicleDocuments={onUpdateVehicleDocuments}
        pendingDocumentImgKey={pendingDocumentImgKey}
        setPendingDocumentImgKey={setPendingDocumentImgKey}
        pending_vehicle_expiry_date_issues_code={pending_vehicle_expiry_date_issues_code}
        vehicle_reg_pending_photo_issues_code={vehicle_reg_pending_photo_issues_code}
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
  statusText: {
    color: Colors.primary,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium
  },
  statusCont: {
    backgroundColor: Colors.primaryTransparent,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round
  },
  headerLabelCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

  },
  headerLabelText: {
    color: Colors.text.black,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    flexShrink: 1
  },
  cardCont: {
    backgroundColor: Colors.text.white,
    padding: 15,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 0.5,
    borderColor: Colors.borderColor
  },
  identityDetailsContainer: {
    marginTop: 15,
    gap: 15
  },
  identityLabelText: {
    color: Colors.text.gray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  identityLabelCont: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
  },
  identityLabelNo: {
    color: Colors.text.black,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  identityLabelInfoCont: {
    marginTop: 10,
    gap: 5
  },
  identityDocumentImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: BORDER_RADIUS.md
  },
  identityDocumentImageContainer: {
    marginTop: 5,
    width: "100%",
    height: 150,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderStyle: "dashed"
  },
  changePhotoCont: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.semiBlackBackground,
    top: 0,
    borderRadius: BORDER_RADIUS.sm,
    right: 0
  },
  changePhotoText: {
    color: Colors.text.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  issueCont: {
    flexShrink: 1,
    backgroundColor: Colors.errorBackground,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center"
  },
  issueText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: Colors.error,
  },
  fixText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: Colors.green,
    marginLeft: "auto"
  },
  verifiedLabelCont: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedInnerLabelCont: {
    flex: 1,
    alignItems: "flex-start",
    paddingVertical: 10
  },
  verifiedLabelText: {
    color: Colors.text.gray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  verifiedLabelInfo: {
    color: Colors.text.black,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
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