import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { colors, typography } from '../../../../constants/theme';

type ProfileHeaderProps = {
  headerOpacity: Animated.AnimatedInterpolation<string | number>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  handleCancelEdit: () => void;
  handleSaveProfile: () => void;
  isSaving: boolean;
  title: string;
};

/**
 * ProfileHeader component used in settings screens
 * Displays the title and edit/save/cancel buttons
 */
const ProfileHeader = ({
  headerOpacity,
  isEditing,
  setIsEditing,
  handleCancelEdit,
  handleSaveProfile,
  isSaving,
  title
}: ProfileHeaderProps) => {
  return (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      {!isEditing ? (
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.editActions}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancelEdit}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.disabledButton]} 
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: colors.background,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: 24,
    color: colors.black,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.secondaryText,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.black,
    borderRadius: 8,
  },
  saveButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProfileHeader;
