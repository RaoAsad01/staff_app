import { networkService } from './network';
import { offlineQueue } from './offlineQueue';
import { offlineStorage } from './offlineStorage';
import { ticketService } from '../api/apiService';
import { logger } from './logger';

/**
 * Sync Service
 * Handles syncing queued actions when device comes back online
 */
class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    this.BATCH_SIZE = 50; // Process 50 items at a time
    this.DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches
  }

  /**
   * Start syncing queued actions
   * @param {Function} onProgress - Callback for sync progress
   * @returns {Promise<Object>} Sync result
   */
  async sync(onProgress) {
    if (this.isSyncing) {
      logger.log('Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    if (!networkService.isConnected()) {
      logger.log('Cannot sync: device is offline');
      return { success: false, message: 'Device is offline' };
    }

    this.isSyncing = true;
    const queue = await offlineQueue.getQueue();
    
    if (queue.length === 0) {
      this.isSyncing = false;
      return { success: true, synced: 0, failed: 0, message: 'No items to sync' };
    }

    logger.log(`Starting sync of ${queue.length} queued actions`);
    let synced = 0;
    let failed = 0;
    const errors = [];

    try {
      // Process in batches for large queues
      const totalBatches = Math.ceil(queue.length / this.BATCH_SIZE);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * this.BATCH_SIZE;
        const batchEnd = Math.min(batchStart + this.BATCH_SIZE, queue.length);
        const batch = queue.slice(batchStart, batchEnd);
        
        logger.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} items)`);
        
        // Process batch items in parallel (with concurrency limit)
        const batchPromises = batch.map(async (item, itemIndex) => {
          const globalIndex = batchStart + itemIndex;
          
          if (onProgress) {
            onProgress({
              current: globalIndex + 1,
              total: queue.length,
              item: item.type,
              batch: batchIndex + 1,
              totalBatches,
            });
          }

          try {
            await this.processQueueItem(item);
            await offlineQueue.removeFromQueue(item.id);
            synced++;
            logger.log(`Synced ${item.type} (${globalIndex + 1}/${queue.length})`);
            return { success: true, item };
          } catch (error) {
            logger.error(`Failed to sync ${item.type}:`, error);
            
            if (offlineQueue.shouldRetry(item)) {
              await offlineQueue.incrementRetry(item.id);
              failed++;
              errors.push({ item: item.type, error: error.message });
              return { success: false, item, error: error.message };
            } else {
              // Max retries reached, remove from queue
              await offlineQueue.removeFromQueue(item.id);
              failed++;
              errors.push({ item: item.type, error: 'Max retries reached' });
              return { success: false, item, error: 'Max retries reached' };
            }
          }
        });
        
        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Add delay between batches to prevent overwhelming the server
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_BATCHES));
        }
      }

      const result = {
        success: true,
        synced,
        failed,
        total: queue.length,
        errors: errors.length > 0 ? errors : undefined,
      };

      logger.log(`Sync completed: ${synced} synced, ${failed} failed`);
      this.notifyListeners(result);
      return result;
    } catch (error) {
      logger.error('Sync error:', error);
      return {
        success: false,
        message: error.message,
        synced,
        failed,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single queue item
   * @param {Object} item 
   */
  async processQueueItem(item) {
    switch (item.type) {
      case 'scanTicket':
        await this.syncScanTicket(item.data);
        break;
      case 'updateNote':
        await this.syncUpdateNote(item.data);
        break;
      case 'manualCheckin':
        await this.syncManualCheckin(item.data);
        break;
      default:
        throw new Error(`Unknown action type: ${item.type}`);
    }
  }

  /**
   * Sync scanned ticket
   * @param {Object} data 
   */
  async syncScanTicket(data) {
    const { scannedData, note } = data;
    await ticketService.scanTicket(scannedData, note);
  }

  /**
   * Sync note update
   * @param {Object} data 
   */
  async syncUpdateNote(data) {
    const { code, note, eventUuid } = data;
    await ticketService.updateTicketNote(code, note, eventUuid);
  }

  /**
   * Sync manual checkin
   * @param {Object} data 
   */
  async syncManualCheckin(data) {
    const { uuid, code } = data;
    const response = await ticketService.manualDetailCheckin(uuid, code);
    
    // After successful sync, we should refresh the cached order details
    // This will be handled by the screen's sync listener
    logger.log('Manual checkin synced successfully:', response);
    return response;
  }

  /**
   * Add listener for sync events
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  addListener(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify listeners of sync completion
   * @param {Object} result 
   */
  notifyListeners(result) {
    this.syncListeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        logger.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Check if sync is in progress
   * @returns {boolean}
   */
  isSyncingNow() {
    return this.isSyncing;
  }
}

export const syncService = new SyncService();
export default syncService;
