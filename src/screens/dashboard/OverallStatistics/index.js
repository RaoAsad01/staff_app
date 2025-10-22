import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { color } from '../../../color/color';
import SvgIcons from '../../../../components/SvgIcons';

const OverallStatistics = ({ stats,
    onTotalTicketsPress,
    onTotalScannedPress,
    onTotalUnscannedPress,
    onAvailableTicketsPress,
    showHeading = true
}) => {
    // Extract data from stats with default values
    // Try both possible paths for terminal statistics
    const terminalStatsFromTerminal = stats?.data?.terminal_statistics || {};
    const terminalStatsFromOverall = stats?.data?.overall_statistics || {};
    const terminalStats = Object.keys(terminalStatsFromTerminal).length > 0 ? terminalStatsFromTerminal : terminalStatsFromOverall;
    const scanAnalytics = stats?.data?.scan_analytics || {};
    
    console.log('OverallStatistics - Terminal Stats from terminal_statistics:', JSON.stringify(terminalStatsFromTerminal, null, 2));
    console.log('OverallStatistics - Terminal Stats from overall_statistics:', JSON.stringify(terminalStatsFromOverall, null, 2));
    console.log('OverallStatistics - Final terminalStats:', JSON.stringify(terminalStats, null, 2));

    // Debug: Check if data exists at different paths
    console.log('OverallStatistics - Stats Data Keys:', Object.keys(stats?.data || {}));
    console.log('OverallStatistics - Direct terminal_statistics access:', stats?.data?.terminal_statistics);
    console.log('OverallStatistics - Direct overall_statistics access:', stats?.data?.overall_statistics);

    // Extract values with multiple fallback paths
    const totalTicketsRaw = terminalStats?.total_tickets || 0;
    const totalScannedRaw = terminalStats?.total_scanned || 0;
    const totalUnscannedRaw = terminalStats?.total_unscanned || 0;
    const availableTicketsRaw = terminalStats?.available_tickets || 0;

    console.log('OverallStatistics - Raw Values:');
    console.log('  - totalTicketsRaw:', totalTicketsRaw);
    console.log('  - totalScannedRaw:', totalScannedRaw);
    console.log('  - availableTicketsRaw:', availableTicketsRaw);

    // Handle cases where values might be objects or null/undefined
    const totalTickets = typeof totalTicketsRaw === 'object' && totalTicketsRaw !== null ? (totalTicketsRaw.total || totalTicketsRaw.count || 0) : (totalTicketsRaw || 0);
    const totalScanned = typeof totalScannedRaw === 'object' && totalScannedRaw !== null ? (totalScannedRaw.total || totalScannedRaw.count || 0) : (totalScannedRaw || 0);
    const totalUnscanned = typeof totalUnscannedRaw === 'object' && totalUnscannedRaw !== null ? (totalUnscannedRaw.total || totalUnscannedRaw.count || 0) : (totalUnscannedRaw || 0);
    const availableTickets = typeof availableTicketsRaw === 'object' && availableTicketsRaw !== null ? (availableTicketsRaw.total || availableTicketsRaw.count || 0) : (availableTicketsRaw || 0);

    console.log('OverallStatistics - Final Processed Values:');
    console.log('  - totalTickets:', totalTickets);
    console.log('  - totalScanned:', totalScanned);
    console.log('  - availableTickets:', availableTickets);

    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                {showHeading && <Text style={styles.heading}>Terminal Statistics</Text>}
                <View style={styles.row}>

                    <View style={styles.statContainer}>
                        <TouchableOpacity onPress={onAvailableTicketsPress}>
                            <View style={styles.statRow}>
                                <SvgIcons.totalTickets width={18} height={16} fill="white" />
                                <Text style={styles.statTitle}>Available Tickets</Text>
                            </View>
                            <Text style={styles.statValue}>{availableTickets}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statContainer}>
                        <TouchableOpacity style={styles.statCard} onPress={onTotalScannedPress}>
                            <View style={styles.statRow}>
                                <SvgIcons.totalTickets width={18} height={16} fill="white" />
                                <Text style={styles.statTitle}>Total Scanned</Text>
                            </View>
                            <Text style={styles.statValue}>{totalScanned}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* <View style={styles.row}>
                    <View style={styles.statContainer}>
                    <TouchableOpacity style={styles.statCard} onPress={onTotalUnscannedPress}>
                        <View style={styles.statRow}>
                            <SvgIcons.totalTickets width={18} height={16} fill="white" />
                            <Text style={styles.statTitle}>Total Unscanned</Text>
                        </View>
                        <Text style={styles.statValue}>{totalUnscanned}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statContainer}>
                    <TouchableOpacity style={styles.statCard} onPress={onAvailableTicketsPress}>
                        <View style={styles.statRow}>
                            <SvgIcons.totalTickets width={18} height={16} fill="white" />
                            <Text style={styles.statTitle}>Total Tickets</Text>
                        </View>
                        <Text style={styles.statValue}>{totalTickets}</Text>
                        </TouchableOpacity>
                    </View>
                </View> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
    },
    wrapper: {
        marginVertical: 16,
        padding: 16,
        paddingHorizontal: 15,
        backgroundColor: color.white_FFFFFF,
        borderColor: color.white_FFFFFF,
        borderRadius: 16,
        marginBottom: 5,
        borderWidth: 1,
    },
    heading: {
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'left',
        color: color.placeholderTxt_24282C,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 6,

    },
    statContainer: {
        height: 76,
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 3,
        backgroundColor: color.white_FFFFFF,
        borderColor: color.brown_CEBCA04D,
        borderWidth: 1,

    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: 6,
    },
    statTitle: {
        fontSize: 12,
        color: color.placeholderTxt_24282C,
        fontWeight: 400
    },
    statValue: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 6,
        color: color.brown_3C200A,
        marginLeft: 22
    },
});

export default OverallStatistics;
