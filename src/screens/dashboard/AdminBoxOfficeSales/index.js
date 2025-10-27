import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from "react-native-svg";
import { color } from '../../../color/color';
import Typography, { Body1, Heading5 } from '../../../components/Typography';
import { formatValue } from '../../../constants/formatValue';

const AdminBoxOfficeSales = ({ stats }) => {
  // Log the raw stats data received from backend
  console.log('================================================');
  console.log('📊 AdminBoxOfficeSales - Raw Stats Data:', JSON.stringify(stats, null, 2));
  console.log('📊 AdminBoxOfficeSales - Box Office Sales Data:', JSON.stringify(stats?.data?.box_office_sales, null, 2));
  console.log('📊 AdminBoxOfficeSales - By Payment Methods:', JSON.stringify(stats?.data?.box_office_sales?.by_payment_methods, null, 2));
  console.log('================================================');

  const boxOfficeSalesData = stats?.data?.box_office_sales || {};
  const byPaymentMethods = boxOfficeSalesData?.by_payment_methods || {};
  const total = boxOfficeSalesData?.total || 0;

  // Map payment methods to colors (same as BoxOfficeSales)
  const paymentMethodColors = {
    "Cash": "#AE6F28",
    "Card": "#87807C",
    "Mobile Money": "#EDB58A",
    "Bank Transfer": "#CEBCA0",
    "Wallet": "#F4A261",
    "P.O.S.": "#945F22",
    "Free": "#2A9D8F",
    "MoMo": "#EDB58A",
  };

  // Transform the data into the required format for pie chart
  const values = Object.keys(byPaymentMethods).length > 0
    ? Object.entries(byPaymentMethods)
      .filter(([key, value]) => {
        // Filter out unwanted payment methods
        const lowerKey = key.toLowerCase();
        return !['wallet', 'bank_transfer', 'free'].includes(lowerKey);
      })
      .map(([key, value], index) => {
        const label = key === 'mobile_money' ? 'MoMo' :
          key === 'pos' ? 'P.O.S.' :
            key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter

        return {
          label: label,
          value: parseFloat(value) || 0,
          color: paymentMethodColors[label] || "#87807C" // Fallback color
        };
      })
    : [
      {
        label: "No Data",
        value: 0,
        color: "#87807C"
      }
    ];

  const paymentOrder = ["Cash", "Card", "MoMo", "P.O.S."];
  const sortedValues = paymentOrder
    .map(type => values.find(v => v.label === type))
    .filter(Boolean);

  const totalValue = values.reduce((sum, item) => sum + item.value, 0);
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 15;
  const totalGap = gapSize * sortedValues.length;

  // Calculate segments for the circle with visible gaps and no overlap
  const calculateSegments = () => {
    let currentOffset = 0;
    return sortedValues.map((item) => {
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
        <Text style={styles.heading}>Box Office Sales</Text>
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
            {sortedValues.map((item, index) => (
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
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 10,
    color: color.placeholderTxt_24282C,
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
    marginRight: 5
  },
  paymentLabel: {
    paddingLeft: 8,
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

export default AdminBoxOfficeSales; 
