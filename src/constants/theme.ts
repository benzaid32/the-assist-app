export const colors = {
  // Primary colors
  background: '#FFFFFF',
  primaryText: '#000000',
  secondaryText: '#757575',
  accent: '#000000',      // Changed from #FF5A5F to black
  highlight: '#404040',   // Changed from #F4A261 to dark gray
  
  // Neutral colors
  neutralBorders: '#E0E0E0',
  border: '#E0E0E0',
  white: '#FFFFFF',
  black: '#000000',
  
  // Semantic colors (using grayscale)
  error: '#8B0000',       // Dark red (closer to black)
  success: '#2E8B57',     // Dark green (closer to black)
  warning: '#808080',     // Gray
  info: '#404040',        // Dark gray
  tertiaryText: '#A0A0A0' // Light gray for tertiary text
};

/**
 * Assist App Font System (iOS – SF Pro)
 * Following enterprise-grade typography system for consistent UI
 */
export const typography = {
  // Primary Typeface: SF Pro (San Francisco Pro – Apple's system font)
  fonts: {
    bold: 'SFPro-Bold',
    semibold: 'SFPro-Semibold',
    medium: 'SFPro-Medium',
    regular: 'SFPro-Regular',
    monospaced: 'SFMono-Regular', // For numbers/metrics
  },
  fontSizes: {
    appTitle: 32, // App Title / Splash (28-32px)
    sectionHeading: 24, // Section Headings (22-26px)
    title3: 20, // Tertiary headings
    body: 16, // Body Text
    button: 16, // Buttons (Primary)
    formLabel: 14, // Form Labels
    navItem: 14, // Tabs / Nav Items (12-14px)
    smallNote: 12, // Small Notes / Hints
    small: 12, // Small text (same as smallNote for consistency)
    metrics: 20, // Numbers / Metrics (16-20px)
  },
  letterSpacing: {
    appTitle: -0.5, // App Title / Splash
    sectionHeading: -0.5, // Section Headings
    body: 0, // Body Text
    button: 0, // Buttons (Primary)
    formLabel: 0, // Form Labels
    navItem: 0.2, // Tabs / Nav Items
    smallNote: 0, // Small Notes / Hints
    metrics: 0, // Numbers / Metrics
  },
  lineHeights: {
    appTitle: 42, // App Title / Splash (38-42px)
    sectionHeading: 32, // Section Headings (30-34px)
    body: 24, // Body Text
    button: 24, // Buttons (Primary) (20-24px)
    formLabel: 20, // Form Labels
    navItem: 20, // Tabs / Nav Items (18-20px)
    smallNote: 16, // Small Notes / Hints
    metrics: 24, // Numbers / Metrics
  },
};

// Enterprise-grade common style object for reusability
export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  // Typography styles following SF Pro system
  appTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.appTitle,
    color: colors.primaryText,
    lineHeight: typography.lineHeights.appTitle,
    letterSpacing: typography.letterSpacing.appTitle,
  },
  sectionHeading: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.sectionHeading,
    color: colors.primaryText,
    lineHeight: typography.lineHeights.sectionHeading,
    letterSpacing: typography.letterSpacing.sectionHeading,
  },
  bodyText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    lineHeight: typography.lineHeights.body,
    letterSpacing: typography.letterSpacing.body,
  },
  formLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.formLabel,
    color: colors.primaryText,
    lineHeight: typography.lineHeights.formLabel,
    letterSpacing: typography.letterSpacing.formLabel,
  },
  button: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    lineHeight: typography.lineHeights.button,
    letterSpacing: typography.letterSpacing.button,
  },
  navItem: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.navItem,
    color: colors.secondaryText,
    lineHeight: typography.lineHeights.navItem,
    letterSpacing: typography.letterSpacing.navItem,
  },
  smallNote: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.smallNote,
    color: colors.secondaryText,
    lineHeight: typography.lineHeights.smallNote,
    letterSpacing: typography.letterSpacing.smallNote,
  },
  metrics: {
    fontFamily: typography.fonts.monospaced,
    fontSize: typography.fontSizes.metrics,
    color: colors.primaryText,
    lineHeight: typography.lineHeights.metrics,
    letterSpacing: typography.letterSpacing.metrics,
  },
};

// Note: Ensure that the font families 'SFPro-Bold', 'SFPro-Regular', 'SFPro-Medium'
// are correctly set up in your project (e.g., via expo-font or linked in native projects).
// If you are using system fonts and SF Pro is the default on iOS, 
// you might not need to specify fontFamily for basic weights like regular and bold,
// but it's good practice for custom or specific weights like 'medium'.
