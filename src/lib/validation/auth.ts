import { z } from 'zod';
import { UserType } from '../../types/auth';

// Email regex pattern for validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password requirements: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .regex(EMAIL_REGEX, { message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

// Signup validation schema
export const signupSchema = loginSchema.extend({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(PASSWORD_REGEX, { 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  userType: z.nativeEnum(UserType, {
    errorMap: () => ({ message: 'Please select a valid user type' }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Types inferred from validation schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
