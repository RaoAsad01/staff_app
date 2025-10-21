import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { color } from '../../../color/color';
import SvgIcons from '../../../../components/SvgIcons';

const AdminOverallStatistics = ({ stats,
    onTotalTicketsPress,
    onTotalScannedPress,
    onTotalUnscannedPress,
    onAvailableTicketsPress
}) => {
    // Extract data from stats with default values
    const terminalStats = stats?.data?.overall_statistics || {};
    const scanAnalytics = stats?.data?.scan_analytics || {};

    const totalTicketsRaw = terminalStats?.total_tickets || 0;
    const totalScannedRaw = terminalStats?.total_scanned || 0;
    const totalUnscannedRaw = terminalStats?.total_unscanned || 0;
    const availableTicketsRaw = terminalStats?.available_tickets || 0;

    // Handle cases where values might be objects
    const totalTickets = typeof totalTicketsRaw === 'object' ? (totalTicketsRaw.total || totalTicketsRaw.count || 0) : totalTicketsRaw;
    const totalScanned = typeof totalScannedRaw === 'object' ? (totalScannedRaw.total || totalScannedRaw.count || 0) : totalScannedRaw;
    const totalUnscanned = typeof totalUnscannedRaw === 'object' ? (totalUnscannedRaw.total || totalUnscannedRaw.count || 0) : totalUnscannedRaw;
    const availableTickets = typeof availableTicketsRaw === 'object' ? (availableTicketsRaw.total || availableTicketsRaw.count || 0) : availableTicketsRaw;

    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                <Text style={styles.heading}>Tickets Statistics</Text>
                <View style={styles.row}>

                    <View style={styles.statContainer}>
                    <TouchableOpacity style={styles.statCard} onPress={onTotalTicketsPress}>
                        <View style={styles.statRow}>
                            <SvgIcons.totalTickets width={18} height={16} fill="white" />
                            <Text style={styles.statTitle}>Total Tickets</Text>
                        </View>
                        <Text style={styles.statValue}>{totalTickets}</Text>
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
                <View style={styles.row}>
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
                    <TouchableOpacity onPress={onAvailableTicketsPress}>
                            <View style={styles.statRow}>
                                <SvgIcons.totalTickets width={18} height={16} fill="white" />
                                <Text style={styles.statTitle}>Available Tickets</Text>
                            </View>
                            <Text style={styles.statValue}>{availableTickets}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
    },
    wrapper: {
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
        gap: 6,
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
        marginBottom: 5,

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

export default AdminOverallStatistics;
