import * as Location from 'expo-location';
import { countryCodes } from '../constants/countryCodes';

/**
 * Detects the country code based on the user's current location
 * @returns {Promise<string|null>} The detected country code or null if detection fails
 */
export const detectCountryCode = async () => {
  try {
    console.log('Requesting location permissions...');
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('❌ Location permission not granted');
      return null;
    }
    console.log('✅ Location permission granted');

    console.log('Getting current position...');
    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000, // Increased timeout
      maximumAge: 300000, // 5 minutes
    });

    console.log('Location obtained:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });

    console.log('Reverse geocoding...');
    // Reverse geocode to get address
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    console.log('Address data:', address);

    if (address && address.length > 0) {
      const countryCode = address[0].isoCountryCode;
      console.log('Detected country code:', countryCode);
      return countryCode;
    }

    console.log('No address data found');
    return null;
  } catch (error) {
    console.error('Error detecting country code:', error);
    return null;
  }
};

/**
 * Detects country code from device locale as fallback
 * @returns {string|null} The detected country code or null if detection fails
 */
export const detectCountryFromLocale = () => {
  try {
    console.log('Attempting locale-based country detection...');
    // Get device locale
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    console.log('Device locale:', locale);
    
    const countryCode = locale.split('-')[1] || locale.split('_')[1];
    console.log('Extracted country code from locale:', countryCode);
    
    if (countryCode && countryCode.length === 2) {
      console.log('Detected country code from locale:', countryCode);
      return countryCode.toUpperCase();
    }
    
    console.log('No valid country code found in locale');
    return null;
  } catch (error) {
    console.error('Error detecting country from locale:', error);
    return null;
  }
};

/**
 * Finds a country by its ISO code
 * @param {string} isoCode - The ISO country code
 * @returns {Object|null} The country object or null if not found
 */
export const findCountryByIsoCode = (isoCode) => {
  if (!isoCode) return null;
  
  const country = countryCodes.find(c => c.code === isoCode);
  return country || null;
};

/**
 * Auto-detects the user's country and returns the corresponding country object
 * @returns {Promise<Object>} The detected country object or default country
 */
export const getAutoDetectedCountry = async () => {
  try {
    console.log('Starting country auto-detection...');
    
    // First try location-based detection
    console.log('Attempting location-based detection...');
    const detectedIsoCode = await detectCountryCode();
    console.log('Location detection result:', detectedIsoCode);
    
    if (detectedIsoCode) {
      const country = findCountryByIsoCode(detectedIsoCode);
      console.log('Found country from location:', country);
      if (country) {
        console.log('Country detected from location:', country.name);
        return country;
      } else {
        console.log('Country not found in our list for code:', detectedIsoCode);
      }
    } else {
      console.log('Location detection failed');
    }
    
    // Fallback to locale-based detection
    console.log('Attempting locale-based detection...');
    const localeIsoCode = detectCountryFromLocale();
    console.log('Locale detection result:', localeIsoCode);
    
    if (localeIsoCode) {
      const country = findCountryByIsoCode(localeIsoCode);
      console.log('Found country from locale:', country);
      if (country) {
        console.log('Country detected from locale:', country.name);
        return country;
      } else {
        console.log('Country not found in our list for code:', localeIsoCode);
      }
    } else {
      console.log('Locale detection failed');
    }
    
    // Final fallback to default country (Ghana)
    console.log('Using default country: Ghana');
    return findCountryByIsoCode('GH') || {
      name: 'Ghana',
      code: 'GH',
      dialCode: '+233',
      flag: '🇬🇭'
    };
    
  } catch (error) {
    console.error('Error in getAutoDetectedCountry:', error);
    // Return default country on error
    return findCountryByIsoCode('GH') || {
      name: 'Ghana',
      code: 'GH',
      dialCode: '+233',
      flag: '🇬🇭'
    };
  }
};