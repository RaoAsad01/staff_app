import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, TextInput, TouchableOpacity, Platform, Keyboard,
  TouchableWithoutFeedback,
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

const LoginScreen = () => {
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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
        const phoneRegex = /^[0-9]{10,15}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      }),
  });

  const handleSignIn = async (values) => {
    try {
      const response = await authService.requestOtp({
        user_identifier: values.user_identifier.trim(),
      });
      if (response && response.success) {
        navigation.navigate('OtpLogin', {
          uuid: response.data.uuid,
          user_identifier: values.user_identifier.trim()
        });
      } else {
        alert('Invalid Email or Phone Number');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        alert('Invalid Email or Phone Number');
      } else {
        alert('Failed to request OTP. Please try again.');
      }
    }
  };

  return (
    <LinearGradient
      colors={["#000000", "#281c10"]}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar
            style="dark"
            backgroundColor="transparent"
            translucent
          />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={styles.centeredContent}>
              <Formik
                initialValues={{ user_identifier: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSignIn}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={{ width: '100%' }}>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={[
                          styles.inputField,
                          touched.user_identifier && errors.user_identifier ? styles.inputError : null
                        ]}
                        placeholder="Email or Phone Number"
                        placeholderTextColor={color.grey_87807C}
                        onChangeText={handleChange('user_identifier')}
                        onBlur={handleBlur('user_identifier')}
                        value={values.user_identifier}
                        keyboardType="email-address"
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
            </View>
          </View>
          {!isKeyboardVisible && (
            <MiddleSection showGetStartedButton={false} />
          )}
        </View>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
 
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 100,
    height: 54,
    width: 320,
    alignSelf: 'center', // Center the input row
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 20,
    color: color.grey_DEDCDC,
    fontSize: 14,
    fontWeight: '400',
    height: '100%',
    backgroundColor: 'transparent',
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
    marginTop: 2,
    marginLeft: 40,
    bottom: 89,
  },
});

export default LoginScreen;
