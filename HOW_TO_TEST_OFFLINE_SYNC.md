# How to Test Offline Sync

This guide explains how to check and test the offline sync functionality in your app.

## Quick Testing Methods

### Method 1: Using Debug Panel (Recommended)

1. **Add Debug Panel to your app** (temporarily for testing):
   ```javascript
   import OfflineDebugPanel from './src/components/OfflineDebugPanel';
   
   // In your component
   const [showDebug, setShowDebug] = useState(false);
   
   // Add a button to show debug panel
   <TouchableOpacity onPress={() => setShowDebug(true)}>
     <Text>Show Offline Status</Text>
   </TouchableOpacity>
   
   <OfflineDebugPanel 
     visible={showDebug} 
     onClose={() => setShowDebug(false)} 
   />
   ```

2. **The panel shows:**
   - Network status (Online/Offline)
   - Queue size and breakdown
   - Storage information
   - Sync status
   - Test results

### Method 2: Using Console/Logger

Add this to any screen to check status:

```javascript
import { offlineDebug } from '../utils/offlineDebug';

// Check status
const status = await offlineDebug.getOfflineStatus();
console.log('Offline Status:', JSON.stringify(status, null, 2));

// Or print formatted status
await offlineDebug.printStatus();
```

### Method 3: Programmatic Checks

```javascript
import { offlineStorage } from '../utils/offlineStorage';
import { offlineQueue } from '../utils/offlineQueue';
import { networkService } from '../utils/network';

// Check network
const isOnline = networkService.isConnected();
console.log('Is Online:', isOnline);

// Check queue
const queueSize = await offlineQueue.getQueueSize();
console.log('Queue Size:', queueSize);

// Check cached events
const events = await offlineStorage.getCachedEvents();
console.log('Cached Events:', events);

// Check ticket count for an event
const count = await offlineStorage.getTicketCount(eventUuid);
console.log('Ticket Count:', count);
```

## Step-by-Step Testing Guide

### Test 1: Basic Offline Functionality

1. **Start with internet connection:**
   - Open the app
   - Navigate to Tickets tab
   - Let data load (this caches it)

2. **Go offline:**
   - Enable Airplane Mode on your device
   - Or disconnect WiFi/Mobile data

3. **Verify offline mode:**
   - App should show "Offline Mode" indicator
   - Tickets list should still be visible (from cache)
   - You can still scroll and search

4. **Test offline actions:**
   - Try scanning a ticket (should queue)
   - Try updating a note (should queue)
   - Check queue size increases

### Test 2: Queue and Sync

1. **While offline:**
   - Perform several scans
   - Update some notes
   - Check queue: `await offlineQueue.getQueueSize()`

2. **Go back online:**
   - Disable Airplane Mode
   - Wait a few seconds

3. **Verify sync:**
   - Queue should start syncing automatically
   - Queue size should decrease
   - Check sync status in debug panel

### Test 3: Large Dataset Handling

1. **With large dataset:**
   ```javascript
   // Check if data is chunked
   const metadata = await AsyncStorage.getItem(
     `offline_tickets_${eventUuid}_meta`
   );
   if (metadata) {
     const meta = JSON.parse(metadata);
     console.log('Is Chunked:', meta.isChunked);
     console.log('Chunk Count:', meta.chunkCount);
   }
   ```

2. **Test pagination:**
   ```javascript
   // Get first 100 tickets
   const tickets = await offlineStorage.getTickets(eventUuid, {
     limit: 100,
     offset: 0
   });
   console.log('Loaded tickets:', tickets.length);
   ```

3. **Check storage size:**
   ```javascript
   const size = await offlineStorage.getStorageSize(eventUuid);
   console.log('Storage Size:', size);
   ```

### Test 4: Storage Cleanup

1. **Check old data:**
   ```javascript
   const events = await offlineStorage.getCachedEvents();
   for (const eventUuid of events) {
     const lastSync = await offlineStorage.getLastSync(eventUuid);
     const age = Date.now() - (lastSync || 0);
     console.log(`Event ${eventUuid}: ${age / (24*60*60*1000)} days old`);
   }
   ```

