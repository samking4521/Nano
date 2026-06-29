export type RootAuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  RoleSelection: {
    mobileNo: string | null,
    email: string | null,
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
    userId: string
  };
  MerchantInfo: {
    mobileNo: string | null,
    email: string | null,
    role: "Merchant",
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
    userId: string
  };
  DriverInfo: {
    mobileNo: string | null,
    email: string | null,
    role: "Driver",
    country: string | null,
    countryCode: string | null,
    callingCode: string | null,
     userId: string
  };
  VehicleInfo: {
    mobileNo: string | null,
    email: string | null,
    role: "Driver",
    country: string | null,
    
  };
  VerificationCode: {
    mobileNo: string,
    country: string,
    countryCode: string,
    callingCode: string,
   
  };
  PaymentInfo: {
     mobileNo: string | null,
    email: string | null,
    role: "Driver",
    country: string | null
  },
   SubmitScreen: undefined
};

export type RootUserStackParamList = {
  Home: undefined;

};

