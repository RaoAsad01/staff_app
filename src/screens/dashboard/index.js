import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, StatusBar, SafeAreaView, FlatList, ScrollView } from 'react-native';
import { color } from '../../color/color';
import OverallStatistics from './OverallStatistics';
import BoxOfficeSales from './BoxOfficeSales';
import { useNavigation } from '@react-navigation/native';
import SvgIcons from '../../../components/SvgIcons';
import { dashboardstatuslist } from '../../constants/dashboardstatuslist';
import CheckInSoldTicketsCard from './CheckInSolidTicketsCard';
import AttendeesComponent from './AttendeesComponent';
import { dashboardsalesscantab } from '../../constants/dashboardsalesscantab';
import AnalyticsChart from './AnalyticsChart';
import { ticketService } from '../../api/apiService';
import Typography, { Heading5, Body1, Label } from '../../components/Typography';
import AvailableTicketsCard from './AvailableTicketsCard';
import ScanAnalytics from './ScanAnalytics';
import ScanCategories from './ScanCategories';
import ScanCategoriesDetails from './ScanCategoriesDetails';
import ScanListComponent from './ScanListComponent';

const DashboardScreen = ({ eventInfo, onScanCountUpdate }) => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState(dashboardstatuslist[0]);
  const [selectedSaleScanTab, setSelectedSaleScanTab] = useState(dashboardsalesscantab[0]);
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
  // Add navigation handlers for statistics
  const handleTotalTicketsPress = () => {
    navigation.navigate('Tickets', { initialTab: 'All', eventInfo });
  };

  const handleTotalScannedPress = () => {
    navigation.navigate('Tickets', { initialTab: 'Scanned', eventInfo });
  };

  const handleTotalUnscannedPress = () => {
    navigation.navigate('Tickets', { initialTab: 'Unscanned', eventInfo });
  };

  const handleAvailableTicketsPress = () => {
    setSelectedSaleScanTab('Sales');
    setSelectedTab('Available Tickets');
    
    // Add a small delay to ensure the content is rendered before scrolling
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSaleScanTabPress = (tab) => {
    setSelectedSaleScanTab(tab);
  };

  const getCheckInData = () => {
    if (
      !dashboardStats?.data?.check_ins?.total_checkins ||
      !dashboardStats?.data?.check_ins?.total_tickets
    ) {
      return [{
        label: "Total Checked In",
        checkedIn: 0,
        total: 0,
        percentage: 0
      }];
    }

    const totalCheckedIn = dashboardStats?.data?.check_ins?.total_checkins;
    const totalTickets = dashboardStats?.data?.check_ins?.total_tickets;

    const byCategory = dashboardStats?.data?.check_ins?.by_category;
    let typeRows = [];
    if (byCategory) {
      const types = Object.keys(byCategory || {});
      typeRows = types.map(type => {
        const categoryData = byCategory[type];
        const checkedIn = categoryData?.scanned_tickets || 0;
        const total = categoryData?.total_tickets || 0;

        return {
          label: type,
          checkedIn: checkedIn,
          total: total,
          percentage: total ? Math.round((checkedIn / total) * 100) : 0
        };
      });
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
      !dashboardStats?.data?.box_office_sales?.ticket_wise?.total_tickets ||
      !dashboardStats?.data?.box_office_sales?.ticket_wise?.sold_tickets
    ) {
      return [{
        label: "Total Sold",
        checkedIn: 0,
        total: 0,
        percentage: 0
      }];
    }
    const totalSold = dashboardStats?.data?.box_office_sales?.ticket_wise?.sold_tickets || 0;
    const totalTickets = dashboardStats?.data?.box_office_sales?.ticket_wise?.total_tickets || 0;

    const byCategory = dashboardStats?.data?.box_office_sales?.ticket_wise?.by_category;
    let typeRows = [];
    if (byCategory) {
      const types = Object.keys(byCategory || {});
      typeRows = types.map(type => {
        const categoryData = byCategory[type];
        const sold = categoryData?.sold || 0;
        const total = categoryData?.total || 0;

        return {
          label: type,
          checkedIn: sold,
          total: total,
          percentage: total ? Math.round((sold / total) * 100) : 0
        };
      });
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

  // Add function to get available tickets data
  const getAvailableTicketsData = () => {
    if (!dashboardStats?.data?.available_tickets) {
      return [{
        label: "Available Tickets",
        checkedIn: 0,
        total: 0,
        percentage: 0
      }];
    }

    const availableTickets = dashboardStats?.data?.available_tickets;
    const byCategory = availableTickets;
    let typeRows = [];

    if (byCategory) {
      const types = Object.keys(byCategory || {});
      typeRows = types.map(type => {
        const categoryData = byCategory[type];
        const available = categoryData?.available_tickets || 0;
        const total = categoryData?.total_tickets || 0;

        // Create subItems from the ticket_wise data
        const subItems = [];
        const ticketWise = categoryData;
        if (ticketWise) {
          Object.keys(ticketWise).forEach(ticketName => {
            if (ticketName !== 'total_tickets' && ticketName !== 'available_tickets') {
              const ticketInfo = ticketWise[ticketName];
              const ticketAvailable = ticketInfo.available || 0;
              const ticketTotal = ticketInfo.total || 0;
              subItems.push({
                label: ticketName,
                checkedIn: ticketAvailable,
                total: ticketTotal,
                percentage: ticketTotal > 0 ? Math.round((ticketAvailable / ticketTotal) * 100) : 0,
                subItems: []
              });
            }
          });
        }

        return {
          label: type,
          checkedIn: available,
          total: total,
          percentage: total > 0 ? Math.round((available / total) * 100) : 0,
          subItems: subItems
        };
      });
    }

    return [
      ...typeRows
    ];
  };

  function formatHourLabel(hourStr) {
    const [hour, minutePart] = hourStr.split(":");
    const [minute, period] = minutePart.split(" ");
    return `${parseInt(hour, 10)}${period.toLowerCase()}`;
  }

  function getLatestNonZeroHour(checkinAnalytics) {
    if (!checkinAnalytics?.data) return null;
    const entries = Object.entries(checkinAnalytics.data);
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i][1] > 0) {
        return formatHourLabel(entries[i][0]);
      }
    }
    return formatHourLabel(entries[entries.length - 1][0]);
  }

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

  function mapSoldTicketsAnalytics(analyticsData) {
    if (!analyticsData) return [];
    return Object.entries(analyticsData).map(([hour, value]) => ({
      time: formatHourLabel(hour),
      value,
    }));
  }

  const renderContent = () => {
    if (!dashboardStats?.data) return null;

    if (selectedSaleScanTab === "Sales") {
      const soldTicketsData = getSoldTicketsData();
      const remainingTicketsData = soldTicketsData.filter(
        (item) => item.label !== "Total Sold"
      );
      const soldTicketsChartData = mapSoldTicketsAnalytics(
        dashboardStats?.data?.sold_tickets_analytics?.data
      );

      return (
        <>
          <BoxOfficeSales stats={dashboardStats} />
          <CheckInSoldTicketsCard
            title="Sold Tickets"
            data={soldTicketsData}
            remainingTicketsData={remainingTicketsData}
            showRemaining={true}
          />
          <AnalyticsChart
            title="Sold Tickets"
            data={soldTicketsChartData}
            dataType="sold"
          />
          <View style={styles.tabContainer}>
            <View style={styles.tabRow}>
              {dashboardstatuslist.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.tabButton,
                    selectedTab === item && styles.selectedTabButton,
                  ]}
                  onPress={() => handleTabPress(item)}
                >
                  <Typography
                    variant={selectedTab === item ? "tabActive" : "tab"}
                    style={[
                      styles.tabButtonText,
                      selectedTab === item && styles.selectedTabButtonText,
                    ]}
                  >
                    {item}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {selectedTab === "Checked In" && (
            <>
              <CheckInSoldTicketsCard
                title="Checked In"
                data={getCheckInData()}
                remainingTicketsData={[]}
                showRemaining={false}
              />
              <AnalyticsChart
                title="Checked In"
                data={getCheckinAnalyticsChartData(
                  dashboardStats?.data?.checkin_analytics,
                  highlightHour
                )}
                dataType="checked in"
              />
            </>
          )}
          {selectedTab === "Available Tickets" && (
            <AvailableTicketsCard data={getAvailableTicketsData()} />
          )}
        </>
      );
    } else if (selectedSaleScanTab === "Scans") {
      // Show ScanAnalytics view in the Scans tab
      return (
        <>
        <ScanCategories stats={dashboardStats} />
        <ScanCategoriesDetails stats={dashboardStats} />
          <ScanAnalytics
            title="Scans"
            data={getCheckinAnalyticsChartData(dashboardStats?.data?.scan_analytics)}
            dataType="checked in"
          />
          <ScanListComponent eventInfo={eventInfo} onScanCountUpdate={onScanCountUpdate} />
        </>
      );
    }

    if (selectedTab === "Attendees") {
      return <AttendeesComponent eventInfo={eventInfo} onScanCountUpdate={onScanCountUpdate} />;
    } else if (selectedTab === "Checked In" || selectedTab === "Sold Tickets" || selectedTab === "Available Tickets") {
      const data = selectedTab === "Checked In" ? getCheckInData() :
        selectedTab === "Sold Tickets" ? getSoldTicketsData() :
          getAvailableTicketsData();

      const remainingTicketsData = selectedTab === "Sold Tickets"
        ? data.filter(item => item.label !== "Total Sold")
        : [];

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
          {selectedTab !== "Available Tickets" && (
            <AnalyticsChart
              title={selectedTab}
              data={selectedTab === "Checked In" ? checkedInChartData : soldTicketsChartData}
              dataType={selectedTab === "Checked In" ? "checked in" : "sold"}
            />
          )}
        </>
      );
    }
    return null;
  };

  const highlightHour = getLatestNonZeroHour(dashboardStats?.data?.checkin_analytics);

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
      <Typography
        variant={selectedTab === item ? "tabActive" : "tab"}
        style={[
          styles.tabButtonText,
          selectedTab === item && styles.selectedTabButtonText,
        ]}
      >
        {item}
      </Typography>
    </TouchableOpacity>
  );

  const renderSaleScanTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.saleScanTabButton,
        selectedSaleScanTab === item && styles.selectedSaleScanTabButton,
      ]}
      onPress={() => handleSaleScanTabPress(item)}
    >
      <Typography
        variant={selectedSaleScanTab === item ? "tabActive" : "tab"}
        style={[
          styles.saleScanTabButtonText,
          selectedSaleScanTab === item && styles.selectedSaleScanTabButtonText,
        ]}
      >
        {item}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.statusBarPlaceholder} />
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.header}>
          <Body1 style={styles.eventName}>{eventInfo?.event_title || 'OUTMOSPHERE'}</Body1>
          <Body1 style={styles.separator}>   </Body1>
          <Body1 style={styles.cityName}>{eventInfo?.cityName || 'Accra'}</Body1>
          <Body1 style={styles.separator}>   </Body1>
          <Body1 style={styles.date}>{eventInfo?.date || '28-12-2024'}</Body1>
          <Body1 style={styles.separator}></Body1>
          <Body1 style={styles.date}>at</Body1>
          <Body1 style={styles.separator}></Body1>
          <Body1 style={styles.time}>{eventInfo?.time || '7:00 PM'}</Body1>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}>
        <View style={styles.wrapper}>
          {/* <Heading5 style={styles.labelDashboard}>Dashboard</Heading5> */}
          {loading ? (
            <Body1 style={styles.loadingText}>Loading dashboard stats...</Body1>
          ) : error ? (
            <Body1 style={styles.errorText}>{error}</Body1>
          ) : (
            <>
              <OverallStatistics
                stats={dashboardStats}
                onTotalTicketsPress={handleTotalTicketsPress}
                onTotalScannedPress={handleTotalScannedPress}
                onTotalUnscannedPress={handleTotalUnscannedPress}
                onAvailableTicketsPress={handleAvailableTicketsPress}
              />
              <View style={styles.saleScanTabContainer}>
                <View style={styles.saleScanTabRow}>
                  {dashboardsalesscantab.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.saleScanTabButton,
                        selectedSaleScanTab === item && styles.selectedSaleScanTabButton,
                      ]}
                      onPress={() => handleSaleScanTabPress(item)}
                    >
                      <Typography
                        variant={selectedSaleScanTab === item ? "tabActive" : "tab"}
                        style={[
                          styles.saleScanTabButtonText,
                          selectedSaleScanTab === item && styles.selectedSaleScanTabButtonText,
                        ]}
                      >
                        {item}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {selectedSaleScanTab !== "Sales" && selectedSaleScanTab !== "Scans" && (
                <>
                  <BoxOfficeSales stats={dashboardStats} />
                  <View style={styles.tabContainer}>
                    <View style={styles.tabRow}>
                      {dashboardstatuslist.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.tabButton,
                            selectedTab === item && styles.selectedTabButton,
                          ]}
                          onPress={() => handleTabPress(item)}
                        >
                          <Typography
                            variant={selectedTab === item ? "tabActive" : "tab"}
                            style={[
                              styles.tabButtonText,
                              selectedTab === item && styles.selectedTabButtonText,
                            ]}
                          >
                            {item}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
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
  },
  scrollContainer: {
    paddingBottom: 20,
    flexGrow: 1
  },
  wrapper: {
    flex: 1,
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: 'transparent',
  },
  headerColumn: {
    paddingTop: Platform.OS === 'android' ? 15 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'wrap',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    backgroundColor: color.btnBrown_AE6F28,
    height: 48,
  },
  eventName: {
    color: color.white_FFFFFF,
  },
  cityName: {
    color: color.white_FFFFFF,
  },
  date: {
    color: color.white_FFFFFF,
  },
  time: {
    color: color.white_FFFFFF,
  },
  labelDashboard: {
    color: color.brown_3C200A,
    paddingLeft: 10,
    marginTop: 10,
  },
  tabContainer: {
    marginVertical: 8,
    marginHorizontal: 16
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabButton: {
    padding: 10,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginTop: 6,
  },
  tabButtonText: {
    color: color.black_544B45,
  },
  selectedTabButton: {
    width: '50%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.white_FFFFFF,
    borderRadius: 7,
    backgroundColor: color.white_FFFFFF,
  },
  selectedTabButtonText: {
    color: color.brown_3C200A,
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
  separator: {
    color: color.white_FFFFFF,
    marginHorizontal: 4,
  },
  saleScanTabContainer: {
    marginHorizontal: 16,
    marginVertical: 8
  },
  saleScanTabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  saleScanTabButton: {
    padding: 10,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  saleScanTabButtonText: {
    color: color.black_544B45,
  },
  selectedSaleScanTabButton: {
    width: '50%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.white_FFFFFF,
    borderRadius: 7,
    backgroundColor: color.white_FFFFFF,
  },
  selectedSaleScanTabButtonText: {
    color: color.placeholderTxt_24282C,
    fontWeight: '500'
  },
});

export default DashboardScreen;
