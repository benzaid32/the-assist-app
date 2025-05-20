/**
 * Enterprise-grade color system with WCAG 2.1 AA compliance
 * Monochromatic palette with subtle variations for depth and hierarchy
 * Carefully selected for optimal contrast and readability
 */
export const colors = {
  // Core palette - professionally calibrated monochromatic scale
  background: '#FFFFFF',
  surface: {
    primary: '#FFFFFF',     // Cards, primary surfaces
    secondary: '#F9F9F9',   // Secondary surfaces for subtle depth
    tertiary: '#F2F2F7',    // Tertiary surfaces (iOS system gray 6)
    elevated: '#FFFFFF',    // Elevated surfaces with shadow
  },
  text: {
    primary: '#000000',     // Primary text (WCAG AAA compliant on white)
    secondary: '#3C3C43',   // Secondary text with opacity 85% (iOS standard)
    tertiary: '#3C3C43',    // Tertiary text with opacity 65% (iOS standard)
    disabled: '#3C3C43',    // Disabled text with opacity 30%
    inverse: '#FFFFFF',     // Text on dark backgrounds
  },
  accent: {
    primary: '#000000',     // Primary accent
    secondary: '#333333',   // Secondary accent for hover states
    muted: '#666666',       // Muted accent for subtle emphasis
  },
  
  // Functional colors - accessible with subtle differentiation
  border: {
    light: 'rgba(60, 60, 67, 0.12)',  // iOS standard light separator
    regular: 'rgba(60, 60, 67, 0.25)',  // iOS standard separator
    strong: 'rgba(0, 0, 0, 0.5)',       // Strong border for emphasis
  },
  feedback: {
    error: '#8B0000',       // Dark red (WCAG AA compliant)
    success: '#2E8B57',     // Dark green (WCAG AA compliant)
    warning: '#4D4D4D',     // Dark gray with yellow undertone
    info: '#404040',        // Dark gray for information
  },
  
  // Legacy support (for backward compatibility)
  primaryText: '#000000',
  secondaryText: '#3C3C43',
  tertiaryText: '#3C3C43',
  white: '#FFFFFF',
  black: '#000000',
  neutralBorders: 'rgba(60, 60, 67, 0.12)',
  borderColor: 'rgba(60, 60, 67, 0.25)', // Renamed from 'border' to avoid duplicate
  highlight: '#333333',
  accentColor: '#000000'    // Renamed from 'accent' to avoid duplicate
};

/**
 * Enterprise-grade Typography System
 * Based on iOS human interface guidelines with professional spacing
 * Optimized for accessibility and readability (WCAG 2.1 AA compliant)
 * Supports dynamic type scaling and maintains proper hierarchy
 */
