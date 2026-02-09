import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '../../color/color';
import { logger } from '../../utils/logger';
import SvgIcons from '../../components/SvgIcons';
import Typography from '../../components/Typography';

const { width } = Dimensions.get('window');

// Event Card Component
const EventCard = ({ event, onPress, onBookmarkPress }) => (
  <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => onBookmarkPress && onBookmarkPress(event.uuid || event.eventUuid)}
      >
        <SvgIcons.bookmarkedIcon />
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>
      <Typography
        style={styles.eventTitle}
        weight="700"
        size={13}
        color={color.placeholderTxt_24282C}
      >
        {event.title || event.event_title}
      </Typography>
      <Typography
        style={styles.eventDate}
        weight="400"
        size={10}
        color={color.grey_87807C}
      >
        {event.date}
      </Typography>
      <Typography
        style={styles.eventTime}
        weight="400"
        size={10}
        color={color.grey_87807C}
      >
        {event.time}
      </Typography>
      <Typography
        style={styles.eventLocation}
        weight="400"
        size={10}
        color={color.brown_766F6A}
        numberOfLines={1}
      >
        {event.location || event.cityName}
      </Typography>
    </View>
  </TouchableOpacity>
);

// Main Explore Detail Screen for Tickets Tab Component
const ExploreDetailScreenTicketsTab = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Calculate top padding for safe area
  const topPadding = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 0)
    : insets.top;

  // Get section title, events, and onEventChange callback from route params
  const {
    sectionTitle = 'Explore Events',
    events: initialEvents = [],
    onEventChange
  } = route.params || {};

  const [events, setEvents] = useState(initialEvents);

  // Handle bookmark toggle
  const handleBookmarkPress = (eventUuid) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        (event.uuid || event.eventUuid) === eventUuid
          ? { ...event, isBookmarked: !event.isBookmarked }
          : event
      )
    );
  };

  // Handle event press - use onEventChange callback if available
  const handleEventPress = (event) => {
    // Get the real UUID
    const eventUuid = event.uuid || event.eventUuid;

    // Validate that we have a real UUID (not a fake id like '1', '2', etc.)
    if (!eventUuid || eventUuid.length < 10) {
      logger.error('Invalid event UUID in ExploreDetailScreenTicketsTab:', eventUuid);
      return;
    }

    logger.log('Event pressed in ExploreDetailScreenTicketsTab with UUID:', eventUuid);

    const eventForChange = {
      uuid: eventUuid,
      eventUuid: eventUuid,
      title: event.title || event.event_title,
      event_title: event.title || event.event_title,
      cityName: event.cityName || event.location,
      date: event.date,
      time: event.time,
    };

    if (onEventChange) {
      // Call the onEventChange callback to update MyTabs state
      // This will set showEventTickets=true and update eventInformation
      onEventChange(eventForChange);
      // Go back to the Tickets tab which will now show the Tickets component
      navigation.goBack();
    } else {
      // Fallback: navigate directly (for cases where callback isn't passed)
      logger.warn('No onEventChange callback available');
      navigation.goBack();
    }
  };

  // Handle back press
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <SvgIcons.backArrow />
        </TouchableOpacity>
        <Typography
          style={styles.headerTitle}
          weight="700"
          size={18}
          color={color.brown_3C200A}
        >
          {sectionTitle}
        </Typography>
        <TouchableOpacity style={styles.headerButton}>
          <SvgIcons.searchIconDark />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.uuid || event.eventUuid}
              event={event}
              onPress={() => handleEventPress(event)}
              onBookmarkPress={handleBookmarkPress}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Typography
              style={styles.emptyStateText}
              weight="400"
              size={16}
              color={color.grey_87807C}
            >
              No events available
            </Typography>
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F8F7F5',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  eventCard: {
    marginBottom: 24,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  cardContent: {
    paddingTop: 12,
  },
  eventTitle: {
    marginBottom: 6,
  },
  eventDate: {
    marginBottom: 2,
  },
  eventTime: {
    marginBottom: 6,
  },
  eventLocation: {
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ExploreDetailScreenTicketsTab;