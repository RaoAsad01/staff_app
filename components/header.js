import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { color } from '../src/color/color';
import SvgIcons from './SvgIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Header = () => {
  const navigation = useNavigation();
  const [tabKey, setTabKey] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, []);

  const handleCountPress = () => {
    setTabKey(prevKey => prevKey + 1);
    navigation.navigate('Tickets', { initialTab: 'Scanned', fromHeader: true });
  };
  
  return (
    <View style={styles.mainContainer}>
      <View style={styles.statusBarPlaceholder} />
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.headerColumn}>
          <View style={styles.header}>
            <Text style={styles.eventName}>OUTMOSPHERE</Text>
            <Text style={styles.cityName}>Accra</Text>
            <Text style={styles.date}>28-12-2024</Text>
            <Text style={styles.date}>at</Text>
            <Text style={styles.time}>7:00 PM</Text>
          </View>
          <View style={styles.profileId}>
            <SvgIcons.userSvg width={28} height={28} fill="transparent" />
            <Text style={styles.userId}>ID: 87621237467</Text>
            <Text style={[styles.scan, { marginLeft: width * 0.25 }]}>Scans</Text>
            <TouchableOpacity
              style={styles.count}
              onPress={handleCountPress}>
              <Text style={styles.countColor}>5</Text>
            </TouchableOpacity>
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
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    backgroundColor: color.btnBrown_AE6F28,
    height: 48,
  },
  profileId: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    width: '100%',
    backgroundColor: color.brown_F7E4B6,
    height: 48,
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
    left: 5,
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
});

export default Header;