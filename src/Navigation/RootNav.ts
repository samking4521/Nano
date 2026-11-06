import { USER_ROLES } from "../constants/shared_user";

export type RootNavigationStackParamList = {
  Auth: undefined;
  Onboard: {
    mobileNo: string | null,
    email: string | null,
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
    user_role?: USER_ROLES | null
  };
  Shipper: undefined;
  Driver: undefined;
}