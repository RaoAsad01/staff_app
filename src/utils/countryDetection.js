import * as Location from 'expo-location';
import { countryCodes } from '../constants/countryCodes';
import { logger } from './logger';

/**
 * Detects the country code based on the user's current location
 * @returns {Promise<string|null>} The detected country code or null if detection fails
 */
export const detectCountryCode = async () => {
  try {
    // First check if location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return null;
    }

    // Check current permission status first
    let { status } = await Location.getForegroundPermissionsAsync();

    // Request location permissions if not already granted
    if (status !== 'granted') {
      const permissionResponse = await Location.requestForegroundPermissionsAsync();
      status = permissionResponse.status;
    }

    if (status !== 'granted') {
      return null;
    }

    // Get current position with high accuracy to ensure correct country
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // Use high accuracy for better country detection
      timeout: 15000, // 15 second timeout
      maximumAge: 600000, // 10 minutes - accept slightly older location
    });

    // Reverse geocode to get address
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (address && address.length > 0) {
      const firstAddress = address[0];
      const countryCode = firstAddress.isoCountryCode;

      if (countryCode && countryCode.length === 2) {
        return countryCode;
      }
    }

    return null;
  } catch (error) {
    logger.error('Error detecting country code:', error);
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
      return countryCode.toUpperCase();
    }

    return null;
  } catch (error) {
    logger.error('Error detecting country from locale:', error);
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
 * @returns {Promise<Object>} The detected country object or null if detection fails
 */
export const getAutoDetectedCountry = async () => {
  try {
    // First try location-based detection (GPS coordinates)
    const detectedIsoCode = await detectCountryCode();

    if (detectedIsoCode) {
      const country = findCountryByIsoCode(detectedIsoCode);
      if (country) {
        return country;
      }
    }

    // Only use locale as fallback if location completely failed (may be inaccurate)
    const localeIsoCode = detectCountryFromLocale();

    if (localeIsoCode) {
      const country = findCountryByIsoCode(localeIsoCode);
      if (country) {
        // Return null instead of locale-based country, so we keep the default
        // This way user can see their default and manually change if needed
        return null;
      }
    }

    // Return null if detection fails - let the default country be used
    return null;
    
  } catch (error) {
    logger.error('Error in getAutoDetectedCountry:', error);
    // Return null on error - let default country be used
    return null;
  }
};