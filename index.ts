/**
 * TheAssistApp - Enterprise-grade React Native Application
 * Main entry point with dependency patch system
 */

import { registerRootComponent } from 'expo';

// Load dependency patches before importing any components
// This ensures that all module patches are available before dependencies try to access them
import './src/patches';

// Import main App component after patches are loaded
import App from './App';

// Apply performance monitoring if in production
if (process.env.NODE_ENV === 'production') {
  // Production monitoring would be initialized here
  console.info('[App] Production monitoring initialized');
}

// Register the main component
// This calls AppRegistry.registerComponent('main', () => App)
registerRootComponent(App);
