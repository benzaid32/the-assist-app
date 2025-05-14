import { useState, useCallback } from 'react';
import { z } from 'zod';

/**
 * Custom hook for form state management with Zod validation
 *
 * @param schema - Zod validation schema
 * @param initialValues - Initial form values
 * @returns Object containing form state and handlers
 */
export const useForm = <T extends Record<string, any>, U extends z.ZodType<T>>(
  schema: U,
  initialValues: T,
) => {
  // Form values state
  const [values, setValues] = useState<T>(initialValues);
  
  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input change
  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing again
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Validate form against schema
  const validateForm = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  }, [schema, values]);
  
  // Handle form submission
  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void>) => {
      setIsSubmitting(true);
      
      try {
        if (!validateForm()) {
          setIsSubmitting(false);
          return;
        }
        
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        // Error handling is left to the component using this hook
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, values]
  );
  
  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);
  
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    validateForm,
  };
};
