export type RootNavigationStackParamList = {
  Auth: undefined;
  Onboard: {
    mobileNo : string | null,
    email: string | null,
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
  };
}