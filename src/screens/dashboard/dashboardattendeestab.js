import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { color } from '../../color/color';
import { dashboardattendeestab } from '../../constants/dashboardattendeestab';
import { ticketslist } from '../../constants/ticketslist';
import SvgIcons from '../../../components/SvgIcons';

const AttendeesComponent = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);

  const filterTickets = () => {
    let filteredTickets = ticketslist;

    if (searchText) {
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.id.includes(searchText) ||
          ticket.type.toLowerCase().includes(searchText.toLowerCase()) ||
          ticket.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (activeTab !== 'All') {
      filteredTickets = filteredTickets.filter((ticket) => ticket.dashboardstatus === activeTab);
    }

    if (selectedFilter) {
      filteredTickets = filteredTickets.filter((ticket) =>
        ticket.type === selectedFilter || ticket.dashboardstatus === selectedFilter
      );
    }

    return filteredTickets;
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    setSelectedFilter(null);  // Clear any selected filter
    setSearchText('');        // Clear the search text
  };


  const handleFilterButtonPress = () => {
    setModalVisible(true);
  };

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setModalVisible(false);
  };

  const clearFilter = () => {
    setSelectedFilter(null);
    //setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        {dashboardattendeestab.map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleTabPress(tab)}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
          >
            <Text
              style={activeTab === tab ? styles.tabTextActive : styles.tabText}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchFilterContainer}>
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

        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <SvgIcons.filterIcon width={20} height={20} />

          <Modal visible={isModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filters</Text>
                  <TouchableOpacity onPress={clearFilter}>
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.filterOptionsContainer}>
                  <View style={styles.lineView} />
                  <Text style={styles.tickettype}>Ticket Type</Text>
                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() =>
                      setSelectedFilter(
                        selectedFilter === 'Standard Ticket' ? null : 'Standard Ticket'
                      )
                    }
                  >
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedFilter === 'Standard Ticket' && styles.checkedCheckbox,
                        ]}
                      >
                        {selectedFilter === 'Standard Ticket' && (
                          <SvgIcons.tickIcon width={15} height={15} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>Standard Tickets</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() =>
                      setSelectedFilter(
                        selectedFilter === 'VIP Ticket' ? null : 'VIP Ticket'
                      )
                    }
                  >
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedFilter === 'VIP Ticket' && styles.checkedCheckbox,
                        ]}
                      >
                        {selectedFilter === 'VIP Ticket' && (
                          <SvgIcons.tickIcon width={15} height={15} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>VIP Tickets</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() =>
                      setSelectedFilter(
                        selectedFilter === 'Members' ? null : 'Members'
                      )
                    }
                  >
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedFilter === 'Members' && styles.checkedCheckbox,
                        ]}
                      >
                        {selectedFilter === 'Members' && (
                          <SvgIcons.tickIcon width={15} height={15} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>Members</Text>
                    </View>
                  </TouchableOpacity>

                  <View>
                    <Text style={styles.tickettype}>Attendees</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() =>
                      setSelectedFilter(
                        selectedFilter === 'Checked In' ? null : 'Checked In'
                      )
                    }
                  >
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedFilter === 'Checked In' && styles.checkedCheckbox,
                        ]}
                      >
                        {selectedFilter === 'Checked In' && (
                          <SvgIcons.tickIcon width={15} height={15} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>Checked In</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() =>
                      setSelectedFilter(
                        selectedFilter === 'No Show' ? null : 'No Show'
                      )
                    }
                  >
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedFilter === 'No Show' && styles.checkedCheckbox,
                        ]}
                      >
                        {selectedFilter === 'No Show' && (
                          <SvgIcons.tickIcon width={15} height={15} />
                        )}
                      </View>
                      <Text style={styles.filterOptionText}>No Show</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </TouchableOpacity>
      </View>

      {filterTickets().map((item, index) => (
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
  filterButton: {
    backgroundColor: color.white,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
    height: 45,
    width: 46,
    marginBottom: 10,
    alignItems: 'center',
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
  },
  checkInBadge: {
    backgroundColor: '#FFE8BB',
    width: 90,
    alignItems: 'center',
  },
  noShowBadge: {
    backgroundColor: '#87807C20',
    width: 90,
    alignItems: 'center',
  },
  checkInText: {
    color: '#D58E00',
    fontSize: 10,
    fontWeight: '500',
    padding: 5,
  },
  noShowText: {
    color: '#544B45',
    fontSize: 10,
    fontWeight: '500',
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: color.brown_3C200A,
  },
  clearAllText: {
    color: color.btnBrown_AE6F28,
    fontWeight: '400',
    fontSize: 14,
    textDecorationLine: 'underline',
    textDecorationColor: color.btnBrown_AE6F28
  },
  filterOptionsContainer: {
    width: '100%',
    marginBottom: 15,
  },
  filterOption: {
    paddingVertical: 8,
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    backgroundColor: color.btnBrown_AE6F28,
    borderColor: color.btnBrown_AE6F28
  },
  checkboxTick: {
    color: color.red_FF0000,
    fontSize: 14,
  },
  filterOptionText: {
    color: color.black_544B45,
    fontSize: 14,
    fontWeight: '400'
  },
  applyButton: {
    backgroundColor: color.btnBrown_AE6F28,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48
  },
  applyButtonText: {
    color: color.btnTxt_FFF6DF,
    fontSize: 16,
    fontWeight: '700'
  },
  lineView: {
    borderColor: '#F1F1F1',
    width: '100%',
    height: 1,
    borderWidth: 0.5,
  },
  tickettype: {
    fontWeight: '500',
    fontSize: 16,
    color: color.brown_3C200A,
    marginTop: 10
  }
});


export default AttendeesComponent;
