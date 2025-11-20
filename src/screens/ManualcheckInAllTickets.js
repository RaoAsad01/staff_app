import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Header from '../../components/header';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ticketService } from '../api/apiService'; // Import your ticket service
import CheckInAllPopup from '../constants/checkInAllPopupticketList'; // Correct import path
import SuccessPopup from '../constants/SuccessPopup';
import ErrorPopup from '../constants/ErrorPopup';
import Typography from '../components/Typography';
import { formatDateTime } from '../constants/dateAndTime';
import { truncateStaffName } from '../utils/stringUtils';

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
                console.log('Ticket Details Response:', JSON.stringify(response, null, 2));
                if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                    console.log('📋First ticket data:', response.data[0]);
                    console.log('📋Scanned by:', response.data[0]?.scanned_by);
                    setTicketDetails(response.data);

                    // Check if the first ticket is already scanned, and set the success state accordingly
                    const isScanned = response.data.some(ticket => ticket.checkin_status === 'SCANNED');
                    setCheckInSuccess(isScanned);

                    setUserDetails({
                        purchaseDate: response.data[0]?.formatted_date,
                        name: `${response.data[0]?.user_first_name || ''} ${response.data[0]?.user_last_name || ''}`.trim() || 'No Record',
                        email: response.data[0]?.user_email || 'No Record',
                        firstName: response.data[0]?.user_first_name || '',
                        lastName: response.data[0]?.user_last_name || '',
                        fullName: `${response.data[0]?.user_first_name || ''} ${response.data[0]?.user_last_name || ''}`.trim() || 'No Record',
                        category: response.data[0]?.category || 'No Record',
                        ticketClass: response.data[0]?.ticket_class || 'No Record',
                        scannedBy: response.data[0]?.scanned_by?.name || 'No Record',
                        staffId: response.data[0]?.scanned_by?.staff_id || 'No Record',
                        scannedOn: response.data[0]?.scanned_by?.scanned_on || 'No Record',
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
                    console.log('Response scanned_by:', response?.data?.scanned_by);
                    console.log('Response scanned_by.name:', response?.data?.scanned_by?.name);
                    console.log('Response scanned_by.staff_id:', response?.data?.scanned_by?.staff_id);
                    console.log('Response scan_count:', response?.data?.scan_count);
                    console.log('Response last_scanned_on:', response?.data?.last_scanned_on);
                    console.log('Response last_scanned_by_name:', response?.data?.last_scanned_by_name);
                    console.log('Full response.data keys:', Object.keys(response?.data || {}));
                    console.log('Response scanned_by.scanned_on:', response?.data?.scanned_by?.scanned_on);

                    setCheckInSuccess(true);
                    setShowSuccessPopup(true);

                    // Extract scanned_by information from check-in response
                    const scannedByFromResponse = response?.data?.scanned_by;
                    console.log('Manual Check-in - scanned_by from response:', scannedByFromResponse);

                    // Update ticket details with all relevant fields from the response
                    const updatedTicket = {
                        ...ticket,
                        checkin_status: 'SCANNED',
                        scan_count: response?.data?.scan_count || (ticket.scan_count ? ticket.scan_count + 1 : 1),
                        last_scanned_on: scannedByFromResponse?.scanned_on || response?.data?.last_scanned_on || new Date().toISOString(),
                        last_scanned_by_name: scannedByFromResponse?.name || ticket.last_scanned_by_name,
                        scanned_on: scannedByFromResponse?.scanned_on || 'No Record',
                    };

                    // Map scanned_by object from response (full object with name and staff_id)
                    if (scannedByFromResponse) {
                        updatedTicket.scanned_by = {
                            name: scannedByFromResponse.name || 'No Record',
                            staff_id: scannedByFromResponse.staff_id || 'No Record',
                            scanned_on: scannedByFromResponse?.scanned_on || 'No Record',
                        };
                    }

                    setTicketDetails([updatedTicket]);

                    // Update scan count when ticket is successfully checked in
                    if (route.params?.onScanCountUpdate) {
                        route.params.onScanCountUpdate();
                    }

                    // Optionally refetch ticket details to get updated server data
                    try {
                        const updatedResponse = await ticketService.fetchUserTicketOrdersDetail(orderNumber, eventUuid);
                        if (updatedResponse?.data && Array.isArray(updatedResponse.data) && updatedResponse.data.length > 0) {
                            console.log(' Refetched ticket data after check-in:', updatedResponse.data[0]);
                            setTicketDetails(updatedResponse.data);
                        }
                    } catch (refetchError) {
                        console.warn('Could not refetch ticket details:', refetchError);
                        // Continue anyway, as we already have the updated data from check-in response
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
    const handleTicketStatusChange = (ticketUuid, newStatus, scannedByInfo = null) => {
        setTicketDetails(prevTickets =>
            prevTickets.map(ticket =>
                ticket.uuid === ticketUuid
                    ? {
                        ...ticket,
                        checkin_status: newStatus,
                        scanned_by: scannedByInfo ? {
                            name: scannedByInfo.name || ticket.scanned_by?.name || 'No Record',
                            staff_id: scannedByInfo.staff_id || ticket.scanned_by?.staff_id || 'No Record',
                            scanned_on: scannedByInfo?.scanned_on || ticket.scanned_by?.scanned_on || 'No Record',
                        } : ticket.scanned_by
                    }
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
                <Header eventInfo={eventInfo} />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No ticket details found for this order.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header eventInfo={eventInfo} />
            <View style={styles.wrapper}>
                <View style={styles.popUp}>
                    <SvgIcons.successBrownSVG width={81} height={80} fill="transparent" style={styles.successImageIcon} />
                    <Text style={styles.userName}>{userDetails?.name}</Text>
                    {/* <Text style={styles.ticketHolder}>Ticket Holder</Text> */}
                    <Text style={styles.ticketHolder}>{userDetails?.email}</Text>
                    <Text style={styles.ticketPurchaseDate}>Purchase Date: {userDetails?.purchaseDate}</Text>
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

                {/* Show ticket details for single ticket */}
                {total === 1 && ticketDetails.length === 1 && (
                    <View style={styles.ticketContainer}>
                        <View style={styles.row}>
                            <View style={styles.leftColumnContent}>
                                <Text style={styles.values}>Category</Text>
                                <Typography
                                    style={[styles.value, styles.marginTop10]}
                                    weight="400"
                                    size={14}
                                    color={color.brown_3C200A}
                                >
                                    {ticketDetails[0]?.category || 'No Record'}
                                </Typography>
                                <Text style={[styles.values, styles.marginTop10]}>Class</Text>
                                <Typography
                                    style={[styles.value, styles.marginTop10]}
                                    weight="400"
                                    size={14}
                                    color={color.brown_3C200A}
                                >
                                    {ticketDetails[0]?.ticket_class || 'No Record'}
                                </Typography>
                                <Text style={[styles.values, styles.marginTop10]}>Ticket ID</Text>
                                <Text style={[styles.ticketNumber, styles.marginTop10]}>{ticketDetails[0]?.ticket_number || 'No Record'}</Text>
                                <Text style={[styles.values]}>Last Scanned On</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop10]}>{formatDateTime(ticketDetails[0]?.scanned_by?.scanned_on) || 'No Record'}</Text>
                            </View>
                            <View style={styles.rightColumnContent}>
                                <Text style={styles.values}>Scanned By</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop8]}>
                                    {truncateStaffName(ticketDetails[0]?.scanned_by?.name) || 'No Record'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Staff ID</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop8]}>
                                    {ticketDetails[0]?.scanned_by?.staff_id || 'No Record'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Price</Text>
                                <Text style={[styles.value, styles.marginTop10]}>
                                    {ticketDetails[0]?.currency || 'GHS'} {ticketDetails[0]?.ticket_price || 'No Record'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Scan Count</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop9]}>{ticketDetails[0]?.scan_count || 'No Record'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Note section for single ticket */}
                {total === 1 && ticketDetails.length === 1 && (
                    <View style={styles.noteContainer}>
                        <Text style={styles.LabelNote}>Note</Text>
                        <Text style={styles.noteDescription}>{ticketDetails[0]?.note || 'No note added'}</Text>
                    </View>
                )}

                {total > 1 && ticketDetails.length > 0 && (
                    <View style={styles.ticketsList}>
                        <CheckInAllPopup
                            ticketslist={ticketDetails.map(ticket => ({
                                order_number: ticket.ticket_number,
                                type: ticket.ticket_type,
                                price: ticket.ticket_price,
                                date: ticket.formatted_date,
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
                                name: `${ticket.user_first_name || ''} ${ticket.user_last_name || ''}`.trim() || 'No Record',
                                category: ticket.category || 'No Record',
                                ticketClass: ticket.ticket_class || 'No Record',
                                scanned_by: ticket.scanned_by,
                                scanned_on: ticket.scanned_by?.scanned_on || 'No Record',
                            }))}
                            onTicketStatusChange={handleTicketStatusChange}
                            onScanCountUpdate={route.params?.onScanCountUpdate}
                            userEmail={userDetails?.email}
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
        marginTop: 16,
        marginBottom: -4,
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
        color: color.placeholderTxt_24282C,
        fontSize: 14,
        marginTop: 10,
        fontWeight: '400'
    },
    ticketPurchaseDate: {
        color: color.black_544B45,
        fontSize: 14,
        marginTop: 10,
        fontWeight: '400'
    },
    ticketsList: {
        marginTop: 20,
        flex: 1,
    },
    userName: {
        color: color.placeholderTxt_24282C,
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
    ticketContainer: {
        borderWidth: 1,
        borderColor: color.white_FFFFFF,
        borderRadius: 10,
        backgroundColor: color.white_FFFFFF,
        padding: 16,
        marginTop: 15,
        marginBottom: 6,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftColumnContent: {
        width: '58%',
        alignItems: 'flex-start',
    },
    rightColumnContent: {
        width: '50%',
        alignItems: 'flex-start',
        paddingLeft: 50,
    },
    values: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D
    },
    value: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
    },
    valueScanCount: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
    },
    ticketNumber: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
        marginBottom: 10,
    },
    marginTop10: {
        marginTop: 10,
    },
    marginTop9: {
        marginTop: 9,
    },
    marginTop8: {
        marginTop: 8,
    },
    noteContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: color.brown_F7E4B6,
        borderRadius: 10,
        backgroundColor: color.brown_F7E4B6,
        paddingHorizontal: 16,
        paddingVertical: 5,
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
    },
    LabelNote: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D
    },
    noteDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: color.brown_766F6A,
        opacity: 0.7,
        marginTop: 5
    },
});

export default ManualCheckInAllTickets;