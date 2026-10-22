import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useCallback, useMemo, useState } from 'react'
import BottomSheet, { BottomSheetFooter, BottomSheetFooterProps, BottomSheetView } from '@gorhom/bottom-sheet'
import { vehicleDataType, vehicleType, vehicleTypeData } from '../../../../../assets/truck_data'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors'
import { supabase } from '../../../../lib/supabase'
import { VERIFICATION_ISSUES_FIELD, VERIFICATION_ISSUES_SECTION } from '../../../../constants/driver'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { useDriverStore } from '../../../store/DriverStore'

type vehicleInfoBottomSheetType = {
    selectVehicleType: (truck: vehicleType) => void
    parentVehicleType: vehicleType
    isVehicleBottomSheetOpen: boolean
    setIsVehicleBottomSheetOpen: React.Dispatch<React.SetStateAction<boolean>>
    vehicleId: string
    setShowLoadingSpinner: React.Dispatch<React.SetStateAction<boolean>>
    setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>
    onUpdateVehicle: (vehicleData: any) => void
    setVehicleVerificationStatus: React.Dispatch<React.SetStateAction<VERIFICATION_STATUS | undefined>>
    setVehicleInfoVerificationIssues: React.Dispatch<React.SetStateAction<any[] | null>>
    onUpdateVehicleInfoVerificationIssues: (verification_issues: any[] | null) => void
    onUpdateVehicleVerificationStatus: (verification_status: VERIFICATION_STATUS) => void
    vehicleVerificationStatus: VERIFICATION_STATUS | undefined
}

type VehicleTypeItemProps = {
    item: vehicleDataType;
    vehicleType: vehicleType;
    setVehicleType: React.Dispatch<React.SetStateAction<vehicleType>>;
}

const VehicleTypeItem = ({ item, vehicleType, setVehicleType }: VehicleTypeItemProps) => {
    return (
        <Pressable onPress={() => setVehicleType(item.name)} style={{ borderRadius: 10, flex: 1, height: 200, borderWidth: (vehicleType) == item.name ? 2 : 1, justifyContent: "center", alignItems: "center", borderColor: (vehicleType) == item.name ? Colors.primary : Colors.borderColor }}>
            <Image source={item.image} style={{ width: "100%", height: 100 }} resizeMode="contain" />
            <Text style={styles.headerDesc}>{item.name}</Text>
            <MaterialCommunityIcons style={{ position: "absolute", top: 10, left: 10 }} size={24} color={(vehicleType) == item.name ? Colors.primary : Colors.borderColor} name={(vehicleType) == item.name ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} />
        </Pressable>
    )
}


