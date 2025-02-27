import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, SafeAreaView, FlatList, ScrollView } from 'react-native';
import { color } from '../../color/color';
import OverallStatistics from './OverallStatistics';
import BoxOfficeSales from './BoxOfficeSales';
import { useNavigation } from '@react-navigation/native';
import SvgIcons from '../../../components/SvgIcons';
import { dashboardstatuslist } from '../../constants/dashboardstatuslist';
import CheckInSoldTicketsCard from './CheckInSolidTicketsCard';
import AttendeesComponent from './dashboardattendeestab';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState(dashboardstatuslist[0]);
  const handleTabPress = (tab) => {
    setSelectedTab(tab);
    // You can update the selectedTickets list based on the tab selection here.
    // Example: Filter the tickets dynamically based on the selected tab
    // setSelectedTickets(filteredTicketsBasedOnTab);
  };

  const checkInData = [
    { label: "Total Checked In", checkedIn: 345, total: 545, percentage: 70 },
    { label: "Standard", checkedIn: 150, total: 200, percentage: 70 },
    { label: "VIP", checkedIn: 100, total: 145, percentage: 70 },
    { label: "Member", checkedIn: 25, total: 50, percentage: 70 },
  ];

  const soldTicketsData = [
    { label: "Total Sold", checkedIn: 500, total: 700, percentage: 72 },
    { label: "Standard", checkedIn: 200, total: 300, percentage: 67 },
    { label: "VIP", checkedIn: 180, total: 250, percentage: 72 },
    { label: "Member", checkedIn: 120, total: 150, percentage: 80 },
  ];

  const attendeesData = [
    { label: 'Total Attendees', value: '500' },
    { label: 'VIP Attendees', value: '150' },
    { label: 'Standard Attendees', value: '300' },
    { label: 'Members Attendees', value: '50' },
  ];

  const renderContent = () => {
    if (selectedTab === 'Attendees') {
      return <AttendeesComponent attendeesData={attendeesData} />;
    } else {
      return (
        <CheckInSoldTicketsCard
          title={selectedTab}
          data={selectedTab === 'Checked In' ? checkInData : soldTicketsData}
        />
      );
    }
  };

const renderTab = ({ item }) => (
  <TouchableOpacity
    style={[
      styles.tabButton,
      selectedTab === item && styles.selectedTabButton,
    ]}
    onPress={() => handleTabPress(item)}
  >
    <Text
      style={[
        styles.tabButtonText,
        selectedTab === item && styles.selectedTabButtonText,
      ]}
    >
      {item}
    </Text>
  </TouchableOpacity>
);


return (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        <View style={styles.tabContainer}>
          <FlatList
            horizontal
            data={dashboardstatuslist}
            renderItem={renderTab}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {renderContent()}
      </View>
    </ScrollView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white_FFFFFF,
  },
  scrollContainer: {
    paddingBottom: 20,
    flexGrow: 1
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
  },
  tabContainer: {
    margin: 10,
  },
  tabButton: {
    padding: 10,
    marginHorizontal: 5,
  },
  tabButtonText: {
    color: color.black_544B45,
    fontSize: 14,
    fontWeight: '400',
  },
  selectedTabButton: {
    width: 105,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.white_FFFFFF,
    borderRadius: 7,
    backgroundColor: color.white_FFFFFF,
    marginRight: 10,
    margin: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  selectedTabButtonText: {
    color: color.brown_3C200A,
    fontWeight: '500',
    fontSize: 14
  },
});

export default DashboardScreen;
