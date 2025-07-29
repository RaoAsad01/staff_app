import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { color } from '../../../color/color';
import { dashboardattendeestab } from '../../../constants/dashboardattendeestab';
import SvgIcons from '../../../../components/SvgIcons';
import { ticketService } from '../../../api/apiService';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import NoResults from '../../../components/NoResults';

const AttendeesComponent = ({ eventInfo, onScanCountUpdate }) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
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
          status: ticket.checkin_status === 'SCANNED' ? 'Checked In' : 'No Show',
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
        };
      });

      setFetchedTickets(mappedTickets);
    } catch (err) {
      console.error('Error fetching ticket list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreTickets = () => {
    if (!isLoading && hasMore && eventInfo?.eventUuid) {
      fetchTicketList(eventInfo.eventUuid, currentPage + 1, true);
    }
  };

  const filterTickets = () => {
    let filteredTickets = fetchedTickets;

    if (searchText) {
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(searchText.toLowerCase()) ||
          ticket.type.toLowerCase().includes(searchText.toLowerCase()) ||
          ticket.ticketHolder.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (activeTab !== 'All') {
      filteredTickets = filteredTickets.filter((ticket) => {
        if (activeTab === 'Checked In') {
          return ticket.status === 'Checked In';
        } else if (activeTab === 'No Show') {
          return ticket.status === 'No Show';
        }
        return true;
      });
    }

    if (selectedFilter) {
      filteredTickets = filteredTickets.filter((ticket) =>
        ticket.type === selectedFilter || ticket.status === selectedFilter
      );
    }

    return filteredTickets;
  };

  const handleTicketPress = (ticket) => {
    const scanResponse = {
      message: ticket.status === 'Checked In' ? 'Ticket Scanned' : 'Ticket Unscanned',
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
    setActiveTab(tab);
    setSelectedFilter(null);
    setSearchText('');
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
  };

  const getNoResultsMessage = () => {
    if (searchText) {
      return "No Matching Results";
    }

    switch (activeTab) {
      case 'All':
        return "No Matching Results";
      case 'Checked In':
        return "No Matching Results";
      case 'No Show':
        return "No Matching Results";
      default:
        return "No Matching Results";
    }
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
            placeholderTextColor={color.brown_766F6A}
            onChangeText={handleSearchChange}
            value={searchText}
            selectionColor={color.selectField_CEBCA0}
          />
          <TouchableOpacity onPress={() => handleSearchChange(searchText)}>
            <SvgIcons.searchIcon width={20} height={20} fill="transparent" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={handleFilterButtonPress}>
          <SvgIcons.filterIcon width={20} height={20} />
        </TouchableOpacity>
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
                <Text style={styles.value}>{item.ticketHolder}</Text>
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
                item.status === 'Checked In' ? styles.checkInBadge : styles.noShowBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  item.status === 'Checked In' ? styles.checkInText : styles.noShowText,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : !isLoading ? (
        <NoResults message={getNoResultsMessage()} />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.brown_5A2F0E} />
        </View>
      )}

      {isLoading && filteredTickets.length > 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={color.brown_5A2F0E} />
        </View>
      )}

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
                    selectedFilter === 'Standard Pricing' ? null : 'Standard Pricing'
                  )
                }
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedFilter === 'Standard Pricing' && styles.checkedCheckbox,
                    ]}
                  >
                    {selectedFilter === 'Standard Pricing' && (
                      <SvgIcons.tickIcon width={15} height={15} />
                    )}
                  </View>
                  <Text style={styles.filterOptionText}>Standard Pricing</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() =>
                  setSelectedFilter(
                    selectedFilter === 'Early Bird Pricing' ? null : 'Early Bird Pricing'
                  )
                }
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedFilter === 'Early Bird Pricing' && styles.checkedCheckbox,
                    ]}
                  >
                    {selectedFilter === 'Early Bird Pricing' && (
                      <SvgIcons.tickIcon width={15} height={15} />
                    )}
                  </View>
                  <Text style={styles.filterOptionText}>Early Bird Pricing</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterOption}
                onPress={() =>
                  setSelectedFilter(
                    selectedFilter === 'Members Only Pricing' ? null : 'Members Only Pricing'
                  )
                }
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedFilter === 'Members Only Pricing' && styles.checkedCheckbox,
                    ]}
                  >
                    {selectedFilter === 'Members Only Pricing' && (
                      <SvgIcons.tickIcon width={15} height={15} />
                    )}
                  </View>
                  <Text style={styles.filterOptionText}>Members Only Pricing</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: color.white_FFFFFF,
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
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default AttendeesComponent;
