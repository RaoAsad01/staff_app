import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '../../color/color';
import { eventService } from '../../api/apiService';
import { logger } from '../../utils/logger';
import SvgIcons from '../../components/SvgIcons';
import Typography from '../../components/Typography';

const { width } = Dimensions.get('window');

// Countdown Timer Component
const CountdownTimer = ({ days, hours, mins }) => (
  <View style={styles.countdownContainer}>
    <View style={styles.countdownBox}>
      <Typography
        style={styles.countdownNumber}
        weight="700"
        size={16}
        color={color.brown_3C200A}
      >
        {days.toString().padStart(2, '0')}
      </Typography>
      <Typography
        style={styles.countdownLabel}
        weight="400"
        size={11}
        color={color.brown_3C200A}
      >
        Days
      </Typography>
    </View>
    <View style={styles.countdownBox}>
      <Typography
        style={styles.countdownNumber}
        weight="700"
        size={16}
        color={color.brown_3C200A}
      >
        {hours.toString().padStart(2, '0')}
      </Typography>
      <Typography
        style={styles.countdownLabel}
        weight="400"
        size={11}
        color={color.brown_3C200A}
      >
        Hours
      </Typography>
    </View>
    <View style={styles.countdownBox}>
      <Typography
        style={styles.countdownNumber}
        weight="700"
        size={16}
        color={color.brown_3C200A}
      >
        {mins.toString().padStart(2, '0')}
      </Typography>
      <Typography
        style={styles.countdownLabel}
        weight="400"
        size={11}
        color={color.brown_3C200A}
      >
        Min
      </Typography>
    </View>
  </View>
);

