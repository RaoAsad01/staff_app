import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
const { width, height } = Dimensions.get('window');

const SplashScreenComponent = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <SvgIcons.splashQrImg width={172} height={163} fill="transparent" />
      </View>

      <View style={styles.middleSection}>
        <View style={styles.logoContainer}>
          <SvgIcons.hexalloSvg width={40} height={45} fill="transparent" />
          <Text style={styles.appName}>HEXALLO</Text>
        </View>
        <Text style={styles.subtitle}>Fast.Secure.Seamless</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120b00',
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    marginTop: height * 0.3,
  },
  middleSection: {
    alignItems: 'center',
    marginTop: 120,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    color: color.white_FFFFFF,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: color.white_FFFFFF,
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  button: {
    backgroundColor: color.btnBrown_AE6F28,
    marginHorizontal: 20,
    marginBottom: 80,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: color.btnTxt_FFF6DF,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SplashScreenComponent;
