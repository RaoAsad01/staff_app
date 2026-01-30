import NetInfo from '@react-native-community/netinfo';
import { logger } from './logger';

/**
 * Check if device is currently online
 * @returns {Promise<boolean>}
 */
export const isOnline = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    logger.error('Error checking network status:', error);
    return false;
  }
};

/**
 * Get current network state
 * @returns {Promise<Object>}
 */
export const getNetworkState = async () => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    };
  } catch (error) {
    logger.error('Error getting network state:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
    };
  }
};

/**
 * Subscribe to network state changes
 * @param {Function} callback - Callback function that receives network state
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNetworkChanges = (callback) => {
  return NetInfo.addEventListener((state) => {
    const isOnline = state.isConnected && state.isInternetReachable;
    callback({
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      isOnline,
      type: state.type,
    });
  });
};

