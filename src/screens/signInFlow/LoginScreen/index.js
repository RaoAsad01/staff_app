import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import Typography, { Heading3, Body1, ButtonTextDemiBold, Caption } from '../components/Typography';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
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

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <ButtonTextDemiBold 
          size={16}
          color={color.btnTxt_FFF6DF}
          align="center"
        >
          Get Started
        </ButtonTextDemiBold>
      </TouchableOpacity>
      
      <View style={styles.bottomtextbg}>
        <Caption 
          weight="400"
          size={12}
          color={color.grey_E4E4E4}
        >
          By Hexallo Enterprise
        </Caption>
      </View>
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
  subtitle: {
    marginTop: 20,
  },
  button: {
    backgroundColor: color.btnBrown_AE6F28,
    marginHorizontal: 20,
    marginBottom: 100,
    paddingVertical: 15,
    borderRadius: 8,
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
});

export default LoginScreen;
