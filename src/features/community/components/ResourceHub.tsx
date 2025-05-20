import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Type definitions for strong type safety
export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'article';
  category: 'housing' | 'utilities' | 'medical' | 'food' | 'general';
  url: string;
  date: string;
  downloads: number;
};

type ResourceHubProps = {
  userId?: string;
};

// Mock data - would be replaced with actual API calls
const mockResources: ResourceItem[] = [
  { 
    id: '1', 
    title: "How Verification Works", 
    description: "A step-by-step guide to the verification process for assistance applicants.",
    type: "video", 
    category: "general",
    url: "https://example.com/verification-video",
    date: "2025-05-15",
    downloads: 78,
  },
  { 
    id: '2', 
    title: "Housing Assistance Guide", 
    description: "Comprehensive information on applying for and receiving housing assistance.",
    type: "pdf", 
    category: "housing",
    url: "https://example.com/housing-guide.pdf",
    date: "2025-05-14",
    downloads: 124,
  },
  { 
    id: '3', 
    title: "Utility Bill Support FAQ", 
    description: "Frequently asked questions about utility bill assistance programs.",
    type: "article", 
    category: "utilities",
    url: "https://example.com/utility-faq",
    date: "2025-05-13",
    downloads: 96,
  },
  { 
    id: '4', 
    title: "Medical Expense Application", 
    description: "Guide to applying for medical expense assistance and required documentation.",
    type: "pdf", 
    category: "medical",
    url: "https://example.com/medical-guide.pdf",
    date: "2025-05-12",
    downloads: 113,
  },
  { 
    id: '5', 
    title: "Food Assistance Programs", 
    description: "Overview of available food assistance programs and eligibility requirements.",
    type: "article", 
    category: "food",
    url: "https://example.com/food-assistance",
    date: "2025-05-11",
    downloads: 82,
  },
];

// Available categories for filtering
const categories = [
  { id: 'all', label: 'All' },
  { id: 'housing', label: 'Housing' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'medical', label: 'Medical' },
  { id: 'food', label: 'Food' },
  { id: 'general', label: 'General' },
];

const ResourceHub = ({ userId }: ResourceHubProps) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, selectedCategory]);

  // Simulating an API call - would be replaced with real API
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      setResources(mockResources);
    } catch (err) {
      setError('Failed to load resources. Please try again later.');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterResources = () => {
    let results = [...resources];
    
    // Filter by category if not 'all'
    if (selectedCategory !== 'all') {
      results = results.filter(resource => resource.category === selectedCategory);
    }
    
    // Filter by search query if present
    if (searchQuery.trim() !== '') {
      const normalizedQuery = searchQuery.toLowerCase();
      results = results.filter(
        resource => 
          resource.title.toLowerCase().includes(normalizedQuery) ||
          resource.description.toLowerCase().includes(normalizedQuery)
      );
    }
    
    setFilteredResources(results);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchResources();
  };

  const handleResourcePress = (resource: ResourceItem) => {
    // In a production app, this would open the resource or download it
    console.log('Resource pressed:', resource.id);
    // Track download/view in analytics
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const renderCategoryItem = ({ item }: { item: { id: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.categoryTabSelected
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === item.id && styles.categoryTabTextSelected
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderResourceItem = ({ item }: { item: ResourceItem }) => {
    const getTypeIcon = (type: string) => {
      switch(type) {
        case 'video':
          return 'videocam-outline';
        case 'pdf':
          return 'document-text-outline';
        case 'article':
          return 'newspaper-outline';
        default:
          return 'document-outline';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.resourceCard} 
        onPress={() => handleResourcePress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.resourceIconContainer}>
          <Ionicons name={getTypeIcon(item.type)} size={28} color="#000000" />
        </View>
        <View style={styles.resourceContent}>
          <Text style={styles.resourceTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.resourceDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.resourceMeta}>
            <View style={styles.resourceTypeBadge}>
              <Text style={styles.resourceTypeBadgeText}>{item.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.resourceStats}>{item.downloads} downloads</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download-outline" size={22} color="#000000" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#000000" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchResources}>
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
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  // Empty state
  if (filteredResources.length === 0 && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="folder-open-outline" size={48} color="#000000" />
        <Text style={styles.emptyText}>No resources found</Text>
        {searchQuery || selectedCategory !== 'all' ? (
          <Text style={styles.emptySubtext}>Try adjusting your filters or search terms.</Text>
        ) : (
          <Text style={styles.emptySubtext}>Resources will be added soon. Check back later.</Text>
        )}
        <TouchableOpacity style={styles.refreshButton} onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          fetchResources();
        }}>
          <Text style={styles.refreshButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Content state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resource Hub</Text>
        <Text style={styles.headerSubtitle}>
          Educational materials and guides
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#8A8A8A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          placeholderTextColor="#8A8A8A"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#8A8A8A" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContainer}
      />

      <FlatList
        data={filteredResources}
        keyExtractor={item => item.id}
        renderItem={renderResourceItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resourcesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#000000"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000000',
  },
  categoriesList: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    marginRight: 8,
  },
  categoryTabSelected: {
    backgroundColor: '#000000',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  categoryTabTextSelected: {
    color: '#FFFFFF',
  },
  resourcesList: {
    paddingBottom: 80,
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  resourceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceTypeBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  resourceTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  resourceStats: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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

export default ResourceHub;
