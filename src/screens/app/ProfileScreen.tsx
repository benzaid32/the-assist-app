import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, globalStyles } from '../../constants/theme';

export const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Profile Screen</Text>
      <Text style={styles.bodyText}>User profile information will be displayed here.</Text>
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
