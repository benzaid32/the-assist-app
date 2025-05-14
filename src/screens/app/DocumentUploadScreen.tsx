import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, globalStyles } from '../../constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import documentUploadService, { 
  DocumentCategory, 
  UploadStatus 
} from '../../services/DocumentUploadService';

// Document status mapping to our service
enum DocumentStatus {
  NOT_UPLOADED = 'not_uploaded',
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  VERIFIED = 'verified',
  ERROR = 'error',
}

// Map DocumentType to DocumentCategory
const documentTypeToCategory = {
  id: DocumentCategory.IDS,
  bill: DocumentCategory.BILLS,
  lease: DocumentCategory.BILLS,
  tuition: DocumentCategory.PROOFS,
};

// Document interface
interface Document {
  type: string;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: number;
  fileUri?: string;
  uploadedAt?: Date;
  verifiedAt?: Date;
  error?: string;
  documentId?: string;
  downloadUrl?: string;
}

/**
 * DocumentUploadScreen component
 * Allows applicants to upload required documents for their application
 * Follows enterprise-grade development guidelines with proper error handling and UI states
 */
export const DocumentUploadScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, Document>>({
    'id': {
      type: 'id',
      status: DocumentStatus.NOT_UPLOADED,
    },
    'bill': {
      type: 'bill',
      status: DocumentStatus.NOT_UPLOADED,
    },
    'lease': {
      type: 'lease',
      status: DocumentStatus.NOT_UPLOADED,
    },
    'tuition': {
      type: 'tuition',
      status: DocumentStatus.NOT_UPLOADED,
    },
  });

  // Load existing documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user documents from the service
        const userDocs = await documentUploadService.getUserDocuments();
        
        // If we have documents, update the state
        if (userDocs && userDocs.length > 0) {
          const updatedDocs = { ...documents };
          
          // Process each document and update the state
          userDocs.forEach(doc => {
            const docType = doc.metadata?.documentType || '';
            const mappedType = Object.keys(documentTypeToCategory).find(
              key => documentTypeToCategory[key as keyof typeof documentTypeToCategory] === docType
            );
            
            if (mappedType && updatedDocs[mappedType]) {
              updatedDocs[mappedType] = {
                type: mappedType,
                status: doc.status === 'pending_verification' ? 
                  DocumentStatus.UPLOADED : 
                  doc.status === 'verified' ? 
                    DocumentStatus.VERIFIED : 
                    DocumentStatus.UPLOADED,
                fileName: doc.metadata?.fileName || '',
                fileSize: doc.metadata?.fileSize || 0,
                uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
                documentId: doc.documentId,
                downloadUrl: doc.downloadUrl,
              };
            }
          });
          
          setDocuments(updatedDocs);
        }
      } catch (err) {
        console.error('Error loading documents:', err);
        setError('Failed to load your documents. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Handle document upload
  const handleUploadDocument = async (documentType: string) => {
    try {
      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file size (max 5MB as per storage rules)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert(
          'File Too Large',
          'Please upload a file smaller than 5MB to comply with security requirements.'
        );
        return;
      }

      // Update document status to uploading
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          status: DocumentStatus.UPLOADING,
          fileName: file.name,
          fileSize: file.size,
          fileUri: file.uri,
        },
      }));

      setUploading(true);

      // Map document type to category for our service
      const category = documentTypeToCategory[documentType as keyof typeof documentTypeToCategory];
      
      if (!category) {
        throw new Error(`Invalid document type: ${documentType}`);
      }
      
      // Use our secure document upload service
      const uploadResult = await documentUploadService.uploadDocument(
        file.uri,
        category,
        file.name
      );

      if (uploadResult.status === UploadStatus.SUCCESS) {
        // Update document status to uploaded
        setDocuments(prev => ({
          ...prev,
          [documentType]: {
            ...prev[documentType],
            status: DocumentStatus.UPLOADED,
            uploadedAt: new Date(),
            documentId: uploadResult.documentId,
            downloadUrl: uploadResult.downloadUrl,
          },
        }));

        Alert.alert(
          'Upload Successful',
          `${file.name} has been uploaded successfully and is pending verification.`
        );
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      
      // Update document status to error
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          status: DocumentStatus.ERROR,
          error: err instanceof Error ? err.message : 'Failed to upload document. Please try again.',
        },
      }));

      Alert.alert(
        'Upload Failed',
        'There was an error uploading your document. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Get document type display name
  const getDocumentTypeName = (type: DocumentType): string => {
    switch (type) {
      case DocumentType.ID:
        return 'Government-Issued ID';
      case DocumentType.BILL:
        return 'Utility Bill';
      case DocumentType.LEASE:
        return 'Lease Agreement';
      case DocumentType.TUITION:
        return 'Tuition Statement';
      default:
        return 'Document';
    }
  };

  // Get document status display information
  const getDocumentStatusInfo = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.NOT_UPLOADED:
        return {
          label: 'Not Uploaded',
          color: colors.secondaryText,
          icon: 'cloud-upload-outline',
        };
      case DocumentStatus.UPLOADING:
        return {
          label: 'Uploading...',
          color: colors.info,
          icon: 'cloud-upload-outline',
        };
      case DocumentStatus.UPLOADED:
        return {
          label: 'Uploaded',
          color: colors.success,
          icon: 'checkmark-circle-outline',
        };
      case DocumentStatus.VERIFIED:
        return {
          label: 'Verified',
          color: colors.success,
          icon: 'shield-checkmark-outline',
        };
      case DocumentStatus.ERROR:
        return {
          label: 'Error',
          color: colors.error,
          icon: 'alert-circle-outline',
        };
      default:
        return {
          label: 'Unknown',
          color: colors.secondaryText,
          icon: 'help-circle-outline',
        };
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Upload</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.black} />
          <Text style={styles.loadingText}>Loading your documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Upload</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
            }}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Upload</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Main content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.cardTitle}>Upload Required Documents</Text>
          <Text style={styles.instructionsText}>
            Please upload the following documents to complete your application. All documents must be
            clear, legible, and in PDF or image format. Maximum file size is 20MB per document.
          </Text>
          
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.black} />
              <Text style={styles.requirementText}>Government-issued ID (passport, driver's license)</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.black} />
              <Text style={styles.requirementText}>Recent utility bill (within last 3 months)</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.black} />
              <Text style={styles.requirementText}>Lease agreement (if applying for rent assistance)</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.black} />
              <Text style={styles.requirementText}>Tuition statement (if applying for education assistance)</Text>
            </View>
          </View>
        </View>
        
        {/* Document upload cards */}
        {Object.values(documents).map((document) => {
          const statusInfo = getDocumentStatusInfo(document.status);
          
          return (
            <View key={document.type} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <Text style={styles.documentTitle}>{getDocumentTypeName(document.type)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                  <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
              </View>
              
              {document.status === DocumentStatus.UPLOADED && (
                <View style={styles.fileInfoContainer}>
                  <Ionicons name="document-text" size={24} color={colors.black} />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                      {document.fileName}
                    </Text>
                    <Text style={styles.fileDetails}>
                      {formatFileSize(document.fileSize)} • Uploaded {document.uploadedAt?.toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}
              
              {document.status === DocumentStatus.ERROR && (
                <Text style={styles.errorMessage}>{document.error}</Text>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.uploadButton,
                  document.status === DocumentStatus.UPLOADING && styles.disabledButton
                ]}
                onPress={() => handleUploadDocument(document.type)}
                disabled={document.status === DocumentStatus.UPLOADING || uploading}
              >
                {document.status === DocumentStatus.UPLOADING ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons 
                    name={document.status === DocumentStatus.UPLOADED ? "refresh" : "cloud-upload"} 
                    size={18} 
                    color={colors.white} 
                  />
                )}
                <Text style={styles.uploadButtonText}>
                  {document.status === DocumentStatus.UPLOADING
                    ? 'Uploading...'
                    : document.status === DocumentStatus.UPLOADED
                    ? 'Replace'
                    : 'Upload'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        
        {/* Submit section */}
        <View style={styles.submitSection}>
          <Text style={styles.submitTitle}>Ready to Submit?</Text>
          <Text style={styles.submitDescription}>
            Once you've uploaded all required documents, your application will be reviewed by our team.
            You'll be notified when your documents are verified.
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!documents[DocumentType.ID].uploadedAt || uploading) && styles.disabledButton
            ]}
            disabled={!documents[DocumentType.ID].uploadedAt || uploading}
            onPress={() => {
              Alert.alert(
                'Application Submitted',
                'Your application has been submitted successfully. You can check the status on your dashboard.',
                [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]
              );
            }}
          >
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title,
    color: colors.black,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  // Loading and error states
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
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title,
    color: colors.primaryText,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    textAlign: 'center',
  },
  // Content styles
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Instructions card
  instructionsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.subheading,
    color: colors.black,
    marginBottom: 12,
  },
  instructionsText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 16,
    lineHeight: 22,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginLeft: 8,
    flex: 1,
  },
  // Document card
  documentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.black,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.caption,
    marginLeft: 4,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.black,
  },
  fileDetails: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.secondaryText,
    marginTop: 2,
  },
  errorMessage: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.caption,
    color: colors.error,
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Submit section
  submitSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  submitTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.subheading,
    color: colors.black,
    marginBottom: 8,
  },
  submitDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: colors.black,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.button,
    color: colors.white,
  },
});

export default DocumentUploadScreen;
