import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { color } from "../../../color/color";
import { useNavigation } from "@react-navigation/native";

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

const CheckInSoldTicketsCard = ({ title, data, showRemaining, remainingTicketsData }) => {
  const navigation = useNavigation();

  const handleRemainingPress = () => {
    navigation.navigate('Tickets', { screen: 'BoxOfficeTab' });
  };

  return (
    <View>
      <View style={styles.card}>
        {/* <Text style={styles.title}>{title}</Text> */}
        {data.map((item, index) => (
          <View key={index} style={styles.row}>
            <CircularProgress value={item.checkedIn} total={item.total} percentage={item.percentage} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>
                <Text>{item.checkedIn}</Text>
                <Text> / </Text>
                <Text>{item.total}</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* {showRemaining && remainingTicketsData && remainingTicketsData.length > 0 && (
        <TouchableOpacity 
          style={styles.remainingContainer}
          onPress={handleRemainingPress}
          activeOpacity={0.7}
        >
          <Text style={styles.title}>Available Tickets</Text>
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
    borderRadius: 12,
    marginVertical: 16,
    marginHorizontal: 10,
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
    marginLeft: 20,
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
  remainingContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 10,
  },
});

export default CheckInSoldTicketsCard;
