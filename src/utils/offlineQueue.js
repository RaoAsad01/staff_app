import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

/**
 * Offline Queue Service
 * Manages queue of actions to be synced when online
 */
class OfflineQueueService {
  constructor() {
    this.QUEUE_KEY = 'offline_action_queue';
    this.MAX_RETRIES = 3;
    this.MAX_QUEUE_SIZE = 10000; // Maximum queue size before cleanup
    this.DEDUPLICATE_WINDOW = 5 * 60 * 1000; // 5 minutes - deduplicate actions within this window
  }

  /**
   * Add action to queue (with deduplication for large queues)
   * @param {string} actionType - Type of action (scan, updateNote, etc.)
   * @param {Object} actionData - Data for the action
   * @param {Function} actionFunction - Function to execute when syncing
   * @returns {Promise<string>} Queue item ID
   */
  async addToQueue(actionType, actionData, actionFunction) {
    try {
      const queue = await this.getQueue();
      
      // Check queue size and cleanup if needed
      if (queue.length >= this.MAX_QUEUE_SIZE) {
        logger.warn(`Queue size (${queue.length}) exceeds max, cleaning up old items`);
        await this._cleanupOldItems(queue);
      }
      
      // Deduplicate: Check if same action was added recently
      const now = Date.now();
      const duplicate = queue.find(item => {
        if (item.type !== actionType) return false;
        if (now - item.timestamp > this.DEDUPLICATE_WINDOW) return false;
        
        // Check if data matches (for scans, check ticket code)
        if (actionType === 'scanTicket') {
          return item.data?.scannedData === actionData?.scannedData;
        }
        if (actionType === 'updateNote') {
          return item.data?.code === actionData?.code && 
                 item.data?.eventUuid === actionData?.eventUuid;
        }
        return false;
      });
      
      if (duplicate) {
        logger.log(`Duplicate ${actionType} action found, skipping`);
        return duplicate.id;
      }
      
      const queueItem = {
        id: `${actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: actionType,
        data: actionData,
        timestamp: now,
        retries: 0,
        actionFunction: actionFunction.toString(), // Store function as string
      };

      queue.push(queueItem);
      
      // Batch write optimization: only save every 10 items or immediately for critical actions
      if (queue.length % 10 === 0 || actionType === 'scanTicket') {
        await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      } else {
        // Defer write for non-critical actions
        setTimeout(async () => {
          await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(await this.getQueue()));
        }, 100);
      }
      
      logger.log(`Added ${actionType} to queue. Queue size: ${queue.length}`);
      return queueItem.id;
    } catch (error) {
      logger.error('Error adding to queue:', error);
      throw error;
    }
  }

  /**
   * Cleanup old items from queue
   * @private
   */
  async _cleanupOldItems(queue) {
    try {
      const now = Date.now();
      const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      // Remove items older than MAX_AGE and with max retries
      const filtered = queue.filter(item => {
        const age = now - item.timestamp;
        // Keep if recent or if retries haven't exceeded max
        return age < MAX_AGE || item.retries < this.MAX_RETRIES;
      });
      
      if (filtered.length < queue.length) {
        await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filtered));
        logger.log(`Cleaned up ${queue.length - filtered.length} old queue items`);
      }
      
      return filtered;
    } catch (error) {
      logger.error('Error cleaning up queue:', error);
      return queue;
    }
  }

  /**
   * Get all queued actions
   * @returns {Promise<Array>}
   */
  async getQueue() {
    try {
      const data = await AsyncStorage.getItem(this.QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Error getting queue:', error);
      return [];
    }
  }

  /**
   * Remove item from queue (batch removal for efficiency)
   * @param {string|Array<string>} itemIds - Single ID or array of IDs
   */
  async removeFromQueue(itemIds) {
    try {
      const queue = await this.getQueue();
      const idsToRemove = Array.isArray(itemIds) ? itemIds : [itemIds];
      const filteredQueue = queue.filter(item => !idsToRemove.includes(item.id));
      
      // Only write if queue actually changed
      if (filteredQueue.length < queue.length) {
        await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filteredQueue));
        logger.log(`Removed ${queue.length - filteredQueue.length} item(s) from queue. Remaining: ${filteredQueue.length}`);
      }
    } catch (error) {
      logger.error('Error removing from queue:', error);
    }
  }

  /**
   * Remove multiple items in batch (more efficient)
   * @param {Array<string>} itemIds 
   */
  async removeBatch(itemIds) {
    return this.removeFromQueue(itemIds);
  }

  /**
   * Update retry count for a queue item
   * @param {string} itemId 
   */
  async incrementRetry(itemId) {
    try {
      const queue = await this.getQueue();
      const item = queue.find(q => q.id === itemId);
      if (item) {
        item.retries += 1;
        await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      logger.error('Error incrementing retry:', error);
    }
  }

  /**
   * Clear all items from queue
   */
  async clearQueue() {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
      logger.log('Queue cleared');
    } catch (error) {
      logger.error('Error clearing queue:', error);
    }
  }

  /**
   * Get queue size
   * @returns {Promise<number>}
   */
  async getQueueSize() {
    try {
      const queue = await this.getQueue();
      return queue.length;
    } catch (error) {
      logger.error('Error getting queue size:', error);
      return 0;
    }
  }

  /**
   * Check if item should be retried
   * @param {Object} item 
   * @returns {boolean}
   */
  shouldRetry(item) {
    return item.retries < this.MAX_RETRIES;
  }
}

export const offlineQueue = new OfflineQueueService();
export default offlineQueue;

