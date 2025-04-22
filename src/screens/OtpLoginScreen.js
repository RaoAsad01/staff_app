import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Alert
} from 'react-native';
import { Image as ExpoImage, ImageBackground as ExpoImageBackground } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import { StatusBar } from 'expo-status-bar';
import SvgIcons from '../../components/SvgIcons';
import { authService, eventService } from '../api/apiService';
import * as SecureStore from 'expo-secure-store'; 

const OtpLoginScreen = ({ route }) => {
  const navigation = useNavigation();
  const [otpResendTime, setOtpResendTime] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const inputRefs = useRef([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const uuid = route?.params?.uuid;
  const userIdentifier = route?.params?.user_identifier;

  // useEffect(() => {
  //   const checkLoggedIn = async () => {
  //     const token = await SecureStore.getItemAsync('accessToken');
  //     if (token) {
  //       navigation.navigate('LoggedIn'); // Navigate to your home screen
  //     }
  //   };

  //   checkLoggedIn();
  // }, [navigation]);

  useEffect(() => {
    if (!uuid || !userIdentifier) {
      console.log('Missing required parameters:', { uuid, userIdentifier });
      Alert.alert('Error', 'Missing verification information');
      navigation.goBack();
    }
  }, [uuid, userIdentifier]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
  
    const keyboardDidHideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false))
      : Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
  
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const gotologinscreen = () => {
    navigation.navigate('Login');
  }

  const handleSignIn = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 5) {
      try {
        const payload = {
          uuid: uuid,
          otp: enteredOtp
        };
        const response = await authService.verifyOtp(payload);
        if (response.success && response.data && response.data.access_token) {
          // Store the access token
          await SecureStore.setItemAsync('accessToken', response.data.access_token);
          console.log('Token stored successfully');

          // Fetch staff events
          const staffEventsData = await eventService.fetchStaffEvents();

          if (staffEventsData && staffEventsData.data.event && staffEventsData.data.event.length > 0) {
            const firstEvent = staffEventsData.data.event[0]; // Or your logic to select an event
            const eventUuid = firstEvent.uuid;
            console.log('UUID of staff: ',eventUuid)
            // Fetch event info
            const eventInfoData = await eventService.fetchEventInfo(eventUuid);
             
          
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoggedIn',
              params: {  eventInfo: {
                event_title: eventInfoData?.data?.event_title,
                cityName: eventInfoData?.data?.location?.city,
                date: eventInfoData?.data?.start_date,
                time: eventInfoData?.data?.start_time,
                userId: eventInfoData?.data?.staff_id,
                scanCount: eventInfoData?.data?.scan_count,
                event_uuid: eventInfoData?.data?.location?.uuid,
                eventUuid: eventUuid
              }, }, 
             }],
          });
          console.log('Event Info sent to CheckinScreen:', {
            event_title: eventInfoData?.event_title,
            cityName: 'Accra',
            date: eventInfoData?.date,
            time: eventInfoData?.time,
            userId: '87621237467',
            scanCount: eventInfoData?.scanCount,
          });
        } else {
            Alert.alert('Error', 'Could not fetch accessible events.');
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoggedIn' }], // Navigate even if no events fetched
            });
          }
        } else {
          Alert.alert('Error', response.message || 'Verification failed');
        }
      } catch (error) {
        console.error('OTP Verification Error:', error);
        Alert.alert('Error', error.response?.data?.message || 'Failed to verify OTP');
      }
    } else {
      Alert.alert('Error', 'Please enter a valid 5-digit OTP');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await authService.requestOtp({
        user_identifier: userIdentifier
      });
      if (response && response.success) {
        // Update the UUID with the new one from response
        setOtp(['', '', '', '', '']); // Clear the OTP fields
        Alert.alert('Success', 'OTP resent successfully');
      } else {
        Alert.alert('Error', response?.message || 'Failed to get new verification code');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  useEffect(() => {
    if (otpResendTime > 0) {
      const timer = setInterval(() => {
        setOtpResendTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpResendTime]);

  const handleOtpChange = (value, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    // Move to next input field automatically
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar style="dark" backgroundColor="transparent" translucent />
          <ExpoImageBackground
            source={require('../../assets/images/bg-img-signup.png')}
            contentFit="cover"
            style={styles.background}
          >
            <View style={styles.topSection}>
              <SvgIcons.hexalloSvg width={36} height={40} fill="transparent" />
              <Text style={styles.topText}>HEXALLO</Text>
            </View>
  
            <Text style={styles.additionalText}>Get Started{'\n'}to do more!</Text>
  
            <View style={styles.container}>
              <Text style={styles.appName}>Enter OTP</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={styles.otpInput}
                    value={digit}
                    placeholder="-"
                    placeholderTextColor={color.placeholderTxt_24282C}
                    maxLength={1}
                    keyboardType="numeric"
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    selectionColor={color.selectField_CEBCA0}
                  />
                ))}
              </View>
  
              <Text style={styles.labelText}>Didn't receive OTP?</Text>
  
              <View style={styles.rowContainer}>
                <TouchableOpacity style={styles.changeDetailsButton} onPress={handleResendOtp}>
                  <Text style={styles.changeDetailsText}>Resend</Text>
                </TouchableOpacity>
  
                <TouchableOpacity style={styles.changeDetailsButton} onPress={gotologinscreen}>
                  <Text style={styles.changeDetailsText}>Change Details</Text>
                </TouchableOpacity>
              </View>
  
              <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ExpoImageBackground>
        </View>
      </TouchableWithoutFeedback>
  
      {!isKeyboardVisible && (
        <View style={styles.bottomtextbg}>
          <Text style={styles.bottomText}>Powered by Hexagram Technologies</Text>
        </View>
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 50,
    paddingHorizontal: 20,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  additionalText: {
    color: color.white_FFFFFF,
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    paddingTop: 20
  },
  topText: {
    color: color.white_FFFFFF,
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 10,
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: color.brown_3C200A,
  },
  labelText: {
    fontSize: 14,
    color: color.black_544B45,
    textAlign: 'center',
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: color.btnBrown_AE6F28,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10
  },
  buttonText: {
    color: color.btnTxt_FFF6DF,
    fontSize: 16,
    fontWeight: '700',
  },
  changeDetailsButton: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: color.btnBrown_AE6F28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',

  },
  changeDetailsText: {
    color: color.black_2F251D,
    fontWeight: '600',
    fontSize: 16
  },
  resendText: {
    color: color.blue,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  bottomtextbg: {
    backgroundColor: color.btnBrown_AE6F28,
    width: 'auto',
    paddingHorizontal: 20,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
  },
  bottomText: {
    color: color.white_FFFFFF,
    fontSize: 14,
    fontWeight: '400',
  },
});

export default OtpLoginScreen;
