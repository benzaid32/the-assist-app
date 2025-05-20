import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ResourceHub from '../../features/community/components/ResourceHub';
import CommunityQA from '../../features/community/components/CommunityQA';
import { useUserData } from '../../hooks/useUserData'; // Assuming this hook exists

// Define TypeScript types for strong type safety
type SupportNetworkTabParamList = {
  Resources: undefined;
  QA: undefined;
};

const Tab = createMaterialTopTabNavigator<SupportNetworkTabParamList>();

const SupportNetworkScreen = () => {
  const insets = useSafeAreaInsets();
  const { userData, loading, error } = useUserData(); // Customize based on your auth system
  const [isVerified, setIsVerified] = useState<boolean>(true); // For demo purposes, in production this would be fetched from the server

  // If user isn't verified, show the verification required screen
  if (!isVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.verificationContainer}>
          <Ionicons name="shield-outline" size={64} color="#000000" />
          <Text style={styles.verificationTitle}>Verification Required</Text>
          <Text style={styles.verificationText}>
            Access to the Support Network requires verification of your applicant status.
            Submit your documents to gain access to resources and community support.
          </Text>
          <TouchableOpacity 
            style={styles.verificationButton}
            onPress={() => {
              // Navigate to document upload or verification screen
              // This would be implemented in your navigation system
            }}
          >
            <Text style={styles.verificationButtonText}>Submit Verification</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Network</Text>
        <Text style={styles.headerSubtitle}>
          Resources and support for verified applicants
        </Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#666666',
          tabBarIndicatorStyle: {
            backgroundColor: '#000000',
            height: 2,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '500',
            textTransform: 'none',
          },
          tabBarStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#F0F0F0',
          },
        }}
      >
        <Tab.Screen 
          name="Resources" 
          component={ResourceHub}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="document-text-outline" size={20} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="QA" 
          component={CommunityQA}
          options={{
            title: 'Q&A',
            tabBarIcon: ({ color }) => (
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  verificationButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  verificationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SupportNetworkScreen;
