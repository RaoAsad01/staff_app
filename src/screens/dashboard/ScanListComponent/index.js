import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { color } from '../../../color/color';
import { dashboardattendeestab } from '../../../constants/dashboardattendeestab';
import SvgIcons from '../../../../components/SvgIcons';
import { ticketService } from '../../../api/apiService';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import NoResults from '../../../components/NoResults';

const ScanListComponent = ({ eventInfo, onScanCountUpdate }) => {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [fetchedTickets, setFetchedTickets] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (eventInfo?.eventUuid) {
            fetchTicketList(eventInfo.eventUuid);
        }
    }, [eventInfo?.eventUuid]);

    const fetchTicketList = async (eventUuid) => {
        try {
            setIsLoading(true);
            const res = await ticketService.ticketStatsListing(eventUuid);
            const list = res?.data || [];
            const mappedTickets = list.map((ticket) => {
                const qrCodeUrl = `https://dev-api.hexallo.com/ticket/scan/${ticket.event}/${ticket.code}/`;
                return {
                    id: ticket.ticket_number || 'N/A',
                    type: ticket.ticket_type || 'N/A',
                    price: ticket.ticket_price || 'N/A',
                    date: ticket.date || 'N/A',
                    status: ticket.checkin_status,
                    note: ticket.note || 'N/A',
                    imageUrl: null,
                    uuid: ticket.uuid || 'N/A',
                    ticketHolder: ticket.ticket_holder || 'N/A',
                    lastScannedByName: ticket.last_scanned_by_name || 'N/A',
                    scanCount: ticket.scan_count || 'N/A',
                    note: ticket.note || 'No note added',
                    lastScannedOn: ticket.last_scanned_on || 'N/A',
                    qrCodeUrl: qrCodeUrl,
                    currency: ticket.currency || 'N/A',
                    userfirstname: ticket.user_first_name
                };
            });

            setFetchedTickets(mappedTickets);
        } catch (err) {
            console.error('Error fetching ticket list:', err);
        } finally {
            setIsLoading(false);
        }
    };


    const filterTickets = () => {
        let filteredTickets = fetchedTickets;

        // Filter to show only scanned tickets
        filteredTickets = filteredTickets.filter((ticket) => ticket.status === 'SCANNED');

        if (searchText) {
            filteredTickets = filteredTickets.filter(
                (ticket) =>
                    (ticket.id && ticket.id.toLowerCase().includes(searchText.toLowerCase())) ||
                    (ticket.type && ticket.type.toLowerCase().includes(searchText.toLowerCase())) ||
                    (ticket.ticketHolder && ticket.ticketHolder.toLowerCase().includes(searchText.toLowerCase())) ||
                    (ticket.userfirstname && ticket.userfirstname.toLowerCase().includes(searchText.toLowerCase()))
            );
        }

        return filteredTickets;
    };

    const handleTicketPress = (ticket) => {
        const scanResponse = {
            message: ticket.status === 'SCANNED' ? 'Ticket Scanned' : 'Ticket Scanned',
            ticket_holder: ticket.ticketHolder || 'N/A',
            ticket: ticket.type || 'N/A',
            currency: ticket.currency || 'N/A',
            ticket_price: ticket.price || 'N/A',
            last_scan: ticket.lastScannedOn || 'N/A',
            scanned_by: ticket.lastScannedByName || 'N/A',
            ticket_number: ticket.id || 'N/A',
            scan_count: ticket.scanCount || 0,
            note: ticket.note || 'No note added',
            qrCodeUrl: ticket.qrCodeUrl,
        };

        navigation.navigate('TicketScanned', {
            scanResponse: scanResponse,
            eventInfo: eventInfo,
        });
    };

    const handleSearchChange = (text) => {
        setSearchText(text);
    };

    const handleTabPress = (tab) => {
        setSearchText('');
    };



    const getNoResultsMessage = () => {
        if (searchText) {
            return "No Matching Results";
        }
        return "No Matching Results";
    };

    const filteredTickets = filterTickets();

    return (
        <ScrollView
            style={styles.container}
            onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const paddingToBottom = 20;
                if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                    loadMoreTickets();
                }
            }}
            scrollEventThrottle={400}
        >
            <View><Text style={styles.title}>Scans</Text></View>
            <View style={styles.searchFilterContainer}>
                <View style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="John Doe"
                        placeholderTextColor={color.brown_766F6A}
                        onChangeText={handleSearchChange}
                        value={searchText}
                        selectionColor={color.selectField_CEBCA0}
                    />
                    <TouchableOpacity onPress={() => handleSearchChange(searchText)}>
                        <SvgIcons.searchIcon width={20} height={20} fill="transparent" />
                    </TouchableOpacity>
                </View>
            </View>

            {filteredTickets.length > 0 ? (
                filteredTickets.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => handleTicketPress(item)}
                    >
                        <View style={styles.cardContent}>
                            <View>
                                <Text style={styles.label}>Name</Text>
                                <Text style={styles.value}>{item.userfirstname || 'N/A'}</Text>
                                <Text style={styles.label}>Ticket ID</Text>
                                <Text style={styles.value}>#{item.id}</Text>
                                <Text style={styles.label}>{item.type}</Text>
                                <Text style={styles.value}>{item.currency} {item.price}</Text>
                            </View>
                            <View style={styles.qrCode}>
                                {item.qrCodeUrl && (
                                    <QRCode
                                        value={item.qrCodeUrl}
                                        size={100}
                                        style={{ width: '100%', height: '100%' }}
                                        logoSize={30}
                                        logoBackgroundColor="transparent"
                                        quietZone={5}
                                    />
                                )}
                            </View>
                        </View>

                        <View
                            style={[
                                styles.badge,
                                styles.checkInBadge,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    styles.checkInText,
                                ]}
                            >
                                {item.status === 'SCANNED' ? 'Scanned' : item.status}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : !isLoading ? (
                <NoResults message={getNoResultsMessage()} />
            ) : (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
                </View>
            )}

            {isLoading && filteredTickets.length > 0 && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
    },
    searchFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.white_FFFFFF,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        borderColor: color.borderBrown_CEBCA0,
        borderWidth: 1,
        height: 45,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 5,
        marginLeft: 5,
    },
    searchIcon: {
        marginRight: 5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        position: 'relative',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D,
        marginBottom: 10,
    },
    value: {
        fontSize: 12,
        fontWeight: '400',
        color: color.black_544B45,
        marginBottom: 5,
    },
    qrCode: {
        width: 100,
        height: 100,
        marginTop: 50,
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 12,
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkInBadge: {
        backgroundColor: '#FFE8BB',
        width: 90,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    checkInText: {
        color: color.brown_D58E00,
        fontSize: 10,
        fontWeight: '500',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 10,
        color: color.black_2F251D,
        alignSelf: "flex-start",
    },
});

export default ScanListComponent;
