import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../components/header';
import TicketsTab from './TicketsTab';
import BoxOfficeTab from '../screens/BoxOfficeTab';
import { color } from '../color/color';
import SvgIcons from '../components/SvgIcons';

const SettingsScreen = (props) => {
  const routeFromHook = useRoute();
  const navigationFromHook = useNavigation();
  const route = props.route || routeFromHook;
  const navigation = props.navigation || navigationFromHook;

  const routeParams = route?.params || {};
  const { initialTab, eventInfo: routeEventInfo, selectedTab } = routeParams;
  const finalEventInfo = props.eventInfo || routeEventInfo;
  const { onScanCountUpdate, activeHeaderTab: propActiveHeaderTab, onHeaderTabChange, userRole } = props;
  const activeHeaderTab = propActiveHeaderTab || routeParams?.activeHeaderTab || 'Sell';

  // Only show back button when navigated to via root stack (TicketsDetail)
  const isFromRootStack = route?.name === 'TicketsDetail';

  const shouldOpenBoxOffice = routeParams?.openBoxOffice || routeParams?.screen === 'BoxOfficeTab';
  const [activeView, setActiveView] = useState(shouldOpenBoxOffice ? 'BoxOfficeTab' : 'TicketsTab');
  const [tabKey, setTabKey] = useState(0);

  useEffect(() => {
    if (routeParams?.initialTab === 'Scanned') {
      setActiveView('TicketsTab');
    }
  }, [routeParams?.initialTab]);

  useEffect(() => {
    if (routeParams?.screen === 'BoxOfficeTab' || routeParams?.openBoxOffice) {
      setActiveView('BoxOfficeTab');
    }
  }, [routeParams]);

  const tickets = [
    { id: '#12389651342', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Scanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651343', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Unscanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651344', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Scanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651345', type: 'Standard Ticket', price: 30, date: 'Sun, 02 2025', status: 'Unscanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651346', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Scanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651347', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Unscanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651348', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Scanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651349', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Unscanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651350', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Scanned', imageUrl: SvgIcons.qRIcon },
    { id: '#12389651351', type: 'Standard Ticket', price: 30, date: 'Sat, 02 2025', status: 'Unscanned', imageUrl: SvgIcons.qRIcon },
  ];

  const handleBackPress = () => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Header
        eventInfo={finalEventInfo}
        showBackButton={isFromRootStack}
        onBackPress={handleBackPress}
        activeTab={activeHeaderTab}
        onTabChange={onHeaderTabChange}
        userRole={userRole}
      />
      <View style={styles.contentContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveView('TicketsTab')}
            style={[styles.button, activeView === 'TicketsTab' && styles.activeButton]}
          >
            <Text style={activeView === 'TicketsTab' ? [styles.buttonText, styles.activeButtonText] : styles.buttonText}>
              Tickets
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveView('BoxOfficeTab')}
            style={[styles.button, activeView === 'BoxOfficeTab' && styles.activeButton]}
          >
            <Text style={activeView === 'BoxOfficeTab' ? [styles.buttonText, styles.activeButtonText] : styles.buttonText}>
              Box Office
            </Text>
          </TouchableOpacity>
        </View>
        {activeView === 'TicketsTab' && <TicketsTab tickets={tickets} key={tabKey} eventInfo={finalEventInfo} initialTab={initialTab} />}
        {activeView === 'BoxOfficeTab' && <BoxOfficeTab eventInfo={finalEventInfo} onScanCountUpdate={onScanCountUpdate} selectedTab={selectedTab} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  contentContainer: { flex: 1 },
  tabContainer: { flexDirection: 'row', justifyContent: 'flex-start', paddingTop: 6, paddingHorizontal: 10, paddingBottom: 14 },
  button: { width: '50%', height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  activeButton: { width: '50%', height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: color.white_FFFFFF, borderRadius: 7, backgroundColor: color.white_FFFFFF },
  buttonText: { color: color.brown_766F6A, fontWeight: '400', fontSize: 14 },
  activeButtonText: { color: color.brown_3C200A, fontWeight: '500', fontSize: 14 },
});

export default SettingsScreen;