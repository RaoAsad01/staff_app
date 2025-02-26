import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Image as ExpoImage, ImageBackground as ExpoImageBackground } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { color } from '../color/color';
import { StatusBar } from 'expo-status-bar';
import SvgIcons from '../../components/SvgIcons';

const LoginScreen = () => {
  const navigation = useNavigation();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .test('emailOrPhone', 'Invalid email or phone number', (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[0-9]{10,15}$/.test(value)
      )
      .required('Required'),
  });

  const handleSignIn = (values) => {
    console.log('Signing in with:', values);
    navigation.navigate('OtpLogin');
  };

  return (
    <>
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
        <View style={{ flex: 1 }}>
          <View style={styles.topSection}>
          <SvgIcons.hexalloSvg width={36} height={40} fill="transparent" />
            <Text style={styles.topText}>Hexallo</Text>
          </View>

          <Text style={styles.additionalText} numberOfLines={2}>
            Get Started{'\n'}to do more!
          </Text>

          <View style={styles.container}>
            <Formik
              initialValues={{ email: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSignIn}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={{ width: '100%' }}>
                  <Text style={styles.inputHeading}>Email or Phone Number</Text>
                  <TextInput
                    style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
                    placeholder="johndoe@gmail.com"
                    placeholderTextColor={color.placeholderTxt_24282C}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                    selectionColor={color.selectField_CEBCA0}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </ExpoImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 50,
    paddingHorizontal: 20,
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
    fontSize: 15,
    top: Platform.OS === 'ios' ? 30 : 0,
  },
  additionalText: {
    marginTop: 40,
    color: color.white_FFFFFF,
    width: '90%',
    lineHeight: 50,
    fontSize: 40,
    fontWeight: 'bold',
    top: Platform.OS === 'ios' ? 20 : 0,
  },
  topText: {
    color: color.lightBrown_FFF6DF,
    marginStart: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
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
  },
  buttonText: {
    color: color.btnTxt_FFF6DF,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputHeading: {
    color: color.black_2F251D,
    marginBottom: 10,
  },
  inputError: {
    borderColor: color.red_FF0000,
  },
  errorText: {
    color: color.red_FF0000,
    marginBottom: 10,
  },
});

export default LoginScreen;
