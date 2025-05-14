import { useState, useCallback, useRef, RefObject } from 'react';
import { TextInput } from 'react-native';

// Type definitions
export type FieldRefs = {
  [key: string]: RefObject<any>;
};

export type ValidationErrors = {
  [key: string]: string;
};

/**
 * Enterprise-grade form controller for robust input management
 * This controller follows React Native best practices for handling inputs,
 * focus, and form state without excessive re-rendering.
 */
export function useFormController<T extends Record<string, any>>(initialValues: T) {
  // Core state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Field refs for direct DOM access - improves performance by avoiding unnecessary renders
  const fieldRefs: FieldRefs = {};
  
  /**
   * Register input ref with the controller
   */
  const registerFieldRef = (name: string, ref: RefObject<any>) => {
    fieldRefs[name] = ref;
    return ref;
  };

  /**
   * Update a field value without triggering unnecessary validations
   */
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Clear error on change
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);
  
  /**
   * Focus the next field in sequence - critical for keyboard navigation
   */
  const focusField = useCallback((fieldName: string) => {
    const ref = fieldRefs[fieldName];
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [fieldRefs]);
  
  /**
   * Validate all fields using provided validation function
   */
  const validateForm = useCallback((validationFn?: (values: T) => ValidationErrors) => {
    if (!validationFn) return true;
    
    const validationErrors = validationFn(values);
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (hasErrors) {
      setErrors(validationErrors);
      
      // Focus first field with error for better UX
      const firstErrorField = Object.keys(validationErrors)[0];
      focusField(firstErrorField);
    } else {
      setErrors({});
    }
    
    return !hasErrors;
  }, [values, focusField]);
  
  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  /**
   * Handle form submission with proper validation
   */
  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void>,
    validationFn?: (values: T) => ValidationErrors
  ) => {
    // Mark all fields as touched during submission
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    setIsSubmitting(true);
    
    try {
      // Validate form before submission
      const isValid = validateForm(validationFn);
      
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
      
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Set global form error
      if (error instanceof Error) {
        setErrors(prev => ({
          ...prev,
          _form: error.message
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    fieldRefs,
    registerFieldRef,
    focusField,
    handleSubmit,
    resetForm,
    validateForm
  };
}
