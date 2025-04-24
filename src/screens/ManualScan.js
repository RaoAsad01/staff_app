import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import Header from '../../components/header';
import { color } from '../color/color';
import { useNavigation } from '@react-navigation/native';
import SvgIcons from '../../components/SvgIcons';
import { ticketService } from '../api/apiService';

const ManualScan = ({ eventInfo }) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [ticketOrders, setTicketOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ticketService.fetchUserTicketOrders(eventInfo?.eventUuid);
        console.log('manual scan response', response);
        if (response?.data) {
          setTicketOrders(response.data);
        } else {
          setTicketOrders([]); // Handle empty data array
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch ticket orders.');
        console.error('Error fetching ticket orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (eventInfo?.eventUuid) {
      fetchOrders();
    } else {
      setError("Event UUID is not available.");
      setLoading(false);
    }
  }, [eventInfo?.eventUuid]);

  const filterTickets = () => {
    if (!searchText) return ticketOrders;
    return ticketOrders.filter(
      (order) =>
        order.order_number?.toString().includes(searchText) ||
        order.user_full_name?.toLowerCase().includes(searchText.toLowerCase())
      // You might want to add more fields to search by if your API returns them
    );
  };

  const filteredTickets = filterTickets();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => navigation.navigate('ManualCheckInAllTickets', { 
        ticket: item, 
        total: item.ticket_count,
        orderNumber: item.order_number, // Pass order number
        eventUuid: eventInfo?.eventUuid, // Pass event UUID
        eventInfo: eventInfo
      })}
    >
      <View style={styles.ticketRow}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <Text style={styles.name}>{item.user_full_name || 'N/A'}</Text>
          <Text style={styles.id}>{`#${item.order_number || 'N/A'}`}</Text>
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          <Text style={styles.type}>Tickets</Text>
          <Text style={styles.total}>{item.ticket_count?.toString() || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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

  return (
    <View style={styles.mainContainer}>
      <Header eventInfo={eventInfo} />
      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Order Number or User Name"
            placeholderTextColor={color.brown_766F6A}
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
            selectionColor={color.selectField_CEBCA0}
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
          ListEmptyComponent={<Text style={styles.emptyText}>No tickets found</Text>}
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
    marginBottom: 10,
    marginTop: 20,
    borderColor: color.borderBrown_CEBCA0,
    borderWidth: 1,
    height: 45,
    marginHorizontal: 16,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 10,
  },
  ticketCard: {
    borderWidth: 1,
    backgroundColor: color.white_FFFFFF,
    borderColor: color.white_FFFFFF,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 16,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    marginRight: 10,
  },
  rightColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginRight: 50
  },
  name: {
    marginBottom: 5,
    fontSize: 14,
    color: '#000000',
  },
  id: {
    fontSize: 14,
    color: '#000000',
    marginTop: 5,
  },
  type: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 5,
  },
  total: {
    fontSize: 14,
    color: '#000000',
    top:4
  },
  flatListContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 20,
  },
});

export default ManualScan;
