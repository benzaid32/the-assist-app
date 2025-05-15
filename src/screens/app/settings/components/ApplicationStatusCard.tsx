import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type ApplicationStatusCardProps = {
  applicationStatus: {
    status: string;
    lastUpdated: string;
    documentsVerified: string[];
    documentsNeeded: string[];
    nextSteps: string;
  };
  onUploadDocuments: () => void;
};

/**
 * ApplicationStatusCard component for displaying application status information
 * Used in applicant settings screen
 */
const ApplicationStatusCard = ({ applicationStatus, onUploadDocuments }: ApplicationStatusCardProps) => {
  // Get status color based on application status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'in review':
        return '#FF9800'; // Orange
      default:
        return colors.black; // Default
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Application Status</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(applicationStatus.status) }]}>
          <Text style={styles.statusText}>{applicationStatus.status}</Text>
        </View>
        <Text style={styles.lastUpdatedText}>Last updated: {applicationStatus.lastUpdated}</Text>
      </View>
      
      <View style={styles.documentsSection}>
        <Text style={styles.sectionTitle}>Documents</Text>
        
        {applicationStatus.documentsVerified.length > 0 && (
          <View style={styles.documentsList}>
            <Text style={styles.documentsLabel}>Verified:</Text>
            {applicationStatus.documentsVerified.map((doc, index) => (
              <View key={`verified-${index}`} style={styles.documentItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.documentText}>{doc}</Text>
              </View>
            ))}
          </View>
        )}
        
        {applicationStatus.documentsNeeded.length > 0 && (
          <View style={styles.documentsList}>
            <Text style={styles.documentsLabel}>Needed:</Text>
            {applicationStatus.documentsNeeded.map((doc, index) => (
              <View key={`needed-${index}`} style={styles.documentItem}>
                <Ionicons name="alert-circle-outline" size={18} color="#FF9800" />
                <Text style={styles.documentText}>{doc}</Text>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={onUploadDocuments}
          testID="upload-documents-button"
        >
          <Text style={styles.uploadButtonText}>Upload Documents</Text>
        </TouchableOpacity>
      </View>
      
      {applicationStatus.nextSteps && (
        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <Text style={styles.nextStepsText}>{applicationStatus.nextSteps}</Text>
        </View>
      )}
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  statusText: {
    fontFamily: typography.fonts.medium,
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  lastUpdatedText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.secondaryText,
  },
  documentsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.black,
    marginBottom: 12,
  },
  documentsList: {
    marginBottom: 12,
  },
  documentsLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.black,
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  uploadButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  nextStepsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
  },
  nextStepsText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
});

export default ApplicationStatusCard;
