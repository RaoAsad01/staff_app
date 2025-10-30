import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, SafeAreaView, ScrollView, Text } from 'react-native';
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
import AdminBoxOfficePaymentChannel from '../AdminBoxOfficePaymentChannel';
import TotalPaymentChannelCard from '../TotalPaymentChannelCard';
import PaymentChannelAnalytics from '../PaymentChannelAnalytics';
import AvailableTicketsCard from '../AvailableTicketsCard';
import { truncateCityName } from '../../../utils/stringUtils';
import { truncateEventName } from '../../../utils/stringUtils';
import { formatDateWithMonthName } from '../../../constants/dateAndTime';

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
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsTitle, setAnalyticsTitle] = useState('');
  const [activeAnalytics, setActiveAnalytics] = useState(null);
  const [scanAnalyticsData, setScanAnalyticsData] = useState(null);
  const [scanAnalyticsTitle, setScanAnalyticsTitle] = useState('');
  const [activeScanAnalytics, setActiveScanAnalytics] = useState(null);
  const [checkInAnalyticsData, setCheckInAnalyticsData] = useState(null);
  const [checkInAnalyticsTitle, setCheckInAnalyticsTitle] = useState('');
  const [activeCheckInAnalytics, setActiveCheckInAnalytics] = useState(null);
  const [activePaymentChannel, setActivePaymentChannel] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (currentEventInfo?.eventUuid && staffUuid) {
          setLoading(true);

          // For staff, we need to pass 'box_office' as sales parameter
          // This tells the backend to return box office sales data for this staff member
          const salesParam = 'box_office';

          // Log the parameters being sent
          console.log('StaffDashboard - Fetching stats with params:', {
            eventUuid: currentEventInfo.eventUuid,
            sales: salesParam,
            ticketType: null,
            ticketUuid: null,
            staffUuid: staffUuid
          });

          // Use the same API but with staff_uuid parameter and sales=box_office
          const stats = await ticketService.fetchDashboardStats(currentEventInfo.eventUuid, salesParam, null, null, staffUuid);
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


  const handlePaymentChannelPress = (paymentChannel) => {
    console.log('Payment channel pressed:', paymentChannel);
    // Toggle active payment channel
    if (activePaymentChannel === paymentChannel) {
      setActivePaymentChannel(null);
    } else {
      setActivePaymentChannel(paymentChannel);
    }
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

  const handleAnalyticsPress = async (ticketType, title, ticketUuid = null, subitemLabel = null) => {
    if (!currentEventInfo?.eventUuid) return;

    const analyticsKey = ticketUuid ? `${title}-${ticketUuid}` : `${title}-${ticketType}`;

    // If already active, deactivate
    if (activeAnalytics === analyticsKey) {
      setActiveAnalytics(null);
      setAnalyticsData(null);
      setAnalyticsTitle('');
      return;
    }

    try {
      // Don't send sales parameter when filtering by ticket_type or ticket_uuid
      let salesParam = null;

      const response = await ticketService.fetchDashboardStats(currentEventInfo.eventUuid, salesParam, ticketType, ticketUuid, staffUuid);

      // Handle both sold tickets and check-in analytics
      let analyticsData = null;
      let analyticsTitle = '';

      if (title === 'Check-Ins' && response?.data?.checkin_analytics?.data) {
        // Handle Check-Ins analytics
        analyticsData = response.data.checkin_analytics.data;
        analyticsTitle = subitemLabel ? `${subitemLabel} Check-Ins` : `${ticketType} Check-Ins`;
      } else if (response?.data?.sold_tickets_analytics?.data) {
        // Handle Sold Tickets analytics
        analyticsData = response.data.sold_tickets_analytics.data;
        analyticsTitle = subitemLabel ? `${subitemLabel} Sales` : `${ticketType} Sales`;
      }

      if (analyticsData) {
        const chartData = Object.entries(analyticsData).map(([hour, value]) => {
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
        setAnalyticsTitle(analyticsTitle);
        setActiveAnalytics(analyticsKey);
      }
    } catch (error) {
      console.error('Error fetching analytics for', ticketType, error);
    }
  };

  const handleScanAnalyticsPress = async (scanType, parentCategory, ticketUuid = null) => {
    if (!currentEventInfo?.eventUuid) return;

    const analyticsKey = ticketUuid ? `Scan-${parentCategory}-${ticketUuid}` : `Scan-${parentCategory}-${scanType}`;

    // If already active, deactivate
    if (activeScanAnalytics === analyticsKey) {
      setActiveScanAnalytics(null);
      setScanAnalyticsData(null);
      setScanAnalyticsTitle('');
      return;
    }

    try {
      console.log('🔍 Fetching scan analytics for:', {
        scanType,
        parentCategory,
        ticketUuid
      });

      // Don't send sales parameter when filtering by ticket_type or ticket_uuid
      let salesParam = null;

      // Fetch fresh data with ticketType, ticketUuid, and staffUuid parameters
      const response = await ticketService.fetchDashboardStats(currentEventInfo.eventUuid, salesParam, parentCategory, ticketUuid, staffUuid);

      // Handle Scan analytics
      if (response?.data?.scan_analytics?.data) {
        const analyticsData = response.data.scan_analytics.data;
        const analyticsTitle = ticketUuid ? `${scanType} Scans` : `${parentCategory} Scans`;

        console.log('Scan Analytics Data:', analyticsData);
        console.log('Scan Analytics Response:', response.data.scan_analytics);

        const chartData = Object.entries(analyticsData)
          .filter(([hour, value]) => value > 0) // Filter out zero values
          .map(([hour, value]) => {
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

        console.log('Formatted Scan Chart Data:', chartData);
        setScanAnalyticsData(chartData);
        setScanAnalyticsTitle(analyticsTitle);
        setActiveScanAnalytics(analyticsKey);
      } else {
        console.warn('No scan analytics data found in response');
      }
    } catch (error) {
      console.error('Error fetching scan analytics for', scanType, error);
    }
  };

  const handleCheckInAnalyticsPress = async (ticketType, title, ticketUuid = null, subitemLabel = null) => {
    if (!currentEventInfo?.eventUuid) return;

    const analyticsKey = ticketUuid ? `${title}-${ticketUuid}` : `${title}-${ticketType}`;

    // If already active, deactivate
    if (activeCheckInAnalytics === analyticsKey) {
      setActiveCheckInAnalytics(null);
      setCheckInAnalyticsData(null);
      setCheckInAnalyticsTitle('');
      return;
    }

    try {
      // Don't send sales parameter when filtering by ticket_type or ticket_uuid
      let salesParam = null;

      const response = await ticketService.fetchDashboardStats(currentEventInfo.eventUuid, salesParam, ticketType, ticketUuid, staffUuid);

      // Handle Check-Ins analytics
      if (response?.data?.checkin_analytics?.data) {
        const analyticsData = response.data.checkin_analytics.data;
        const analyticsTitle = subitemLabel ? `${subitemLabel} Check-Ins` : `${ticketType} Check-Ins`;

        const chartData = Object.entries(analyticsData).map(([hour, value]) => {
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

        setCheckInAnalyticsData(chartData);
        setCheckInAnalyticsTitle(analyticsTitle);
        setActiveCheckInAnalytics(analyticsKey);
      }
    } catch (error) {
      console.error('Error fetching check-in analytics for', ticketType, error);
    }
  };

  const getSoldTicketsData = () => {
    const dataSource = dashboardStats?.data?.sold_tickets;

    if (dataSource?.total_tickets === undefined || dataSource?.sold_tickets === undefined) {
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

        // Create subitems from the ticket_wise data for staff users
        const subItems = [];
        if (categoryData && typeof categoryData === 'object') {
          Object.keys(categoryData).forEach(ticketName => {
            if (ticketName !== 'total_tickets' && ticketName !== 'sold_tickets' && categoryData[ticketName]) {
              const ticketInfo = categoryData[ticketName];
              if (ticketInfo.total !== undefined && ticketInfo.sold !== undefined) {
                subItems.push({
                  label: ticketName,
                  checkedIn: ticketInfo.sold,
                  total: ticketInfo.total,
                  percentage: ticketInfo.total > 0 ? Math.round((ticketInfo.sold / ticketInfo.total) * 100) : 0,
                  ticketUuid: ticketInfo.ticket_uuid
                });
              }
            }
          });
        }

        return {
          label: type,
          checkedIn: sold,
          total: total,
          percentage: total ? Math.round((sold / total) * 100) : 0,
          subItems: subItems.length > 0 ? subItems : undefined
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
    if (!hourStr || typeof hourStr !== 'string') {
      console.warn('formatHourLabel: Invalid input', hourStr);
      return '';
    }

    const parts = hourStr.split(":");
    if (parts.length < 2) {
      return hourStr; // Return as-is if format is unexpected
    }

    const [hour, minutePart] = parts;
    if (!minutePart) {
      return hour; // Return just the hour if no minute part
    }

    const minuteAndPeriod = minutePart.split(" ");
    if (minuteAndPeriod.length < 2) {
      return `${parseInt(hour, 10)}${hourStr.includes('PM') ? 'pm' : 'am'}`; // Default based on PM/AM
    }

    const [minute, period] = minuteAndPeriod;
    return `${parseInt(hour, 10)}${period.toLowerCase()}`;
  }

  function mapSoldTicketsAnalytics(analyticsData) {
    if (!analyticsData) return [];
    return Object.entries(analyticsData).map(([hour, value]) => ({
      time: formatHourLabel(hour),
      value,
    }));
  }

  function getCheckinAnalyticsChartData(checkinAnalytics) {
    if (!checkinAnalytics?.data) return [];
    return Object.entries(checkinAnalytics.data).map(([hour, value]) => ({
      time: formatHourLabel(hour),
      value,
    }));
  }

  const getCheckInData = () => {
    const dataSource = dashboardStats?.data?.check_ins;

    if (dataSource?.total_checkins === undefined) {
      return [{
        label: "Total Check-Ins",
        checkedIn: 0,
        total: 0,
        percentage: 0
      }];
    }

    const totalCheckedIn = dataSource.total_checkins || 0;
    const totalTickets = dashboardStats?.data?.sold_tickets?.total_tickets || 0;

    const byCategory = dataSource.by_category;
    let typeRows = [];
    if (byCategory) {
      const types = Object.keys(byCategory || {});
      typeRows = types.map(type => {
        const categoryData = byCategory[type];
        const checkedIn = categoryData?.total_checkins || 0;
        const total = categoryData?.total_tickets || 0;

        // Create subitems from the ticket_wise data for staff users
        const subItems = [];
        if (categoryData && typeof categoryData === 'object') {
          Object.keys(categoryData).forEach(ticketName => {
            if (ticketName !== 'total_tickets' && ticketName !== 'total_checkins' && categoryData[ticketName]) {
              const ticketInfo = categoryData[ticketName];
              if (ticketInfo.total !== undefined && ticketInfo.checked_in !== undefined) {
                subItems.push({
                  label: ticketName,
                  checkedIn: ticketInfo.checked_in,
                  total: ticketInfo.total,
                  percentage: ticketInfo.total > 0 ? Math.round((ticketInfo.checked_in / ticketInfo.total) * 100) : 0,
                  ticketUuid: ticketInfo.ticket_uuid
                });
              }
            }
          });
        }

        return {
          label: type,
          checkedIn: checkedIn,
          total: total,
          percentage: total ? Math.round((checkedIn / total) * 100) : 0,
          subItems: subItems.length > 0 ? subItems : undefined
        };
      });
    }

    return [
      {
        label: "Total Check-Ins",
        checkedIn: totalCheckedIn,
        total: totalTickets,
        percentage: totalTickets ? Math.round((totalCheckedIn / totalTickets) * 100) : 0
      },
      ...typeRows
    ];
  };

  const getAvailableTicketsData = () => {
    if (!dashboardStats?.data?.available_tickets) {
      return [{
        label: "Available",
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

        // Create subitems from the ticket_wise data for staff users
        const subItems = [];
        if (categoryData && typeof categoryData === 'object') {
          Object.keys(categoryData).forEach(ticketName => {
            if (ticketName !== 'total_tickets' && ticketName !== 'available_tickets' && categoryData[ticketName]) {
              const ticketInfo = categoryData[ticketName];
              if (ticketInfo.total !== undefined && ticketInfo.available !== undefined) {
                subItems.push({
                  label: ticketName,
                  checkedIn: ticketInfo.available,
                  total: ticketInfo.total,
                  percentage: ticketInfo.total > 0 ? Math.round((ticketInfo.available / ticketInfo.total) * 100) : 0,
                  ticketUuid: ticketInfo.ticket_uuid
                });
              }
            }
          });
        }

        return {
          label: type,
          checkedIn: available,
          total: total,
          percentage: total > 0 ? Math.round((available / total) * 100) : 0,
          subItems: subItems.length > 0 ? subItems : undefined
        };
      });
    }

    return typeRows;
  };


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
          <BoxOfficeSales
            stats={dashboardStats}
            onDebugData={(data) => {
              console.log('BoxOfficeSales - Backend Data:', JSON.stringify(data, null, 2));
            }}
          />
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
          <AdminBoxOfficePaymentChannel stats={{
            ...dashboardStats,
            data: {
              ...dashboardStats?.data,
              box_office_sales: {
                ...dashboardStats?.data?.box_office_sales,
                // Map payment_channels (plural) to payment_channel (singular) for compatibility
                payment_channel: dashboardStats?.data?.payment_channels || dashboardStats?.data?.payment_channel
              }
            }
          }} />

          {/* Total Payment Channel Card */}
          <TotalPaymentChannelCard 
            stats={dashboardStats} 
            onPaymentChannelPress={handlePaymentChannelPress}
            activePaymentChannel={activePaymentChannel}
          />

          {/* Payment Channel Analytics */}
          <PaymentChannelAnalytics 
            stats={dashboardStats} 
            selectedPaymentChannel={activePaymentChannel}
            eventInfo={currentEventInfo}
            userRole="STAFF"
            staffUuid={staffUuid}
          />

        </>
      );
    } else if (selectedSaleScanTab === "Scans") {
      // Show ScanAnalytics view in the Scans tab
      return (
        <>
          <ScanCategories stats={dashboardStats} />
          <ScanCategoriesDetails
            stats={dashboardStats}
            onScanAnalyticsPress={handleScanAnalyticsPress}
            activeScanAnalytics={activeScanAnalytics}
          />
          {scanAnalyticsData && activeScanAnalytics ? (
            <ScanAnalytics
              title={scanAnalyticsTitle}
              data={scanAnalyticsData}
              dataType="checked in"
            />
          ) : (
            <ScanAnalytics
              title="Scans"
              data={getCheckinAnalyticsChartData(dashboardStats?.data?.scan_analytics)}
              dataType="checked in"
            />
          )}
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
            <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{formatDateWithMonthName(currentEventInfo?.date) || '30 Oct 2025'}</Text>
            <Text style={styles.separator}></Text>
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
      <View style={styles.overallStatisticsContainer}>
        <OverallStatistics
          stats={dashboardStats}
          // onTotalTicketsPress={handleTotalTicketsPress}
          // onTotalScannedPress={handleTotalScannedPress}
          // onTotalUnscannedPress={handleTotalUnscannedPress}
          // onAvailableTicketsPress={handleAvailableTicketsPress}
          showHeading={false}
        />
      </View>

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
    flexGrow: 1
  },
  wrapper: {
    flex: 1,
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'android' ? 0 : 0,
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
  overallStatisticsContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
});

export default StaffDashboard;
