import { Pressable, StyleSheet, Text, View } from 'react-native'
import BottomSheet, { BottomSheetFlatList, BottomSheetFooter, BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import React, { useCallback, useMemo, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'

export type licenseClassType = 'CLASS A' | 'CLASS B' | 'CLASS C' | 'CLASS D' | 'CLASS E' | 'CLASS F' | 'CLASS G' | 'CLASS H' | 'CLASS I' | 'CLASS J' | 'CLASS V'
const license_class_arr: licenseClassType[] = [
  'CLASS A',
  'CLASS B',
  'CLASS C',
  'CLASS D',
  'CLASS E',
  'CLASS F',
  'CLASS G',
  'CLASS H',
  'CLASS J',
  'CLASS V'

]

type EditDriverLicenseBottomSheetProps = {
  setOpenEditDriverLicenseClass: React.Dispatch<React.SetStateAction<boolean>>
  setDriverLicenseClass: React.Dispatch<React.SetStateAction<string>>
  setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
  driverLicenseClass: string
  setIdentityInfoVerificationIssues: (data: any[] | null) => void
  setDriverLicenseVerificationStatus: (status: VERIFICATION_STATUS) => void
}


const LicenseClass = React.memo(({ item, index, driverLicenseClass, setDriverLicenseClass }: { item: string, index: number, driverLicenseClass: string, setDriverLicenseClass: React.Dispatch<React.SetStateAction<string>> }) => {
  return (
    <Pressable onPress={() => setDriverLicenseClass(item)} key={`${item}-${index}`} style={[styles.licenseClassCont, { borderColor: item == driverLicenseClass ? Colors.primary : Colors.borderColor, backgroundColor: item == driverLicenseClass ? Colors.primaryTransparent : undefined }]}>
      <Text style={styles.licenseclassText}>{item}</Text>
      <Ionicons name={item == driverLicenseClass ? "checkmark-circle" : "checkmark-circle-outline"} size={24} color={item == driverLicenseClass ? Colors.primary : Colors.borderColor} />
    </Pressable>
  )
})

export default function EditDriverLicenseBottomSheet({ setOpenEditDriverLicenseClass, setDriverLicenseClass: setParentDriverLicenseClass, driverLicenseClass: parentDriverLicenseClass, setShowErrorAlert, setShowLoadingSpinner, setIdentityInfoVerificationIssues, setDriverLicenseVerificationStatus }: EditDriverLicenseBottomSheetProps) {
  const [driverLicenseClass, setDriverLicenseClass] = useState(() => parentDriverLicenseClass ?? "");
  const snapPoints = useMemo(() => ['60%'], []);


  const renderItem = useCallback(({ item, index }: { item: string, index: number }) => {
    return (
      <LicenseClass item={item} index={index} driverLicenseClass={driverLicenseClass} setDriverLicenseClass={setDriverLicenseClass} />
    )
  }, [driverLicenseClass]);




  const submitDriverLicenseClass = async () => {
      try {
        setOpenEditDriverLicenseClass(false);
        setShowLoadingSpinner(true);

        const { data, error } = await supabase.rpc('update_identity_info', {
            p_field: 'license_class',
            p_value: driverLicenseClass,
        });

        if (error) {
            throw new Error(`Error updating identity info: ${error.message}`);
        }

        const { updated, verification_issues, driver_license_verification_status } = data;

        setParentDriverLicenseClass(updated.license_class);
        setIdentityInfoVerificationIssues(verification_issues);
        setDriverLicenseVerificationStatus(driver_license_verification_status);

        setShowLoadingSpinner(false);

    } catch (e) {
        console.log("Error: ", e);
        setShowLoadingSpinner(false);
        setShowErrorAlert(true);
    }
  }

 


  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      enableOverDrag={false}
      backgroundStyle={{ backgroundColor: Colors.background }}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      handleStyle={styles.handleStyle}
      footerComponent={(props) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View style={styles.footer}>
            <Pressable onPress={submitDriverLicenseClass} style={[styles.confirmBtn]}>
              <Text style={[styles.confirmBtnText]}>Confirm</Text>
            </Pressable>
          </View>

        </BottomSheetFooter>
      )}
    >

      <BottomSheetView style={styles.body}>
        <View>
          <Pressable onPress={() => setOpenEditDriverLicenseClass(false)} style={styles.closeBtn}>
            <AntDesign name="close" color={Colors.text.black} size={18} />
          </Pressable>
        </View>

        <View style={{ gap: 5, marginBottom: 15 }}>
          <Text style={styles.headerLabelText}>Edit Driver License Class</Text>
          <Text style={styles.headerLabelDesc}>Select the class shown on your driver's license</Text>
        </View>



        <View>
          <BottomSheetFlatList
            data={license_class_arr}
            renderItem={renderItem}
            contentContainerStyle={{ gap: 10, paddingBottom: 200 }}
           showsVerticalScrollIndicator={false}
          />
        </View>






      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({

  body: {
    height: "100%",
    backgroundColor: Colors.background,
    paddingHorizontal: 15
  },
  handleStyle: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  handleIndicatorStyle: {
    backgroundColor: Colors.boxBackground
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: Colors.backBtnGray,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end"
  },
  headerLabelText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: Colors.text.black,
  },

  confirmBtn: {
    width: "90%",
    height: 50,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center"
  },
  confirmBtnText: {
    fontSize: FONT_SIZES.md,
    color: Colors.text.white,
    fontFamily: FONTS.medium
  },
  licenseClassCont: {
    width: "100%",
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor
  },
  licenseclassText: {
    fontSize: FONT_SIZES.md,
    color: Colors.text.black,
    fontFamily: FONTS.semiBold
  },
  headerLabelDesc: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: Colors.text.gray,
  },
  licenseDetailCont: {
    marginTop: 10,
    gap: 10
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: Colors.background
  }
})