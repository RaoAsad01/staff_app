import React, { useState,useEffect,useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '../color/color';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import SvgIcons from '../../components/SvgIcons';

const TicketsTab = ({route, tickets }) => {
    const navigation = useNavigation()
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('All');
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            console.log("route.params", route.params);
            if (route.params?.fromTab) {
                setSelectedTab('All');
                navigation.setParams({ fromTab: undefined });
                return;
            }
            if (route.params?.initialTab === 'Scanned' && route.params?.fromHeader) {
                setSelectedTab('Scanned');
                return;
            }
        }
    }, [isFocused, route.params]);

    const filterTickets = () => {
        if (!tickets) {
            return [];
          }
      
        let filteredTickets = tickets;
        if (searchText) {
            filteredTickets = tickets.filter(
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
        navigation.navigate('TicketScanned', {
            status: ticket.status,
            note: ticket.note || 'No note added'
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleTicketPress(item)} style={styles.ticketContainer}>
            <View>
                <Text style={styles.ticketheading}>Ticket ID</Text>
                <Text style={styles.ticketId}>{item.id}</Text>
                <Text style={styles.ticketType}>{item.type}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceCurrency}>USD</Text>
                    <Text style={styles.ticketPrice}>{item.price}</Text>
                </View>
                <Text style={styles.ticketDateheading}>Date</Text>
                <Text style={styles.ticketDate}>{item.date}</Text>
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
                {item.imageUrl && (
                    <item.imageUrl width={"100%"} height={"100%"} />
                )}
            </View>
        </TouchableOpacity>
    );

    const filteredTickets = filterTickets();

    const totalTickets = tickets.length;
    const scannedTicketsCount = tickets.filter((ticket) => ticket.status === 'Scanned').length;
    const unscannedTicketsCount = tickets.filter((ticket) => ticket.status === 'Unscanned').length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBarContainer}>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="John Doe"
                        placeholderTextColor={color.black_544B45}
                        onChangeText={handleSearchChange}
                        value={searchText}
                        selectionColor={color.selectField_CEBCA0}
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

            <FlatList
                data={filteredTickets}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 10
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
        paddingVertical: 8,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 110,
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
    },
    unscannedButtonText: {
        color: color.black_544B45,
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
        marginBottom: 10,
        marginTop: Platform.OS === 'ios' ? -25 : -25,
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
    imageContainer: {
        width: 100,
        height: 100,
        marginRight: 5,
        marginTop: 70
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
    },

    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
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
        minWidth:20,
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
    }

});

export default TicketsTab;