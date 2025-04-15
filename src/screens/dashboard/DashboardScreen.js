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
import AnalyticsChart from './AnalyticsChart';

const DashboardScreen = ({eventInfo}) => {
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
 
  const checkedInChartData = [
    { time: "12pm", value: 40, isHighlighted: false },
    { time: "1pm", value: 80, isHighlighted: false },
    { time: "2pm", value: 100, isHighlighted: false },
    { time: "3pm", value: 85, isHighlighted: false },
    { time: "4pm", value: 110, isHighlighted: false },
    { time: "5pm", value: 110, isHighlighted: true },
    { time: "6pm", value: 105, isHighlighted: false },
  ];

  const soldTicketsChartData = [
    { time: "12pm", value: 50, isHighlighted: false },
    { time: "1pm", value: 90, isHighlighted: false },
    { time: "2pm", value: 110, isHighlighted: false },
    { time: "3pm", value: 95, isHighlighted: false },
    { time: "4pm", value: 120, isHighlighted: false },
    { time: "5pm", value: 120, isHighlighted: true },
    { time: "6pm", value: 115, isHighlighted: false },
  ];

  const attendeesData = [
    { label: 'Total Attendees', value: '500' },
    { label: 'VIP Attendees', value: '150' },
    { label: 'Standard Attendees', value: '300' },
    { label: 'Members Attendees', value: '50' },
  ];

  const filteredSoldTicketsData = soldTicketsData; // Keep Total Sold in Sold Tickets
  const remainingTicketsData = soldTicketsData.filter(
    (item) => item.label !== "Total Sold" // ✅ Remove "Total Sold" from Remaining Tickets
  );
  
  const renderContent = () => {
    if (selectedTab === "Attendees") {
      return <AttendeesComponent attendeesData={attendeesData} />;
    } else if (selectedTab === "Checked In" || selectedTab === "Sold Tickets") {
      const chartData =
        selectedTab === "Checked In" ? checkedInChartData : soldTicketsChartData;
      
      // Filter out "Total Sold" for remaining tickets
      const remainingTicketsData = selectedTab === "Sold Tickets" 
        ? soldTicketsData.filter(item => item.label !== "Total Sold")
        : [];

      return (
        <>
          <CheckInSoldTicketsCard
            title={selectedTab}
            data={selectedTab === "Checked In" ? checkInData : soldTicketsData}
            remainingTicketsData={remainingTicketsData}
            showRemaining={selectedTab === "Sold Tickets"}
          />
          <AnalyticsChart
            title={selectedTab}
            data={chartData}
            dataType={selectedTab === "Checked In" ? "checked in" : "sold"}
          />
        </>
      );
    } else {
      return null; // Or render a default component
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
    <View style={styles.mainContainer}>
        <View style={styles.statusBarPlaceholder} />
        <SafeAreaView style={styles.safeAreaContainer}>
       <View style={styles.header}>
            <Text style={styles.eventName}>{eventInfo?.event_title}</Text>
            <Text style={styles.cityName}>{eventInfo?.cityName}</Text>
            <Text style={styles.date}>{eventInfo?.date}</Text>
            <Text style={styles.date}>at</Text>
            <Text style={styles.time}>{eventInfo?.time}</Text>
          </View>
          </SafeAreaView>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.wrapper}>
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
      </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    //backgroundColor: color.white_FFFFFF,
  },
  scrollContainer: {
    paddingBottom: 20,
    flexGrow: 1
  },
  wrapper: {
    flex: 1,
    //backgroundColor: color.white_FFFFFF
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: color.white_FFFFFF,
  },
  headerColumn: {
    paddingTop: Platform.OS === 'android' ? 15: 0,
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
  labelDashboard: {
    fontSize: 20,
    fontWeight: '500',
    color: color.brown_3C200A,
    paddingLeft: 10,
    marginTop: 10,
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
  },
  selectedTabButtonText: {
    color: color.brown_3C200A,
    fontWeight: '500',
    fontSize: 14
  },
});

export default DashboardScreen;
