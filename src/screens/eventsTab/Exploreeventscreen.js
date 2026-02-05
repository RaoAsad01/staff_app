import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { color } from '../../color/color';

const { width } = Dimensions.get('window');

// Icons
const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke={color.black_2F251D}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke={color.black_2F251D} strokeWidth={2} />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={color.black_2F251D}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const BookmarkIcon = ({ filled = false }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
      stroke={color.btnBrown_AE6F28}
      strokeWidth={2}
      fill={filled ? color.btnBrown_AE6F28 : 'none'}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Attendee Avatars Component
const AttendeeAvatars = ({ attendees }) => (
  <View style={styles.attendeesContainer}>
    {attendees.map((attendee, index) => (
      <View
        key={index}
        style={[
          styles.attendeeAvatar,
          { backgroundColor: attendee.color, marginLeft: index > 0 ? -10 : 0 },
        ]}
      >
        <Text style={styles.attendeeInitial}>{attendee.initial}</Text>
      </View>
    ))}
  </View>
);

// Event Card Component
const EventCard = ({ event, onPress, onBookmarkPress }) => (
  <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <TouchableOpacity 
        style={styles.bookmarkButton} 
        onPress={() => onBookmarkPress && onBookmarkPress(event.id)}
      >
        <BookmarkIcon filled={event.isBookmarked} />
      </TouchableOpacity>
      {event.attendees && event.attendees.length > 0 && (
        <View style={styles.attendeesOverlay}>
          <AttendeeAvatars attendees={event.attendees} />
        </View>
      )}
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

// Main Explore Events Screen Component
const ExploreEventsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get section title and events from route params
  const { sectionTitle = 'Explore Events', events: initialEvents = [] } = route.params || {};

  // Sample data if no events passed
  const defaultEvents = [
    {
      id: '1',
      title: 'International Band Music',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      date: 'Wed, June 13',
      time: '7:00pm - 12:00 am',
      location: 'Natioanl Theatre, London, Grea...',
      isBookmarked: false,
      attendees: [],
    },
    {
      id: '2',
      title: 'Kyoto Shrine',
      image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
      date: 'Sun, June 10 - Wed, June 13',
      time: '7:00pm - 12:00 am',
      location: 'Fushimi, Shizuoka,',
      isBookmarked: false,
      attendees: [
        { initial: 'M', color: '#4A90D9' },
        { initial: 'H', color: '#2D2A26' },
      ],
    },
    {
      id: '3',
      title: 'International Band Music',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      date: 'Wed, June 13',
      time: '7:00pm - 12:00 am',
      location: 'Natioanl Theatre, London, Grea...',
      isBookmarked: false,
      attendees: [],
    },
  ];

  const [events, setEvents] = useState(
    initialEvents.length > 0 ? initialEvents : defaultEvents
  );

  // Handle bookmark toggle
  const handleBookmarkPress = (eventId) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? { ...event, isBookmarked: !event.isBookmarked }
          : event
      )
    );
  };

  // Handle event press
  const handleEventPress = (event) => {
    // Navigate to event detail or dashboard
    navigation.navigate('Dashboard', {
      eventInfo: {
        uuid: event.id,
        eventUuid: event.id,
        event_title: event.title,
        cityName: event.location,
        date: event.date,
        time: event.time,
      },
    });
  };

  // Handle back press
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sectionTitle}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <SearchIcon />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event)}
            onBookmarkPress={handleBookmarkPress}
          />
        ))}
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
    paddingTop: 60,
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
    fontSize: 18,
    fontWeight: '600',
    color: color.black_2F251D,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
  },
  attendeesOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  attendeesContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.6)',
  },
  attendeeInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContent: {
    paddingTop: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: color.black_2F251D,
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 14,
    color: color.grey_87807C,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 14,
    color: color.grey_87807C,
    marginBottom: 6,
  },
  eventLocation: {
    fontSize: 14,
    color: color.grey_87807C,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ExploreEventsScreen;