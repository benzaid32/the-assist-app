import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * AccountSettingsCard component for displaying account settings options
 * Used in both applicant and subscriber settings screens
 */
const AccountSettingsCard = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Account Settings</Text>
      
      <TouchableOpacity style={styles.settingItem} testID="change-password-button">
        <View style={styles.settingItemLeft}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.black} />
          <Text style={styles.settingText}>Change Password</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem} testID="notifications-button">
        <View style={styles.settingItemLeft}>
          <Ionicons name="notifications-outline" size={24} color={colors.black} />
          <Text style={styles.settingText}>Notification Preferences</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem} testID="privacy-button">
        <View style={styles.settingItemLeft}>
          <Ionicons name="shield-outline" size={24} color={colors.black} />
          <Text style={styles.settingText}>Privacy Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem} testID="help-button">
        <View style={styles.settingItemLeft}>
          <Ionicons name="help-circle-outline" size={24} color={colors.black} />
          <Text style={styles.settingText}>Help & Support</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: colors.black,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.black,
    marginLeft: 16,
  },
});

export default AccountSettingsCard;
