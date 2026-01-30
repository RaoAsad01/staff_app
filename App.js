import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation/navigation';
import * as SplashScreen from 'expo-splash-screen';
import { useOfflineSync } from './src/hooks/useOfflineSync';

SplashScreen.preventAutoHideAsync().catch(() => {});

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  
  // Initialize offline sync - will auto-sync when connection is restored
  useOfflineSync();

  useEffect(() => {
    let timeoutId;

    const prepare = async () => {
      try {
        timeoutId = setTimeout(() => {
          setIsAppReady(true);
        }, 5000);
      } catch (error) {
        console.warn('Error during splash delay', error);
        setIsAppReady(true);
      }
    };

    prepare();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleLayout = useCallback(async () => {
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={handleLayout}>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </View>
  );
}

export default App;
