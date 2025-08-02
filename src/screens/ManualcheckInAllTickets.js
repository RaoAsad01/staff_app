import { View, Text, StyleSheet, StatusBar, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Header from '../../components/header';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ticketService } from '../api/apiService'; // Import your ticket service
import CheckInAllPopup from '../constants/checkInAllPopupticketList'; // Correct import path
import SuccessPopup from '../constants/SuccessPopup';
import ErrorPopup from '../constants/ErrorPopup';

const ManualCheckInAllTickets = () => {
    const route = useRoute();
    const { orderNumber, eventUuid, total, eventInfo } = route.params;
    const navigation = useNavigation();
    const [ticketDetails, setTicketDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [isCheckingIn, setIsCheckingIn] = useState(false); // State for loading during check-in
    const [checkInSuccess, setCheckInSuccess] = useState(false); // State to show success
    const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State to control success popup
    const [showErrorPopup, setShowErrorPopup] = useState(false); // State to control error popup
    useEffect(() => {
        const fetchTicketDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await ticketService.fetchUserTicketOrdersDetail(orderNumber, eventUuid);
                console.log('Ticket Details Response:', response);
                if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                    setTicketDetails(response.data);

                    // Check if the first ticket is already scanned, and set the success state accordingly
                    const isScanned = response.data.some(ticket => ticket.checkin_status === 'SCANNED');
                    setCheckInSuccess(isScanned);

                    setUserDetails({
                        email: response.data[0]?.user_email || 'N/A',
                        firstName: response.data[0]?.user_first_name || '',
                        lastName: response.data[0]?.user_last_name || '',
                        fullName: `${response.data[0]?.user_first_name || ''} ${response.data[0]?.user_last_name || ''}`.trim() || 'N/A',
                    });
                } else if (response?.data && Array.isArray(response.data) && response.data.length === 0) {
                    //setError('No tickets found for this order.');
                    setTicketDetails([]);
                    setUserDetails(null);
                    setShowErrorPopup(true);
                } else {
                    //setError('Invalid ticket details response.');
                    setTicketDetails(null);
                    setUserDetails(null);
                    setShowErrorPopup(true);
                }
            } catch (err) {
                //setError(err.message || 'Failed to fetch ticket details.');
                setShowErrorPopup(true);
                console.error('Error fetching ticket details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (orderNumber && eventUuid) {
            fetchTicketDetails();
        } else {
            //setError('Order Number or Event UUID not provided.');
            setLoading(false);
            setShowErrorPopup(true);
        }
    }, [orderNumber, eventUuid]); // You can add checkInSuccess as a dependency if you want to control state updates



    const handleSingleCheckIn = async () => {
        if (total === 1 && ticketDetails.length === 1) {
            setIsCheckingIn(true);
            setError(null);
            const ticket = ticketDetails[0];
            console.log('Attempting to check-in ticket with UUID:', eventInfo.eventUuid, 'and Code:', ticket.code);
            try {
                const response = await ticketService.manualDetailCheckin(eventInfo.eventUuid, ticket.code);
                console.log('Full Single Ticket Check-in Response:', JSON.stringify(response, null, 2)); // Log the entire response

                if (response?.data?.status === 'SCANNED') { // Adjust based on your actual response structure
                    console.log('Check-in successful according to response.');
                    setCheckInSuccess(true);
                    setShowSuccessPopup(true);
                    setTicketDetails([{ ...ticket, checkin_status: 'Scanned' }]);

                    // Update scan count when ticket is successfully checked in
                    if (route.params?.onScanCountUpdate) {
                        route.params.onScanCountUpdate();
                    }
                } else {
                    console.log('Check-in failed according to response. Status:', response?.data?.status);
                    setShowErrorPopup(true);
                }
            } catch (err) {
                console.error('Single Ticket Check-in Error:', err);
                //setError(err.message || 'Failed to check in ticket.');
                setShowErrorPopup(true);
            } finally {
                setIsCheckingIn(false);
            }
        }
    };

    // Add handleTicketStatusChange function
    const handleTicketStatusChange = (ticketUuid, newStatus) => {
        setTicketDetails(prevTickets =>
            prevTickets.map(ticket =>
                ticket.uuid === ticketUuid
                    ? { ...ticket, checkin_status: newStatus }
                    : ticket
            )
        );
    };

    const handleCloseSuccessPopup = () => {
        setShowSuccessPopup(false);
    };

    const handleCloseErrorPopup = () => {
        setShowErrorPopup(false);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <Header eventInfo={eventInfo} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <Header eventInfo={eventInfo} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!ticketDetails || ticketDetails.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <Header eventInfo={eventInfo} />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No ticket details found for this order.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <Header eventInfo={eventInfo} />
            <View style={styles.wrapper}>
                <View style={styles.popUp}>
                    <SvgIcons.successBrownSVG width={81} height={80} fill="transparent" style={styles.successImageIcon} />
                    <Text style={styles.ticketHolder}>Ticket Holder</Text>
                    <Text style={styles.userEmail}>{userDetails?.email}</Text>

                    {total === 1 && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSingleCheckIn}
                            disabled={isCheckingIn || checkInSuccess}
                        >
                            {isCheckingIn ? (
                                <ActivityIndicator color={color.btnTxt_FFF6DF} />
                            ) : checkInSuccess ? (
                                <Text style={styles.buttonText}>Scanned</Text>
                            ) : (
                                <Text style={styles.buttonText}>Check-In</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {total > 1 && ticketDetails.length > 0 && (
                    <View style={styles.ticketsList}>
                        <CheckInAllPopup
                            ticketslist={ticketDetails.map(ticket => ({
                                order_number: ticket.ticket_number,
                                type: ticket.ticket_type,
                                price: ticket.ticket_price,
                                date: ticket.date,
                                status: ticket.checkin_status,
                                code: ticket.code,
                                note: ticket.note,
                                uuid: ticket.uuid,
                                eventUuid: eventInfo.eventUuid,
                                message: ticket.message,
                                last_scanned_on: ticket.last_scanned_on,
                                scanCount: ticket.scan_count,
                                ticketHolder: ticket.ticket_holder,
                                lastScannedByName: ticket.last_scanned_by_name,
                                currency: ticket.currency,
                                eventInfo: eventInfo,
                                ticket_number: ticket.ticket_number,
                            }))}
                            onTicketStatusChange={handleTicketStatusChange}
                            onScanCountUpdate={route.params?.onScanCountUpdate}
                        />
                    </View>
                )}
            </View>
            <SuccessPopup
                visible={showSuccessPopup}
                onClose={handleCloseSuccessPopup}
                title="Check-In Successful"
                subtitle={total === 1 ? "Ticket checked in successfully" : "Tickets checked in successfully"}
            />
            <ErrorPopup
                visible={showErrorPopup}
                onClose={handleCloseErrorPopup}
                title="Check-In Failed"
                subtitle="We couldn’t check in this ticket. Please try again
or contact support."
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    wrapper: {
        flex: 1,
        paddingHorizontal: 10,
    },
    popUp: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        width: '100%',
        marginTop: 10,
    },
    button: {
        backgroundColor: color.btnBrown_AE6F28,
        width: '100%',
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: color.btnBrown_AE6F28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: color.btnTxt_FFF6DF,
        fontSize: 16,
        fontWeight: 'bold',
    },
    ticketHolder: {
        color: color.brown_3C200A,
        fontSize: 14,
        marginTop: 20,
        fontWeight: '400'
    },
    ticketsList: {
        marginTop: 20,
        flex: 1,
    },
    userEmail: {
        color: color.brown_3C200A,
        fontSize: 16,
        marginTop: 10,
        fontWeight: '500'
    },
    successImageIcon: {
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999999',
    },
});

export default ManualCheckInAllTickets;