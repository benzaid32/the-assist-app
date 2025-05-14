import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

/**
 * Logo component that displays The Assist App logo
 * Uses the official black and white logo
 */
export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  // Determine logo size based on prop
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 100, height: 100 };
      case 'large':
        return { width: 200, height: 200 };
      case 'medium':
      default:
        return { width: 150, height: 150 };
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={[styles.logo, getSize()]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Base styles for the logo
  },
});

export default Logo;
