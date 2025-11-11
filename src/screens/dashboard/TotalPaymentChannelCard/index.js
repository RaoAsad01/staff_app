import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import { color } from '../../../color/color';
import { formatValue } from '../../../constants/formatValue';
import SvgIcons from '../../../../components/SvgIcons';
import { formatValueWithPad } from '../../../constants/formatValue';

// CircularProgress component matching the exact design from CheckInSolidTicketsCard
const CircularProgress = ({ value, total, percentage, color = color.btnBrown_AE6F28 }) => {
  const radius = 20;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = percentage !== undefined ? percentage : (total > 0 ? (value / total) * 100 : 0);
  const progress = (progressPercentage / 100) * circumference;

  // Adjust font size and position based on percentage value
  const fontSize = progressPercentage >= 50 ? 9 : 11;
  const textY = progressPercentage >= 50 ? 27 : 28;

  return (
    <Svg width={60} height={60} viewBox="0 0 50 50">
      <Circle
        cx="25"
        cy="25"
        r={radius}
        stroke="#E0E0E0"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx="25"
        cy="25"
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={`${circumference - progress}`}
        strokeLinecap="round"
      />
      <SvgText
        x="25"
        y={textY}
        textAnchor="middle"
        fontSize={fontSize}
        fill={color.placeholderTxt_24282C}
        fontWeight="500"
      >
        {`${Math.round(progressPercentage)}%`}
      </SvgText>
    </Svg>
  );
};

