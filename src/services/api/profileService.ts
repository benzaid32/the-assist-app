import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { User, UserType } from '../../types/auth';
import { ProfileMigrationService } from '../migration/profileMigrationService';

/**
 * Interface for user profile data
 */
export interface ProfileData {
  name?: string;
  email?: string | null;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  subscriptionDetails?: {
    tier: string;
    amount: number;
    startDate: string;
    nextPaymentDate: string;
  };
  impact?: {
    totalContributed: number;
    peopleHelped: number;
    joinedSince: string;
  };
}

/**
 * Enterprise-grade ProfileService for handling user profile operations
 * Follows industry best practices for data management and security
 */
export class ProfileService {
  /**
   * Initializes a user's profile data with default values if it doesn't exist
   * This is a best-effort operation that will not throw an error if it fails
   * @param userId - The ID of the user
   */
  public static async initializeProfileIfNeeded(userId: string): Promise<void> {
    try {
      console.log(`Checking if profile needs initialization for user: ${userId}`);
      const db = firebase.firestore();
      
      // First, try to get the user document to get basic info like email
      let userData = null;
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          userData = userDoc.data() as any;
        } else {
          console.log(`User document not found for ID: ${userId}, skipping profile initialization`);
          return;
        }
      } catch (userError) {
        console.error(`Error retrieving user document: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
        // Continue with default values if we can't get the user data
      }
      
      // Check if profile details document exists - without failing if there's no permission
      try {
        const profileRef = db.collection('users').doc(userId).collection('profile').doc('details');
        const profileDoc = await profileRef.get();
        
        if (!profileDoc.exists) {
          console.log(`Profile doesn't exist for user: ${userId}, will create on first update`);
          
          // We won't try to create it here since it might fail due to permissions
          // It will be created when the user updates their profile
        } else {
          console.log(`Profile already exists for user: ${userId}`);
          
          // Check if profile has name and update user document if needed
          try {
            const profileData = profileDoc.data() as any;
            if (profileData.name && userData && !userData.displayName) {
              console.log(`Updating user document with name from profile: ${profileData.name}`);
              
              // Update the user document with the name from profile
              const userRef = db.collection('users').doc(userId);
              await userRef.update({
                displayName: profileData.name,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              });
              
              console.log(`Updated displayName in user document: ${profileData.name}`);
            }
          } catch (syncError) {
            console.error(`Error syncing profile name to user document: ${syncError instanceof Error ? syncError.message : 'Unknown error'}`);
            // Non-critical error, we can ignore it
          }
        }
      } catch (profileError) {
        console.error(`Error checking profile existence: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
        // Continue even if we can't check the profile existence
      }
    } catch (error) {
      console.error(`Error in profile initialization: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // This is a best-effort operation, so we don't throw
    }
  }

