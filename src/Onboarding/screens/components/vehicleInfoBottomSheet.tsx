import { StyleSheet, View } from 'react-native'
import { RefObject, useMemo } from 'react'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { Colors } from '../../../constants/colors'
import VehicleType from './vehicleType'
import { vehicleType } from '../../../../assets/truck_data'

type vehicleInfoBottomSheetType = {
    vehicleTypeBottomSheetRef: RefObject<BottomSheet | null>;
    selectVehicleType: (truck: vehicleType) => void;
    parentVehicleType: vehicleType;
    isVehicleBottomSheetOpen: boolean;
    setIsVehicleBottomSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function VehicleInfoBottomSheet({ vehicleTypeBottomSheetRef, selectVehicleType, isVehicleBottomSheetOpen, setIsVehicleBottomSheetOpen, parentVehicleType  }: vehicleInfoBottomSheetType) {
    const snapPoints = useMemo(() => ['90%'], []);

    const closeVehicleTypeBottomSheet = (vehicleTypeVal: vehicleType) => {
         vehicleTypeBottomSheetRef.current?.close();
        selectVehicleType(vehicleTypeVal);
        setIsVehicleBottomSheetOpen(false);
       
    }

   
    const submitVehicleType = (vehicleTypeVal: vehicleType) => {
          vehicleTypeBottomSheetRef.current?.close();
        selectVehicleType(vehicleTypeVal)
          setIsVehicleBottomSheetOpen(false);
      
    }


    return (

        <>
            
            <BottomSheet
                ref={vehicleTypeBottomSheetRef}
                containerStyle={{backgroundColor: isVehicleBottomSheetOpen? "rgba(0,0,0,0.5)" : undefined}}
                handleIndicatorStyle={{ display: "none" }}
                index={-1}
                snapPoints={snapPoints}
                backgroundStyle={{ backgroundColor: Colors.background }}
            >
                <BottomSheetView style={styles.bottomSheetCont}>
                  <VehicleType closeVehicleTypeBottomSheet={closeVehicleTypeBottomSheet} submitVehicleType={submitVehicleType} parentVehicleType={parentVehicleType} />
                </BottomSheetView>
            </BottomSheet>
        </>
    )
}

const styles = StyleSheet.create({
    bottomSheetCont: {
        height: "100%"
    },

})