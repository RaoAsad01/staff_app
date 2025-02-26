import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text,StatusBar ,SafeAreaView} from 'react-native';
import Header from '../../components/header';
import TicketsTab from './TicketsTab';
import BoxOfficeTab from './BoxOfficeTab';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';

const SettingsScreen = () => {
  const [activeView, setActiveView] = useState('TicketsTab');
  
  const tickets = [
    {
      id: '#12389651342',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Scanned',
      imageUrl: SvgIcons.qRIcon
    },
    {
      id: '#12389651343',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Unscanned',
      imageUrl: SvgIcons.qRIcon
    },
    {
      id: '#12389651344',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Scanned',
      imageUrl: SvgIcons.qRIcon
    },
    {
      id: '#12389651345',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sun, 02 2025',
      status: 'Unscanned',
      imageUrl: SvgIcons.qRIcon
    }, {
      id: '#12389651346',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Scanned',
      imageUrl: SvgIcons.qRIcon
    },
    {
      id: '#12389651347',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Unscanned',
      imageUrl: SvgIcons.qRIcon
    }, {
      id: '#12389651348',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Scanned',
      imageUrl: SvgIcons.qRIcon
    },
    {
      id: '#12389651349',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Unscanned',
      imageUrl: SvgIcons.qRIcon
    }, {
      id: '#12389651350',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Scanned',
      imageUrl: SvgIcons.qRIcon
    },
    {
      id: '#12389651351',
      type: 'Standard Ticket',
      price: 30,
      date: 'Sat, 02 2025',
      status: 'Unscanned',
      imageUrl: SvgIcons.qRIcon
    },
    // Add more tickets
  ];

  const handleTicketsPress = () => {
    setActiveView('TicketsTab');
  };

  const handleBoxOfficePress = () => {
    setActiveView('BoxOfficeTab');
  };

  return (
    <SafeAreaView style={styles.container}>
       <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Header />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={handleTicketsPress}
          style={[styles.button, activeView === 'TicketsTab' && styles.activeButton]}
        >
          <Text
            style={
              activeView === 'TicketsTab'
                ? [styles.buttonText, styles.activeButtonText]
                : styles.buttonText
            }
          >
            Tickets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBoxOfficePress}
          style={[styles.button, activeView === 'BoxOfficeTab' && styles.activeButton]}
        >
          <Text
            style={
              activeView === 'BoxOfficeTab'
                ? [styles.buttonText, styles.activeButtonText]
                : styles.buttonText
            }
          >
            Box Office
          </Text>
        </TouchableOpacity>
      </View>

      {activeView === 'TicketsTab' && <TicketsTab tickets={tickets} />}
      {activeView === 'BoxOfficeTab' && <BoxOfficeTab />}


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white_FFFFFF
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: 84,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginRight: 10,
  },
  activeButton: {
    width: 84,
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
  buttonText: {
    color: color.brown_766F6A,
    fontWeight: '400',
    fontSize: 14
  },
  activeButtonText: {
    color: color.brown_3C200A,
    fontWeight: '500',
    fontSize: 14
  },

});

export default SettingsScreen;
