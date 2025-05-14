import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { colors, typography, globalStyles } from '../../constants/theme';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * SplashScreen component that displays the app logo and transitions to the welcome screen
 */
export const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // First fade in and scale up the title
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(titleFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Then fade in the tagline
      Animated.timing(taglineFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to welcome screen after animation completes
    const timer = setTimeout(() => {
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      } catch (error) {
        console.error('Navigation error:', error);
        if (error instanceof Error) {
          console.error(`Failed to navigate to Welcome: ${error.message}`);
        }
      }
    }, 2800); // Increased time to allow animations to complete

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, titleFadeAnim, taglineFadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.contentContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        {/* Splash Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            { opacity: titleFadeAnim }
          ]}
        >
          <Image 
            source={require('../../assets/images/splash.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
        
        {/* Title Text */}
        <View style={styles.titleContainer}>
          <Animated.Text 
            style={[
              styles.titleText,
              styles.titleFirst, 
              { opacity: titleFadeAnim }
            ]}
          >
            The
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.titleText, 
              styles.titleMain,
              { opacity: titleFadeAnim }
            ]}
          >
            Assist App.
          </Animated.Text>
        </View>
        
        {/* Tagline */}
        <Animated.View 
          style={[
            styles.taglineContainer,
            { opacity: taglineFadeAnim }
          ]}
        >
          <Text style={styles.taglineText}>Small help.</Text>
          <Text style={styles.taglineText}>Big difference.</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 40,
    paddingBottom: 50, // Add padding to the bottom for Apple-like spacing
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320, // Constrain width for better proportions on larger screens
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40, // Increased spacing for better visual hierarchy
    width: '100%',
  },
  logoImage: {
    width: 100, // Slightly smaller for better proportions
    height: 100, // Slightly smaller for better proportions
    marginBottom: 30, // Increased spacing between logo and title
  },
  titleContainer: {
    alignItems: 'center', // Center align title text
    marginBottom: 24, // Adjusted spacing for better rhythm
    width: '100%',
  },
  titleText: {
    fontFamily: typography.fonts.bold,
    fontSize: 36, // Adjusted for better proportions
    lineHeight: 42, // Adjusted line height
    letterSpacing: -0.5, // Apple-like tight letter spacing
    color: colors.black,
    fontWeight: Platform.OS === 'ios' ? '900' : 'bold', // Maximum boldness
    textAlign: 'center', // Center align for Apple-like appearance
    // Add subtle shadow for depth on iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, // More subtle shadow
        shadowRadius: 0.5, // More precise shadow
      },
      android: {
        elevation: 1,
      },
    }),
  },
  titleFirst: {
    fontSize: 28, // Slightly smaller than main title
    opacity: 0.9, // Slightly less emphasis
  },
  titleMain: {
    fontSize: 40, // Larger than first line
    marginTop: -6, // Tighter line spacing for Apple-like typography
  },
  taglineContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  taglineText: {
    fontFamily: typography.fonts.semibold, // Changed from medium to semibold for more boldness
    fontSize: typography.fontSizes.body,
    lineHeight: typography.lineHeights.body,
    color: colors.secondaryText,
    textAlign: 'center', // Center align for Apple-like appearance
    letterSpacing: -0.2, // Subtle letter spacing adjustment for Apple-like typography
  },
});
