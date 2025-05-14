export const colors = {
  background: '#FFFFFF',
  primaryText: '#000000',
  accent: '#FF5A5F',
  highlight: '#F4A261',
  neutralBorders: '#E0E0E0',
  // Add other common colors like success, error, warning if needed
  // e.g., success: '#28a745', error: '#dc3545', warning: '#ffc107'
};

export const typography = {
  fonts: {
    bold: 'SFPro-Bold', // Assuming you have these fonts in your project
    regular: 'SFPro-Regular',
    medium: 'SFPro-Medium',
  },
  fontSizes: {
    headline: 24, // Average of 22-26px
    body: 16,
    label: 12,
    input: 14,
    button: 16,
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
