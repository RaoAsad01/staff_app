import { useEffect, useState } from 'react';
import { networkService } from '../utils/network';
import { syncService } from '../utils/syncService';
import { offlineQueue } from '../utils/offlineQueue';
import { logger } from '../utils/logger';

/**
 * Hook for managing offline sync
 * Automatically syncs queued actions when device comes back online
 */
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(networkService.isConnected());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Listen for network status changes
    const unsubscribeNetwork = networkService.addListener((online) => {
      setIsOnline(online);
      
      // When coming back online, trigger sync
      if (online) {
        logger.log('Device came back online, starting sync...');
        triggerSync();
      }
    });

    // Check initial queue size
    updateQueueSize();

    // Periodically check queue size
    const queueInterval = setInterval(updateQueueSize, 5000);

    return () => {
      unsubscribeNetwork();
      clearInterval(queueInterval);
    };
  }, []);

  const updateQueueSize = async () => {
    const size = await offlineQueue.getQueueSize();
    setQueueSize(size);
  };

  const triggerSync = async () => {
    if (isSyncing || !isOnline) {
      return;
    }

    setIsSyncing(true);
    setSyncProgress(null);

    try {
      const result = await syncService.sync((progress) => {
        setSyncProgress(progress);
      });

      if (result.success) {
        logger.log(`Sync completed: ${result.synced} synced, ${result.failed} failed`);
        await updateQueueSize();
      }
    } catch (error) {
      logger.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  return {
    isOnline,
    isSyncing,
    syncProgress,
    queueSize,
    triggerSync,
  };
};

export default useOfflineSync;
