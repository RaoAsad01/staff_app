import * as Location from 'expo-location';
import { countryCodes } from '../constants/countryCodes';

/**
 * Detects the country code based on the user's current location
 * @returns {Promise<string|null>} The detected country code or null if detection fails
 */
export const detectCountryCode = async () => {
  try {
    console.log('Requesting location permissions...');
    
    // First check if location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      console.log('Location services are disabled on device');
      return null;
    }
    console.log('Location services are enabled');
    
    // Check current permission status first
    let { status } = await Location.getForegroundPermissionsAsync();
    console.log('Current location permission status:', status);
    
    // Request location permissions if not already granted
    if (status !== 'granted') {
      const permissionResponse = await Location.requestForegroundPermissionsAsync();
      status = permissionResponse.status;
      console.log('Location permission request result:', status);
    }
    
    if (status !== 'granted') {
      console.log('Location permission not granted, cannot detect country from GPS');
      return null;
    }
    console.log('Location permission granted');

    console.log('Getting current position...');
    // Get current position with high accuracy to ensure correct country
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // Use high accuracy for better country detection
      timeout: 15000, // 15 second timeout
      maximumAge: 600000, // 10 minutes - accept slightly older location
    });

    console.log('Location obtained:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });

    console.log('Reverse geocoding with coordinates:', {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy
    });
    
    // Reverse geocode to get address
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    console.log('Address data from reverse geocoding:', JSON.stringify(address, null, 2));

    if (address && address.length > 0) {
      const firstAddress = address[0];
      const countryCode = firstAddress.isoCountryCode;
      
      console.log('Reverse geocoding result:', {
        countryCode: countryCode,
        country: firstAddress.country,
        region: firstAddress.region,
        city: firstAddress.city
      });
      
      if (countryCode && countryCode.length === 2) {
        console.log('Detected country code from GPS:', countryCode);
        return countryCode;
      } else {
        console.log('Invalid country code from reverse geocoding:', countryCode);
      }
    }

    console.log('No valid address data found from reverse geocoding');
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
 * @returns {Promise<Object>} The detected country object or null if detection fails
 */
export const getAutoDetectedCountry = async () => {
  try {
    console.log('Starting country auto-detection...');
    
    // First try location-based detection (GPS coordinates)
    console.log('Attempting location-based detection (GPS)...');
    const detectedIsoCode = await detectCountryCode();
    console.log('Location detection result:', detectedIsoCode);
    
    if (detectedIsoCode) {
      const country = findCountryByIsoCode(detectedIsoCode);
      console.log('Found country from location:', country);
      if (country) {
        console.log('Country detected from GPS location:', country.name);
        return country;
      } else {
        console.log('Country not found in our list for code:', detectedIsoCode);
      }
    } else {
      console.log('Location detection failed - permission denied or unavailable');
    }
    
    // Only use locale as fallback if location completely failed
    // But log that we're using locale (which might be inaccurate)
    console.log('Falling back to locale-based detection (may be inaccurate)...');
    const localeIsoCode = detectCountryFromLocale();
    console.log('Locale detection result:', localeIsoCode);
    
    if (localeIsoCode) {
      const country = findCountryByIsoCode(localeIsoCode);
      console.log('Found country from locale:', country);
      if (country) {
        console.log('Country detected from device locale (may not match physical location):', country.name);
        // Return null instead of locale-based country, so we keep the default
        // This way user can see their default and manually change if needed
        return null;
      } else {
        console.log('Country not found in our list for code:', localeIsoCode);
      }
    } else {
      console.log('Locale detection failed');
    }
    
    // Return null if detection fails - let the default country be used
    console.log('Country detection failed, returning null to use default');
    return null;
    
  } catch (error) {
    console.error('Error in getAutoDetectedCountry:', error);
    // Return null on error - let default country be used
    return null;
  }
};