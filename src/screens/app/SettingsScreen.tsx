import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, globalStyles } from '../../constants/theme';

export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Settings Screen</Text>
      <Text style={styles.bodyText}>App settings and options will be available here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    ...globalStyles.headlineText,
    marginBottom: 16,
  },
  bodyText: {
    ...globalStyles.bodyText,
    textAlign: 'center',
  },
});
