import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, SafeAreaView, FlatList, ScrollView, Alert, Dimensions, Text } from 'react-native';
import { color } from '../../color/color';
import OverallStatistics from './OverallStatistics';
import AdminOverallStatistics from './AdminOverallStatistics';
import BoxOfficeSales from './BoxOfficeSales';
import { useNavigation } from '@react-navigation/native';
import SvgIcons from '../../../components/SvgIcons';
import { dashboardstatuslist } from '../../constants/dashboardstatuslist';
import CheckInSoldTicketsCard from './CheckInSolidTicketsCard';
import AttendeesComponent from './AttendeesComponent';
import { dashboardsalesscantab } from '../../constants/dashboardsalesscantab';
import AnalyticsChart from './AnalyticsChart';
import { ticketService, userService } from '../../api/apiService';

import AvailableTicketsCard from './AvailableTicketsCard';
import ScanAnalytics from './ScanAnalytics';
import ScanCategories from './ScanCategories';
import ScanCategoriesDetails from './ScanCategoriesDetails';
import ScanListComponent from './ScanListComponent';
import EventsModal from '../../components/EventsModal';
import TerminalsComponent from './TerminalsComponent'
import AdminAllSales from './AdminAllSales';
import AdminOnlineSales from './AdminOnlineSales';
import AdminBoxOfficeSales from './AdminBoxOfficeSales';
import AdminBoxOfficePaymentChannel from './AdminBoxOfficePaymentChannel';
import TotalPaymentChannelCard from './TotalPaymentChannelCard';
import PaymentChannelAnalytics from './PaymentChannelAnalytics';
import { admindashboardterminaltab } from '../../constants/admindashboardterminaltab';
import { adminonlineboxofficetab } from '../../constants/adminonlineboxofficetab';
import { truncateCityName } from '../../utils/stringUtils';
import { truncateEventName } from '../../utils/stringUtils';
import { formatDateWithMonthName } from '../../constants/dateAndTime';

