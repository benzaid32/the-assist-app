import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { colors, typography } from '../../../constants/theme';
import { UserType } from '../../../types/auth';
import ApplicantSettings from './ApplicantSettings';
import SubscriberSettings from './SubscriberSettings';

/**
 * SettingsScreen component that conditionally renders either ApplicantSettings or SubscriberSettings
 * based on the user's type (applicant or subscriber)
 */
const SettingsScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'applicant' | 'subscriber' | null>(null);

  useEffect(() => {
    // Determine user type from Firestore
    const fetchUserType = async () => {
      try {
        setLoading(true);
        
        // In a production app, this would fetch the user type from Firestore
        // For now, we'll simulate an API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For testing purposes, we can toggle between 'applicant' and 'subscriber'
        // This would be replaced with actual Firestore data in production
        setUserType(user.userType === UserType.APPLICANT ? 'applicant' : 'subscriber');
      } catch (err) {
        console.error('Error fetching user type:', err);
        // Default to applicant if there's an error
        setUserType('applicant');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchUserType();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.black} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in to view your settings.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {userType === 'applicant' ? (
        <ApplicantSettings user={user} />
      ) : userType === 'subscriber' ? (
        <SubscriberSettings user={user} />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to determine user type. Please try again later.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: typography.fonts.regular,
    color: colors.secondaryText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    fontFamily: typography.fonts.medium,
    color: colors.black,
    textAlign: 'center',
  },
})

export default SettingsScreen;
