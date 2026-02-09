import React, { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigationState } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import LoginScreen from '../screens/LoginScreen';
import MyTabs from '../screens/MyTabs';
import OtpLoginScreen from '../screens/OtpLoginScreen';
import TicketsTab from '../screens/TicketsTab';
import BoxOfficeTab from '../screens/BoxOfficeTab';
import CheckInAllTickets from '../screens/CheckInAllTickets';
import ManualCheckInAllTickets from '../screens/ManualcheckInAllTickets';
import TicketScanned from '../screens/TicketScanned';
import SplashScreenComponent from '../screens/SplashScreen';
import InitialScreen from '../screens/InitialScreen';
import StaffDashboard from '../screens/dashboard/StaffDashboard';
import ExploreEventScreen from '../screens/eventsTab/Exploreeventscreen';
import ExploreDetailScreenTicketsTab from '../screens/eventsTicketsTab/ExploreDetailScreenTicketsTab';

const Stack = createNativeStackNavigator();

// Dark screens that need black navigation bar
const darkScreens = ['Initial', 'Splash', 'Login', 'OtpLogin'];

function LoggedInScreen() {
  return <MyTabs />;
}

function Navigation({ route }) {
  const scheme = useColorScheme();
  const routeName = useNavigationState(state => {
    if (!state) return 'Initial';
    const route = state.routes[state.index];
    return route.name;
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBehaviorAsync('overlay-swipe');

      // Determine if current screen is dark or light
      const isDarkScreen = darkScreens.includes(routeName);

      if (isDarkScreen) {
        NavigationBar.setBackgroundColorAsync('#281c10');
        NavigationBar.setButtonStyleAsync('light');
      } else {
        NavigationBar.setBackgroundColorAsync('#fff');
        NavigationBar.setButtonStyleAsync('dark');
      }
    }
  }, [routeName, scheme]);

  return (
    <>
      <StatusBar
        translucent
        style={darkScreens.includes(routeName) ? 'light' : 'dark'}
        backgroundColor="transparent"
      />
      <Stack.Navigator initialRouteName="Initial">
        <Stack.Screen
          name="Initial"
          component={InitialScreen}
          options={{
            headerShown: false,
            unmountOnBlur: false,
            statusBarStyle: 'light',
            statusBarTranslucent: true,
            animation: 'none'
          }}
        />
        <Stack.Screen
          name="Splash"
          component={SplashScreenComponent}
          options={{
            headerShown: false,
            unmountOnBlur: true,
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
            statusBarTranslucent: true
          }}
        />
        <Stack.Screen
          name="OtpLogin"
          component={OtpLoginScreen}
          options={{
            headerShown: false,
            unmountOnBlur: true,
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
            statusBarTranslucent: true
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
            statusBarTranslucent: true
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
            statusBarTranslucent: true
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
            statusBarTranslucent: true
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
            statusBarTranslucent: true
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
            statusBarTranslucent: true
          }}
        />
        <Stack.Screen
          name="ExploreEventScreen"
          component={ExploreEventScreen}
          options={{
            headerShown: false,
            unmountOnBlur: true,
            statusBarStyle: 'dark',
            statusBarBackgroundColor: 'white',
            statusBarTranslucent: true
          }}
        />
        <Stack.Screen
          name="ExploreDetailScreenTicketsTab"
          component={ExploreDetailScreenTicketsTab}
          options={{
            headerShown: false,
            unmountOnBlur: true,
            statusBarStyle: 'dark',
            statusBarBackgroundColor: 'white',
            statusBarTranslucent: true
          }}
        />
      </Stack.Navigator>
    </>
  );
}

export default Navigation;