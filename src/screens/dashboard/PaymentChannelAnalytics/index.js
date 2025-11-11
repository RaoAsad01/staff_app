import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnalyticsChart from '../AnalyticsChart';
import { color } from '../../../color/color';
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

    // Determine the default analytics dataset (Sold analytics baseline)
    const defaultSoldAnalytics = useMemo(() => {
        if (stats?.data?.sold_tickets_analytics?.data && typeof stats.data.sold_tickets_analytics.data === 'object') {
            return stats.data.sold_tickets_analytics.data;
        }

        if (stats?.data?.box_office_sales?.sold_tickets_analytics?.data && typeof stats.data.box_office_sales.sold_tickets_analytics.data === 'object') {
            return stats.data.box_office_sales.sold_tickets_analytics.data;
        }

        return null;
    }, [stats]);

    // Fallback to previous payment analytics data if sold analytics are unavailable
    const fallbackPaymentAnalytics = useMemo(() => {
        if (stats?.data?.payment_channel_analytics?.data && typeof stats.data.payment_channel_analytics.data === 'object') {
            return stats.data.payment_channel_analytics.data;
        }

        if (stats?.data?.payment_analytics?.data && typeof stats.data.payment_analytics.data === 'object') {
            return stats.data.payment_analytics.data;
        }

        if (stats?.data?.box_office_sales?.payment_analytics?.data && typeof stats.data.box_office_sales.payment_analytics.data === 'object') {
            return stats.data.box_office_sales.payment_analytics.data;
        }

        if (stats?.data?.box_office_sales?.payment_channel_analytics?.data && typeof stats.data.box_office_sales.payment_channel_analytics.data === 'object') {
            return stats.data.box_office_sales.payment_channel_analytics.data;
        }

        return null;
    }, [stats]);

    // Get the backend parameter for the selected payment channel
    const paymentChannelParam = selectedPaymentChannel ? paymentChannelMapping[selectedPaymentChannel] : null;

    // Fetch analytics data when payment channel is selected
    useEffect(() => {
        const fetchPaymentChannelAnalytics = async () => {
            console.log('PaymentChannelAnalytics useEffect triggered with:', {
                eventInfo: eventInfo?.eventUuid,
                selectedPaymentChannel,
                paymentChannelParam,
                userRole,
                staffUuid
            });

            if (!eventInfo?.eventUuid || !selectedPaymentChannel || !paymentChannelParam) {
                setAnalyticsData(null);
                return;
            }

            try {
                setError(null);
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

                const response = await ticketService.fetchDashboardStats(
                    eventInfo.eventUuid, 
                    salesParam, 
                    null, 
                    null, 
                    staffUuidParam, 
                    paymentChannelParam
                );
                // Extract analytics data from response
                // The backend returns payment_channel_analytics.data for the specific payment channel
                const newAnalyticsData = response?.data?.payment_channel_analytics?.data ||
                                      response?.data?.payment_analytics?.data ||
                                      response?.data?.box_office_sales?.payment_analytics?.data ||
                                      response?.data?.box_office_sales?.payment_channel_analytics?.data ||
                                      null;

                setAnalyticsData(newAnalyticsData);
            } catch (err) {
                setError(err.message || 'Failed to fetch payment channel analytics');
                setAnalyticsData(null);
            }
        };

        fetchPaymentChannelAnalytics();
    }, [selectedPaymentChannel, paymentChannelParam, eventInfo?.eventUuid, userRole, staffUuid, stats]);
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

    const resolvedAnalyticsSource = useMemo(() => {
        if (paymentChannelParam && analyticsData && typeof analyticsData === 'object') {
            return analyticsData;
        }

        if (defaultSoldAnalytics && typeof defaultSoldAnalytics === 'object') {
            return defaultSoldAnalytics;
        }

        return fallbackPaymentAnalytics;
    }, [paymentChannelParam, analyticsData, defaultSoldAnalytics, fallbackPaymentAnalytics]);

    if (paymentChannelParam && selectedPaymentChannel) {
        
        if (resolvedAnalyticsSource && typeof resolvedAnalyticsSource === 'object') {
            // Convert the time-based data to chart format
            chartData = Object.entries(resolvedAnalyticsSource).map(([time, value]) => ({
                time: formatTimeLabel(time),
                value: parseFloat(value) || 0
            }));
        } else {
            console.log('No analytics data available for selected payment channel');
        }
    } else {
        // Show aggregated data for all channels (fallback to initial stats)
        if (resolvedAnalyticsSource && typeof resolvedAnalyticsSource === 'object') {
            chartData = Object.entries(resolvedAnalyticsSource).map(([time, value]) => ({
                time: formatTimeLabel(time),
                value: parseFloat(value) || 0
            }));
        }
    }

    // Sort by time
    // chartData.sort((a, b) => {
    //     const timeA = parseTime(a.time);
    //     const timeB = parseTime(b.time);
    //     return timeA - timeB;
    // });

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
                title={selectedPaymentChannel ? `${selectedPaymentChannel} Payment` : 'Payment Channel'}
                data={chartData}
                dataType={selectedPaymentChannel && paymentChannelParam ? 'payment' : 'sold'}
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
