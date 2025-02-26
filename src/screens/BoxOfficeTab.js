import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, TextInput, Platform, Dimensions } from 'react-native';
import { boxofficetablist } from '../constants/boxofficetablist';
import { Ionicons } from '@expo/vector-icons';
import { color } from '../color/color';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import SvgIcons from '../../components/SvgIcons';

const BoxOfficeTab = () => {
  const navigation = useNavigation()
  const [selectedTab, setSelectedTab] = useState(boxofficetablist[0]);
  const [email, setEmail] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const { width } = Dimensions.get('window');

  // const getPaddingHorizontalToPayment = () => {
  //   if (Platform.OS === 'ios') {
  //     if (width === 375) {
  //       // iPhone 6/7/8
  //       return 35;
  //     } else if (width > 375 && width <= 414) {
  //       // iPhone 7 Plus, 8 Plus
  //       return 45;
  //     } else {
  //       return 45;
  //     }
  //   } else {
  //     // Android default value
  //     return 43;
  //   }
  // };

  //const paymentPaddingHorizontal = getPaddingHorizontalToPayment();

  const [selectedTickets, setSelectedTickets] = useState([
    { type: 'Standard Ticket', price: 40, discountPrice: 30, quantity: 2 },
    { type: 'VIP Ticket', price: 40, discountPrice: 30, quantity: 2 }
  ]);

  const navigateToCheckInAllTicketsScreen = () => {
    if (!email) {
      alert('Please enter a valid email or phone number.');
      return;
    }

    if (!paymentOption) {
      alert('Please select a payment option.');
      return;
    }

    const totalQuantity = selectedTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    navigation.navigate('CheckInAllTickets', { totalTickets: totalQuantity, email, paymentOption });
  };


  const allTickets = {
    'Early Bird': [
      { type: 'Standard Ticket', price: 40, discountPrice: 30, quantity: 2 },
      { type: 'Standard Ticket', price: 50, discountPrice: 35, quantity: 1 },
    ],
    'VIP Ticket': [
      { type: 'VIP Ticket', price: 80, discountPrice: 70, quantity: 2 },
    ],
    'Members': [
      { type: 'Members Ticket', price: 30, discountPrice: 25, quantity: 1 },
    ],
    // 'Standard': [
    //   { type: 'Standard Ticket 1', price: 40, discountPrice: 30, quantity: 2 },
    //   { type: 'Standard Ticket 2', price: 60, discountPrice: 50, quantity: 1 },
    //   { type: 'Standard Ticket 2', price: 80, discountPrice: 75, quantity: 1 },
    //   { type: 'Standard Ticket 2', price: 30, discountPrice: 20, quantity: 1 },
    // ],
    // 'VIP': [
    //   { type: 'Standard Ticket 1', price: 50, discountPrice: 40, quantity: 2 },
    //   { type: 'Standard Ticket 2', price: 30, discountPrice: 20, quantity: 1 },
    //   { type: 'Standard Ticket 2', price: 40, discountPrice: 30, quantity: 1 },
    // ],
  };

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
    setSelectedTickets(allTickets[tab] || []);
    // You can update the selectedTickets list based on the tab selection here.
    // Example: Filter the tickets dynamically based on the selected tab
    // setSelectedTickets(filteredTicketsBasedOnTab);
  };

  const renderTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === item && styles.selectedTabButton, // Apply selected styles
      ]}
      onPress={() => handleTabPress(item)}
    >
      <Text
        style={[
          styles.tabButtonText,
          selectedTab === item && styles.selectedTabButtonText, // Apply selected styles
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );


  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .test('emailOrPhone', 'Invalid email or phone number', (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[0-9]{10,15}$/.test(value)
      )
      .required('Required'),
  });


  const QuantitySelector = ({ quantity, onIncrease, onDecrease }) => {
    return (
      <View style={styles.quantitySelectorContainer}>
        <TouchableOpacity onPress={onDecrease} style={styles.quantityButton}>
          <Ionicons name="remove" size={24} color="#544B45" />
        </TouchableOpacity>
        <View style={styles.quantityCountContainer}>
          <Text style={styles.quantityText}>{quantity}</Text>
        </View>
        <TouchableOpacity onPress={onIncrease} style={styles.quantityButton}>
          <Ionicons name="add" size={24} color="#544B45" />
        </TouchableOpacity>
      </View>
    );
  };

  const calculateTotal = () => {
    return selectedTickets.reduce(
      (total, ticket) => total + ticket.quantity * ticket.discountPrice,
      0
    );
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedTickets = [...selectedTickets];
    if (newQuantity >= 0) {
      updatedTickets[index].quantity = newQuantity;
      setSelectedTickets(updatedTickets);
    }
  };

  const renderTicketItem = ({ item, index }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketRow}>
        <View style={styles.leftColumn}>
          <Text style={styles.ticketType}>{item.type}</Text>
          <Text style={styles.discountText}>Early Bird Discount</Text>
          <View style={styles.validTillContainer}>
            <Text style={styles.validTillText}>valid till</Text>
            <Text style={styles.dateText}>12-09-2024</Text>
          </View>
          <Text style={styles.descriptionText}>
            Join the excitement and be{'\n'}part of the crowd at our event!
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>USD {item.price}</Text>
            <Text style={styles.discountPrice}>USD {item.discountPrice}</Text>
          </View>
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => handleQuantityChange(index, item.quantity + 1)}
            onDecrease={() => handleQuantityChange(index, item.quantity - 1)}
          />
        </View>
      </View>
    </View>
  );
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          data={Object.keys(allTickets)}
          renderItem={renderTab}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>


      <FlatList
        data={selectedTickets}
        renderItem={renderTicketItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />


      <View style={styles.footer}>
        <View style={styles.lineView}></View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalValue}>${calculateTotal()}</Text>
        </View>
        <View style={styles.lineView2}></View>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={validationSchema}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={{ width: '100%' }}>
              <Text style={styles.inputHeading}>Email or Phone Number</Text>
              <TextInput
                style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
                placeholder="johndoe@gmail.com"
                placeholderTextColor={color.placeholderTxt_24282C}
                onChangeText={(text) => {
                  handleChange('email')(text);
                  setEmail(text);
                }}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                selectionColor={color.selectField_CEBCA0}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>
          )}
        </Formik>
        <View style={styles.Paylabel}>
          <Text>Pay With</Text>
        </View>
        <View style={styles.paymentOptions}>
          {/* Cash Button */}
          <TouchableOpacity
            style={[styles.paymentOption,
            paymentOption === 'Cash' && { borderColor: '#AE6F28' },
            { alignSelf: 'flex-start' }
            ]}
            onPress={() => setPaymentOption('Cash')}
          >
           {paymentOption === 'Cash' ? (
          <SvgIcons.cameraIconActive width={24} height={24} />
        ) : (
          <SvgIcons.cameraIconInActive width={24} height={24} />
        )}
            <Text style={[styles.paymentOptionText, paymentOption === 'Cash' && { color: '#5A2F0E' }]}>
              Cash
            </Text>
          </TouchableOpacity>

          {/* Debit/Credit Card Button */}
          <TouchableOpacity
            style={[styles.paymentOption,
            paymentOption === 'Debit/Credit Card' && { borderColor: '#AE6F28' },
            { flex: 1 }
            ]}
            onPress={() => setPaymentOption('Debit/Credit Card')}
          >
            {paymentOption === 'Debit/Credit Card' ? (
          <SvgIcons.cardIconActive width={24} height={24} />
        ) : (
          <SvgIcons.cardIconInActive width={24} height={24} />
        )}
            <Text style={[styles.paymentOptionText, paymentOption === 'Debit/Credit Card' && { color: '#5A2F0E' }]}>
              Debit/Credit Card
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.paymentOptioncard, paymentOption === 'Card/Mobile Money' && { borderColor: '#AE6F28' }]} onPress={() => setPaymentOption('Card/Mobile Money')}>
        {paymentOption === 'Card/Mobile Money' ? (
        <SvgIcons.mobMoneyIconActive width={24} height={24} />
      ) : (
        <SvgIcons.mobMoneyIconInActive width={24} height={24} />
      )}
          <Text style={[styles.paymentOptionText, paymentOption === 'Card/Mobile Money' && { color: '#5A2F0E' }]}>Card/Mobile Money</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.getTicketsButton,
            !selectedTickets.some(ticket => ticket.quantity > 0) && { backgroundColor: '#AE6F28A0' },
          ]}
          onPress={navigateToCheckInAllTicketsScreen}
          disabled={!selectedTickets.some(ticket => ticket.quantity > 0)}
        >
          <Text style={styles.getTicketsButtonText}>Get Ticket(s)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  tabContainer: {
    marginBottom: 10,
  },
  tabButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F7E4B680',
    marginHorizontal: 5,
    backgroundColor: '#F7E4B680',
  },
  tabButtonText: {
    color: '#544B45',
  },
  selectedTabButton: {
    backgroundColor: '#AE6F28',
    borderColor: '#AE6F28',
  },
  selectedTabButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ticketCard: {
    borderWidth: 1,
    backgroundColor: '#F7E4B680',
    borderColor: '#F7E4B680',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    top: 10
  },
  ticketType: {
    fontWeight: '700',
    marginBottom: 5,
    fontSize: 14,
    color: color.black_2F251D
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  discountPrice: {
    fontWeight: 'bold',
  },
  discountText: {
    fontSize: 12,
    color: '#5A2F0E',
    marginTop: 5,
    fontWeight: 'bold'
  },
  descriptionText: {
    fontSize: 12,
    color: '#544B45',
    marginTop: 5,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    top: 3
  },

  totalText: {
    fontSize: 16,
    color: '#544B45',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#544B45',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  paymentOptions: {
    top: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10
  },
  paymentOptioncard: {
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CEBCA0',
    borderRadius: 10,
    top: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5

  },
  paymentOption: {
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CEBCA0',
    borderRadius: 10,
    paddingHorizontal: 39,
    gap: 5
  },
  paymentOptionText: {
    margin: Platform.OS === 'ios' ? 2 : 0,
    color: color.black_544B45
  },
  getTicketsButton: {
    backgroundColor: '#AE6F28',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    top: 40,
    marginBottom: 45
  },
  getTicketsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    marginRight: 10,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginRight: 10,
    color: '#544B45',
    fontSize: 14,
  },
  discountPrice: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 16,
  },
  quantitySelectorContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 0.4,
    borderColor: '#544B45',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    padding: 5,
  },

  quantityCountContainer: {
    paddingHorizontal: 15,
    borderLeftWidth: 0.4,
    borderRightWidth: 0.4,
    borderColor: '#544B45',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontWeight: 'bold',
    color: '#544B45',
    fontSize: 18
  },
  validTillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  validTillText: {
    fontSize: 12,
    color: '#5A2F0E',
    marginRight: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#5A2F0E',
  },
  lineView: {
    borderColor: '#CEBCA0',
    width: '100%',
    borderWidth: 0.5,
    top: 10
  },

  lineView2: {
    borderColor: '#CEBCA0',
    width: '100%',
    borderWidth: 0.5,
    marginBottom: 10,

  },
  input: {
    top: 20,
    width: '100%',
    height: 50,
    borderColor: color.borderBrown_CEBCA0,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputHeading: {
    top: 20,
    color: color.black_2F251D,
    marginBottom: 10,
  },
  inputError: {
    borderColor: color.red_FF0000,
  },
  errorText: {
    top: 10,
    color: color.red_FF0000,
    marginBottom: 10,
  },
  Paylabel: {
    top: 25,
    color: color.brown_3C200A
  },
  cameraImage: {
    width: 20,
    height: 20,
  },
});

export default BoxOfficeTab;