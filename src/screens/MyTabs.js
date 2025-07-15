import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet,Text } from 'react-native';
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

  const CustomTabBarButton = ({ children, accessibilityState, onPress, route }) => {
    const focused = accessibilityState?.selected || false;
    const isCheckInTab = route?.name === 'Check In';

    return (
      <TouchableOpacity
        style={[
          styles.tabBarButton,
          focused && isCheckInTab && styles.activeCheckInTabBarButton,
          focused && !isCheckInTab && styles.activeTabBarButton,
        ]}
        onPress={onPress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    );
  };

  const CustomIcon = ({ route, focused, isCheckInActive }) => {
    let IconComponent;

    if (route.name === 'Dashboard') {
      if (isCheckInActive && !focused) {
        IconComponent = SvgIcons.dashboardInactiveIconWhite;
      } else {
        IconComponent = focused ? SvgIcons.dashboardActiveIcon : SvgIcons.dashboardInactiveIcon;
      }
    } else if (route.name === 'Tickets') {
      if (isCheckInActive && !focused) {
        IconComponent = SvgIcons.ticketInactiveTabSvgWhite;
      } else {
        IconComponent = focused ? SvgIcons.ticketActiveTabSvg : SvgIcons.ticketInactiveTabSvg;
      }
    } else if (route.name === 'Check In') {
      IconComponent = focused ? SvgIcons.checkinActiveTabSVG : SvgIcons.checkinInActiveTabSVG;
    } else if (route.name === 'Manual Scan') {
      if (isCheckInActive && !focused) {
        IconComponent = SvgIcons.manualInActiveTabSVGWhite;
      } else {
        IconComponent = focused ? SvgIcons.manualActiveTabSVG : SvgIcons.manualInActiveTabSVG;
      }
    } else if (route.name === 'Profile') {
      if (isCheckInActive && !focused) {
        IconComponent = SvgIcons.profileMenuIconWhite;
      } else {
        IconComponent = focused ? SvgIcons.profileIconActive : SvgIcons.profileIconInActive;
      }
    }

    return <IconComponent width={24} height={24} fill="transparent" />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => {
        const state = navigation.getState();
        const currentRoute = state.routes[state.index];
        const isCheckInActive = currentRoute?.name === 'Check In';
        
        return {
          tabBarIcon: ({ focused }) => (
            <CustomIcon 
              route={route} 
              focused={focused} 
              isCheckInActive={isCheckInActive}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            marginTop: 8,
          },
          tabBarStyle: {
            height: 66,
            backgroundColor: isCheckInActive ? '#AE6F28' : '#F5F5F5',
          },
          tabBarActiveTintColor: isCheckInActive ? '#FFFFFF' : color.btnBrown_AE6F28,
          tabBarInactiveTintColor: isCheckInActive ? '#FFFFFF' : color.brown_766F6A,
          tabBarButton: (props) => <CustomTabBarButton {...props} route={route} />,
        };
      }}
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
        options={{ 
          headerShown: false, 
          unmountOnBlur: true,
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? '#FFFFFF' : '#766F6A',
              fontSize: 10,
              marginTop: 8,
              fontWeight: focused ? 'bold' : 'normal',
            }}>
              Check In
            </Text>
          ),
        }}
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
    borderRadius: 2,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeCheckInTabBarButton: {
    backgroundColor: color.white_FFFFFF,
    marginVertical: 5,
    marginHorizontal: 6,
    borderRadius: 2,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});

export default MyTabs;