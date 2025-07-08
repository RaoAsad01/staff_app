import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Keyboard,
  TouchableWithoutFeedback, Alert,
} from 'react-native';
import { ImageBackground as ExpoImageBackground } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { color } from '../color/color';
import { StatusBar } from 'expo-status-bar';
import SvgIcons from '../../components/SvgIcons';
import { authService } from '../api/apiService';

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
        // Email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Phone regex (allows numbers only, 10-15 digits)
        const phoneRegex = /^[0-9]{10,15}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      }),
  });

  const handleSignIn = async (values) => {
    try {
      const response = await authService.requestOtp({
        user_identifier: values.user_identifier.trim(),
      });

      console.log('OTP Request Response:', response);

      // The response contains the UUID directly in the data object
      if (response && response.success) {
        navigation.navigate('OtpLogin', {
          uuid: response.data.uuid,
          user_identifier: values.user_identifier.trim()
        });
      } else {
        Alert.alert('Invalid Email or Phone Number');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        Alert.alert('Error', 'Invalid Email or Phone Number');
      } else {
        Alert.alert('Error', 'Failed to request OTP. Please try again.');
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar
            style="dark"
            backgroundColor="transparent"
            translucent
          />
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

            <View style={styles.containerWrapper}>
              <View style={styles.container}>
                <Formik
                  initialValues={{ user_identifier: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleSignIn}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={{ width: '100%' }}>
                      <TextInput
                        style={[
                          styles.input,
                          touched.user_identifier && errors.user_identifier ? styles.inputError : null
                        ]}
                        placeholder="Email or Phone Number"
                        placeholderTextColor={color.black_544B45}
                        onChangeText={handleChange('user_identifier')}
                        onBlur={handleBlur('user_identifier')}
                        value={values.user_identifier}
                        keyboardType="email-address"
                        selectionColor={color.placeholderTxt_24282C}
                        autoCapitalize="none"
                      />
                      {touched.user_identifier && errors.user_identifier && (
                        <Text style={styles.errorText}>{errors.user_identifier}</Text>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.button,
                          !values.user_identifier.trim() && { opacity: 0.6 }
                        ]}
                        onPress={handleSubmit}
                        disabled={!values.user_identifier.trim()}
                      >
                        <Text style={styles.buttonText}>Sign In</Text>
                      </TouchableOpacity>


                    </View>
                  )}
                </Formik>
              </View>
            </View>
          </ExpoImageBackground>
        </View>
      </TouchableWithoutFeedback>
      {!isKeyboardVisible && (
        <View style={styles.bottomtextbg}>
          <Text style={styles.bottomText}>By Hexallo Enterprise</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Add padding for Android
  },
  image: {
    width: 50,
    height: 50,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 40
  },
  additionalText: {
    color: color.white_FFFFFF,
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'left',
    paddingTop: 40
  },
  topText: {
    color: color.white_FFFFFF,
    marginStart: 10,
    fontSize: 24,
    fontWeight: '800',
  },
  containerWrapper: {
    flex: 1,
    marginTop: 100
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    height: 166,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    width: '100%',
    height: 47,
    borderColor: color.borderBrown_CEBCA0,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: color.btnBrown_AE6F28,
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: color.btnTxt_FFF6DF,
    fontSize: 16,
    fontWeight: '700',
  },
  inputError: {
    borderColor: color.red_FF0000,
  },
  errorText: {
    color: color.red_FF0000,
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

export default LoginScreen;