// Single Large Event Card (for single event in section)
const LargeEventCard = ({ event, onPress }) => (
  <TouchableOpacity style={styles.largeCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.largeImageContainer}>
      <Image source={{ uri: event.image }} style={styles.largeImage} />
      <TouchableOpacity style={styles.bookmarkButton}>
        <SvgIcons.bookmarkedIcon />
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>
      <Typography
        style={styles.eventTitle}
        weight="700"
        size={13}
        color={color.brown_3C200A}
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

// Small Event Card (for multiple events - horizontal scroll)
const SmallEventCard = ({ event, isFirst, onPress }) => (
  <TouchableOpacity
    style={[styles.smallCard, isFirst && { marginLeft: 20 }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.smallImageContainer}>
      <Image source={{ uri: event.image }} style={styles.smallImage} />
      <TouchableOpacity style={styles.bookmarkButtonSmall}>
        <SvgIcons.bookmarkedIcon />
      </TouchableOpacity>
    </View>
    <View style={styles.smallCardContent}>
      <Typography
        style={styles.smallEventTitle}
        weight="700"
        size={13}
        color={color.brown_3C200A}
        numberOfLines={1}
      >
        {event.title || event.event_title}
      </Typography>
      <Typography
        style={styles.smallEventDate}
        weight="400"
        size={10}
        color={color.grey_87807C}
      >
        {event.date}
      </Typography>
      <Typography
        style={styles.smallEventTime}
        weight="400"
        size={10}
        color={color.grey_87807C}
      >
        {event.time}
      </Typography>
      <Typography
        style={styles.smallEventLocation}
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

// Upcoming Event List Item
const UpcomingEventItem = ({ event, onPress }) => (
  <TouchableOpacity style={styles.upcomingItem} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: event.image }} style={styles.upcomingImage} />
    <View style={styles.upcomingContent}>
      <Typography
        style={styles.upcomingTitle}
        weight="600"
        size={13}
        color={color.brown_3C200A}
      >
        {event.title || event.event_title}
      </Typography>
      <View style={styles.upcomingMeta}>
        <Typography
          style={styles.upcomingDate}
          weight="400"
          size={10}
          color={color.grey_87807C}
        >
          {event.date}
        </Typography>
        {event.time ? (
          <>
            <View style={styles.upcomingDot} />
            <Typography
              style={styles.upcomingTime}
              weight="400"
              size={10}
              color={color.grey_87807C}
            >
              {event.time}
            </Typography>
          </>
        ) : null}
      </View>
      <Typography
        style={styles.upcomingLocation}
        weight="400"
        size={10}
        color={color.brown_766F6A}
      >
        {event.location || event.cityName}
      </Typography>
    </View>
    <TouchableOpacity style={styles.upcomingBookmark}>
      <SvgIcons.bookmarkedIcon />
    </TouchableOpacity>
  </TouchableOpacity>
);

// Event Section Component
const EventSection = ({ section, onEventPress, onSectionPress }) => {
  const isSingleEvent = section.events.length === 1;
  const isHappeningToday = section.title === 'Happening Today';

  return (
    <View style={[styles.section, isHappeningToday && styles.happeningTodaySection]}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <TouchableOpacity
            style={styles.sectionTitleContainer}
            onPress={() => onSectionPress && onSectionPress(section)}
          >
            <Typography
              style={styles.sectionTitle}
              weight="700"
              size={14}
              color={color.placeholderTxt_24282C}
            >
              {section.title}
            </Typography>
            <SvgIcons.rightArrow width={10} height={10} />
          </TouchableOpacity>
          {section.subtitle && (
            <Typography
              style={styles.sectionSubtitle}
              weight="400"
              size={12}
              color={color.red_BA1C11}
            >
              {section.subtitle}
            </Typography>
          )}
        </View>
        {section.countdown && <CountdownTimer {...section.countdown} />}
      </View>

      {isSingleEvent ? (
        <View style={styles.singleEventContainer}>
          <LargeEventCard
            event={section.events[0]}
            onPress={() => onEventPress && onEventPress(section.events[0])}
          />
        </View>
      ) : (
        <FlatList
          data={section.events}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.uuid || item.eventUuid}
          renderItem={({ item, index }) => (
            <SmallEventCard
              event={item}
              isFirst={index === 0}
              onPress={() => onEventPress && onEventPress(item)}
            />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      )}
    </View>
  );
};

// Main Events Tickets Tab Screen Component
const EventsTicketsTab = ({ eventInfo, onEventChange }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const topPadding = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 0)
    : insets.top;

  const [loading, setLoading] = useState(true);
  const [eventSections, setEventSections] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Toggle between single and multiple events display mode (for demo)
  const [isMultipleMode, setIsMultipleMode] = useState(false);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const staffEventsData = await eventService.fetchStaffEvents();
        const eventsList = staffEventsData?.data || [];

        logger.log('Fetched events for Tickets tab:', eventsList);

        // Process events - handle both direct events array and nested structure
        let allEvents = [];
        eventsList.forEach(item => {
          if (item.events && Array.isArray(item.events)) {
            allEvents = [...allEvents, ...item.events];
          } else if (item.uuid) {
            allEvents.push(item);
          }
        });

        // Transform all events with proper UUIDs
        const transformedEvents = allEvents
          .filter(event => event.uuid || event.eventUuid) // Only include events with valid UUIDs
          .map(event => {
            const eventUuid = event.uuid || event.eventUuid;
            return {
              uuid: eventUuid,
              eventUuid: eventUuid,
              title: event.title || event.event_title,
              event_title: event.title || event.event_title,
              image: event.image || event.banner_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
              date: event.start_date || event.date || 'TBD',
              time: event.start_time || event.time || 'TBD',
              location: event.location?.city || event.cityName || event.venue || 'TBD',
              cityName: event.location?.city || event.cityName,
              isBookmarked: false,
            };
          });

        // Organize events into sections based on mode
        const happeningToday = [];
        const comingUpThisWeek = [];
        const upcoming = [];

        if (isMultipleMode) {
          // Multiple mode: show multiple events in each section (horizontal scroll)
          transformedEvents.forEach((event, index) => {
            if (index < 2) {
              happeningToday.push(event);
            } else if (index < 4) {
              comingUpThisWeek.push(event);
            } else {
              upcoming.push(event);
            }
          });
        } else {
          // Single mode: show one event per section (large card)
          transformedEvents.forEach((event, index) => {
            if (index === 0) {
              happeningToday.push(event);
            } else if (index === 1) {
              comingUpThisWeek.push(event);
            } else {
              upcoming.push(event);
            }
          });
        }

        const sections = [];
        if (happeningToday.length > 0) {
          sections.push({
            title: 'Happening Today',
            // Change subtitle based on mode: "Starting in:" for single, "Ending in:" for multiple
            subtitle: isMultipleMode ? 'Ending in:' : 'Starting in:',
            countdown: { days: 0, hours: 12, mins: 5 },
            events: happeningToday,
          });
        }
        if (comingUpThisWeek.length > 0) {
          sections.push({
            title: 'Coming Up This Week',
            events: comingUpThisWeek,
          });
        }

        setEventSections(sections);
        setUpcomingEvents(upcoming);

      } catch (error) {
        logger.error('Error fetching events for Tickets tab:', error);
        // Show empty state instead of sample data to avoid using fake IDs
        setEventSections([]);
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isMultipleMode]); // Re-fetch when mode changes

  // Handle event press - ONLY use real UUIDs from API
  const handleEventPress = (event) => {
    // Validate that we have a real UUID
    const eventUuid = event.uuid || event.eventUuid;

    if (!eventUuid || eventUuid.length < 10) {
      logger.error('Invalid event UUID, cannot navigate:', eventUuid);
      return;
    }

    const eventForChange = {
      uuid: eventUuid,
      eventUuid: eventUuid,
      title: event.title || event.event_title,
      event_title: event.title || event.event_title,
      cityName: event.cityName || event.location,
      date: event.date,
      time: event.time,
    };

    logger.log('Event selected in EventsTicketsTab:', eventForChange);

    if (onEventChange) {
      onEventChange(eventForChange);
    }
  };

  // Handle section title press
  const handleSectionPress = (section) => {
    navigation.navigate('ExploreDetailScreenTicketsTab', {
      sectionTitle: section.title === 'Happening Today' ? 'Explore Events' : section.title,
      events: section.events,
      onEventChange: onEventChange,
    });
  };

  // Handle upcoming section press
  const handleUpcomingSectionPress = () => {
    if (upcomingEvents.length > 0) {
      navigation.navigate('ExploreDetailScreenTicketsTab', {
        sectionTitle: 'Upcoming Events',
        events: upcomingEvents,
        onEventChange: onEventChange,
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
        <Typography
          style={styles.loadingText}
          weight="400"
          size={14}
          color={color.grey_87807C}
        >
          Loading events...
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
        <View style={styles.headerButton} />
        <Typography
          style={styles.headerTitle}
          weight="700"
          size={18}
          color={color.brown_3C200A}
        >
          Tickets
        </Typography>
        <TouchableOpacity style={styles.headerButton}>
          <SvgIcons.searchIconDark />
        </TouchableOpacity>
      </View>

      {/* Demo Toggle - Remove in production */}
      <TouchableOpacity
        style={styles.demoToggle}
        onPress={() => setIsMultipleMode(!isMultipleMode)}
      >
        <Typography
          style={styles.demoToggleText}
          weight="500"
          size={12}
          color={color.btnBrown_AE6F28}
        >
          Mode: {isMultipleMode ? 'Multiple Events' : 'Single Event'} (Tap to switch)
        </Typography>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Sections */}
        {eventSections.map((section, index) => (
          <EventSection
            key={index}
            section={section}
            onEventPress={handleEventPress}
            onSectionPress={handleSectionPress}
          />
        ))}

        {/* Upcoming Section */}
        {upcomingEvents.length > 0 && (
          <View style={styles.upcomingSection}>
            <TouchableOpacity
              style={styles.sectionTitleContainer}
              onPress={handleUpcomingSectionPress}
            >
              <Typography
                style={styles.sectionTitle}
                weight="700"
                size={14}
                color={color.placeholderTxt_24282C}
              >
                Upcoming
              </Typography>
              <SvgIcons.rightArrow width={10} height={10} />
            </TouchableOpacity>

            {upcomingEvents.map((event) => (
              <UpcomingEventItem
                key={event.uuid}
                event={event}
                onPress={() => handleEventPress(event)}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {eventSections.length === 0 && upcomingEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Typography
              style={styles.emptyStateText}
              weight="400"
              size={16}
              color={color.brown_766F6A}
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
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  demoToggle: {
    backgroundColor: color.btnTxt_FFF6DF,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  demoToggleText: {
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
  },
  section: {
    marginBottom: 24,
  },
  happeningTodaySection: {
    backgroundColor: '#FFF6DF',
    paddingTop: 16,
    paddingBottom: 20,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTitle: {
  },
  sectionSubtitle: {
    marginTop: 2,
  },
  countdownContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countdownBox: {
    backgroundColor: color.white_FFFFFF,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 55,
  },
  countdownNumber: {
  },
  countdownLabel: {
    marginTop: 2,
  },
  singleEventContainer: {
    paddingHorizontal: 20,
  },
  largeCard: {},
  largeImageContainer: {
    height: 200,
  },
  largeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  cardContent: {
    paddingTop: 10,
  },
  eventTitle: {
    marginBottom: 8,
  },
  eventDate: {
    marginBottom: 2,
  },
  eventTime: {
    marginBottom: 8,
  },
  eventLocation: {
  },
  horizontalList: {
    paddingRight: 20,
  },
  smallCard: {
    width: width * 0.55,
    marginRight: 12,
  },
  smallImageContainer: {
    height: 140,
  },
  smallImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  bookmarkButtonSmall: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 6,
  },
  smallCardContent: {
    paddingTop: 10,
  },
  smallEventTitle: {
    marginBottom: 6,
  },
  smallEventDate: {
    marginBottom: 2,
  },
  smallEventTime: {
    marginBottom: 6,
  },
  smallEventLocation: {
  },
  upcomingSection: {
    paddingHorizontal: 20,
  },
  upcomingItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: color.white_FFFFFF,
  },
  upcomingImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  upcomingContent: {
    flex: 1,
    marginLeft: 12,
  },
  upcomingTitle: {
    marginBottom: 4,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  upcomingDate: {
  },
  upcomingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.brown_766F6A,
    marginHorizontal: 8,
  },
  upcomingTime: {
  },
  upcomingLocation: {
  },
  upcomingBookmark: {
    padding: 8,
    paddingBottom: 65,
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

export default EventsTicketsTab;