# Country Code Auto-Detection Feature

## Overview
The app now automatically detects the user's country code based on their device location when they open the login screen. This provides a better user experience by pre-selecting the correct country code for phone number input.

## How It Works

### 1. Location-Based Detection
- When the login screen loads, the app requests location permissions
- If granted, it gets the user's current GPS coordinates
- Uses reverse geocoding to determine the country from coordinates
- Matches the detected country code with the available country list
- Automatically sets the country code picker to the detected country

### 2. Fallback Detection
- If location permission is denied or GPS detection fails
- The app falls back to using the device's locale settings
- Extracts country code from the device's language/region settings
- Uses this as a secondary method for country detection

### 3. Default Fallback
- If both location and locale detection fail
- The app defaults to Pakistan (+92) as specified in the configuration
- Users can still manually change the country code if needed

## Implementation Details

### Files Modified
- `src/utils/countryDetection.js` - New utility for country detection
- `src/screens/LoginScreen.js` - Updated to use auto-detection
- `app.json` - Added location permissions for iOS and Android

### Key Features
- **Non-intrusive**: Only detects country, doesn't track or store location data
- **Fast**: Uses cached location data when available (up to 5 minutes old)
- **Fallback-friendly**: Multiple detection methods ensure it always works
- **User-friendly**: Shows loading state during detection
- **Privacy-conscious**: Requests minimal location permissions

### User Experience
1. User opens login screen
2. App shows "..." in country code field while detecting
3. Country code automatically updates to detected country
4. User can still manually change country if needed
5. Detection only happens once per app session

## Permissions Required

### iOS
- `NSLocationWhenInUseUsageDescription`: "This app uses location to automatically detect your country code for phone number input."

### Android
- `ACCESS_FINE_LOCATION`: For precise location detection
- `ACCESS_COARSE_LOCATION`: For approximate location detection

## Technical Implementation

### Country Detection Flow
```
1. Request location permissions
2. Get current GPS coordinates
3. Reverse geocode coordinates to get country
4. Match country code with available countries
5. Update UI with detected country
6. Fallback to locale if GPS fails
7. Default to Pakistan if all methods fail
```

### Error Handling
- Graceful handling of permission denials
- Timeout protection (8 seconds max)
- Fallback mechanisms for failed detection
- Console logging for debugging

## Benefits
- ✅ Improved user experience - no manual country selection needed
- ✅ Reduced user input errors
- ✅ Faster login process
- ✅ Works globally with all supported countries
- ✅ Privacy-friendly implementation
- ✅ Robust fallback mechanisms

## Testing
To test the auto-detection feature:
1. Enable location services on your device
2. Open the app and navigate to login screen
3. Observe the country code automatically updating
4. Test with location disabled to verify fallback behavior
5. Test manual country selection still works

## Future Enhancements
- Cache detected country in device storage
- Add user preference to disable auto-detection
- Support for multiple country detection methods
- Enhanced error messages for permission denials
