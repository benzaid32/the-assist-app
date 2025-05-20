import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  StyleProp,
  ActivityIndicator
} from 'react-native';
import { colors, typography } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'transparent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/**
 * Button component - A reusable button with different variants and states
 * Enterprise-grade implementation with proper type safety and accessibility
 */
export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  labelStyle,
  testID
}) => {
  // Create style arrays based on props
  const containerStyles: StyleProp<ViewStyle>[] = [styles.container];
  const textStyles: StyleProp<TextStyle>[] = [styles.label];
  
  // Add size styles
  if (size === 'small') {
    containerStyles.push(styles.smallContainer);
    textStyles.push(styles.smallLabel);
  } else if (size === 'large') {
    containerStyles.push(styles.largeContainer);
    textStyles.push(styles.largeLabel);
  }
  
  // Add variant styles
  switch (variant) {
    case 'primary':
      containerStyles.push(styles.primaryContainer);
      textStyles.push(styles.primaryLabel);
      break;
    case 'secondary':
      containerStyles.push(styles.secondaryContainer);
      textStyles.push(styles.secondaryLabel);
      break;
    case 'outline':
      containerStyles.push(styles.outlineContainer);
      textStyles.push(styles.outlineLabel);
      break;
    case 'transparent':
      containerStyles.push(styles.transparentContainer);
      textStyles.push(styles.transparentLabel);
      break;
  }
  
  // Add disabled styles
  if (disabled) {
    containerStyles.push(styles.disabledContainer);
    textStyles.push(styles.disabledLabel);
  }
  
  // Add custom styles
  if (style) containerStyles.push(style);
  if (labelStyle) textStyles.push(labelStyle);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={containerStyles}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ 
        disabled: disabled || loading,
        busy: loading 
      }}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.white : colors.black} 
          size="small" 
        />
      ) : (
        <Text style={textStyles}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  smallContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  largeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryContainer: {
    backgroundColor: colors.accent,
  },
  secondaryContainer: {
    backgroundColor: colors.highlight,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  disabledContainer: {
    backgroundColor: colors.neutralBorders,
    borderColor: colors.neutralBorders,
  },
  
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.button,
    textAlign: 'center' as const,
  },
  smallLabel: {
    fontSize: typography.fontSizes.navItem,
  },
  largeLabel: {
    fontSize: typography.fontSizes.body + 2,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.white,
  },
  outlineLabel: {
    color: colors.accent,
  },
  transparentLabel: {
    color: colors.accent,
  },
  disabledLabel: {
    color: colors.white,
  }
});

export default Button;
