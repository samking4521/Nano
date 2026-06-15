export type RootAuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  RoleSelection: {
     mobileNo: string | null,
       email: string | null,
  };
  MerchantInfo: undefined;
  VerificationCode: {mobileNo: string};

};

export type RootUserStackParamList = {
  Home: undefined;
  
};

