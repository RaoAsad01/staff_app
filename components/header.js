import React from 'react';
import { View, StyleSheet, Text, Platform, Dimensions, StatusBar, TouchableOpacity,SafeAreaView } from 'react-native';
import { color } from '../src/color/color';
import SvgIcons from './SvgIcons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Header = () => {
  const navigation = useNavigation();

  const handleCountPress = () => {
    navigation.navigate('Tickets');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerColumn}>
        <View style={styles.header}>
          {/* <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <SvgIcons.drawerSvg width={20} height={20} fill="transparent" />
          </TouchableOpacity> */}
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
            style={[styles.count]}
            onPress={handleCountPress}>
            <Text style={styles.countColor}>5</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white_FFFFFF,
  },
  headerColumn: {
    flexDirection: 'column',
    paddingTop: Platform.OS === 'android' ? 15: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: color.btnBrown_AE6F28,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 15, // Dynamic padding for Android
  },
  profileId: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: color.brown_F7E4B6,
  },
  eventName: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '500',
    paddingBottom: 5
  },
  cityName: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '400',
    paddingBottom: 6
  },
  date: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '400',
    paddingBottom: 6
  },
  time: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '400',
    paddingBottom: 6
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
  },
  count: {
    marginLeft: Platform.OS === 'ios' ? 30 : 15,
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