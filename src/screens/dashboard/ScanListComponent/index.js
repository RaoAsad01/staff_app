import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { color } from '../../../color/color';
import { dashboardattendeestab } from '../../../constants/dashboardattendeestab';
import SvgIcons from '../../../../components/SvgIcons';
import { ticketService } from '../../../api/apiService';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import NoResults from '../../../components/NoResults';

const ScanListComponent = ({ eventInfo, onScanCountUpdate, staffUuid }) => {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
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
            // If staffUuid is provided, we need to filter tickets for that specific staff
            const res = await ticketService.ticketStatsListing(eventUuid, staffUuid);
            const list = res?.data || [];
            const mappedTickets = list.map((ticket) => {
                const qrCodeUrl = `https://dev-api.hexallo.com/ticket/scan/${ticket.event}/${ticket.code}/`;
                return {
                    id: ticket.ticket_number || 'N/A',
                    type: ticket.ticket_type || 'N/A',
                    price: ticket.ticket_price || 'N/A',
                    date: ticket.formatted_date || 'N/A',
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
                    userfirstname: ticket.user_first_name,
                    name: `${ticket.user_first_name || ''} ${ticket.user_last_name || ''}`.trim() || 'N/A',
                    user_email: ticket.user_email || 'N/A',
                    category: ticket.category || 'N/A',
                    ticketClass: ticket.ticket_class || 'N/A',
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
                    (ticket.userfirstname && ticket.userfirstname.toLowerCase().includes(searchText.toLowerCase())) ||
                    (ticket.category && ticket.category.toLowerCase().includes(searchText.toLowerCase())) ||
                    (ticket.ticketClass && ticket.ticketClass.toLowerCase().includes(searchText.toLowerCase()))
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
            name: ticket.name,
            date: ticket.date,
            user_email: ticket.user_email,
            category: ticket.category,
            ticketClass: ticket.ticketClass,
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
                <View style={[
                    styles.searchBar,
                    isSearchFocused && styles.searchBarFocused
                ]}>
                    <TextInput
                        style={[
                            styles.searchInput,
                            searchText ? styles.searchInputWithText : styles.searchInputPlaceholder
                        ]}
                        placeholder="John Doe"
                        placeholderTextColor={color.brown_766F6A}
                        onChangeText={handleSearchChange}
                        value={searchText}
                        selectionColor={color.selectField_CEBCA0}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
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
                                <Text style={styles.value}>{item.name || 'N/A'}</Text>
                                <Text style={styles.label}>Category</Text>
                                <Text style={styles.value}>{item.category}</Text>
                                <Text style={styles.label}>Class</Text>
                                <Text style={styles.value}>{item.ticketClass}</Text>
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
                        <View style={styles.statusContainer}>
                            <Text style={styles.valueID}>Tic ID: {item.id}</Text>
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
        marginHorizontal: 16,
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
        borderColor: color.borderBrown_CEBCA0,
        borderWidth: 1,
        height: 45,
        marginRight: 10,
    },
    searchBarFocused: {
        borderColor: color.placeholderTxt_24282C,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 5,
        marginLeft: 5,
    },
    searchInputPlaceholder: {
        color: color.brown_766F6A,
        fontWeight: '200',
        fontSize: 13,
    },
    searchInputWithText: {
        color: color.black_544B45,
        fontWeight: '400',
        fontSize: 13,
    },
    searchIcon: {
        marginRight: 5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
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
        color: color.placeholderTxt_24282C,
        marginBottom: 10,
    },
    value: {
        fontSize: 12,
        fontWeight: '400',
        color: color.black_544B45,
        marginBottom: 10,
    },
    qrCode: {
        width: 100,
        height: 100,
        paddingTop: 30,
    },
    badge: {
        position: 'absolute',
        top: 13,
        right: 18,
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
    valueID: {
        fontSize: 12,
        fontWeight: '400',
        color: color.black_544B45,
        marginTop: 10,
    },
    statusContainer: {
        position: 'absolute',
        top: 35,
        right: 18,
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ScanListComponent;
