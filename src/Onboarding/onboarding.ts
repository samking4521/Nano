export type OnboardingStackParamList = {
  RoleSelection: {
    mobileNo: string | null,
    email: string | null,
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
  };
  MerchantInfo: {
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
  OwnershipStatus: undefined;
  VehicleInfo: undefined;
  PaymentInfo: undefined,
  SubmitScreen: undefined
}