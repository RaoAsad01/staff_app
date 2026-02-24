import React from 'react';
import { View, StyleSheet } from 'react-native';
import SvgIcons from '../../../components/SvgIcons';
import { color } from '../../../color/color';
import Typography from '../../../components/Typography';
import { TicketStatBox, MiniStatCard } from '../../../constants/ticketStatBox';

const AdminCouponsCard = () => {
    return (
        <View style={styles.card}>
            <Typography
                style={styles.cardTitle}
                weight="700"
                size={13}
                color={color.placeholderTxt_24282C}
            >
                Coupons
            </Typography>

            <TicketStatBox
                icon={<SvgIcons.couponIcon width={32} height={32} />}
                label="Total Issued"
                count="102"
                grossAmount="GHS 100,000.00"
                netAmount="GHS 95,000.00"
            />

            <View style={styles.statRow}>
                <MiniStatCard
                    icon={<SvgIcons.totalActiveCoupon width={32} height={32} />}
                    label="Total Active"
                    count="05"
                    amount="GHS 50,000.00"
                />
                <MiniStatCard
                    icon={<SvgIcons.totalUsedCoupon width={32} height={32} />}
                    label="Total Used"
                    count="10"
                    amount="GHS 20,000.00"
                />
            </View>

            <View style={styles.statRow}>
                <MiniStatCard
                    icon={<SvgIcons.totalUnusedCoupon width={32} height={32} />}
                    label="Total Unused"
                    count="10"
                    amount="GHS 20,000.00"
                />
                <MiniStatCard
                    icon={<SvgIcons.ticketCanceled width={32} height={32} />}
                    label="Total Canceled"
                    count="102"
                    amount="GHS 20,000.00"
                />
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
        marginBottom: 40,
        overflow: 'visible',
    },
    cardTitle: {
        marginBottom: 16,
    },
    statRow: {
        flexDirection: 'row',
        gap: 12,
    },
});

export default AdminCouponsCard;