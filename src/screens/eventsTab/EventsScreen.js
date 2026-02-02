import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Color palette matching the design
const colors = {
  primary: '#B8860B',
  primaryLight: '#F5A623',
  primaryLighter: '#FFF5E0',
  background: '#F8F7F5',
  cardBg: '#FFFFFF',
  text: '#2D2A26',
  textSecondary: '#6B5E4F',
  textMuted: '#9B9189',
  border: '#EDE9E3',
  accent: '#C75D3A',
};

// Note: Event and EventSection are used as object shapes in the code
// Event: { id, title, image, date, time, location, isBookmarked?, attendees? }
// EventSection: { title, subtitle?, countdown?, events }

// Icons
const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke={colors.text} strokeWidth={2} />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const BookmarkIcon = ({ filled = false }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
      stroke={filled ? colors.primaryLight : colors.primaryLight}
      strokeWidth={2}
      fill={filled ? colors.primaryLight : 'none'}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Countdown Timer Component
const CountdownTimer = ({
  days,
  hours,
  mins,
}) => (
  <View style={styles.countdownContainer}>
    <View style={styles.countdownBox}>
      <Text style={styles.countdownNumber}>
        {days.toString().padStart(2, '0')}
      </Text>
      <Text style={styles.countdownLabel}>Days</Text>
    </View>
    <View style={styles.countdownBox}>
      <Text style={styles.countdownNumber}>
        {hours.toString().padStart(2, '0')}
      </Text>
      <Text style={styles.countdownLabel}>Hours</Text>
    </View>
    <View style={styles.countdownBox}>
      <Text style={styles.countdownNumber}>
        {mins.toString().padStart(2, '0')}
      </Text>
      <Text style={styles.countdownLabel}>Min</Text>
    </View>
  </View>
);

// Attendee Avatars Component
const AttendeeAvatars = ({
  attendees,
}) => (
  <View style={styles.attendeesContainer}>
    {attendees.map((attendee, index) => (
      <View
        key={index}
        style={[
          styles.attendeeAvatar,
          { backgroundColor: attendee.color, marginLeft: index > 0 ? -8 : 0 },
        ]}
      >
        <Text style={styles.attendeeInitial}>{attendee.initial}</Text>
      </View>
    ))}
  </View>
);

// Single Large Event Card (for single event in section)
const LargeEventCard = ({ event, onPress }) => (
  <TouchableOpacity style={styles.largeCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.largeImageContainer}>
      <Image source={{ uri: event.image }} style={styles.largeImage} />
      <TouchableOpacity style={styles.bookmarkButton}>
        <BookmarkIcon filled={event.isBookmarked} />
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventDate}>{event.date}</Text>
      <Text style={styles.eventTime}>{event.time}</Text>
      <Text style={styles.eventLocation} numberOfLines={1}>
        {event.location}
      </Text>
    </View>
  </TouchableOpacity>
);

// Small Event Card (for multiple events - horizontal scroll)
const SmallEventCard = ({
  event,
  isFirst,
  onPress,
}) => (
  <TouchableOpacity style={[styles.smallCard, isFirst && { marginLeft: 20 }]} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.smallImageContainer}>
      <Image source={{ uri: event.image }} style={styles.smallImage} />
      <TouchableOpacity style={styles.bookmarkButtonSmall}>
        <BookmarkIcon filled={event.isBookmarked} />
      </TouchableOpacity>
    </View>
    <View style={styles.smallCardContent}>
      <Text style={styles.smallEventTitle} numberOfLines={1}>
        {event.title}
      </Text>
      <Text style={styles.smallEventDate}>{event.date}</Text>
      <Text style={styles.smallEventTime}>{event.time}</Text>
      <Text style={styles.smallEventLocation} numberOfLines={1}>
        {event.location}
      </Text>
    </View>
  </TouchableOpacity>
);

