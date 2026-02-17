import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { color } from '../../../color/color';

const CircularProgress = ({ value, total, size = 40 }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const radius = (size / 2) - 3;
    const strokeWidth = 3;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;
    const viewBox = `0 0 ${size} ${size}`;
    const center = size / 2;
    const fontSize = size <= 40 ? 9 : 11;

    return (
        <Svg width={size} height={size} viewBox={viewBox}>
            <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#E0E0E0"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={color.btnBrown_AE6F28}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${circumference - progress}`}
                strokeLinecap="round"
            />
            <SvgText
                x={center}
                y={center + fontSize / 3}
                textAnchor="middle"
                fontSize={fontSize}
                fill={color.placeholderTxt_24282C}
                fontWeight="500"
            >
                {`${percentage}%`}
            </SvgText>
        </Svg>
    );
};

const AdminOverallStatistics = ({ stats,
    onTotalTicketsPress,
    onTotalScannedPress,
    onTotalUnscannedPress,
    onAvailableTicketsPress
}) => {
    const terminalStats = stats?.data?.overall_statistics || {};

    const totalTicketsRaw = terminalStats?.total_tickets || 0;
    const totalScannedRaw = terminalStats?.total_scanned || 0;
    const totalUnscannedRaw = terminalStats?.total_unscanned || 0;
    const availableTicketsRaw = terminalStats?.available_tickets || 0;

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
                        <TouchableOpacity style={styles.statContent} onPress={onTotalTicketsPress}>
                            <CircularProgress value={totalTickets} total={totalTickets} size={40} />
                            <View style={styles.statTextContainer}>
                                <Text style={styles.statTitle} numberOfLines={1}>Total Tickets</Text>
                                <Text style={styles.statValue}>{totalTickets}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statContainer}>
                        <TouchableOpacity style={styles.statContent} onPress={onTotalScannedPress}>
                            <CircularProgress value={totalScanned} total={totalTickets} size={40} />
                            <View style={styles.statTextContainer}>
                                <Text style={styles.statTitle} numberOfLines={1}>Total Scanned</Text>
                                <Text style={styles.statValue}>{totalScanned}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.statContainer}>
                        <TouchableOpacity style={styles.statContent} onPress={onTotalUnscannedPress}>
                            <CircularProgress value={totalUnscanned} total={totalTickets} size={40} />
                            <View style={styles.statTextContainer}>
                                <Text style={styles.statTitle} numberOfLines={1}>Total Unscanned</Text>
                                <Text style={styles.statValue}>{totalUnscanned}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statContainer}>
                        <TouchableOpacity style={styles.statContent} onPress={onAvailableTicketsPress}>
                            <CircularProgress value={availableTickets} total={totalTickets} size={40} />
                            <View style={styles.statTextContainer}>
                                <Text style={styles.statTitle} numberOfLines={1}>Available Tickets</Text>
                                <Text style={styles.statValue}>{availableTickets}</Text>
                            </View>
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
    statContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statTextContainer: {
        flex: 1,
    },
    statTitle: {
        fontSize: 11,
        color: color.placeholderTxt_24282C,
        fontWeight: '400',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
        color: color.brown_3C200A,
    },
});

export default AdminOverallStatistics;