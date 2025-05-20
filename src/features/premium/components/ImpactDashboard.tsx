import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';

// Types for impact metrics with expanded detail for donor impact visualization
interface ImpactMetrics {
  peopleHelped: number;
  totalContribution: number;
  donationCount: number;
  impactProjects: ImpactProject[];
  impactBreakdown: ImpactBreakdown[];
  lastUpdated: string;
}

interface ImpactProject {
  id: string;
  name: string;
  description: string;
  impactCount: number;
  imageUrl?: string;
}

interface ImpactBreakdown {
  category: string;
  percentage: number;
  amount: number;
  color: string;
}

/**
 * Impact Dashboard - iOS-native premium feature for donors
 * Shows personalized impact metrics and details about how donations are making a difference
 * Follows strict enterprise-grade architecture with proper error handling
 */
export const ImpactDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [impactData, setImpactData] = useState<ImpactMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(true); // Default to true for MVP

  // Fetch impact data for donor in iOS-native MVP implementation
  const fetchImpactData = async (showRefresh: boolean = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      if (!user?.userId) {
        throw new Error('User ID not found');
      }
      
      // Simulate network request with proper error handling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate realistic sample data for iOS-style visualization
      const mockImpactData: ImpactMetrics = {
        peopleHelped: Math.floor(Math.random() * 10) + 5,
        totalContribution: Math.floor(Math.random() * 200) + 100,
        donationCount: Math.floor(Math.random() * 5) + 1,
        impactProjects: [
          {
            id: 'proj1',
            name: 'Emergency Relief',
            description: 'Providing essential supplies to families in crisis',
            impactCount: Math.floor(Math.random() * 5) + 2,
            imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=500'
          },
          {
            id: 'proj2',
            name: 'Education Fund',
            description: 'Supporting education access for underprivileged students',
            impactCount: Math.floor(Math.random() * 3) + 1,
            imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=500'
          }
        ],
        // iOS-style breakdown for visual charts
        impactBreakdown: [
          {
            category: 'Housing',
            percentage: 40,
            amount: 40,
            color: '#34C759' // iOS green
          },
          {
            category: 'Education',
            percentage: 30,
            amount: 30,
            color: '#000000' // iOS blue
          },
          {
            category: 'Healthcare',
            percentage: 20,
            amount: 20,
            color: '#5856D6' // iOS purple
          },
          {
            category: 'Food',
            percentage: 10,
            amount: 10,
            color: '#FF9500' // iOS orange
          }
        ],
        lastUpdated: new Date().toISOString()
      };
      
      setImpactData(mockImpactData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load impact data';
      console.error('Error fetching impact data:', errorMessage);
      setError('Unable to load your impact details. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount - using enterprise patterns for clean lifecycle management
  useEffect(() => {
    fetchImpactData();
    
    // Clean up logic if needed
    return () => {
      // Any cleanup
    };
  }, [user?.userId]);

  // Handle pull-to-refresh with iOS-native bouncing effect
  const handleRefresh = () => {
    fetchImpactData(true);
  };
  
  // iOS-style Upsell UI for non-donors (donation prompting)
  const renderUpsellView = () => {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Impact Dashboard</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.upsellCard}>
            <View style={styles.upsellContent}>
              <Ionicons name="heart-circle-outline" size={64} color="#FF2D55" style={styles.upsellIcon} />
              <Text style={styles.upsellTitle}>See Your Impact</Text>
              <Text style={styles.upsellText}>
                Make a donation today to unlock your personal Impact Dashboard and 
                see exactly how your support helps people in need.
              </Text>
              <TouchableOpacity 
                style={styles.upsellButton}
                onPress={() => navigation.navigate('SupportInfo' as never)}
              >
                <Text style={styles.upsellButtonText}>Donate Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  // iOS-style loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading your impact data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // iOS-style error handling UI
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Unable to Load Data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchImpactData()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // If user hasn't donated yet, show upsell
  if (!hasAccess) {
    return renderUpsellView();
  }

  // iOS-style main dashboard view with iOS-specific design patterns
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      
      {/* iOS-style header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Impact</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#000000" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            tintColor="#000000" // iOS blue
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Donation Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Thank You For Your Support</Text>
          <Text style={styles.summarySubtitle}>
            Your donations are making a real difference
          </Text>
        </View>
        
        {/* iOS-style Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{impactData?.peopleHelped || 0}</Text>
            <Text style={styles.statLabel}>People Helped</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${impactData?.totalContribution || 0}</Text>
            <Text style={styles.statLabel}>Total Impact</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{impactData?.donationCount || 0}</Text>
            <Text style={styles.statLabel}>Donations Made</Text>
          </View>
        </View>
        
        {/* Donation Breakdown - iOS Chart Style */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Impact Breakdown</Text>
          <View style={styles.breakdownChart}>
            {impactData?.impactBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[styles.breakdownFill, { 
                      width: `${item.percentage}%`, 
                      backgroundColor: item.color 
                    }]} 
                  />
                </View>
                <View style={styles.breakdownDetails}>
                  <Text style={styles.breakdownCategory}>{item.category}</Text>
                  <Text style={styles.breakdownAmount}>${item.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Impact Projects - iOS Card Style */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Projects You've Supported</Text>
          
          {impactData?.impactProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              {project.imageUrl && (
                <Image 
                  source={{ uri: project.imageUrl }} 
                  style={styles.projectImage} 
                  resizeMode="cover"
                />
              )}
              <View style={styles.projectContent}>
                <Text style={styles.projectTitle}>{project.name}</Text>
                <Text style={styles.projectDescription}>{project.description}</Text>
                <View style={styles.projectStats}>
                  <View style={styles.projectStat}>
                    <Text style={styles.projectStatValue}>{project.impactCount}</Text>
                    <Text style={styles.projectStatLabel}>People Helped</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.projectButton}>
                  <Text style={styles.projectButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        
        {/* Donate Again Button - iOS Style Call to Action */}
        <TouchableOpacity 
          style={styles.donateAgainButton}
          onPress={() => navigation.navigate('SupportInfo' as never)}
        >
          <Text style={styles.donateAgainText}>Make Another Donation</Text>
        </TouchableOpacity>
        
        {/* iOS-style Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: {new Date(impactData?.lastUpdated || Date.now()).toLocaleDateString()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Core layout - iOS styles
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS system background color
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  
  // iOS Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 44,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerButton: {
    position: 'absolute',
    left: 8,
    padding: 8,
  },
  
  // Summary section
  summaryContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  summarySubtitle: {
    fontSize: 16,
    color: '#8E8E93', // iOS secondary text
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Stat cards - iOS grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10, // iOS-style corner radius
    padding: 16,
    margin: 6,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93', // iOS secondary text
    textAlign: 'center',
  },
  
  // Section container
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  
  // iOS-style breakdown chart
  breakdownChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownCategory: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  breakdownAmount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  
  // iOS-style project cards
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  projectImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F2F2F7',
  },
  projectContent: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  projectStat: {
    alignItems: 'center',
    marginRight: 24,
  },
  projectStatValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  projectStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  projectButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  projectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000', // iOS blue
  },
  
  // Call to action button - iOS style
  donateAgainButton: {
    backgroundColor: '#000000', // iOS blue
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  donateAgainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // iOS footer
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  // Loading state - iOS style
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
    fontWeight: '400',
  },
  
  // Error state - iOS style
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F2F2F7',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginVertical: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Upsell view - iOS style
  upsellCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  upsellContent: {
    alignItems: 'center',
  },
  upsellIcon: {
    marginBottom: 16,
  },
  upsellTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  upsellText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  upsellButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  upsellButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ImpactDashboard;
