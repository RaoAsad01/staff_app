import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import { StatusBar } from 'expo-status-bar';
import Typography, { Heading3, Body1, ButtonTextDemiBold, Caption } from '../components/Typography';
import MiddleSection from '../components/MiddleSection';

const { width, height } = Dimensions.get('window');

const SplashScreenComponent = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  return (
    <LinearGradient colors={["#000000", "#281c10"]} style={{ flex: 1 }}>
       <StatusBar
            style="dark"
            backgroundColor="transparent"
            translucent
          />
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          <SvgIcons.splashQrImg width={172} height={163} fill="transparent" />
        </View>

        <MiddleSection 
          showGetStartedButton={true}
          onGetStartedPress={handleGetStarted}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topSection: {
    alignItems: 'center',
    marginTop: height * 0.3,
  },
});

export default SplashScreenComponent;
