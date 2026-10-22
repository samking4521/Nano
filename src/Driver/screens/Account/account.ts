import { VERIFICATION_STATUS } from "../../../constants/shared_user";
import { driverDetailsType } from "./components/AssignDriver";
import { vehicle_document_data_type, vehicle_info_type, vehicleImgsType } from "./screens/VehicleDetails";

export type RootDriverStackParamList = {
  HomeScreen: undefined
  Profile: undefined
  Vehicle: undefined
  PersonalInfo: undefined
  IdentityInfo: undefined
  VehicleInfo: {
    vehicle_data: vehicle_info_type,
    isVehicleOwner: React.RefObject<boolean | null>,
    onUpdateVehicle: (vehicleData: any) => void,
    onUpdateVehicleImg: (vehicleImg: any) => void,
    onUpdatePendingVehicleLicenseImgKey: (vehicleLicensePhotoKey: string | null) => void,
    pending_license_photo_key: string | null,
    vehicleImages: vehicleImgsType[],
    vehicleVerificationStatus: VERIFICATION_STATUS | undefined,
    vehicleInfoVerificationIssues: any[] | null,
    onUpdateVehicleVerificationStatus: (verification_status: VERIFICATION_STATUS) => void,
    onUpdateVehicleInfoVerificationIssues: (verification_issues: any[] | null) => void
  }
  VehicleRegistration: {
    vehicle_document: vehicle_document_data_type,
    isVehicleOwner: React.RefObject<boolean | null>,
    vehicle_document_verification_issues: any[] | null,
    vehicle_document_status: VERIFICATION_STATUS | undefined,
    onUpdateVehicleDocumentVerificationStatus: (verification_status: VERIFICATION_STATUS) => void,
    onUpdateVehicleDocumentVerificationIssues: (verification_issues: any[] | null) => void,
    onUpdateVehicleDocuments: (vehicleDocumentsData: any) => void
  }
  VehicleDriver: {
     currentDriver: any | null,
     vehicleId: string,
     onUpdateCurrentDriver: (driverObj: driverDetailsType | null) => void
     vehicleVerificationStatus: VERIFICATION_STATUS | undefined
     updateVehicles: (vehicles: any[]) => void
      isVehicleOwner: React.RefObject<boolean | null>,
  }
  VehicleDetails: {
    vehicleId: string  ,
    updateVehicles: (vehicles: any[]) => void   
  }
};