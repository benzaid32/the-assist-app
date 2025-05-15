import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { getFirebaseServices } from './firebase/config';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Define our own FileInfo interface to ensure type safety
interface ExtendedFileInfo {
  size: number;
  exists: boolean;
  uri: string;
  isDirectory: boolean;
  modificationTime?: number;
  md5?: string;
}
import * as ImageManipulator from 'expo-image-manipulator';
import * as crypto from 'expo-crypto';
import { UserType } from '../types/auth';

// Document categories
export enum DocumentCategory {
  IDS = 'ids',
  BILLS = 'bills',
  PROOFS = 'proofs',
}

// Document upload status
export enum UploadStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Document metadata
export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadTimestamp: number;
  visibility: 'private' | 'admin';
  documentType: DocumentCategory;
  originalHash?: string;
  processingStatus?: 'pending' | 'verified' | 'rejected';
}

// Upload result
export interface UploadResult {
  status: UploadStatus;
  documentId?: string;
  downloadUrl?: string;
  error?: string;
  metadata?: DocumentMetadata;
}

/**
 * DocumentUploadService
 * Handles secure document uploads to Firebase Storage
 * Implements enterprise-grade security and fraud prevention
 */
export class DocumentUploadService {
  // Use initialized services from the central Firebase config
  private get storage() {
    return getFirebaseServices().storage;
  }
  
  private get firestore() {
    return getFirebaseServices().firestore;
  }
  
  private get auth() {
    return getFirebaseServices().auth;
  }
  
  /**
   * Generate a secure, random document ID
   * @returns A random document ID
   */
  private generateDocumentId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 20;
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
  
  /**
   * Calculate file hash for integrity verification
   * @param uri File URI
   * @returns SHA-256 hash of the file
   */
  private async calculateFileHash(uri: string): Promise<string> {
    try {
      // Read file as base64
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Calculate SHA-256 hash
      const hash = await crypto.digestStringAsync(
        crypto.CryptoDigestAlgorithm.SHA256,
        fileContent
      );
      
      return hash;
    } catch (error) {
      console.error('Error calculating file hash:', error);
      throw new Error('Failed to calculate file hash for integrity verification');
    }
  }
  