export default function VehicleInfoBottomSheet({ selectVehicleType, isVehicleBottomSheetOpen, setIsVehicleBottomSheetOpen, parentVehicleType, vehicleId, setShowLoadingSpinner, setShowErrorAlert, onUpdateVehicle, setVehicleVerificationStatus, setVehicleInfoVerificationIssues, onUpdateVehicleVerificationStatus, onUpdateVehicleInfoVerificationIssues, vehicleVerificationStatus }: vehicleInfoBottomSheetType) {
    const pendingVehicleUpdate = useDriverStore((store) => store.pendingVehicleUpdate);
    const setPendingVehicleUpdate = useDriverStore((store) => store.setPendingVehicleUpdate);
    const snapPoints = useMemo(() => ['90%'], []);
    const [vehicleType, setVehicleType] = useState<vehicleType>(() => parentVehicleType ?? "");




    const closeVehicleTypeBottomSheet = () => {
        setIsVehicleBottomSheetOpen(false);
    }

    const updateVehicleInformation = async (vehicle_type_val: vehicleType) => {
        if (!vehicleType) return
        closeVehicleTypeBottomSheet();
        setShowLoadingSpinner(true);

        const { error } = await supabase
            .from("Vehicle")
            .update({ vehicle_type: vehicleType })
            .eq("id", vehicleId)

        if (error) {
            throw new Error(`Error updating vehicle: ${error.message}`);
        }


        const {
            error: vehicle_verification_issue_delete_error,
        } = await supabase
            .from("Vehicle_Verification_Issues")
            .delete()
            .eq("vehicle_id", vehicleId)
            .eq(
                "field",

                VERIFICATION_ISSUES_FIELD.VEHICLE_TYPE

            );

        if (vehicle_verification_issue_delete_error) {
            throw new Error(
                `Error deleting vehicle verification issue: ${vehicle_verification_issue_delete_error.message}`
            );
        }



        const vehicle_verification_issues = await getVehicleVerificationIssues();

        let isUpdatedToPending = false;

        if (vehicle_verification_issues.length == 0) {
            const { error } = await supabase
                .from("Vehicle_Verification")
                .update({ verification_status: VERIFICATION_STATUS.PENDING })
                .eq("vehicle_id", vehicleId)

            if (error) {
                throw new Error(`Error updating vehicle verification status: ${error.message}`);
            }

            isUpdatedToPending = true;

            setVehicleVerificationStatus(VERIFICATION_STATUS.PENDING);
            onUpdateVehicleVerificationStatus(VERIFICATION_STATUS.PENDING);
            setPendingVehicleUpdate({
                vehicleId: vehicleId,
                vehicleVerificationStatus: VERIFICATION_STATUS.PENDING,
                vehicleInfoVerificationIssues: vehicle_verification_issues.length,
                vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
                vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
                vehicle_year: pendingVehicleUpdate?.vehicle_year,
                vehicle_type: pendingVehicleUpdate?.vehicle_type,
                vehicle_url: pendingVehicleUpdate?.vehicle_url,
                vehicleDocumentVerificationStatus: pendingVehicleUpdate?.vehicleDocumentVerificationStatus,
                vehicleDocumentVerificationIssues: pendingVehicleUpdate?.vehicleDocumentVerificationIssues,
            })

        }

        selectVehicleType(vehicle_type_val);

        onUpdateVehicle({
            vehicle_type: vehicleType
        });

        setPendingVehicleUpdate({
            vehicleId: vehicleId,
            vehicle_type: vehicleType,
            vehicleVerificationStatus: isUpdatedToPending ? VERIFICATION_STATUS.PENDING : vehicleVerificationStatus,
            vehicleInfoVerificationIssues: vehicle_verification_issues.length,
            vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
            vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
            vehicle_year: pendingVehicleUpdate?.vehicle_year,
            vehicle_url: pendingVehicleUpdate?.vehicle_url,
            vehicleDocumentVerificationStatus: pendingVehicleUpdate?.vehicleDocumentVerificationStatus,
            vehicleDocumentVerificationIssues: pendingVehicleUpdate?.vehicleDocumentVerificationIssues,
        })

        setShowLoadingSpinner(false);

    }

    const getVehicleVerificationIssues = async () => {
        const {
            data: vehicle_verification_issues,
            error: vehicle_verification_issues_error,
        } = await supabase
            .from("Vehicle_Verification_Issues")
            .select("*")
            .eq("vehicle_id", vehicleId)
            .eq("section", VERIFICATION_ISSUES_SECTION.VEHICLE_INFO);

        if (vehicle_verification_issues_error) {
            throw new Error(
                `Error querying vehicle verification issues: ${vehicle_verification_issues_error.message}`
            );
        }

        setVehicleInfoVerificationIssues(vehicle_verification_issues);
        onUpdateVehicleInfoVerificationIssues(vehicle_verification_issues);
        setPendingVehicleUpdate({
            vehicleId: vehicleId,
            vehicleInfoVerificationIssues: vehicle_verification_issues.length,
            vehicleVerificationStatus: vehicleVerificationStatus,
            vehicle_capacity: pendingVehicleUpdate?.vehicle_capacity,
            vehicle_plate_number: pendingVehicleUpdate?.vehicle_plate_number,
            vehicle_year: pendingVehicleUpdate?.vehicle_year,
            vehicle_type: pendingVehicleUpdate?.vehicle_type,
            vehicle_url: pendingVehicleUpdate?.vehicle_url,
            vehicleDocumentVerificationStatus: pendingVehicleUpdate?.vehicleDocumentVerificationStatus,
            vehicleDocumentVerificationIssues: pendingVehicleUpdate?.vehicleDocumentVerificationIssues,
        })
        return vehicle_verification_issues;

    }




    const submitVehicleType = async (vehicleTypeVal: vehicleType) => {
        try {
            if (!vehicleType) return;
            await updateVehicleInformation(vehicleTypeVal);
        } catch (e) {
            console.log("Error: ", e);
            setShowLoadingSpinner(false);
            setShowErrorAlert(true);
        }

    }

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => (
            <BottomSheetFooter {...props}>
                <View style={styles.footerCont}>
                    <Pressable onPress={() => submitVehicleType(vehicleType)} style={styles.nextBtn}>
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>
                </View>
            </BottomSheetFooter>
        ),
        [vehicleType]
    )


    const renderItem = useCallback(({ item }: { item: vehicleDataType }) => {
        return <VehicleTypeItem item={item} setVehicleType={setVehicleType} vehicleType={vehicleType} />
    }, [vehicleType]);


    return (


        <BottomSheet
            containerStyle={{ backgroundColor: isVehicleBottomSheetOpen ? "rgba(0,0,0,0.5)" : undefined }}
            handleIndicatorStyle={{ display: "none" }}
            index={1}
            snapPoints={snapPoints}
            backgroundStyle={{ backgroundColor: Colors.background }}
            footerComponent={renderFooter}
        >
            <BottomSheetView style={styles.bottomSheetCont}>
                <View style={[styles.bottomSheetViewCont]}>

                    <View style={{ ...styles.bottomSheetHeaderCont, paddingHorizontal: 15 }}>
                        <Pressable onPress={closeVehicleTypeBottomSheet} style={styles.bottomSheetCloseIconCont}>
                            <AntDesign name="close" size={16} color={Colors.text.gray} />
                        </Pressable>
                        <View>
                            <Text style={styles.headerText}>Select Vehicle Type</Text>
                        </View>
                        <View style={{ ...styles.bottomSheetCloseIconCont, backgroundColor: undefined }} />
                    </View>

                    <FlatList
                        data={vehicleTypeData}
                        renderItem={renderItem}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            rowGap: 10,
                            paddingBottom: 100

                        }}
                        columnWrapperStyle={{
                            paddingHorizontal: 10,
                            gap: 10,

                        }}

                    />



                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    bottomSheetCont: {
        height: "100%"
    },
    bottomSheetViewCont: {
        flex: 1,
        paddingHorizontal: 5,

    },
    headerDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        marginTop: 10,
        color: Colors.text.gray
    },
    bottomSheetHeaderCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15
    },
    bottomSheetCloseIconCont: {
        width: 30,
        height: 30,
        borderRadius: 30,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    headerText: {
        fontSize: FONT_SIZES.lg,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black

    },
    continueText: {
        color: Colors.text.white,
        fontWeight: "600",
        fontSize: 16
    },
    nextBtn: {
        height: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary,

    },
    footerCont: {
        backgroundColor: Colors.background,
        paddingTop: 10,
        paddingBottom: 30,
        paddingHorizontal: 10,
        borderTopWidth: 0.5,
        borderTopColor: Colors.borderColor
    }

})