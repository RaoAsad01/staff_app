# Offline Sync Implementation

This document explains how the offline sync functionality works in the app.

## Overview

The app now supports full offline functionality with automatic syncing when the device comes back online. All data is cached locally and actions performed offline are queued for sync.

## Architecture

### Core Components

1. **Network Service** (`src/utils/network.js`)
   - Detects network connectivity status
   - Monitors network errors from API calls
   - Provides network status to other services

2. **Offline Storage** (`src/utils/offlineStorage.js`)
   - Caches API responses locally using AsyncStorage
   - **Optimized for large datasets** with chunking (1000 items per chunk)
   - Stores tickets, stats, manual orders, and scanned tickets
   - Provides pagination support for efficient data loading
   - Automatic cleanup of old data to prevent storage bloat
   - Indexing for fast lookups
   - Storage size monitoring and management

3. **Offline Queue** (`src/utils/offlineQueue.js`)
   - Manages queue of actions to be synced
   - **Deduplication** to prevent duplicate actions
   - **Batch operations** for efficiency
   - Stores scan tickets, update notes, and manual check-ins
   - Handles retry logic for failed syncs
   - Maximum queue size management (10,000 items)

4. **Sync Service** (`src/utils/syncService.js`)
   - Processes queued actions when device comes back online
   - **Batch processing** (50 items per batch) for large queues
   - Rate limiting between batches to prevent server overload
   - Syncs scans, note updates, and manual check-ins
   - Provides sync progress callbacks

5. **Offline Sync Hook** (`src/hooks/useOfflineSync.js`)
   - React hook for managing offline sync
   - Automatically triggers sync when device comes online
   - Provides sync status and queue size

## How It Works

### Online Mode

1. When online, all API calls work normally
2. Successful responses are automatically cached to AsyncStorage
3. Data is stored with timestamps for cache validation

### Offline Mode

1. **Data Fetching**:
   - When offline, API calls return cached data from AsyncStorage
   - If no cache exists, returns empty data or default values
   - User can still view all previously loaded data

2. **Actions (Scans, Updates)**:
   - Actions are queued in the offline queue
   - Data is saved locally for immediate UI updates
   - Actions are marked as "queued" for sync

3. **User Experience**:
   - App shows "Offline Mode" indicator
   - Displays number of queued actions
   - All functionality remains available

### Sync Process

1. **Automatic Sync**:
   - When device comes back online, sync automatically starts
   - Processes all queued actions in order
   - Updates local cache with synced data

2. **Manual Sync**:
   - Users can manually trigger sync via the sync button
   - Shows sync progress and results

3. **Error Handling**:
   - Failed syncs are retried up to 3 times
   - After max retries, actions are removed from queue
   - Errors are logged for debugging

## API Service Integration

The API service (`src/api/apiService.js`) has been updated to:

1. **Check Network Status**: Before making requests, checks if device is online
2. **Return Cached Data**: If offline, returns cached data instead of making requests
3. **Queue Actions**: If offline, queues actions for later sync
4. **Cache Responses**: Automatically caches successful responses
5. **Handle Network Errors**: Detects network errors and switches to offline mode

### Updated Methods

- `scanTicket()` - Queues scans when offline, caches when online
- `ticketStatsListing()` - Returns cached tickets when offline
- `ticketStatsInfo()` - Returns cached stats when offline
- `fetchUserTicketOrders()` - Returns cached orders when offline
- `updateTicketNote()` - Queues note updates when offline

## UI Components

### Offline Indicator

The `OfflineIndicator` component shows:
- ⚠️ Offline status with queue count
- 🔄 Syncing status when sync is in progress
- ✅ Online status when sync completes

### Screen Updates

- **TicketsTab**: Shows offline indicator, uses cached data
- **CheckIn**: Scans work offline, are queued for sync
- **ManualScan**: Shows cached orders when offline

## Data Caching

### Cached Data Types

1. **Tickets List**: Full list of tickets for an event (chunked for large datasets)
2. **Ticket Stats**: Total, scanned, unscanned counts
3. **Manual Orders**: List of manual ticket orders
4. **Scanned Tickets**: Individual scan results (max 10,000 kept)

### Cache Keys

