import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { color } from "../../../color/color";
import SvgIcons from "../../../../components/SvgIcons";

const CircularProgress = ({ value, total, percentage }) => {
  const radius = 20;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = percentage !== undefined ? percentage : (total > 0 ? (value / total) * 100 : 0);
  const progress = (progressPercentage / 100) * circumference;

  // Adjust font size and position based on percentage value
  const fontSize = progressPercentage >= 100 ? 9 : 11;
  const textY = progressPercentage >= 100 ? 27 : 28;

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
        stroke={color.btnBrown_AE6F28}
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

const ScanCategoriesDetails = ({ stats }) => {
  const [expanded, setExpanded] = useState({});
  const scanCategoriesData = stats?.data?.scan_categories?.ticket_wise || {};

  const toggle = (label) => {
    setExpanded((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const renderItem = (item, index, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expanded[item.label];

    return (
      <View key={item.label + index}>
        <TouchableOpacity
          style={[
            styles.row,
            isSubItem && styles.subRow
          ]}
          activeOpacity={hasSubItems ? 0.7 : 1}
          onPress={() => hasSubItems && toggle(item.label)}
        >
          <CircularProgress value={item.scanned} total={item.total} percentage={item.percentage} />
          <View style={styles.textContainer}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>
              {item.scanned} / {item.total}
            </Text>
          </View>
          {hasSubItems && (
            <View style={styles.chevronContainer}>
              {isExpanded ? (
                <SvgIcons.upArrow width={10} height={7} fill={color.black_544B45} />
              ) : (
                <SvgIcons.downArrow width={10} height={7} fill={color.black_544B45} />
              )}
            </View>
          )}
        </TouchableOpacity>
        {hasSubItems && isExpanded && (
          <View style={styles.subitembg}>
            {item.subItems.map((sub, subIdx) =>
              <View key={sub.label + subIdx} style={styles.subRowBg}>
                {renderItem(sub, subIdx, true)}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Transform the data into the required format
  const transformData = () => {
    const categories = Object.keys(scanCategoriesData);
    return categories.map(category => {
      const categoryData = scanCategoriesData[category];
      const totalTickets = categoryData.total_tickets || 0;
      const scannedTickets = categoryData.scanned_tickets || 0;
      
      // Create subItems from the ticket types
      const subItems = [];
      Object.keys(categoryData).forEach(key => {
        if (key !== 'total_tickets' && key !== 'scanned_tickets') {
          const ticketData = categoryData[key];
          const total = ticketData.total || 0;
          const scanned = ticketData.scanned || 0;
          
          subItems.push({
            label: key,
            scanned: scanned,
            total: total,
            percentage: total > 0 ? Math.round((scanned / total) * 100) : 0,
            subItems: []
          });
        }
      });

      return {
        label: category,
        scanned: scannedTickets,
        total: totalTickets,
        percentage: totalTickets > 0 ? Math.round((scannedTickets / totalTickets) * 100) : 0,
        subItems: subItems
      };
    });
  };

  const listData = transformData();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Scan Categories Details</Text>
      {listData.map((item, idx) => renderItem(item, idx))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white_FFFFFF,
    borderRadius: 12,
    marginVertical: 16,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: color.black_2F251D,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingVertical: 8,
    padding: 15,
  },
  subRow: {
    marginLeft: 0,
    backgroundColor: "transparent",
  },
  subRowBg: {
    backgroundColor: color.background_FAF9F6,
    borderRadius: 8,
    marginLeft: 0,
    marginRight: 0,
    marginVertical: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  textContainer: {
    marginLeft: 20,
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    color: color.black_544B45,
    fontWeight: "400",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: color.brown_3C200A,
    marginTop: 2,
  },
  chevronContainer: {
    padding: 8,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subitembg: {
    backgroundColor: color.brown_F7E4B6,
  }
});

export default ScanCategoriesDetails; 