2. **Trigger cleanup:**
   ```javascript
   const cleaned = await offlineStorage.cleanupAllOldData();
   console.log('Cleaned events:', cleaned);
   ```

## Testing Checklist

### ✅ Basic Functionality
- [ ] App works when offline
- [ ] Cached data is displayed
- [ ] Offline indicator shows
- [ ] Actions are queued when offline

### ✅ Sync Functionality
- [ ] Sync starts automatically when online
- [ ] Queue items are processed
- [ ] Failed items are retried
- [ ] Sync progress is shown

### ✅ Large Dataset
- [ ] Large datasets are chunked (>1000 items)
- [ ] Pagination works correctly
- [ ] Storage size is managed
- [ ] Old data is cleaned up

### ✅ Error Handling
- [ ] Network errors are handled
- [ ] Storage errors are handled
- [ ] Queue errors are handled
- [ ] Sync errors are handled

## Debug Commands

Add these to your app for quick testing:

```javascript
// In any component or screen
import { offlineDebug } from '../utils/offlineDebug';

// Get full status
const status = await offlineDebug.getOfflineStatus();

// Run all tests
const testResults = await offlineDebug.testOfflineFunctionality();

// Get queue details
const queueDetails = await offlineDebug.getQueueDetails();

// Get storage details for an event
const storageDetails = await offlineDebug.getStorageDetails(eventUuid);

// Clear all offline data (use with caution!)
// await offlineDebug.clearAllOfflineData();
```

## Common Issues and Solutions

### Issue: Data not showing offline
**Solution:** Check if data was cached when online
```javascript
const cached = await offlineStorage.getTickets(eventUuid);
console.log('Cached tickets:', cached?.length || 0);
```

### Issue: Queue not syncing
**Solution:** Check network and queue status
```javascript
const isOnline = networkService.isConnected();
const queueSize = await offlineQueue.getQueueSize();
console.log('Online:', isOnline, 'Queue:', queueSize);
```

### Issue: Storage full
**Solution:** Cleanup old data
```javascript
await offlineStorage.cleanupAllOldData();
```

### Issue: Slow performance with large data
**Solution:** Use pagination
```javascript
const tickets = await offlineStorage.getTickets(eventUuid, {
  limit: 50,
  offset: 0
});
```

## Monitoring in Production

For production monitoring, you can:

1. **Log sync events:**
   ```javascript
   syncService.addListener((result) => {
     logger.log('Sync completed:', result);
     // Send to analytics
   });
   ```

2. **Track storage usage:**
   ```javascript
   const size = await offlineStorage.getStorageSize(eventUuid);
   if (size > 50 * 1024 * 1024) { // 50MB
     logger.warn('Storage size exceeded threshold');
   }
   ```

3. **Monitor queue size:**
   ```javascript
   const queueSize = await offlineQueue.getQueueSize();
   if (queueSize > 1000) {
     logger.warn('Queue size is large:', queueSize);
   }
   ```

## Quick Test Script

Add this to your app for quick testing:

```javascript
import { offlineDebug } from '../utils/offlineDebug';

// Quick test function
const quickTest = async () => {
  console.log('=== OFFLINE SYNC QUICK TEST ===');
  
  // Test 1: Status
  const status = await offlineDebug.getOfflineStatus();
  console.log('Status:', status);
  
  // Test 2: Functionality
  const tests = await offlineDebug.testOfflineFunctionality();
  console.log('Tests:', tests);
  
  // Test 3: Queue
  const queue = await offlineDebug.getQueueDetails();
  console.log('Queue:', queue);
  
  console.log('=== TEST COMPLETE ===');
};

// Call it
quickTest();
```

## Visual Indicators

The app includes visual indicators:

1. **OfflineIndicator Component** - Shows at top of screen
2. **Queue count** - Shows number of queued actions
3. **Sync status** - Shows when syncing
4. **Debug Panel** - Detailed status (for development)

All of these help you verify the offline sync is working correctly!

