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
  FlatList,
  StatusBar
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

  // Render donation upsell if not a donor
  if (!accessLoading && !hasAccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.iosHeader}>
          <Text style={styles.iosHeaderTitle}>Resource Library</Text>
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.upsellCard}>
            <View style={styles.upsellContent}>
              <Ionicons name="library-outline" size={48} color="#000000" style={styles.upsellIcon} />
              <Text style={styles.upsellTitle}>Donor Exclusive Resources</Text>
              <Text style={styles.upsellText}>
                Make a donation to unlock our premium resource library, including guides, 
                videos, and articles to help you navigate challenging situations.
              </Text>
              <TouchableOpacity 
                style={styles.upsellButton}
                onPress={() => navigation.navigate('SupportInfo' as never)}
              >
                <Text style={styles.upsellButtonText}>Learn About Donating</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Preview of locked resources - iOS style */}
          <Text style={styles.sectionTitle}>Resources Available to Donors</Text>
          
          <FlatList
            data={[1, 2, 3]}
            scrollEnabled={false}
            keyExtractor={(item) => `locked-resource-${item}`}
            renderItem={({item}) => (
              <View style={styles.resourceCard}>
                <View style={styles.resourceContent}>
                  <View style={styles.resourceThumbnailLocked}>
                    <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle}>Premium Resource</Text>
                    <Text style={styles.resourceDescription}>
                      This content is available exclusively to donors.
                    </Text>
                    <View style={styles.resourceType}>
                      <Ionicons name="gift-outline" size={12} color="#8E8E93" style={{marginRight: 4}} />
                      <Text style={styles.resourceTypeText}>Donor Exclusive</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Your donation powers our mission</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (accessLoading || loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.iosHeader}>
          <Text style={styles.iosHeaderTitle}>Resource Library</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading resources...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.iosHeader}>
          <Text style={styles.iosHeaderTitle}>Resource Library</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Unable to Load Resources</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchResources()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.iosHeader}>
        <Text style={styles.iosHeaderTitle}>Resource Library</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            tintColor="#000000"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Donor Resources</Text>
          <Text style={styles.headerSubtitle}>
            Exclusive content made possible by your donation
          </Text>
        </View>
        
        {/* Category filters - iOS style */}
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
        
        {/* Resources list - iOS style */}
        <View style={styles.resourcesContainer}>
          {filteredResources.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={32} color="#8E8E93" />
              <Text style={styles.emptyStateText}>
                No resources found in this category
              </Text>
            </View>
          ) : (
            filteredResources.map(resource => (
              <TouchableOpacity
                key={resource.id}
                style={styles.resourceCard}
                onPress={() => handleResourcePress(resource)}
                activeOpacity={0.7}
              >
                <View style={styles.resourceContent}>
                  <View style={styles.resourceThumbnail}>
                    {resource.thumbnail ? (
                      <Image 
                        source={{ uri: resource.thumbnail }} 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <Ionicons 
                          name={getResourceTypeIcon(resource.type)} 
                          size={24} 
                          color="#FFFFFF"
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
                          color="#8E8E93" 
                          style={styles.resourceTypeIcon} 
                        />
                        <Text style={styles.resourceTypeText}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your support</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS default background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // iOS header styles
  iosHeader: {
    height: 44,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerSection: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000000', // Changed from '#8E8E93'
    lineHeight: 22,
  },
  
  // Section styles
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    marginTop: 16,
  },
  
  // Category filters - iOS style
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA', // iOS light gray
  },
  categoryButtonSelected: {
    backgroundColor: '#000000', // iOS blue
    borderColor: '#000000',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  projectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  
  // Resource list styles - iOS
  resourcesContainer: {
    marginTop: 8,
  },
  resourceCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
  },
  resourceContent: {
    flexDirection: 'row',
  },
  resourceThumbnail: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E5EA',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
    padding: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 18,
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
    fontSize: 12,
    color: '#8E8E93',
  },
  
  // Empty state - iOS style
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
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
    marginTop: 16,
    marginBottom: 8,
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
  
  // Upsell card - iOS style
  upsellCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginVertical: 16,
    padding: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  upsellContent: {
    padding: 24,
    alignItems: 'center',
  },
  upsellIcon: {
    marginBottom: 16,
  },
  upsellTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
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
  
  // Locked resource styles
  resourceThumbnailLocked: {
    width: 80,
    height: 80,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Footer
  footer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ResourceLibrary;
