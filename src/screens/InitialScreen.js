import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { color } from '../color/color';
import { eventService } from '../api/apiService';

/**
 * InitialScreen - Handles app launch routing logic
 * This is the launcher screen that determines where to navigate on app start
 */
const InitialScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            // Check if user has seen onboarding
            const hasSeenOnboarding = await SecureStore.getItemAsync('hasSeenOnboarding');

            // Check if user has auth token
            const token = await SecureStore.getItemAsync('accessToken');

            // First time user - show onboarding
            if (!hasSeenOnboarding) {
                navigation.replace('Splash');
                return;
            }

            // User has seen onboarding
            if (token) {
                // User is logged in - go directly to home screen

                try {
                    // Try to get the last selected event
                    const lastEventUuid = await SecureStore.getItemAsync('lastSelectedEventUuid');

                    if (lastEventUuid) {
                        // Fetch event info for the last selected event
                        const eventInfoData = await eventService.fetchEventInfo(lastEventUuid);

                        navigation.replace('LoggedIn', {
                            eventInfo: {
                                staff_name: eventInfoData?.data?.staff_name,
                                event_title: eventInfoData?.data?.event_title,
                                cityName: eventInfoData?.data?.location?.city,
                                date: eventInfoData?.data?.start_date,
                                time: eventInfoData?.data?.start_time,
                                userId: eventInfoData?.data?.staff_id,
                                scanCount: eventInfoData?.data?.scan_count,
                                event_uuid: eventInfoData?.data?.location?.uuid,
                                eventUuid: lastEventUuid
                            },
                        });
                    } else {
                        // No last event, just go to logged in screen
                        navigation.replace('LoggedIn');
                    }
                } catch (eventError) {
                    // Still navigate to logged in screen even if event fetch fails
                    navigation.replace('LoggedIn');
                }
            } else {
                // No token - go to login
                navigation.replace('Login');
            }
        } catch (error) {
            // On error, default to login screen
            navigation.replace('Login');
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default InitialScreen;

