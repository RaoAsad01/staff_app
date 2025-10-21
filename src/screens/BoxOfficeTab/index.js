import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, TextInput, Platform, Dimensions, Modal, ActivityIndicator } from 'react-native';
// import { boxofficetablist } from '../../constants/boxofficetablist';
import { Ionicons } from '@expo/vector-icons';
import { color } from '../../color/color';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import SvgIcons from '../../../components/SvgIcons';
import { ticketService } from '../../api/apiService';
import { formatDateOnly } from '../../constants/dateAndTime';

const BoxOfficeTab = ({ eventInfo, onScanCountUpdate, selectedTab }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const ticketUuid = route.params?.ticketUuid;
  const [selectedTabState, setSelectedTabState] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [purchaseCode, setPurchaseCode] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [isPOSModalVisible, setPOSModalVisible] = useState(false);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [ticketPricing, setTicketPricing] = useState([]);
  const [pricingCategories, setPricingCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const { width } = Dimensions.get('window');
  const [nameError, setNameError] = useState('');
  const [transactionError, setTransactionError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [wrongPurchaseCodeError, setWrongPurchaseCodeError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [showError, setShowError] = useState(false);
  const formikRef = useRef(null);

  const resetData = () => {
    setSelectedTabState('');
    setName('');
    setEmail('');
    setPurchaseCode('');
    setPaymentOption('');
    setPOSModalVisible(false);
    setTransactionNumber('');
    setTicketPricing([]);
    setPricingCategories([]);
    setSelectedTickets([]);
    setIsLoading(true);
    setNameError('');
    setTransactionError('');
    setEmailError('');
    setPurchaseError('');
    setWrongPurchaseCodeError('');
    setPaymentError('');
    setTicketError('');
  };

  const fetchData = async () => {
    try {
      if (!eventInfo?.eventUuid) {
        console.error('BoxOfficeTab: No event_uuid provided');
        return;
      }

      // Fetch pricing categories
      const pricingStatsResponse = await ticketService.fetchTicketPricingStats();
      if (pricingStatsResponse?.data) {
        const categories = pricingStatsResponse.data.map(item => item.alias);
        setPricingCategories(categories);

        // Set initial selected tab based on selectedTab prop or prioritize Early Bird
        if (selectedTab && categories.includes(selectedTab)) {
          setSelectedTabState(selectedTab);
        } else if (categories.length > 0) {
          // Prioritize Early Bird as default, fallback to first category
          const earlyBirdIndex = categories.findIndex(cat => cat === 'Early Bird');
          if (earlyBirdIndex !== -1) {
            setSelectedTabState('Early Bird');
          } else {
            setSelectedTabState(categories[0]);
          }
        }
      }

      // Fetch ticket pricing
      console.log('BoxOfficeTab: Fetching ticket pricing for event:', eventInfo?.eventUuid);
      const pricingData = await ticketService.fetchTicketPricing(eventInfo?.eventUuid);
      console.log('BoxOfficeTab: Received pricing data:', pricingData);

      if (!pricingData) {
        console.error('BoxOfficeTab: No pricing data received');
        return;
      }

      // Process pricing type options - DON'T group by type_obj.alias
      // Each ticket should be treated separately since they have different class_name and uuid
      const categories = pricingData.pricing_type_options.reduce((acc, option) => {
        const categoryTitle = option.type_obj.alias;
        const existingCategory = acc.find(category => category.title === categoryTitle);

        const ticket = {
          name: option.class_name, // Use class_name as primary, fallback to description
          uuid: option.uuid,
          price: parseFloat(option.price),
          discount_price: option.discounted_price ? parseFloat(option.discounted_price) : parseFloat(option.price),
          quantity: option.quantity,
          remaining: option.remaining_tickets,
          purchase_limit: option.purchase_limit,
          currency: option.currency,
          sale_end_date_time: pricingData.sale_end_date_time,
          description: option.description,
        };

        // If ticketUuid is provided, only include tickets that match
        if (ticketUuid && ticket.uuid !== ticketUuid) {
          return acc;
        }

        if (existingCategory) {
          existingCategory.tickets.push(ticket);
        } else {
          acc.push({
            title: categoryTitle,
            tickets: [ticket]
          });
        }

        return acc;
      }, []);

      console.log('BoxOfficeTab: Processed categories:', categories);

      setTicketPricing(categories);

      // Set initial selected tickets based on the selected tab
      let targetCategory;
      if (selectedTab && categories.find(cat => cat.title === selectedTab)) {
        targetCategory = categories.find(cat => cat.title === selectedTab);
      } else {
        // Prioritize Early Bird as default, fallback to first category
        const earlyBirdCategory = categories.find(cat => cat.title === 'Early Bird');
        targetCategory = earlyBirdCategory || categories[0];
      }

      if (targetCategory) {
        console.log('BoxOfficeTab: Processing category:', targetCategory);
        const initialTickets = targetCategory.tickets.map(ticket => ({
          type: ticket.name,
          uuid: ticket.uuid,
          price: ticket.price,
          discountPrice: ticket.discount_price,
          quantity: 0,
          remaining: ticket.remaining,
          purchase_limit: ticket.purchase_limit,
          currency: ticket.currency,
          sale_end_date_time: ticket.sale_end_date_time,
          description: ticket.description,
        }));
        console.log('BoxOfficeTab: Initial tickets created:', initialTickets);
        setSelectedTickets(initialTickets);
      }
    } catch (error) {
      console.error('BoxOfficeTab: Error processing ticket pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset data when screen comes into focus and fetch data
  useFocusEffect(
    React.useCallback(() => {
      resetData();
      fetchData();
    }, [eventInfo?.eventUuid, ticketUuid])
  );

  // Handle selectedTab prop changes
  useEffect(() => {
    if (selectedTab && pricingCategories.includes(selectedTab) && ticketPricing.length > 0) {
      setSelectedTabState(selectedTab);

      // Clear all form fields when switching tabs
      setName('');
      setEmail('');
      setPurchaseCode('');
      setPurchaseError('');
      setWrongPurchaseCodeError('');
      setNameError('');
      setTransactionError('');
      setEmailError('');
      setPaymentError('');
      setTicketError('');

      // Update selected tickets for the new tab
      const category = ticketPricing.find(cat => cat.title === selectedTab);
      if (category) {
        console.log('BoxOfficeTab: Processing selectedTab change for category:', category);
        const updatedTickets = category.tickets.map(ticket => ({
          type: ticket.name,
          uuid: ticket.uuid,
          price: ticket.price,
          discountPrice: ticket.discount_price,
          quantity: 0,
          remaining: ticket.remaining,
          purchase_limit: ticket.purchase_limit,
          currency: ticket.currency,
          sale_end_date_time: ticket.sale_end_date_time,
          description: ticket.description,
        }));
        console.log('BoxOfficeTab: Updated tickets for selectedTab:', updatedTickets);
        setSelectedTickets(updatedTickets);
      }
    }
  }, [selectedTab, pricingCategories, ticketPricing]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [eventInfo?.eventUuid, ticketUuid]);

  const totalQuantity = selectedTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

  const handleTabPress = (tab) => {
    console.log('BoxOfficeTab: Tab pressed:', tab);
    setSelectedTabState(tab);

    // Clear all form fields when switching tabs
    setName('');
    setEmail('');
    setPurchaseCode('');
    setPaymentOption('');
    setPurchaseError('');
    setWrongPurchaseCodeError('');
    setNameError('');
    setTransactionError('');
    setEmailError('');
    setPaymentError('');
    setTicketError('');
    
    // Reset Formik form values
    if (formikRef.current) {
      formikRef.current.resetForm();
    }

    const category = ticketPricing.find(cat => cat.title === tab);
    console.log('BoxOfficeTab: Found category:', category);

    if (category) {
      const updatedTickets = category.tickets.map(ticket => ({
        type: ticket.name,
        uuid: ticket.uuid,
        price: ticket.price,
        discountPrice: ticket.discount_price,
        quantity: 0,
        remaining: ticket.remaining,
        purchase_limit: ticket.purchase_limit,
        currency: ticket.currency,
        sale_end_date_time: ticket.sale_end_date_time,
        description: ticket.description,
      }));
      console.log('BoxOfficeTab: Updated tickets for category:', updatedTickets);
      setSelectedTickets(updatedTickets);
    }
  };

  const navigateToCheckInAllTicketsScreen = async () => {
    // Clear previous errors
    setNameError('');
    setTransactionError('');
    setEmailError('');
    setPurchaseError('');
    setWrongPurchaseCodeError('');
    setPaymentError('');
    setTicketError('');

    if (!name.trim()) {
      setNameError('Please enter a valid name.');
      return;
    }

    if (!email) {
      setEmailError('Please enter a valid email or phone number.');
      return;
    }

    if (!transactionNumber.trim()) {
      setTransactionError('Please enter a valid transaction number.');
      return;
    }

    if (!paymentOption) {
      setPaymentError('Please select a payment option.');
      return;
    }

    // Check if purchase code is required for Members tab
    if (selectedTabState === 'Members' && !purchaseCode.trim()) {
      setPurchaseError('Please enter a valid Purchase code.');
      return;
    }

    try {
      const items = selectedTickets
        .filter(ticket => ticket.quantity > 0)
        .map(ticket => ({
          ticket_type: ticket.uuid,
          quantity: ticket.quantity
        }));

      if (items.length === 0) {
        setTicketError('Please select at least one ticket.');
        return;
      }

      // Generate a unique transaction ID for non-POS payments
      const transactionId = paymentOption === 'P.O.S' ? null : `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await ticketService.fetchBoxOfficeGetTicket(
        eventInfo.eventUuid,
        items,
        email,
        paymentOption.toUpperCase(),
        transactionId,
        name.trim(),
        selectedTabState === 'Members' ? purchaseCode : undefined
      );
      // Extract order number from response
      const orderNumber = response?.data?.order_number;
      const ticketNumber = response?.data?.ticket_number;
      navigation.navigate('CheckInAllTickets', {
        ticketNumber: ticketNumber,
        totalTickets: totalQuantity,
        name: name.trim(),
        email,
        paymentOption,
        transactionNumber: transactionId,
        orderData: response,
        eventInfo: eventInfo,
        orderNumber: orderNumber, // Add order number to navigation params
        onScanCountUpdate: onScanCountUpdate // Pass the callback
      });
    } catch (error) {
      if (error.isPurchaseCodeError) {
        setWrongPurchaseCodeError('Please enter a valid purchase code');
      } else {
        setWrongPurchaseCodeError('Please enter a valid purchase code');
      }
    }
  };

  const handlePOSPayment = async () => {
    // Clear previous errors
    setNameError('');
    setTransactionError('');
    setEmailError('');
    setPurchaseError('');
    setWrongPurchaseCodeError('');
    setPaymentError('');
    setTicketError('');

    if (!name.trim()) {
      setNameError('Please enter a valid name.');
      return;
    }

    if (!transactionNumber.trim()) {
      setTransactionError('Please enter a valid transaction number.');
      return;
    }

    if (!email) {
      setEmailError('Please enter a valid email or phone number.');
      return;
    }

    // Check if purchase code is required for Members tab
    if (selectedTabState === 'Members' && !purchaseCode.trim()) {
      setPurchaseError('Please enter a valid Purchase code.');
      return;
    }

    // Basic validation for purchase code format (if Members tab)
    if (selectedTabState === 'Members' && purchaseCode.trim()) {
      // Purchase code should be at least 6 characters and contain only alphanumeric characters
      if (purchaseCode.trim().length < 6) {
        setPurchaseError('Purchase code must be at least 6 characters long.');
        return;
      }

      if (!/^[a-zA-Z0-9]+$/.test(purchaseCode.trim())) {
        setPurchaseError('Purchase code can only contain letters and numbers.');
        return;
      }
    }

    try {
      const items = selectedTickets
        .filter(ticket => ticket.quantity > 0)
        .map(ticket => ({
          ticket_type: ticket.uuid,
          quantity: ticket.quantity
        }));

      if (items.length === 0) {
        setTicketError('Please select at least one ticket.');
        return;
      }

      const response = await ticketService.fetchBoxOfficeGetTicket(
        eventInfo.eventUuid,
        items,
        email,
        'POS',
        transactionNumber.trim(),
        name.trim(),
        selectedTabState === 'Members' ? purchaseCode : undefined
      );

      // Extract order number from response
      const orderNumber = response?.data?.order_number;

      setPOSModalVisible(false);
      navigation.navigate('CheckInAllTickets', {
        totalTickets: totalQuantity,
        name: name.trim(),
        email,
        paymentOption: 'POS',
        transactionNumber,
        orderData: response,
        eventInfo: eventInfo,
        orderNumber: orderNumber, // Add order number to navigation params
        onScanCountUpdate: onScanCountUpdate // Pass the callback
      });
    } catch (error) {
      if (error.isPurchaseCodeError) {
        setWrongPurchaseCodeError('Please enter a valid purchase code');
      } else {
        setWrongPurchaseCodeError('Please enter a valid purchase code');
      }
    }
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

  const renderTab = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTabState === item && styles.selectedTabButton,
        ]}
        onPress={() => handleTabPress(item)}
      >
        <Text
          style={[
            styles.tabButtonText,
            selectedTabState === item && styles.selectedTabButtonText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required'),
    email: Yup.string()
      .test('emailOrPhone', 'Invalid email or phone number', (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[0-9]{7,15}$/.test(value)
      )
      .required('Required'),
    purchaseCode: Yup.string()
      .when([], {
        is: () => selectedTabState === 'Members',
        then: (schema) => schema.required('Purchase code is required.'),
        otherwise: (schema) => schema
      })
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
      // Clear ticket error when user changes quantity
      if (ticketError) {
        setTicketError('');
      }
    }
  };

  const renderTicketItem = ({ item, index }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketRow}>
        <View style={styles.leftColumn}>
          <Text style={styles.ticketType}>{item.type}</Text>
          {item.discountPrice < item.price && (
            <Text style={styles.discountText}>Early Bird Discount</Text>
          )}
          {/* <Text style={styles.descriptionText}>{item.description}</Text> */}
          <View style={styles.validTillContainer}>
            <Text style={styles.validTillText}>valid till</Text>
            <Text style={styles.dateText}>{formatDateOnly(item.sale_end_date_time)}</Text>
          </View>
          <Text style={styles.descriptionText}>
            Join the excitement and be{'\n'}part of the crowd at our event!
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <View style={styles.priceContainer}>
            <Text style={styles.discountPrice}>{item.currency} {item.price}</Text>
            {/* <Text style={styles.originalPrice}>{item.currency} {item.discountPrice}</Text> */}
          </View>
          <View style={styles.quantitySelectorContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(index, item.quantity - 1)}
              disabled={item.quantity <= 0}
            >
              {item.quantity <= 0 ? (
                <SvgIcons.removeIcon width={12} height={12} />
              ) : (
                <SvgIcons.removeIcon width={12} height={12} />
              )}
            </TouchableOpacity>
            <View style={styles.quantityCountContainer}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
            </View>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(index, item.quantity + 1)}
              disabled={item.quantity >= item.purchase_limit}
            >
              {item.quantity >= item.purchase_limit ? (
                <SvgIcons.addIcon width={12} height={12} />
              ) : (
                <SvgIcons.addIcon width={12} height={12} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
      </View>
    );
  }

  const dismissError = () => {
    setShowError(false);
    setErrorMessage('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          data={pricingCategories}
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
        {/* <View style={styles.lineView}></View> */}
        <View style={styles.totalamount}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Tickets</Text>
            <Text style={[styles.totalValue, { textAlign: 'left' }]}>{totalQuantity}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Amount</Text>
            <Text style={[styles.totalValue, { textAlign: 'left' }]}>GHS {calculateTotal()}</Text>
          </View>
        </View>
        {ticketError && (
          <Text style={styles.errorText}>{ticketError}</Text>
        )}

        {/* <View style={styles.lineView2}></View> */}
        <Formik
          ref={formikRef}
          initialValues={{ name: '', email: '', purchaseCode: '' }}
          validationSchema={validationSchema}
          context={{ selectedTab: selectedTabState }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={{ width: '100%' }}>
              {/* <Text style={styles.inputHeading}>Name</Text> */}
              <TextInput
                style={[
                  styles.input,
                  touched.name && errors.name ? styles.inputError : null,
                  values.name ? styles.inputWithText : styles.inputPlaceholder
                ]}
                placeholder="Enter Name"
                placeholderTextColor={color.brown_766F6A}
                onChangeText={(text) => {
                  handleChange('name')(text);
                  setName(text);
                  // Clear name error when user starts typing
                  if (nameError) {
                    setNameError('');
                  }
                }}
                onBlur={handleBlur('name')}
                value={values.name}
                keyboardType="default"
                selectionColor={color.selectField_CEBCA0}
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
              {nameError && (
                <Text style={styles.errorText}>{nameError}</Text>
              )}

              {/* <Text style={styles.inputHeading}>Email or Phone Number</Text> */}
              <TextInput
                style={[
                  styles.input,
                  touched.email && errors.email ? styles.inputError : null,
                  values.email ? styles.inputWithText : styles.inputPlaceholder
                ]}
                placeholder="Email or Phone Number"
                placeholderTextColor={color.brown_766F6A}
                onChangeText={(text) => {
                  handleChange('email')(text);
                  setEmail(text);
                  // Clear email error when user starts typing
                  if (emailError) {
                    setEmailError('');
                  }
                }}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                selectionColor={color.selectField_CEBCA0}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              {emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}

              {selectedTabState === 'Members' && (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      touched.purchaseCode && errors.purchaseCode ? styles.inputError : null,
                      values.purchaseCode ? styles.inputWithText : styles.inputPlaceholder
                    ]}
                    placeholder="Enter Purchase Code"
                    placeholderTextColor={color.brown_766F6A}
                    onChangeText={(text) => {
                      handleChange('purchaseCode')(text);
                      setPurchaseCode(text);
                      // Clear purchase errors when user starts typing
                      if (purchaseError) {
                        setPurchaseError('');
                      }
                      if (wrongPurchaseCodeError) {
                        setWrongPurchaseCodeError('');
                      }
                    }}
                    onBlur={handleBlur('purchaseCode')}
                    value={purchaseCode}
                    keyboardType="default"
                    selectionColor={color.selectField_CEBCA0}
                  />
                  {touched.purchaseCode && errors.purchaseCode && (
                    <Text style={styles.errorText}>{errors.purchaseCode}</Text>
                  )}
                  {purchaseError && (
                    <Text style={styles.errorText}>{purchaseError}</Text>
                  )}
                  {wrongPurchaseCodeError && (
                    <View style={styles.wrongPurchaseCodeErrorContainer}>
                      <TouchableOpacity onPress={dismissError}>
                        <SvgIcons.crossIconRed width={20} height={20} fill={color.red_FF3B30} />
                      </TouchableOpacity>
                      <Text style={styles.wrongPurchaseCodeErrorText}>
                        {wrongPurchaseCodeError}
                      </Text>
                    </View>
                  )}

                  {/* Debug: Test different purchase codes (remove in production)
                  <View style={styles.debugContainer}>
                    <Text style={styles.debugText}>Debug: Test Purchase Codes:</Text>
                    <View style={styles.testCodesContainer}>
                      {testPurchaseCodes.map((code, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.testCodeButton}
                          onPress={() => setPurchaseCode(code)}
                        >
                          <Text style={styles.testCodeText}>{code}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View> */}
                </>
              )}
            </View>
          )}
        </Formik>
        <View style={styles.lineView3}></View>
        <View style={styles.Paylabel}>
          <Text>Pay With</Text>
        </View>

        <View style={styles.paymentOptions}>
          {/* Cash Button */}
          <TouchableOpacity
            style={[styles.paymentOption,
            paymentOption === 'CASH' && { borderColor: '#AE6F28' }
            ]}
            onPress={() => {
              setPaymentOption('CASH');
              if (paymentError) {
                setPaymentError('');
              }
            }}
          >
            {paymentOption === 'CASH' ? (
              <SvgIcons.cameraIconActive width={24} height={24} />
            ) : (
              <SvgIcons.cameraIconInActive width={24} height={24} />
            )}
            <Text style={[styles.paymentOptionText, paymentOption === 'CASH' && { color: '#5A2F0E' }]}>
              Cash
            </Text>
          </TouchableOpacity>

          {/* Debit/Credit Card Button */}
          <TouchableOpacity
            style={[styles.paymentOption,
            paymentOption === 'BANK' && { borderColor: '#AE6F28' }
            ]}
            onPress={() => {
              setPaymentOption('BANK');
              if (paymentError) {
                setPaymentError('');
              }
            }}
          >
            {paymentOption === 'BANK' ? (
              <SvgIcons.cardIconActive width={24} height={24} />
            ) : (
              <SvgIcons.cardIconInActive width={24} height={24} />
            )}
            <Text style={[styles.paymentOptionText, paymentOption === 'BANK' && { color: '#5A2F0E' }]}>
              Bank Card
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.paymentOptionsPOS}>
          <TouchableOpacity
            style={[styles.paymentOption,
            paymentOption === 'P.O.S' && { borderColor: '#AE6F28' }
            ]}
            onPress={() => {
              setPaymentOption('P.O.S');
              setPOSModalVisible(true);
              if (paymentError) {
                setPaymentError('');
              }
            }}
          >
            {paymentOption === 'P.O.S' ? (
              <SvgIcons.mobMoneyIconActive width={24} height={24} />
            ) : (
              <SvgIcons.mobMoneyIconActive width={24} height={24} />
            )}
            <Text style={[styles.paymentOptionText, paymentOption === 'P.O.S' && { color: '#5A2F0E' }]}>P.O.S.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption,
            paymentOption === 'MOBILE_MONEY' && { borderColor: '#AE6F28' }
            ]}
            onPress={() => {
              setPaymentOption('MOBILE_MONEY');
              if (paymentError) {
                setPaymentError('');
              }
            }}
          >
            {paymentOption === 'MOBILE_MONEY' ? (
              <SvgIcons.mobMoneyIconActive width={24} height={24} />
            ) : (
              <SvgIcons.mobMoneyIconInActive width={24} height={24} />
            )}
            <Text style={[styles.paymentOptionText, paymentOption === 'MOBILE_MONEY' && { color: '#5A2F0E' }]}>
              Mobile Money
            </Text>
          </TouchableOpacity>
        </View>
        {paymentError && (
          <Text style={styles.errorText}>{paymentError}</Text>
        )}
        {paymentOption && paymentOption !== 'P.O.S' && (
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
        )}
      </View>
      <Modal visible={isPOSModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>POS Payment</Text></View>
            <TextInput
              style={[
                styles.inputTransaction,
                transactionError ? styles.inputError : null
              ]}
              placeholder="Transaction / Receipt ID"
              placeholderTextColor={color.brown_766F6A}
              value={transactionNumber}
              onChangeText={(text) => {
                setTransactionNumber(text);
                // Clear transaction error when user starts typing
                if (transactionError) {
                  setTransactionError('');
                }
              }}
              keyboardType="default"
            />
            {transactionError && (
              <Text style={styles.errorTextTransaction}>{transactionError}</Text>
            )}
            <TouchableOpacity style={[
              styles.getTicketsButtonPOS,
              !selectedTickets.some(ticket => ticket.quantity > 0) && { backgroundColor: '#AE6F28A0' },
            ]}
              onPress={handlePOSPayment}
              disabled={!selectedTickets.some(ticket => ticket.quantity > 0)}
            >
              <Text style={styles.getTicketsButtonTextPOS}>Get Ticket(s)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPOSModalVisible(false)} style={styles.cancelButtonContainer}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: "115",
    alignItems: 'center'
  },
  tabButtonText: {
    color: color.black_544B45,
  },
  selectedTabButton: {
    backgroundColor: color.btnBrown_AE6F28,
    borderColor: color.btnBrown_AE6F28,
    width: "115",
  },
  selectedTabButtonText: {
    color: color.white_FFFFFF,
    fontWeight: '500',
    fontSize: 14
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
    fontWeight: '500',
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
    color: color.brown_5A2F0E,
    marginTop: 5,
    fontWeight: '400'
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
  totalamount: {
    backgroundColor: color.brown_F7E4B6,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 14,
    gap: 10
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalText: {
    fontSize: 14,
    fontWeight: '400',
    color: color.placeholderTxt_24282C,
    flex: 1,
  },

  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: color.brown_5A2F0E,
    minWidth: 40,
    textAlign: 'left',
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
  paymentOptionsPOS: {
    top: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 35,
    gap: 10
  },
  paymentOption: {
    flexDirection: 'row',
    padding: 15,
    borderWidth: 1,
    borderColor: '#CEBCA0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minHeight: 50
  },
  paymentOptionText: {
    margin: Platform.OS === 'ios' ? 2 : 0,
    color: color.black_544B45,
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'center'
  },

  getTicketsButton: {
    backgroundColor: '#AE6F28',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    top: 20,
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
    fontWeight: '400',
    color: color.brown_5A2F0E,
    fontSize: 12,
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
    padding: 10,
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
    fontWeight: '400',
    color: color.black_2F251D,
    fontSize: 14
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
    top: 15
  },

  lineView2: {
    borderColor: '#CEBCA0',
    width: '100%',
    borderWidth: 0.5,
    marginBottom: 10,
    top: 15
  },
  lineView3: {
    borderColor: '#CEBCA0',
    width: '100%',
    borderWidth: 0.5,
    marginBottom: 10,
    top: 25
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
  inputPlaceholder: {
    color: color.brown_766F6A,
    fontWeight: '200',
    fontSize: 13,
  },
  inputWithText: {
    color: color.black_544B45,
    fontWeight: '400',
    fontSize: 13,
  },
  inputHeading: {
    top: 25,
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
  errorTextTransaction: {
    color: color.red_FF0000,
  },
  Paylabel: {
    top: 30,
    color: color.brown_3C200A
  },
  cameraImage: {
    width: 20,
    height: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: color.brown_3C200A,
    marginBottom: 10,
  },
  inputTransaction: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
    borderRadius: 10,
    marginBottom: 15,
    height: 46
  },
  getTicketsButtonPOS: {
    backgroundColor: color.btnBrown_AE6F28,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    top: 10,
    marginBottom: 20
  },
  getTicketsButtonTextPOS: {
    color: color.white_FFFFFF,
    fontWeight: 'bold',
  },
  cancelText: {
    color: color.btnBrown_AE6F28,
  },
  cancelButtonContainer: {
    alignItems: 'center',
  },
  modalTitleContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrongPurchaseCodeErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 25,
  },
  wrongPurchaseCodeErrorText: {
    flex: 1,
    color: color.red_EF3E32,
    fontSize: 13,
    fontWeight: '400',
  }
});

export default BoxOfficeTab;