import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { color } from '../color/color';
import { eventService } from '../api/apiService';
import Typography, { Body1, Heading5 } from './Typography';

const EventsModal = ({ visible, onClose, onEventSelect, currentEventUuid }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchEvents();
    }
  }, [visible]);



  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.fetchStaffEvents();

      if (response?.data && response.data.length > 0) {
        // The response.data is already an array of events
        const eventsData = response.data;

        // Transform the events to match the expected format
        const transformedEvents = eventsData.map(event => ({
          uuid: event.uuid || event.id,
          title: event.event_title || event.title
        }));

        setEvents(transformedEvents);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event) => {
    onEventSelect(event);
    onClose();
  };

  const renderEventItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.eventItem,
          currentEventUuid === item.uuid && styles.selectedEventItem
        ]}
        onPress={() => handleEventPress(item)}
      >
        <Body1 style={[
          styles.eventTitle,
          currentEventUuid === item.uuid && styles.selectedEventTitle
        ]}>
          {item.title || 'No title'}
        </Body1>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
              <Body1 style={styles.loadingText}>Loading events...</Body1>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Body1 style={styles.errorText}>{error}</Body1>
              <TouchableOpacity onPress={fetchEvents} style={styles.retryButton}>
                <Body1 style={styles.retryButtonText}>Retry</Body1>
              </TouchableOpacity>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Body1 style={styles.emptyText}>No events available</Body1>
            </View>
          ) : (
            <ScrollView
              style={styles.eventsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {events.map((item, index) => (
                <TouchableOpacity
                  key={item.uuid || index}
                  style={[
                    styles.eventItem,
                    index === 0 && styles.firstEventItem,
                    index === events.length - 1 && styles.lastEventItem
                  ]}
                  onPress={() => handleEventPress(item)}
                >
                  <Body1 style={[
                    styles.eventTitle,
                    currentEventUuid === item.uuid && styles.selectedEventTitle
                  ]}>
                    {item.title || 'No title'}
                  </Body1>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContainer: {
    backgroundColor: color.white_FFFFFF,
    marginTop: 48, // Position below the header
    marginHorizontal: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 8,
  },


  eventsList: {
    // No flex or height constraints - let content determine size
  },
  eventItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: color.white_FFFFFF,
    height: 30, // Fixed height for each item
  },
  selectedEventItem: {
    backgroundColor: color.brown_CEBCA04D,
    borderRadius: 8,
  },
  eventTitle: {
    color: color.black_544B45,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
  },
  selectedEventTitle: {
    color: color.brown_3C200A,
    fontWeight: '600',
  },
  firstEventItem: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lastEventItem: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomWidth: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: color.brown_3C200A,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: color.btnBrown_AE6F28,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: color.white_FFFFFF,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: color.black_544B45,
    textAlign: 'center',
  },
});

export default EventsModal;
