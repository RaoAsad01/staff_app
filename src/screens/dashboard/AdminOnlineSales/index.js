import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from "react-native-svg";
import { color } from '../../../color/color';
import Typography, { Body1, Heading5 } from '../../../components/Typography';
import { formatValue } from '../../../constants/formatValue';

const AdminOnlineSales = ({ stats }) => {
  const onlineSalesData = stats?.data?.online_sales || {};
  const paymentWise = onlineSalesData?.payment_wise || {};
  const byTypes = paymentWise?.by_types || {};
  const total = paymentWise?.total || 0;

  // Map ticket types to colors
  const ticketTypeColors = {
    "Early Bird": "#945F22",
    "VIP Ticket": "#87807C",
    "Members": "#EDB58A",
    "Standard": "#AE6F28",
    "Premium": "#F4A261"
  };

  // Transform the data into the required format for pie chart
  const values = Object.keys(byTypes).length > 0
    ? Object.entries(byTypes).map(([key, value], index) => ({
      label: key,
      value: parseFloat(value) || 0,
      color: ticketTypeColors[key] || "#AE6F28" // Fallback color
    }))
    : [
      {
        label: "No Data",
        value: 0,
        color: "#AE6F28"
      }
    ];

  const totalValue = values.reduce((sum, item) => sum + item.value, 0);
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 15;
  const totalGap = gapSize * values.length;

  // Calculate segments for the circle with visible gaps and no overlap
  const calculateSegments = () => {
    let currentOffset = 0;
    return values.map((item) => {
      const percentage = totalValue > 0 ? item.value / totalValue : 0;
      // Distribute the circumference minus total gap among the arcs
      const dashLength = (circumference - totalGap) * percentage;
      const segment = {
        ...item,
        dashLength: dashLength > 0 ? dashLength : 0,
        dashOffset: currentOffset
      };
      currentOffset += dashLength + gapSize;
      return segment;
    });
  };

  const segments = calculateSegments();

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.heading}>Online Sales</Text>
        <View style={styles.row}>
          <View style={styles.chartContainer}>
            <Svg height="140" width="140" viewBox="0 0 120 120">
              <Circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#EFEFEF"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {segments.map((segment, index) => (
                <Circle
                  key={index}
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
                  strokeDashoffset={-segment.dashOffset}
                  strokeLinecap="round"
                />
              ))}
            </Svg>
            <View style={styles.centerText}>
              <Text style={styles.amountText}>GHS {formatValue(total)}</Text>
              <Text style={styles.totalText}>Total</Text>
            </View>
          </View>
          <View style={styles.paymentMethod}>
            {values.map((item, index) => (
              <View style={styles.paymentItem} key={index}>
                <View style={styles.colorBoxWrapper}>
                  <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                </View>
                <View style={styles.paymentLabel}>
                  <Text style={styles.paymentText}>{item.label}</Text>
                </View>
                <View style={styles.paymentValueWrapper}>
                  <Text style={styles.labelGHS}>GHS</Text>
                  <Text style={styles.paymentValue}>{formatValue(item.value)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8
  },
  wrapper: {
    backgroundColor: color.white_FFFFFF,
    borderColor: color.white_FFFFFF,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  heading: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: color.black_2F251D,
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginLeft: -8
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "500",
    color: color.drak_black_000000,
  },
  totalText: {
    fontSize: 13,
    fontWeight: "500",
    color: color.grey_6B7785,
    marginTop: 3
  },
  paymentMethod: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "50%",
    gap: 10,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 40,
  },
  colorBoxWrapper: {
    width: 5,
    alignItems: "center",
  },
  colorBox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 20
  },
  paymentLabel: {
    paddingLeft: 0,
    minWidth: 70,
  },
  paymentValueWrapper: {
    gap: 5,
    flexDirection: "row",
    paddingLeft: 20
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "500",
    color: color.placeholderTxt_24282C,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "400",
    color: color.black_544B45,
  },
  labelGHS: {
    fontSize: 14,
    fontWeight: "400",
    color: color.black_544B45,
  }
});

export default AdminOnlineSales; 
