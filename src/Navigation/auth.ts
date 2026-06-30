export type RootAuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
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
    role: "Merchant",
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
  };
  DriverInfo: {
    mobileNo: string | null,
    email: string | null,
    role: "Driver",
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
  };
  VehicleInfo: undefined;
  VerificationCode: {
    mobileNo: string,
    country: string,
    countryCode: string,
    callingCode: string,
  };
  PaymentInfo: undefined,
   SubmitScreen: undefined
};

export type RootUserStackParamList = {
  Home: undefined;

};

