export type OnboardingStackParamList = {
  RoleSelection: {
    mobileNo: string | null,
    email: string | null,
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
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