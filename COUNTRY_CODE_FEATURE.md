# Country Code Feature Implementation

## Overview
This implementation adds a generic country code selection system to the login screen, allowing users to select any country code instead of being limited to a specific country like Pakistan (+92).

## Features Added

### 1. Country Code Data (`src/constants/countryCodes.js`)
- Comprehensive list of 80+ countries with their dial codes, flags, and country codes
- Default country set to Pakistan (+92) but can be easily changed
- Helper functions to find countries by dial code or country code

### 2. Country Code Picker Component (`src/components/CountryCodePicker.js`)
- Modal-based country selection interface
- Search functionality to find countries by name, dial code, or country code
- Displays country flags, names, and dial codes
- Responsive design matching the app's theme

### 3. Enhanced Login Screen (`src/screens/LoginScreen.js`)
- Automatic detection of input type (email vs phone)
- Country code picker appears only for phone number input
- Country code is automatically prepended to phone numbers before API calls
- Updated validation to handle phone numbers without country codes (7-15 digits)

### 4. Updated Validation
- LoginScreen: Phone numbers now accept 7-15 digits (without country code)
- BoxOfficeTab: Updated phone validation to match new format
- OtpLoginScreen: Automatically handles country codes from login screen

## How It Works

### For Users:
1. **Email Input**: 
   - User types email address normally (e.g., "user@example.com")
   - No country code picker appears
   - Email keyboard is shown
   - Placeholder shows "Email Address"

2. **Phone Input**: 
   - User starts typing numbers (e.g., "03001234567")
   - Country code picker automatically appears
   - Numeric keyboard is shown
   - Placeholder changes to "Phone Number"
   - User can tap to change country code
   - Phone number is validated without country code
   - Country code is automatically added when sending to API

### For Developers:
1. **Adding New Countries**: Edit `src/constants/countryCodes.js`
2. **Changing Default**: Modify `defaultCountryCode` in the same file
3. **Customization**: The picker component is fully customizable

## API Integration
- Phone numbers are automatically formatted with country codes before API calls
- No changes needed to backend API
- Maintains backward compatibility

## Files Modified
- `src/constants/countryCodes.js` (new)
- `src/components/CountryCodePicker.js` (new)
- `src/screens/LoginScreen.js` (updated)
- `src/screens/BoxOfficeTab/index.js` (updated validation)

## Usage Example
```javascript
// User enters: 03001234567 (Pakistan number)
// System detects: Phone input, shows Pakistan (+92) by default
// API receives: +923001234567
// User can change to: +1 (US) and enter: 5551234567
// API receives: +15551234567
// User can change to: +233 (Ghana) and enter: 201234567
// API receives: +233201234567
```

## Recent Updates
- ✅ Added Ghana flag (🇬🇭) to country codes
- ✅ Country code picker now shows immediately when user starts typing phone numbers
- ✅ Fixed logic: Country picker only shows for numeric input, not for email addresses
- ✅ Improved keyboard type switching (email-address vs numeric)
- ✅ Better placeholder text (Email Address vs Phone Number)

## Benefits
- ✅ Supports all countries, not just Pakistan
- ✅ User-friendly interface with search
- ✅ Automatic country code detection
- ✅ Maintains existing email functionality
- ✅ No breaking changes to existing code
- ✅ Responsive and accessible design
