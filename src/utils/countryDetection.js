import * as Location from 'expo-location';
import { countryCodes } from '../constants/countryCodes';

/**
 * Detects the country code based on the user's current location
 * @returns {Promise<string|null>} The detected country code or null if detection fails
 */
export const detectCountryCode = async () => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission not granted');
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 8000,
      maximumAge: 300000, // 5 minutes
    });

    // Reverse geocode to get address
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (address && address.length > 0) {
      const countryCode = address[0].isoCountryCode;
      console.log('Detected country code:', countryCode);
      return countryCode;
    }

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
    // Get device locale
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const countryCode = locale.split('-')[1] || locale.split('_')[1];
    
    if (countryCode && countryCode.length === 2) {
      console.log('Detected country code from locale:', countryCode);
      return countryCode.toUpperCase();
    }
    
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
  
  const country = countryCodes.find(c => c.iso === isoCode);
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
    const detectedIsoCode = await detectCountryCode();
    if (detectedIsoCode) {
      const country = findCountryByIsoCode(detectedIsoCode);
      if (country) {
        console.log('Country detected from location:', country.name);
        return country;
      }
    }
    
    // Fallback to locale-based detection
    const localeIsoCode = detectCountryFromLocale();
    if (localeIsoCode) {
      const country = findCountryByIsoCode(localeIsoCode);
      if (country) {
        console.log('Country detected from locale:', country.name);
        return country;
      }
    }
    
    // Final fallback to default country (Pakistan)
    console.log('Using default country: Pakistan');
    return findCountryByIsoCode('PK') || {
      name: 'Pakistan',
      code: 'PK',
      dialCode: '+92',
      flag: '🇵🇰',
      iso: 'PK'
    };
    
  } catch (error) {
    console.error('Error in getAutoDetectedCountry:', error);
    // Return default country on error
    return findCountryByIsoCode('PK') || {
      name: 'Pakistan',
      code: 'PK',
      dialCode: '+92',
      flag: '🇵🇰',
      iso: 'PK'
    };
  }
};