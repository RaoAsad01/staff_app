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
import { LinearGradient } from 'expo-linear-gradient';
import Typography, { Body1, Caption } from '../components/Typography';

// Helper function to format seconds as mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const OtpLoginScreen = ({ route }) => {
  const navigation = useNavigation();
  const [otpResendTime, setOtpResendTime] = useState(120); // 2 minutes
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const inputRefs = useRef([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const uuid = route?.params?.uuid;
  const userIdentifier = route?.params?.user_identifier;
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSignIn = async (otpArray) => {
    const enteredOtp = otpArray.join('');
    console.log('handleSignIn called with OTP:', enteredOtp);
    if (enteredOtp.length === 5) {
      setLoading(true);
      try {
        const payload = {
          uuid: uuid,
          otp: enteredOtp
        };
        const response = await authService.verifyOtp(payload);
        console.log('OTP verify response:', response);
        if (response.success && response.data && response.data.access_token) {
          setShowError(false);
          setErrorMessage('');
          setLoading(false);
          // Store the access token
          await SecureStore.setItemAsync('accessToken', response.data.access_token);
          // Fetch staff events
          const staffEventsData = await eventService.fetchStaffEvents();
          const eventsList = staffEventsData?.data?.[0]?.event;
          if (eventsList && eventsList.length > 0) {
            const eventUuid = eventsList[0];
            // Fetch event info
            const eventInfoData = await eventService.fetchEventInfo(eventUuid);
            navigation.reset({
              index: 0,
              routes: [{
                name: 'LoggedIn',
                params: {
                  eventInfo: {
                    staff_name: eventInfoData?.data?.staff_name,
                    event_title: eventInfoData?.data?.event_title,
                    cityName: eventInfoData?.data?.location?.city,
                    date: eventInfoData?.data?.start_date,
                    time: eventInfoData?.data?.start_time,
                    userId: eventInfoData?.data?.staff_id,
                    scanCount: eventInfoData?.data?.scan_count,
                    event_uuid: eventInfoData?.data?.location?.uuid,
                    eventUuid: eventUuid
                  },
                },
              }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoggedIn' }],
            });
          }
        } else {
          setErrorMessage('You have entered an invalid OTP');
          setShowError(true);
          setLoading(false);
        }
      } catch (error) {
        setErrorMessage('You have entered an invalid OTP');
        setShowError(true);
        setLoading(false);
        console.log('OTP Verification Error:', error);
      }
    }
  };

  const handleResendOtp = async () => {
    setShowError(false);
    setErrorMessage('');
    try {
      const response = await authService.requestOtp({
        user_identifier: userIdentifier
      });
      if (response && response.success) {
        // Update the UUID with the new one from response
        setOtp(['', '', '', '', '']); // Clear the OTP fields
        setOtpResendTime(120); // Reset timer to 2 minutes
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
    setShowError(false);
    setErrorMessage('');
    console.log('OTP changed:', updatedOtp);
    // Move to next input field automatically
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // If all 5 digits are filled, trigger handleSignIn
    if (updatedOtp.every((digit) => digit.length === 1)) {
      handleSignIn(updatedOtp);
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  return (
    <LinearGradient colors={["#000000", "#281c10"]} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <StatusBar style="dark" backgroundColor="transparent" translucent />
            {/* <ExpoImageBackground
            source={require('../../assets/images/bg-img-signup.png')}
            contentFit="cover"
            style={styles.background}
          > */}
            {/* <View style={styles.topSection}>
              <SvgIcons.hexalloSvg width={36} height={40} fill="transparent" />
              <Text style={styles.topText}>HEXALLO</Text>
            </View>

            <Text style={styles.additionalText}>Get Started{'\n'}to do more!</Text> */}

            <View style={styles.container}>
              <Typography
                weight="500"
                size={20}
                color={color.grey_DEDCDC}
                style={styles.appName}
              >
                Enter OTP
              </Typography>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={styles.otpInput}
                    value={digit}
                    placeholder="-"
                    placeholderTextColor={color.white_FFFFFF}
                    maxLength={1}
                    keyboardType="numeric"
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    selectionColor={color.selectField_CEBCA0}
                    editable={!loading}
                  />
                ))}
              </View>

              {/* Remove the 'Didn't receive OTP?' label for a cleaner look */}

              <View style={styles.rowContainer}>
                {otpResendTime > 0 ? (
                  <View style={styles.timerRow}>
                    <Typography
                      weight="400"
                      size={14}
                      color={color.grey_E0E0E0}
                    >
                      Request code again in{' '}
                    </Typography>
                    <Typography
                      weight="400"
                      size={14}
                      color={color.btnBrown_AE6F28}
                    >
                      {formatTime(otpResendTime)}
                    </Typography>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity style={styles.changeDetailsButton} onPress={handleResendOtp}>
                      <Typography
                        weight="600"
                        size={16}
                        color={color.grey_DEDCDC}
                      >
                        Resend
                      </Typography>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.changeDetailsButton} onPress={gotologinscreen}>
                      <Typography
                        weight="600"
                        size={16}
                        color={color.grey_DEDCDC}
                      >
                        Change Details
                      </Typography>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {showError && (
                <View style={styles.errorContainer}>
                  <View >
                    <SvgIcons.crossIconRed width={20} height={20} fill={color.red_FF3B30} />
                  </View>
                  <Typography weight="400" size={14} color={color.red_EF3E32} style={styles.errorText}>
                    {errorMessage}
                  </Typography>
                </View>
              )}
            </View>

            {!isKeyboardVisible && (
              <>
                <View style={styles.middleSection}>
                  <View style={styles.logoContainer}>
                    <SvgIcons.hexalloSvg width={35} height={40} fill="transparent" />
                    <Typography
                      weight="700"
                      size={20}
                      color={color.grey_DEDCDC}
                    >
                      Hexallo
                    </Typography>
                  </View>
                  <Typography
                    weight="500"
                    size={16}
                    color={color.grey_DEDCDC}
                    style={styles.subtitle}
                  >
                    Fast . Secure . Seamless
                  </Typography>
                </View>
                <View style={styles.bottomtextbg}>
                  <Caption color={color.grey_DEDCDC} size={12} align="center">By Hexallo Enterprise</Caption>
                </View>
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </LinearGradient>
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 180
  },
  appName: {
    marginBottom: 20,
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
    color: color.white_FFFFFF,
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
  changeDetailsButton: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',

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
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bottomtextbg: {
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
  middleSection: {
    alignItems: 'center',
    marginTop: 150,
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24, // Add space between logo and tagline
  },
  subtitle: {
    marginBottom: 10, // Add space between tagline and bottomtextbg
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white_FFFFFF,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 2,
    gap: 10,
  },
  errorIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: color.red_FF3B30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  errorText: {
    flex: 1,
  },
});

export default OtpLoginScreen;
