import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../../../constants/theme';

// Define types for navigation
type AppStackParamList = {
  MainTabs: undefined;
  AppTabs: undefined;
  DocumentUpload: undefined;
  ApplicationDetails: undefined;
  SubscriptionManagement: undefined;
  ImpactDetails: undefined;
  Profile: undefined;
  SupportInfo: undefined;
  PremiumImpact: undefined;
  PremiumResources: undefined;
};

interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  screenName: keyof AppStackParamList;
}

/**
 * PremiumFeaturesCard component that displays premium features available to subscribers
 * Provides quick navigation to premium features from the settings screen
 */
const PremiumFeaturesCard = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  // Define premium features with their details
  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'impact',
      title: 'Impact Dashboard',
      description: 'See how your support is making a difference',
      icon: 'heart-circle-outline',
      screenName: 'PremiumImpact'
    },
    {
      id: 'resources',
      title: 'Premium Resources',
      description: 'Access exclusive content and educational materials',
      icon: 'library-outline',
      screenName: 'PremiumResources'
    }
  ];

  // Navigate to the specified premium feature screen
  const handleNavigate = (screenName: keyof AppStackParamList) => {
    try {
      navigation.navigate(screenName);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="star" size={22} color={colors.accent} />
        <Text style={styles.cardTitle}>Premium Features</Text>
      </View>

      <View style={styles.divider} />

      {premiumFeatures.map((feature) => (
        <TouchableOpacity
          key={feature.id}
          style={styles.featureItem}
          onPress={() => handleNavigate(feature.screenName)}
          activeOpacity={0.7}
        >
          <View style={styles.featureIconContainer}>
            <Ionicons name={feature.icon} size={24} color={colors.accent} />
          </View>
          
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      ))}

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          Thank you for your support!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.fontSizes.title3,
    color: colors.black,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
    paddingRight: 8,
  },
  featureTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.body,
    color: colors.black,
    marginBottom: 2,
  },
  featureDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.smallNote,
    color: colors.secondaryText,
  },
  cardFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.smallNote,
    color: colors.accent,
    textAlign: 'center',
  },
});

export default PremiumFeaturesCard;
