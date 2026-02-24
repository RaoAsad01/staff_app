import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { color } from '../color/color';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import SvgIcons from '../components/SvgIcons';
import { ticketService, BASE_URL } from '../api/apiService';
import QRCode from 'react-native-qrcode-svg';
import NoResults from '../components/NoResults';
import { logger } from '../utils/logger';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { syncService } from '../utils/syncService';
import { offlineStorage } from '../utils/offlineStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineIndicator from '../components/OfflineIndicator';

const TicketsTab = ({ eventInfo, initialTab }) => {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState(initialTab || 'All');
    const [stats, setStats] = useState({ total: 0, scanned: 0, unscanned: 0 });
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const isFocused = useIsFocused();
    const [fetchedTickets, setFetchedTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef(null);
    const { isOnline, triggerSync, queueSize } = useOfflineSync();

    useEffect(() => {
        if (isFocused && eventInfo?.eventUuid) {
            fetchTicketStats(eventInfo.eventUuid);
            fetchTicketList(eventInfo.eventUuid);

            // Auto-sync when online and there are queued actions
            if (isOnline && queueSize > 0) {
                triggerSync();
            }
        }
    }, [isFocused, eventInfo?.eventUuid, isOnline, queueSize]);

    // Listen for sync completion to refresh ticket list
    useEffect(() => {
        const unsubscribe = syncService.addListener(async (syncResult) => {
            if (syncResult.success && syncResult.synced > 0 && isFocused && eventInfo?.eventUuid) {
                logger.log('Sync completed - refreshing tickets list');
                // Clear tickets cache to force fresh fetch after sync
                try {
                    const allKeys = await AsyncStorage.getAllKeys();
                    const ticketKeys = allKeys.filter(key =>
                        key.includes(`offline_tickets_${eventInfo.eventUuid}`)
                    );
                    if (ticketKeys.length > 0) {
                        await AsyncStorage.multiRemove(ticketKeys);
                        logger.log('Cleared tickets cache after sync');
                    }
                } catch (error) {
                    logger.error('Error clearing tickets cache:', error);
                }
                // Refresh tickets after successful sync
                setTimeout(() => {
                    fetchTicketStats(eventInfo.eventUuid);
                    fetchTicketList(eventInfo.eventUuid);
                }, 1000);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [isFocused, eventInfo?.eventUuid]);

    // Handle initialTab changes
    useEffect(() => {
        if (initialTab) {
            setSelectedTab(initialTab);
        }
    }, [initialTab]);

    // Scroll to top on tab change
    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
    }, [selectedTab]);

    const fetchTicketList = async (eventUuid) => {
        try {
            setIsLoading(true);
            const res = await ticketService.ticketStatsListing(eventUuid, 'PAID');
            const list = res?.data || [];

            if (res?.offline) {
                logger.log('Using offline cached tickets');
            }

            const mappedTickets = list.map((ticket) => {
                const qrCodeUrl = `${BASE_URL}ticket/scan/${ticket.event}/${ticket.code}/`;
                return {
                    id: ticket.ticket_number || 'No Record',
                    type: ticket.ticket_type || 'No Record',
                    price: ticket.ticket_price || 'No Record',
                    date: ticket.formatted_date || 'No Record',
                    status: ticket.checkin_status === 'SCANNED' ? 'Scanned' : 'Unscanned',
                    note: ticket.note || 'No note added',
                    imageUrl: null,
                    uuid: ticket.uuid || 'No Record',
                    ticketHolder: ticket.ticket_holder || 'No Record',
                    lastScannedByName: ticket.last_scanned_by_name || 'No Record',
                    scanCount: ticket.scan_count || 'No Record',
                    lastScannedOn: ticket.last_scanned_on || 'No Record',
                    qrCodeUrl: qrCodeUrl,
                    currency: ticket.currency || 'No Record',
                    email: ticket.user_email || 'No Record',
                    name: `${ticket.user_first_name || ''} ${ticket.user_last_name || ''}`.trim() || 'No Record',
                    category: ticket.category || 'No Record',
                    ticketClass: ticket.ticket_class || 'No Record',
                    scannedBy: ticket.scanned_by?.name || 'No Record',
                    staffId: ticket.scanned_by?.staff_id || 'No Record',
                    scannedOn: ticket.scanned_by?.scanned_on || 'No Record',
                };
            });

            setFetchedTickets(mappedTickets);
        } catch (err) {
            logger.error('Error fetching ticket list:', {
                message: err?.message,
                status: err?.response?.status,
                statusText: err?.response?.statusText,
                data: err?.response?.data,
                url: err?.config?.url,
                method: err?.config?.method,
                headers: err?.config?.headers,
                params: err?.config?.params,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTicketStats = async (eventUuid) => {
        try {
            const res = await ticketService.ticketStatsInfo(eventUuid);
            const statsData = res?.data?.data || {};

            if (res?.offline) {
                logger.log('Using offline cached stats');
            }

            setStats({
                total: statsData.total || 0,
                scanned: statsData.scanned || 0,
                unscanned: statsData.unscanned || 0,
            });
        } catch (err) {
            logger.error('Error fetching ticket stats:', {
                message: err?.message,
                status: err?.response?.status,
                statusText: err?.response?.statusText,
                data: err?.response?.data,
                url: err?.config?.url,
                method: err?.config?.method,
                headers: err?.config?.headers,
                params: err?.config?.params,
            });
        }
    };

    const filterTickets = () => {
        let filteredTickets = fetchedTickets;

        if (searchText) {
            const query = searchText.toLowerCase();
            filteredTickets = filteredTickets.filter(
                (ticket) =>
                    ticket.id.toLowerCase().includes(query) ||
                    ticket.type.toLowerCase().includes(query) ||
                    ticket.date.toLowerCase().includes(query) ||
                    ticket.category.toLowerCase().includes(query) ||
                    ticket.ticketClass.toLowerCase().includes(query)
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

    const handleTicketPress = (ticket) => {
        const scanResponse = {
            message: ticket.status === 'Scanned' ? 'Ticket Scanned' : 'Ticket Unscanned',
            ticket_holder: ticket.ticketHolder || 'No Record',
            ticket: ticket.type || 'No Record',
            currency: ticket.currency || 'No Record',
            ticket_price: ticket.price || 'No Record',
            last_scan: ticket.lastScannedOn || 'No Record',
            ticket_number: ticket.id || 'No Record',
            scan_count: ticket.scanCount || 0,
            note: ticket.note || 'No note added',
            qrCodeUrl: ticket.qrCodeUrl,
            name: ticket.name || 'No Record',
            date: ticket.date || 'No Record',
            user_email: ticket.email || 'No Record',
            ticketClass: ticket.ticketClass || 'No Record',
            category: ticket.category || 'No Record',
            scanned_by: ticket.scannedBy || 'No Record',
            staff_id: ticket.staffId || 'No Record',
            scanned_on: ticket.scannedOn || 'No Record',
        };

        navigation.navigate('TicketScanned', {
            scanResponse: scanResponse,
            eventInfo: eventInfo,
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleTicketPress(item)} style={styles.ticketContainer}>
            <View>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{item.name}</Text>
                <Text style={styles.label}>Category</Text>
                <Text style={styles.value}>{item.category}</Text>
                <Text style={styles.label}>Class</Text>
                <Text style={styles.value}>{item.ticketClass}</Text>
            </View>
            <View style={styles.statusBtn}>
                <View
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
                </View>
                <Text style={styles.valueID}>Tix ID: {item.id}</Text>
            </View>
            <View style={styles.imageContainer}>
                {item.qrCodeUrl && (
                    <QRCode
                        value={item.qrCodeUrl}
                        size={100}
                        logoSize={30}
                        logoBackgroundColor="transparent"
                        quietZone={5}
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    const filteredTickets = filterTickets();

    return (
        <View style={styles.container}>
            <OfflineIndicator />

            <View style={[
                styles.searchContainer,
                isSearchFocused && styles.searchContainerFocused,
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
                            {stats.total}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'Scanned' && styles.activeTab]}
                    onPress={() => setSelectedTab('Scanned')}>
                    <Text style={[styles.tabButtonText, selectedTab === 'Scanned' && styles.activeTabText]}>Scanned</Text>
                    <View style={[styles.countBadge, selectedTab === 'Scanned' ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={[styles.countText, selectedTab === 'Scanned' ? styles.activeCountText : styles.inactiveCountText]}>
                            {stats.scanned}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'Unscanned' && styles.activeTab]}
                    onPress={() => setSelectedTab('Unscanned')}>
                    <Text style={[styles.tabButtonText, selectedTab === 'Unscanned' && styles.activeTabText]}>Unscanned</Text>
                    <View style={[styles.countBadge, selectedTab === 'Unscanned' ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={[styles.countText, selectedTab === 'Unscanned' ? styles.activeCountText : styles.inactiveCountText]}>
                            {stats.unscanned}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.flatListContainer}>
                <FlatList
                    ref={flatListRef}
                    data={filteredTickets}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatListContent}
                    ListEmptyComponent={() =>
                        !isLoading ? (
                            <NoResults message="No Matching Results" />
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    searchContainer: {
        backgroundColor: color.white_FFFFFF,
        borderRadius: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        borderColor: color.borderBrown_CEBCA0,
        borderWidth: 1,
        height: 45,
    },
    searchContainerFocused: {
        borderColor: '#24282C',
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
    ticketContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: color.white_FFFFFF,
        borderRadius: 10,
        backgroundColor: color.white_FFFFFF,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginVertical: 4,
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
    valueID: {
        fontSize: 12,
        fontWeight: '400',
        color: color.black_544B45,
        marginTop: 14,
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
        fontWeight: '500',
    },
    unscannedButtonText: {
        color: color.black_544B45,
        fontSize: 10,
        fontWeight: '500',
    },
    statusBtn: {
        position: 'absolute',
        right: 18,
        top: 12,
    },
    imageContainer: {
        width: 100,
        height: 100,
        paddingTop: 30,
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
        paddingHorizontal: 3,
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
    inactiveCountText: {
        fontSize: 10,
        fontWeight: '500',
        color: color.white_FFFFFF,
        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    flatListContainer: {
        flex: 1,
        marginTop: 6,
    },
    flatListContent: {
        paddingBottom: 50,
    },
});

export default TicketsTab;