import { Platform } from 'react-native';

// Font family configuration
export const fontFamily = {
  // Primary font family
  primary: Platform.select({
    ios: 'TTNormsPro',
    android: 'TTNormsPro',
  }),
  
  // Fallback fonts
  fallback: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }),
};

// Font weights
export const fontWeight = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  demiBold: '600',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

// Font sizes
export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
};

// Line heights (as percentage of font size)
export const lineHeight = {
  tight: 100,    // 100%
  normal: 120,   // 120%
  relaxed: 140,  // 140%
  loose: 160,    // 160%
};

// Letter spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

// Typography styles object
export const typography = {
  // Display styles
  display1: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize['6xl'],
    lineHeight: fontSize['6xl'] * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  display2: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize['5xl'],
    lineHeight: fontSize['5xl'] * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  
  // Heading styles
  h1: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  h2: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  h3: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  
  // Body text styles
  body1: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  body2: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  
  // Button text styles
  button: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  buttonDemiBold: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.demiBold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  buttonSmall: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  
  // Caption styles
  caption: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  
  // Overline styles
  overline: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  
  // Custom styles based on your requirements
  label: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  
  // Tab styles
  tab: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  tabActive: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  
  // Input styles
  input: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
  inputPlaceholder: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * (lineHeight.normal / 100),
    letterSpacing: letterSpacing.normal,
  },
};

// Helper function to create custom typography styles
export const createTypographyStyle = ({
  weight = fontWeight.regular,
  size = fontSize.base,
  lineHeightPercent = lineHeight.normal,
  letterSpacingValue = letterSpacing.normal,
  fontFamilyName = fontFamily.primary,
}) => ({
  fontFamily: fontFamilyName,
  fontWeight: weight,
  fontSize: size,
  lineHeight: size * (lineHeightPercent / 100),
  letterSpacing: letterSpacingValue,
});

// Helper function to get typography style by name
export const getTypographyStyle = (styleName) => {
  return typography[styleName] || typography.body1;
};

// Export default typography configuration
export default typography; 