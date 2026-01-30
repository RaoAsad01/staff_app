import { logger } from './logger';

/**
 * Network utility to check connectivity and handle offline scenarios
 */
class NetworkService {
  constructor() {
    this.isOnline = true;
    this.listeners = [];
  }

  /**
   * Check if device is online
   * @returns {boolean}
   */
  isConnected() {
    return this.isOnline;
  }

  /**
   * Set online status
   * @param {boolean} status 
   */
  setOnlineStatus(status) {
    const wasOnline = this.isOnline;
    this.isOnline = status;
    
    if (wasOnline !== status) {
      logger.log(`Network status changed: ${status ? 'ONLINE' : 'OFFLINE'}`);
      this.notifyListeners(status);
    }
  }

  /**
   * Check network status by attempting a simple request
   * @returns {Promise<boolean>}
   */
  async checkConnectivity() {
    try {
      // Simple connectivity check - if axios request fails with network error, we're offline
      // This will be set by axios interceptor
      return this.isOnline;
    } catch (error) {
      this.setOnlineStatus(false);
      return false;
    }
  }

  /**
   * Add listener for network status changes
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of network status change
   * @param {boolean} isOnline 
   */
  notifyListeners(isOnline) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        logger.error('Error in network listener:', error);
      }
    });
  }

  /**
   * Check if error is a network error
   * @param {Error} error 
   * @returns {boolean}
   */
  isNetworkError(error) {
    if (!error) return false;
    
    // Check for network error messages
    const networkErrorMessages = [
      'Network Error',
      'network error',
      'Network request failed',
      'Failed to fetch',
      'timeout',
      'ECONNABORTED',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NETWORK_CHANGED'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const isNetworkError = networkErrorMessages.some(msg => 
      errorMessage.includes(msg.toLowerCase())
    );

    // Also check if there's no response (offline)
    const noResponse = !error.response && error.request;

    return isNetworkError || noResponse;
  }
}

export const networkService = new NetworkService();
export default networkService;

