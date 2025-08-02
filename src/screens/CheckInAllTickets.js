import { View, Text, StyleSheet, StatusBar, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import React, { useState } from 'react';
import Header from '../../components/header';
import { color } from '../color/color';
import CheckInAllPopUp from '../constants/checkInAllPopupticketList';
import SvgIcons from '../../components/SvgIcons';
import { ticketService } from '../api/apiService';
import { useNavigation } from '@react-navigation/native';
import SuccessPopup from '../constants/SuccessPopup';
import ErrorPopup from '../constants/ErrorPopup';

const CheckInAllTickets = ({ route }) => {
    const { totalTickets, email, orderData, eventInfo } = route.params;
    const initialTickets = orderData?.data?.data || [];
    const [tickets, setTickets] = useState(initialTickets);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkInSuccess, setCheckInSuccess] = useState(false);
    const navigation = useNavigation();
    const [error, setError] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const extractResponse = tickets[0];
    const code = extractResponse?.code;
    const eventUuid = extractResponse?.event;
    const orderNumber = extractResponse?.order_number;
    const ticketNumber = extractResponse?.ticket_number;

    const handleSingleCheckIn = async () => {
        if (totalTickets === 1) {
            setIsCheckingIn(true);
            setError(null);
            try {
                const response = await ticketService.manualDetailCheckin(eventUuid, code);
                console.log('Single Ticket Check-in Response:', response);

                if (response?.data?.status === 'SCANNED') {
                    setCheckInSuccess(true);
                    setShowSuccessPopup(true);
                    // Update the ticket status
                    setTickets([{ ...tickets[0], checkin_status: 'SCANNED', status: 'SCANNED' }]);

                    // Update scan count when ticket is successfully checked in
                    if (route.params?.onScanCountUpdate) {
                        route.params.onScanCountUpdate();
                    }
                } else {
                    setShowErrorPopup(true);
                }
            } catch (err) {
                console.error('Single Ticket Check-in Error:', err);
                setError(err.message || 'Failed to check in ticket.');
                setShowErrorPopup(true);
            } finally {
                setIsCheckingIn(false);
            }
        }
    };

    const handleCheckInAll = async () => {
        if (totalTickets > 1) {
            setIsCheckingIn(true);
            setError(null);
            try {
                const response = await ticketService.boxOfficeDetailCheckinAll(eventUuid, orderNumber);
                console.log('Check-in All Response:', response);

                if (response?.success && response?.status === 200) {
                    setCheckInSuccess(true);
                    setShowSuccessPopup(true);
                    // Update all tickets in the list to show as scanned using state
                    const updatedTickets = tickets.map(ticket => ({
                        ...ticket,
                        checkin_status: 'SCANNED',
                        status: 'SCANNED'
                    }));
                    setTickets(updatedTickets);

                    // Update scan count when tickets are successfully checked in
                    if (route.params?.onScanCountUpdate) {
                        route.params.onScanCountUpdate();
                    }
                } else {
                    setShowErrorPopup(true);
                }
            } catch (err) {
                console.error('Check-in All Error:', err);
                setError(err.message || 'Failed to check in all tickets.');
                setShowErrorPopup(true);
            } finally {
                setIsCheckingIn(false);
            }
        }
    };

    const handleTicketStatusChange = (ticketUuid, newStatus) => {
        setTickets(prevTickets =>
            prevTickets.map(ticket =>
                ticket.uuid === ticketUuid
                    ? { ...ticket, status: newStatus, checkin_status: newStatus }
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <Header eventInfo={eventInfo} />
            <View style={styles.wrapper}>
                <View style={styles.popUp}>
                    {totalTickets > 1 && <Text style={styles.labeltickets}>Ticket(s) Purchased</Text>}
                    <SvgIcons.successBrownSVG width={81} height={80} fill="transparent" style={styles.successImageIcon} />
                    <Text style={styles.ticketHolder}>Ticket Holder</Text>
                    <Text style={styles.ticketHolder}>#{orderNumber}</Text>
                    <Text style={styles.userEmail}>{email}</Text>

                    <TouchableOpacity
                        style={[styles.button, checkInSuccess && styles.button]}
                        onPress={totalTickets === 1 ? handleSingleCheckIn : handleCheckInAll}
                        disabled={isCheckingIn || checkInSuccess}
                    >
                        <Text style={styles.buttonText}>
                            {checkInSuccess ? 'Scanned' :
                                totalTickets === 1 ? 'Check-In' : 'Check-In All'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Ticket List Section */}
                {totalTickets > 1 && (
                    <View style={styles.ticketsList}>
                        <CheckInAllPopUp
                            ticketslist={tickets.map(ticket => ({
                                order_number: ticket.order_number,
                                type: ticket.ticket_type,
                                price: ticket.ticket_price,
                                date: ticket.date,
                                status: ticket.status || ticket.checkin_status,
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
                                eventUuid: ticket.event,
                                ticket_number: ticket.ticket_number
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
                subtitle={totalTickets === 1 ? "Ticket checked in successfully" : "Tickets checked in successfully"}
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    wrapper: {
        flex: 1,
        paddingHorizontal: 20,
    },
    popUp: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: color.white_FFFFFF,
        borderRadius: 15,
        width: '100%',
        marginTop: 20,
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
    labeltickets: {
        color: color.black_2F251D,
        fontSize: 16,
        fontWeight: 'bold',
    },
    ticketHolder: {
        color: color.brown_3C200A,
        fontSize: 14,
        marginTop: 20,
    },
    ticketsList: {
        marginTop: 20,
        flex: 1,
    },
    userEmail: {
        color: color.brown_3C200A,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    orderNumber: {
        color: color.brown_3C200A,
        fontSize: 14,
        marginTop: 5,
    },
    successImageIcon: {
        marginTop: 20,
    },
});

export default CheckInAllTickets;
