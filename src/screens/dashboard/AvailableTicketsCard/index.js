import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { color } from "../../../color/color";
import SvgIcons from "../../../../components/SvgIcons";
import { useNavigation } from '@react-navigation/native';

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

const AvailableTicketsCard = ({ data, stats }) => {
  const [expanded, setExpanded] = useState({});
  const listData = data && data.length > 0 ? data : [];
  const navigation = useNavigation();

  const toggle = (label) => {
    setExpanded((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleSubItemPress = (subItemLabel, parentLabel) => {
    console.log('AvailableTicketsCard - Subitem clicked:', subItemLabel, 'Parent:', parentLabel);

    // Dynamic tab mapping - use the parent label directly
    // The parent category should be the tab name in BoxOfficeTab
    let selectedTab = parentLabel;

    // Handle special cases where parent label might not match tab name exactly
    if (parentLabel === 'Available Tickets') {
      // For "Available Tickets", we need to find the actual category from the data
      if (stats?.data?.available_tickets) {
        const availableTickets = stats.data.available_tickets;
        // Find the first category that has this sub-item
        for (const [categoryName, categoryData] of Object.entries(availableTickets)) {
          if (categoryData && typeof categoryData === 'object') {
            // Check if this category contains the sub-item
            if (categoryData[subItemLabel] ||
              Object.keys(categoryData).some(key =>
                key.toLowerCase() === subItemLabel.toLowerCase()
              )) {
              selectedTab = categoryName;
              break;
            }
          }
        }
      }
    }

    console.log('AvailableTicketsCard - Mapped tab:', selectedTab);

    if (selectedTab && selectedTab !== 'Available Tickets') {
      navigation.navigate('Tickets', {
        screen: 'BoxOfficeTab',
        selectedTab: selectedTab
      });
    } else {
      console.warn('AvailableTicketsCard - No valid tab found for:', subItemLabel, 'Parent:', parentLabel);
    }
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
          onPress={() => {
            if (isSubItem) {
              // Navigate to BoxOfficeTab for subitems with dynamic mapping
              handleSubItemPress(item.label, item.parentLabel || 'Available Tickets');
            } else if (hasSubItems) {
              toggle(item.label);
            }
          }}
        >
          <CircularProgress value={item.checkedIn} total={item.total} percentage={item.percentage} />
          <View style={styles.textContainer}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>
              {item.total}
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
                {renderItem({ ...sub, parentLabel: item.label }, subIdx, true)}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Calculate total available tickets
  const totalAvailableTickets = listData.reduce((sum, item) => sum + (item.checkedIn || 0), 0);

  return (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Total Available Tickets</Text>
        <Text style={styles.headerValue}>{totalAvailableTickets}</Text>
      </View>
      {listData.map((item, idx) => renderItem(item, idx))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white_FFFFFF,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  headerContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '400',
    color: color.black_544B45,
  },
  headerValue: {
    fontSize: 14,
    fontWeight: '500',
    color: color.brown_3C200A,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    padding: 15,
  },
  subRow: {
    // No extra margin on right, just indent
    marginLeft: 0,
    backgroundColor: "transparent",
  },
  subRowBg: {
    backgroundColor: '#F7E4B660',
    borderRadius: 0,
    marginLeft: 0,
    marginRight: 0,
    marginVertical: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
    marginBottom: 2,
  },
  label: {
    fontSize: 15,
    color: color.black_544B45,
    fontWeight: "400",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: color.placeholderTxt_24282C,
  },
  chevronContainer: {
    padding: 8,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subitembg: {
    backgroundColor: '#F7E4B660',
  }
});

export default AvailableTicketsCard;