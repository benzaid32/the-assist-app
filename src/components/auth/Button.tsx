import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * Reusable button component with loading state
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  testID,
  ...restProps
}) => {
  // Determine styles based on variant and state
  const getButtonStyle = () => {
    if (disabled || isLoading) {
      return [
        styles.button,
        styles[`${variant}Button`],
        styles.disabledButton,
        style,
      ];
    }
    return [
      styles.button,
      styles[`${variant}Button`],
      style,
    ];
  };

  const getTextStyle = () => {
    if (disabled || isLoading) {
      return [
        styles.buttonText,
        styles[`${variant}Text`],
        styles.disabledText,
        textStyle,
      ];
    }
    return [
      styles.buttonText,
      styles[`${variant}Text`],
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      testID={testID}
      {...restProps}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : '#007AFF'} 
          testID={`${testID}-loading`}
        />
      ) : (
        <Text style={getTextStyle()} testID={`${testID}-text`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#E9F0FF',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  outlineText: {
    color: '#007AFF',
  },
  disabledText: {
    color: '#A0A0A0',
  },
});
