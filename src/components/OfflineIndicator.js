import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { color } from '../color/color';

/**
 * Offline Indicator Component
 * Shows when device is offline and queue status
 */
const OfflineIndicator = () => {
  const { isOnline, queueSize, isSyncing } = useOfflineSync();

  if (isOnline && queueSize === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isOnline ? (
        <Text style={styles.text}>
          ⚠️ Offline Mode - {queueSize} action{queueSize !== 1 ? 's' : ''} queued
        </Text>
      ) : isSyncing ? (
        <Text style={[styles.text, styles.syncing]}>
          🔄 Syncing...
        </Text>
      ) : queueSize > 0 ? (
        <Text style={[styles.text, styles.syncing]}>
          ✅ Online - {queueSize} action{queueSize !== 1 ? 's' : ''} syncing
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.btnBrown_AE6F28,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: color.white_FFFFFF,
    fontSize: 12,
    fontWeight: '500',
  },
  syncing: {
    backgroundColor: '#4BB543',
  },
});

export default OfflineIndicator;

