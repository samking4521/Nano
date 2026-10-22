import { create } from "zustand";
import { VERIFICATION_STATUS } from "../../constants/shared_user";

interface pendingVehicleObj {
    vehicleId: string
    vehicle_type: string | undefined
    vehicle_year: string | undefined
    vehicle_capacity: string | undefined
    vehicle_plate_number: string | undefined
    vehicle_url: string | undefined
    vehicleVerificationStatus: VERIFICATION_STATUS | undefined
    vehicleDocumentVerificationStatus: VERIFICATION_STATUS | undefined
    vehicleInfoVerificationIssues: number | undefined
    vehicleDocumentVerificationIssues: number | undefined
}

export type DriverStore = {
    driverImgKey: string | undefined
    driverFirstName: string | undefined
    driverLastName: string | undefined
    driverVerificationStatus: VERIFICATION_STATUS | undefined
    ninVerificationStatus: VERIFICATION_STATUS | undefined
    driverLicenseVerificationStatus: VERIFICATION_STATUS | undefined
    personalInfoVerificationIssues: any[] | null
    identityInfoVerificationIssues: any[] | null
    isOwnerAllVehiclesApproved: boolean
    canGoLive: boolean,
    pendingVehicleUpdate: pendingVehicleObj | undefined,
    setPendingVehicleUpdate: (obj: pendingVehicleObj | undefined) => void,
    setDriverImgKey: (key: string) => void
    setDriverFirstName: (first_name: string) => void
    setDriverLastName: (last_name: string) => void
    setDriverVerificationStatus: (status: VERIFICATION_STATUS | undefined) => void
    setNinVerificationStatus: (status: VERIFICATION_STATUS | undefined) => void
    setDriverLicenseVerificationStatus: (status: VERIFICATION_STATUS | undefined) => void
    setIsOwnerAllVehiclesApproved: (state: boolean) => void
    setPersonalInfoVerificationIssues: (data: any[] | null) => void
    setIdentityInfoVerificationIssues: (data: any[] | null) => void
    setCanGoLive: (state: boolean) => void

};


export const useDriverStore = create<DriverStore>((set) => (
    {
        driverImgKey: undefined,
        driverFirstName: undefined,
        driverLastName: undefined,
        driverVerificationStatus: undefined,
        ninVerificationStatus: undefined,
        driverLicenseVerificationStatus: undefined,
        isOwnerAllVehiclesApproved: false,
        canGoLive: false,
        pendingVehicleUpdate: undefined,
        personalInfoVerificationIssues: null,
        identityInfoVerificationIssues: null,
        setDriverImgKey: (key: string) => set({ driverImgKey: key }),
        setDriverFirstName: (first_name: string) => set({ driverFirstName: first_name }),
        setDriverLastName: (last_name: string) => set({ driverLastName: last_name }),
        setPendingVehicleUpdate: (obj: pendingVehicleObj | undefined) => set({ pendingVehicleUpdate: obj }),
        setDriverVerificationStatus: (status: VERIFICATION_STATUS | undefined) => set({ driverVerificationStatus: status }),
        setNinVerificationStatus: (status: VERIFICATION_STATUS | undefined) => set({ ninVerificationStatus: status }),
        setDriverLicenseVerificationStatus: (status: VERIFICATION_STATUS | undefined) => set({ driverLicenseVerificationStatus: status }),
        setIsOwnerAllVehiclesApproved: (state: boolean) => set({ isOwnerAllVehiclesApproved: state }),
        setPersonalInfoVerificationIssues: (data: any[] | null) => set({ personalInfoVerificationIssues: data }),
        setIdentityInfoVerificationIssues: (data: any[] | null) => set({ identityInfoVerificationIssues: data }),
        setCanGoLive: (state: boolean) => set({ canGoLive: state })
    }
));