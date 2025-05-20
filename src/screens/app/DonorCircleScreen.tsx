import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DonorFeed from '../../features/community/components/DonorFeed';
import { useUserData } from '../../hooks/useUserData';

// Type definitions
type DonorTabParamList = {
  Feed: undefined;
  Impact: undefined;
};

type Badge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  dateEarned: string;
  unlocked: boolean;
};

type ImpactMetrics = {
  totalDonated: number;
  peopleHelped: number;
  recurringDonor: boolean;
  donationStreak: number;
  lastDonation: string;
  badges: Badge[];
};

const Tab = createMaterialTopTabNavigator<DonorTabParamList>();

// Mock impact data - would be replaced with API call
const mockImpactData: ImpactMetrics = {
  totalDonated: 85,
  peopleHelped: 12,
  recurringDonor: false,
  donationStreak: 1,
  lastDonation: '2025-05-15',
  badges: [
    {
      id: '1',
      name: 'First Donation',
      icon: 'heart',
      description: 'Made your first donation to support our mission',
      dateEarned: '2025-05-15',
      unlocked: true
    },
    {
      id: '2',
      name: 'Helping Hand',
      icon: 'hand-right',
      description: 'Assisted at least 5 people through your donations',
      dateEarned: '2025-05-15',
      unlocked: true
    },
    {
      id: '3',
      name: 'Regular Supporter',
      icon: 'calendar',
      description: 'Set up recurring monthly donations',
      dateEarned: '',
      unlocked: false
    },
    {
      id: '4',
      name: 'Community Champion',
      icon: 'trophy',
      description: 'Donated over $100 to support our mission',
      dateEarned: '',
      unlocked: false
    }
  ]
};

// Impact Dashboard Component
const ImpactDashboard = () => {
  const [impactData, setImpactData] = useState<ImpactMetrics>(mockImpactData);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.metricCardsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>${impactData.totalDonated}</Text>
          <Text style={styles.metricLabel}>Total Donated</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{impactData.peopleHelped}</Text>
          <Text style={styles.metricLabel}>People Helped</Text>
        </View>
      </View>

      <View style={styles.impactSummary}>
        <Ionicons name="heart" size={20} color="#000000" style={styles.summaryIcon} />
        <Text style={styles.summaryText}>
          Your donation on {new Date(impactData.lastDonation).toLocaleDateString()} 
          is making a real difference in people's lives.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Your Donation Badges</Text>
      <Text style={styles.sectionSubtitle}>Celebrate your impact milestones</Text>

      <View style={styles.badgesContainer}>
        {impactData.badges.map(badge => (
          <View key={badge.id} style={[
            styles.badgeItem,
            !badge.unlocked && styles.badgeLocked
          ]}>
            <View style={styles.badgeIconContainer}>
              <Ionicons 
                name={badge.icon as any} 
                size={32} 
                color={badge.unlocked ? "#000000" : "#AAAAAA"} 
              />
            </View>
            <Text style={[
              styles.badgeName,
              !badge.unlocked && styles.badgeNameLocked
            ]}>
              {badge.name}
            </Text>
            <Text style={styles.badgeDescription} numberOfLines={2}>
              {badge.description}
            </Text>
            {badge.unlocked && (
              <Text style={styles.badgeDate}>
                Earned on {new Date(badge.dateEarned).toLocaleDateString()}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.nextMilestone}>
        <Text style={styles.nextMilestoneTitle}>Your Next Milestone</Text>
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <Ionicons name="trophy" size={24} color="#000000" />
            <Text style={styles.milestoneValue}>$100 Donor Club</Text>
          </View>
          <Text style={styles.milestoneDescription}>
            Donate ${100 - impactData.totalDonated} more to reach this milestone and unlock the Community Champion badge.
          </Text>
          <TouchableOpacity style={styles.donateButton}>
            <Text style={styles.donateButtonText}>Make Another Donation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const DonorCircleScreen = () => {
  const insets = useSafeAreaInsets();
  const { userData, isLoading, error } = useUserData();
  const [isDonor, setIsDonor] = useState<boolean>(true); // For demo purposes, in production this would be fetched from the server

  // If user isn't a donor, show the non-donor screen
  if (!isDonor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.nonDonorContainer}>
          <Ionicons name="heart-outline" size={64} color="#000000" />
          <Text style={styles.nonDonorTitle}>Donor Circle</Text>
          <Text style={styles.nonDonorText}>
            Make a donation to join our Donor Circle and see the impact of your contributions.
            You'll gain access to impact stories and earn badges for your support.
          </Text>
          <TouchableOpacity 
            style={styles.nonDonorButton}
            onPress={() => {
              // Navigate to donation screen
              // This would be implemented in your navigation system
            }}
          >
            <Text style={styles.nonDonorButtonText}>Make a Donation</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Donor Circle</Text>
        <Text style={styles.headerSubtitle}>
          See how your donations are making a difference
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
          name="Feed" 
          component={DonorFeed}
          options={{
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="heart" size={20} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Impact" 
          component={ImpactDashboard}
          options={{
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="stats-chart" size={20} color={color} />
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
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
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
  metricCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666666',
  },
  impactSummary: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  badgeItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeLocked: {
    backgroundColor: '#F8F8F8',
    borderStyle: 'dashed',
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#999999',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDate: {
    fontSize: 10,
    color: '#8A8A8A',
  },
  nextMilestone: {
    marginBottom: 16,
  },
  nextMilestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  milestoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  donateButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nonDonorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  nonDonorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  nonDonorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  nonDonorButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nonDonorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DonorCircleScreen;
