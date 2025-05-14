import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles } from '../../constants/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { User } from '../../types/auth';

// Application status types
export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAYMENT_PROCESSING = 'payment_processing',
  PAYMENT_COMPLETE = 'payment_complete',
}

// Need type for applicants
export enum NeedType {
  RENT = 'rent',
  UTILITIES = 'utilities',
  TUITION = 'tuition',
}

// Application data interface
interface ApplicationData {
  applicantId: string;
  status: ApplicationStatus;
  needType: NeedType;
  requestAmount: number;
  submittedAt: Date;
  documentsUploaded: boolean;
  documentsVerified: boolean;
  selectedForReviewAt?: Date;
  reviewCompletedAt?: Date;
  paymentProcessedAt?: Date;
  notes?: string;
}

// Props interface
interface ApplicantDashboardProps {
  user: User;
  onUploadDocuments: () => void;
  onViewDetails: () => void;
}

/**
 * ApplicantDashboard component displays application status and actions for applicant users
 * @param user - The current user object
 * @param onUploadDocuments - Function to handle document upload navigation
 * @param onViewDetails - Function to handle viewing application details
 */
export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({
  user,
  onUploadDocuments,
  onViewDetails,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);

  // Fetch application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a production app, this would fetch real data from Firestore
        // For now, we'll use mock data
        const mockData: ApplicationData = {
          applicantId: user.userId,
          status: ApplicationStatus.UNDER_REVIEW,
          needType: NeedType.RENT,
          requestAmount: 750,
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          documentsUploaded: true,
          documentsVerified: false,
          selectedForReviewAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        };

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setApplicationData(mockData);
      } catch (err) {
        console.error('Error fetching application data:', err);
        setError('Failed to load your application data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [user.userId]);

  // Get status display information
  const getStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return {
          label: 'Pending',
          color: colors.warning,
          icon: 'time-outline',
          message: 'Your application is pending. Please upload all required documents.',
        };
      case ApplicationStatus.UNDER_REVIEW:
        return {
          label: 'Under Review',
          color: colors.info,
          icon: 'search-outline',
          message: 'Your application is currently being reviewed by our team.',
        };
      case ApplicationStatus.APPROVED:
        return {
          label: 'Approved',
          color: colors.success,
          icon: 'checkmark-circle-outline',
          message: 'Your application has been approved! Payment processing will begin soon.',
        };
      case ApplicationStatus.REJECTED:
        return {
          label: 'Not Selected',
          color: colors.error,
          icon: 'close-circle-outline',
          message: 'Your application was not selected this time. You can apply again next month.',
        };
      case ApplicationStatus.PAYMENT_PROCESSING:
        return {
          label: 'Payment Processing',
          color: colors.highlight,
          icon: 'card-outline',
          message: 'Your payment is being processed and will be sent directly to your service provider.',
        };
      case ApplicationStatus.PAYMENT_COMPLETE:
        return {
          label: 'Payment Complete',
          color: colors.success,
          icon: 'checkmark-done-outline',
          message: 'Payment has been successfully processed and sent to your service provider.',
        };
      default:
        return {
          label: 'Unknown',
          color: colors.secondaryText,
          icon: 'help-circle-outline',
          message: 'Please contact support for information about your application status.',
        };
    }
  };

  // Calculate application progress percentage
  const calculateProgress = (status: ApplicationStatus): number => {
    const statusValues = Object.values(ApplicationStatus);
    const currentIndex = statusValues.indexOf(status);
    return Math.round((currentIndex / (statusValues.length - 1)) * 100);
  };

  // Handle document upload
  const handleUploadDocuments = () => {
    if (applicationData?.documentsUploaded) {
      Alert.alert(
        'Documents Already Uploaded',
        'You have already uploaded your documents. Do you want to view or replace them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View/Replace', onPress: onUploadDocuments },
        ]
      );
    } else {
      onUploadDocuments();
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading your application data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)} // This would trigger a re-fetch in a real app
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No application data state
  if (!applicationData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.secondaryText} />
        <Text style={styles.emptyTitle}>No Application Found</Text>
        <Text style={styles.emptyMessage}>
          You haven't submitted an application yet. Start the process by uploading your documents.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onUploadDocuments}>
          <Text style={styles.primaryButtonText}>Start Application</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get status display information
  const statusInfo = getStatusInfo(applicationData.status);
  const progressPercentage = calculateProgress(applicationData.status);

  return (
    <ScrollView style={styles.container}>
      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusHeaderText}>Application Status</Text>
          <TouchableOpacity onPress={onViewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statusContent}>
          <View style={styles.statusIconContainer}>
            <Ionicons name={statusInfo.icon as any} size={32} color={statusInfo.color} />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
            <Text style={styles.statusMessage}>{statusInfo.message}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%`, backgroundColor: statusInfo.color }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage}% Complete</Text>
        </View>
      </View>

      {/* Application Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Application Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Need Type</Text>
          <Text style={styles.detailValue}>
            {applicationData.needType.charAt(0).toUpperCase() + applicationData.needType.slice(1)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Request Amount</Text>
          <Text style={styles.detailValue}>{formatCurrency(applicationData.requestAmount)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Submitted On</Text>
          <Text style={styles.detailValue}>{formatDate(applicationData.submittedAt)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Documents</Text>
          <View style={styles.documentStatus}>
            <View 
              style={[
                styles.documentStatusDot, 
                { backgroundColor: applicationData.documentsUploaded ? colors.success : colors.error }
              ]} 
            />
            <Text style={styles.detailValue}>
              {applicationData.documentsUploaded ? 'Uploaded' : 'Not Uploaded'}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Verification</Text>
          <View style={styles.documentStatus}>
            <View 
              style={[
                styles.documentStatusDot, 
                { backgroundColor: applicationData.documentsVerified ? colors.success : colors.warning }
              ]} 
            />
            <Text style={styles.detailValue}>
              {applicationData.documentsVerified ? 'Verified' : 'Pending Verification'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleUploadDocuments}
        >
          <Ionicons name="document-attach-outline" size={24} color={colors.accent} />
          <Text style={styles.actionButtonText}>
            {applicationData.documentsUploaded ? 'View Documents' : 'Upload Documents'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onViewDetails}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
          <Text style={styles.actionButtonText}>Application Details</Text>
        </TouchableOpacity>
      </View>

      {/* Next Steps */}
      <View style={styles.nextStepsCard}>
        <Text style={styles.cardTitle}>Next Steps</Text>
        
        <View style={styles.stepItem}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>
              {applicationData.documentsUploaded ? 'Documents Uploaded ✓' : 'Upload Required Documents'}
            </Text>
            <Text style={styles.stepDescription}>
              {applicationData.documentsUploaded 
                ? 'Your documents have been successfully uploaded and are being verified.'
                : 'Upload your ID and proof of expenses (bills, lease, tuition statement).'
              }
            </Text>
          </View>
        </View>
        
        <View style={styles.stepItem}>
          <View style={[
            styles.stepNumberContainer,
            applicationData.status === ApplicationStatus.UNDER_REVIEW && styles.activeStepNumber
          ]}>
            <Text style={[
              styles.stepNumber,
              applicationData.status === ApplicationStatus.UNDER_REVIEW && styles.activeStepNumberText
            ]}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Application Review</Text>
            <Text style={styles.stepDescription}>
              Our team will review your application and verify your documents.
              {applicationData.status === ApplicationStatus.UNDER_REVIEW && ' This is currently in progress.'}
            </Text>
          </View>
        </View>
        
        <View style={styles.stepItem}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Selection Process</Text>
            <Text style={styles.stepDescription}>
              Each month, recipients are randomly selected from the pool of verified applicants.
            </Text>
          </View>
        </View>
        
        <View style={styles.stepItem}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Payment Processing</Text>
            <Text style={styles.stepDescription}>
              If selected, payment will be processed directly to your service provider.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.error,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusHeaderText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
  },
  viewDetailsText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.accent,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    marginBottom: 4,
  },
  statusMessage: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
    textAlign: 'right',
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.subheading,
    color: colors.primaryText,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
  },
  detailValue: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    color: colors.primaryText,
    marginTop: 8,
    textAlign: 'center',
  },
  nextStepsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  activeStepNumber: {
    backgroundColor: colors.accent,
  },
  stepNumber: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
  },
  activeStepNumberText: {
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 4,
  },
  stepDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
  },
});

export default ApplicantDashboard;
