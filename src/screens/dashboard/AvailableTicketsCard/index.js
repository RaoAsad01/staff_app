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

const AvailableTicketsCard = ({ data }) => {
  const [expanded, setExpanded] = useState({});
  const listData = data && data.length > 0 ? data : [];
  const navigation = useNavigation();

  const toggle = (label) => {
    setExpanded((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleSubItemPress = (subItemLabel) => {
    console.log('AvailableTicketsCard - Subitem clicked:', subItemLabel);

    // Map subitem labels to their parent tab names in BoxOfficeTab
    const tabMapping = {
      // Early Bird subitems
      'Early Bird': 'Early Bird',
      'Early Bird New': 'Early Bird',
      'early bird': 'Early Bird',
      'early bird new': 'Early Bird',

      // VIP Ticket subitems  
      'Critical': 'VIP Ticket',
      'High': 'VIP Ticket',
      'critical': 'VIP Ticket',
      'high': 'VIP Ticket',

      // Members subitems
      'VIP Ticket': 'Members',
      'VIP Ticket New': 'Members',
      'vip ticket': 'Members',
      'vip ticket new': 'Members',

      // Fallback mappings
      'Standard': 'Standard',
      'Premium': 'Premium',
    };

    const selectedTab = tabMapping[subItemLabel];
    console.log('AvailableTicketsCard - Mapped tab:', selectedTab);

    if (selectedTab) {
      navigation.navigate('Tickets', {
        screen: 'BoxOfficeTab',
        selectedTab: selectedTab
      });
    } else {
      console.warn('AvailableTicketsCard - No tab mapping found for:', subItemLabel);
      // Fallback: try to find a partial match
      const partialMatch = Object.keys(tabMapping).find(key =>
        subItemLabel.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(subItemLabel.toLowerCase())
      );
      if (partialMatch) {
        console.log('AvailableTicketsCard - Found partial match:', partialMatch, '->', tabMapping[partialMatch]);
        navigation.navigate('Tickets', {
          screen: 'BoxOfficeTab',
          selectedTab: tabMapping[partialMatch]
        });
      }
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
              // Navigate to BoxOfficeTab for subitems
              handleSubItemPress(item.label);
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
                {renderItem(sub, subIdx, true)}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.card}>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingVertical: 8,
    padding: 15,
  },
  subRow: {
    // No extra margin on right, just indent
    marginLeft: 0,
    backgroundColor: "transparent",
  },
  subRowBg: {
    backgroundColor: color.brown_F7E4B6,
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

export default AvailableTicketsCard;