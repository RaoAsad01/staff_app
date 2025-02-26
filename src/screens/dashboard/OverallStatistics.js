import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { color } from '../../color/color';
import SvgIcons from '../../../components/SvgIcons';

const OverallStatistics = () => {
    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                <Text style={styles.heading}>Overall Statistics</Text>
                <View style={styles.row}>
                    <View style={styles.statContainer}>
                        <View style={styles.statRow}>
                            <SvgIcons.totalTickets width={18} height={16} fill="white" />
                            <Text style={styles.statTitle}>Total Tickets</Text>
                        </View>
                        <Text style={styles.statValue}>545</Text>
                    </View>

                    <View style={styles.statContainer}>
                        <View style={styles.statRow}>
                            <SvgIcons.totalTickets width={18} height={16} fill="white" />
                            <Text style={styles.statTitle}>Total Scanned</Text>
                        </View>
                        <Text style={styles.statValue}>345</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.statContainer}>
                        <View style={styles.statRow}>
                            <SvgIcons.totalTickets width={18} height={16} fill="white" />
                            <Text style={styles.statTitle}>Total Unscanned</Text>
                        </View>
                        <Text style={styles.statValue}>200</Text>
                    </View>

                    <View style={styles.statContainer}>
                        <View style={styles.statRow}>
                            <SvgIcons.totalTickets width={18} height={16} fill="white" />
                            <Text style={styles.statTitle}>Available Tickets</Text>
                        </View>
                        <Text style={styles.statValue}>80</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10
    },
    wrapper: {
        marginTop: 20,
        padding: 16,
        paddingHorizontal: 15,
        backgroundColor: color.white_FFFFFF,
        borderColor: color.white_FFFFFF,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        margin: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    heading: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'left',
        color: color.black_2F251D,
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
        color: color.black_544B45,
        fontWeight: 400
    },
    statValue: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 6,
        color: color.brown_3C200A,
        marginLeft: 22
    },
});

export default OverallStatistics;
