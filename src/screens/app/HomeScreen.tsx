import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, globalStyles } from '../../constants/theme';

export const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to The Assist App</Text>
      <Text style={styles.infoText}>Authentication successful!</Text>
      <Text style={styles.infoText}>This is your Home screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container, // Spread global container styles
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.headline,
    color: colors.primaryText, // Using primaryText from theme, adjust if needed
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText, // Using primaryText from theme, adjust if needed
    marginBottom: 8,
    textAlign: 'center',
  },
});
