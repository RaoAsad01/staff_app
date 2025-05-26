import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

const SplashScreenComponent = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const prepare = async () => {
      try {
        // Hide the splash screen
        await SplashScreen.hideAsync();
        
        // Navigate to Login screen after 3 seconds
        const timer = setTimeout(() => {
          navigation.replace('Login');
        }, 3000);

        return () => clearTimeout(timer);
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/Hexallo favicon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.text}>Hexallo Staff App</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120b00',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  text: {
    color: color.white_FFFFFF,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SplashScreenComponent; 