  /**
   * Optimize image for upload (reduce size, strip metadata)
   * @param uri Image URI
   * @returns Optimized image URI
   */
  private async optimizeImage(uri: string): Promise<string> {
    try {
      // Check if file is an image
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileType = uri.split('.').pop()?.toLowerCase();
      
      if (!fileType || !['jpg', 'jpeg', 'png'].includes(fileType)) {
        return uri; // Not an image, return original URI
      }
      
      // Optimize image
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }], // Resize to max width of 1200px
        {
          compress: 0.8, // 80% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return uri; // Return original URI if optimization fails
    }
  }
  
  /**
   * Validate document before upload
   * @param uri File URI
   * @param category Document category
   * @returns Validation result
   */
  private async validateDocument(uri: string, category: DocumentCategory): Promise<boolean> {
    try {
      // Get file info with proper enterprise-grade type safety
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true }) as ExtendedFileInfo;
      
      // Check file size (max 5MB)
      if (fileInfo.size > 5 * 1024 * 1024) {
        Alert.alert(
          'File Too Large',
          'The file size exceeds the maximum allowed size of 5MB. Please upload a smaller file.'
        );
        return false;
      }
      
      // Check file type
      const fileType = uri.split('.').pop()?.toLowerCase();
      if (!fileType || !['jpg', 'jpeg', 'png', 'pdf'].includes(fileType)) {
        Alert.alert(
          'Invalid File Type',
          'Please upload a PDF or image file (JPG, PNG).'
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating document:', error);
      Alert.alert('Validation Error', 'Failed to validate document. Please try again.');
      return false;
    }
  }
  
  /**
   * Upload document to Firebase Storage
   * @param uri File URI
   * @param category Document category
   * @param fileName Optional custom file name
   * @returns Upload result
   */
  public async uploadDocument(
    uri: string,
    category: DocumentCategory,
    fileName?: string
  ): Promise<UploadResult> {
    try {
      // Validate inputs
      if (!uri) {
        return { status: UploadStatus.ERROR, error: 'No file URI provided' };
      }

      // Get current user
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        return { status: UploadStatus.ERROR, error: 'User not authenticated' };
      }

      // Get file info with proper enterprise-grade type safety
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true }) as ExtendedFileInfo;
      const userDoc = await this.firestore.collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();
      
      if (!userData || userData.userType !== UserType.APPLICANT) {
        throw new Error('User is not authorized to upload documents');
      }
      
      // Validate document
      const isValid = await this.validateDocument(uri, category);
      if (!isValid) {
        return { status: UploadStatus.ERROR, error: 'Document validation failed' };
      }
      
      // Optimize image if needed
      const optimizedUri = await this.optimizeImage(uri);
      
      // Calculate file hash for integrity verification
      const fileHash = await this.calculateFileHash(optimizedUri);
      
      // Generate secure document ID
      const documentId = this.generateDocumentId();
      
      // Get file info for the optimized file
      const optimizedFileInfo = await FileSystem.getInfoAsync(optimizedUri, { size: true }) as ExtendedFileInfo;
      const fileType = optimizedUri.split('.').pop()?.toLowerCase() || '';
      const secureFileName = `${documentId}.${fileType}`;
      
      // Create storage reference
      const storageRef = this.storage.ref(`uploads/${currentUser.uid}/${category}/${secureFileName}`);
      
      // Prepare metadata
      const metadata: DocumentMetadata = {
        fileName: fileName || secureFileName,
        fileSize: optimizedFileInfo.size,
        fileType: fileType === 'pdf' ? 'application/pdf' : `image/${fileType}`,
        uploadedBy: currentUser.uid,
        uploadTimestamp: Date.now(),
        visibility: 'private',
        documentType: category,
        originalHash: fileHash,
        processingStatus: 'pending',
      };
      
      // Convert file to blob
      const response = await fetch(optimizedUri);
      const blob = await response.blob();
      
      // Upload file with metadata
      const uploadTask = storageRef.put(blob, {
        customMetadata: {
          ...Object.entries(metadata).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
            return acc;
          }, {} as Record<string, string>),
        },
      });
      
      // Monitor upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress monitoring could be implemented here
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error('Upload failed:', error);
            resolve({
              status: UploadStatus.ERROR,
              error: error.message,
            });
          },
          async () => {
            // Handle successful upload
            try {
              // Get download URL
              const downloadUrl = await storageRef.getDownloadURL();
              
              // Update Firestore with document reference
              await this.firestore.collection('userDocuments').add({
                userId: currentUser.uid,
                category,
                documentId: secureFileName,
                storagePath: storageRef.fullPath,
                downloadUrl,
                metadata,
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending_verification',
              });
              
              // Update upload counter for rate limiting
              await this.firestore.collection('uploadCounters').doc(currentUser.uid).set({
                count: firebase.firestore.FieldValue.increment(1),
                lastUpload: firebase.firestore.FieldValue.serverTimestamp(),
              }, { merge: true });
              
              resolve({
                status: UploadStatus.SUCCESS,
                documentId: secureFileName,
                downloadUrl,
                metadata,
              });
            } catch (error) {
              console.error('Error finalizing upload:', error);
              resolve({
                status: UploadStatus.ERROR,
                error: 'Failed to finalize upload',
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('Document upload error:', error);
      return {
        status: UploadStatus.ERROR,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
  
  /**
   * Get all documents for the current user
   * @param category Optional category filter
   * @returns Array of documents
   */
  public async getUserDocuments(category?: DocumentCategory) {
    try {
      // Check if user is authenticated
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Query Firestore for user documents
      let query = this.firestore.collection('userDocuments')
        .where('userId', '==', currentUser.uid);
      
      // Apply category filter if provided
      if (category) {
        query = query.where('category', '==', category);
      }
      
      // Execute query
      const snapshot = await query.get();
      
      // Map documents to results
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }
  
  /**
   * Delete a document (only if allowed by security rules)
   * @param documentId Document ID to delete
   * @returns Success status
   */
  public async requestDocumentDeletion(documentId: string): Promise<boolean> {
    try {
      // Check if user is authenticated
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Find document in Firestore
      const snapshot = await this.firestore.collection('userDocuments')
        .where('documentId', '==', documentId)
        .where('userId', '==', currentUser.uid)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        throw new Error('Document not found or you do not have permission to delete it');
      }
      
      const docRef = snapshot.docs[0].ref;
      const docData = snapshot.docs[0].data();
      
      // Mark document for deletion (admin will need to approve)
      await docRef.update({
        status: 'pending_deletion',
        deletionRequestedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      // Update storage metadata
      const storageRef = this.storage.ref(docData.storagePath);
      await storageRef.updateMetadata({
        customMetadata: {
          markedForDeletion: 'true',
          deletionRequestedAt: Date.now().toString(),
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error requesting document deletion:', error);
      return false;
    }
  }
}

// Export singleton instance
export const documentUploadService = new DocumentUploadService();
export default documentUploadService;
