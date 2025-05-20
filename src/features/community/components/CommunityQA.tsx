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
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Type definitions
export type Question = {
  id: string;
  question: string;
  answer: string | null;
  askedBy: string;
  date: string;
  status: 'pending' | 'answered';
  isAnonymous: boolean;
};

type CommunityQAProps = {
  userId?: string;
};

// Mock data - would be replaced with actual API data
const mockQuestions: Question[] = [
  {
    id: '1',
    question: "How long does the verification process usually take?",
    answer: "The verification process typically takes 3-5 business days from the time all required documents are submitted. You'll receive status updates via email throughout the process.",
    askedBy: "anonymous",
    date: "2025-05-15",
    status: "answered",
    isAnonymous: true
  },
  {
    id: '2',
    question: "What documents do I need for utility bill assistance?",
    answer: "For utility bill assistance, you'll need to provide: 1) A copy of your current utility bill showing the past due amount, 2) Proof of identity (government-issued ID), 3) Proof of residency (lease agreement or mortgage statement), and 4) Documentation of financial hardship.",
    askedBy: "user123",
    date: "2025-05-14",
    status: "answered",
    isAnonymous: false
  },
  {
    id: '3',
    question: "If I was rejected, can I apply again?",
    answer: null,
    askedBy: "user456",
    date: "2025-05-13",
    status: "pending",
    isAnonymous: false
  },
  {
    id: '4',
    question: "Do you provide assistance for dental emergencies?",
    answer: null,
    askedBy: "anonymous",
    date: "2025-05-12",
    status: "pending",
    isAnonymous: true
  },
  {
    id: '5',
    question: "How often can I request assistance?",
    answer: "Eligible applicants can request assistance once every 90 days. This cooling-off period helps ensure we can distribute aid to as many people as possible. However, exceptions may be made for critical emergencies - please contact support directly in these cases.",
    askedBy: "user789",
    date: "2025-05-11",
    status: "answered",
    isAnonymous: false
  },
];

const CommunityQA = ({ userId }: CommunityQAProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'answered' | 'pending'>('all');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, activeFilter]);

  // Simulating an API call
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      setQuestions(mockQuestions);
    } catch (err) {
      setError('Failed to load questions. Please try again later.');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterQuestions = () => {
    let results = [...questions];
    
    // Filter by status if not 'all'
    if (activeFilter === 'answered') {
      results = results.filter(question => question.status === 'answered');
    } else if (activeFilter === 'pending') {
      results = results.filter(question => question.status === 'pending');
    }
    
    // Filter by search query if present
    if (searchQuery.trim() !== '') {
      const normalizedQuery = searchQuery.toLowerCase();
      results = results.filter(question => 
        question.question.toLowerCase().includes(normalizedQuery) ||
        (question.answer && question.answer.toLowerCase().includes(normalizedQuery))
      );
    }
    
    setFilteredQuestions(results);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQuestions();
  };

  const handleFilterPress = (filter: 'all' | 'answered' | 'pending') => {
    setActiveFilter(filter);
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim().length < 10) {
      // Show validation error
      return;
    }

    // In a real app, this would be an API call
    const newQuestionObj: Question = {
      id: `temp-${Date.now()}`, // A real API would generate a proper ID
      question: newQuestion,
      answer: null,
      askedBy: isAnonymous ? 'anonymous' : userId || 'user',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      isAnonymous: isAnonymous
    };

    setQuestions([newQuestionObj, ...questions]);
    setNewQuestion('');
    setIsAnonymous(false);
    setModalVisible(false);
  };

  const renderQuestionItem = ({ item }: { item: Question }) => (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.askedByContainer}>
          <Text style={styles.askedByText}>
            Asked by {item.isAnonymous ? 'Anonymous' : item.askedBy}
          </Text>
          <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'answered' ? styles.answeredBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'answered' ? 'Answered' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.questionText}>{item.question}</Text>
      
      {item.answer ? (
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Answer:</Text>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      ) : (
        <Text style={styles.pendingText}>
          This question is waiting for an answer from our team.
        </Text>
      )}
    </View>
  );

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#000000" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchQuestions}>
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
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  // Empty state
  if (filteredQuestions.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community Q&A</Text>
          <Text style={styles.headerSubtitle}>
            Questions and answers from our community
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#8A8A8A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
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

        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => handleFilterPress('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'answered' && styles.activeFilter]}
            onPress={() => handleFilterPress('answered')}
          >
            <Text style={[styles.filterText, activeFilter === 'answered' && styles.activeFilterText]}>
              Answered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'pending' && styles.activeFilter]}
            onPress={() => handleFilterPress('pending')}
          >
            <Text style={[styles.filterText, activeFilter === 'pending' && styles.activeFilterText]}>
              Pending
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color="#000000" />
          <Text style={styles.emptyText}>No questions found</Text>
          {searchQuery || activeFilter !== 'all' ? (
            <Text style={styles.emptySubtext}>Try adjusting your filters or search terms.</Text>
          ) : (
            <Text style={styles.emptySubtext}>Be the first to ask a question to our community support team.</Text>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={() => {
            if (searchQuery || activeFilter !== 'all') {
              setSearchQuery('');
              setActiveFilter('all');
            } else {
              setModalVisible(true);
            }
          }}>
            <Text style={styles.actionButtonText}>
              {searchQuery || activeFilter !== 'all' ? 'Reset Filters' : 'Ask a Question'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Content state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Q&A</Text>
        <Text style={styles.headerSubtitle}>
          Questions and answers from our community
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#8A8A8A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
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

      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
          onPress={() => handleFilterPress('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'answered' && styles.activeFilter]}
          onPress={() => handleFilterPress('answered')}
        >
          <Text style={[styles.filterText, activeFilter === 'answered' && styles.activeFilterText]}>
            Answered
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'pending' && styles.activeFilter]}
          onPress={() => handleFilterPress('pending')}
        >
          <Text style={[styles.filterText, activeFilter === 'pending' && styles.activeFilterText]}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredQuestions}
        keyExtractor={item => item.id}
        renderItem={renderQuestionItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.questionsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#000000"
          />
        }
      />

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal for asking a new question */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ask a Question</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Our support team will answer your question as soon as possible
            </Text>

            <TextInput
              style={styles.questionInput}
              placeholder="Type your question here..."
              placeholderTextColor="#8A8A8A"
              multiline
              value={newQuestion}
              onChangeText={setNewQuestion}
            />

            <TouchableOpacity 
              style={styles.anonymousOption}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={[
                styles.checkbox,
                isAnonymous && styles.checkedBox
              ]}>
                {isAnonymous && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.anonymousText}>Ask anonymously</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              All questions and answers are public and visible to other community members.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  newQuestion.trim().length < 10 && styles.disabledButton
                ]}
                onPress={handleSubmitQuestion}
                disabled={newQuestion.trim().length < 10}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#000000',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  questionsList: {
    paddingBottom: 80,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  askedByContainer: {
    flex: 1,
  },
  askedByText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  dateText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  answeredBadge: {
    backgroundColor: '#000000',
  },
  pendingBadge: {
    backgroundColor: '#DADADA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 22,
  },
  answerContainer: {
    backgroundColor: '#F2F2F2',
    padding: 12,
    borderRadius: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  pendingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666666',
    textAlign: 'center',
    marginVertical: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  questionInput: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 16,
    color: '#000000',
  },
  anonymousOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#000000',
  },
  anonymousText: {
    fontSize: 14,
    color: '#000000',
  },
  disclaimer: {
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
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
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityQA;
