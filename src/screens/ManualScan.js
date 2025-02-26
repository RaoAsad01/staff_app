import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, StatusBar, TouchableOpacity, FlatList,SafeAreaView } from 'react-native';
import Header from '../../components/header';
import { color } from '../color/color';
import { attendeeslist } from '../constants/attendeeslist';
import { useNavigation} from '@react-navigation/native';
import SvgIcons from '../../components/SvgIcons';

const ManualScan = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');

  const filterTickets = () => {
    if (!searchText) return attendeeslist;
    return attendeeslist.filter(
      (attendee) =>
        attendee.id.includes(searchText) ||
        attendee.type.toLowerCase().includes(searchText.toLowerCase()) ||
        attendee.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const filteredTickets = filterTickets();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => navigation.navigate('ManualCheckInAllTickets', { ticket: item, total: item.total })}
    >
      <View style={styles.ticketRow}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.id}>{item.id}</Text>
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          <Text style={styles.type}>{item.type}</Text>
          <Text style={styles.total}>{item.total}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Header />
      <Text style={styles.inputLabel}>
        Enter the name, email, or phone number to{'\n'}search the ticket
      </Text>


      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search attendees"
          placeholderTextColor={color.placeholderTxt_24282C}
          onChangeText={(text) => setSearchText(text)}
          value={searchText}
          selectionColor={color.selectField_CEBCA0}
        />
        <TouchableOpacity>
         <SvgIcons.searchIcon width={20} height={20} fill="transparent" />
        </TouchableOpacity>
      </View>

      {/* FlatList */}
      <FlatList
        data={filteredTickets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tickets found</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white_FFFFFF
  },
  inputLabel: {
    paddingHorizontal: 46,
    fontSize: 14,
    color: color.black_544B45,
    marginTop: 20,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,  
    margin: 2
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
    marginBottom: 5, // Add spacing between type and total
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
