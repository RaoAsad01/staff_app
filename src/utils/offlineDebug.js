import { offlineStorage } from './offlineStorage';
import { offlineQueue } from './offlineQueue';
import { networkService } from './network';
import { syncService } from './syncService';
import { logger } from './logger';

/**
 * Offline Debug Utility
 * Provides functions to check and debug offline sync functionality
 */
class OfflineDebugService {
  /**
   * Get comprehensive offline status
   * @returns {Promise<Object>}
   */
  async getOfflineStatus() {
    try {
      const isOnline = networkService.isConnected();
      const queueSize = await offlineQueue.getQueueSize();
      const queue = await offlineQueue.getQueue();
      const cachedEvents = await offlineStorage.getCachedEvents();
      
      // Get storage info for each event
      const eventsInfo = await Promise.all(
        cachedEvents.map(async (eventUuid) => {
          const ticketCount = await offlineStorage.getTicketCount(eventUuid);
          const storageSize = await offlineStorage.getStorageSize(eventUuid);
          const lastSync = await offlineStorage.getLastSync(eventUuid);
          
          return {
            eventUuid,
            ticketCount,
            storageSize: this._formatBytes(storageSize),
            lastSync: lastSync ? new Date(lastSync).toLocaleString() : 'Never',
            lastSyncTimestamp: lastSync,
          };
        })
      );

      // Get queue breakdown by type
      const queueBreakdown = queue.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});

      return {
        network: {
          isOnline,
          status: isOnline ? '🟢 Online' : '🔴 Offline',
        },
        queue: {
          size: queueSize,
          breakdown: queueBreakdown,
          items: queue.slice(0, 10), // First 10 items
        },
        storage: {
          cachedEvents: cachedEvents.length,
          events: eventsInfo,
          totalStorage: this._formatBytes(
            eventsInfo.reduce((sum, e) => {
              const size = parseInt(e.storageSize.replace(/[^0-9]/g, '')) || 0;
              return sum + size;
            }, 0)
          ),
        },
        sync: {
          isSyncing: syncService.isSyncingNow(),
          status: syncService.isSyncingNow() ? '🔄 Syncing' : '✅ Idle',
        },
      };
    } catch (error) {
      logger.error('Error getting offline status:', error);
      return { error: error.message };
    }
  }

  /**
   * Get detailed storage information
   * @param {string} eventUuid 
   * @returns {Promise<Object>}
   */
  async getStorageDetails(eventUuid) {
    try {
      const ticketCount = await offlineStorage.getTicketCount(eventUuid);
      const storageSize = await offlineStorage.getStorageSize(eventUuid);
      const lastSync = await offlineStorage.getLastSync(eventUuid);
      const tickets = await offlineStorage.getTickets(eventUuid, { limit: 5 });
      const stats = await offlineStorage.getTicketStats(eventUuid);
      const orders = await offlineStorage.getManualOrders(eventUuid);

      return {
        eventUuid,
        summary: {
          ticketCount,
          storageSize: this._formatBytes(storageSize),
          lastSync: lastSync ? new Date(lastSync).toLocaleString() : 'Never',
          hasStats: !!stats,
          orderCount: orders?.length || 0,
        },
        sample: {
          tickets: tickets?.slice(0, 3) || [],
          stats: stats || {},
          orders: orders?.slice(0, 3) || [],
        },
      };
    } catch (error) {
      logger.error('Error getting storage details:', error);
      return { error: error.message };
    }
  }

  /**
   * Test offline functionality
   * @returns {Promise<Object>}
   */
  async testOfflineFunctionality() {
    const results = {
      network: false,
      storage: false,
      queue: false,
      sync: false,
      errors: [],
    };

    try {
      // Test 1: Network Service
      try {
        const isOnline = networkService.isConnected();
        results.network = true;
        logger.log('✅ Network service: OK');
      } catch (error) {
        results.errors.push(`Network service: ${error.message}`);
      }

      // Test 2: Storage Service
      try {
        const testEventUuid = 'test-event-' + Date.now();
        const testData = [{ id: 1, name: 'Test Ticket' }];
        await offlineStorage.saveTickets(testEventUuid, testData);
        const retrieved = await offlineStorage.getTickets(testEventUuid);
        results.storage = retrieved && retrieved.length > 0;
        await offlineStorage.clearEventData(testEventUuid);
        logger.log('✅ Storage service: OK');
      } catch (error) {
        results.errors.push(`Storage service: ${error.message}`);
      }

      // Test 3: Queue Service
      try {
        const queueId = await offlineQueue.addToQueue(
          'testAction',
          { test: true },
          () => {}
        );
        const queue = await offlineQueue.getQueue();
        results.queue = queue.some(item => item.id === queueId);
        await offlineQueue.removeFromQueue(queueId);
        logger.log('✅ Queue service: OK');
      } catch (error) {
        results.errors.push(`Queue service: ${error.message}`);
      }

      // Test 4: Sync Service
      try {
        const isSyncing = syncService.isSyncingNow();
        results.sync = typeof isSyncing === 'boolean';
        logger.log('✅ Sync service: OK');
      } catch (error) {
        results.errors.push(`Sync service: ${error.message}`);
      }

      results.allPassed = results.network && results.storage && results.queue && results.sync;
      
      return results;
    } catch (error) {
      results.errors.push(`Test error: ${error.message}`);
      return results;
    }
  }

  /**
   * Clear all offline data (use with caution!)
   * @returns {Promise<Object>}
   */
  async clearAllOfflineData() {
    try {
      const events = await offlineStorage.getCachedEvents();
      let clearedCount = 0;

      for (const eventUuid of events) {
        await offlineStorage.clearEventData(eventUuid);
        clearedCount++;
      }

      await offlineQueue.clearQueue();

      return {
        success: true,
        clearedEvents: clearedCount,
        clearedQueue: true,
        message: `Cleared ${clearedCount} events and queue`,
      };
    } catch (error) {
      logger.error('Error clearing offline data:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get queue details
   * @returns {Promise<Object>}
   */
  async getQueueDetails() {
    try {
      const queue = await offlineQueue.getQueue();
      const breakdown = queue.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = {
            count: 0,
            oldest: null,
            newest: null,
            retries: 0,
          };
        }
        acc[item.type].count++;
        if (!acc[item.type].oldest || item.timestamp < acc[item.type].oldest) {
          acc[item.type].oldest = item.timestamp;
        }
        if (!acc[item.type].newest || item.timestamp > acc[item.type].newest) {
          acc[item.type].newest = item.timestamp;
        }
        acc[item.type].retries += item.retries || 0;
        return acc;
      }, {});

      return {
        total: queue.length,
        breakdown,
        items: queue.map(item => ({
          id: item.id,
          type: item.type,
          timestamp: new Date(item.timestamp).toLocaleString(),
          retries: item.retries || 0,
        })),
      };
    } catch (error) {
      logger.error('Error getting queue details:', error);
      return { error: error.message };
    }
  }

  /**
   * Format bytes to human readable
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Print status to console (for debugging)
   */
  async printStatus() {
    const status = await this.getOfflineStatus();
    console.log('\n=== OFFLINE SYNC STATUS ===');
    console.log('Network:', status.network?.status);
    console.log('Queue Size:', status.queue?.size);
    console.log('Cached Events:', status.storage?.cachedEvents);
    console.log('Sync Status:', status.sync?.status);
    console.log('\nQueue Breakdown:', status.queue?.breakdown);
    console.log('\nEvents:', JSON.stringify(status.storage?.events, null, 2));
    console.log('===========================\n');
  }
}

export const offlineDebug = new OfflineDebugService();
export default offlineDebug;

