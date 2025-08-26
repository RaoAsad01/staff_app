import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, TextInput, TouchableOpacity, Platform, Keyboard,
  TouchableWithoutFeedback, Text, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { color } from '../color/color';
import { StatusBar } from 'expo-status-bar';
import SvgIcons from '../../components/SvgIcons';
import { authService } from '../api/apiService';
import Typography, { Body1, Caption } from '../components/Typography';
import { fontSize, fontWeight } from '../constants/typography';
import MiddleSection from '../components/MiddleSection';
import CountryCodePicker from '../components/CountryCodePicker';
import { defaultCountryCode } from '../constants/countryCodes';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [inputType, setInputType] = useState('email'); // 'email' or 'phone'

  const { height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;
  const isLargeScreen = screenHeight > 800;

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

  const validationSchema = Yup.object().shape({
    user_identifier: Yup.string()
      .min(1, 'Required')
      .required('Required')
      .test('emailOrPhone', 'Invalid email or phone number', (value) => {
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{7,15}$/; // Updated to handle phone numbers without country code
        return emailRegex.test(value) || phoneRegex.test(value);
      }),
  });

  const handleSignIn = async (values) => {
    try {
      let userIdentifier = values.user_identifier.trim();

      // If it's a phone number (not email), add the country code
      if (inputType === 'phone' && !userIdentifier.includes('@')) {
        userIdentifier = selectedCountry.dialCode + userIdentifier;
      }

      const response = await authService.requestOtp({
        user_identifier: userIdentifier,
      });
      if (response && response.success) {
        navigation.navigate('OtpLogin', {
          uuid: response.data.uuid,
          user_identifier: userIdentifier
        });
      } else {
        setShowError(false);
        setErrorMessage('');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMessage('Invalid email or phone number');
        setShowError(true);
      } else {
        setErrorMessage('Failed to request OTP. Please try again.');
        setShowError(true);
      }
    }
  };

  const dismissError = () => {
    setShowError(false);
    setErrorMessage('');
  };

  const handleInputChange = (text, setFieldValue) => {
    // Detect if input is email or phone and update immediately
    if (text.includes('@')) {
      setInputType('email');
    } else if (text.length > 0 && /^[0-9]+$/.test(text)) {
      // Set as phone if the input contains only numbers
      setInputType('phone');
    } else if (text.length === 0) {
      // Reset to email when input is empty
      setInputType('email');
    }
    setFieldValue('user_identifier', text);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar
            style="dark"
            backgroundColor="transparent"
            translucent
          />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={[styles.centeredContent, { paddingTop: screenHeight * 0.40 }]}>
              <Formik
                initialValues={{ user_identifier: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSignIn}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                  <View style={{ width: '100%' }}>
                    <View style={[
                      styles.inputRow,
                      (touched.user_identifier && errors.user_identifier) || showError ? styles.inputError : null
                    ]}>
                      {/* Country Code Picker (only show for phone input) */}
                      {/* {inputType === 'phone' && (
                        <TouchableOpacity
                          style={styles.countryCodeButton}
                          onPress={() => setShowCountryPicker(true)}
                        >
                          <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                          <Typography
                            weight="600"
                            size={14}
                            color={color.grey_DEDCDC}
                            style={styles.countryCodeText}
                          >
                            {selectedCountry.dialCode}
                          </Typography>
                          <SvgIcons.downArrow width={12} height={12} fill={color.grey_87807C} />
                        </TouchableOpacity>
                      )} */}

                      <TextInput
                        style={[
                          styles.inputField,
                          touched.user_identifier && errors.user_identifier ? styles.inputError : null,
                          inputType === 'phone' ? styles.inputFieldWithCountryCode : null
                        ]}
                        placeholder={inputType === 'phone' ? "Phone Number" : "Email or Phone Number"}
                        placeholderTextColor={color.grey_87807C}
                        onChangeText={(text) => handleInputChange(text, setFieldValue)}
                        onBlur={handleBlur('user_identifier')}
                        value={values.user_identifier}
                        keyboardType={inputType === 'phone' ? "numeric" : "email-address"}
                        selectionColor={color.selectField_CEBCA0}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={handleSubmit}
                        disabled={!values.user_identifier.trim()}
                      >
                        <SvgIcons.ArrowRight width={28} height={28} fill={color.black_544B45} />
                      </TouchableOpacity>
                    </View>
                    {touched.user_identifier && errors.user_identifier && (
                      <Caption color={color.red_FF0000} style={styles.errorText}>{errors.user_identifier}</Caption>
                    )}
                  </View>
                )}
              </Formik>
              {showError && (
                <View style={[styles.errorContainer, { top: screenHeight * 0.48 }]}>
                  <TouchableOpacity onPress={dismissError}>
                    <SvgIcons.crossIconRed width={20} height={20} fill={color.red_FF3B30} />
                  </TouchableOpacity>
                  <Typography weight="400" size={14} color={color.red_EF3E32} style={styles.errorTextCross}>
                    {errorMessage}
                  </Typography>
                </View>
              )}
            </View>
          </View>

          {!isKeyboardVisible && (
            <LinearGradient
              colors={["#000000", "#281c10"]}
              style={{ flex: 1 }}
            >
              <MiddleSection showGetStartedButton={false} />
            </LinearGradient>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Country Code Picker Modal */}
      <CountryCodePicker
        selectedCountry={selectedCountry}
        onSelectCountry={handleCountrySelect}
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  centeredContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    backgroundColor: "#000000"
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    width: '100%',
  },
  hexalloText: {
    marginTop: 18,
    marginBottom: 8,
  },
  tagline: {
    marginBottom: 0,
  },
  inputRow: {
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 20,
    height: 54,
    width: 320,
    alignSelf: 'center', // Center the input row
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: color.borderBrown_CEBCA0,
    backgroundColor: 'transparent',
  },
  flagText: {
    fontSize: 16,
    marginRight: 6,
  },
  countryCodeText: {
    marginRight: 4,
  },
  inputField: {
    flex: 1,
    color: color.grey_DEDCDC,
    fontSize: 14,
    fontWeight: '400',
    height: '100%',
    backgroundColor: 'transparent',
  },
  inputFieldWithCountryCode: {
    paddingLeft: 15,
  },
  arrowButton: {
    backgroundColor: color.btnBrown_AE6F28,
    height: '100%',
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  inputError: {
    borderColor: color.red_FF0000,
  },
  errorText: {
    marginHorizontal: 40,
  },
  errorContainer: {
    position: 'absolute',
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white_FFFFFF,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '82%',
    alignSelf: 'center',
    borderWidth: 2,
    gap: 10,
    zIndex: 1000,
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
  errorTextCross: {
    flex: 1,
  },
});

export default LoginScreen;
