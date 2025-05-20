import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Types for strict type safety
export type ImpactStory = {
  id: string;
  title: string;
  content: string;
  location: string;
  category: 'rent' | 'utilities' | 'medical' | 'food' | 'other';
  date: string;
  impressions?: number;
}

type DonorFeedProps = {
  userId?: string;
}

// Mock data - would be replaced with real API calls
const mockStories: ImpactStory[] = [
  { 
    id: '1', 
    title: "Helped Pay Rent for Family", 
    content: "Your donation helped a family of four cover their rent after the primary earner lost their job due to medical issues. They were able to stay in their home while searching for new employment.",
    location: "Chicago, IL", 
    category: "rent",
    date: "2025-05-15"
  },
  { 
    id: '2', 
    title: "Provided 100 Meals to Food Bank", 
    content: "Thanks to your support, we were able to provide 100 meals through a local food bank to families experiencing food insecurity. Many of these families include young children who now have access to nutritious meals.",
    location: "Dallas, TX", 
    category: "food",
    date: "2025-05-14"
  },
  { 
    id: '3', 
    title: "Supported Medical Bills for Child", 
    content: "Your generosity helped cover essential medical treatments for a 7-year-old child with a chronic condition. The family was struggling with mounting healthcare costs that their insurance didn't fully cover.",
    location: "Miami, FL", 
    category: "medical",
    date: "2025-05-13"
  },
  { 
    id: '4', 
    title: "Assisted with Utility Bills", 
    content: "During an unusually cold winter, your donation helped several elderly residents keep their heat on by covering their utility bills. This prevented potential health emergencies during the cold weather.",
    location: "Boston, MA", 
    category: "utilities",
    date: "2025-05-12"
  }
];

const DonorFeed = ({ userId }: DonorFeedProps) => {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchStories();
  }, []);

  // Simulating an API call - would be replaced with real API
  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      setStories(mockStories);
    } catch (err) {
      setError('Failed to load impact stories. Please try again later.');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStories();
  };

  const handleStoryPress = (story: ImpactStory) => {
    // In a real app, this would navigate to a detail screen
    console.log('Story pressed:', story.id);
  };

  const renderStoryCard = ({ item }: { item: ImpactStory }) => {
    const getCategoryIcon = (category: string) => {
      switch(category) {
        case 'rent':
          return 'home-outline';
        case 'utilities':
          return 'flash-outline';
        case 'medical':
          return 'medical-outline';
        case 'food':
          return 'fast-food-outline';
        default:
          return 'heart-outline';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleStoryPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons name={getCategoryIcon(item.category)} size={14} color="#FFFFFF" />
            <Text style={styles.categoryText}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
          <Text style={styles.location}>{item.location}</Text>
        </View>
        
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content} numberOfLines={4}>{item.content}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={18} color="#000000" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#000000" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStories}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading impact stories...</Text>
      </View>
    );
  }

  // Empty state
  if (stories.length === 0 && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text-outline" size={48} color="#000000" />
        <Text style={styles.emptyText}>No impact stories yet</Text>
        <Text style={styles.emptySubtext}>Check back soon to see how your donation is making a difference.</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchStories}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Content state
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderStoryCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#000000"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Making an Impact</Text>
            <Text style={styles.headerSubtitle}>
              See how your donations are helping communities
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 24,
  },
  content: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#8A8A8A',
  },
  shareButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#8A8A8A',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DonorFeed;
