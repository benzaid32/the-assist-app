import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useSubscriberAccess } from '../hooks/useSubscriberAccess';
import { useAuth } from '../../../contexts/AuthContext';

// Types for impact metrics
interface ImpactMetrics {
  peopleHelped: number;
  totalContribution: number;
  impactProjects: ImpactProject[];
  lastUpdated: string;
}

interface ImpactProject {
  id: string;
  name: string;
  description: string;
  impactCount: number;
  imageUrl?: string;
}

/**
 * Impact Dashboard - A premium feature for subscribers
 * Shows personalized impact metrics and details about how their contribution is making a difference
 */
export const ImpactDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { hasAccess, loading: accessLoading } = useSubscriberAccess();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [impactData, setImpactData] = useState<ImpactMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch impact data for current subscriber
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
      
      // Fetch user impact data from Firestore
      // In a real implementation, this would be fetching actual impact data
      // For MVP, we'll generate realistic sample data
      
      // Simulated API call - replace with real implementation when available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockImpactData: ImpactMetrics = {
        peopleHelped: Math.floor(Math.random() * 10) + 5,
        totalContribution: Math.floor(Math.random() * 200) + 100,
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

  useEffect(() => {
    if (hasAccess) {
      fetchImpactData();
    }
  }, [hasAccess, user?.userId]);

  // Handle refresh action
  const handleRefresh = () => {
    fetchImpactData(true);
  };

  // Render subscription upsell if not a subscriber
  if (!accessLoading && !hasAccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Impact Dashboard</Text>
          </View>
          
          <Card style={styles.upsellCard}>
            <View style={styles.upsellContent}>
              <Ionicons name="heart-circle-outline" size={64} color={colors.accent} style={styles.upsellIcon} />
              <Text style={styles.upsellTitle}>Become a True Supporter</Text>
              <Text style={styles.upsellText}>
                As a supporter, you'll get exclusive access to your personal Impact Dashboard,
                showing exactly how your contribution is making a difference.
              </Text>
              <Button 
                label="Learn About Supporting" 
                onPress={() => navigation.navigate('SupportInfo' as never)}
                style={styles.upsellButton}
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (accessLoading || loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading your impact data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to Load Data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            label="Try Again" 
            onPress={() => fetchImpactData()} 
            style={styles.errorButton} 
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Impact Dashboard</Text>
          <Text style={styles.subtitle}>
            See how your support is making a difference
          </Text>
        </View>
        
        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{impactData?.peopleHelped || 0}</Text>
            <Text style={styles.statLabel}>People Helped</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>${impactData?.totalContribution || 0}</Text>
            <Text style={styles.statLabel}>Total Impact</Text>
          </Card>
        </View>
        
        {/* Impact Projects */}
        <Text style={styles.sectionTitle}>Your Impact Projects</Text>
        
        {impactData?.impactProjects.map((project) => (
          <Card key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectTitle}>{project.name}</Text>
                <Text style={styles.projectCount}>
                  People helped: <Text style={styles.projectCountValue}>{project.impactCount}</Text>
                </Text>
              </View>
            </View>
            <Text style={styles.projectDescription}>{project.description}</Text>
            <Button 
              label="View Details" 
              variant="outline"
              onPress={() => navigation.navigate('ImpactDetails' as never)}
              style={styles.projectButton}
            />
          </Card>
        ))}
        
        <Text style={styles.updateText}>
          Last updated: {new Date(impactData?.lastUpdated || Date.now()).toLocaleDateString()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.sectionHeading,
    color: colors.black,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: 32,
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.smallNote,
    color: colors.primaryText,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.title3,
    color: colors.black,
    marginBottom: 12,
  },
  projectCard: {
    marginBottom: 16,
    padding: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.body,
    color: colors.black,
    marginBottom: 4,
  },
  projectCount: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.smallNote,
    color: colors.primaryText,
  },
  projectCountValue: {
    fontFamily: typography.fonts.semibold,
    color: colors.accent,
  },
  projectDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 12,
  },
  projectButton: {
    alignSelf: 'flex-start',
  },
  updateText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.smallNote,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title3,
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 120,
  },
  upsellCard: {
    marginVertical: 16,
  },
  upsellContent: {
    padding: 24,
    alignItems: 'center',
  },
  upsellIcon: {
    marginBottom: 16,
  },
  upsellTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.title3,
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  upsellText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  upsellButton: {
    minWidth: 220,
  },
});

export default ImpactDashboard;
