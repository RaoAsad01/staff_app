import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Image as ExpoImage, ImageBackground as ExpoImageBackground } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import { StatusBar } from 'expo-status-bar';
import SvgIcons from '../../components/SvgIcons';

const OtpLoginScreen = () => {
  const navigation = useNavigation();
  const [otpResendTime, setOtpResendTime] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const inputRefs = useRef([]);

  const gotologinscreen =() => {
    navigation.navigate('Login');
  }

  const handleSignIn = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 5) {
      console.log('Signing in with OTP:', enteredOtp);
      navigation.navigate('LoggedIn');
    } else {
      console.log('Invalid OTP');
    }
  };

  const handleResendOtp = () => {
    console.log('Resending OTP');
   // setOtpResendTime(60);
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
            <Text style={styles.topText}>Hexallo</Text>
          </View>

          <Text style={styles.additionalText}>Get Started{'\n'}to do more!</Text>

          <View style={styles.container}>
            <Text style={styles.appName}>Enter OTP</Text>
            <Text style={styles.labelText}>
              OTP sent to your email{' '}
              {/* {otpResendTime > 0 ? (
                <Text style={{ color: color.gray }}>(Resend in {otpResendTime}s)</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp}>
                  <Text style={styles.resendText}></Text>
                </TouchableOpacity>
              )} */}
            </Text>

            {/* OTP Inputs */}
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

            <Text style={styles.labelText}>Didn’t receive the OTP code?</Text>

            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeDetailsButton}
            //  onPress={handleResendOtp}
             >
              <Text style={styles.changeDetailsText}>Resend OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeDetailsButton} onPress={gotologinscreen}>
              <Text style={styles.changeDetailsText}>Change OTP Details</Text>
            </TouchableOpacity>
          </View>
        </ExpoImageBackground>
      </View>
    </TouchableWithoutFeedback>
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
  },
  topText: {
    color: color.lightBrown_FFF6DF,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
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
  },
  buttonText: {
    color: color.btnTxt_FFF6DF,
    fontSize: 16,
    fontWeight: '700',
  },
  changeDetailsButton: {
    marginTop: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: color.btnBrown_AE6F28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',

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
});

export default OtpLoginScreen;
