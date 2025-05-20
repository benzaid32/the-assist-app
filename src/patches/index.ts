/**
 * Dependency Patch Loader
 * Enterprise-grade solution for managing third-party library patches
 * 
 * This module centrally registers all patches applied to external dependencies
 * following best practices for maintainability and transparency.
 */

// Export the useAnimatedValue patch for react-native-tab-view
export { useAnimatedValue } from './useAnimatedValue';

// Log information about applied patches for debugging purposes
console.info('[Patches] Dependency patches loaded successfully');

/**
 * Register this module in your app's entry point to ensure patches are available
 * before dependency modules are loaded.
 */
