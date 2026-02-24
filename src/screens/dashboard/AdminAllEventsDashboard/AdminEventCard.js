import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { color } from '../../../color/color';
import Typography from '../../../components/Typography';

const DonutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const size = 140;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const gapAngle = 15;

    const totalGapAngle = gapAngle * data.length;
    const availableAngle = 360 - totalGapAngle;

    let currentAngle = -90 + gapAngle / 2;

    return (
        <View style={styles.donutContainer}>
            <Svg width={size} height={size}>
                {data.map((item, index) => {
                    const percentage = item.value / total;
                    const segmentAngle = percentage * availableAngle;
                    const segmentLength = (segmentAngle / 360) * circumference;
                    const gapLength = circumference - segmentLength;

                    const rotation = currentAngle;
                    currentAngle += segmentAngle + gapAngle;

                    return (
                        <Circle
                            key={index}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={`${segmentLength} ${gapLength}`}
                            strokeLinecap="round"
                            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                        />
                    );
                })}
            </Svg>
            <View style={styles.donutCenter}>
                <Typography weight="700" size={24} color={color.black_2F251D}>
                    {total}
                </Typography>
                <Typography weight="400" size={12} color={color.grey_87807C}>
                    Total
                </Typography>
            </View>
        </View>
    );
};

const AdminEventCard = () => {
    const eventData = [
        { label: 'Today', value: 12, color: color.btnBrown_AE6F28 },
        { label: 'Upcoming', value: 9, color: color.brown_D58E00 },
        { label: 'Past', value: 8, color: color.grey_87807C },
    ];

    return (
        <View style={styles.card}>
            <Typography
                style={styles.cardTitle}
                weight="700"
                size={13}
                color={color.placeholderTxt_24282C}
            >
                Event
            </Typography>
            <View style={styles.eventContent}>
                <DonutChart data={eventData} />
                <View style={styles.eventLegend}>
                    {eventData.map((item, index) => (
                        <View key={index} style={styles.eventLegendItem}>
                            <View style={[styles.eventLegendDot, { backgroundColor: item.color }]} />
                            <Typography
                                style={styles.eventLegendLabel}
                                weight="500"
                                size={14}
                                color={color.placeholderTxt_24282C}
                            >
                                {item.label}
                            </Typography>
                            <Typography weight="400" size={14} color={color.black_544B45}>
                                {item.value.toString().padStart(2, '0')}
                            </Typography>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: color.white_FFFFFF,
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    cardTitle: {
        marginBottom: 16,
    },
    eventContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    donutContainer: {
        position: 'relative',
        width: 140,
        height: 140,
    },
    donutCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventLegend: {
        flex: 1,
        gap: 16,
    },
    eventLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    eventLegendDot: {
        width: 12,
        height: 12,
        borderRadius: 4,
    },
    eventLegendLabel: {
        flex: 1,
        fontSize: 16,
    },
});

export default AdminEventCard;