import React from 'react';
import { View, StyleSheet, Text, Platform, Dimensions, StatusBar,TouchableOpacity } from 'react-native';
import { color } from '../src/color/color';
import SvgIcons from './SvgIcons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Header = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.headerColumn}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <SvgIcons.drawerSvg width={20} height={20} fill="transparent" />
          </TouchableOpacity>
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
          <View style={styles.count}>
            <Text style={styles.countColor}>48</Text>
          </View>
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
    backgroundColor: color.white_FFFFFF,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20, // Dynamic padding for Android
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
    color: color.brown_3C200A,
    fontSize: 12,
    fontWeight: '500',
  },
  cityName: {
    color: color.brown_3C200A,
    fontSize: 12,
    fontWeight: '400',
  },
  date: {
    color: color.brown_3C200A,
    fontSize: 12,
    fontWeight: '400',
  },
  time: {
    color: color.brown_3C200A,
    fontSize: 14,
    fontSize: 12,
    fontWeight: '400',
  },
  userId: {
    color: color.brown_3C200A,
    fontSize: 14,
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