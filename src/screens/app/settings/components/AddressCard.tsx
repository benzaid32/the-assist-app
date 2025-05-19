import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, typography } from '../../../../constants/theme';
import { ProfileData } from '../../../../services/api/profileService';

type AddressCardProps = {
  profileData: ProfileData | null;
  editedData: ProfileData | null;
  isEditing: boolean;
  handleInputChange: (field: string, value: string) => void;
};

/**
 * AddressCard component for displaying and editing address information
 * Used in both applicant and subscriber settings screens
 */
const AddressCard = ({
  profileData,
  editedData,
  isEditing,
  handleInputChange
}: AddressCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Address</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Street Address</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedData?.address || ''}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="Enter your street address"
            placeholderTextColor={colors.secondaryText}
            testID="address-input"
          />
        ) : (
          <Text style={styles.value}>{profileData?.address || 'Not provided'}</Text>
        )}
      </View>
      
      <View style={styles.formRow}>
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>City</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedData?.city || ''}
              onChangeText={(text) => handleInputChange('city', text)}
              placeholder="City"
              placeholderTextColor={colors.secondaryText}
              testID="city-input"
            />
          ) : (
            <Text style={styles.value}>{profileData?.city || 'Not provided'}</Text>
          )}
        </View>
        
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>State</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedData?.state || ''}
              onChangeText={(text) => handleInputChange('state', text)}
              placeholder="State"
              placeholderTextColor={colors.secondaryText}
              testID="state-input"
            />
          ) : (
            <Text style={styles.value}>{profileData?.state || 'Not provided'}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>ZIP Code</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedData?.zipCode || ''}
            onChangeText={(text) => handleInputChange('zipCode', text)}
            placeholder="ZIP Code"
            placeholderTextColor={colors.secondaryText}
            keyboardType="numeric"
            maxLength={10}
            testID="zipcode-input"
          />
        ) : (
          <Text style={styles.value}>{profileData?.zipCode || 'Not provided'}</Text>
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
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  formGroupHalf: {
    width: '48%',
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

export default AddressCard;
