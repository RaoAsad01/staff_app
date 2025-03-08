import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color } from '../../color/color';
import { dashboardattendeestab } from '../../constants/dashboardattendeestab';
import { ticketslist } from '../../constants/ticketslist';
import SvgIcons from '../../../components/SvgIcons';

const AttendeesComponent = () => {
  //const [activeTab, setActiveTab] = useState("All");
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filterTickets = () => {
    let filteredTickets = ticketslist;
    if (searchText) {
        filteredTickets = ticketslist.filter(
            (ticket) =>
                ticket.id.includes(searchText) ||
                ticket.type.toLowerCase().includes(searchText.toLowerCase()) ||
                ticket.name.includes(searchText)
        );
    }

    if (selectedTab !== 'All') {
        filteredTickets = filteredTickets.filter((ticket) => ticket.dashboardstatus === activeTab);
    }
    return filteredTickets;
};

const handleSearchChange = (text) => {
  setSearchText(text);
};

const handleTabPress = (tab) => {
  setActiveTab(tab);
};

// const handleTicketPress = (ticket) => {
//   navigation.navigate('TicketScanned', {
//       status: ticket.dashboardstatus
//       note: ticket.note || 'No note added'
//   });
// };

  return (
    <ScrollView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {dashboardattendeestab.map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setActiveTab(tab)}  // Change active tab on press
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab  // Apply active style if selected
            ]}
          >
            <Text
              style={activeTab === tab ? styles.tabTextActive : styles.tabText}  // Active text style
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchFilterContainer}>
        {/* Search Bar */}
        <View style={styles.searchBar}>

          <TextInput
             style={styles.searchInput}
             placeholder="John Doe"
             placeholderTextColor={color.placeholderTxt_24282C}
             onChangeText={handleSearchChange}
             value={searchText}
             selectionColor={color.selectField_CEBCA0}
          />
           <TouchableOpacity onPress={() => handleSearchChange(searchText)}>
                    <SvgIcons.searchIcon width={20} height={20} fill="transparent" />
                </TouchableOpacity>
        </View>

        {/* Filter Icon */}
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color={color.brown_3C200A} />
        </TouchableOpacity>
      </View>

      {/* Attendees List */}
      {ticketslist.map((item, index) => (
        <View
          key={index}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{item.name}</Text>
              <Text style={styles.label}>Ticket ID</Text>
              <Text style={styles.value}>{item.id}</Text>
              <Text style={styles.label}>{item.type}</Text>
              <Text style={styles.value}>USD {item.price}</Text>
            </View>
            <View style={styles.qrCode}>
              {item.imageUrl && (
                <item.imageUrl width={"100%"} height={"100%"} />
              )}
            </View>
          </View>

          <View
            style={[
              styles.badge,
              item.dashboardstatus === 'Checked In' ? styles.checkInBadge : styles.noShowBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                item.dashboardstatus === 'Checked In' ? styles.checkInText : styles.noShowText,
              ]}
            >
              {item.dashboardstatus}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F7E4B680',
    backgroundColor: '#F7E4B680',
  },
  activeTab: {
    backgroundColor: color.btnBrown_AE6F28,
    borderColor: color.btnBrown_AE6F28,
  },
  tabText: {
    textAlign: 'center',
    color: color.black_544B45,
    fontWeight: '400',
    fontSize: 14,
  },
  tabTextActive: {
    color: color.white_FFFFFF,
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
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
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    paddingVertical: 5,
    marginLeft: 5,
  },
  searchIcon: {
    marginRight: 5,
  },
  filterButton: {
    backgroundColor: color.white,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
    height: 45,
    width: 46,
    marginBottom: 10,
    alignItems: 'center'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },
  checkedInCard: {
    borderWidth: 2,
    borderColor: '#007E33',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: color.black_544B45,
    marginBottom: 10
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2F251D',
    marginBottom: 5,
  },
  qrCode: {
    width: 100,
    height: 100,
    marginTop: 50
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  checkInBadge: {
    backgroundColor: '#FFE8BB',
    width: 90,
    alignItems: 'center'
  },
  noShowBadge: {
    backgroundColor: '#87807C20',
    width: 90,
    alignItems: 'center'
  },
  checkInText: {
    color: '#D58E00',
    fontSize: 10,
    fontWeight: '500',
    padding: 5
  },
  noShowText: {
    color: '#544B45',
    fontSize: 10,
    fontWeight: '500',
    padding: 5
  },
});

export default AttendeesComponent;
