import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { color } from '../color/color';
import Typography from '../components/Typography';

const DashedLine = () => (
    <Svg height="2" width="100%" style={{ flex: 1 }}>
        <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke={color.btnBrown_AE6F28}
            strokeWidth="1"
            strokeDasharray="8,6"
        />
    </Svg>
);

export const TicketStatBox = ({ icon, label, count, grossAmount, netAmount }) => {
    const [topSectionHeight, setTopSectionHeight] = useState(92);

    return (
        <View style={styles.ticketWrapper}>
            <View style={styles.ticketContainer}>
                <View
                    style={styles.ticketTopSection}
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        setTopSectionHeight(height);
                    }}
                >
                    <View style={styles.ticketHeader}>
                        <View style={styles.ticketIconCircle}>{icon}</View>
                        <View>
                            <Typography weight="400" size={12} color={color.grey_87807C}>
                                {label}
                            </Typography>
                            <Typography weight="700" size={14} color={color.brown_3C200A}>
                                Count: {count}
                            </Typography>
                        </View>
                    </View>
                </View>

                <View style={styles.ticketDividerContainer}>
                    <DashedLine />
                </View>

                <View style={styles.ticketBottomSection}>
                    <View style={styles.ticketAmountItem}>
                        <Typography weight="400" size={12} color={color.grey_87807C}>
                            Gross:
                        </Typography>
                        <Typography weight="700" size={16} color={color.black_2F251D}>
                            {grossAmount}
                        </Typography>
                    </View>
                    <View style={styles.ticketAmountItem}>
                        <Typography weight="400" size={12} color={color.grey_87807C}>
                            Net:
                        </Typography>
                        <Typography weight="700" size={16} color={color.black_2F251D}>
                            {netAmount}
                        </Typography>
                    </View>
                </View>
            </View>

            <View style={[styles.cutoutAbsolute, { left: -12, top: topSectionHeight - 12 }]} />
            <View style={[styles.cutoutAbsolute, { right: -12, top: topSectionHeight - 12 }]} />
        </View>
    );
};

export const MiniStatCard = ({ icon, label, count, amount }) => (
    <View style={styles.miniStatCard}>
        <View style={styles.miniStatIcon}>{icon}</View>
        <Typography
            style={styles.miniStatLabel}
            weight="500"
            size={10}
            color={color.grey_87807C}
        >
            {label}
        </Typography>
        <Typography
            style={styles.miniStatCount}
            weight="700"
            size={14}
            color={color.black_2F251D}
        >
            Count: {count}
        </Typography>
        <Typography weight="500" size={12} color={color.black_544B45}>
            {amount}
        </Typography>
    </View>
);

const styles = StyleSheet.create({
    ticketWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    ticketContainer: {
        backgroundColor: color.lightBrown_FFF6DF,
        borderRadius: 16,
    },
    ticketTopSection: {
        padding: 16,
        paddingBottom: 12,
    },
    ticketHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ticketIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: color.white_FFFFFF,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ticketDividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 2,
        paddingHorizontal: 24,
    },
    ticketBottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 12,
    },
    ticketAmountItem: {
        flex: 1,
    },
    cutoutAbsolute: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: color.white_FFFFFF,
    },
    miniStatCard: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    miniStatIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: color.white_FFFFFF,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    miniStatLabel: {
        fontSize: 12,
        color: color.brown_766F6A,
        marginBottom: 4,
        textAlign: 'center',
    },
    miniStatCount: {
        fontSize: 14,
        fontWeight: '700',
        color: color.black_2F251D,
        marginBottom: 2,
    },
});