import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import HomeScreen from "./CheckIn";
import Tickets from './Tickets';
import ManualScan from "./ManualScan";
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import DashboardScreen from "../screens/dashboard";
import ProfileScreen from './ProfileScreen';
import { useRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

function MyTabs() {
  const route = useRoute();
  const eventInformation = route?.params?.eventInfo;

  const CustomTabBarButton = ({ children, accessibilityState, onPress }) => {
    const focused = accessibilityState?.selected || false;

    return (
      <TouchableOpacity
        style={[
          styles.tabBarButton,
          focused && styles.activeTabBarButton,
        ]}
        onPress={onPress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let IconComponent;

          if (route.name === 'Dashboard') {
            IconComponent = focused ? SvgIcons.dashboardActiveIcon : SvgIcons.dashboardInactiveIcon;
          } else if (route.name === 'Tickets') {
            IconComponent = focused ? SvgIcons.ticketActiveTabSvg : SvgIcons.ticketInactiveTabSvg;
          } else if (route.name === 'Check In') {
            IconComponent = focused ? SvgIcons.checkinActiveTabSVG : SvgIcons.checkinInActiveTabSVG;
          } else if (route.name === 'Manual Scan') {
            IconComponent = focused ? SvgIcons.manualActiveTabSVG : SvgIcons.manualInActiveTabSVG;
          } else if (route.name === 'Profile') {
            IconComponent = focused ? SvgIcons.profileActiveTab : SvgIcons.profileMenuIcon;
          }

          return <IconComponent width={24} height={24} fill="transparent" />;
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 8,
        },
        tabBarStyle: {
          height: 66,
          backgroundColor: '#F5F5F5',
        },
        tabBarActiveTintColor: color.btnBrown_AE6F28,
        tabBarInactiveTintColor: color.brown_766F6A,
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
      })}
      initialRouteName="Check In"
    >
      <Tab.Screen
        name="Dashboard"
        options={{ headerShown: false, unmountOnBlur: true }}
      >
        {() => <DashboardScreen eventInfo={eventInformation} />}
      </Tab.Screen>

      <Tab.Screen
        name="Tickets"
        options={{ headerShown: false, unmountOnBlur: true }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Tickets', params: { fromTab: true, eventInfo: eventInformation } }],
            });
          },
        })}
      >
        {(props) => <Tickets {...props} eventInfo={eventInformation} />}
      </Tab.Screen>

      <Tab.Screen
        name="Check In"
        options={{ headerShown: false, unmountOnBlur: true }}
      >
        {() => <HomeScreen eventInfo={eventInformation} />}
      </Tab.Screen>

      <Tab.Screen
        name="Manual Scan"
        options={{ headerShown: false, unmountOnBlur: true }}
      >
        {() => <ManualScan eventInfo={eventInformation} />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false, unmountOnBlur: true }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabBarButton: {
    backgroundColor: 'white',
    marginVertical: 5,
    marginHorizontal: 6,
  },
});

export default MyTabs;