import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp } from '../../../../Navigation/DriverNavigation'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import IdentityInfoShimmer from '../components/IdentityInfoShimmer'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { DRIVER_DOCUMENT_TYPE, DRIVER_LICENSE_ISSUES_CODE, NIN_ISSUES_CODE, PENDING_DRIVER_LICENSE_PHOTO_ISSUES_CODE, VERIFICATION_ISSUES_CODE, VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import UpdateIdentityBottomSheet from '../components/UpdateIdentityBottomSheet'
import UpdateIdentityPhotoBottomSheet from '../components/UpdateIdentityPhotoBottomSheet'
import NanoLoadingSpinner from '../../../../utils/nanoLoadingSpinner'
import EditDriverLicenseBottomSheet from '../components/EditDriverLicenseClassBottomSheet'
import UpdateLicenseInfoBottomSheet from '../components/UpdateLicenseInfoBottomSheet'
import { useNetworkStore } from '../../../../Providers/Network/NetworkStore'
import { useDriverStore } from '../../../store/DriverStore'
import ImageLoadingPlaceHolder from '../../../../utils/ImageLoadingPlaceHolder'

export type identityFieldType = "nin_no" | "license_no" | "license_expiry_date";
export type identityPhotoType = "nin" | "driver_license";

interface ninDataType {
  document_number: string
  document_owner_name: string
  birthday: string
  gender: string

}

interface driverLicenseDataType {
  document_number: string
  document_owner_name: string
  birthday: string
  gender: string
  license_class: string
  expiry_date: string
}

export type licenseUpdateType = "license_class" | "license_expiry_date";

export default function IdentityInfo() {
  const session = useAuthStore((store) => store.session);
  const isOnline = useNetworkStore((store) => store.isOnline);
  const driverVerificationStatus = useDriverStore((store) => store.driverVerificationStatus);
  const ninVerificationStatus = useDriverStore((store) => store.ninVerificationStatus);
  const driverLicenseVerificationStatus = useDriverStore((store) => store.driverLicenseVerificationStatus)
  const identityInfoVerificationIssues = useDriverStore((store) => store.identityInfoVerificationIssues);
  const setDriverVerificationStatus = useDriverStore((store) => store.setDriverVerificationStatus)
  const setNinVerificationStatus = useDriverStore((store) => store.setNinVerificationStatus)
  const setDriverLicenseVerificationStatus = useDriverStore((store) => store.setDriverLicenseVerificationStatus)
  const setIdentityInfoVerificationIssues = useDriverStore((store) => store.setIdentityInfoVerificationIssues)
  const [ninNo, setNinNo] = useState("");
  const [ninData, setNinData] = useState<ninDataType | null>(null);
  const [driverLicenseData, setDriverLicenseData] = useState<driverLicenseDataType | null>(null);
  const [ninImage, setNinImage] = useState<string | null>(null);
  const [driverLicenseImageLoading, setDriverLicenseImageLoading] = useState(true);
  const [ninImageLoading, setNinImageLoading] = useState(true);
  const [driverLicenseNo, setDriverLicenseNo] = useState("");
  const [driverLicenseClass, setDriverLicenseClass] = useState("");
  const [driverLicenseExpiryDate, setDriverLicenseExpiryDate] = useState("");
  const [driverLicenseImage, setDriverLicenseImage] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [openEditBottomSheet, setOpenEditBottomSheet] = useState<identityFieldType | null>(null);
  const [showPhotoBottomSheet, setShowPhotoBottomSheet] = useState<identityPhotoType | null>(null);
  const ninImgPath = useRef<string | null>(null)
  const driverLicenseImgPath = useRef<string | null>(null)
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [openEditDriverLicenseClass, setOpenEditDriverLicenseClass] = useState(false);
  const [showUpdateLicenseInfoBottomSheet, setShowUpdateLicenseInfoBottomSheet] = useState<licenseUpdateType | null>(null);
  const [pendingLicenseClass, setPendingLicenseClass] = useState<string | null>(null);
  const [pendingLicensePhoto, setPendingLicensePhoto] = useState<string | null>(null);
  const [pendingLicenseExpiryDate, setPendingLicenseExpiryDate] = useState<string | null>(null);

  const navigation = useNavigation<DriverNavigationProp>();




  const ninStatusText = ninVerificationStatus == VERIFICATION_STATUS.APPROVED ? "Verified" : ninVerificationStatus == VERIFICATION_STATUS.PENDING ? "Pending" : "Not Verified";
  const driverLicenseStatusText = driverLicenseVerificationStatus == VERIFICATION_STATUS.APPROVED ? "Verified" : driverLicenseVerificationStatus == VERIFICATION_STATUS.PENDING ? "Pending" : "Not Verified";

  const ninStatusTextColor = ninVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.green : ninVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.error;
  const driverLicenseStatusTextColor = driverLicenseVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.green : driverLicenseVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primary : Colors.error;

  const ninStatusBgColor = ninVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : ninVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.errorBackground;
  const driverLicenseStatusBgColor = driverLicenseVerificationStatus == VERIFICATION_STATUS.APPROVED ? Colors.transparentGreen : driverLicenseVerificationStatus == VERIFICATION_STATUS.PENDING ? Colors.primaryTransparent : Colors.errorBackground;


  const nin_no_issue = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.NIN_NUMBER);

  const nin_no_issues_code = nin_no_issue && VERIFICATION_ISSUES_CODE.NIN_NUMBER_MISMATCH;

  const nin_photo_issue = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.NIN_PHOTO);

  const nin_photo_issues_code = nin_photo_issue ? nin_photo_issue.ISSUES_CODE == NIN_ISSUES_CODE.NIN_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.NIN_PHOTO_BLURRY
    : VERIFICATION_ISSUES_CODE.NIN_PHOTO_INVALID : undefined;

  const driver_license_no_issue = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.DRIVER_LICENSE_NUMBER);

  const driver_license_no_issues_code = driver_license_no_issue ? VERIFICATION_ISSUES_CODE.DRIVER_LICENSE_NUMBER_MISMATCH : undefined;

  const driver_license_class_issue = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.DRIVER_LICENSE_CLASS);

  const driver_license_class_issues_code = driver_license_class_issue ? VERIFICATION_ISSUES_CODE.DRIVER_LICENSE_CLASS_MISMATCH : undefined;

  const driver_license_expiry_issue = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.DRIVER_LICENSE_EXPIRY_DATE);

  const driver_license_expiry_issues_code = driver_license_expiry_issue ? VERIFICATION_ISSUES_CODE.DRIVER_LICENSE_EXPIRY_MISMATCH : undefined;

  const driver_license_photo_issue = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.DRIVER_LICENSE_PHOTO);

  const driver_license_photo_issues_code = driver_license_photo_issue ? driver_license_photo_issue.ISSUES_CODE == DRIVER_LICENSE_ISSUES_CODE.DRIVER_LICENSE_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.DRIVER_LICENSE_PHOTO_BLURRY : VERIFICATION_ISSUES_CODE.DRIVER_LICENSE_PHOTO_INVALID : undefined;

  const pending_driver_license_class = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_DRIVER_LICENSE_CLASS);

  const pending_driver_license_class_issues_code = pending_driver_license_class ? VERIFICATION_ISSUES_CODE.PENDING_DRIVER_LICENSE_CLASS_MISMATCH : undefined;

  const pending_driver_license_expiry_date = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_DRIVER_LICENSE_EXPIRY_DATE);

  const pending_driver_license_expiry_date_issues_code = pending_driver_license_expiry_date ? VERIFICATION_ISSUES_CODE.PENDING_DRIVER_LICENSE_EXPIRY_MISMATCH : undefined;

  const pending_driver_license_photo_issue = identityInfoVerificationIssues?.find((item) => item.field == VERIFICATION_ISSUES_FIELD.PENDING_DRIVER_LICENSE_CLASS_PHOTO);

  const pending_driver_license_photo_issues_code = pending_driver_license_photo_issue ? pending_driver_license_photo_issue.ISSUES_CODE == PENDING_DRIVER_LICENSE_PHOTO_ISSUES_CODE.PENDING_DRIVER_LICENSE_CLASS_PHOTO_BLURRY ? VERIFICATION_ISSUES_CODE.PENDING_DRIVER_LICENSE_CLASS_PHOTO_BLURRY : VERIFICATION_ISSUES_CODE.PENDING_DRIVER_LICENSE_CLASS_PHOTO_INVALID : undefined;





  const getIdentityInfoVerificationIssues = async () => {
    const { data: verification_issues_data, error: verification_issues_data_err } = await supabase
      .from("Verification_Issues")
      .select("*")
      .eq("driver_id", session?.user.id)
      .eq("section", VERIFICATION_ISSUES_SECTION.IDENTITY_INFO);

    if (verification_issues_data_err) {
      throw new Error(`Error querying Verification Issues: ${verification_issues_data_err.message}`);
    }

    setIdentityInfoVerificationIssues(verification_issues_data);
  }


  const goBack = () => {
    navigation.goBack();
  }

  const getDriverVerificationStatus = async () => {
    const { data: verification_status, error: verification_status_err } = await supabase
      .from('Driver_Verification')
      .select('verification_status')
      .eq('driver_id', session?.user.id)
      .single();

    if (verification_status_err) {
      throw new Error(`Error querying Driver Verification Status: ${verification_status_err.message}`);

    }

    setDriverVerificationStatus(verification_status.verification_status);
  }

  useEffect(() => {
    if (!showErrorAlert) return;
    const timeoutId = setTimeout(() => {
      setShowErrorAlert(false);
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [showErrorAlert])

  const getNinImage = async () => {
    const ninImgKey = `driver/active/nin/${session?.user.id}/ninImage.jpg`

    const { data: signedImage, error: signedImageError } =
      await supabase.storage
        .from("driver-documents")
        .createSignedUrl(ninImgKey, 60 * 60);

    if (signedImageError) {
      throw new Error(
        `Error creating nin image URL: ${signedImageError.message}`
      );
    }

    const imageUrl = signedImage.signedUrl;
    setNinImage(imageUrl);
  }

  const getDriverLicenseImage = async () => {
    const driverLicenseImgKey = `driver/active/driver_license/${session?.user.id}/driverLicenseImage.jpg`
    const { data: signedImage, error: signedImageError } =
      await supabase.storage
        .from("driver-documents")
        .createSignedUrl(driverLicenseImgKey, 60 * 60);

    if (signedImageError) {
      throw new Error(
        `Error creating driver license image URL: ${signedImageError.message}`
      );
    }

    const imageUrl = signedImage.signedUrl;
    setDriverLicenseImage(imageUrl);
  }

  const getPendingDriverLicenseImage = async () => {
    const path = `driver/pending/driver_license/${session?.user.id}/driverLicenseImage.jpg`;
    const { data: signedImage, error: signedImageError } =
      await supabase.storage
        .from("driver-documents")
        .createSignedUrl(path, 60 * 60);

    if (signedImageError) {
      setPendingLicensePhoto(null);
      return;
    }

    const imageUrl = signedImage.signedUrl;
    setPendingLicensePhoto(imageUrl);
  }

  const getNinData = async () => {
    const { data: select_driver_nin_document, error: select_driver_nin_document_err } = await supabase
      .from("Driver_Documents")
      .select("*")
      .eq("driver_id", session?.user.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.NIN)
      .single();

    if (select_driver_nin_document_err) {
      throw new Error(`Error querying Driver NIN: ${select_driver_nin_document_err.message}`);
    }
    setNinData(select_driver_nin_document)
    setNinNo(select_driver_nin_document.document_number);
    ninImgPath.current = select_driver_nin_document.document_img_key;
  }

  const getDriverLicenseData = async () => {
    const { data: select_driver_license_document, error: select_driver_license_document_err } = await supabase
      .from("Driver_Documents")
      .select("*")
      .eq("driver_id", session?.user.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE)
      .single();

    if (select_driver_license_document_err) {
      throw new Error(`Error querying Driver License: ${select_driver_license_document_err.message}`);
    }
    setDriverLicenseData(select_driver_license_document);
    setDriverLicenseNo(select_driver_license_document.document_number);
    setDriverLicenseClass(select_driver_license_document.license_class);
    setDriverLicenseExpiryDate(select_driver_license_document.expiry_date);
    setPendingLicenseClass(select_driver_license_document.pending_license_class)
    setPendingLicenseExpiryDate(select_driver_license_document.pending_expiry_date)

    driverLicenseImgPath.current = select_driver_license_document.document_img_key;
  }


  const getNinInfoVerificationStatus = async () => {
    const { data: select_driver_nin_document, error: select_driver_nin_document_err } = await supabase
      .from("Driver_Documents")
      .select("status")
      .eq("driver_id", session?.user.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.NIN)
      .single();

    if (select_driver_nin_document_err) {
      throw new Error(`Error querying Driver NIN status: ${select_driver_nin_document_err.message}`);
    }

    setNinVerificationStatus(select_driver_nin_document.status);

  }

  const getDriverLicenseVerificationStatus = async () => {
    const { data: select_driver_license_document, error: select_driver_license_document_err } = await supabase
      .from("Driver_Documents")
      .select("status")
      .eq("driver_id", session?.user.id)
      .eq("document_type", DRIVER_DOCUMENT_TYPE.DRIVER_LICENSE)
      .single();

    if (select_driver_license_document_err) {
      throw new Error(`Error querying Driver License status: ${select_driver_license_document_err.message}`);
    }

    setDriverLicenseVerificationStatus(select_driver_license_document.status);
  }


  const getIdentityInfo = async () => {
    try {
      await Promise.all([
        getNinInfoVerificationStatus(),
        getDriverLicenseVerificationStatus(),
        getNinData(),
        getNinImage(),
        getDriverLicenseData(),
        getDriverLicenseImage(),
        getPendingDriverLicenseImage(),
        getIdentityInfoVerificationIssues(),
        getDriverVerificationStatus()
      ])
      setLoadingStatus(false);
    } catch (e) {
      console.log("Error: ", e);
    }

  }



  useEffect(() => {
    if (!isOnline || !loadingStatus) return;
    getIdentityInfo();
  }, [isOnline, loadingStatus]);


  const editIdentityInfo = (field: identityFieldType) => {
    setOpenEditBottomSheet(field);
  }

  const updateVerifiedLicenseData = (type: licenseUpdateType) => {
    setShowUpdateLicenseInfoBottomSheet(type);
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.body}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
        </Pressable>

        <View style={{ marginVertical: 15 }}>
          <Text style={styles.headerText}>Identity information</Text>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

          {loadingStatus ? <IdentityInfoShimmer /> : <View>


            {((ninVerificationStatus == VERIFICATION_STATUS.APPROVED) && (driverLicenseVerificationStatus == VERIFICATION_STATUS.APPROVED)) && <View style={styles.verifiedHeaderIconCont}>
              <View style={styles.verifiedInnerHeaderIconCont}>
                <AntDesign name="idcard" size={50} color={Colors.blue} />
              </View>
              <View style={styles.greenCheckCont}>
                <Ionicons name="checkmark" size={18} color={Colors.text.white} />
              </View>
            </View>}


            <View style={styles.identityDetailsContainer}>

              {(ninVerificationStatus == VERIFICATION_STATUS.APPROVED) && <View style={styles.cardCont}>
                <View style={styles.headerLabelCont}>
                  <Text style={styles.headerLabelText}>National Identification Number (NIN)</Text>
                  <View style={[styles.statusCont, { backgroundColor: ninStatusBgColor }]}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={ninStatusTextColor}
                    />
                    <Text style={[styles.statusText, { color: ninStatusTextColor }]}>{ninStatusText}</Text>
                  </View>
                </View>

                <View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>NIN Number</Text>
                    </View>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelInfo}>{ninData?.document_number}</Text>
                    </View>
                  </View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>Full Name</Text>
                    </View>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelInfo}>{ninData?.document_owner_name}</Text>
                    </View>
                  </View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>Date of birth</Text>
                    </View>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelInfo}>{ninData?.birthday}</Text>
                    </View>
                  </View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>Gender</Text>
                    </View>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelInfo}>{ninData?.gender}</Text>
                    </View>
                  </View>

                </View>
              </View>}

              {(driverLicenseVerificationStatus == VERIFICATION_STATUS.APPROVED) && <View style={styles.cardCont}>
                <View style={styles.headerLabelCont}>
                  <Text style={styles.headerLabelText}>Driver License</Text>
                  <View style={[styles.statusCont, { backgroundColor: driverLicenseStatusBgColor }]}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={driverLicenseStatusTextColor}
                    />
                    <Text style={[styles.statusText, { color: driverLicenseStatusTextColor }]}>{driverLicenseStatusText}</Text>
                  </View>
                </View>

                <View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>License Number</Text>
                    </View>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelInfo}>{driverLicenseData?.document_number}</Text>
                    </View>
                  </View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>Full Name</Text>
                    </View>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelInfo}>{driverLicenseData?.document_owner_name}</Text>
                    </View>
                  </View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>Date of birth</Text>
                    </View>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelInfo}>{driverLicenseData?.birthday}</Text>
                    </View>
                  </View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>Gender</Text>
                    </View>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelInfo}>{driverLicenseData?.gender}</Text>
                    </View>
                  </View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>License Class</Text>
                    </View>
                    <Pressable onPress={() => updateVerifiedLicenseData("license_class")} style={styles.verifiedInnerLabelCont}>
                      <Text style={[styles.verifiedLabelInfo, { marginRight: "auto" }]}>{driverLicenseData?.license_class}</Text>
                      {pendingLicenseClass &&
                        <Ionicons name={pending_driver_license_class || pending_driver_license_photo_issue ? "alert-circle" : "time-outline"} size={18} color={pending_driver_license_class || pending_driver_license_photo_issue ? Colors.error : Colors.primary} style={{ marginRight: 20 }} />
                      }
                      {driverVerificationStatus == VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />}

                    </Pressable>

                  </View>

                  <View style={styles.verifiedLabelCont}>
                    <View style={styles.verifiedInnerLabelCont}>
                      <Text style={styles.verifiedLabelText}>Expiry Date</Text>
                    </View>
                    <Pressable onPress={() => updateVerifiedLicenseData("license_expiry_date")} style={styles.verifiedInnerLabelCont}>
                      <Text style={[styles.verifiedLabelInfo, { marginRight: "auto" }]}>{driverLicenseData?.expiry_date}</Text>
                      {pendingLicenseExpiryDate &&
                        <Ionicons name={pending_driver_license_expiry_date || pending_driver_license_photo_issue ? "alert-circle" : "time-outline"} size={18} color={pending_driver_license_expiry_date || pending_driver_license_photo_issue ? Colors.error : Colors.primary} style={{ marginRight: 20 }} />
                      }
                      {driverVerificationStatus == VERIFICATION_STATUS.APPROVED && <Ionicons name="chevron-forward" size={18} color={Colors.text.gray} />}


                    </Pressable>
                  </View>

                </View>
              </View>}

              {(ninVerificationStatus !== VERIFICATION_STATUS.APPROVED) && <View style={styles.cardCont}>

                <View style={styles.headerLabelCont}>
                  <Text style={styles.headerLabelText}>National Identification Number (NIN)</Text>
                  <View style={[styles.statusCont, { backgroundColor: ninStatusBgColor }]}>
                    {ninVerificationStatus == "REJECTED" ?
                      <MaterialCommunityIcons
                        name={"shield-off"}
                        size={20}
                        color={ninStatusTextColor}
                      />
                      :
                      ninVerificationStatus == "PENDING" ?
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={ninStatusTextColor}
                        />
                        :
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={ninStatusTextColor}
                        />
                    }
                    <Text style={[styles.statusText, { color: ninStatusTextColor }]}>{ninStatusText}</Text>
                  </View>
                </View>


                <View style={styles.identityLabelInfoCont}>
                  <Text style={styles.identityLabelText}>NIN Number</Text>
                  <Pressable onPress={() => editIdentityInfo("nin_no")} style={[styles.identityLabelCont, { backgroundColor: nin_no_issue ? Colors.errorBackground : Colors.background }]}>
                    <Text style={styles.identityLabelNo}>{ninNo}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
                  </Pressable>
                  {nin_no_issue && <Text style={styles.issuesText}>{nin_no_issues_code}</Text>}

                </View>

                <View style={styles.identityLabelInfoCont}>
                  <Text style={styles.identityLabelText}>NIN Image</Text>
                  <View style={[styles.identityDocumentImageContainer, { borderColor: nin_photo_issue ? Colors.error : Colors.background }]}>
                   { ninImage && <Image source={{ uri: ninImage }} onLoad={()=> setNinImageLoading(false)} style={styles.identityDocumentImage} />}
                   {ninImageLoading && <ImageLoadingPlaceHolder/>}
                   {!ninImageLoading && <TouchableOpacity onPress={() => setShowPhotoBottomSheet("nin")} style={styles.changePhotoCont}>
                      <Text style={styles.changePhotoText}>change photo</Text>
                    </TouchableOpacity>}

                  </View>
                  {nin_photo_issue && <Text style={styles.issuesText}>{nin_photo_issues_code}</Text>}
                </View>

              </View>}


              {(driverLicenseVerificationStatus !== VERIFICATION_STATUS.APPROVED) && <View style={styles.cardCont}>
                <View style={styles.headerLabelCont}>
                  <Text style={styles.headerLabelText}>Driver License</Text>
                  <View style={[styles.statusCont, { backgroundColor: driverLicenseStatusBgColor }]}>
                    {driverLicenseVerificationStatus == "REJECTED" ?
                      <MaterialCommunityIcons
                        name={"shield-off"}
                        size={20}
                        color={driverLicenseStatusTextColor}
                      />
                      :
                      driverLicenseVerificationStatus == "PENDING" ?
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={driverLicenseStatusTextColor}
                        />
                        :
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={driverLicenseStatusTextColor}
                        />
                    }
                    <Text style={[styles.statusText, { color: driverLicenseStatusTextColor }]}>{driverLicenseStatusText}</Text>
                  </View>
                </View>


                <View style={styles.identityLabelInfoCont}>
                  <Text style={styles.identityLabelText}>License Number</Text>
                  <Pressable onPress={() => editIdentityInfo("license_no")} style={[styles.identityLabelCont, { backgroundColor: driver_license_no_issue ? Colors.errorBackground : Colors.background }]}>
                    <Text style={styles.identityLabelNo}>{driverLicenseNo}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
                  </Pressable>
                  {driver_license_no_issue && <Text style={styles.issuesText}>{driver_license_no_issues_code}</Text>}
                </View>

                <View style={styles.identityLabelInfoCont}>
                  <Text style={styles.identityLabelText}>License Class</Text>
                  <Pressable onPress={() => setOpenEditDriverLicenseClass(true)} style={[styles.identityLabelCont, { backgroundColor: driver_license_class_issue ? Colors.errorBackground : Colors.background }]}>
                    <Text style={styles.identityLabelNo}>{driverLicenseClass}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
                  </Pressable>
                  {driver_license_class_issue && <Text style={styles.issuesText}>{driver_license_class_issues_code}</Text>}
                </View>

                <View style={styles.identityLabelInfoCont}>
                  <Text style={styles.identityLabelText}>License Expiry Date</Text>
                  <Pressable onPress={() => editIdentityInfo("license_expiry_date")} style={[styles.identityLabelCont, { backgroundColor: driver_license_expiry_issue ? Colors.errorBackground : Colors.background }]}>
                    <Text style={styles.identityLabelNo}>{driverLicenseExpiryDate}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
                  </Pressable>
                  {driver_license_expiry_issue && <Text style={styles.issuesText}>{driver_license_expiry_issues_code}</Text>}

                </View>


                <View style={styles.identityLabelInfoCont}>
                  <Text style={styles.identityLabelText}>Driver License Image</Text>
                  <View style={[styles.identityDocumentImageContainer, { borderColor: driver_license_photo_issue ? Colors.errorBackground : Colors.background }]}>
                    {driverLicenseImage && <Image source={{ uri: driverLicenseImage }} onLoad={()=> setDriverLicenseImageLoading(false)} style={styles.identityDocumentImage} />}
                     {driverLicenseImageLoading && <ImageLoadingPlaceHolder/>}
                   {!driverLicenseImageLoading && <TouchableOpacity onPress={() => setShowPhotoBottomSheet("driver_license")} style={styles.changePhotoCont}>
                      <Text style={styles.changePhotoText}>change photo</Text>
                    </TouchableOpacity>}
                  </View>
                  {driver_license_photo_issue && <Text style={styles.issuesText}>{driver_license_photo_issues_code}</Text>}

                </View>

              </View>
              }

            </View>
          </View>}
        </ScrollView>

      </View>
      {(openEditBottomSheet || openEditDriverLicenseClass || showUpdateLicenseInfoBottomSheet) && <View style={styles.bottomSheetCoverContainer} />}

      {openEditBottomSheet && <UpdateIdentityBottomSheet
        openEditBottomSheet={openEditBottomSheet}
        setOpenEditBottomSheet={setOpenEditBottomSheet}
        ninNo={ninNo}
        setNinNo={setNinNo}
        driverLicenseNo={driverLicenseNo}
        setDriverLicenseNo={setDriverLicenseNo}
        driverLicenseExpiryDate={driverLicenseExpiryDate}
        setDriverLicenseExpiryDate={setDriverLicenseExpiryDate}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        identityInfoVerificationIssues={identityInfoVerificationIssues}
        setIdentityInfoVerificationIssues={setIdentityInfoVerificationIssues}
        setNinVerificationStatus={setNinVerificationStatus}
        setDriverLicenseVerificationStatus={setDriverLicenseVerificationStatus}
      />
      }

      {
        showPhotoBottomSheet && <UpdateIdentityPhotoBottomSheet
          showPhotoBottomSheet={showPhotoBottomSheet}
          setShowPhotoBottomSheet={setShowPhotoBottomSheet}
          setShowLoadingSpinner={setShowLoadingSpinner}
          ninImgPath={ninImgPath}
          driverLicenseImgPath={driverLicenseImgPath}
          setNinImage={setNinImage}
          setDriverLicenseImage={setDriverLicenseImage}
          setShowErrorAlert={setShowErrorAlert}
          identityInfoVerificationIssues={identityInfoVerificationIssues}
          setIdentityInfoVerificationIssues={setIdentityInfoVerificationIssues}
          setNinVerificationStatus={setNinVerificationStatus}
          setDriverLicenseVerificationStatus={setDriverLicenseVerificationStatus}
        />
      }
      {showLoadingSpinner && <Pressable onPress={() => { return }} style={styles.fillScreen}>
        <NanoLoadingSpinner />
      </Pressable>}

      {showErrorAlert && <View style={styles.fillScreen}>
        <View style={styles.errorCont}>
          <Text style={styles.errorText}>Internet connection seems to be offline</Text>
        </View>
      </View>}

      {openEditDriverLicenseClass && <EditDriverLicenseBottomSheet
        setOpenEditDriverLicenseClass={setOpenEditDriverLicenseClass}
        setDriverLicenseClass={setDriverLicenseClass}
        driverLicenseClass={driverLicenseClass}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        setIdentityInfoVerificationIssues={setIdentityInfoVerificationIssues}
        setDriverLicenseVerificationStatus={setDriverLicenseVerificationStatus}
      />
      }

      {showUpdateLicenseInfoBottomSheet && <UpdateLicenseInfoBottomSheet
        setShowUpdateLicenseInfoBottomSheet={setShowUpdateLicenseInfoBottomSheet}
        showUpdateLicenseInfoBottomSheet={showUpdateLicenseInfoBottomSheet}
        setShowLoadingSpinner={setShowLoadingSpinner}
        setShowErrorAlert={setShowErrorAlert}
        pendingLicenseClass={pendingLicenseClass}
        setPendingLicenseClass={setPendingLicenseClass}
        pendingLicensePhoto={pendingLicensePhoto}
        setPendingLicensePhoto={setPendingLicensePhoto}
        pendingLicenseExpiryDate={pendingLicenseExpiryDate}
        setPendingLicenseExpiryDate={setPendingLicenseExpiryDate}
        pending_driver_license_photo_issues_code={pending_driver_license_photo_issues_code}
        pending_driver_license_class_issues_code={pending_driver_license_class_issues_code}
        pending_driver_license_expiry_date_issues_code={pending_driver_license_expiry_date_issues_code}
        setIdentityInfoVerificationIssues={setIdentityInfoVerificationIssues}
      />
      }

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
    fontSize: FONT_SIZES.sm,
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
    flexDirection: "row",
    alignItems: "center",
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
  verifiedDetailsContainer: {
    gap: 15
  },
  verifiedHeaderIconCont: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: Colors.transparentBlue,
    alignSelf: "center"
  },
  verifiedInnerHeaderIconCont: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.round,

  },
  greenCheckCont: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: Colors.green,
    position: "absolute",
    right: 0,
    bottom: 0
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
  issuesText: {
    fontSize: FONT_SIZES.xs,
    color: Colors.error,
    fontFamily: FONTS.medium
    },
  pendingLicenseUpdateIconCont: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    marginLeft: "auto",
    marginRight: 20
  }

})