import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { color } from "../../color/color";

const CircularProgress = ({ checkedIn, total }) => {
  const radius = 20;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (checkedIn / total) * 100 : 0;
  const progress = (percentage / 100) * circumference;

  return (
    <Svg width={50} height={50} viewBox="0 0 50 50">
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
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
      />
      <SvgText
        x="25"
        y="28"
        textAnchor="middle"
        fontSize="12"
        fill={color.brown_3C200A}
        fontWeight="500"
      >
        {`${Math.round(percentage)}%`}
      </SvgText>
    </Svg>
  );
};

const CheckInSoldTicketsCard = ({ title, data }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.row}>
          <CircularProgress checkedIn={item.checkedIn} total={item.total} />
          <View style={styles.textContainer}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>
              {item.checkedIn} / {item.total}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 10,
    marginHorizontal: 10
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: color.black_2F251D,
    marginLeft: 5,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  textContainer: {
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    color: color.black_544B45,
    fontWeight: '400'
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: color.brown_3C200A,
  },
});

export default CheckInSoldTicketsCard;