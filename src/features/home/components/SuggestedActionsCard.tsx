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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SuggestedAction, ActionType } from '../types';

interface SuggestedActionsCardProps {
  actions: SuggestedAction[];
  navigation: any; // This should be properly typed based on your navigation stack
  disabled?: boolean; // Whether actions requiring subscription should be disabled
  onActionBlocked?: () => void; // Callback when attempting to use a premium feature
}

/**
 * SuggestedActionsCard component - Displays personalized action items
 * Enterprise-grade implementation with WCAG 2.1 AA accessibility
 */
export const SuggestedActionsCard: React.FC<SuggestedActionsCardProps> = ({
  actions,
  navigation,
  disabled = false,
  onActionBlocked
}) => {
  
  // Handle action press based on action type
  const handleActionPress = (action: SuggestedAction) => {
    // Handle donation actions even when disabled
    if (action.type === 'donate') {
      navigation.navigate('SupportInfo' as never);
      return;
    }
    
    // Check if premium features are disabled
    if (disabled && action.type !== 'profile') {
      // Call the blocked callback to prompt user to donate
      if (onActionBlocked) {
        onActionBlocked();
      }
      return;
    }
    
    // Handle enabled actions
    switch(action.type) {
      case 'community':
        navigation.navigate('Community' as never);
        break;
      case 'share':
        // Would implement share functionality in production
        // This would use the Share API from react-native
        break;
      case 'profile':
        navigation.navigate('Profile' as never);
        break;
    }
  };
  
  // Sort actions by priority
  const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);
  
  return (
    <View style={styles.container}>
      <Text style={[typography.styles.title3, styles.title]}>
        Suggested Actions
      </Text>
      
      {sortedActions.map((action) => (
        <TouchableOpacity 
          key={action.id}
          style={[
            styles.actionItem, 
            action.completed && styles.actionCompleted,
            disabled && action.type !== 'donate' && action.type !== 'profile' && styles.actionDisabled
          ]}
          onPress={() => handleActionPress(action)}
          accessibilityLabel={`${action.completed ? 'Completed: ' : ''}${action.label}. ${action.description}${disabled && action.type !== 'donate' && action.type !== 'profile' ? '. Requires donation to unlock' : ''}`}
          accessibilityRole="button"
          accessibilityState={{ 
            checked: action.completed,
            disabled: disabled && action.type !== 'donate' && action.type !== 'profile'
          }}
          accessible={true}
        >
          <View style={styles.actionIcon}>
            {action.completed ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.feedback.success} />
            ) : (
              getActionIcon(action.type)
            )}
          </View>
          
          <View style={styles.actionContent}>
            <Text style={[typography.styles.callout, styles.actionTitle]}>
              {action.label}
            </Text>
            <Text style={[typography.styles.caption1, styles.actionDescription]}>
              {action.description}
            </Text>
          </View>
          
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.text.tertiary}
            style={styles.actionChevron}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Helper function to get the appropriate icon for action types
const getActionIcon = (type: ActionType) => {
  switch(type) {
    case 'donate':
      return <MaterialIcons name="attach-money" size={24} color={colors.accent.primary} />;
    case 'share':
      return <Ionicons name="share-outline" size={24} color={colors.accent.secondary} />;
    case 'community':
      return <Ionicons name="people-outline" size={24} color={colors.accent.muted} />;
    case 'profile':
      return <Ionicons name="person-outline" size={24} color={colors.accent.primary} />;
    default:
      return <Ionicons name="information-circle-outline" size={24} color={colors.accent.primary} />;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
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
  title: {
    color: colors.text.primary,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  actionCompleted: {
    backgroundColor: colors.surface.tertiary,
  },
  actionDisabled: {
    opacity: 0.7,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text.primary,
    marginBottom: 4,
  },
  actionDescription: {
    color: colors.text.secondary,
  },
  actionChevron: {
    marginLeft: 8,
  }
});
