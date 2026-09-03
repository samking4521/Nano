import { Platform } from "react-native";

export const FONTS = {
  thin: Platform.select({
    ios: 'Inter-Thin',
    android: 'Inter_100Thin',
  }),

  thinItalic: Platform.select({
    ios: 'Inter-Thin-Italic',
    android: 'Inter_100Thin_Italic',
  }),

  extraLight: Platform.select({
    ios: 'Inter-ExtraLight',
    android: 'Inter_200ExtraLight',
  }),

  extraLightItalic: Platform.select({
    ios: 'Inter-ExtraLight-Italic',
    android: 'Inter_200ExtraLight_Italic',
  }),

  light: Platform.select({
    ios: 'Inter-Light',
    android: 'Inter_300Light',
  }),

  lightItalic: Platform.select({
    ios: 'Inter-Light-Italic',
    android: 'Inter_300Light_Italic',
  }),

  regular: Platform.select({
    ios: 'Inter-Regular',
    android: 'Inter_400Regular',
  }),

  regularItalic: Platform.select({
    ios: 'Inter-Regular-Italic',
    android: 'Inter_400Regular_Italic',
  }),

  medium: Platform.select({
    ios: 'Inter-Medium',
    android: 'Inter_500Medium',
  }),

  mediumItalic: Platform.select({
    ios: 'Inter-Medium-Italic',
    android: 'Inter_500Medium_Italic',
  }),

  semiBold: Platform.select({
    ios: 'Inter-SemiBold',
    android: 'Inter_600SemiBold',
  }),

  semiBoldItalic: Platform.select({
    ios: 'Inter-SemiBold-Italic',
    android: 'Inter_600SemiBold_Italic',
  }),

  bold: Platform.select({
    ios: 'Inter-Bold',
    android: 'Inter_700Bold',
  }),

  boldItalic: Platform.select({
    ios: 'Inter-Bold-Italic',
    android: 'Inter_700Bold_Italic',
  }),

  extraBold: Platform.select({
    ios: 'Inter-ExtraBold',
    android: 'Inter_800ExtraBold',
  }),

  extraBoldItalic: Platform.select({
    ios: 'Inter-ExtraBold-Italic',
    android: 'Inter_800ExtraBold_Italic',
  }),

  black: Platform.select({
    ios: 'Inter-Black',
    android: 'Inter_900Black',
  }),

  blackItalic: Platform.select({
    ios: 'Inter-Black-Italic',
    android: 'Inter_900Black_Italic',
  }),
} as const;


export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  appName: 70
};

export const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const FONT_WEIGHTS = {
  regular: 'normal',
  medium: '500',
  bold: 'bold',
};
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  round: 50,
};
