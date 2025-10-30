import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import React, { useState } from 'react';
import Header from '../../components/header';
import { color } from '../color/color';
import CheckInAllPopUp from '../constants/checkInAllPopupticketList';
import SvgIcons from '../../components/SvgIcons';
import { ticketService } from '../api/apiService';
import { useNavigation } from '@react-navigation/native';
import SuccessPopup from '../constants/SuccessPopup';
import ErrorPopup from '../constants/ErrorPopup';
import Typography from '../components/Typography';

const CheckInAllTickets = ({ route }) => {
    const { totalTickets, email, orderData, eventInfo, name } = route.params;
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

            <Header eventInfo={eventInfo} />
            <View style={styles.wrapper}>
                <View style={styles.popUp}>
                    {totalTickets > 1 && <Text style={styles.labeltickets}>Ticket(s) Purchased</Text>}
                    <SvgIcons.successBrownSVG width={81} height={80} fill="transparent" style={styles.successImageIcon} />
                    {/* <Text style={styles.ticketHolder}>Ticket Holder</Text> */}
                    {/* <Text style={styles.ticketOrderNum}>Order Number. {orderNumber}</Text> */}
                    <Text style={styles.userName}>{name}</Text>
                    <Text style={styles.ticketEmail}>{email}</Text>
                    <Text style={styles.ticketHolder}>Purchase Date: {tickets[0]?.formatted_date}</Text>


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

                {/* Show ticket details for single ticket */}
                {totalTickets === 1 && tickets.length === 1 && (
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
                                    {tickets[0]?.category || 'N/A'}
                                </Typography>
                                <Text style={[styles.values, styles.marginTop10]}>Class</Text>
                                <Typography
                                    style={[styles.value, styles.marginTop10]}
                                    weight="400"
                                    size={14}
                                    color={color.brown_3C200A}
                                >
                                    {tickets[0]?.ticket_class || 'N/A'}
                                </Typography>
                                <Text style={[styles.values, styles.marginTop10]}>Ticket ID</Text>
                                <Text style={[styles.ticketNumber, styles.marginTop10]}>{tickets[0]?.ticket_number || 'N/A'}</Text>
                                <Text style={[styles.values]}>Last Scanned On</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop10]}>{tickets[0]?.last_scanned_on || 'N/A'}</Text>
                            </View>
                            <View style={styles.rightColumnContent}>
                                <Text style={styles.values}>Scanned By</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop10]}>
                                    {tickets[0]?.scanned_by?.name || 'N/A'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Staff ID</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop8]}>
                                    {tickets[0]?.scanned_by?.staff_id || 'N/A'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Price</Text>
                                <Text style={[styles.value, styles.marginTop10]}>
                                    {tickets[0]?.currency || 'GHS'} {tickets[0]?.ticket_price || 'N/A'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Scan Count</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop9]}>{tickets[0]?.scan_count || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Note section for single ticket */}
                {totalTickets === 1 && tickets.length === 1 && (
                    <View style={styles.noteContainer}>
                        <Text style={styles.LabelNote}>Note</Text>
                        <Text style={styles.noteDescription}>{tickets[0]?.note || 'No note added'}</Text>
                    </View>
                )}

                {/* Ticket List Section */}
                {totalTickets > 1 && (
                    <View style={styles.ticketsList}>
                        <CheckInAllPopUp
                            ticketslist={tickets.map(ticket => ({
                                order_number: ticket.order_number,
                                type: ticket.ticket_type,
                                price: ticket.ticket_price,
                                date: ticket.formatted_date,
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
                                ticket_number: ticket.ticket_number,
                                category: ticket.category || 'N/A',
                                ticketClass: ticket.ticket_class || 'N/A',
                                name: name || 'N/A',
                                email: email || 'N/A',
                            }))}
                            onTicketStatusChange={handleTicketStatusChange}
                            onScanCountUpdate={route.params?.onScanCountUpdate}
                            userEmail={email}
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
        paddingHorizontal: 10,
    },
    popUp: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: color.white_FFFFFF,
        borderRadius: 15,
        width: '100%',
        marginTop: 18,
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
    ticketEmail: {
        color: color.placeholderTxt_24282C,
        fontSize: 14,
        marginTop: 10,
        fontWeight: '400',
    },
    ticketHolder: {
        color: color.black_544B45,
        fontSize: 14,
        marginTop: 10,
        fontWeight: '400',
    },
    ticketOrderNum: {
        color: color.placeholderTxt_24282C,
        fontSize: 16,
        fontWeight: '500',
        marginTop: 10,
    },
    ticketsList: {
        marginTop: 16,
        flex: 1,
    },
    userName: {
        color: color.placeholderTxt_24282C,
        fontSize: 16,
        fontWeight: '500',
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

export default CheckInAllTickets;
