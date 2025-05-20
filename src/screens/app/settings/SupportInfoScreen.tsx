import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../contexts/AuthContext';
import { colors } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * SupportInfoScreen - Displays information about supporting The Assist App
 * 
 * This screen follows App Store guidelines by providing information about
 * donation options without direct links for payment. Uses iOS-native design patterns.
 * Implements monochromatic black/white/grey color scheme for a professional appearance.
 */
export const SupportInfoScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.iosHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make a Donation</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top section - why donate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Our Mission</Text>
          <Text style={styles.sectionText}>
            Your donation helps us continue our mission of providing assistance 
            to those in need. As a donor, you'll gain access to premium features 
            and directly support our community initiatives.
          </Text>
        </View>

        {/* Simple donation section for MVP */}
        <View style={styles.donationCard}>
          <View style={styles.donationHeader}>
            <Text style={styles.donationTitle}>Support Our Mission</Text>
          </View>
          
          <View style={styles.donationContent}>
            <Text style={styles.donationText}>
              Your donation of any amount unlocks all premium features immediately. All donors receive the same complete set of benefits, regardless of contribution size.
            </Text>
            
            <View style={styles.amountsContainer}>
              <TouchableOpacity style={styles.amountOption}>
                <Text style={styles.amountValue}>$1</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.amountOption, styles.selectedAmount]}>
                <Text style={[styles.amountValue, styles.selectedAmountText]}>$5</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.amountOption}>
                <Text style={styles.amountValue}>$10</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.amountOption}>
                <Text style={styles.amountValue}>$25</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>All Donors Get:</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark" size={18} color="#000000" />
                  <Text style={styles.benefitText}>Full access to premium resources</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark" size={18} color="#000000" />
                  <Text style={styles.benefitText}>Detailed impact dashboard</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark" size={18} color="#000000" />
                  <Text style={styles.benefitText}>Community features</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark" size={18} color="#000000" />
                  <Text style={styles.benefitText}>Support our important mission</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.donateButton}>
              <Text style={styles.donateButtonText}>Make Donation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works section */}
        <View style={styles.section}>
          <Text style={styles.groupHeader}>How It Works</Text>
          <View style={styles.howItWorksCard}>
            <Text style={styles.howItWorksText}>
              Secure donations can be processed through our website at <Text style={styles.websiteText}>theassistapp.org/donate</Text>
            </Text>
            <Text style={styles.howItWorksText}>
              Use your account email ({user?.email}) during the donation process for immediate activation of premium features across all your devices.
            </Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.groupHeader}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>When are premium features activated?</Text>
            <Text style={styles.faqAnswer}>
              Premium features are activated immediately upon successful donation processing. You'll receive an email confirmation with your receipt and access details.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I manage my donation settings?</Text>
            <Text style={styles.faqAnswer}>
              You can view and manage your donation history, payment methods, and recurring donation settings in your account dashboard at theassistapp.org/account.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Are donations tax-deductible?</Text>
            <Text style={styles.faqAnswer}>
              Yes, all donations may be tax-deductible depending on your jurisdiction. A detailed receipt suitable for tax purposes will be sent to your email address upon donation completion.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How can I contact support?</Text>
            <Text style={styles.faqAnswer}>
              Our dedicated support team is available via email at support@theassistapp.org or through our in-app support chat. Premium donors receive priority response times.
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your support</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Core layout - iOS-native
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS system background color
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // iOS-style header
  iosHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 8,
    padding: 8,
  },
  headerRight: {
    width: 40, // for balance with left button
  },
  
  // Content sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 22,
  },
  groupHeader: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    marginTop: 8,
  },
  
  // Premium donation card
  donationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  donationHeader: {
    backgroundColor: '#F2F2F7',
    padding: 16,
  },
  donationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  donationContent: {
    padding: 16,
  },
  donationText: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 22,
    marginBottom: 20,
  },
  benefitsContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  benefitsList: {
    paddingLeft: 4,
  },
  
  // Amount selection
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  amountOption: {
    width: 70,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  selectedAmount: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  selectedAmountText: {
    color: '#FFFFFF',
  },
  
  // Benefits list
  tierBenefits: {
    padding: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#3A3A3C',
    marginLeft: 10,
  },
  donateButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // How it works section
  howItWorksCard: {
    backgroundColor: '#F9F9FB',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  howItWorksText: {
    fontSize: 15,
    color: '#3A3A3C',
    marginBottom: 12,
    lineHeight: 22,
  },
  websiteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  
  // FAQ section
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  }
});

export default SupportInfoScreen;
