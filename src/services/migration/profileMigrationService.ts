import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

/**
 * Service to handle one-time migrations for profile data
 * This is used to move data from subscriber document to profile subcollection
 */
export class ProfileMigrationService {
  /**
   * Migrates address data from subscriber document to profile subcollection for a user
   * @param userId User ID to migrate data for
   * @returns Promise resolving to true if migration was performed or false if not needed
   */
  public static async migrateSubscriberDataToProfile(userId: string): Promise<boolean> {
    console.log(`Starting profile migration for user ${userId}`);
    try {
      const db = firebase.firestore();
      
      // Check if profile already exists
      const profileRef = db.collection('users').doc(userId).collection('profile').doc('details');
      const profileDoc = await profileRef.get();
      
      if (profileDoc.exists) {
        console.log('Profile document already exists, checking if it needs data migration');
        
        // Check if profile already has address data
        const profileData = profileDoc.data() as any;
        if (profileData.address || profileData.city || profileData.state || profileData.zipCode) {
          console.log('Profile already has address data, no migration needed');
          return false;
        }
      }
      
      // Get user document to determine user type
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        console.log('User document not found, cannot migrate data');
        return false;
      }
      
      const userData = userDoc.data() as any;
      const userType = userData.userType;
      
      // Initialize source data
      let sourceData: any = null;
      let sourceType: string = '';
      
      // Check subscriber collection if user is a subscriber
      if (userType === 'subscriber') {
        const subscriberRef = db.collection('subscribers').doc(userId);
        const subscriberDoc = await subscriberRef.get();
        
        if (subscriberDoc.exists) {
          sourceData = subscriberDoc.data() as any;
          sourceType = 'subscriber';
          console.log('Found subscriber data for migration:', sourceData);
        }
      } 
      // Check applicant collection if user is an applicant
      else if (userType === 'applicant') {
        const applicantRef = db.collection('applicants').doc(userId);
        const applicantDoc = await applicantRef.get();
        
        if (applicantDoc.exists) {
          sourceData = applicantDoc.data() as any;
          sourceType = 'applicant';
          console.log('Found applicant data for migration:', sourceData);
        }
      }
      
      // If no source data found, return
      if (!sourceData) {
        console.log('No source document found for migration');
        return false;
      }
      
      // Check if source has address data
      if (!sourceData.address && !sourceData.city && !sourceData.state && !sourceData.zipCode) {
        console.log('Source document does not have address data, no migration needed');
        return false;
      }
      
      // Create or update profile document with source data
      const profileData: Record<string, any> = {
        name: sourceData.name || '',
        phone: sourceData.phone || '',
        address: sourceData.address || '',
        city: sourceData.city || '',
        state: sourceData.state || '',
        zipCode: sourceData.zipCode || '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        metadata: {
          createdBy: 'profile_migration_service',
          updatedBy: 'profile_migration_service',
          environment: process.env.NODE_ENV || 'development',
          migratedAt: firebase.firestore.FieldValue.serverTimestamp(),
          sourceType: sourceType
        }
      };
      
      // If profile doesn't exist, add creation timestamp
      if (!profileDoc.exists) {
        profileData['createdAt'] = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      // Set or update profile document
      if (profileDoc.exists) {
        await profileRef.update(profileData);
        console.log('Updated existing profile document with source data');
      } else {
        await profileRef.set(profileData);
        console.log('Created new profile document with source data');
      }
      
      console.log('Profile migration completed successfully');
      return true;
    } catch (error) {
      console.error('Error during profile migration:', error);
      return false;
    }
  }
} 