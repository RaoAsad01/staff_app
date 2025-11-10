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
import { eventService } from '../api/apiService';
import * as SecureStore from 'expo-secure-store';

const Tab = createBottomTabNavigator();

function MyTabs() {
  const route = useRoute();
  const initialEventInfo = route?.params?.eventInfo;
  const [eventInformation, setEventInformation] = useState(initialEventInfo);
  const [isLoadingEventInfo, setIsLoadingEventInfo] = useState(false);

  // Update eventInfo when route params change
  useEffect(() => {
    if (route?.params?.eventInfo) {
      setEventInformation(route.params.eventInfo);
    }
  }, [route?.params?.eventInfo]);

  // Fetch event info if not available (app restart scenario)
  useEffect(() => {
    const fetchEventInfoIfNeeded = async () => {
      if (!eventInformation?.eventUuid) {
        try {
          setIsLoadingEventInfo(true);
          console.log('No eventInfo found, fetching from backend...');
          
          // Try to get the last selected event from secure storage
          const lastEventUuid = await SecureStore.getItemAsync('lastSelectedEventUuid');
          console.log('Retrieved stored UUID:', lastEventUuid);
          
          if (lastEventUuid) {
            console.log('Found last event UUID in storage:', lastEventUuid);
            const eventInfoData = await eventService.fetchEventInfo(lastEventUuid);
            
            const transformedEventInfo = {
              staff_name: eventInfoData?.data?.staff_name,
              event_title: eventInfoData?.data?.event_title,
              cityName: eventInfoData?.data?.location?.city,
              date: eventInfoData?.data?.start_date,
              time: eventInfoData?.data?.start_time,
              userId: eventInfoData?.data?.staff_id,
              scanCount: eventInfoData?.data?.scan_count,
              event_uuid: eventInfoData?.data?.location?.uuid,
              eventUuid: lastEventUuid
            };
            
            console.log('Fetched event info from backend:', transformedEventInfo);
            setEventInformation(transformedEventInfo);
          } else {
            console.log('No last event UUID found in storage, fetching user events...');
            // Fallback: fetch user events and use the first available event
            try {
              const staffEventsData = await eventService.fetchStaffEvents();
              const eventsList = staffEventsData?.data;
              
              if (eventsList && eventsList.length > 0) {
                let selectedEvent = null;
                
                // Handle different data structures for ADMIN vs Organizer roles
                if (eventsList[0].events && Array.isArray(eventsList[0].events)) {
                  // For organizer role: eventsList[0] contains {events: [...], staff: "..."}
                  if (eventsList[0].events.length > 0) {
                    selectedEvent = eventsList[0].events[0];
                  }
                } else {
                  // For admin role or direct event structure
                  selectedEvent = eventsList[0];
                }
                
                if (selectedEvent) {
                  const eventUuid = selectedEvent.uuid || selectedEvent.eventUuid;
                  console.log('Using first available event:', eventUuid);
                  
                  // Store this event UUID for future use
                  await SecureStore.setItemAsync('lastSelectedEventUuid', eventUuid);
                  
                  // Fetch event info
                  const eventInfoData = await eventService.fetchEventInfo(eventUuid);
                  
                  const transformedEventInfo = {
                    staff_name: eventInfoData?.data?.staff_name,
                    event_title: eventInfoData?.data?.event_title,
                    cityName: eventInfoData?.data?.location?.city,
                    date: eventInfoData?.data?.start_date,
                    time: eventInfoData?.data?.start_time,
                    userId: eventInfoData?.data?.staff_id,
                    scanCount: eventInfoData?.data?.scan_count,
                    event_uuid: eventInfoData?.data?.location?.uuid,
                    eventUuid: eventUuid
                  };
                  
                  console.log('Fetched fallback event info from backend:', transformedEventInfo);
                  setEventInformation(transformedEventInfo);
                } else {
                  console.log('No events available for user');
                }
              } else {
                console.log('No events found for user');
              }
            } catch (fallbackError) {
              console.error('Error fetching fallback events:', fallbackError);
            }
          }
        } catch (error) {
          console.error('Error fetching event info on app restart:', error);
        } finally {
          setIsLoadingEventInfo(false);
        }
      }
    };

    fetchEventInfoIfNeeded();
  }, []);

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
  const handleEventChange = async (newEvent) => {
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
    
    // Store the new event UUID for app restart scenarios
    try {
      await SecureStore.setItemAsync('lastSelectedEventUuid', newEvent.uuid);
      console.log('Stored new selected event UUID:', newEvent.uuid);
    } catch (error) {
      console.error('Error storing event UUID:', error);
    }
    
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
      initialRouteName="Dashboard"
    >
      <Tab.Screen
        name="Dashboard"
        options={{ 
          headerShown: false, 
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }}
      >
        {() => <DashboardScreen eventInfo={eventInformation} onScanCountUpdate={updateScanCount} onEventChange={handleEventChange} />}
      </Tab.Screen>

      <Tab.Screen
        name="Tickets"
        options={{ 
          headerShown: false, 
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }}
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
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }}
      >
        {() => <HomeScreen eventInfo={eventInformation} onScanCountUpdate={updateScanCount} />}
      </Tab.Screen>

      <Tab.Screen
        name="Manual"
        options={{ 
          headerShown: false, 
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }}
      >
        {() => <ManualScan eventInfo={eventInformation} onScanCountUpdate={updateScanCount} />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ 
          headerShown: false, 
          unmountOnBlur: true,
          statusBarStyle: 'dark',
          statusBarBackgroundColor: 'white',
          statusBarTranslucent: false
        }}
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
