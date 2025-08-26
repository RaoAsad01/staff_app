import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Text } from 'react-native';
import { color } from '../../../color/color';
import { useNavigation, useRoute } from '@react-navigation/native';
import SvgIcons from '../../../../components/SvgIcons';
import { dashboardsalesscantab } from '../../../constants/dashboardsalesscantab';
import AnalyticsChart from '../AnalyticsChart';
import { ticketService } from '../../../api/apiService';
import BoxOfficeSales from '../BoxOfficeSales';
import CheckInSoldTicketsCard from '../CheckInSolidTicketsCard';
import ScanAnalytics from '../ScanAnalytics';
import ScanCategories from '../ScanCategories';
import ScanCategoriesDetails from '../ScanCategoriesDetails';
import ScanListComponent from '../ScanListComponent';
import OverallStatistics from '../OverallStatistics';
import EventsModal from '../../../components/EventsModal';
import { truncateCityName } from '../../../utils/stringUtils';
import { truncateEventName } from '../../../utils/stringUtils';

const StaffDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventInfo, staffUuid, staffName, onEventChange } = route.params;

  // Local state for current event info
  const [currentEventInfo, setCurrentEventInfo] = useState(eventInfo);

  const [selectedSaleScanTab, setSelectedSaleScanTab] = useState(dashboardsalesscantab[0]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsTitle, setAnalyticsTitle] = useState('');
  const [activeAnalytics, setActiveAnalytics] = useState(null);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (currentEventInfo?.eventUuid && staffUuid) {
          setLoading(true);
          // Use the same API but with staff_uuid parameter
          const stats = await ticketService.fetchDashboardStats(currentEventInfo.eventUuid, null, null, staffUuid);
          setDashboardStats(stats);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching staff dashboard stats:', err);
        setError(err.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentEventInfo?.eventUuid, staffUuid]);

  const handleSaleScanTabPress = (tab) => {
    setSelectedSaleScanTab(tab);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    console.log('Selected event:', event);

    // If the selected event is different from the current event
    if (event.uuid !== currentEventInfo?.eventUuid) {
      // Call the onEventChange callback if it exists
      if (onEventChange) {
        onEventChange(event);
      }
      // Go back to the previous screen
      navigation.goBack();
    }

    // Close the modal
    setEventsModalVisible(false);
  };


  const handleAnalyticsPress = async (ticketType, title) => {
    if (!currentEventInfo?.eventUuid || !staffUuid) return;

    const analyticsKey = `${title}-${ticketType}`;

    // If already active, deactivate
    if (activeAnalytics === analyticsKey) {
      setActiveAnalytics(null);
      setAnalyticsData(null);
      setAnalyticsTitle('');
      return;
    }

    try {
      // Determine sales parameter based on title
      let salesParam = null;
      if (title === 'Sold Tickets') {
        salesParam = 'box_office';
      }

      const response = await ticketService.fetchDashboardStats(currentEventInfo.eventUuid, salesParam, ticketType, staffUuid);

      if (response?.data?.sold_tickets_analytics?.data) {
        const analytics = response.data.sold_tickets_analytics.data;
        const chartData = Object.entries(analytics).map(([hour, value]) => {
          // Format time from "12:00 AM" to "12am" or "12:00 PM" to "12pm"
          let formattedTime = hour;
          if (hour.includes(':00 ')) {
            const [time, period] = hour.split(' ');
            const [hours] = time.split(':');
            formattedTime = `${hours}${period.toLowerCase()}`;
          }

          return {
            time: formattedTime,
            value: value || 0
          };
        });

        setAnalyticsData(chartData);
        setAnalyticsTitle(`${ticketType} Sales`);
        setActiveAnalytics(analyticsKey);
      }
    } catch (error) {
      console.error('Error fetching analytics for', ticketType, error);
    }
  };

  const getSoldTicketsData = () => {
    const dataSource = dashboardStats?.data?.sold_tickets;

    if (!dataSource?.total_tickets || !dataSource?.sold_tickets) {
      return [{
        label: "Total Sold",
        checkedIn: 0,
        total: 0,
        percentage: 0
      }];
    }

    const totalSold = dataSource.sold_tickets || 0;
    const totalTickets = dataSource.total_tickets || 0;

    const byCategory = dataSource.by_category;
    let typeRows = [];
    if (byCategory) {
      const types = Object.keys(byCategory || {});
      typeRows = types.map(type => {
        const categoryData = byCategory[type];
        const sold = categoryData?.sold_tickets || 0;
        const total = categoryData?.total_tickets || 0;

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

  function formatHourLabel(hourStr) {
    const [hour, minutePart] = hourStr.split(":");
    const [minute, period] = minutePart.split(" ");
    return `${parseInt(hour, 10)}${period.toLowerCase()}`;
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
            userRole="STAFF"
            stats={dashboardStats}
            onAnalyticsPress={handleAnalyticsPress}
            activeAnalytics={activeAnalytics}
          />
          {analyticsData && activeAnalytics ? (
            <AnalyticsChart
              title={analyticsTitle}
              data={analyticsData}
              dataType="sold"
            />
          ) : (
            <AnalyticsChart
              title="Sold Tickets"
              data={soldTicketsChartData}
              dataType="sold"
            />
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
            data={[]} // You might need to implement scan analytics for staff
            dataType="checked in"
          />
          <ScanListComponent eventInfo={currentEventInfo} staffUuid={staffUuid} />
        </>
      );
    }

    return null;
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.statusBarPlaceholder} />
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.eventName} numberOfLines={1} ellipsizeMode="tail">{truncateEventName(currentEventInfo?.event_title) || 'OUTMOSPHERE'}</Text>
              {/* <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setEventsModalVisible(true)}
              >
                <SvgIcons.downArrowWhite width={12} height={12} fill={color.white_FFFFFF} stroke={color.white_FFFFFF} strokeWidth={0} />
              </TouchableOpacity> */}
            </View>
            <Text style={styles.separator}>   </Text>
            <Text style={styles.cityName} numberOfLines={1} ellipsizeMode="tail">{truncateCityName(currentEventInfo?.cityName) || 'Accra'}</Text>
            <Text style={styles.separator}>   </Text>
            <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{currentEventInfo?.date || '28-12-2024'}</Text>
            <Text style={styles.separator}></Text>
            <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">at</Text>
            <Text style={styles.separator}></Text>
            <Text style={styles.time} numberOfLines={1} ellipsizeMode="tail">{currentEventInfo?.time || '7:00 PM'}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Staff Name Display */}
      <View style={styles.staffNameContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SvgIcons.backArrow width={24} height={24} fill={color.black_544B45} />
        </TouchableOpacity>
        <Text style={styles.staffName}>{staffName}</Text>
      </View>

      {/* Overall Statistics */}
      <OverallStatistics
        stats={dashboardStats}
        // onTotalTicketsPress={handleTotalTicketsPress}
        // onTotalScannedPress={handleTotalScannedPress}
        // onTotalUnscannedPress={handleTotalUnscannedPress}
        // onAvailableTicketsPress={handleAvailableTicketsPress}
        showHeading={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.wrapper}>
          {loading ? (
            <Text style={styles.loadingText}>Loading staff dashboard stats...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
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
                      <Text
                        style={[
                          styles.saleScanTabButtonText,
                          selectedSaleScanTab === item && styles.selectedSaleScanTabButtonText,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {renderContent()}
            </>
          )}
        </View>
      </ScrollView>

      {/* Events Modal */}
      <EventsModal
        visible={eventsModalVisible}
        onClose={() => setEventsModalVisible(false)}
        onEventSelect={handleEventSelect}
        currentEventUuid={currentEventInfo?.eventUuid}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  dropdownButton: {
    marginLeft: 8,
    padding: 4,
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
  separator: {
    color: color.white_FFFFFF,
    marginHorizontal: 4,
  },
  staffNameContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: color.brown_F7E4B6,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
    marginVertical: 8
  },
  staffName: {
    color: color.black_544B45,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saleScanTabButtonText: {
    color: color.black_544B45,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  selectedSaleScanTabButtonText: {
    color: color.placeholderTxt_24282C,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: color.brown_3C200A,
    fontSize: 14,
    fontWeight: '400',
  },
  errorText: {
    textAlign: 'center',
    padding: 20,
    color: 'red',
    fontSize: 14,
    fontWeight: '400',
  },
  saleScanTabContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8
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
});

export default StaffDashboard;