  /**
   * Fetches the user profile data from Firestore
   * @param userId - The ID of the user
   * @param userType - The type of user (subscriber or applicant)
   * @returns Promise resolving to the user's profile data
   */
  public static async getProfileData(userId: string, userType: string): Promise<ProfileData> {
    try {
      console.log(`Fetching profile data for user: ${userId}, type: ${userType}`);
      const db = firebase.firestore();
      
      // Initialize profile data with default values
      const profileData: ProfileData = {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      };
      
      // Get user document from Firestore - this contains data from signup
      let userDoc;
      try {
        userDoc = await db.collection('users').doc(userId).get();
        console.log(`Retrieved user document with ID ${userId}, exists: ${userDoc.exists}`);
      } catch (userError) {
        console.error(`Error retrieving user document: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
        throw new Error(`Failed to retrieve user document: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
      }
      
      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data() as any;
      console.log('User data from main document:', userData);
      
      // Set email from user document
      profileData.email = userData.email;
      
      // Get email username as default name if displayName is not set
      const defaultName = userData.email ? userData.email.split('@')[0] : 'User';
      profileData.name = userData.displayName || defaultName;
      
      // Check for address fields in the main user document (from signup)
      if (userData.phone) profileData.phone = userData.phone;
      if (userData.address) profileData.address = userData.address;
      if (userData.city) profileData.city = userData.city;
      if (userData.state) profileData.state = userData.state;
      if (userData.zipCode) profileData.zipCode = userData.zipCode;
      
      // Get subscriber data if applicable - this has priority for name and subscription details
      let subscriberData: any = null;
      let applicantData: any = null;
      
      if (userType === UserType.SUBSCRIBER) {
        try {
          const subscriberDoc = await db.collection('subscribers').doc(userId).get();
          console.log(`Retrieved subscriber document, exists: ${subscriberDoc.exists}`);
          
          if (subscriberDoc.exists) {
            subscriberData = subscriberDoc.data() as any;
            console.log('Subscriber data:', subscriberData);
            
            // Use name from subscriber data if available (higher priority)
            if (subscriberData.name) {
              profileData.name = subscriberData.name;
            }
            
            // Get subscription data with correct values from subscriber document
            profileData.subscriptionDetails = {
              tier: subscriberData.tier || 'Basic',
              amount: subscriberData.subscriptionAmount || 10,
              startDate: subscriberData.startDate ? new Date(subscriberData.startDate.toDate()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              nextPaymentDate: subscriberData.nextPaymentDate ? new Date(subscriberData.nextPaymentDate.toDate()).toISOString().split('T')[0] : 
                              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
            
            // Get impact data if available
            profileData.impact = {
              totalContributed: subscriberData.totalContributed || 0,
              peopleHelped: subscriberData.peopleHelped || 0,
              joinedSince: userData.createdAt ? new Date(userData.createdAt.toDate()).toISOString().split('T')[0] : 
                           new Date().toISOString().split('T')[0]
            };
            
            // Also check for address fields in subscriber data
            if (subscriberData.phone) profileData.phone = subscriberData.phone;
            if (subscriberData.address) profileData.address = subscriberData.address;
            if (subscriberData.city) profileData.city = subscriberData.city;
            if (subscriberData.state) profileData.state = subscriberData.state;
            if (subscriberData.zipCode) profileData.zipCode = subscriberData.zipCode;
          }
        } catch (subscriberError) {
          console.error(`Error retrieving subscriber document: ${subscriberError instanceof Error ? subscriberError.message : 'Unknown error'}`);
          // Continue without subscriber data
        }
      } else if (userType === UserType.APPLICANT) {
        try {
          const applicantDoc = await db.collection('applicants').doc(userId).get();
          console.log(`Retrieved applicant document, exists: ${applicantDoc.exists}`);
          
          if (applicantDoc.exists) {
            applicantData = applicantDoc.data() as any;
            console.log('Applicant data:', applicantData);
            
            // Use name from applicant data if available (higher priority)
            if (applicantData.name) {
              profileData.name = applicantData.name;
            }
            
            // Also check for address fields in applicant data
            if (applicantData.phone) profileData.phone = applicantData.phone;
            if (applicantData.address) profileData.address = applicantData.address;
            if (applicantData.city) profileData.city = applicantData.city;
            if (applicantData.state) profileData.state = applicantData.state;
            if (applicantData.zipCode) profileData.zipCode = applicantData.zipCode;
          }
        } catch (applicantError) {
          console.error(`Error retrieving applicant document: ${applicantError instanceof Error ? applicantError.message : 'Unknown error'}`);
          // Continue without applicant data
        }
      }
      
      // Try to migrate any existing data from subscriber/applicant document to profile subcollection
      // This helps with older accounts that might not have a profile subcollection yet
      try {
        const hasSourceData = 
          (subscriberData && (subscriberData.address || subscriberData.city || subscriberData.state || subscriberData.zipCode)) ||
          (applicantData && (applicantData.address || applicantData.city || applicantData.state || applicantData.zipCode));
            
        if (hasSourceData) {
          console.log(`Attempting to migrate user data to profile for user: ${userId}`);
          const migrated = await ProfileMigrationService.migrateSubscriberDataToProfile(userId);
          if (migrated) {
            console.log(`Successfully migrated user data to profile for user: ${userId}`);
          }
        }
      } catch (migrationError) {
        console.error(`Error during data migration: ${migrationError instanceof Error ? migrationError.message : 'Unknown error'}`);
        // Continue even if migration fails - this is a best-effort operation
      }
      
      // Also check the profile subcollection for any existing data (highest priority)
      try {
        const profileRef = db.collection('users').doc(userId).collection('profile').doc('details');
        const profileDoc = await profileRef.get();
        console.log(`Retrieved profile details document, exists: ${profileDoc.exists}`);
        
        if (profileDoc.exists) {
          const profileDetails = profileDoc.data() as any;
          console.log('Existing profile details:', profileDetails);
          
          // Use data from profile details if it exists (highest priority)
          if (profileDetails.name) profileData.name = profileDetails.name;
          if (profileDetails.phone) profileData.phone = profileDetails.phone;
          if (profileDetails.address) profileData.address = profileDetails.address;
          if (profileDetails.city) profileData.city = profileDetails.city;
          if (profileDetails.state) profileData.state = profileDetails.state;
          if (profileDetails.zipCode) profileData.zipCode = profileDetails.zipCode;
        } else if ((profileData.address || profileData.phone || profileData.city || profileData.state || profileData.zipCode) ||
                  (subscriberData && (subscriberData.address || subscriberData.phone || subscriberData.city || subscriberData.state || subscriberData.zipCode)) ||
                  (applicantData && (applicantData.address || applicantData.phone || applicantData.city || applicantData.state || applicantData.zipCode))) {
          console.log(`Profile details document does not exist, will create one with collected data`);
          
          // Create a profile document with data from all sources
          try {
            const profileDetails = {
              name: profileData.name,
              phone: profileData.phone || '',
              address: profileData.address || '',
              city: profileData.city || '',
              state: profileData.state || '',
              zipCode: profileData.zipCode || '',
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              metadata: {
                createdBy: 'profile_service',
                updatedBy: 'profile_service',
                environment: process.env.NODE_ENV || 'development',
                migratedFromSignup: true
              }
            };
            
            // Set the profile document
            await profileRef.set(profileDetails);
            console.log(`Created profile document with collected data:`, profileDetails);
          } catch (createError) {
            console.error(`Error creating profile document: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
            // Continue without creating profile document
          }
        }
      } catch (profileError) {
        console.error(`Error retrieving profile details: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
        // Continue without profile details
      }
      
      console.log('Final profile data:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      
      // Error handling with descriptive messages
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('permission-denied')) {
          console.error('Permission denied error. User may not have access to their own profile data.', 
                     `User ID: ${userId}, User Type: ${userType}`);
          throw new Error('You do not have permission to access this profile. Please contact support.');
        } else if (errorMessage.includes('not-found')) {
          throw new Error('Profile data not found');
        } else {
          throw new Error(`Failed to fetch profile data: ${errorMessage}`);
        }
      }
      
      throw new Error('An unexpected error occurred while fetching your profile');
    }
  }
  
  /**
   * Updates the user profile data in Firestore
   * @param userId - The ID of the user
   * @param profileData - The profile data to update
   * @returns Promise resolving to void
   */
  public static async updateProfileData(userId: string, profileData: Partial<ProfileData>): Promise<void> {
    try {
      console.log(`Updating profile data for user: ${userId}`, JSON.stringify(profileData));
      const db = firebase.firestore();
      
      // Step 1: Determine user type by checking both subscribers and applicants collections
      let userType: string = 'unknown';
      try {
        // First check the main user document to get the userType
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData && userData.userType) {
            userType = userData.userType;
            console.log(`Found user type in user document: ${userType}`);
          }
        }
        
        // If user type not found in main document, check specific collections
        if (userType === 'unknown') {
          const subscriberDoc = await db.collection('subscribers').doc(userId).get();
          if (subscriberDoc.exists) {
            userType = 'subscriber';
            console.log('User found in subscribers collection');
          } else {
            const applicantDoc = await db.collection('applicants').doc(userId).get();
            if (applicantDoc.exists) {
              userType = 'applicant';
              console.log('User found in applicants collection');
            }
          }
        }
      } catch (typeError) {
        console.error('Error determining user type:', typeError);
        // Continue with uncertain user type
      }
      
      // Step 2: Check if the profile document exists 
      const profileRef = db.collection('users').doc(userId).collection('profile').doc('details');
      const profileDoc = await profileRef.get();
      
      // Extract address and contact details
      const profileDetails: any = {};
      
      if (profileData.name) profileDetails.name = profileData.name;
      if (profileData.phone) profileDetails.phone = profileData.phone;
      if (profileData.address) profileDetails.address = profileData.address;
      if (profileData.city) profileDetails.city = profileData.city;
      if (profileData.state) profileDetails.state = profileData.state;
      if (profileData.zipCode) profileDetails.zipCode = profileData.zipCode;
      
      // Add metadata for timestamps
      profileDetails.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      
      // Step 3: Update the profile subcollection document
      if (!profileDoc.exists) {
        console.log(`Profile document doesn't exist, creating it`);
        profileDetails.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        profileDetails.metadata = {
          createdBy: 'profile_service',
          updatedBy: 'profile_service',
          environment: process.env.NODE_ENV || 'development'
        };
        
        // Use set instead of update for a new document
        await profileRef.set(profileDetails);
        console.log(`Created new profile document for user: ${userId}`);
      } else {
        // Update existing document
        await profileRef.update(profileDetails);
        console.log(`Updated existing profile document for user: ${userId}`);
      }
      
      // Step 4: Update the main user document with name and address info
      if (profileData.name || profileData.address || profileData.city || profileData.state || profileData.zipCode) {
        try {
          const userRef = db.collection('users').doc(userId);
          const userUpdateData: any = {
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            // Mark profile as complete if all address fields are provided
            profileComplete: !!(profileData.address && profileData.city && profileData.state && profileData.zipCode)
          };
          
          if (profileData.name) userUpdateData.displayName = profileData.name;
          if (profileData.address) userUpdateData.address = profileData.address;
          if (profileData.city) userUpdateData.city = profileData.city;
          if (profileData.state) userUpdateData.state = profileData.state;
          if (profileData.zipCode) userUpdateData.zipCode = profileData.zipCode;
          
          await userRef.update(userUpdateData);
          console.log(`Updated user document with profile data`, userUpdateData);
        } catch (userUpdateError) {
          console.error(`Error updating user document: ${userUpdateError instanceof Error ? userUpdateError.message : 'Unknown error'}`);
          // Continue even if user document update fails
        }
      }
    
      // Step 5: Also update user type specific document (subscriber or applicant)
      if (userType === 'subscriber' || userType === 'applicant') {
        try {
          const collectionName = userType === 'subscriber' ? 'subscribers' : 'applicants';
          const typeDocRef = db.collection(collectionName).doc(userId);
          
          // Just update the specific fields that were provided
          const typeUpdateData: any = {
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          
          if (profileData.name) typeUpdateData.name = profileData.name;
          if (profileData.phone) typeUpdateData.phone = profileData.phone;
          if (profileData.address) typeUpdateData.address = profileData.address;
          if (profileData.city) typeUpdateData.city = profileData.city;
          if (profileData.state) typeUpdateData.state = profileData.state;
          if (profileData.zipCode) typeUpdateData.zipCode = profileData.zipCode;
          
          await typeDocRef.update(typeUpdateData);
          console.log(`Updated ${collectionName} document with profile data`, typeUpdateData);
        } catch (typeUpdateError) {
          console.error(`Error updating ${userType} document: ${typeUpdateError instanceof Error ? typeUpdateError.message : 'Unknown error'}`);
          // Continue even if type-specific document update fails
        }
      }
    
      console.log('Profile data updated successfully');
    } catch (error) {
      console.error('Error updating profile data:', error);
      
      // Error handling with descriptive messages
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('permission-denied')) {
          console.error(`Permission denied error when updating profile. User ID: ${userId}`);
          throw new Error('You do not have permission to update this profile. Please contact support.');
        } else if (errorMessage.includes('not-found')) {
          console.error(`Document not found error when updating profile. User ID: ${userId}`);
          throw new Error('Profile data not found. Please try again later.');
        } else {
          throw new Error(`Failed to update profile data: ${errorMessage}`);
        }
      }
      
      throw new Error('An unexpected error occurred while updating your profile');
    }
  }
}