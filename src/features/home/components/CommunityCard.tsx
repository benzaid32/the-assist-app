import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface CommunityCardProps {
  // Optional props for customization
  title?: string;
  navigation: any; // This should be properly typed based on your navigation stack
}

/**
 * CommunityCard component - Displays community navigation options
 * Enterprise-grade implementation with proper accessibility
 */
export const CommunityCard: React.FC<CommunityCardProps> = ({
  title = "Your Community",
  navigation
}) => {
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.styles.title3, styles.title]}>
          {title}
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Community' as never)}
          accessibilityLabel="View all community features"
          accessibilityRole="button"
          accessible={true}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text style={[typography.styles.callout, styles.viewAllText]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => navigation.navigate('DonorCircle' as never)}
          accessibilityLabel="Go to Donor Circle"
          accessibilityRole="button"
          accessible={true}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.accent.secondary }]}>
            <Ionicons name="people" size={24} color={colors.text.inverse} />
          </View>
          <Text style={[typography.styles.callout, styles.optionText]}>
            Donor Circle
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => navigation.navigate('SupportNetwork' as never)}
          accessibilityLabel="Go to Support Network"
          accessibilityRole="button"
          accessible={true}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.accent.muted }]}>
            <Ionicons name="heart" size={24} color={colors.text.inverse} />
          </View>
          <Text style={[typography.styles.callout, styles.optionText]}>
            Support Network
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.border.regular,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.text.primary,
  },
  viewAllText: {
    color: colors.accent.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: colors.border.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    color: colors.text.primary,
    textAlign: 'center',
  }
});
