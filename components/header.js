import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { color } from '../src/color/color';
import SvgIcons from './SvgIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { truncateCityName } from '../src/utils/stringUtils';
import { truncateEventName } from '../src/utils/stringUtils';
import { formatDateWithMonthName } from '../src/constants/dateAndTime';

const { width } = Dimensions.get('window');

const Header = ({ eventInfo, onScanCountUpdate }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [tabKey, setTabKey] = useState(0);
  const [currentScanCount, setCurrentScanCount] = useState(eventInfo?.scanCount || '0');



  // Update scan count when eventInfo changes
  useEffect(() => {
    if (eventInfo?.scanCount !== undefined) {
      setCurrentScanCount(eventInfo.scanCount);
    }
  }, [eventInfo?.scanCount]);

  const formatStaffName = (fullName) => {
    if (!fullName) return 'A Moeez';

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      return `${firstName.charAt(0)} ${lastName}`;
    }
    return fullName;
  };

  const handleCountPress = () => {
    setTabKey(prevKey => prevKey + 1);
    navigation.navigate('LoggedIn', {
      eventInfo: eventInfo,
      screen: 'Tickets',
      params: {
        initialTab: 'Scanned',
        fromHeader: true,
      },
    });
  };

  // Check if current screen should show back button
  const shouldShowBackButton = () => {
    const currentRouteName = route.name;
    const detailScreens = ['ManualCheckInAllTickets', 'CheckInAllTickets', 'TicketScanned'];
    return detailScreens.includes(currentRouteName);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.statusBarPlaceholder} />
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.headerColumn}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.eventName} numberOfLines={1} ellipsizeMode="tail">{truncateEventName(eventInfo?.event_title) || 'OUTMOSPHERE'}</Text>
              <Text style={styles.separator}>   </Text>
              <Text style={styles.cityName} numberOfLines={1} ellipsizeMode="tail">{truncateCityName(eventInfo?.cityName) || 'Accra'}</Text>
              <Text style={styles.separator}>   </Text>
              <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{formatDateWithMonthName(eventInfo?.date) || '30 Oct 2025'}</Text>
              <Text style={styles.separator}> </Text>
              <Text style={styles.separator}> </Text>
              <Text style={styles.time} numberOfLines={1} ellipsizeMode="tail">{eventInfo?.time || '7:00 PM'}</Text>
            </View>
          </View>
          <View style={styles.profileId}>
            <View style={styles.userSection}>
              {shouldShowBackButton() ? (
                <TouchableOpacity onPress={handleBackPress} style={styles.backButtonContainer}>
                  <SvgIcons.backArrow width={24} height={24} fill={color.brown_3C200A} />
                </TouchableOpacity>
              ) : (
                <View></View>
              )}
              <SvgIcons.userSvg width={28} height={28} fill="transparent" />
              <Text style={styles.userId}>ID: {formatStaffName(eventInfo?.staff_name)}</Text>
            </View>
            <View style={styles.scanSection}>
              <Text style={styles.scan}>Scans</Text>
              <TouchableOpacity
                style={styles.count}
                onPress={handleCountPress}>
                <Text style={styles.countColor}>{currentScanCount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'transparent',
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'android' ? 0 : 0,
    backgroundColor: color.white_FFFFFF,
  },
  safeAreaContainer: {
    backgroundColor: color.white_FFFFFF,
  },
  headerColumn: {
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    backgroundColor: color.btnBrown_AE6F28,
    height: 48,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  separator: {
    fontSize: 14,
    fontWeight: '500',
    color: color.white_FFFFFF,
    marginHorizontal: 8,
  },
  profileId: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    width: '100%',
    backgroundColor: color.brown_F7E4B6,
    height: 48,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventName: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '500',
  },
  cityName: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '400',
  },
  date: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '400',
  },
  time: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '400',
  },
  userId: {
    color: color.brown_3C200A,
    fontSize: 14,
    fontWeight: '400',
    height: 22,
    marginLeft: 10,
    lineHeight: 22,
  },
  scan: {
    fontSize: 14,
    fontWeight: '400',
  },
  count: {
    marginLeft: 15,
    backgroundColor: color.black_2F251D,
    borderRadius: 4,
    width: 49,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countColor: {
    color: color.white_FFFFFF,
  },
  backButtonContainer: {
    marginRight: 10,
  },
});

export default Header;