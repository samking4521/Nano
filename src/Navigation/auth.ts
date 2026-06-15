export type RootAuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  RoleSelection: {
     mobileNo: string | null,
       email: string | null,
  };
  MerchantInfo: {
     mobileNo: string | null,
       email: string | null,
       role: "Merchant" | "Driver"
  };
  VerificationCode: {mobileNo: string};

};

export type RootUserStackParamList = {
  Home: undefined;
  
};