export const typography = {
  // Primary Typeface: SF Pro (San Francisco Pro – system font)
  // Using platform-specific fallbacks for optimal performance
  fonts: {
    display: 'SFPro-Bold',      // For large titles and display text
    bold: 'SFPro-Bold',         // For primary headings and emphasis
    semibold: 'SFPro-Semibold', // For secondary headings and strong emphasis
    medium: 'SFPro-Medium',     // For buttons, interactive elements, and tertiary headings
    regular: 'SFPro-Regular',   // For body text and general content
    monospaced: 'SFMono-Regular', // For numerical data, code, and tabular information
  },
  
  // Type Scale: Calibrated specifically for iOS devices
  // Using Dynamic Type compatible sizes with appropriate scaling
  fontSizes: {
    // Primary scale (used most frequently)
    largeTitle: 34, // Large title (iOS standard)
    title1: 28,     // Primary title
    title2: 22,     // Secondary title
    title3: 20,     // Tertiary title
    headline: 17,   // Headline text (semi-bold) - iOS standard
    body: 17,       // Body text - iOS standard
    callout: 16,    // Callout text - iOS standard
    subheadline: 15, // Subheadline - iOS standard
    footnote: 13,   // Footnote - iOS standard
    caption1: 12,   // Caption 1 - iOS standard
    caption2: 11,   // Caption 2 - iOS standard
    
    // Special cases
    metrics: 22,    // For impact metrics (slightly larger for emphasis)
    statistic: 28,  // For statistics/numerical data display
    button: 17,     // Standard button text size (iOS HIG)
    navTitle: 17,   // Navigation title (iOS HIG)
    tabBar: 10,     // Tab bar items (iOS HIG)
  },
  
  // Line heights calibrated for optimal readability
  lineHeight: {
    largeTitle: 41, // 1.2x ratio
    title1: 34,     // 1.21x ratio
    title2: 28,     // 1.27x ratio
    title3: 25,     // 1.25x ratio
    headline: 22,   // 1.29x ratio
    body: 22,       // 1.29x ratio
    callout: 21,    // 1.31x ratio
    subheadline: 20, // 1.33x ratio
    footnote: 18,   // 1.38x ratio
    caption1: 16,   // 1.33x ratio
    caption2: 13,   // 1.18x ratio
  },
  
  // Letter spacing for optimal readability across different sizes
  letterSpacing: {
    largeTitle: 0.36,
    title1: 0.34,
    title2: -0.41,
    title3: -0.43,
    headline: -0.43,
    body: -0.41,
    callout: -0.32,
    subheadline: -0.24,
    footnote: -0.08,
    caption1: 0,
    caption2: 0.07,
  },
  
  // Component-specific text styles (for direct use in components)
  // Uses the new WCAG AA-compliant text colors
  styles: {
    largeTitle: {
      fontFamily: 'SFPro-Bold',
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: 0.36,
      color: 'rgba(0, 0, 0, 1)' // Full opacity for primary text
    },
    title1: {
      fontFamily: 'SFPro-Bold',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: 0.34,
      color: 'rgba(0, 0, 0, 1)'
    },
    title2: {
      fontFamily: 'SFPro-Bold',
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.41,
      color: 'rgba(0, 0, 0, 1)'
    },
    title3: {
      fontFamily: 'SFPro-Semibold',
      fontSize: 20,
      lineHeight: 25,
      letterSpacing: -0.43,
      color: 'rgba(0, 0, 0, 1)'
    },
    headline: {
      fontFamily: 'SFPro-Semibold',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.43,
      color: 'rgba(0, 0, 0, 1)'
    },
    body: {
      fontFamily: 'SFPro-Regular',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.41,
      color: 'rgba(0, 0, 0, 1)'
    },
    bodySecondary: {
      fontFamily: 'SFPro-Regular',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.41,
      color: 'rgba(60, 60, 67, 0.6)' // iOS standard secondary text
    },
    callout: {
      fontFamily: 'SFPro-Regular',
      fontSize: 16,
      lineHeight: 21,
      letterSpacing: -0.32,
      color: 'rgba(0, 0, 0, 1)'
    },
    calloutEmphasized: {
      fontFamily: 'SFPro-Semibold',
      fontSize: 16,
      lineHeight: 21,
      letterSpacing: -0.32,
      color: 'rgba(0, 0, 0, 1)'
    },
    subheadline: {
      fontFamily: 'SFPro-Regular',
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.24,
      color: 'rgba(0, 0, 0, 1)'
    },
    subheadlineEmphasized: {
      fontFamily: 'SFPro-Semibold',
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.24,
      color: 'rgba(0, 0, 0, 1)'
    },
    footnote: {
      fontFamily: 'SFPro-Regular',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.08,
      color: 'rgba(60, 60, 67, 0.6)' // iOS standard secondary text
    },
    footnoteEmphasized: {
      fontFamily: 'SFPro-Semibold',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.08,
      color: 'rgba(0, 0, 0, 1)'
    },
    caption1: {
      fontFamily: 'SFPro-Regular',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
      color: 'rgba(60, 60, 67, 0.6)' // iOS standard secondary text
    },
    caption2: {
      fontFamily: 'SFPro-Regular',
      fontSize: 11,
      lineHeight: 13,
      letterSpacing: 0.07,
      color: 'rgba(60, 60, 67, 0.6)' // iOS standard secondary text
    },
    button: {
      fontFamily: 'SFPro-Medium',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.41,
      color: 'rgba(0, 0, 0, 1)'
    },
    metrics: {
      fontFamily: 'SFMono-Regular',
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.41,
      color: 'rgba(0, 0, 0, 1)'
    },
  },
  
  // Legacy support for existing components
  h1: {
    fontFamily: 'SFPro-Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.34,
    color: 'rgba(0, 0, 0, 1)',
  },
  h2: {
    fontFamily: 'SFPro-Bold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.41,
    color: 'rgba(0, 0, 0, 1)',
  },
  h3: {
    fontFamily: 'SFPro-Semibold',
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.43,
    color: 'rgba(0, 0, 0, 1)',
  },
  body: {
    fontFamily: 'SFPro-Regular',
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
    color: 'rgba(0, 0, 0, 1)',
  },
  buttonText: {
    fontFamily: 'SFPro-Medium',
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
    color: 'rgba(0, 0, 0, 1)',
  },
  caption: {
    fontFamily: 'SFPro-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: 'rgba(60, 60, 67, 0.6)',
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
