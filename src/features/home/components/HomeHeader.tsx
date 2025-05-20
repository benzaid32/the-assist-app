import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Platform,
  Animated,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User } from '../../../types/auth';
import { colors, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface HomeHeaderProps {
  user: User;
  scrollY: Animated.Value;
  reducedMotionEnabled: boolean;
  isSmallDevice?: boolean;
  isLargeDevice?: boolean;
}

/**
 * HomeHeader component - iOS-native header following design patterns from top apps
 * Enterprise-grade implementation with proper iOS styling and interactions
 */
export const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  scrollY,
  reducedMotionEnabled,
  isSmallDevice,
  isLargeDevice
}) => {
  const navigation = useNavigation();
  
  // Calculate opacity based on scroll position - standard iOS pattern
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  // Calculate title opacity based on scroll position
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  return (
    <>
      <StatusBar barStyle="dark-content" />
      
      {/* Main visible header with profile button - Fixed position */}
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            height: isSmallDevice ? 84 : isLargeDevice ? 108 : 96,
          },
        ]}
        accessibilityRole="header"
      >
        {/* iOS-native title in center that appears on scroll */}
        <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
          <Text style={styles.headerTitle}>Home</Text>
        </Animated.View>
        
        {/* iOS-native profile button in right corner */}
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile' as never)}
          accessibilityLabel="View your profile"
          accessibilityRole="button"
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          {user.metadata?.photoURL ? (
            <Image 
              source={{ uri: user.metadata.photoURL as string }}
              style={styles.profileImage}
              accessibilityLabel="Your profile picture"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {user.displayName ? user.displayName[0].toUpperCase() : 'D'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* iOS-native notification button on left */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications' as never)}
          accessibilityLabel="View notifications"
          accessibilityRole="button"
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Actual content header with greeting - scrolls away */}
      <View style={styles.contentHeader}>
        <Text style={styles.welcomeText}>
          Hello, {user.displayName || 'Donor'}
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.primary,
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // Account for iOS status bar
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.border.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  titleContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },
  headerTitle: {
    fontFamily: typography.fonts.semibold,
    fontSize: 17,
    color: colors.text.primary,
    textAlign: 'center',
  },
  contentHeader: {
    paddingTop: Platform.OS === 'ios' ? 100 : 60, // Account for fixed header
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface.primary,
  },
  welcomeText: {
    fontFamily: typography.fonts.semibold,
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: typography.fonts.regular,
    fontSize: 15,
    color: colors.text.secondary,
  },
  profileButton: {
    position: 'absolute',
    right: 16,
    bottom: 10,
  },
  notificationButton: {
    position: 'absolute',
    left: 16,
    bottom: 10,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  profileImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontFamily: typography.fonts.semibold,
    fontSize: 14,
    color: colors.white,
  }
});
