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
  info: '#404040'         // Dark gray
};

export const typography = {
  fonts: {
    bold: 'SFPro-Bold', // Assuming you have these fonts in your project
    regular: 'SFPro-Regular',
    medium: 'SFPro-Medium',
  },
  fontSizes: {
    headline: 24, // Average of 22-26px
    title: 22,     // Added for section titles
    subheading: 20,
    body: 16,
    button: 16,
    label: 12,
    input: 14,
    caption: 12,
  },
  fontWeights: {
    // These might map to your font family variants if not separate font files
    bold: 'bold', // or '700'
    regular: 'normal', // or '400'
    medium: '500',
  },
  lineHeights: {
    body: 24, // Example: 1.5x font size for body
    headline: 32, // Example: ~1.3x font size for headline
  },
};

// Example of a common style object for reusability
export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headlineText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: colors.primaryText,
    lineHeight: typography.lineHeights.headline,
  },
  bodyText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    lineHeight: typography.lineHeights.body,
  },
  labelText: {
    fontFamily: typography.fonts.medium, // Or regular, depending on 'medium weight'
    fontSize: typography.fontSizes.label,
    color: colors.primaryText, // Or a more muted color like a gray
  },
  // Add more global styles as needed, e.g., for buttons, inputs
};

// Note: Ensure that the font families 'SFPro-Bold', 'SFPro-Regular', 'SFPro-Medium'
// are correctly set up in your project (e.g., via expo-font or linked in native projects).
// If you are using system fonts and SF Pro is the default on iOS, 
// you might not need to specify fontFamily for basic weights like regular and bold,
// but it's good practice for custom or specific weights like 'medium'.
