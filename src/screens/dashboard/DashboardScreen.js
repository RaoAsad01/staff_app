import React, { useState, useEffect } from 'react';
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
import { ticketService } from '../../api/apiService';

const DashboardScreen = ({ eventInfo }) => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState(dashboardstatuslist[0]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (eventInfo?.eventUuid) {
          setLoading(true);
          const stats = await ticketService.fetchDashboardStats(eventInfo.eventUuid);
          setDashboardStats(stats);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [eventInfo?.eventUuid]);

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };

  // Transform data for CheckInSoldTicketsCard
  const getCheckInData = () => {
    if (
      !dashboardStats?.data?.checked_in?.total?.checked_in ||
      !dashboardStats?.data?.checked_in?.total?.total_quantity
    ) {
      return [{
        label: "Total Checked In",
        checkedIn: 0,
        total: 0,
        percentage: 0
      }];
    }

    const totalCheckedIn = dashboardStats?.data?.checked_in?.total?.checked_in;
    const totalTickets = dashboardStats?.data?.checked_in?.total?.total_quantity

    // By type
    const byType = dashboardStats?.data?.checked_in?.by_type;
    let typeRows = [];
    if (byType) {
      const types = Object.keys(byType.total_quantity || {});
      typeRows = types.map(type => ({
        label: type,
        checkedIn: byType.checked_in?.[type] || 0,
        total: byType.total_quantity?.[type] || 0,
        percentage: byType.total_quantity?.[type]
          ? Math.round((byType.checked_in?.[type] || 0) / byType.total_quantity[type] * 100)
          : 0
      }));
    }

    return [
      {
        label: "Total Checked In",
        checkedIn: totalCheckedIn,
        total: totalTickets,
        percentage: totalTickets ? Math.round((totalCheckedIn / totalTickets) * 100) : 0
      },
      ...typeRows
    ];
  };

  const getSoldTicketsData = () => {
    if (
      !dashboardStats?.data?.sold_tickets?.total?.total_quantity ||
      !dashboardStats?.data?.sold_tickets?.total?.sold
    ) {
      return [{
        label: "Total Sold",
        checkedIn: 0,
        total: 0,
        percentage: 0
      }];
    }
    const totalSold = dashboardStats?.data?.sold_tickets?.total?.sold|| 0;
    const totalTickets = dashboardStats?.data?.sold_tickets?.total?.total_quantity || 0;

    // By type
    const byType = dashboardStats?.data?.sold_tickets?.by_type;
    let typeRows = [];
    if (byType) {
      const types = Object.keys(byType.total_quantity || {});
      typeRows = types.map(type => ({
        label: type,
        checkedIn: byType.sold?.[type] || 0,
        total: byType.total_quantity?.[type] || 0,
        percentage: byType.total_quantity?.[type]
          ? Math.round((byType.sold?.[type] || 0) / byType.total_quantity[type] * 100)
          : 0
      }));
    }

    return [
      {
        label: "Total Sold",
        checkedIn: totalSold,
        total: totalTickets,
        percentage: totalTickets ? Math.round((totalSold / totalTickets) * 100) : 0
      },
      ...typeRows
    ];
  };

  const getAttendeesData = () => {
    if (!dashboardStats?.data?.total_scanned_tickets) {
      return [{ label: 'Total Attendees', value: '0' }];
    }

    const { total_scanned_tickets } = dashboardStats.data;
    return [
      { label: 'Total Attendees', value: (total_scanned_tickets?.total_scanned || 0).toString() },
      ...Object.entries(total_scanned_tickets?.types || {}).map(([type, count]) => ({
        label: `${type} Attendees`,
        value: (count || 0).toString()
      }))
    ];
  };

  // Utility to format hour label (e.g., "5:00 PM" -> "5pm")
  function formatHourLabel(hourStr) {
    const [hour, minutePart] = hourStr.split(":");
    const [minute, period] = minutePart.split(" ");
    return `${parseInt(hour, 10)}${period.toLowerCase()}`;
  }

  // Utility to get the latest non-zero hour for highlighting
  function getLatestNonZeroHour(checkinAnalytics) {
    if (!checkinAnalytics?.data) return null;
    const entries = Object.entries(checkinAnalytics.data);
    // Find the last hour with value > 0
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i][1] > 0) {
        return formatHourLabel(entries[i][0]);
      }
    }
    // If all are zero, highlight the last hour
    return formatHourLabel(entries[entries.length - 1][0]);
  }

  // Map backend checkin_analytics to chart data
  function getCheckinAnalyticsChartData(checkinAnalytics, highlightHour = null) {
    if (!checkinAnalytics?.data) return [];
    return Object.entries(checkinAnalytics.data).map(([hour, value]) => ({
      time: formatHourLabel(hour),
      value,
      isHighlighted: highlightHour
        ? formatHourLabel(hour) === highlightHour
        : false,
    }));
  }

  // Map backend sold_tickets_analytics to chart data
  function mapSoldTicketsAnalytics(analyticsData) {
    if (!analyticsData) return [];
    return Object.entries(analyticsData).map(([hour, value]) => ({
      time: formatHourLabel(hour),
      value,
    }));
  }

  const renderContent = () => {
    if (!dashboardStats?.data) return null;

    if (selectedTab === "Attendees") {
      return <AttendeesComponent attendeesData={getAttendeesData()} />;
    } else if (selectedTab === "Checked In" || selectedTab === "Sold Tickets") {
      const data = selectedTab === "Checked In" ? getCheckInData() : getSoldTicketsData();
      const remainingTicketsData = selectedTab === "Sold Tickets"
        ? data.filter(item => item.label !== "Total Sold")
        : [];

      // Chart data for checked in and sold tickets
      const checkedInChartData = getCheckinAnalyticsChartData(
        dashboardStats?.data?.checkin_analytics,
        highlightHour
      );
      const soldTicketsChartData = mapSoldTicketsAnalytics(
        dashboardStats?.data?.sold_tickets_analytics?.data
      );

      return (
        <>
          <CheckInSoldTicketsCard
            title={selectedTab}
            data={data}
            remainingTicketsData={remainingTicketsData}
            showRemaining={selectedTab === "Sold Tickets"}
          />
          <AnalyticsChart
            title={selectedTab}
            data={selectedTab === "Checked In" ? checkedInChartData : soldTicketsChartData}
            dataType={selectedTab === "Checked In" ? "checked in" : "sold"}
          />
        </>
      );
    }
    return null;
  };

  // Use backend data for checkedInChartData
  const highlightHour = getLatestNonZeroHour(dashboardStats?.data?.checkin_analytics);

  const attendeesData = [
    { label: 'Total Attendees', value: '500' },
    { label: 'VIP Attendees', value: '150' },
    { label: 'Standard Attendees', value: '300' },
    { label: 'Members Attendees', value: '50' },
  ];

  const soldTicketsData = getSoldTicketsData();
  const remainingTicketsData = soldTicketsData.filter(
    (item) => item.label !== "Total Sold"
  );

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
          <Text style={styles.cityName}>{eventInfo?.cityName || 'Accra'}</Text>
          <Text style={styles.date}>{eventInfo?.date}</Text>
          <Text style={styles.date}>at</Text>
          <Text style={styles.time}>{eventInfo?.time}</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.wrapper}>
          <Text style={styles.labelDashboard}>Dashboard</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading dashboard stats...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <OverallStatistics stats={dashboardStats} />
              <BoxOfficeSales stats={dashboardStats} />
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
            </>
          )}
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
    paddingTop: Platform.OS === 'android' ? 15 : 0,
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
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: color.brown_3C200A,
  },
  errorText: {
    textAlign: 'center',
    padding: 20,
    color: 'red',
  },
});

export default DashboardScreen;
