import { USER_ROLES } from "../constants/shared_user";

export type OnboardingStackParamList = {
  RoleSelection: {
    mobileNo: string | null,
    email: string | null,
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
    user_role?: USER_ROLES | null
  };
  ShipperInfo: {
     mobileNo: string | null,
    email: string | null,
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
  };
  DriverInfo: {
     mobileNo: string | null,
    email: string | null,
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
  };
  IdentityVerification: undefined;
  OwnershipStatus: undefined;
  SubmitScreen: undefined;
}