// Upcoming Event List Item
const UpcomingEventItem = ({ event, onPress }) => (
  <TouchableOpacity style={styles.upcomingItem} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: event.image }} style={styles.upcomingImage} />
    <View style={styles.upcomingContent}>
      <Text style={styles.upcomingTitle}>{event.title}</Text>
      <View style={styles.upcomingMeta}>
        <Text style={styles.upcomingDate}>{event.date}</Text>
        <View style={styles.upcomingDot} />
        <Text style={styles.upcomingTime}>{event.time}</Text>
      </View>
      <Text style={styles.upcomingLocation}>{event.location}</Text>
    </View>
    <TouchableOpacity style={styles.upcomingBookmark}>
      <BookmarkIcon filled={event.isBookmarked} />
    </TouchableOpacity>
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader = ({
  title,
  subtitle,
  countdown,
  onPress,
}) => (
  <View style={styles.sectionHeader}>
    <TouchableOpacity style={styles.sectionTitleContainer} onPress={onPress}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ChevronRightIcon />
    </TouchableOpacity>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    {countdown && <CountdownTimer {...countdown} />}
  </View>
);

// Event Section Component - handles single vs multiple events
const EventSection = ({ section, onEventPress }) => {
  const isSingleEvent = section.events.length === 1;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <TouchableOpacity style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <ChevronRightIcon />
          </TouchableOpacity>
          {section.subtitle && (
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          )}
        </View>
        {section.countdown && <CountdownTimer {...section.countdown} />}
      </View>

      {isSingleEvent ? (
        // Single event - show large card
        <View style={styles.singleEventContainer}>
          <LargeEventCard event={section.events[0]} onPress={() => onEventPress && onEventPress(section.events[0])} />
        </View>
      ) : (
        // Multiple events - show horizontal scroll
        <FlatList
          data={section.events}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SmallEventCard event={item} isFirst={index === 0} onPress={() => onEventPress && onEventPress(item)} />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      )}
    </View>
  );
};

