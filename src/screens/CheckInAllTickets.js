import { View, Text, StyleSheet, StatusBar, TouchableOpacity, SafeAreaView } from 'react-native';
import React from 'react';
import Header from '../../components/header';
import { color } from '../color/color';
import CheckInAllPopUp from '../constants/checkInAllPopupticketList';
import SvgIcons from '../../components/SvgIcons';

const CheckInAllTickets = ({ route }) => {
    const { totalTickets, email, orderData, eventInfo } = route.params;
    const tickets = orderData?.data?.data || [];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <Header eventInfo={eventInfo} />
            <View style={styles.wrapper}>
                <View style={styles.popUp}>
                    {totalTickets > 1 && <Text style={styles.labeltickets}>Ticket(s) Purchased</Text>}
                    <SvgIcons.successBrownSVG width={81} height={80} fill="transparent" style={styles.successImageIcon} />
                    <Text style={styles.ticketHolder}>Ticket Holder</Text>
                    <Text style={styles.userEmail}>{email}</Text>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>
                            {totalTickets === 1 ? 'Check-In' : `Check-In All`}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Ticket List Section */}
                {totalTickets > 1 && (
                    <View style={styles.ticketsList}>
                        <CheckInAllPopUp ticketslist={tickets.map(ticket => ({
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
                            eventInfo: eventInfo
                        }))}
                        />
                    </View>
                )}
            </View>
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
