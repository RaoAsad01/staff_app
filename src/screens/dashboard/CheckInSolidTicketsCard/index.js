import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { color } from "../../../color/color";
import { useNavigation } from "@react-navigation/native";
import SvgIcons from "../../../../components/SvgIcons";

const CircularProgress = ({ value, total, percentage }) => {
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

const CheckInSoldTicketsCard = ({ title, data, showRemaining, remainingTicketsData, userRole, stats, onAnalyticsPress, activeAnalytics }) => {
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState({});

  const handleRemainingPress = () => {
    navigation.navigate('Tickets', { screen: 'BoxOfficeTab' });
  };

  const toggleExpanded = (itemIndex) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
  };

  const handleSubItemPress = (subItemLabel, parentLabel, ticketUuid = null) => {

    // Only navigate for Available, for other titles we show analytics
    if (title === 'Available') {
      // Dynamic tab mapping - use the parent label directly
      // The parent category should be the tab name in BoxOfficeTab
      let selectedTab = parentLabel;

      // Handle special cases where parent label might not match tab name exactly
      if (parentLabel === 'Total Sold') {
        // For "Total Sold", we need to find the actual category from the data
        if (stats?.data?.sold_tickets?.by_category) {
          const byCategory = stats.data.sold_tickets.by_category;
          // Find the first category that has this sub-item
          for (const [categoryName, categoryData] of Object.entries(byCategory)) {
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

      if (selectedTab && selectedTab !== 'Total Sold') {
        navigation.navigate('Tickets', {
          screen: 'BoxOfficeTab',
          selectedTab: selectedTab,
          ticketUuid: ticketUuid
        });
      }
    }
    // For other titles (Sold Tickets, Check-Ins), analytics are handled by the analytics button
  };

  // Get sub-items for ADMIN and STAFF users from sold_tickets.by_category
  const getSubItems = (item, itemIndex) => {
    if ((userRole !== 'ADMIN' && userRole !== 'STAFF' && userRole !== 'ORGANIZER') || !stats?.data?.sold_tickets?.by_category) {
      return null;
    }

    const byCategory = stats.data.sold_tickets.by_category;
    const categoryData = byCategory[item.label];

    if (!categoryData || Object.keys(categoryData).length === 0) {
      return null;
    }

    // Extract sub-items (like "Standard" from VIP Ticket category)
    const subItems = [];
    Object.keys(categoryData).forEach(key => {
      if (key !== 'total_tickets' && key !== 'sold_tickets' && categoryData[key]) {
        const subData = categoryData[key];
        if (subData.total !== undefined && subData.sold !== undefined) {
          subItems.push({
            label: key,
            checkedIn: subData.sold,
            total: subData.total,
            percentage: subData.total > 0 ? Math.round((subData.sold / subData.total) * 100) : 0,
            ticketUuid: subData.ticket_uuid
          });
        }
      }
    });

    return subItems.length > 0 ? subItems : null;
  };

  return (
    <View>
      <View style={styles.card}>
        {/* <Text style={styles.title}>{title}</Text> */}
        {data.map((item, index) => {
          const subItems = getSubItems(item, index);
          const isExpanded = expandedItems[index];
          const hasSubItems = subItems && subItems.length > 0;

          return (
            <View key={index}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => hasSubItems && toggleExpanded(index)}
                activeOpacity={hasSubItems ? 0.7 : 1}
              >
                <CircularProgress value={item.checkedIn} total={item.total} percentage={item.percentage} />
                <View style={styles.textContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.value}>
                    <Text style={styles.valueResult}>{item.checkedIn}</Text>
                    <Text> / </Text>
                    <Text style={styles.valueTotal}>{item.total}</Text>
                  </Text>
                </View>
                {hasSubItems && (
                  <View style={styles.dropdownButton}>
                    <View style={styles.iconsContainer}>
                      {(userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'ORGANIZER') && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation(); // Prevent row press
                            onAnalyticsPress && onAnalyticsPress(item.label, title);
                          }}
                          style={styles.analyticsButton}
                        >
                          {activeAnalytics === `${title}-${item.label}` ? (
                            <SvgIcons.iconBarsActive width={24} height={24} fill={color.btnBrown_AE6F28} />
                          ) : (
                            <SvgIcons.iconBarsInactive width={24} height={24} fill={color.black_544B45} />
                          )}
                        </TouchableOpacity>
                      )}
                      {isExpanded ? (
                        <SvgIcons.upArrow width={10} height={7} fill={color.black_544B45} />
                      ) : (
                        <SvgIcons.downArrow width={10} height={7} fill={color.black_544B45} />
                      )}
                    </View>
                  </View>
                )}

              </TouchableOpacity>

              {/* Sub-items for ADMIN users */}
              {hasSubItems && isExpanded && (
                <View style={styles.subItemsContainer}>
                  {subItems.map((subItem, subIndex) => (
                    <TouchableOpacity
                      key={subIndex}
                      style={styles.subItemRow}
                      onPress={() => {
                        if (title === 'Available') {
                          handleSubItemPress(subItem.label, item.label, subItem.ticketUuid);
                        } else if ((userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'ORGANIZER') && (title === 'Sold Tickets' || title === 'Check-Ins') && onAnalyticsPress) {
                          // Trigger analytics when subitem is clicked
                          onAnalyticsPress(item.label, title, subItem.ticketUuid, subItem.label);
                        }
                      }}
                      activeOpacity={(title === 'Available' || ((userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'ORGANIZER') && (title === 'Sold Tickets' || title === 'Check-Ins'))) ? 0.7 : 1}
                    >
                      <CircularProgress
                        value={subItem.checkedIn}
                        total={subItem.total}
                        percentage={subItem.percentage}
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.subItemLabel}>{subItem.label}</Text>
                        <Text style={styles.value}>
                          <Text style={styles.valueResult}>{subItem.checkedIn}</Text>
                          <Text> / </Text>
                          <Text style={styles.valueTotal}>{subItem.total}</Text>
                        </Text>
                      </View>
                      {(userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'ORGANIZER') && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            onAnalyticsPress && onAnalyticsPress(item.label, title, subItem.ticketUuid, subItem.label);
                          }}
                          style={styles.analyticsButtonSubItem}
                        >
                          {activeAnalytics === `${title}-${subItem.ticketUuid || subItem.label}` ? (
                            <SvgIcons.iconBarsActive width={24} height={24} fill={color.btnBrown_AE6F28} />
                          ) : (
                            <SvgIcons.iconBarsInactive width={24} height={24} fill={color.black_544B45} />
                          )}
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* {showRemaining && remainingTicketsData && remainingTicketsData.length > 0 && (
        <TouchableOpacity 
          style={styles.remainingContainer}
          onPress={handleRemainingPress}
          activeOpacity={0.7}
        >
          <Text style={styles.title}>Available</Text>
          {remainingTicketsData.map((item, index) => {
            const remaining = item.total - item.checkedIn;
            return (
              <View key={index} style={styles.row}>
                <CircularProgress value={remaining} total={item.total} />
                <View style={styles.textContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.value}>{remaining}</Text>
                </View>
              </View>
            );
          })}
        </TouchableOpacity>
      )} */}
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
  // title: {
  //   fontSize: 16,
  //   fontWeight: "500",
  //   color: color.black_2F251D,
  //   marginLeft: 5,
  //   marginBottom: 10,
  // },
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
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: color.brown_3C200A,
  },
  dropdownButton: {
    padding: 8,
    marginLeft: 10,
  },
  dropdownIcon: {
    transform: [{ rotate: '0deg' }],
  },
  dropdownIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  subItemsContainer: {
    backgroundColor: '#F7E4B690',
    marginTop: 8,
    marginLeft: -15,
    marginRight: -15,
    marginBottom: 0,
    paddingBottom: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  subItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  subItemLabel: {
    fontSize: 12,
    color: color.grey_6B7785,
    fontWeight: "400",
  },
  remainingContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  chevronContainer: {
    padding: 8,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    marginRight: 5,
  },
  analyticsButton: {
    padding: 4,
  },
  analyticsButtonSubItem: {
    padding: 4,
    marginRight: 38
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
});

export default CheckInSoldTicketsCard;