// Main Events Screen Component
const EventsScreen = ({ eventInfo, onEventChange }) => {
  const navigation = useNavigation();
  // Sample data - in real app this would come from API/props
  const [eventSections, setEventSections] = useState([
    {
      title: 'Happening Today',
      subtitle: 'Starting in:',
      countdown: { days: 0, hours: 12, mins: 5 },
      events: [
        {
          id: '1',
          title: 'International Band Music',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
          date: 'Wed, June 13',
          time: '7:00pm - 12:00 am',
          location: 'Natioanl Theatre, London, Great...',
          isBookmarked: false,
          attendees: [
            { initial: 'H', color: '#9B8AFB' },
            { initial: 'M', color: '#34D399' },
          ],
        },
      ],
    },
    {
      title: 'Coming Up This Week',
      events: [
        {
          id: '2',
          title: 'Kyoto Shrine',
          image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
          date: 'Sun, June 10 - Wed, June 13',
          time: '7:00pm - 12:00 am',
          location: 'Fushimi, Shizuoka,',
          isBookmarked: false,
        },
      ],
    },
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: '3',
      title: "Women's leadership conference",
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
      date: 'June 10, 2025',
      time: '7:00 PM',
      location: 'City Hall, London',
      isBookmarked: false,
    },
  ]);

  // Toggle between single and multiple events for demo
  const [isMultipleMode, setIsMultipleMode] = useState(false);

  // Sample data for multiple events mode
  const multipleEventSections = [
    {
      title: 'Happening Today',
      subtitle: 'Ending in:',
      countdown: { days: 0, hours: 12, mins: 5 },
      events: [
        {
          id: '1',
          title: 'International Band Music',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
          date: 'Wed, June 13',
          time: '7:00pm - 12:00 am',
          location: 'Natioanl Theatre, L...',
          isBookmarked: false,
        },
        {
          id: '1b',
          title: 'Kyoto Shrine',
          image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
          date: 'Sun, June 10 - Wed',
          time: '7:00pm - 12:00 am',
          location: 'Fushimi, Shizuoka,',
          isBookmarked: false,
        },
      ],
    },
    {
      title: 'Coming Up This Week',
      events: [
        {
          id: '2',
          title: 'Kyoto Shrine',
          image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
          date: 'Sun, June 10 - Wed, June 13',
          time: '7:00pm - 12:00 am',
          location: 'Fushimi, Shizuoka,',
          isBookmarked: false,
        },
        {
          id: '2b',
          title: 'International Band Music',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
          date: 'Wed, June 13',
          time: '7:00pm - 12:00 am',
          location: 'Natioanl Theatre, L...',
          isBookmarked: false,
        },
      ],
    },
  ];

  const multipleUpcomingEvents = [
    {
      id: '3',
      title: "Women's leadership conference",
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
      date: 'June 10, 2025',
      time: '7:00 PM',
      location: 'City Hall, London',
      isBookmarked: false,
    },
    {
      id: '4',
      title: "Women's leadership conference",
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
      date: 'June 10, 2025',
      time: '7:00 PM',
      location: 'City Hall, London',
      isBookmarked: false,
    },
  ];

  const currentSections = isMultipleMode ? multipleEventSections : eventSections;
  const currentUpcoming = isMultipleMode ? multipleUpcomingEvents : upcomingEvents;

  // Handle event press - navigate to Dashboard
  const handleEventPress = (event) => {
    // Transform event data to match expected format
    const transformedEvent = {
      uuid: event.id || event.uuid,
      eventUuid: event.id || event.uuid,
      event_title: event.title,
      cityName: event.location || 'Accra',
      date: event.date || new Date().toISOString().split('T')[0],
      time: event.time || '7:00 PM',
    };

    // If onEventChange callback exists, call it
    if (onEventChange) {
      onEventChange(transformedEvent);
    }

    // Navigate to Dashboard tab
    navigation.navigate('Dashboard', {
      eventInfo: transformedEvent,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity style={styles.headerButton}>
          <SearchIcon />
        </TouchableOpacity>
      </View>

      {/* Demo Toggle - Remove in production */}
      <TouchableOpacity
        style={styles.demoToggle}
        onPress={() => setIsMultipleMode(!isMultipleMode)}
      >
        <Text style={styles.demoToggleText}>
          Mode: {isMultipleMode ? 'Multiple Events' : 'Single Event'} (Tap to switch)
        </Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Sections */}
        {currentSections.map((section, index) => (
          <EventSection key={index} section={section} onEventPress={handleEventPress} />
        ))}

        {/* Upcoming Section */}
        <View style={styles.upcomingSection}>
          <TouchableOpacity style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <ChevronRightIcon />
          </TouchableOpacity>

          {currentUpcoming.map((event) => (
            <UpcomingEventItem key={event.id} event={event} onPress={() => handleEventPress(event)} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  demoToggle: {
    backgroundColor: colors.primaryLighter,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  demoToggleText: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 2,
  },
  countdownContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countdownBox: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  countdownNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  countdownLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  singleEventContainer: {
    paddingHorizontal: 20,
  },
  largeCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  largeImageContainer: {
    position: 'relative',
    height: 200,
  },
  largeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
  },
  attendeesOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  attendeesContainer: {
    flexDirection: 'row',
  },
  attendeeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.cardBg,
  },
  attendeeInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: colors.textMuted,
  },
  horizontalList: {
    paddingRight: 20,
  },
  smallCard: {
    width: width * 0.55,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  smallImageContainer: {
    position: 'relative',
    height: 140,
  },
  smallImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookmarkButtonSmall: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: 6,
  },
  smallCardContent: {
    padding: 12,
  },
  smallEventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  smallEventDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  smallEventTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  smallEventLocation: {
    fontSize: 12,
    color: colors.textMuted,
  },
  upcomingSection: {
    paddingHorizontal: 20,
  },
  upcomingItem: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  upcomingDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  upcomingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: 8,
  },
  upcomingTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  upcomingLocation: {
    fontSize: 13,
    color: colors.textMuted,
  },
  upcomingBookmark: {
    padding: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default EventsScreen;
