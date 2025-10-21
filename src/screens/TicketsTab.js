import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '../color/color';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import SvgIcons from '../../components/SvgIcons';
import { ticketService } from '../api/apiService';
import QRCode from 'react-native-qrcode-svg';
import NoResults from '../components/NoResults';

const TicketsTab = ({ tickets, eventInfo, initialTab }) => {
    const navigation = useNavigation()
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState(initialTab || 'All');
    const [stats, setStats] = useState({ total: 0, scanned: 0, unscanned: 0 });
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const isFocused = useIsFocused();
    const [fetchedTickets, setFetchedTickets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationInfo, setPaginationInfo] = useState({
        count: 0,
        current_page: 1,
        next: null,
        page_size: 10,
        previous: null
    });

    useEffect(() => {
        if (isFocused && eventInfo?.eventUuid) {
            fetchTicketStats(eventInfo.eventUuid);
            fetchTicketList(eventInfo.eventUuid);
        }
    }, [isFocused, eventInfo?.eventUuid]);

    // Separate useEffect to handle initialTab changes
    useEffect(() => {
        if (initialTab) {
            setSelectedTab(initialTab);
        }
    }, [initialTab]);

    const fetchTicketList = async (eventUuid) => {
        try {
            setIsLoading(true);
            const res = await ticketService.ticketStatsListing(eventUuid); // No need to pass page
            const list = res?.data || [];

            const mappedTickets = list.map((ticket) => {
                const qrCodeUrl = `https://dev-api.hexallo.com/ticket/scan/${ticket.event}/${ticket.code}/`;
                return {
                    id: ticket.ticket_number || 'N/A',
                    type: ticket.ticket_type || 'N/A',
                    price: ticket.ticket_price || 'N/A',
                    date: ticket.formatted_date || 'N/A',
                    status: ticket.checkin_status === 'SCANNED' ? 'Scanned' : 'Unscanned',
                    note: ticket.note || 'No note added',
                    imageUrl: null,
                    uuid: ticket.uuid || 'N/A',
                    ticketHolder: ticket.ticket_holder || 'N/A',
                    lastScannedByName: ticket.last_scanned_by_name || 'N/A',
                    scanCount: ticket.scan_count || 'N/A',
                    lastScannedOn: ticket.last_scanned_on || 'N/A',
                    qrCodeUrl: qrCodeUrl,
                    currency: ticket.currency || 'N/A',
                    email: ticket.user_email || 'N/A',
                    name: `${ticket.user_first_name || ''} ${ticket.user_last_name || ''}`.trim() || 'N/A',
                };
            });


            setFetchedTickets(mappedTickets);
        } catch (err) {
            console.error('Error fetching ticket list:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchTicketStats = async (eventUuid) => {
        try {
            const res = await ticketService.ticketStatsInfo(eventUuid);
            const statsData = res?.data?.data || {};

            setStats({
                total: statsData.total || 0,
                scanned: statsData.scanned || 0,
                unscanned: statsData.unscanned || 0,
            });
        } catch (err) {
            console.error('Error fetching ticket stats:', err);
        }
    };

    const filterTickets = () => {
        let filteredTickets = fetchedTickets;

        if (searchText) {
            filteredTickets = filteredTickets.filter(
                (ticket) =>
                    ticket.id.includes(searchText) ||
                    ticket.type.toLowerCase().includes(searchText.toLowerCase()) ||
                    ticket.date.includes(searchText)
            );
        }

        if (selectedTab !== 'All') {
            filteredTickets = filteredTickets.filter((ticket) => ticket.status === selectedTab);
        }

        return filteredTickets;
    };
    const handleSearchChange = (text) => {
        setSearchText(text);
    };

    const handleTabPress = (tab) => {
        setSelectedTab(tab);
    };

    const handleTicketPress = (ticket) => {
        const scanResponse = {
            message: ticket.status === 'Scanned' ? 'Ticket Scanned' : 'Ticket Unscanned',
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
            name: ticket.name || 'N/A',
            date: ticket.date || 'N/A',
            user_email: ticket.email || 'N/A',
        };

        navigation.navigate('TicketScanned', {
            scanResponse: scanResponse,
            eventInfo: eventInfo,
        });
    };

    const loadMoreTickets = () => {
        if (!isLoading && hasMore && eventInfo?.eventUuid) {
            fetchTicketList(eventInfo.eventUuid, currentPage + 1, true);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleTicketPress(item)} style={styles.ticketContainer}>
            <View>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{item.name}</Text>
                <Text style={styles.label}>Ticket ID</Text>
                <Text style={styles.value}>{item.id}</Text>
                {/* <Text style={styles.ticketType}>{item.type}</Text> */}
                {/* <View style={styles.priceContainer}>
                    <Text style={styles.priceCurrency}>GHS</Text>
                    <Text style={styles.ticketPrice}>{item.price}</Text>
                </View> */}
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{item.date}</Text>
            </View>
            <View style={styles.statusBtn} >
                <TouchableOpacity
                    style={[
                        styles.statusButton,
                        item.status === 'Scanned' && styles.scannedButton,
                        item.status === 'Unscanned' && styles.unscannedButton,
                    ]}
                >
                    <Text
                        style={[
                            styles.statusButtonText,
                            item.status === 'Scanned' && styles.scannedButtonText,
                            item.status === 'Unscanned' && styles.unscannedButtonText,
                        ]}
                    >
                        {item.status}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
                {item.qrCodeUrl && ( // Display QR code if URL is available
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
        </TouchableOpacity>
    );

    const getNoResultsMessage = () => {
        if (searchText) {
            return "No Matching Results";
        }

        switch (selectedTab) {
            case 'All':
                return "No Matching Results";
            case 'Scanned':
                return "No Matching Results";
            case 'Unscanned':
                return "No Matching Results";
            default:
                return "No Matching Results";
        }
    };

    const filteredTickets = filterTickets();

    const totalTickets = stats.total;
    const scannedTicketsCount = stats.scanned;
    const unscannedTicketsCount = stats.unscanned;


    return (
        <SafeAreaView style={styles.container}>

            <View style={[
                styles.searchContainer,
                isSearchFocused && styles.searchContainerFocused
            ]}>
                <View style={styles.searchBarContainer}>
                    <TextInput
                        style={[
                            styles.searchBar,
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
                </View>

                <TouchableOpacity onPress={() => handleSearchChange(searchText)}>
                    <SvgIcons.searchIcon width={20} height={20} fill="transparent" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'All' && styles.activeTab]}
                    onPress={() => setSelectedTab('All')}>
                    <Text style={[styles.tabButtonText, selectedTab === 'All' && styles.activeTabText]}>All</Text>
                    <View style={[styles.countBadge, selectedTab === 'All' ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={[styles.countText, selectedTab === 'All' ? styles.activeCountText : styles.inactiveCountText]}>
                            {totalTickets}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'Scanned' && styles.activeTab]}
                    onPress={() => setSelectedTab('Scanned')}>
                    <Text style={[styles.tabButtonText, selectedTab === 'Scanned' && styles.activeTabText]}>Scanned</Text>
                    <View style={[styles.countBadge, selectedTab === 'Scanned' ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={[styles.countText, selectedTab === 'Scanned' ? styles.activeCountText : styles.inactiveCountText]}>
                            {scannedTicketsCount}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'Unscanned' && styles.activeTab]}
                    onPress={() => setSelectedTab('Unscanned')}>
                    <Text style={[styles.tabButtonText, selectedTab === 'Unscanned' && styles.activeTabText]}>Unscanned</Text>
                    <View style={[styles.countBadge, selectedTab === 'Unscanned' ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={[styles.countText, selectedTab === 'Unscanned' ? styles.activeCountText : styles.inactiveCountText]}>
                            {unscannedTicketsCount}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.flatListContainer}>
                <FlatList
                    data={filteredTickets}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={() =>
                        !isLoading ? (
                            <NoResults message={getNoResultsMessage()} />
                        ) : (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
                            </View>
                        )
                    }
                    ListFooterComponent={() =>
                        isLoading && filteredTickets.length > 0 ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
                            </View>
                        ) : null
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: Platform.OS === 'ios' ? 10 : 18
    },
    ticketContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: color.white_FFFFFF,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: color.white_FFFFFF,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginVertical: 4
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
        fontWeight: 500,
        color: color.black_2F251D,
        marginTop: 10
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    priceCurrency: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_544B45,
    },
    ticketPrice: {
        color: color.brown_5A2F0E,
        fontSize: 14,
        fontWeight: '700',
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
    ticketDate: {
        fontSize: 14,
        color: color.black_544B45,
        fontWeight: '400',
        marginTop: 10
    },
    ticketheading: {
        fontSize: 14,
        fontWeight: 500,
        color: color.black_2F251D,
    },
    ticketDateheading: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D,
        marginTop: 10
    },
    statusButton: {
        paddingHorizontal: 15,
        paddingVertical: 4,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
    },
    scannedButton: {
        backgroundColor: color.brown_FFE8BB,
    },
    unscannedButton: {
        backgroundColor: color.grey_87807C33,
    },
    statusButtonText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scannedButtonText: {
        color: color.brown_D58E00,
        fontSize: 10,
        fontWeight: 500
    },
    unscannedButtonText: {
        color: color.black_544B45,
        fontSize: 10,
        fontWeight: 500
    },
    statusBtn: {
        position: 'absolute',
        right: 18,
        top: 15,

    },
    searchContainer: {
        backgroundColor: color.white_FFFFFF,
        borderRadius: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        marginTop: Platform.OS === 'ios' ? -45 : -17,
        borderColor: color.borderBrown_CEBCA0,
        borderWidth: 1,
        height: 45,
    },
    searchBarContainer: {
        flex: 1,
    },
    searchBar: {
        flex: 1,
        paddingVertical: 10,
        fontWeight: '400',
        fontSize: 13,
    },
    searchContainerFocused: {
        borderColor: '#24282C',
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
    imageContainer: {
        width: 100,
        height: 100,
        paddingTop: 30
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
    },

    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 7,
    },

    activeTab: {
        backgroundColor: '#FFFFFF',
    },

    tabButtonText: {
        fontSize: 16,
        fontWeight: '400',
        color: color.brown_766F6A,
    },

    activeTabText: {
        fontSize: 16,
        color: color.brown_3C200A,
        fontWeight: '500',
    },

    countBadge: {
        borderRadius: 2,
        marginLeft: 5,
        minWidth: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 1,
        paddingHorizontal: 3

    },

    activeBadge: {
        backgroundColor: color.brown_F7E4B6,
    },

    inactiveBadge: {
        backgroundColor: '#87807CB2',
    },

    countText: {
        fontSize: 10,
        fontWeight: '500',
        color: color.white_FFFFFF,
        textAlign: 'center',
    },

    activeCountText: {
        fontSize: 10,
        fontWeight: '500',
        color: color.black_544B45,
        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    flatListContainer: {
        top: 6
    }
});

export default TicketsTab;