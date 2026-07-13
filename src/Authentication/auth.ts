export type RootAuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  VerificationCode: {
    mobileNo: string,
    country: string,
    countryCode: string,
    callingCode: string,
  };
};