import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ReturnKeyTypeOptions,
  Platform,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../constants/theme';

export interface FormInputHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

interface FormInputProps {
  // Basic props
  name: string;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  
  // Input configuration
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'visible-password';
  
  // Validation and error handling
  error?: string;
  touched?: boolean;
  
  // Keyboard and focus management
  returnKeyType?: ReturnKeyTypeOptions;
  blurOnSubmit?: boolean;
  onSubmitEditing?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  
  // Optional styling and testing
  testID?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Enhanced form input component with robust keyboard handling
 * and focus management optimized for React Native forms
 */
export const FormInput = forwardRef<FormInputHandle, FormInputProps>((
  {
    name,
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    autoCapitalize = 'none',
    keyboardType = 'default',
    error,
    touched,
    returnKeyType = 'next',
    blurOnSubmit = false,
    onSubmitEditing,
    editable = true,
    autoFocus = false,
    testID,
    containerStyle,
  },
  ref
) => {
  // Local state
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  
  // Internal input reference for imperative control
  const inputRef = useRef<TextInput>(null);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
    clear: () => {
      inputRef.current?.clear();
    }
  }));
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };
  
  // Handle focus events with proper state updates
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError
      ]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AAAAAA"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          autoFocus={autoFocus}
          testID={`${testID}-input`}
          // Important iOS-specific props for better keyboard handling
          clearButtonMode="while-editing" 
          enablesReturnKeyAutomatically
          // Important Android-specific props
          textContentType={secureTextEntry ? 'password' : 'emailAddress'}
          importantForAutofill="yes"
          autoComplete={secureTextEntry ? 'password' : 'email'}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.iconContainer}
            onPress={togglePasswordVisibility}
            testID={`${testID}-toggle-visibility`}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={24} 
              color={colors.primaryText}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error ? (
        <Text style={styles.errorText} testID={`${testID}-error`}>{error}</Text>
      ) : null}
    </View>
  );
});

// Specific component name for better debugging
FormInput.displayName = 'FormInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.fontSizes.label,
    color: colors.primaryText,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutralBorders,
    borderRadius: 8,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputError: {
    borderColor: colors.accent,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.body,
    color: colors.primaryText,
  },
  iconContainer: {
    padding: 10,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.fontSizes.label,
    color: colors.accent,
    marginTop: 4,
  },
  neutralTextLight: {
    color: "#AAAAAA"
  }
});
