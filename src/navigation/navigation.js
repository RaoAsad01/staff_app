import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MyTabs from '../screens/MyTabs';
import OtpLoginScreen from '../screens/OtpLoginScreen';
import TicketsTab from '../screens/TicketsTab';
import BoxOfficeTab from '../screens/BoxOfficeTab';
import CheckInAllTickets from '../screens/CheckInAllTickets';
import ManualCheckInAllTickets from '../screens/ManualcheckInAllTickets';
import TicketScanned from '../screens/TicketScanned';
import SplashScreenComponent from '../screens/SplashScreen';
import StaffDashboard from '../screens/dashboard/StaffDashboard';
import * as SecureStore from 'expo-secure-store';
import { View, Text, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

function LoggedInScreen() {
  return <MyTabs />;
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#AE6F28" />
      <Text style={{ marginTop: 10 }}>Loading...</Text>
    </View>
  );
}

function Navigation({ route }) {
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        setHasCheckedAuth(true);
        // We'll handle navigation from the SplashScreen component
      } catch (error) {
        console.error('Error checking auth token:', error);
        setHasCheckedAuth(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthToken();
  }, []);

  if (isLoading || !hasCheckedAuth) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen 
        name="Splash" 
        component={SplashScreenComponent} 
        options={{ 
          headerShown: false,
          unmountOnBlur: true,
          statusBarHidden: true,
          statusBarStyle: 'light',
          statusBarTranslucent: true,
          animation: 'fade'
        }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          headerShown: false, 
          unmountOnBlur: true,
          statusBarHidden: true,
          statusBarStyle: 'light',
          statusBarTranslucent: true,
          animation: 'fade'
        }} 
      />
      <Stack.Screen 
        name="LoggedIn" 
        component={LoggedInScreen} 
        options={{ 
          headerShown: false,
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }} 
      />
      <Stack.Screen 
        name="OtpLogin" 
        component={OtpLoginScreen} 
        options={{ 
          headerShown: false,
          unmountOnBlur: true,
          statusBarHidden: true,
          statusBarStyle: 'light',
          statusBarTranslucent: true,
          animation: 'fade'
        }} 
      />
      <Stack.Screen 
        name="TicketsTab" 
        component={TicketsTab} 
        options={{ 
          headerShown: false,
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }} 
      />
      <Stack.Screen 
        name="BoxOfficeTab" 
        component={BoxOfficeTab} 
        options={{ 
          headerShown: false,
          unmountOnBlur: false,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }} 
      />
      <Stack.Screen 
        name="CheckInAllTickets" 
        component={CheckInAllTickets} 
        options={{ 
          headerShown: false,
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }} 
      />
      <Stack.Screen 
        name="ManualCheckInAllTickets" 
        component={ManualCheckInAllTickets} 
        options={{ 
          headerShown: false,
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }} 
      />
      <Stack.Screen 
        name="TicketScanned" 
        component={TicketScanned} 
        options={{ 
          headerShown: false,
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }} 
      />
      <Stack.Screen 
        name="StaffDashboard" 
        component={StaffDashboard} 
        options={{ 
          headerShown: false,
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }} 
      />
    </Stack.Navigator>
  );
}

export default Navigation;