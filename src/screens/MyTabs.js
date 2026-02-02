import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from './CheckIn';
import Tickets from './Tickets';
import ManualScan from './ManualScan';
import { color } from '../color/color';
import SvgIcons from '../components/SvgIcons';
import DashboardScreen from '../screens/dashboard';
import ProfileScreen from './ProfileScreen';
import { useRoute } from '@react-navigation/native';
import { fetchUpdatedScanCount, updateEventInfoScanCount } from '../utils/scanCountUpdater';
import { eventService, userService } from '../api/apiService';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../utils/logger';
import AdminAllEventsDashboard from './dashboard/AdminAllEventsDashboard/adminAllEventsDashboard';
import EventsScreen from './eventsTab/EventsScreen';

const Tab = createBottomTabNavigator();

// Placeholder Services Screen
const ServicesScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F7F5' }}>
      <Text style={{ fontSize: 18, color: '#2D2A26' }}>Services</Text>
      <Text style={{ fontSize: 14, color: '#9B9189', marginTop: 8 }}>Services coming soon</Text>
    </View>
  );
};

function MyTabs() {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const initialEventInfo = route?.params?.eventInfo;
  const [eventInformation, setEventInformation] = useState(initialEventInfo);
  const [isLoadingEventInfo, setIsLoadingEventInfo] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  // Calculate dynamic tab bar height with safe area insets
  // Base height (66) + bottom safe area inset (for devices with navigation bars)
  const tabBarHeight = 66 + (Platform.OS === 'android' ? Math.max(0, insets.bottom) : insets.bottom);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const profile = await userService.getProfile();
        const role = profile?.role ||
          profile?.user_role ||
          profile?.type ||
          profile?.permission ||
          profile?.user_type ||
          profile?.data?.role ||
          profile?.user?.role;
        logger.log('User role in MyTabs:', role);
        setUserRole(role || null);
      } catch (error) {
        logger.error('Error fetching user role in MyTabs:', error);
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, []);

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
          logger.log('No eventInfo found, fetching from backend...');
          
          // Try to get the last selected event from secure storage
          const lastEventUuid = await SecureStore.getItemAsync('lastSelectedEventUuid');
          logger.log('Retrieved stored UUID:', lastEventUuid);
          
          if (lastEventUuid) {
            logger.log('Found last event UUID in storage:', lastEventUuid);
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
            
            logger.log('Fetched event info from backend:', transformedEventInfo);
            setEventInformation(transformedEventInfo);
            } else {
              logger.log('No last event UUID found in storage, fetching user events...');
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
                  logger.log('Using first available event:', eventUuid);
                  
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
                  
                  logger.log('Fetched fallback event info from backend:', transformedEventInfo);
                  setEventInformation(transformedEventInfo);
                } else {
                  logger.log('No events available for user');
                }
              } else {
                logger.log('No events found for user');
              }
            } catch (fallbackError) {
              logger.error('Error fetching fallback events:', fallbackError);
            }
          }
        } catch (error) {
          logger.error('Error fetching event info on app restart:', error);
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
      logger.error('Error updating scan count:', error);
    }
  };

  // Function to handle event change from dashboard
  const handleEventChange = async (newEvent) => {
    logger.log('Event changed to:', newEvent);
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
      logger.log('Stored new selected event UUID:', newEvent.uuid);
    } catch (error) {
      logger.error('Error storing event UUID:', error);
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

  const CustomIcon = ({ route, focused, isCheckInActive, userRole }) => {
    let IconComponent;

    // Use admin icons for ADMIN users
    if (userRole === 'ADMIN') {
      if (route.name === 'Dashboard') {
        IconComponent = focused ? SvgIcons.adminDashboardActiveTab : SvgIcons.adminDashboardInactiveTab;
      } else if (route.name === 'Events') {
        IconComponent = focused ? SvgIcons.adminEventsActiveTab : SvgIcons.adminEventsInactiveTab;
      } else if (route.name === 'Check In') {
        IconComponent = focused ? SvgIcons.checkinActiveTabSVG : SvgIcons.adminCheckinInactiveTab;
      } else if (route.name === 'Services') {
        IconComponent = focused ? SvgIcons.adminServicesActiveTab : SvgIcons.adminServicesInactiveTab;
      } else if (route.name === 'Tickets') {
        IconComponent = focused ? SvgIcons.ticketActiveTabSvg : SvgIcons.ticketInactiveTabSvg;
      }
    } else {
      // Regular icons for non-ADMIN users
      if (route.name === 'Dashboard') {
        IconComponent = focused ? SvgIcons.dashboardActiveIcon : SvgIcons.dashboardInactiveIcon;
      } else if (route.name === 'Tickets') {
        IconComponent = focused ? SvgIcons.ticketActiveTabSvg : SvgIcons.ticketInactiveTabSvg;
      } else if (route.name === 'Check In') {
        IconComponent = focused ? SvgIcons.checkinActiveTabSVG : SvgIcons.checkinInActiveTabSVG;
      } else if (route.name === 'Manual') {
        IconComponent = focused ? SvgIcons.manualActiveTabSVG : SvgIcons.manualInActiveTabSVG;
      } else if (route.name === 'Profile') {
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
                userRole={userRole}
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
            height: tabBarHeight,
            backgroundColor: isCheckInActive ? '#f3f3f3' : '#f3f3f3',
            paddingBottom: Platform.OS === 'android' ? Math.max(0, insets.bottom) : insets.bottom,
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            paddingHorizontal: 10,
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

      {/* Conditional tabs based on user role */}
      {userRole === 'ADMIN' ? (
        <>
          <Tab.Screen
            name="Events"
            options={{ 
              headerShown: false, 
              unmountOnBlur: true,
              statusBarStyle: 'dark',
              statusBarBackgroundColor: 'white',
              statusBarTranslucent: false
            }}
          >
            {() => <EventsScreen eventInfo={eventInformation} onEventChange={handleEventChange} />}
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
            name="Services"
            options={{ 
              headerShown: false, 
              unmountOnBlur: true,
              statusBarStyle: 'dark',
              statusBarBackgroundColor: 'white',
              statusBarTranslucent: false
            }}
          >
            {() => <ServicesScreen />}
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
        </>
      ) : (
        <>
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
        </>
      )}
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
