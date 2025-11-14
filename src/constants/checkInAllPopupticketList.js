import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { color } from '../color/color';
import { ticketService } from '../api/apiService';
import SuccessPopup from './SuccessPopup';
import ErrorPopup from './ErrorPopup';
import { useState } from 'react';

const CheckInAllPopup = ({ ticketslist, onTicketStatusChange, onScanCountUpdate, userEmail }) => {
    const { eventInfo } = useRoute().params;
    const navigation = useNavigation();
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleStatusChange = async (ticketToCheckIn) => {
        console.log("Check-in ticket data:", ticketToCheckIn)
        try {
            console.log("Sending:", ticketToCheckIn.eventUuid, ticketToCheckIn.code);
            const response = await ticketService.manualDetailCheckin(ticketToCheckIn.eventUuid, ticketToCheckIn.code);
            console.log("API Response:", response);

            if (response?.data?.status === 'SCANNED') {
                // Extract scanned_by information from response
                const scannedByFromResponse = response?.data?.scanned_by;
                console.log('CheckInAllPopup - scanned_by from response:', scannedByFromResponse);

                // Notify parent component about the status change with scanned_by info
                if (onTicketStatusChange) {
                    onTicketStatusChange(
                        ticketToCheckIn.uuid,
                        'SCANNED',
                        scannedByFromResponse ? {
                            name: scannedByFromResponse.name,
                            staff_id: scannedByFromResponse.staff_id,
                            scanned_on: scannedByFromResponse.scanned_on,
                        } : null
                    );
                }

                // Update scan count when ticket is successfully checked in
                if (onScanCountUpdate) {
                    onScanCountUpdate();
                }

                setShowSuccessPopup(true);
            } else {
                const errorMsg = response?.data?.message || response?.message || "We couldn't check in this ticket. Please try again or contact support.";
                setErrorMessage(errorMsg);
                setShowErrorPopup(true);
            }
        } catch (error) {
            console.error('Check-in error:', error);
            const errorMsg = error?.response?.data?.message || error?.message || "We couldn't check in this ticket. Please try again or contact support.";
            setErrorMessage(errorMsg);
            setShowErrorPopup(true);
        }
    };

    const handleCloseSuccessPopup = () => {
        setShowSuccessPopup(false);
    };

    const handleCloseErrorPopup = () => {
        setShowErrorPopup(false);
        setErrorMessage(null);
    };

    const handleItemPress = (item) => {
        // Navigate to TicketScanned for all tickets when clicking on container
        const scanResponse = {
            message: item.status === 'SCANNED' ? 'Ticket Scanned' : 'Ticket Unscanned',
            ticket_holder: item.ticket_holder || item.ticketHolder || 'No Record',
            ticket: item.ticket_type || item.type,
            currency: item.currency,
            ticket_price: item.ticket_price || item.price,
            last_scan: item.last_scan || item.last_scanned_on,
            scanned_by: typeof item.scanned_by === 'object' ? item.scanned_by?.name : (item.scanned_by || 'No Record'),
            staff_id: typeof item.scanned_by === 'object' ? item.scanned_by?.staff_id : (item.staff_id || 'No Record'),
            ticket_number: item.ticket_number,
            scan_count: item.scan_count || item.scanCount || 0,
            note: item.note || 'No note added',
            event_uuid: item.event_uuid || item.eventUuid,
            scanned_by_email: item.scanned_by_email || 'No Record',
            ticket_holder_email: item.ticket_holder_email || 'No Record',
            status: item.status || 'UNSCANNED',
            name: item.name || 'No Record',
            date: item.date,
            user_email: item.email || userEmail || 'No Record',
            category: item.category || 'No Record',
            ticketClass: item.ticketClass || 'No Record',
            scanned_on: item?.scanned_on || 'No Record',

        };

        navigation.navigate('TicketScanned', {
            scanResponse,
            eventInfo: eventInfo,
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.ticketContainer}
            onPress={() => handleItemPress(item)}
        >
            <View>
                <Text style={styles.ticketheading}>Ticket ID</Text>
                <Text style={styles.ticketId}>{item.ticket_number}</Text>
                <Text style={styles.ticketType}>Category</Text>
                <Text style={styles.ticketId}>{item.category}</Text>
            </View>
            <View style={styles.statusAndDateContainer}>
                <TouchableOpacity
                    style={[
                        styles.statusButton,
                        item.status === 'SCANNED' && styles.scannedButton,
                        item.status !== 'SCANNED' && styles.checkInButton
                    ]}
                    onPress={() => {
                        if (item.status !== 'SCANNED') {
                            handleStatusChange(item);
                        } else {
                            Alert.alert('Already Scanned.');
                            console.log("Ticket is already scanned.");
                        }
                    }}
                >
                    <Text
                        style={[
                            styles.statusButtonText,
                            item.status === 'SCANNED' && styles.scannedText,
                            item.status !== 'SCANNED' && styles.checkInText
                        ]}
                    >
                        {item.status === 'SCANNED' ? 'Scanned' : 'Check-in'}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.ticketDateheading}>Class</Text>
                <Text style={styles.ticketId}>{item.ticketClass}</Text>

            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <FlatList
                data={ticketslist}
                renderItem={renderItem}
                keyExtractor={(item) => item.uuid}
            />

            <SuccessPopup
                visible={showSuccessPopup}
                onClose={handleCloseSuccessPopup}
                title="Check-In Successful"
                subtitle="Ticket checked in successfully"
            />

            <ErrorPopup
                visible={showErrorPopup}
                onClose={handleCloseErrorPopup}
                title="Check-In Failed"
                subtitle={errorMessage || "We couldn't check in this ticket. Please try again or contact support."}
            />
        </>
    );
};

const styles = StyleSheet.create({
    ticketContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: color.white_FFFFFF,
        borderRadius: 10,
        marginBottom: 17,
        backgroundColor: color.white_FFFFFF,
        paddingHorizontal: 16,
        paddingVertical: 10,
        // margin: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.3,
        // shadowRadius: 6,
        // elevation: 5,
    },
    ticketId: {
        fontWeight: '400',
        marginTop: 10,
        fontSize: 14,
        color: color.black_544B45
    },
    ticketType: {
        fontSize: 14,
        marginTop: 10,
        color: color.black_2F251D,
        fontWeight: '500',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    priceCurrency: {
        color: color.black_544B45,
    },
    ticketPrice: {
        color: color.black_544B45,
    },
    ticketDate: {
        fontSize: 14,
        color: color.black_544B45,
        fontWeight: '400',
        marginTop: 14,
    },
    ticketheading: {
        fontSize: 14,
        color: color.black_2F251D,
        fontWeight: '500'
    },
    ticketDateheading: {
        fontSize: 14,
        marginTop: 15,
        fontWeight: '500',
        color: color.black_2F251D,
    },
    statusAndDateContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    statusButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 110,
        backgroundColor: color.btnBrown_AE6F28,
        marginBottom: 10,
    },
    statusButtonText: {
        color: color.btnTxt_FFF6DF,
    },
    scannedButton: {
        backgroundColor: color.brown_FFE8BB,
    },
    scannedText: {
        color: color.brown_D58E00,
        fontWeight: '500',

    },
    checkInButton: {
        backgroundColor: color.btnBrown_AE6F28,
    },
    checkInText: {
        color: color.btnTxt_FFF6DF,
        fontWeight: '500',
    },
});

export default CheckInAllPopup;
