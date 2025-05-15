import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, typography } from '../../../../constants/theme';

type PersonalInfoCardProps = {
  profileData: any;
  editedData: any;
  isEditing: boolean;
  handleInputChange: (field: string, value: string) => void;
};

/**
 * PersonalInfoCard component for displaying and editing personal information
 * Used in both applicant and subscriber settings screens
 */
const PersonalInfoCard = ({
  profileData,
  editedData,
  isEditing,
  handleInputChange
}: PersonalInfoCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Personal Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedData?.name || ''}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Enter your name"
            placeholderTextColor={colors.secondaryText}
            testID="name-input"
          />
        ) : (
          <Text style={styles.value}>{profileData?.name || 'Not provided'}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profileData?.email || 'Not provided'}</Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedData?.phone || ''}
            onChangeText={(text) => handleInputChange('phone', text)}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.secondaryText}
            keyboardType="phone-pad"
            testID="phone-input"
          />
        ) : (
          <Text style={styles.value}>{profileData?.phone || 'Not provided'}</Text>
        )}
      </View>
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  value: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.black,
    paddingVertical: 6,
  },
  input: {
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});

export default PersonalInfoCard;
