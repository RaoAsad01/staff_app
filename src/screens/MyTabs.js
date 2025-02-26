import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CheckIn from "./CheckIn"
import Tickets from './Tickets';
import ManualScan from "./ManualScan"
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
const Tab = createBottomTabNavigator();

function MyTabs() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Tickets') {
            IconComponent = focused ? SvgIcons.ticketActiveTabSvg : SvgIcons.ticketInactiveTabSvg;
          } else if (route.name === 'Check In') {
            IconComponent = focused ? SvgIcons.checkinActiveTabSVG : SvgIcons.checkinInActiveTabSVG;
          } else if (route.name === 'Manual Scan') {
            IconComponent = focused ? SvgIcons.manualActiveTabSVG : SvgIcons.manualInActiveTabSVG;
          }

          return <IconComponent width={24} height={24} fill="transparent" />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 8,

        },
        tabBarActiveTintColor: color.btnBrown_AE6F28,
        tabBarInactiveTintColor: color.brown_766F6A,
        tabBarStyle: {
          height: 66,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          backgroundColor: 'white',
          width: '100%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 5,
          marginTop: 2
        },
        tabBarPressColor: color.white_FFFFFF, // Removes the grey touch effect
        tabBarPressOpacity: 0,         // Smooth press effect
      })}
      initialRouteName="Check In"
    >
      <Tab.Screen name="Tickets" component={Tickets} options={{ headerShown: false, unmountOnBlur: true }} />
      <Tab.Screen name="Check In" component={CheckIn} options={{ headerShown: false, unmountOnBlur: true }} />
      <Tab.Screen name="Manual Scan" component={ManualScan} options={{ headerShown: false, unmountOnBlur: true }} />
    </Tab.Navigator>
  );
}

export default MyTabs;