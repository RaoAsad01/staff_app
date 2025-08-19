import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import HomeScreen from './CheckIn';
import Tickets from './Tickets';
import ManualScan from './ManualScan';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import DashboardScreen from '../screens/dashboard';
import ProfileScreen from './ProfileScreen';
import { useRoute } from '@react-navigation/native';
import { fetchUpdatedScanCount, updateEventInfoScanCount } from '../utils/scanCountUpdater';

const Tab = createBottomTabNavigator();

function MyTabs() {
  const route = useRoute();
  const initialEventInfo = route?.params?.eventInfo;
  const [eventInformation, setEventInformation] = useState(initialEventInfo);

  // Update eventInfo when route params change
  useEffect(() => {
    if (route?.params?.eventInfo) {
      setEventInformation(route.params.eventInfo);
    }
  }, [route?.params?.eventInfo]);

  // Function to update scan count
  const updateScanCount = async () => {
    if (!eventInformation?.eventUuid) return;

    try {
      const newScanCount = await fetchUpdatedScanCount(eventInformation.eventUuid);
      if (newScanCount !== null) {
        const updatedEventInfo = updateEventInfoScanCount(eventInformation, newScanCount);
        setEventInformation(updatedEventInfo);
      }
    } catch (error) {
      console.error('Error updating scan count:', error);
    }
  };

  // Function to handle event change from dashboard
  const handleEventChange = (newEvent) => {
    console.log('Event changed to:', newEvent);
    // Transform the event data to match the expected format
    const transformedEvent = {
      eventUuid: newEvent.uuid,
      event_title: newEvent.title,
      uuid: newEvent.uuid,
      cityName: eventInformation?.cityName || 'Accra',
      date: eventInformation?.date || '28-12-2024',
      time: eventInformation?.time || '7:00 PM',
    };
    setEventInformation(transformedEvent);
    
    // The dashboard will automatically refresh its data when eventInformation changes
    // because it depends on eventInfo?.eventUuid in the useEffect
  };

  const CustomTabBarButton = ({ children, accessibilityState, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.tabBarButton}
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
        IconComponent = focused ? SvgIcons.dashboardActiveIcon : SvgIcons.dashboardInactiveIcon;
      } else {
        IconComponent = focused ? SvgIcons.dashboardActiveIcon : SvgIcons.dashboardInactiveIcon;
      }
    } else if (route.name === 'Tickets') {
      if (isCheckInActive && !focused) {
        IconComponent = focused ? SvgIcons.ticketActiveTabSvg : SvgIcons.ticketInactiveTabSvg;
      } else {
        IconComponent = focused ? SvgIcons.ticketActiveTabSvg : SvgIcons.ticketInactiveTabSvg;
      }
    } else if (route.name === 'Check In') {
      IconComponent = focused ? SvgIcons.checkinActiveTabSVG : SvgIcons.checkinInActiveTabSVG;
    } else if (route.name === 'Manual') {
      if (isCheckInActive && !focused) {
        IconComponent = focused ? SvgIcons.manualActiveTabSVG : SvgIcons.manualInActiveTabSVG;
      } else {
        IconComponent = focused ? SvgIcons.manualActiveTabSVG : SvgIcons.manualInActiveTabSVG;
      }
    } else if (route.name === 'Profile') {
      if (isCheckInActive && !focused) {
        IconComponent = focused ? SvgIcons.profileIconActive : SvgIcons.profileIconInActive;
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
          tabBarIcon: ({ focused }) => {
            const icon = (
              <CustomIcon
                route={route}
                focused={focused}
                isCheckInActive={isCheckInActive}
              />
            );

            const label = (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.tabBarLabel,
                  {
                    color: focused
                      ? '#AE6F28'
                      : isCheckInActive
                        ? '#766F6A'
                        : color.brown_766F6A,
                    fontWeight: focused ? 'bold' : 'normal',
                  },
                ]}
              >
                {route.name}
              </Text>
            );

            return (
              <View
                style={[
                  styles.iconLabelWrapper,
                  focused && styles.focusedTabWrapper,
                ]}
              >
                {icon}
                {label}
              </View>
            );
          },

          tabBarStyle: {
            height: 66,
            backgroundColor: isCheckInActive ? '#f3f3f3' : '#f3f3f3',
          },
          tabBarShowLabel: false,
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} route={route} />
          ),
        };
      }}
      initialRouteName="Check In"
    >
      <Tab.Screen
        name="Dashboard"
        options={{ headerShown: false, unmountOnBlur: true }}
      >
        {() => <DashboardScreen eventInfo={eventInformation} onScanCountUpdate={updateScanCount} onEventChange={handleEventChange} />}
      </Tab.Screen>

      <Tab.Screen
        name="Tickets"
        options={{ headerShown: false, unmountOnBlur: true }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Tickets',
                  params: { fromTab: true, eventInfo: eventInformation },
                },
              ],
            });
          },
        })}
      >
        {(props) => <Tickets {...props} eventInfo={eventInformation} onScanCountUpdate={updateScanCount} />}
      </Tab.Screen>

      <Tab.Screen
        name="Check In"
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      >
        {() => <HomeScreen eventInfo={eventInformation} onScanCountUpdate={updateScanCount} />}
      </Tab.Screen>

      <Tab.Screen
        name="Manual"
        options={{ headerShown: false, unmountOnBlur: true }}
      >
        {() => <ManualScan eventInfo={eventInformation} onScanCountUpdate={updateScanCount} />}
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

  iconLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 5,
  },

  focusedTabWrapper: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
    marginVertical: -10
  },

  tabBarLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MyTabs;
