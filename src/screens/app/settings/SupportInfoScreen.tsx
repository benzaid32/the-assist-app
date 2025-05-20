import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../contexts/AuthContext';
import { colors, typography } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

/**
 * SupportInfoScreen - Displays information about supporting The Assist App
 * 
 * This screen follows App Store guidelines by providing information about
 * subscription options without direct links for payment.
 */
export const SupportInfoScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Button
            variant="ghost"
            onPress={() => navigation.goBack()}
            leftIcon={<Ionicons name="arrow-back" size={24} color={colors.black} />}
            style={styles.backButton}
          />
          <Text style={styles.title}>Support The Assist App</Text>
        </View>

        <View style={styles.content}>
          {/* Main explanation section */}
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Why Support Us?</Text>
              <Text style={styles.cardText}>
                Your support helps us continue our mission of providing assistance 
                to those in need. By becoming a supporter, you'll gain access to
                premium features and help sustain our community initiatives.
              </Text>
            </View>
          </Card>

          {/* Subscription tiers information */}
          <Text style={styles.sectionTitle}>Subscription Options</Text>
          
          <Card style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierTitle}>Monthly Supporter</Text>
              <Text style={styles.tierPrice}>$9.99/month</Text>
            </View>
            <View style={styles.tierFeatures}>
              <FeatureItem text="Full access to exclusive content" />
              <FeatureItem text="Priority support" />
              <FeatureItem text="Monthly newsletter" />
              <FeatureItem text="Community access" />
            </View>
          </Card>
          
          <Card style={[styles.tierCard, styles.popularTier]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
            <View style={styles.tierHeader}>
              <Text style={styles.tierTitle}>Annual Supporter</Text>
              <Text style={styles.tierPrice}>$99.99/year</Text>
            </View>
            <View style={styles.tierFeatures}>
              <FeatureItem text="Everything in Monthly tier" />
              <FeatureItem text="2 months free" />
              <FeatureItem text="Early access to new features" />
              <FeatureItem text="Exclusive virtual events" />
            </View>
          </Card>
          
          <Card style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierTitle}>Lifetime Supporter</Text>
              <Text style={styles.tierPrice}>$299.99 one-time</Text>
            </View>
            <View style={styles.tierFeatures}>
              <FeatureItem text="Everything in Annual tier" />
              <FeatureItem text="Lifetime access" />
              <FeatureItem text="Special recognition" />
              <FeatureItem text="Custom support channel" />
            </View>
          </Card>

          {/* Info on how to subscribe - App Store compliant approach */}
          <Card style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How to Subscribe</Text>
              <Text style={styles.infoText}>
                To support The Assist App and unlock premium features, please visit our website:
              </Text>
              <Text style={styles.websiteText}>
                theassistapp.org/subscribe
              </Text>
              <Text style={styles.infoText}>
                After completing your subscription on our website with your account email
                ({user?.email}), you'll immediately gain access to all supporter benefits
                in the app.
              </Text>
            </View>
          </Card>

          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <Card style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How soon will my subscription activate?</Text>
            <Text style={styles.faqAnswer}>
              Your benefits will be available immediately after completing your subscription on our website.
            </Text>
          </Card>
          
          <Card style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Can I cancel my subscription?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can manage or cancel your subscription anytime from our website.
            </Text>
          </Card>
          
          <Card style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Need help?</Text>
            <Text style={styles.faqAnswer}>
              If you have any questions, please contact our support team at support@theassistapp.org.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper component for feature list items
const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.checkIcon} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.fontSizes.heading,
    color: colors.black,
    flex: 1,
  },
  content: {
    marginBottom: 32,
  },
  card: {
    marginBottom: 24,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.fontSizes.subheading,
    color: colors.black,
    marginBottom: 8,
  },
  cardText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    lineHeight: 22,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.fontSizes.subheading,
    color: colors.black,
    marginTop: 16,
    marginBottom: 16,
  },
  tierCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  popularTier: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    zIndex: 1,
  },
  popularText: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.white,
  },
  tierHeader: {
    padding: 16,
    backgroundColor: colors.lightGray,
  },
  tierTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.fontSizes.subheading,
    color: colors.black,
    marginBottom: 4,
  },
  tierPrice: {
    fontFamily: typography.fonts.bold,
    fontSize: 22,
    color: colors.primary,
  },
  tierFeatures: {
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    flex: 1,
  },
  infoCard: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: colors.lightPrimary,
  },
  infoContent: {
    padding: 16,
  },
  infoTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.fontSizes.subheading,
    color: colors.black,
    marginBottom: 12,
  },
  infoText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    marginBottom: 12,
    lineHeight: 22,
  },
  websiteText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
  faqCard: {
    marginBottom: 12,
    padding: 16,
  },
  faqQuestion: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.fontSizes.body,
    color: colors.black,
    marginBottom: 8,
  },
  faqAnswer: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
    lineHeight: 22,
  },
});

export default SupportInfoScreen;