const DashboardScreen = ({ eventInfo, onScanCountUpdate, onEventChange }) => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState("Check-Ins");
  const [selectedSaleScanTab, setSelectedSaleScanTab] = useState(dashboardsalesscantab[0]);
  const [selectedAdminTab, setSelectedAdminTab] = useState(admindashboardterminaltab[0]);
  const [selectedAdminOnlineBoxOfficeTab, setSelectedAdminOnlineBoxOfficeTab] = useState(adminonlineboxofficetab[0]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentSalesType, setCurrentSalesType] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsTitle, setAnalyticsTitle] = useState('');
  const [activeAnalytics, setActiveAnalytics] = useState(null);

  // Separate analytics states for Check-Ins
  const [checkInAnalyticsData, setCheckInAnalyticsData] = useState(null);
  const [checkInAnalyticsTitle, setCheckInAnalyticsTitle] = useState('');
  const [activeCheckInAnalytics, setActiveCheckInAnalytics] = useState(null);
  const [scanAnalyticsData, setScanAnalyticsData] = useState(null);
  const [scanAnalyticsTitle, setScanAnalyticsTitle] = useState('');
  const [activeScanAnalytics, setActiveScanAnalytics] = useState(null);
  const [activePaymentChannel, setActivePaymentChannel] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setUserProfileLoading(true);
        const profile = await userService.getProfile();
        console.log('User profile:', profile);
        console.log('User profile keys:', Object.keys(profile || {}));
        console.log('User role:', profile?.role);
        console.log('User role type:', typeof profile?.role);

        // Check for common role field variations
        console.log('profile?.user_role :', profile?.user_role);
        console.log('profile?.type:', profile?.type);
        console.log('profile?.permission:', profile?.permission);
        console.log('profile?.user_type:', profile?.user_type);

        // Try to find the role from various possible field names
        const role = profile?.role ||
          profile?.user_role ||
          profile?.type ||
          profile?.permission ||
          profile?.user_type ||
          profile?.data?.role ||
          profile?.user?.role;
        console.log('Final role value:', role);

        setUserRole(role || null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setUserRole(null);
      } finally {
        setUserProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Reset selectedTab when user role changes to ensure valid default tab
  useEffect(() => {
    if (userRole !== null) {
      const tabList = getTabList();
      if (!tabList.includes(selectedTab)) {
        setSelectedTab(tabList[0]);
      }
    }
  }, [userRole]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (eventInfo?.eventUuid) {
          setLoading(true);

          // Determine sales parameter for ADMIN users
          let salesParam = null;
          if (userRole === 'ADMIN') {
            if (selectedAdminOnlineBoxOfficeTab === 'Online') {
              salesParam = 'online';
            } else if (selectedAdminOnlineBoxOfficeTab === 'Box Office') {
              salesParam = 'box_office';
            }
            // For 'All' tab, don't pass sales parameter (get all data)
          }

          const stats = await ticketService.fetchDashboardStats(eventInfo.eventUuid, salesParam);
          
          // Log for debugging ORGANIZER payment channels
          if (userRole === 'ORGANIZER') {
            console.log('📊 Dashboard Stats for ORGANIZER:', JSON.stringify(stats, null, 2));
            console.log('📊 payment_channels location check:');
            console.log('  - stats?.data?.payment_channels:', stats?.data?.payment_channels);
            console.log('  - stats?.data?.box_office_sales?.payment_channels:', stats?.data?.box_office_sales?.payment_channels);
            console.log('  - stats?.data?.box_office_sales?.payment_channel:', stats?.data?.box_office_sales?.payment_channel);
          }
          
          setDashboardStats(stats);
          setCurrentSalesType(salesParam);
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
  }, [eventInfo?.eventUuid, userRole, selectedAdminOnlineBoxOfficeTab]);

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };
  // Add navigation handlers for statistics
  const handleTotalTicketsPress = () => {
    navigation.navigate('Tickets', { initialTab: 'All', eventInfo });
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

  const handleTotalScannedPress = () => {
    navigation.navigate('Tickets', { initialTab: 'Scanned', eventInfo });
  };

  const handleTotalUnscannedPress = () => {
    navigation.navigate('Tickets', { initialTab: 'Unscanned', eventInfo });
  };

  const handleAvailableTicketsPress = () => {
    setSelectedSaleScanTab('Sales');
    setSelectedTab('Available');

    // Add a small delay to ensure the content is rendered before scrolling
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSaleScanTabPress = (tab) => {
    setSelectedSaleScanTab(tab);
  };

  const handleAdminTabPress = (tab) => {
    setSelectedAdminTab(tab);
  };

  const handleAdminOnlineBoxOfficeTabPress = (tab) => {
    setSelectedAdminOnlineBoxOfficeTab(tab);
  };

  // Function to get tab list based on user role
  const getTabList = () => {
    if (userRole === 'ADMIN') {
      return ["Attendees", "Check-Ins", "Available"];
    } else {
      return ["Check-Ins", "Available"];
    }
  };

  // Function to get tab button width based on user role
  const getTabButtonWidth = () => {
    // Remove fixed width - use flex instead for better responsiveness
    return null;
  };

  const handleAnalyticsPress = async (ticketType, title, ticketUuid = null, subitemLabel = null) => {
    if (!eventInfo?.eventUuid || (userRole !== 'ADMIN' && userRole !== 'ORGANIZER' && userRole !== 'STAFF')) return;

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

      console.log('handleAnalyticsPress params:', { ticketType, title, ticketUuid, subitemLabel });

      const response = await ticketService.fetchDashboardStats(eventInfo.eventUuid, salesParam, ticketType, ticketUuid);

      // Handle sold tickets analytics only
      if (response?.data?.sold_tickets_analytics?.data) {
        const analyticsData = response.data.sold_tickets_analytics.data;
        const analyticsTitle = subitemLabel ? `${subitemLabel} Sales` : `${ticketType} Sales`;

        console.log('Sold Tickets Analytics Data:', analyticsData);
        console.log('Sold Tickets Analytics Response:', response.data.sold_tickets_analytics);

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

        console.log('Formatted Sold Tickets Chart Data:', chartData);
        setAnalyticsData(chartData);
        setAnalyticsTitle(analyticsTitle);
        setActiveAnalytics(analyticsKey);
      }
    } catch (error) {
      console.error('Error fetching analytics for', ticketType, error);
    }
  };

  // Separate handler for Check-Ins analytics
  const handleCheckInAnalyticsPress = async (ticketType, title, ticketUuid = null, subitemLabel = null) => {
    if (!eventInfo?.eventUuid || (userRole !== 'ADMIN' && userRole !== 'ORGANIZER' && userRole !== 'STAFF')) return;

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

      console.log('handleCheckInAnalyticsPress params:', { ticketType, title, ticketUuid, subitemLabel });

      const response = await ticketService.fetchDashboardStats(eventInfo.eventUuid, salesParam, ticketType, ticketUuid);

      // Handle Check-Ins analytics only
      if (response?.data?.checkin_analytics?.data) {
        const analyticsData = response.data.checkin_analytics.data;
        const analyticsTitle = subitemLabel ? `${subitemLabel} Check-Ins` : `${ticketType} Check-Ins`;

        console.log('Check-In Analytics Data:', analyticsData);
        console.log('Check-In Analytics Response:', response.data.checkin_analytics);

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

        console.log('Formatted Chart Data:', chartData);
        setCheckInAnalyticsData(chartData);
        setCheckInAnalyticsTitle(analyticsTitle);
        setActiveCheckInAnalytics(analyticsKey);
      }
    } catch (error) {
      console.error('Error fetching check-in analytics for', ticketType, error);
    }
  };

  const handleScanAnalyticsPress = async (scanType, parentCategory, ticketUuid = null) => {
    if (!eventInfo?.eventUuid) return;

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

      // Fetch fresh data with ticketType and ticketUuid parameters
      const response = await ticketService.fetchDashboardStats(eventInfo.eventUuid, salesParam, parentCategory, ticketUuid);

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
        console.warn('⚠️ No scan analytics data found in response');
      }
    } catch (error) {
      console.error('❌ Error fetching scan analytics for', scanType, error);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    console.log('Selected event:', event);

    // If the selected event is different from the current event
    if (event.uuid !== eventInfo?.eventUuid) {
      // Call the callback to update the parent component
      if (onEventChange) {
        onEventChange(event);
      }

      // Close the modal
      setEventsModalVisible(false);
    }
  };

  const getCheckInData = () => {
    if (
      dashboardStats?.data?.check_ins?.total_checkins === undefined ||
      dashboardStats?.data?.check_ins?.total_tickets === undefined
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
    // For ADMIN users, sold tickets data is in sold_tickets
    // For non-ADMIN users, sold tickets data is in box_office_sales.ticket_wise
    let dataSource;

    if (userRole === 'ADMIN') {
      // Use sold_tickets for ADMIN users
      dataSource = dashboardStats?.data?.sold_tickets;
    } else {
      // Use box_office_sales.ticket_wise for non-ADMIN users
      dataSource = dashboardStats?.data?.box_office_sales?.ticket_wise;
    }

    if (
      dataSource?.total_tickets === undefined ||
      dataSource?.sold_tickets === undefined
    ) {
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
        // Handle different data structures for ADMIN vs non-ADMIN
        let sold, total;

        if (userRole === 'ADMIN') {
          // ADMIN structure: sold_tickets and total_tickets
          sold = categoryData?.sold_tickets || 0;
          total = categoryData?.total_tickets || 0;
        } else {
          // Non-ADMIN structure: sold and total
          sold = categoryData?.sold || 0;
          total = categoryData?.total || 0;
        }

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
                ticketUuid: ticketInfo.ticket_uuid,
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

          {/* Admin Online Box Office Tab - Only for ADMIN users in Sales tab */}
          {userRole === 'ADMIN' && (
            <View style={styles.adminOnlineBoxOfficeTabContainer}>
              <View style={styles.adminOnlineBoxOfficeTabRow}>
                {adminonlineboxofficetab.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.adminOnlineBoxOfficeTabButton,
                      selectedAdminOnlineBoxOfficeTab === item && styles.selectedAdminOnlineBoxOfficeTabButton,
                    ]}
                    onPress={() => handleAdminOnlineBoxOfficeTabPress(item)}
                  >
                    <Text
                      style={[
                        styles.adminOnlineBoxOfficeTabButtonText,
                        selectedAdminOnlineBoxOfficeTab === item && styles.selectedAdminOnlineBoxOfficeTabButtonText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Admin Sales Components - Only for ADMIN users in Sales tab */}
          {userRole === 'ADMIN' && (
            <>
              {selectedAdminOnlineBoxOfficeTab === 'All' && (
                <AdminAllSales stats={dashboardStats} />
              )}
              {selectedAdminOnlineBoxOfficeTab === 'Online' && (
                <AdminOnlineSales stats={dashboardStats} />
              )}
              {selectedAdminOnlineBoxOfficeTab === 'Box Office' && (
                <>
                  <AdminBoxOfficeSales stats={dashboardStats} />
                  <CheckInSoldTicketsCard
                    title="Sold Tickets"
                    data={soldTicketsData}
                    remainingTicketsData={remainingTicketsData}
                    showRemaining={true}
                    userRole={userRole}
                    stats={dashboardStats}
                    onAnalyticsPress={handleAnalyticsPress}
                    activeAnalytics={activeAnalytics}
                  />
                </>
              )}
            </>
          )}

          {/* Show regular BoxOfficeSales for non-admin users or when admin is not in Sales tab */}
          {userRole !== 'ADMIN' && <BoxOfficeSales stats={dashboardStats} />}
          {/* Show CheckInSoldTicketsCard for non-admin users or when admin is not in Box Office tab */}
          {(userRole !== 'ADMIN' || (userRole === 'ADMIN' && selectedAdminOnlineBoxOfficeTab !== 'Box Office')) && (
            <CheckInSoldTicketsCard
              title="Sold Tickets"
              data={soldTicketsData}
              remainingTicketsData={remainingTicketsData}
              showRemaining={true}
              userRole={userRole}
              stats={dashboardStats}
              onAnalyticsPress={handleAnalyticsPress}
              activeAnalytics={activeAnalytics}
            />
          )}
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

          {/* Show AdminBoxOfficePaymentChannel for ADMIN users in Box Office tab after Analytics */}
          {userRole === 'ADMIN' && selectedAdminOnlineBoxOfficeTab === 'Box Office' && (
            <AdminBoxOfficePaymentChannel stats={dashboardStats} />
          )}
           {userRole === 'ORGANIZER' && (() => {
            console.log('🔍 ORGANIZER Payment Channels Debug:');
            console.log('dashboardStats?.data?.payment_channels:', dashboardStats?.data?.payment_channels);
            console.log('dashboardStats?.data?.payment_channel:', dashboardStats?.data?.payment_channel);
            console.log('dashboardStats?.data?.box_office_sales:', dashboardStats?.data?.box_office_sales);
            console.log('Full dashboardStats.data keys:', Object.keys(dashboardStats?.data || {}));
            
            // Determine the payment channel data from various possible locations
            const paymentChannelData = dashboardStats?.data?.payment_channels 
              || dashboardStats?.data?.payment_channel
              || dashboardStats?.data?.box_office_sales?.payment_channels
              || dashboardStats?.data?.box_office_sales?.payment_channel;
            
            console.log(' Resolved paymentChannelData:', paymentChannelData);
            
            return (
              <AdminBoxOfficePaymentChannel stats={{
                ...dashboardStats,
                data: {
                  ...dashboardStats?.data,
                  box_office_sales: {
                    ...dashboardStats?.data?.box_office_sales,
                    // Map payment_channels (plural) to payment_channel (singular) for compatibility
                    payment_channel: paymentChannelData
                  }
                }
              }} />
            );
          })()}

          {/* Total Payment Channel Card - Show for ADMIN Box Office and ORGANIZER */}
          {((userRole === 'ADMIN' && selectedAdminOnlineBoxOfficeTab === 'Box Office') || userRole === 'ORGANIZER') && (
            <TotalPaymentChannelCard 
              stats={dashboardStats} 
              onPaymentChannelPress={handlePaymentChannelPress}
              activePaymentChannel={activePaymentChannel}
            />
          )}

          {/* Payment Channel Analytics - Show for ADMIN Box Office and ORGANIZER */}
          {((userRole === 'ADMIN' && selectedAdminOnlineBoxOfficeTab === 'Box Office') || userRole === 'ORGANIZER') && (
            <PaymentChannelAnalytics 
              stats={dashboardStats} 
              selectedPaymentChannel={activePaymentChannel}
              eventInfo={eventInfo}
              userRole={userRole}
            />
          )}

          <View style={styles.tabContainer}>
            <View style={styles.tabRow}>
              {getTabList().map((item) => (
                <TouchableOpacity
                  key={item}
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
                    numberOfLines={2}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {selectedTab === "Check-Ins" && (
            <>
              <CheckInSoldTicketsCard
                title="Check-Ins"
                data={getCheckInData()}
                remainingTicketsData={[]}
                showRemaining={false}
                userRole={userRole}
                stats={dashboardStats}
                onAnalyticsPress={handleCheckInAnalyticsPress}
                activeAnalytics={activeCheckInAnalytics}
              />
              {checkInAnalyticsData && activeCheckInAnalytics ? (
                <AnalyticsChart
                  title={checkInAnalyticsTitle}
                  data={checkInAnalyticsData}
                  dataType="checked in"
                />
              ) : (
                <AnalyticsChart
                  title="Check In"
                  data={getCheckinAnalyticsChartData(
                    dashboardStats?.data?.checkin_analytics,
                    highlightHour
                  )}
                  dataType="checked in"
                />
              )}
            </>
          )}
          {selectedTab === "Available" && (
            <AvailableTicketsCard data={getAvailableTicketsData()} stats={dashboardStats} />
          )}
          {selectedTab === "Attendees" && (
            <AttendeesComponent eventInfo={eventInfo} onScanCountUpdate={onScanCountUpdate} />
          )}
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
          <ScanListComponent eventInfo={eventInfo} onScanCountUpdate={onScanCountUpdate} />
        </>
      );
    }

    if (selectedTab === "Attendees") {
      return <AttendeesComponent eventInfo={eventInfo} onScanCountUpdate={onScanCountUpdate} />;
    } else if (selectedTab === "Check-Ins" || selectedTab === "Sold Tickets" || selectedTab === "Available") {
      const data = selectedTab === "Check-Ins" ? getCheckInData() :
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
            userRole={userRole}
            stats={dashboardStats}
            onAnalyticsPress={selectedTab === "Check-Ins" ? handleCheckInAnalyticsPress : handleAnalyticsPress}
            activeAnalytics={selectedTab === "Check-Ins" ? activeCheckInAnalytics : activeAnalytics}
          />
          {selectedTab !== "Available" && (
            <>
              {selectedTab === "Check-Ins" ? (
                checkInAnalyticsData && activeCheckInAnalytics ? (
                  <AnalyticsChart
                    title={checkInAnalyticsTitle}
                    data={checkInAnalyticsData}
                    dataType="checked in"
                  />
                ) : (
                  <AnalyticsChart
                    title="Check In"
                    data={checkedInChartData}
                    dataType="checked in"
                  />
                )
              ) : (
                analyticsData && activeAnalytics ? (
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
                )
              )}
            </>
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

  const renderSaleScanTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.saleScanTabButton,
        selectedSaleScanTab === item && styles.selectedSaleScanTabButton,
      ]}
      onPress={() => handleSaleScanTabPress(item)}
    >
      <Text
        // variant={selectedSaleScanTab === item ? "tabActive" : "tab"}
        style={[
          styles.saleScanTabButtonText,
          selectedSaleScanTab === item && styles.selectedSaleScanTabButtonText,
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
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.eventName} numberOfLines={1} ellipsizeMode="tail">{truncateEventName(eventInfo?.event_title) || 'OUTMOSPHERE'}</Text>
              {userRole === 'ADMIN' && (
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setEventsModalVisible(true)}
                >
                  <SvgIcons.downArrowWhite width={12} height={12} fill={color.white_FFFFFF} stroke={color.white_FFFFFF} strokeWidth={0} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.separator}></Text>
            <Text style={styles.cityName} numberOfLines={1} ellipsizeMode="tail">{truncateCityName(eventInfo?.cityName) || 'Accra'}</Text>
            <Text style={styles.separator}>   </Text>
            <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{formatDateWithMonthName(eventInfo?.date) || '30 Oct 2025'}</Text>
            <Text style={styles.separator}></Text>
            <Text style={styles.separator}></Text>
            <Text style={styles.time} numberOfLines={1} ellipsizeMode="tail">{eventInfo?.time || '7:00 PM'}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Admin Dashboard Terminal Tab - Only for ADMIN users */}
      {userRole === 'ADMIN' && (
        <View style={styles.adminTabContainer}>
          <View style={styles.adminTabRow}>
            {admindashboardterminaltab.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.adminTabButton,
                  selectedAdminTab === item && styles.selectedAdminTabButton,
                ]}
                onPress={() => handleAdminTabPress(item)}
              >
                <Text
                  style={[
                    styles.adminTabButtonText,
                    selectedAdminTab === item && styles.selectedAdminTabButtonText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {userRole === 'ADMIN' && selectedAdminTab === 'Terminals' ? (
        // Render TerminalsComponent directly without ScrollView wrapper
        <TerminalsComponent eventInfo={eventInfo} onEventChange={onEventChange} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}>
          <View style={styles.wrapper}>
            {/* <Heading5 style={styles.labelDashboard}>Dashboard</Heading5> */}
            {loading || userProfileLoading ? (
              <Text style={styles.loadingText}>
                {loading ? 'Loading dashboard stats...' : 'Loading user profile...'}
              </Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <>
                {userRole === 'ADMIN' ? (
                  // Admin user - show content based on selected admin tab
                  selectedAdminTab === 'Dashboard' ? (
                    <>
                      {console.log('Rendering AdminOverallStatistics for role:', userRole)}
                      <View style={styles.overallStatisticsContainer}>
                        <AdminOverallStatistics
                          stats={dashboardStats}
                          onTotalTicketsPress={handleTotalTicketsPress}
                          onTotalScannedPress={handleTotalScannedPress}
                          onTotalUnscannedPress={handleTotalUnscannedPress}
                          onAvailableTicketsPress={handleAvailableTicketsPress}
                        />
                      </View>
                    </>
                  ) : null
                ) : (
                  <>
                    {console.log('Rendering OverallStatistics for role:', userRole)}
                    <View style={styles.overallStatisticsContainer}>
                      <OverallStatistics
                        stats={dashboardStats}
                        onTotalTicketsPress={handleTotalTicketsPress}
                        onTotalScannedPress={handleTotalScannedPress}
                        onTotalUnscannedPress={handleTotalUnscannedPress}
                        onAvailableTicketsPress={handleAvailableTicketsPress}
                      />
                    </View>
                  </>
                )}

                {/* Show sales/scan tabs and other content only for Dashboard tab or non-admin users */}
                {(userRole !== 'ADMIN' || selectedAdminTab === 'Dashboard') && (
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

                    {selectedSaleScanTab !== "Sales" && selectedSaleScanTab !== "Scans" && (
                      <>
                        <BoxOfficeSales stats={dashboardStats} />
                        <View style={styles.tabContainer}>
                          <View style={styles.tabRow}>
                            {getTabList().map((item) => (
                              <TouchableOpacity
                                key={item}
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
                                  numberOfLines={2}
                                >
                                  {item}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </>
                    )}
                    {renderContent()}
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Events Modal for ADMIN users */}
      <EventsModal
        visible={eventsModalVisible}
        onClose={() => setEventsModalVisible(false)}
        onEventSelect={handleEventSelect}
        currentEventUuid={eventInfo?.eventUuid}
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
    height: Platform.OS === 'android' ? 0 : 0,
    backgroundColor: 'transparent',
  },
  headerColumn: {
    paddingTop: Platform.OS === 'android' ? 15 : 0,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginHorizontal: 2,
  },
  tabButtonText: {
    color: color.black_544B45,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    flexWrap: 'wrap',
    numberOfLines: 2,
  },
  selectedTabButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.white_FFFFFF,
    borderRadius: 7,
    backgroundColor: color.white_FFFFFF,
    marginHorizontal: 2,
  },
  selectedTabButtonText: {
    color: color.placeholderTxt_24282C,
    textAlign: 'center',
    fontSize: 14,
    flexWrap: 'wrap',
    numberOfLines: 2,
    fontWeight: '500',
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
    marginTop: 3,
    padding: 10,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  saleScanTabButtonText: {
    color: color.black_544B45,
    fontWeight: '400',
    fontSize: 14,
  },
  adminTabContainer: {
    marginHorizontal: 16,
    marginVertical: 12
  },
  adminTabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  adminTabButton: {
    padding: 10,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  adminTabButtonText: {
    color: color.black_544B45,
    fontWeight: '400',
    fontSize: 14,
  },
  selectedAdminTabButton: {
    width: '50%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.white_FFFFFF,
    borderRadius: 7,
    backgroundColor: color.white_FFFFFF,
  },
  selectedAdminTabButtonText: {
    color: color.placeholderTxt_24282C,
    fontWeight: '500',
    fontSize: 14,
  },
  adminOnlineBoxOfficeTabContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  adminOnlineBoxOfficeTabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  adminOnlineBoxOfficeTabButton: {
    padding: 10,
    width: '32%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#F7E4B690',
    borderColor: '#F7E4B690',
    borderRadius: 7,
    borderWidth: 1,
  },
  adminOnlineBoxOfficeTabButtonText: {
    color: color.black_544B45,
    fontSize: 14,
    fontWeight: '400'
  },
  selectedAdminOnlineBoxOfficeTabButton: {
    width: '32%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.btnBrown_AE6F28,
    borderRadius: 7,
    backgroundColor: color.btnBrown_AE6F28,
  },
  selectedAdminOnlineBoxOfficeTabButtonText: {
    color: color.white_FFFFFF,
    fontWeight: '500',
    fontSize: 14,
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
    fontWeight: '500',
    fontSize: 14,
  },
  overallStatisticsContainer: {
    marginTop: 4,
  },
});

export default DashboardScreen;
