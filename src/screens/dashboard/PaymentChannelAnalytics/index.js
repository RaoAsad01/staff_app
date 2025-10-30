import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnalyticsChart from '../AnalyticsChart';
import { color } from '../../../color/color';
import { formatValue } from '../../../constants/formatValue';
import { ticketService } from '../../../api/apiService';

const PaymentChannelAnalytics = ({ stats, selectedPaymentChannel, eventInfo, userRole, staffUuid }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [error, setError] = useState(null);

    // Map payment channel labels to backend parameter values (UPPER CASE only)
    const paymentChannelMapping = {
        "Cash": "CASH",
        "Card": "CARD", 
        "MoMo": "MOBILE_MONEY",
        "Mobile Money": "MOBILE_MONEY",
        "P.O.S.": "POS",
        "POS": "POS",
        "Wallet": "WALLET",
        "Bank Transfer": "BANK_TRANSFER",
        "Free": "FREE"
    };

    // Get the backend parameter for the selected payment channel
    const paymentChannelParam = selectedPaymentChannel ? paymentChannelMapping[selectedPaymentChannel] : null;
    
    console.log('📊 PaymentChannelAnalytics - Selected Channel:', selectedPaymentChannel);
    console.log('📊 PaymentChannelAnalytics - Payment Channel Param:', paymentChannelParam);
    console.log('📊 PaymentChannelAnalytics - Staff UUID:', staffUuid);

    // Fetch analytics data when payment channel is selected
    useEffect(() => {
        const fetchPaymentChannelAnalytics = async () => {
            console.log('📊 PaymentChannelAnalytics useEffect triggered with:', {
                eventInfo: eventInfo?.eventUuid,
                selectedPaymentChannel,
                paymentChannelParam,
                userRole,
                staffUuid
            });

            if (!eventInfo?.eventUuid || !selectedPaymentChannel || !paymentChannelParam) {
                console.log('📊 Missing required data, using initial stats data');
                // Reset to initial stats data if no selection
                const initialData = stats?.data?.payment_channel_analytics?.data ||
                                  stats?.data?.payment_analytics?.data ||
                                  stats?.data?.box_office_sales?.payment_analytics?.data ||
                                  stats?.data?.box_office_sales?.payment_channel_analytics?.data ||
                                  null;
                console.log('📊 Initial data from stats:', initialData);
                
                // If no initial data, show empty object to prevent component from disappearing
                if (initialData && Object.keys(initialData).length > 0) {
                    setAnalyticsData(initialData);
                } else {
                    setAnalyticsData({});
                }
                return;
            }

            try {
                setError(null);
                
                console.log('📊 Fetching payment channel analytics for:', paymentChannelParam);
                console.log('📊 Event UUID:', eventInfo.eventUuid);
                console.log('📊 User Role:', userRole);
                
                // Determine sales parameter based on user role
                let salesParam = null;
                let staffUuidParam = null;
                
                if (userRole === 'ADMIN') {
                    salesParam = 'box_office'; // For admin, get box office data
                } else if (userRole === 'STAFF') {
                    salesParam = 'box_office'; // For staff, get box office data
                    staffUuidParam = staffUuid; // Pass staff UUID for staff-specific data
                } else if (userRole === 'ORGANIZER') {
                    salesParam = null; // For organizer, get all data
                }

                console.log('📊 Sales parameter:', salesParam);
                console.log('📊 Staff UUID parameter:', staffUuidParam);

                const response = await ticketService.fetchDashboardStats(
                    eventInfo.eventUuid, 
                    salesParam, 
                    null, 
                    null, 
                    staffUuidParam, 
                    paymentChannelParam
                );

                console.log('📊 Payment Channel Analytics Response:', JSON.stringify(response, null, 2));
                console.log('📊 Response data keys:', Object.keys(response?.data || {}));

                // Extract analytics data from response
                // The backend returns payment_channel_analytics.data for the specific payment channel
                const newAnalyticsData = response?.data?.payment_channel_analytics?.data ||
                                      response?.data?.payment_analytics?.data ||
                                      response?.data?.box_office_sales?.payment_analytics?.data ||
                                      response?.data?.box_office_sales?.payment_channel_analytics?.data ||
                                      null;

                console.log('📊 Extracted analytics data:', newAnalyticsData);
                console.log('📊 Analytics data keys:', Object.keys(newAnalyticsData || {}));

                setAnalyticsData(newAnalyticsData);
            } catch (err) {
                console.error('❌ Error fetching payment channel analytics:', err);
                console.error('❌ Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError(err.message || 'Failed to fetch payment channel analytics');
                // Fall back to initial stats data
                const initialData = stats?.data?.payment_channel_analytics?.data ||
                                  stats?.data?.payment_analytics?.data ||
                                  stats?.data?.box_office_sales?.payment_analytics?.data ||
                                  stats?.data?.box_office_sales?.payment_channel_analytics?.data ||
                                  null;
                console.log('📊 Fallback to initial data:', initialData);
                setAnalyticsData(initialData);
            }
        };

        fetchPaymentChannelAnalytics();
    }, [selectedPaymentChannel, paymentChannelParam, eventInfo?.eventUuid, userRole, staffUuid, stats]);

    console.log('📊 PaymentChannelAnalytics - Analytics Data:', JSON.stringify(analyticsData, null, 2));
    
    // Debug initial stats data
    console.log('📊 PaymentChannelAnalytics - Initial Stats Debug:');
    console.log('📊 stats?.data keys:', Object.keys(stats?.data || {}));
    console.log('📊 payment_analytics:', stats?.data?.payment_analytics);
    console.log('📊 payment_channel_analytics:', stats?.data?.payment_channel_analytics);
    console.log('📊 box_office_sales keys:', Object.keys(stats?.data?.box_office_sales || {}));
    console.log('📊 box_office_sales.payment_analytics:', stats?.data?.box_office_sales?.payment_analytics);
    console.log('📊 box_office_sales.payment_channel_analytics:', stats?.data?.box_office_sales?.payment_channel_analytics);
    console.log('📊 selectedPaymentChannel:', selectedPaymentChannel);
    console.log('📊 paymentChannelParam:', paymentChannelParam);
    console.log('📊 userRole:', userRole);


    // Show error state
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.wrapper}>
                    <Text style={styles.heading}>
                        {selectedPaymentChannel ? `${selectedPaymentChannel} Payment Analytics` : 'Payment Channel Analytics'}
                    </Text>
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>Error: {error}</Text>
                    </View>
                </View>
            </View>
        );
    }

    // Get data for selected payment channel or all channels
    let chartData = [];

    if (selectedPaymentChannel && paymentChannelParam) {
        // When a payment channel is selected, the backend returns data filtered for that channel
        // The data is directly in analyticsData (no need to look for channel-specific keys)
        console.log('📊 Processing payment channel analytics data for:', selectedPaymentChannel);
        console.log('📊 Analytics data structure:', analyticsData);
        
        if (analyticsData && typeof analyticsData === 'object') {
            // Convert the time-based data to chart format
            chartData = Object.entries(analyticsData).map(([time, value]) => ({
                time: formatTimeLabel(time),
                value: parseFloat(value) || 0
            }));
            console.log('📊 Channel-specific chart data:', chartData);
        } else {
            console.log('📊 No analytics data available for selected payment channel');
        }
    } else {
        // Show aggregated data for all channels (fallback to initial stats)
        console.log('📊 No payment channel selected, using initial stats data');
        if (analyticsData && typeof analyticsData === 'object') {
            chartData = Object.entries(analyticsData).map(([time, value]) => ({
                time: formatTimeLabel(time),
                value: parseFloat(value) || 0
            }));
        }
    }

    // Sort by time
    chartData.sort((a, b) => {
        const timeA = parseTime(a.time);
        const timeB = parseTime(b.time);
        return timeA - timeB;
    });

    // If no chart data, provide empty data to prevent AnalyticsChart from showing error
    if (chartData.length === 0) {
        chartData = [
            { time: "12am", value: 0 },
            { time: "6am", value: 0 },
            { time: "12pm", value: 0 },
            { time: "6pm", value: 0 }
        ];
    }

    return (
        <View style={styles.container}>
            <AnalyticsChart
                title={selectedPaymentChannel ? `${selectedPaymentChannel} Payment Analytics` : 'Payment Channel Analytics'}
                data={chartData}
                dataType="payment"
            />
        </View>
    );
};

// Helper function to format time labels
const formatTimeLabel = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return timeStr;
    
    // Handle formats like "12:00 PM" or "12pm"
    if (timeStr.includes(':00 ')) {
        const [time, period] = timeStr.split(' ');
        const [hours] = time.split(':');
        return `${hours}${period.toLowerCase()}`;
    }
    
    return timeStr;
};

// Helper function to parse time for sorting
const parseTime = (timeStr) => {
    const cleanTime = timeStr.replace(/[^\d:]/g, '');
    const [hours, minutes] = cleanTime.split(':').map(Number);
    return hours * 60 + (minutes || 0);
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 2,
        marginVertical: 2
    },
    wrapper: {
        backgroundColor: color.white_FFFFFF,
        borderColor: color.white_FFFFFF,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
    },
    heading: {
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 16,
        color: color.placeholderTxt_24282C,
        alignSelf: "flex-start",
    },
    noDataContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    noDataText: {
        fontSize: 14,
        color: color.brown_766F6A,
        textAlign: "center",
    },
});

export default PaymentChannelAnalytics;
