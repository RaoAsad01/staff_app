import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { offlineDebug } from '../utils/offlineDebug';
import { color } from '../color/color';
import { logger } from '../utils/logger';

/**
 * Offline Debug Panel Component
 * Shows detailed offline sync status and allows testing
 */
const OfflineDebugPanel = ({ visible, onClose }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    if (visible) {
      loadStatus();
    }
  }, [visible]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const offlineStatus = await offlineDebug.getOfflineStatus();
      setStatus(offlineStatus);
    } catch (error) {
      logger.error('Error loading status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setLoading(true);
    try {
      const results = await offlineDebug.testOfflineFunctionality();
      setTestResults(results);
    } catch (error) {
      logger.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Offline Sync Status</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading && !status ? (
            <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
          ) : (
            <>
              {/* Network Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Network</Text>
                <Text style={styles.text}>
                  Status: {status?.network?.status || 'Unknown'}
                </Text>
              </View>

              {/* Queue Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Queue</Text>
                <Text style={styles.text}>
                  Size: {status?.queue?.size || 0} items
                </Text>
                {status?.queue?.breakdown && (
                  <View style={styles.breakdown}>
                    {Object.entries(status.queue.breakdown).map(([type, count]) => (
                      <Text key={type} style={styles.breakdownItem}>
                        {type}: {count}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Storage Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Storage</Text>
                <Text style={styles.text}>
                  Cached Events: {status?.storage?.cachedEvents || 0}
                </Text>
                {status?.storage?.events?.map((event, idx) => (
                  <View key={idx} style={styles.eventItem}>
                    <Text style={styles.eventText}>
                      Event: {event.eventUuid.substring(0, 8)}...
                    </Text>
                    <Text style={styles.eventText}>
                      Tickets: {event.ticketCount}
                    </Text>
                    <Text style={styles.eventText}>
                      Size: {event.storageSize}
                    </Text>
                    <Text style={styles.eventText}>
                      Last Sync: {event.lastSync}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Sync Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sync</Text>
                <Text style={styles.text}>
                  Status: {status?.sync?.status || 'Unknown'}
                </Text>
              </View>

              {/* Test Results */}
              {testResults && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Test Results</Text>
                  <Text style={styles.text}>
                    Network: {testResults.network ? '✅' : '❌'}
                  </Text>
                  <Text style={styles.text}>
                    Storage: {testResults.storage ? '✅' : '❌'}
                  </Text>
                  <Text style={styles.text}>
                    Queue: {testResults.queue ? '✅' : '❌'}
                  </Text>
                  <Text style={styles.text}>
                    Sync: {testResults.sync ? '✅' : '❌'}
                  </Text>
                  {testResults.errors?.length > 0 && (
                    <View style={styles.errors}>
                      {testResults.errors.map((error, idx) => (
                        <Text key={idx} style={styles.errorText}>
                          {error}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={loadStatus}
            style={[styles.button, styles.refreshButton]}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={runTests}
            style={[styles.button, styles.testButton]}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Run Tests</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    backgroundColor: color.white_FFFFFF,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.borderBrown_CEBCA0,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.black_544B45,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 20,
    color: color.black_544B45,
  },
  content: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: color.white_FFFFFF,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: color.borderBrown_CEBCA0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.btnBrown_AE6F28,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: color.black_544B45,
    marginBottom: 5,
  },
  breakdown: {
    marginTop: 10,
  },
  breakdownItem: {
    fontSize: 12,
    color: color.black_544B45,
    marginLeft: 10,
  },
  eventItem: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  eventText: {
    fontSize: 12,
    color: color.black_544B45,
    marginBottom: 3,
  },
  errors: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#c62828',
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: color.borderBrown_CEBCA0,
    paddingTop: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: color.btnBrown_AE6F28,
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: color.white_FFFFFF,
    fontWeight: 'bold',
  },
});

export default OfflineDebugPanel;

