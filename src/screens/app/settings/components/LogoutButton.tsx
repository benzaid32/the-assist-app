import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../../../constants/theme';

type LogoutButtonProps = {
  onLogout: () => Promise<void>;
};

/**
 * LogoutButton component for displaying a logout button
 * Used in both applicant and subscriber settings screens
 */
const LogoutButton = ({ onLogout }: LogoutButtonProps) => {
  return (
    <TouchableOpacity 
      style={styles.logoutButton} 
      onPress={onLogout}
      testID="logout-button"
    >
      <Text style={styles.logoutButtonText}>Log Out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
  },
});

export default LogoutButton;
