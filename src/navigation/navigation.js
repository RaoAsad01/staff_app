import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MyTabs from '../screens/MyTabs'; 
import OtpLoginScreen from '../screens/OtpLoginScreen';
import TicketsTab from '../screens/TicketsTab';
import BoxOfficeTab from '../screens/BoxOfficeTab';
import CheckInAllTickets from '../screens/CheckInAllTickets';
import ManualCheckInAllTickets from '../screens/ManualcheckInAllTickets';
import TicketScanned from '../screens/TicketScanned';
import MyDrawer from '../screens/MyDrawer';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
const Stack = createNativeStackNavigator();

function LoggedInScreen() {
  return <MyTabs />;
}

function Navigation({ route }) {
  const screenName = route?.params?.screenName || "Login";

  return (
    <Stack.Navigator initialRouteName={screenName}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false,unmountOnBlur: true }}  />
      <Stack.Screen name="LoggedIn" component={MyTabs} options={{ headerShown: false,unmountOnBlur: true }} /> 
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} options={{ headerShown: false,unmountOnBlur: true }} /> 
      <Stack.Screen name="TicketsTab" component={TicketsTab} options={{ headerShown: false,unmountOnBlur: true }} /> 
      <Stack.Screen name="BoxOfficeTab" component={BoxOfficeTab} options={{ headerShown: false,unmountOnBlur: false }} /> 
      <Stack.Screen name="CheckInAllTickets" component={CheckInAllTickets} options={{ headerShown: false,unmountOnBlur: true }} /> 
      <Stack.Screen name="ManualCheckInAllTickets" component={ManualCheckInAllTickets} options={{ headerShown: false,unmountOnBlur: true }} /> 
      <Stack.Screen name="TicketScanned" component={TicketScanned} options={{ headerShown: false,unmountOnBlur: true }} /> 
      <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={{ headerShown: false,unmountOnBlur: true }} />
    </Stack.Navigator>
  );
}

export default Navigation;