- `offline_tickets_{eventUuid}` - Tickets list (single item for < 1000 tickets)
- `offline_tickets_{eventUuid}_chunk_{n}` - Ticket chunks (for large datasets)
- `offline_tickets_{eventUuid}_meta` - Metadata for chunked data
- `offline_ticket_stats_{eventUuid}` - Stats
- `offline_manual_orders_{eventUuid}` - Manual orders
- `offline_scanned_tickets_{ticketCode}` - Scanned tickets
- `offline_ticket_index_{eventUuid}` - Index for fast lookups
- `offline_last_sync_{eventUuid}` - Last sync timestamp

### Cache Optimization for Large Datasets

**Chunking Strategy:**
- Datasets > 1000 items are automatically split into chunks
- Each chunk contains up to 1000 items
- Metadata tracks chunk count and structure
- Enables efficient pagination and lazy loading

**Pagination Support:**
```javascript
// Get first 100 tickets
const tickets = await offlineStorage.getTickets(eventUuid, { 
  limit: 100, 
  offset: 0 
});

// Get tickets with filter
const scannedTickets = await offlineStorage.getTickets(eventUuid, {
  filter: { checkin_status: 'SCANNED' }
});
```

**Automatic Cleanup:**
- Old scanned tickets (> 10,000) are automatically removed
- Cache older than 7 days is cleaned up
- Storage size monitoring prevents quota exceeded errors
- Index creation for frequently accessed fields

### Cache Validity

- Cache is valid for 24 hours
- Can be manually refreshed when online
- Automatically updated when syncing
- Old data cleaned up after 7 days

## Usage Examples

### Checking Network Status

```javascript
import { networkService } from '../utils/network';

const isOnline = networkService.isConnected();
```

### Using Offline Sync Hook

```javascript
import { useOfflineSync } from '../hooks/useOfflineSync';

const { isOnline, isSyncing, queueSize, triggerSync } = useOfflineSync();
```

### Manual Sync

```javascript
import { syncService } from '../utils/syncService';

const result = await syncService.sync((progress) => {
  console.log(`Syncing ${progress.current}/${progress.total}`);
});
```

## Testing Offline Mode

1. **Enable Airplane Mode** on your device
2. **Open the app** - should show "Offline Mode" indicator
3. **View data** - should show cached data
4. **Perform actions** - scans/updates should be queued
5. **Disable Airplane Mode** - sync should start automatically
6. **Check sync status** - should show sync progress

## Troubleshooting

### Sync Not Working

- Check network connectivity
- Verify queue has items: `await offlineQueue.getQueueSize()`
- Check logs for sync errors
- Manually trigger sync: `await syncService.sync()`

### Cache Not Updating

- Clear cache: `await offlineStorage.clearEventData(eventUuid)`
- Force refresh when online
- Check cache timestamps

### Actions Not Queuing

- Verify network service is detecting offline status
- Check queue service is working
- Review error logs

## Performance Optimizations for Large Datasets

### Storage Optimizations

1. **Chunked Storage**: Large datasets (>1000 items) are split into chunks
2. **Lazy Loading**: Data loaded on-demand, not all at once
3. **Indexing**: Fast lookups using ticket number and status indexes
4. **Automatic Cleanup**: Old data removed to prevent storage bloat
5. **Compression Ready**: Structure supports future compression

### Sync Optimizations

1. **Batch Processing**: Processes 50 items at a time
2. **Rate Limiting**: 1 second delay between batches
3. **Deduplication**: Prevents duplicate actions in queue
4. **Parallel Processing**: Batch items processed concurrently
5. **Smart Retry**: Only retries failed items, not entire queue

### Memory Management

1. **Pagination**: Load data in pages, not all at once
2. **Chunked Retrieval**: Only load needed chunks
3. **Index Usage**: Use indexes instead of full data scans
4. **Storage Monitoring**: Track and manage storage size

### Configuration

All optimizations are configurable via constants in the services:

```javascript
// offlineStorage.js
CONFIG = {
  CHUNK_SIZE: 1000,              // Items per chunk
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB max per event
  MAX_SCANNED_TICKETS: 10000,     // Max scanned tickets
  CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
}

// syncService.js
BATCH_SIZE: 50,                   // Items per batch
DELAY_BETWEEN_BATCHES: 1000,     // 1 second delay

// offlineQueue.js
MAX_QUEUE_SIZE: 10000,            // Max queue items
DEDUPLICATE_WINDOW: 5 * 60 * 1000, // 5 minutes
```

## Future Enhancements

- Background sync when app is in background
- Conflict resolution for concurrent edits
- Data compression for even larger datasets
- Incremental sync (only sync changes)
- Sync progress notifications
- Offline mode settings/preferences
- Cloud backup of offline data

