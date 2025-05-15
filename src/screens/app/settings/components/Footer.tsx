import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../../../constants/theme';

/**
 * Footer component for displaying app version and copyright information
 * Used in both applicant and subscriber settings screens
 */
const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>The Assist App v1.0</Text>
      <Text style={styles.footerText}>© {new Date().getFullYear()} All Rights Reserved</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },
});

export default Footer;
