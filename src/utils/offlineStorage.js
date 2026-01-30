import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

/**
 * Offline Storage Service
 * Handles caching of API responses and offline data
 * Optimized for large datasets with chunking, pagination, and cleanup
 */
class OfflineStorageService {
  constructor() {
    this.STORAGE_KEYS = {
      TICKETS: 'offline_tickets',
      TICKET_STATS: 'offline_ticket_stats',
      MANUAL_ORDERS: 'offline_manual_orders',
      ORDER_DETAILS: 'offline_order_details', // Order details cache
      SCANNED_TICKETS: 'offline_scanned_tickets',
      EVENT_DATA: 'offline_event_data',
      LAST_SYNC: 'offline_last_sync',
      CACHE_TIMESTAMP: 'offline_cache_timestamp',
      TICKET_INDEX: 'offline_ticket_index', // Index for fast lookups
    };
    
    // Configuration for large dataset handling
    this.CONFIG = {
      CHUNK_SIZE: 1000, // Number of items per chunk
      MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB max cache per event
      MAX_SCANNED_TICKETS: 10000, // Max scanned tickets to keep
      CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days
      CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
      COMPRESS_THRESHOLD: 5000, // Compress if more than 5000 items
    };
  }

  /**
   * Save tickets list for an event (optimized for large datasets)
   * Splits large datasets into chunks for efficient storage
   * @param {string} eventUuid 
   * @param {Array} tickets 
   */
  async saveTickets(eventUuid, tickets) {
    try {
      if (!tickets || tickets.length === 0) {
        return;
      }

      const totalTickets = tickets.length;
      const useChunking = totalTickets > this.CONFIG.CHUNK_SIZE;

      if (useChunking) {
        // Split into chunks for large datasets
        const chunks = [];
        const chunkCount = Math.ceil(totalTickets / this.CONFIG.CHUNK_SIZE);
        
        for (let i = 0; i < chunkCount; i++) {
          const start = i * this.CONFIG.CHUNK_SIZE;
          const end = Math.min(start + this.CONFIG.CHUNK_SIZE, totalTickets);
          chunks.push(tickets.slice(start, end));
        }

        // Save chunks separately
        const chunkKeys = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunkKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_chunk_${i}`;
          await AsyncStorage.setItem(chunkKey, JSON.stringify({
            tickets: chunks[i],
            chunkIndex: i,
            timestamp: Date.now(),
          }));
          chunkKeys.push(chunkKey);
        }

        // Save metadata
        const metadataKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_meta`;
        await AsyncStorage.setItem(metadataKey, JSON.stringify({
          totalCount: totalTickets,
          chunkCount: chunkCount,
          chunkSize: this.CONFIG.CHUNK_SIZE,
          chunkKeys: chunkKeys,
          timestamp: Date.now(),
          isChunked: true,
        }));

        logger.log(`Saved ${totalTickets} tickets in ${chunkCount} chunks for event ${eventUuid}`);
      } else {
        // Save as single item for small datasets
        const key = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}`;
        await AsyncStorage.setItem(key, JSON.stringify({
          tickets,
          timestamp: Date.now(),
          isChunked: false,
        }));
        logger.log(`Saved ${tickets.length} tickets for event ${eventUuid}`);
      }

      // Create index for fast lookups (only for frequently accessed fields)
      await this._createTicketIndex(eventUuid, tickets);
    } catch (error) {
      logger.error('Error saving tickets:', error);
      // If storage fails due to size, try clearing old data
      if (error.message?.includes('size') || error.message?.includes('quota')) {
        await this._cleanupOldData(eventUuid);
        // Retry with smaller dataset or chunking
        logger.log('Retrying save after cleanup...');
        await this.saveTickets(eventUuid, tickets);
      }
    }
  }

  /**
   * Get cached tickets for an event (supports chunked data)
   * @param {string} eventUuid 
   * @param {Object} options - { limit, offset, filter } for pagination
   * @returns {Promise<Array|null>}
   */
  async getTickets(eventUuid, options = {}) {
    try {
      const { limit, offset = 0, filter } = options;
      
      // Check if data is chunked
      const metadataKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_meta`;
      const metadata = await AsyncStorage.getItem(metadataKey);
      
      if (metadata) {
        // Data is chunked
        const meta = JSON.parse(metadata);
        
        if (limit && limit < meta.totalCount) {
          // Return paginated results
          return await this._getPaginatedTickets(eventUuid, meta, limit, offset, filter);
        }
        
        // Load all chunks
        const allTickets = [];
        for (let i = 0; i < meta.chunkCount; i++) {
          const chunkKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_chunk_${i}`;
          const chunkData = await AsyncStorage.getItem(chunkKey);
          if (chunkData) {
            const parsed = JSON.parse(chunkData);
            allTickets.push(...parsed.tickets);
          }
        }
        
        // Apply filter if provided
        if (filter) {
          return this._applyFilter(allTickets, filter);
        }
        
        return allTickets;
      } else {
        // Single item storage
        const key = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}`;
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          let tickets = parsed.tickets || [];
          
          // Apply pagination if requested
          if (limit) {
            tickets = tickets.slice(offset, offset + limit);
          }
          
          // Apply filter if provided
          if (filter) {
            tickets = this._applyFilter(tickets, filter);
          }
          
          return tickets;
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting tickets:', error);
      return null;
    }
  }

  /**
   * Get paginated tickets from chunked storage
   * @private
   */
  async _getPaginatedTickets(eventUuid, meta, limit, offset, filter) {
    const startChunk = Math.floor(offset / this.CONFIG.CHUNK_SIZE);
    const endChunk = Math.floor((offset + limit) / this.CONFIG.CHUNK_SIZE);
    const tickets = [];
    
    for (let i = startChunk; i <= endChunk && i < meta.chunkCount; i++) {
      const chunkKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_chunk_${i}`;
      const chunkData = await AsyncStorage.getItem(chunkKey);
      if (chunkData) {
        const parsed = JSON.parse(chunkData);
        tickets.push(...parsed.tickets);
      }
    }
    
    // Apply offset and limit
    let result = tickets.slice(offset % this.CONFIG.CHUNK_SIZE);
    result = result.slice(0, limit);
    
    // Apply filter if provided
    if (filter) {
      result = this._applyFilter(result, filter);
    }
    
    return result;
  }

  /**
   * Apply filter to tickets array
   * @private
   */
  _applyFilter(tickets, filter) {
    if (!filter || typeof filter !== 'object') return tickets;
    
    return tickets.filter(ticket => {
      for (const [key, value] of Object.entries(filter)) {
        if (ticket[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Create index for fast ticket lookups
   * @private
   */
  async _createTicketIndex(eventUuid, tickets) {
    try {
      // Only index frequently accessed fields to save space
      const index = {
        byId: {},
        byStatus: { SCANNED: [], UNSCANNED: [] },
        timestamp: Date.now(),
      };
      
      tickets.forEach((ticket, idx) => {
        // Index by ticket number
        if (ticket.ticket_number) {
          index.byId[ticket.ticket_number] = idx;
        }
        
        // Index by status
        if (ticket.checkin_status === 'SCANNED') {
          index.byStatus.SCANNED.push(idx);
        } else {
          index.byStatus.UNSCANNED.push(idx);
        }
      });
      
      const indexKey = `${this.STORAGE_KEYS.TICKET_INDEX}_${eventUuid}`;
      await AsyncStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
      logger.error('Error creating ticket index:', error);
      // Index creation failure shouldn't break the app
    }
  }

  /**
   * Save ticket stats for an event
   * @param {string} eventUuid 
   * @param {Object} stats 
   */
  async saveTicketStats(eventUuid, stats) {
    try {
      const key = `${this.STORAGE_KEYS.TICKET_STATS}_${eventUuid}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        stats,
        timestamp: Date.now(),
      }));
      logger.log(`Saved ticket stats for event ${eventUuid}`);
    } catch (error) {
      logger.error('Error saving ticket stats:', error);
    }
  }

  /**
   * Get cached ticket stats for an event
   * @param {string} eventUuid 
   * @returns {Promise<Object|null>}
   */
  async getTicketStats(eventUuid) {
    try {
      const key = `${this.STORAGE_KEYS.TICKET_STATS}_${eventUuid}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.stats;
      }
      return null;
    } catch (error) {
      logger.error('Error getting ticket stats:', error);
      return null;
    }
  }

  /**
   * Save manual orders for an event
   * @param {string} eventUuid 
   * @param {Array} orders 
   */
  async saveManualOrders(eventUuid, orders) {
    try {
      const key = `${this.STORAGE_KEYS.MANUAL_ORDERS}_${eventUuid}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        orders,
        timestamp: Date.now(),
      }));
      logger.log(`Saved ${orders.length} manual orders for event ${eventUuid}`);
    } catch (error) {
      logger.error('Error saving manual orders:', error);
    }
  }

  /**
   * Get cached manual orders for an event
   * @param {string} eventUuid 
   * @returns {Promise<Array|null>}
   */
  async getManualOrders(eventUuid) {
    try {
      const key = `${this.STORAGE_KEYS.MANUAL_ORDERS}_${eventUuid}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.orders;
      }
      return null;
    } catch (error) {
      logger.error('Error getting manual orders:', error);
      return null;
    }
  }

  /**
   * Save scanned ticket data (with cleanup for old entries)
   * @param {string} ticketCode 
   * @param {Object} scanData 
   */
  async saveScannedTicket(ticketCode, scanData) {
    try {
      const key = `${this.STORAGE_KEYS.SCANNED_TICKETS}_${ticketCode}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        ...scanData,
        timestamp: Date.now(),
        synced: false,
      }));
      
      // Periodically cleanup old scanned tickets to prevent storage bloat
      const scannedCount = await this._getScannedTicketsCount();
      if (scannedCount > this.CONFIG.MAX_SCANNED_TICKETS) {
        await this._cleanupOldScannedTickets();
      }
      
      logger.log(`Saved scanned ticket ${ticketCode}`);
    } catch (error) {
      logger.error('Error saving scanned ticket:', error);
    }
  }

  /**
   * Get count of scanned tickets
   * @private
   */
  async _getScannedTicketsCount() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith(this.STORAGE_KEYS.SCANNED_TICKETS)).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Cleanup old scanned tickets (keep only recent ones)
   * @private
   */
  async _cleanupOldScannedTickets() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const scannedKeys = keys.filter(key => key.startsWith(this.STORAGE_KEYS.SCANNED_TICKETS));
      
      // Get all scanned tickets with timestamps
      const ticketsWithTime = await Promise.all(
        scannedKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            return { key, timestamp: parsed.timestamp || 0, synced: parsed.synced || false };
          }
          return null;
        })
      );
      
      // Sort by timestamp (oldest first)
      ticketsWithTime
        .filter(t => t !== null)
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, scannedKeys.length - this.CONFIG.MAX_SCANNED_TICKETS)
        .forEach(async (ticket) => {
          // Only remove if synced (keep unsynced ones)
          if (ticket.synced) {
            await AsyncStorage.removeItem(ticket.key);
          }
        });
      
      logger.log('Cleaned up old scanned tickets');
    } catch (error) {
      logger.error('Error cleaning up scanned tickets:', error);
    }
  }

  /**
   * Get cached scanned ticket
   * @param {string} ticketCode 
   * @returns {Promise<Object|null>}
   */
  async getScannedTicket(ticketCode) {
    try {
      const key = `${this.STORAGE_KEYS.SCANNED_TICKETS}_${ticketCode}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      logger.error('Error getting scanned ticket:', error);
      return null;
    }
  }

  /**
   * Save last sync timestamp
   * @param {string} eventUuid 
   */
  async saveLastSync(eventUuid) {
    try {
      const key = `${this.STORAGE_KEYS.LAST_SYNC}_${eventUuid}`;
      await AsyncStorage.setItem(key, Date.now().toString());
    } catch (error) {
      logger.error('Error saving last sync:', error);
    }
  }

  /**
   * Get last sync timestamp
   * @param {string} eventUuid 
   * @returns {Promise<number|null>}
   */
  async getLastSync(eventUuid) {
    try {
      const key = `${this.STORAGE_KEYS.LAST_SYNC}_${eventUuid}`;
      const timestamp = await AsyncStorage.getItem(key);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      logger.error('Error getting last sync:', error);
      return null;
    }
  }

  /**
   * Clear all offline data for an event (including chunks)
   * @param {string} eventUuid 
   */
  async clearEventData(eventUuid) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const eventKeys = allKeys.filter(key => key.includes(eventUuid));
      
      // Remove all keys related to this event
      if (eventKeys.length > 0) {
        await AsyncStorage.multiRemove(eventKeys);
      }
      
      logger.log(`Cleared ${eventKeys.length} offline data items for event ${eventUuid}`);
    } catch (error) {
      logger.error('Error clearing event data:', error);
    }
  }

  /**
   * Cleanup old data for an event to free up space
   * @private
   */
  async _cleanupOldData(eventUuid) {
    try {
      // Remove old scanned tickets first (they take most space)
      await this._cleanupOldScannedTickets();
      
      // Check cache age and remove if too old
      const lastSync = await this.getLastSync(eventUuid);
      if (lastSync && Date.now() - lastSync > this.CONFIG.CLEANUP_INTERVAL) {
        logger.log(`Cleaning up old cache for event ${eventUuid}`);
        // Keep stats but clear old ticket chunks if they exist
        const metadataKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_meta`;
        const metadata = await AsyncStorage.getItem(metadataKey);
        if (metadata) {
          const meta = JSON.parse(metadata);
          // Remove oldest chunks, keep recent ones
          const chunksToKeep = Math.min(5, meta.chunkCount); // Keep last 5 chunks
          for (let i = 0; i < meta.chunkCount - chunksToKeep; i++) {
            const chunkKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_chunk_${i}`;
            await AsyncStorage.removeItem(chunkKey);
          }
        }
      }
    } catch (error) {
      logger.error('Error in cleanup:', error);
    }
  }

  /**
   * Get storage size estimate for an event
   * @param {string} eventUuid 
   * @returns {Promise<number>} Size in bytes (approximate)
   */
  async getStorageSize(eventUuid) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const eventKeys = allKeys.filter(key => key.includes(eventUuid));
      
      let totalSize = 0;
      for (const key of eventKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length * 2; // Approximate: 2 bytes per char in UTF-16
        }
      }
      
      return totalSize;
    } catch (error) {
      logger.error('Error calculating storage size:', error);
      return 0;
    }
  }

  /**
   * Get ticket count for an event (without loading all data)
   * @param {string} eventUuid 
   * @returns {Promise<number>}
   */
  async getTicketCount(eventUuid) {
    try {
      const metadataKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_meta`;
      const metadata = await AsyncStorage.getItem(metadataKey);
      
      if (metadata) {
        const meta = JSON.parse(metadata);
        return meta.totalCount || 0;
      }
      
      // Fallback: check single item
      const key = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.tickets?.length || 0;
      }
      
      return 0;
    } catch (error) {
      logger.error('Error getting ticket count:', error);
      return 0;
    }
  }

  /**
   * Check if cached data is still valid (within configured duration)
   * @param {number} timestamp 
   * @returns {boolean}
   */
  isCacheValid(timestamp) {
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CONFIG.CACHE_DURATION;
  }

  /**
   * Get all event UUIDs that have cached data
   * @returns {Promise<Array<string>>}
   */
  async getCachedEvents() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const eventUuids = new Set();
      
      allKeys.forEach(key => {
        // Extract event UUID from keys
        const match = key.match(/_([a-f0-9-]{36})/);
        if (match) {
          eventUuids.add(match[1]);
        }
      });
      
      return Array.from(eventUuids);
    } catch (error) {
      logger.error('Error getting cached events:', error);
      return [];
    }
  }

  /**
   * Save order details for offline access
   * @param {string} orderNumber 
   * @param {string} eventUuid 
   * @param {Array} orderDetails 
   */
  async saveOrderDetails(orderNumber, eventUuid, orderDetails) {
    try {
      const key = `${this.STORAGE_KEYS.ORDER_DETAILS}_${eventUuid}_${orderNumber}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        orderDetails,
        timestamp: Date.now(),
      }));
      logger.log(`Saved order details for order ${orderNumber}`);
    } catch (error) {
      logger.error('Error saving order details:', error);
    }
  }

  /**
   * Get cached order details
   * @param {string} orderNumber 
   * @param {string} eventUuid 
   * @returns {Promise<Array|null>}
   */
  /**
   * Clear cached order details for a specific order
   * @param {string} orderNumber 
   * @param {string} eventUuid 
   */
  async clearOrderDetails(orderNumber, eventUuid) {
    try {
      const key = `${this.STORAGE_KEYS.ORDER_DETAILS}_${eventUuid}_${orderNumber}`;
      await AsyncStorage.removeItem(key);
      logger.log(`Cleared order details cache for order ${orderNumber}`);
    } catch (error) {
      logger.error('Error clearing order details:', error);
    }
  }

  async getOrderDetails(orderNumber, eventUuid) {
    try {
      const key = `${this.STORAGE_KEYS.ORDER_DETAILS}_${eventUuid}_${orderNumber}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.orderDetails;
      }
      return null;
    } catch (error) {
      logger.error('Error getting order details:', error);
      return null;
    }
  }

  /**
   * Cleanup all old data across all events
   * @returns {Promise<number>} Number of items cleaned
   */
  async cleanupAllOldData() {
    try {
      const events = await this.getCachedEvents();
      let cleanedCount = 0;
      
      for (const eventUuid of events) {
        const lastSync = await this.getLastSync(eventUuid);
        if (lastSync && Date.now() - lastSync > this.CONFIG.CLEANUP_INTERVAL) {
          await this._cleanupOldData(eventUuid);
          cleanedCount++;
        }
      }
      
      logger.log(`Cleaned up old data for ${cleanedCount} events`);
      return cleanedCount;
    } catch (error) {
      logger.error('Error in global cleanup:', error);
      return 0;
    }
  }

  /**
   * Update a single ticket in the cached tickets list
   * @param {string} eventUuid 
   * @param {string} ticketCode - Ticket code to find the ticket
   * @param {Object} updates - Fields to update
   */
  async updateTicketInCache(eventUuid, ticketCode, updates) {
    try {
      // Check if data is chunked
      const metadataKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_meta`;
      const metadata = await AsyncStorage.getItem(metadataKey);
      
      if (metadata) {
        // Data is chunked - need to find and update in chunks
        const meta = JSON.parse(metadata);
        let ticketFound = false;
        
        for (let i = 0; i < meta.chunkCount; i++) {
          const chunkKey = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}_chunk_${i}`;
          const chunkData = await AsyncStorage.getItem(chunkKey);
          
          if (chunkData) {
            const parsed = JSON.parse(chunkData);
            const ticketIndex = parsed.tickets.findIndex(t => t.code === ticketCode);
            
            if (ticketIndex !== -1) {
              // Update the ticket
              parsed.tickets[ticketIndex] = {
                ...parsed.tickets[ticketIndex],
                ...updates,
              };
              await AsyncStorage.setItem(chunkKey, JSON.stringify(parsed));
              ticketFound = true;
              logger.log(`Updated ticket ${ticketCode} in chunk ${i}`);
              break;
            }
          }
        }
        
        if (!ticketFound) {
          logger.warn(`Ticket ${ticketCode} not found in cached chunks`);
        }
      } else {
        // Single item storage
        const key = `${this.STORAGE_KEYS.TICKETS}_${eventUuid}`;
        const data = await AsyncStorage.getItem(key);
        
        if (data) {
          const parsed = JSON.parse(data);
          const tickets = parsed.tickets || [];
          const ticketIndex = tickets.findIndex(t => t.code === ticketCode);
          
          if (ticketIndex !== -1) {
            // Update the ticket
            tickets[ticketIndex] = {
              ...tickets[ticketIndex],
              ...updates,
            };
            await AsyncStorage.setItem(key, JSON.stringify({
              ...parsed,
              tickets,
            }));
            logger.log(`Updated ticket ${ticketCode} in cached tickets list`);
          } else {
            logger.warn(`Ticket ${ticketCode} not found in cached tickets`);
          }
        }
      }
    } catch (error) {
      logger.error('Error updating ticket in cache:', error);
    }
  }
}

export const offlineStorage = new OfflineStorageService();
export default offlineStorage;


