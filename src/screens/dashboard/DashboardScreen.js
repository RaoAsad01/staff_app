import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { color } from '../../color/color';
import OverallStatistics from './OverallStatistics';
import BoxOfficeSales from './BoxOfficeSales';
import { useNavigation } from '@react-navigation/native';
import SvgIcons from '../../../components/SvgIcons';
const DashboardScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <SvgIcons.drawerSvg width={20} height={20} fill="transparent" />
          </TouchableOpacity>
          <Text style={styles.countryName}>OUTMOSPHERE</Text>
          <Text style={styles.cityName}>Accra</Text>
          <Text style={styles.date}>28-12-2024</Text>
          <Text style={styles.date}>at</Text>
          <Text style={styles.time}>7:00 PM</Text>
        </View>
        <Text style={styles.labelDashboard}>Dashboard</Text>
        <OverallStatistics />
        <BoxOfficeSales />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white_FFFFFF,
  },
  wrapper: {
    flex: 1,
    backgroundColor: color.white_FFFFFF
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
  },
  countryName: {
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
  labelDashboard: {
    fontSize: 20,
    fontWeight: '500',
    color: color.brown_3C200A,
    paddingLeft: 10
  }
});

export default DashboardScreen;
