# Scan Analytics Implementation

## Overview
Implemented scan analytics functionality for ScanCategoriesDetails subitems, similar to the Sales tab analytics. Now when users click on subitems in ScanCategoriesDetails, it shows their analytics data in the ScanAnalytics card below instead of navigating to BoxOfficeTab.

**Important**: Navigation to BoxOfficeTab only happens for the **Available Tickets** tab. All other tabs (Sales, Check-Ins, Scans) show analytics instead of navigating.

## Changes Made

### 1. Dashboard State Management (`src/screens/dashboard/index.js`)
Added new state variables for scan analytics:
```javascript
const [scanAnalyticsData, setScanAnalyticsData] = useState(null);
const [scanAnalyticsTitle, setScanAnalyticsTitle] = useState('');
const [activeScanAnalytics, setActiveScanAnalytics] = useState(null);
```

### 2. Scan Analytics Handler Function
Added `handleScanAnalyticsPress` function:
```javascript
const handleScanAnalyticsPress = async (scanType, parentCategory) => {
  if (!eventInfo?.eventUuid) return;

  const analyticsKey = `Scan-${parentCategory}-${scanType}`;

  // If already active, deactivate
  if (activeScanAnalytics === analyticsKey) {
    setActiveScanAnalytics(null);
    setScanAnalyticsData(null);
    setScanAnalyticsTitle('');
    return;
  }

  try {
    // For scan analytics, we'll use the scan_analytics data and filter by category
    if (dashboardStats?.data?.scan_analytics?.data) {
      const scanAnalytics = dashboardStats.data.scan_analytics.data;
      
      // Create chart data from scan analytics
      const chartData = Object.entries(scanAnalytics).map(([hour, value]) => {
        // Format time from "12:00 AM" to "12am" or "12:00 PM" to "12pm"
        let formattedTime = hour;
        if (hour.includes(':00 ')) {
          const [time, period] = hour.split(' ');
          const [hours] = time.split(':');
          formattedTime = `${hours}${period.toLowerCase()}`;
        }

        return {
          time: formattedTime,
          value: value || 0
        };
      });

      setScanAnalyticsData(chartData);
      setScanAnalyticsTitle(`${scanType} Scans`);
      setActiveScanAnalytics(analyticsKey);
    }
  } catch (error) {
    console.error('Error fetching scan analytics for', scanType, error);
  }
};
```

### 3. Updated ScanCategoriesDetails Component (`src/screens/dashboard/ScanCategoriesDetails/index.js`)

#### Props Added:
- `onScanAnalyticsPress`: Function to handle scan analytics press
- `activeScanAnalytics`: Current active scan analytics key

#### Changes:
- Removed navigation logic from `handleSubItemPress`
- Added analytics buttons for subitems with active/inactive states
- Updated `renderItem` function to pass parent category information
- Added analytics button styling

#### Analytics Button Implementation:
```javascript
{isSubItem && onScanAnalyticsPress && (
  <TouchableOpacity
    onPress={() => onScanAnalyticsPress(item.label, parentCategory)}
    style={styles.analyticsButton}
  >
    {activeScanAnalytics === `Scan-${parentCategory}-${item.label}` ? (
      <SvgIcons.iconBarsActive width={24} height={24} fill={color.btnBrown_AE6F28} />
    ) : (
      <SvgIcons.iconBarsInactive width={24} height={24} fill={color.black_544B45} />
    )}
  </TouchableOpacity>
)}
```

### 4. Updated CheckInSoldTicketsCard Component (`src/screens/dashboard/CheckInSolidTicketsCard/index.js`)

#### Changes:
- Updated analytics button conditions to show for both 'Sold Tickets' and 'Check-Ins' titles
- Modified `handleSubItemPress` to only navigate for 'Available Tickets' title
- Updated subitem row press behavior to only be active for 'Available Tickets'

#### Key Logic:
```javascript
// Only navigate for Available Tickets, for other titles we show analytics
if (title === 'Available Tickets') {
  // Navigation logic here
}
// For other titles (Sold Tickets, Check-Ins), analytics are handled by the analytics button
```

### 5. Updated Dashboard Integration
- Passed scan analytics props to ScanCategoriesDetails component
- Updated ScanAnalytics component to show selected scan data when available

```javascript
<ScanCategoriesDetails 
  stats={dashboardStats} 
  onScanAnalyticsPress={handleScanAnalyticsPress}
  activeScanAnalytics={activeScanAnalytics}
/>

{scanAnalyticsData && activeScanAnalytics ? (
  <ScanAnalytics
    title={scanAnalyticsTitle}
    data={scanAnalyticsData}
    dataType="checked in"
  />
) : (
  <ScanAnalytics
    title="Scans"
    data={getCheckinAnalyticsChartData(dashboardStats?.data?.scan_analytics)}
    dataType="checked in"
  />
)}
```

## Functionality by Tab

### Available Tickets Tab:
- **Subitem Click**: Navigates to BoxOfficeTab
- **Analytics Button**: Not shown
- **Dropdown**: Shows for expandable items
- **Behavior**: Traditional navigation behavior

### Sales Tab:
- **Subitem Click**: No action (row press disabled)
- **Analytics Button**: Shows analytics data
- **Dropdown**: Shows for expandable items
- **Behavior**: Analytics-focused

### Check-Ins Tab:
- **Subitem Click**: No action (no subitems shown)
- **Analytics Button**: Not shown
- **Dropdown**: Not shown (no expandable items)
- **Behavior**: Simple data display only

### Scans Tab:
- **Subitem Click**: No action (row press disabled)
- **Analytics Button**: Shows analytics data
- **Dropdown**: Shows for expandable items
- **Behavior**: Analytics-focused

## Usage

### For Available Tickets:
1. Navigate to Available Tickets tab
2. Expand any category to see subitems
3. Click on any subitem to navigate to BoxOfficeTab

### For Sales Tab:
1. Navigate to Sales tab
2. Expand any category to see subitems
3. Click the analytics button (bars icon) next to any subitem
4. View the analytics data in the chart below
5. Click the same button again to return to general analytics

### For Check-Ins Tab:
1. Navigate to Check-Ins tab
2. View the check-in data directly
3. No interactive elements - simple data display

### For Scans Tab:
1. Navigate to Scans tab
2. Expand any category to see subitems
3. Click the analytics button (bars icon) next to any subitem
4. View the analytics data in the chart below
5. Click the same button again to return to general analytics

## Benefits

1. **Consistent UX**: Matches the Sales tab functionality for analytics
2. **Better Data Visualization**: Users can see analytics for specific subitems
3. **Improved Navigation**: Only Available Tickets navigates, others show analytics
4. **Visual Feedback**: Clear indication of which analytics are being displayed
5. **Reusable Pattern**: Same pattern can be applied to other components
6. **Tab-Specific Behavior**: Each tab has appropriate behavior for its purpose
