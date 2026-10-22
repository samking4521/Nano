export enum ONLINE_STATUS {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum DRIVER_DOCUMENT_TYPE {
  NIN = 'NIN',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  VEHICLE_REGISTRATION_CERTIFICATE = 'VEHICLE_REGISTRATION_CERTIFICATE'
}

export enum VERIFICATION_ISSUES_SECTION {
  PERSONAL_INFO = 'PERSONAL_INFO',
  IDENTITY_INFO = 'IDENTITY_INFO',
  VEHICLE_INFO = 'VEHICLE_INFO',
  VEHICLE_DOCS = 'VEHICLE_DOCS'
}

export enum VERIFICATION_ISSUES_FIELD {
  FIRST_NAME = 'FIRST_NAME',
  LAST_NAME = 'LAST_NAME',
  BIRTH_DAY = 'BIRTH_DAY',
  DRIVER_PHOTO = 'DRIVER_PHOTO',
  PENDING_DRIVER_PHOTO = 'PENDING_DRIVER_PHOTO',
  PENDING_DRIVER_LICENSE_CLASS = 'PENDING_DRIVER_LICENSE_CLASS',
  PENDING_DRIVER_LICENSE_EXPIRY_DATE = 'PENDING_DRIVER_LICENSE_EXPIRY_DATE',
  PENDING_DRIVER_LICENSE_CLASS_PHOTO = 'PENDING_DRIVER_LICENSE_CLASS_PHOTO',
  NIN_NUMBER = 'NIN_NUMBER',
  NIN_PHOTO = 'NIN_PHOTO',
  DRIVER_LICENSE_NUMBER = 'DRIVER_LICENSE_NUMBER',
  DRIVER_LICENSE_PHOTO = 'DRIVER_LICENSE_PHOTO',
  DRIVER_LICENSE_CLASS = 'DRIVER_LICENSE_CLASS',
  DRIVER_LICENSE_EXPIRY_DATE = 'DRIVER_LICENSE_EXPIRY_DATE',
  VEHICLE_TYPE = 'VEHICLE_TYPE',
  VEHICLE_PLATE_NUMBER = 'VEHICLE_PLATE_NUMBER',
  VEHICLE_REGISTRATION_PHOTO = 'VEHICLE_REGISTRATION_PHOTO',
  VEHICLE_PHOTOS = 'VEHICLE_PHOTOS',
  VEHICLE_CAPACITY = 'VEHICLE_CAPACITY',
  VEHICLE_COLOR = 'VEHICLE_COLOR',
  VEHICLE_YEAR = 'VEHICLE_YEAR',
  VEHICLE_REGISTRATION_EXPIRY_DATE = 'VEHICLE_REGISTRATION_EXPIRY_DATE',
  VEHICLE_REGISTRATION_NUMBER = 'VEHICLE_REGISTRATION_NUMBER',
  PENDING_VEHICLE_COLOR = 'PENDING_VEHICLE_COLOR',
  PENDING_VEHICLE_REGISTRATION_PHOTO = 'PENDING_VEHICLE_REGISTRATION_PHOTO',
  PENDING_VEHICLE_FRONT_PHOTO = 'PENDING_VEHICLE_FRONT_PHOTO',
  PENDING_VEHICLE_SIDE_PHOTO = 'PENDING_VEHICLE_SIDE_PHOTO',
  PENDING_VEHICLE_REGISTRATION_EXPIRY_DATE = 'PENDING_VEHICLE_REGISTRATION_EXPIRY_DATE'
}

export enum VERIFICATION_ISSUES_CODE {
  "PROFILE_PHOTO_BLURRY" = "Your profile photo is too blurry. Please upload a clear photo of yourself.",
  "PROFILE_PHOTO_INVALID" = "Your profile photo is invalid. Please upload a clear photo showing your face.",
  "PROFILE_PHOTO_MULTIPLE_PEOPLE" = "Your profile photo contains multiple people. Please upload a photo showing only yourself.",
  "PENDING_PROFILE_PHOTO_BLURRY" = "Your profile photo is too blurry. Please upload a clear photo of yourself.",
  "PENDING_PROFILE_PHOTO_INVALID" = "Your profile photo is invalid. Please upload a clear photo showing your face.",
  "PENDING_PROFILE_PHOTO_MULTIPLE_PEOPLE" = "Your profile photo contains multiple people. Please upload a photo showing only yourself.",
  "FIRST_NAME_MISMATCH_NIN" = "Your first name does not match the name on your NIN.",
  "LAST_NAME_MISMATCH_NIN" = "Your last name does not match the name on your NIN.",
  "DATE_OF_BIRTH_MISMATCH_DRIVER_LICENSE" = "Your date of birth does not match the date on your driver's license.",
  "NIN_PHOTO_BLURRY" = "Your NIN photo is too blurry. Please upload a clearer image.",
  "NIN_PHOTO_INVALID" = "Your NIN photo is invalid. Please upload a clear, readable image of your NIN.",
  "NIN_NUMBER_MISMATCH" = "The NIN number you entered does not match the submitted NIN document.",
  "DRIVER_LICENSE_PHOTO_BLURRY" = "Your driver's license photo is too blurry. Please upload a clearer image.",
  "DRIVER_LICENSE_PHOTO_INVALID" = "Your driver's license photo is invalid. Please upload a clear, readable image of your license.",
  "DRIVER_LICENSE_NUMBER_MISMATCH" = "The driver's license number you entered does not match the submitted document.",
  "DRIVER_LICENSE_CLASS_MISMATCH" = "The driver's license class you entered does not match the submitted document.",
  "DRIVER_LICENSE_EXPIRY_MISMATCH" = "The driver's license expiry date you entered does not match the submitted document.",
  "VEHICLE_REGISTRATION_PHOTO_BLURRY" = "Your vehicle registration photo is too blurry. Please upload a clearer image.",
  "VEHICLE_REGISTRATION_PHOTO_INVALID" = "Your vehicle registration photo is invalid. Please upload a clear, readable document.",
  "VEHICLE_TYPE_MISMATCH" = "The selected vehicle type does not match the submitted vehicle document.",
  "VEHICLE_CAPACITY_MISMATCH" = "The vehicle load capacity does not match the submitted vehicle document.",
  "VEHICLE_FRONT_PHOTO_BLURRY" = "Your vehicle front photo is too blurry. Please upload a clearer photo.",
  "VEHICLE_SIDE_PHOTO_BLURRY" = "Your vehicle side photo is too blurry. Please upload a clearer photo.",
  "VEHICLE_FRONT_PHOTO_INVALID" = "Your vehicle front photo is invalid. Please upload a clear photo of the vehicle.",
  "VEHICLE_SIDE_PHOTO_INVALID" = "Your vehicle side photo is invalid. Please upload a clear photo of the vehicle.",
  "FIRST_NAME_MISMATCH_DRIVER_LICENSE" = "Your first name does not match the name on your driver's license.",
  "LAST_NAME_MISMATCH_DRIVER_LICENSE" = "Your last name does not match the name on your driver's license.",
  "FIRST_NAME_MISMATCH_IDENTITY_DOCUMENTS" = "Your first name does not match the names on your identity documents.",
  "LAST_NAME_MISMATCH_IDENTITY_DOCUMENTS" = "Your last name does not match the names on your identity documents.",
  "PENDING_DRIVER_LICENSE_CLASS_MISMATCH" = "The driver's license class you entered does not match the submitted document.",
  "PENDING_DRIVER_LICENSE_EXPIRY_MISMATCH" = "The driver's license expiry date you entered does not match the submitted document.",
  "PENDING_DRIVER_LICENSE_CLASS_PHOTO_INVALID" = "Your driver's license photo is invalid. Please upload a clear, readable image of your license.",
  "PENDING_DRIVER_LICENSE_CLASS_PHOTO_BLURRY" = "Your driver's license photo is too blurry. Please upload a clearer image.",
  "VEHICLE_PLATE_NUMBER_MISMATCH" = "The vehicle plate number does not match the submitted document.",
  "VEHICLE_YEAR_MISMATCH" = "The vehicle year does not match the submitted document.",
  "VEHICLE_COLOR_MISMATCH" = "The vehicle color does not match the submitted document.",
  "VEHICLE_PHOTOS_BLURRY" = "The vehicle photos are blurry. Please upload clear photos of the vehicle.",
  "VEHICLE_PHOTOS_INVALID" = "The submitted vehicle photos are invalid. Please upload clear photos of the vehicle.",
  "VEHICLE_REGISTRATION_NUMBER_MISMATCH" = "The vehicle registration number does not match the submitted document.",
  "VEHICLE_REGISTRATION_EXPIRY_DATE_MISMATCH" = "The vehicle registration expiry date does not match the submitted document.",
  "PENDING_VEHICLE_COLOR" = "The vehicle color you entered does not match the submitted document.",
  "PENDING_VEHICLE_REGISTRATION_PHOTO_BLURRY" = "Your vehicle registration photo is too blurry. Please upload a clearer image.",
  "PENDING_VEHICLE_REGISTRATION_PHOTO_INVALID" = "Your vehicle registration photo is invalid. Please upload a clear, readable image.",
  "PENDING_VEHICLE_FRONT_PHOTO_BLURRY" = "Your vehicle front photo is too blurry. Please upload a clearer photo.", 
  "PENDING_VEHICLE_FRONT_PHOTO_INVALID" = "Your vehicle front photo is invalid. Please upload a clear photo of the vehicle.", 
  "PENDING_VEHICLE_SIDE_PHOTO_BLURRY" = "Your vehicle side photo is too blurry. Please upload a clearer photo.", 
  "PENDING_VEHICLE_SIDE_PHOTO_INVALID" = "Your vehicle side photo is invalid. Please upload a clear photo of the vehicle.",
  "PENDING_VEHICLE_REGISTRATION_EXPIRY_DATE_MISMATCH" = "The vehicle registration expiry date does not match the submitted document."
}

export enum FIRST_NAME_ISSUES_CODE {
  FIRST_NAME_MISMATCH_NIN = 'FIRST_NAME_MISMATCH_NIN',
  FIRST_NAME_MISMATCH_DRIVER_LICENSE = 'FIRST_NAME_MISMATCH_DRIVER_LICENSE',
  FIRST_NAME_MISMATCH_IDENTITY_DOCUMENTS = 'FIRST_NAME_MISMATCH_IDENTITY_DOCUMENTS',
}

export enum LAST_NAME_ISSUES_CODE {
  LAST_NAME_MISMATCH_NIN = 'LAST_NAME_MISMATCH_NIN',
  LAST_NAME_MISMATCH_DRIVER_LICENSE = 'LAST_NAME_MISMATCH_DRIVER_LICENSE',
  LAST_NAME_MISMATCH_IDENTITY_DOCUMENTS = 'LAST_NAME_MISMATCH_IDENTITY_DOCUMENTS'
}

export enum BIRTHDAY_ISSUES_CODE {
  DATE_OF_BIRTH_MISMATCH_DRIVER_LICENSE = 'DATE_OF_BIRTH_MISMATCH_DRIVER_LICENSE'
}

export enum DRIVER_PHOTO_ISSUES_CODE {
  PROFILE_PHOTO_BLURRY = 'PROFILE_PHOTO_BLURRY',
  PROFILE_PHOTO_INVALID = 'PROFILE_PHOTO_INVALID',
  PROFILE_PHOTO_MULTIPLE_PEOPLE = 'PROFILE_PHOTO_MULTIPLE_PEOPLE'
}

export enum PENDING_DRIVER_PHOTO_ISSUES_CODE {
  PENDING_PROFILE_PHOTO_BLURRY = 'PENDING_PROFILE_PHOTO_BLURRY',
  PENDING_PROFILE_PHOTO_INVALID = 'PENDING_PROFILE_PHOTO_INVALID',
  PENDING_PROFILE_PHOTO_MULTIPLE_PEOPLE = 'PENDING_PROFILE_PHOTO_MULTIPLE_PEOPLE'
}

export enum NIN_ISSUES_CODE {
  NIN_PHOTO_BLURRY = 'NIN_PHOTO_BLURRY',
  NIN_PHOTO_INVALID = 'NIN_PHOTO_INVALID',
  NIN_NUMBER_MISMATCH = 'NIN_NUMBER_MISMATCH',

}

export enum DRIVER_LICENSE_ISSUES_CODE {
  DRIVER_LICENSE_PHOTO_BLURRY = 'DRIVER_LICENSE_PHOTO_BLURRY',
  DRIVER_LICENSE_PHOTO_INVALID = 'DRIVER_LICENSE_PHOTO_INVALID',
  DRIVER_LICENSE_NUMBER_MISMATCH = 'DRIVER_LICENSE_NUMBER_MISMATCH',
  DRIVER_LICENSE_CLASS_MISMATCH = 'DRIVER_LICENSE_CLASS_MISMATCH',
  DRIVER_LICENSE_EXPIRY_MISMATCH = 'DRIVER_LICENSE_EXPIRY_MISMATCH'
}

export enum PENDING_DRIVER_LICENSE_PHOTO_ISSUES_CODE {
  PENDING_DRIVER_LICENSE_CLASS_PHOTO_INVALID = 'PENDING_DRIVER_LICENSE_CLASS_PHOTO_INVALID',
  PENDING_DRIVER_LICENSE_CLASS_PHOTO_BLURRY = 'PENDING_DRIVER_LICENSE_CLASS_PHOTO_BLURRY'
}

export enum VEHICLE_PHOTOS_ISSUES_CODE {
  VEHICLE_FRONT_PHOTO_INVALID = 'VEHICLE_FRONT_PHOTO_INVALID',
  VEHICLE_FRONT_PHOTO_BLURRY = 'VEHICLE_FRONT_PHOTO_BLURRY',
  VEHICLE_SIDE_PHOTO_INVALID = 'VEHICLE_SIDE_PHOTO_INVALID',
  VEHICLE_SIDE_PHOTO_BLURRY = 'VEHICLE_SIDE_PHOTO_BLURRY',
  VEHICLE_PHOTOS_BLURRY = 'VEHICLE_PHOTOS_BLURRY',
  VEHICLE_PHOTOS_INVALID = 'VEHICLE_PHOTOS_INVALID'
}

export enum VEHICLE_TYPE_ISSUES_CODE {
  VEHICLE_TYPE_MISMATCH = 'VEHICLE_TYPE_MISMATCH'
}

export enum VEHICLE_PLATE_NUMBER_ISSUES_CODE {
  VEHICLE_PLATE_NUMBER_MISMATCH = 'VEHICLE_PLATE_NUMBER_MISMATCH',
}

export enum VEHICLE_REGISTRATION_PHOTO_ISSUES_CODE {
  VEHICLE_REGISTRATION_PHOTO_BLURRY = 'VEHICLE_REGISTRATION_PHOTO_BLURRY',
  VEHICLE_REGISTRATION_PHOTO_INVALID = 'VEHICLE_REGISTRATION_PHOTO_INVALID'
}

export enum VEHICLE_CAPACITY_ISSUES_CODE {
  VEHICLE_CAPACITY_MISMATCH = 'VEHICLE_CAPACITY_MISMATCH'
}

export enum VEHICLE_COLOR_ISSUES_CODE {
  VEHICLE_COLOR_MISMATCH = 'VEHICLE_COLOR_MISMATCH'
}

export enum VEHICLE_YEAR_ISSUES_CODE {
  VEHICLE_YEAR_MISMATCH = 'VEHICLE_YEAR_MISMATCH'
}

export enum VEHICLE_REGISTRATION_NUMBER_ISSUES_CODE {
  VEHICLE_REGISTRATION_NUMBER_MISMATCH = 'VEHICLE_REGISTRATION_NUMBER_MISMATCH'
}

export enum VEHICLE_REGISTRATION_EXPIRY_DATE_ISSUES_CODE {
  VEHICLE_REGISTRATION_EXPIRY_DATE_MISMATCH = 'VEHICLE_REGISTRATION_EXPIRY_DATE_MISMATCH'
}

export enum PENDING_DRIVER_LICENSE_ISSUES_CODE {
  PENDING_DRIVER_LICENSE_CLASS_MISMATCH = 'PENDING_DRIVER_LICENSE_CLASS_MISMATCH',
  PENDING_DRIVER_LICENSE_EXPIRY_MISMATCH = 'PENDING_DRIVER_LICENSE_EXPIRY_MISMATCH'
}

export enum PENDING_VEHICLE_REG_PHOTO_ISSUES_CODE {
   PENDING_VEHICLE_REGISTRATION_PHOTO_BLURRY = 'PENDING_VEHICLE_REGISTRATION_PHOTO_BLURRY',
  PENDING_VEHICLE_REGISTRATION_PHOTO_INVALID = 'PENDING_VEHICLE_REGISTRATION_PHOTO_INVALID'
}

export enum PENDING_VEHICLE_FRONT_PHOTO_ISSUES_CODE {
  PENDING_VEHICLE_FRONT_PHOTO_BLURRY = 'PENDING_VEHICLE_FRONT_PHOTO_BLURRY',
  PENDING_VEHICLE_FRONT_PHOTO_INVALID = 'PENDING_VEHICLE_FRONT_PHOTO_INVALID'
}

export enum PENDING_VEHICLE_SIDE_PHOTO_ISSUES_CODE {
  PENDING_VEHICLE_SIDE_PHOTO_BLURRY = 'PENDING_VEHICLE_SIDE_PHOTO_BLURRY',
  PENDING_VEHICLE_SIDE_PHOTO_INVALID = 'PENDING_VEHICLE_SIDE_PHOTO_INVALID'
}
