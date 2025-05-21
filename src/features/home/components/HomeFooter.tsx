import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  AccessibilityInfo,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../../constants/theme';
import { logError } from '../../../services/logging';

interface HomeFooterProps {
  version?: string;
  onPressSupport?: () => void;
  onPressFeedback?: () => void;
}

/**
 * HomeFooter component for displaying app version, support links, and legal info
 * Follows enterprise-grade implementation with accessibility support
 */
export const HomeFooter: React.FC<HomeFooterProps> = ({
  version = '1.0.0',
  onPressSupport,
  onPressFeedback,
}) => {
  // Function to handle opening external links with proper error handling
  const handleOpenLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      logError('Failed to open external link', error);
      console.error('Failed to open URL:', error);
    }
  };

  // Handle opening privacy policy
  const handlePrivacyPolicy = () => {
    handleOpenLink('https://theassistapp.org/privacy');
  };

  // Handle opening terms of service
  const handleTermsOfService = () => {
    handleOpenLink('https://theassistapp.org/terms');
  };

  // Handle support press with fallback
  const handleSupportPress = () => {
    if (onPressSupport) {
      onPressSupport();
    } else {
      handleOpenLink('mailto:support@theassistapp.org');
    }
  };

  // Handle feedback press with fallback
  const handleFeedbackPress = () => {
    if (onPressFeedback) {
      onPressFeedback();
    } else {
      handleOpenLink('https://forms.theassistapp.org/feedback');
    }
  };

  return (
    <View style={styles.container} testID="home-footer">
      <View style={styles.linksContainer}>
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={handlePrivacyPolicy}
          accessibilityLabel="Privacy Policy"
          accessibilityRole="link"
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={handleTermsOfService}
          accessibilityLabel="Terms of Service"
          accessibilityRole="link"
        >
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.supportContainer}>
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={handleSupportPress}
          accessibilityLabel="Contact Support"
          accessibilityRole="button"
        >
          <Ionicons name="help-circle-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.supportText}>Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={handleFeedbackPress}
          accessibilityLabel="Give Feedback"
          accessibilityRole="button"
        >
          <Ionicons name="chatbubble-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.supportText}>Feedback</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          The Assist App v{version}
        </Text>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Assist Nonprofit Organization
        </Text>
      </View>
    </View>
  );
};

// Enterprise-grade styling with proper iOS design patterns
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.surface.secondary,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  linkItem: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  linkText: {
    ...typography.styles.footnote,
    color: colors.text.link,
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.light,
  },
  supportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.surface.tertiary,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  supportText: {
    ...typography.styles.footnote,
    color: colors.text.secondary,
    marginLeft: 4,
    fontSize: 12,
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    ...typography.styles.caption2,
    color: colors.text.tertiary,
    fontSize: 10,
    marginBottom: 2,
  },
  copyrightText: {
    ...typography.styles.caption2,
    color: colors.text.tertiary,
    fontSize: 10,
  },
});
