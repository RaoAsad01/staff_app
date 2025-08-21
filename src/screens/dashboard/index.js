import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, StatusBar, SafeAreaView, FlatList, ScrollView, Alert, Dimensions } from 'react-native';
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
import Typography, { Heading5, Body1, Label } from '../../components/Typography';
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
import { admindashboardterminaltab } from '../../constants/admindashboardterminaltab';
import { adminonlineboxofficetab } from '../../constants/adminonlineboxofficetab';
import { truncateCityName } from '../../utils/stringUtils';

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
        console.log('profile?.user_role:', profile?.user_role);
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

  const handleAdminTabPress = (tab) => {
    setSelectedAdminTab(tab);
  };

  const handleAdminOnlineBoxOfficeTabPress = (tab) => {
    setSelectedAdminOnlineBoxOfficeTab(tab);
  };

  // Function to get tab list based on user role
  const getTabList = () => {
    if (userRole === 'ADMIN') {
      return ["Attendees", "Check-Ins", "Available Tickets"];
    } else {
      return ["Check-Ins", "Available Tickets"];
    }
  };

  // Function to get tab button width based on user role
  const getTabButtonWidth = () => {
    // Remove fixed width - use flex instead for better responsiveness
    return null;
  };

  const handleAnalyticsPress = async (ticketType, title) => {
    if (!eventInfo?.eventUuid || userRole !== 'ADMIN') return;

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

      const response = await ticketService.fetchDashboardStats(eventInfo.eventUuid, salesParam, ticketType);

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
      !dataSource?.total_tickets ||
      !dataSource?.sold_tickets
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
                    <Typography
                      variant={selectedAdminOnlineBoxOfficeTab === item ? "tabActive" : "tab"}
                      style={[
                        styles.adminOnlineBoxOfficeTabButtonText,
                        selectedAdminOnlineBoxOfficeTab === item && styles.selectedAdminOnlineBoxOfficeTabButtonText,
                      ]}
                    >
                      {item}
                    </Typography>
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
                  <AdminBoxOfficePaymentChannel stats={dashboardStats} />
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
                  <Typography
                    variant={selectedTab === item ? "tabActive" : "tab"}
                    style={[
                      styles.tabButtonText,
                      selectedTab === item && styles.selectedTabButtonText,
                    ]}
                    numberOfLines={2}
                  >
                    {item}
                  </Typography>
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
                onAnalyticsPress={handleAnalyticsPress}
                activeAnalytics={activeAnalytics}
              />
              <AnalyticsChart
                title="Check In"
                data={getCheckinAnalyticsChartData(
                  dashboardStats?.data?.checkin_analytics,
                  highlightHour
                )}
                dataType="checked in"
              />
            </>
          )}
          {selectedTab === "Available Tickets" && (
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
    } else if (selectedTab === "Check-Ins" || selectedTab === "Sold Tickets" || selectedTab === "Available Tickets") {
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
            onAnalyticsPress={handleAnalyticsPress}
            activeAnalytics={activeAnalytics}
          />
          {selectedTab !== "Available Tickets" && (
            <AnalyticsChart
              title={selectedTab}
              data={selectedTab === "Check-Ins" ? checkedInChartData : soldTicketsChartData}
              dataType={selectedTab === "Check-Ins" ? "checked in" : "sold"}
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
          <View style={styles.headerLeft}>
            <Body1 style={styles.eventName}>{eventInfo?.event_title || 'OUTMOSPHERE'}</Body1>
            {userRole === 'ADMIN' && (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setEventsModalVisible(true)}
              >
                <SvgIcons.downArrowWhite width={12} height={12} fill={color.white_FFFFFF} stroke={color.white_FFFFFF} strokeWidth={0} />
              </TouchableOpacity>
            )}
          </View>
          <Body1 style={styles.separator}></Body1>
          <Body1 style={styles.cityName}>{truncateCityName(eventInfo?.cityName) || 'Accra'}</Body1>
          <Body1 style={styles.separator}>   </Body1>
          <Body1 style={styles.date}>{eventInfo?.date || '28-12-2024'}</Body1>
          <Body1 style={styles.separator}></Body1>
          <Body1 style={styles.date}>at</Body1>
          <Body1 style={styles.separator}></Body1>
          <Body1 style={styles.time}>{eventInfo?.time || '7:00 PM'}</Body1>
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
                <Typography
                  variant={selectedAdminTab === item ? "tabActive" : "tab"}
                  style={[
                    styles.adminTabButtonText,
                    selectedAdminTab === item && styles.selectedAdminTabButtonText,
                  ]}
                >
                  {item}
                </Typography>
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
              <Body1 style={styles.loadingText}>
                {loading ? 'Loading dashboard stats...' : 'Loading user profile...'}
              </Body1>
            ) : error ? (
              <Body1 style={styles.errorText}>{error}</Body1>
            ) : (
              <>
                {userRole === 'ADMIN' ? (
                  // Admin user - show content based on selected admin tab
                  selectedAdminTab === 'Dashboard' ? (
                    <>
                      {console.log('Rendering AdminOverallStatistics for role:', userRole)}
                      <AdminOverallStatistics
                        stats={dashboardStats}
                        onTotalTicketsPress={handleTotalTicketsPress}
                        onTotalScannedPress={handleTotalScannedPress}
                        onTotalUnscannedPress={handleTotalUnscannedPress}
                        onAvailableTicketsPress={handleAvailableTicketsPress}
                      />
                    </>
                  ) : null
                ) : (
                  <>
                    {console.log('Rendering OverallStatistics for role:', userRole)}
                    <OverallStatistics
                      stats={dashboardStats}
                      onTotalTicketsPress={handleTotalTicketsPress}
                      onTotalScannedPress={handleTotalScannedPress}
                      onTotalUnscannedPress={handleTotalUnscannedPress}
                      onAvailableTicketsPress={handleAvailableTicketsPress}
                    />
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
                            {getTabList().map((item) => (
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
                                  numberOfLines={2}
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
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: 'transparent',
  },
  headerColumn: {
    paddingTop: Platform.OS === 'android' ? 15 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    backgroundColor: color.btnBrown_AE6F28,
    height: 48,
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
    fontWeight: '700',
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
    fontSize: Math.min(14, Dimensions.get('window').width / 32),
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
    fontSize: Math.min(14, Dimensions.get('window').width / 32),
    flexWrap: 'wrap',
    numberOfLines: 2,
    fontWeight: '700',
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
    fontWeight: '700'
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
    backgroundColor: color.brown_F7E4B6,
    borderColor: color.brown_F7E4B6,
    borderRadius: 7,
    borderWidth: 1,
  },
  adminOnlineBoxOfficeTabButtonText: {
    color: color.black_544B45,
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
    fontWeight: '500'
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
    fontWeight: '700'
  },
});

export default DashboardScreen;
