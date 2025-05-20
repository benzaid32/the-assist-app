import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useSubscriberAccess } from '../hooks/useSubscriberAccess';
import { useAuth } from '../../../contexts/AuthContext';

// Types for premium resources
interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: ResourceCategory;
  thumbnail?: string;
  url?: string;
  createdAt: string;
  isPremium: boolean;
}

enum ResourceType {
  PDF = 'pdf',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARTICLE = 'article',
  GUIDE = 'guide'
}

enum ResourceCategory {
  FINANCIAL = 'financial',
  EDUCATION = 'education',
  WELLNESS = 'wellness',
  CAREER = 'career',
  COMMUNITY = 'community',
  OTHER = 'other'
}

/**
 * Premium Resource Library - Exclusive content for supporters
 * Provides access to guides, articles, videos and other educational resources
 */
export const ResourceLibrary: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { hasAccess, loading: accessLoading } = useSubscriberAccess();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch premium resources for subscribers
  const fetchResources = async (showRefresh: boolean = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // This would be a real API call in production
      // For MVP, we're using sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock premium resources
      const mockResources: Resource[] = [
        {
          id: 'resource1',
          title: 'Financial Planning for Emergencies',
          description: 'A comprehensive guide to preparing financially for unexpected situations.',
          type: ResourceType.PDF,
          category: ResourceCategory.FINANCIAL,
          thumbnail: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=300',
          url: 'https://example.com/resources/financial-planning.pdf',
          createdAt: '2025-04-15T10:30:00Z',
          isPremium: true
        },
        {
          id: 'resource2',
          title: 'Education Access Guide',
          description: 'How to navigate scholarships and educational opportunities.',
          type: ResourceType.GUIDE,
          category: ResourceCategory.EDUCATION,
          thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=300',
          url: 'https://example.com/resources/education-guide.pdf',
          createdAt: '2025-04-10T14:20:00Z',
          isPremium: true
        },
        {
          id: 'resource3',
          title: 'Mental Wellness During Crisis',
          description: 'Strategies for maintaining mental health during challenging times.',
          type: ResourceType.VIDEO,
          category: ResourceCategory.WELLNESS,
          thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=300',
          url: 'https://example.com/resources/mental-wellness-video',
          createdAt: '2025-04-05T09:15:00Z',
          isPremium: true
        },
        {
          id: 'resource4',
          title: 'Building Community Resilience',
          description: 'How communities can come together to support each other effectively.',
          type: ResourceType.ARTICLE,
          category: ResourceCategory.COMMUNITY,
          thumbnail: 'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&q=80&w=300',
          url: 'https://example.com/resources/community-resilience',
          createdAt: '2025-03-28T11:45:00Z',
          isPremium: true
        },
        {
          id: 'resource5',
          title: 'Job Skills for the Future',
          description: 'Essential career skills for an evolving job market.',
          type: ResourceType.PDF,
          category: ResourceCategory.CAREER,
          thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=300',
          url: 'https://example.com/resources/future-job-skills.pdf',
          createdAt: '2025-03-20T16:30:00Z',
          isPremium: true
        }
      ];
      
      setResources(mockResources);
      setFilteredResources(mockResources);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load resources';
      console.error('Error fetching premium resources:', errorMessage);
      setError('Unable to load resources. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchResources();
    }
  }, [hasAccess]);

  // Filter resources by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredResources(resources);
    } else {
      const filtered = resources.filter(resource => resource.category === selectedCategory);
      setFilteredResources(filtered);
    }
  }, [selectedCategory, resources]);

  // Handle refresh action
  const handleRefresh = () => {
    fetchResources(true);
  };

  // Handle resource selection
  const handleResourcePress = (resource: Resource) => {
    // This would open the resource in a viewer component in production
    console.log(`Opening resource: ${resource.title}`);
    // navigation.navigate('ResourceViewer', { resourceId: resource.id });
  };

  // Resource category labels
  const categoryLabels: Record<ResourceCategory | 'all', string> = {
    all: 'All',
    financial: 'Financial',
    education: 'Education',
    wellness: 'Wellness',
    career: 'Career',
    community: 'Community',
    other: 'Other'
  };

  // Resource type icons
  const getResourceTypeIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.PDF:
        return 'document-text';
      case ResourceType.VIDEO:
        return 'videocam';
      case ResourceType.AUDIO:
        return 'musical-notes';
      case ResourceType.ARTICLE:
        return 'newspaper';
      case ResourceType.GUIDE:
        return 'book';
      default:
        return 'document';
    }
  };

  // Render subscription upsell if not a subscriber
  if (!accessLoading && !hasAccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Premium Resources</Text>
          </View>
          
          <Card style={styles.upsellCard}>
            <View style={styles.upsellContent}>
              <Ionicons name="library-outline" size={64} color={colors.accent} style={styles.upsellIcon} />
              <Text style={styles.upsellTitle}>Exclusive Resource Library</Text>
              <Text style={styles.upsellText}>
                Become a supporter to access our premium resource library, including guides, 
                videos, and articles to help you navigate challenging situations.
              </Text>
              <Button 
                label="Learn About Supporting" 
                onPress={() => navigation.navigate('SupportInfo' as never)}
                style={styles.upsellButton}
              />
            </View>
          </Card>
          
          {/* Preview of locked resources */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Premium Resources (Locked)</Text>
          
          <FlatList
            data={[1, 2, 3]}
            scrollEnabled={false}
            keyExtractor={(item) => `locked-resource-${item}`}
            renderItem={() => (
              <Card style={styles.lockedResourceCard}>
                <View style={styles.resourceContent}>
                  <View style={styles.resourceThumbnailLocked}>
                    <Ionicons name="lock-closed" size={24} color={colors.white} />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.lockedResourceTitle}>Premium Resource</Text>
                    <Text style={styles.lockedResourceDescription}>
                      This content is available exclusively to supporters.
                    </Text>
                  </View>
                </View>
              </Card>
            )}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (accessLoading || loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading premium resources...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to Load Resources</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            label="Try Again" 
            onPress={() => fetchResources()} 
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
          <Text style={styles.title}>Premium Resources</Text>
          <Text style={styles.subtitle}>
            Exclusive content for our supporters
          </Text>
        </View>
        
        {/* Category filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {(['all', ...Object.values(ResourceCategory)] as (ResourceCategory | 'all')[]).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextSelected
              ]}>
                {categoryLabels[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Resources list */}
        <View style={styles.resourcesContainer}>
          {filteredResources.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No resources found in this category.
              </Text>
            </View>
          ) : (
            filteredResources.map(resource => (
              <TouchableOpacity
                key={resource.id}
                onPress={() => handleResourcePress(resource)}
              >
                <Card style={styles.resourceCard}>
                  <View style={styles.resourceContent}>
                    <View style={styles.resourceThumbnail}>
                      {resource.thumbnail ? (
                        <Image 
                          source={{ uri: resource.thumbnail }} 
                          style={styles.thumbnailImage} 
                        />
                      ) : (
                        <View style={styles.thumbnailPlaceholder}>
                          <Ionicons 
                            name={getResourceTypeIcon(resource.type)} 
                            size={24} 
                            color={colors.white} 
                          />
                        </View>
                      )}
                    </View>
                    <View style={styles.resourceInfo}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceDescription} numberOfLines={2}>
                        {resource.description}
                      </Text>
                      <View style={styles.resourceMeta}>
                        <View style={styles.resourceType}>
                          <Ionicons 
                            name={getResourceTypeIcon(resource.type)} 
                            size={14} 
                            color={colors.primaryText} 
                            style={styles.resourceTypeIcon} 
                          />
                          <Text style={styles.resourceTypeText}>
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    paddingBottom: 32,
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
  sectionTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.title3,
    color: colors.black,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.smallNote,
    color: colors.primaryText,
  },
  categoryButtonTextSelected: {
    color: colors.white,
  },
  resourcesContainer: {
    marginTop: 8,
  },
  resourceCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  resourceContent: {
    flexDirection: 'row',
  },
  resourceThumbnail: {
    width: 100,
    height: 100,
    backgroundColor: colors.border,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
    padding: 12,
  },
  resourceTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.fontSizes.body,
    color: colors.black,
    marginBottom: 4,
  },
  resourceDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.smallNote,
    color: colors.primaryText,
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resourceType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceTypeIcon: {
    marginRight: 4,
  },
  resourceTypeText: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.primaryText,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    textAlign: 'center',
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
  lockedResourceCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
    opacity: 0.7,
  },
  resourceThumbnailLocked: {
    width: 100,
    height: 100,
    backgroundColor: colors.secondaryText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedResourceTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  lockedResourceDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.smallNote,
    color: colors.secondaryText,
  },
});

export default ResourceLibrary;