const TotalPaymentChannelCard = ({ stats, onPaymentChannelPress, activePaymentChannel }) => {
  // Comprehensive logging for debugging
  console.log('💳 TotalPaymentChannelCard - Full stats:', JSON.stringify(stats, null, 2));
  console.log('💳 TotalPaymentChannelCard - stats.data keys:', Object.keys(stats?.data || {}));
  console.log('💳 TotalPaymentChannelCard - box_office_sales:', stats?.data?.box_office_sales);
  console.log('💳 TotalPaymentChannelCard - payment_channels (root):', stats?.data?.payment_channels);
  console.log('💳 TotalPaymentChannelCard - payment_channel (root):', stats?.data?.payment_channel);

  // Get payment channel data from various possible locations
  const boxOfficeSalesData = stats?.data?.box_office_sales || {};
  const paymentChannel = boxOfficeSalesData?.payment_channels ||
    boxOfficeSalesData?.payment_channel ||
    stats?.data?.payment_channels ||
    stats?.data?.payment_channel ||
    {};

  // Get total amount from various possible locations
  const totalAmount = boxOfficeSalesData?.total_amount ||
    boxOfficeSalesData?.total ||
    stats?.data?.total_amount ||
    stats?.data?.total ||
    paymentChannel?.total ||
    0;

  console.log('💳 TotalPaymentChannelCard - Resolved Payment Channel Data:', paymentChannel);
  console.log('💳 TotalPaymentChannelCard - Resolved Total Amount:', totalAmount);
  console.log('💳 TotalPaymentChannelCard - Total Amount Sources:');
  console.log('  - boxOfficeSalesData?.total_amount:', boxOfficeSalesData?.total_amount);
  console.log('  - boxOfficeSalesData?.total:', boxOfficeSalesData?.total);
  console.log('  - stats?.data?.total_amount:', stats?.data?.total_amount);
  console.log('  - stats?.data?.total:', stats?.data?.total);
  console.log('  - paymentChannel?.total:', paymentChannel?.total);

  // Map payment methods to colors (matching the main payment channel component)
  const paymentMethodColors = {
    "Cash": "#AE6F28",
    "Card": "#87807C",
    "MoMo": "#EDB58A",
    "Mobile Money": "#EDB58A",
    "P.O.S.": "#945F22",
    "POS": "#945F22",
    "Wallet": "#F4A261",
    "Bank Transfer": "#CEBCA0",
    "Free": "#2A9D8F"
  };

  // Transform the data into the required format
  let paymentChannels = [];

  if (Object.keys(paymentChannel).length > 0) {
    paymentChannels = Object.entries(paymentChannel)
      .filter(([key, value]) => {
        const lowerKey = key.toLowerCase();
        const shouldExclude = ['wallet', 'bank_transfer', 'free', 'total'].includes(lowerKey);
        const hasValue = parseFloat(value) > 0;
        return !shouldExclude && hasValue;
      })
      .map(([key, value]) => {
        const label = key === 'mobile_money' ? 'MoMo' :
          key === 'pos' ? 'P.O.S.' :
            key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');

        return {
          label: label,
          value: parseFloat(value) || 0,
          color: paymentMethodColors[label] || "#87807C",
          percentage: totalAmount > 0 ? Math.round((parseFloat(value) / totalAmount) * 100) : 0
        };
      });
  }

  // Sort in desired order
  const paymentOrder = ["Cash", "P.O.S.", "Card", "MoMo"];
  const sortedChannels = paymentOrder
    .map(type => paymentChannels.find(v => v.label === type))
    .filter(Boolean);

  const remainingChannels = paymentChannels.filter(v => !paymentOrder.includes(v.label));
  const allChannels = [...sortedChannels, ...remainingChannels];

  console.log('💳 TotalPaymentChannelCard - Final allChannels:', allChannels);
  console.log('💳 TotalPaymentChannelCard - allChannels length:', allChannels.length);


  return (
    <View>
      <View style={styles.card}>
        {/* Header with Total Amount and Bar Chart Icon */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLabel}>Total Amount</Text>
            <Text style={styles.headerValue}>GHS {formatValue(totalAmount)}</Text>
          </View>

        </View>

        {/* Payment Channels List - matching CheckInSolidTicketsCard structure */}
        {allChannels.length > 0 ? (
          allChannels.map((channel, index) => (
            <TouchableOpacity
              key={index}
              style={styles.row}
              onPress={() => onPaymentChannelPress && onPaymentChannelPress(channel.label)}
              activeOpacity={0.7}
            >
              <CircularProgress
                value={channel.value}
                total={totalAmount}
                percentage={channel.percentage}
                color={channel.color}
              />
              <View style={styles.textContainer}>
                <Text style={styles.label}>{channel.label}</Text>
                <View style={styles.valueContainer}>
                  <View style={styles.valueResultContainer}>
                    <Text style={styles.valueResult}>GHS {formatValueWithPad(channel.value)}</Text>
                  </View>
                  <View style={styles.separatorLine} />
                  <View style={styles.valueTotalContainer}>
                    <Text style={styles.valueTotal}>GHS {formatValueWithPad(totalAmount)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.dropdownButton}>
                {activePaymentChannel === channel.label ? (
                  <SvgIcons.iconBarsActive width={24} height={24} fill={color.btnBrown_AE6F28} />
                ) : (
                  <SvgIcons.iconBarsInactive width={24} height={24} fill={color.black_544B45} />
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No payment channel data available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white_FFFFFF,
    padding: 15,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 6
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 4,
    color: color.black_544B45,
  },
  headerValue: {
    fontSize: 14,
    fontWeight: "500",
    color: color.brown_3C200A,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  textContainer: {
    marginBottom: 2,
    marginLeft: 16,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: color.black_544B45,
    fontWeight: "400",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  valueResultContainer: {
    minWidth: 24,
    alignItems: "flex-end",
  },
  separatorLine: {
    width: 1,
    height: 10,
    marginTop: 1,
    backgroundColor: color.black_544B45,
  },
  valueTotalContainer: {
    width: 120,
    alignItems: "flex-start",
  },
  dropdownButton: {
    paddingRight: 8,
  },
  valueResult: {
    fontSize: 14,
    fontWeight: "700",
    color: color.placeholderTxt_24282C,
  },
  valueTotal: {
    fontSize: 14,
    fontWeight: "400",
    color: color.black_544B45,
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 14,
    color: color.brown_766F6A,
    textAlign: "center",
  },
});

export default TotalPaymentChannelCard;
