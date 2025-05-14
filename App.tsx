import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { initializeFirebaseServices, FirebaseServices } from './src/services/firebase/config';
import { LoadingScreen } from './src/components/common/LoadingScreen'; // Keep for basic display

// Root application component - TEMPORARILY SIMPLIFIED FOR DEBUGGING
export default function App() {
  const [initMessage, setInitMessage] = useState<string>('Initializing Firebase...');

  useEffect(() => {
    console.log('App (Simplified): Attempting Firebase initialization...');
    setInitMessage('Attempting Firebase initialization...');
    initializeFirebaseServices()
      .then((services) => {
        console.log('App (Simplified): Firebase initialized successfully.');
        setInitMessage('Firebase initialized successfully! You can now close the app or restore App.tsx.');
        // In a real scenario, you'd set services to state here if needed later
      })
      .catch((error) => {
        console.error('App (Simplified): Firebase initialization failed:', error);
        setInitMessage(`Firebase initialization failed: ${error.message || 'Unknown error'}. Check console.`);
      });
  }, []);

  // Render a very basic view, or LoadingScreen
  return <LoadingScreen message={initMessage} />;
  // Or, even simpler to absolutely minimize dependencies:
  // return (
  //   <View style={styles.container_simplified}>
  //     <Text style={styles.text_simplified}>{initMessage}</Text>
  //   </View>
  // );
}

// Minimal styles for the simplified version
const styles = StyleSheet.create({
  container_simplified: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  text_simplified: {
    fontSize: 16,
    textAlign: 'center',
  },
});
