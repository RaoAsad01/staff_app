import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
//import Header from '../../../../components/header';
import { color } from '../../../color/color';
import { useNavigation } from '@react-navigation/native';
import SvgIcons from '../../../../components/SvgIcons';
import { ticketService } from '../../../api/apiService';
import NoResults from '../../../components/NoResults';
import { formatValue } from '../../../constants/formatValue';

const TerminalsComponent = ({ eventInfo, onEventChange }) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [ticketOrders, setTicketOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!eventInfo?.eventUuid) {
          setError("Event UUID is not available.");
          setLoading(false);
          return; // Important: Exit if eventUuid is missing
        }

        const response = await ticketService.fetchAdminTerminals(eventInfo.eventUuid);
        console.log('admin terminals response', response);
        if (response?.data) {
          setTicketOrders(response.data);
        } else {
          setTicketOrders([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch admin terminals.');
        console.error('Error fetching admin terminals:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!eventInfo?.eventUuid) {
      setLoading(false); // Immediately stop loading if eventInfo is missing
      return;
    }
    fetchOrders();
  }, [eventInfo?.eventUuid]);

  const filterTickets = () => {
    if (!searchText) return ticketOrders;
    return ticketOrders.filter(
      (order) =>
        order.name?.toLowerCase().includes(searchText.toLowerCase())
      // You might want to add more fields to search by if your API returns them
    );
  };

  const getNoResultsMessage = () => {
    if (searchText) {
      return "No Matching Results";
    }
    return "No Matching Results";
  };

  const filteredTickets = filterTickets();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => navigation.navigate('StaffDashboard', {
        eventInfo: eventInfo,
        staffUuid: item.uuid,
        staffName: item.name,
        onEventChange: onEventChange
      })}
    >
      <View style={styles.ticketRow}>
        {/* Name Column */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>Name</Text>
          <Text style={styles.columnData}>{item.name || 'N/A'}</Text>
        </View>

        {/* Sales Column */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>Sales</Text>
          <Text style={styles.columnData}>{item.currency} {formatValue(item.sales)}</Text>
        </View>

        {/* Check-Ins Column */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>Check-Ins</Text>
          <Text style={styles.columnData}>{item.checkins}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {/* <Header eventInfo={eventInfo} /> */}
      <View style={styles.contentContainer}>
        <View style={[
          styles.searchContainer,
          isSearchFocused && styles.searchContainerFocused
        ]}>
          <TextInput
              style={[
                styles.searchBar,
                searchText ? styles.searchInputWithText : styles.searchInputPlaceholder
              ]}
            placeholder="John Doe"
            placeholderTextColor={color.brown_766F6A}
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
            selectionColor={color.selectField_CEBCA0}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <TouchableOpacity>
            <SvgIcons.searchIcon width={20} height={20} fill="transparent" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredTickets}
          renderItem={renderItem}
          keyExtractor={(item) => item.order_number?.toString() || Math.random().toString()} // Use order_number as key
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={() => (
            <NoResults message={getNoResultsMessage()} />
          )}
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    //backgroundColor: color.btnBrown_AE6F28,
  },
  contentContainer: {
    flex: 1,
    //backgroundColor: color.white_FFFFFF,
  },
  searchContainer: {
    backgroundColor: color.white_FFFFFF,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderColor: color.borderBrown_CEBCA0,
    borderWidth: 1,
    height: 45,
    marginHorizontal: 16,
  },
  searchContainerFocused: {
    borderColor: color.placeholderTxt_24282C,
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
  searchBar: {
    flex: 1,
    paddingVertical: 10,
  },
  ticketCard: {
    backgroundColor: color.white_FFFFFF,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 16,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  column: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  columnHeader: {
    fontSize: 14,
    color: color.placeholderTxt_24282C,
    fontWeight: '500',
    marginBottom: 8,
  },
  columnData: {
    fontSize: 14,
    color: color.placeholderTxt_24282C,
    fontWeight: '400',
  },
  flatListContent: {
    paddingBottom: 20,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
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
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  }

});

export default TerminalsComponent;