import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Svg, Circle } from "react-native-svg";
import { color } from "../../color/color";
import { formatValue } from "../../constants/formatValue";

const BoxOfficeSales = () => {
    const total = 20000;
    const values = [
        { label: "Cash", value: 8500, color: "#AE6F28" },
        { label: "Card", value: 8000, color: "#87807C" },
        { label: "Mobile Money", value: 3500, color: "#EDB58A" },
    ];
    const sortedValues = [...values].sort((a, b) => b.value - a.value);

    const radius = 50;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const gapSize = 15;
    let accumulatedOffset = 0;

    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                <Text style={styles.title}>Box Office Sales</Text>
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
                            {sortedValues.map((item, index) => {
                                const percentage = item.value / total;
                                const dashLength = circumference * percentage - gapSize;
                                const strokeOffset = circumference - accumulatedOffset;

                                const segment = (
                                    <Circle
                                        key={index}
                                        cx="60"
                                        cy="60"
                                        r={radius}
                                        stroke={item.color}
                                        strokeWidth={strokeWidth}
                                        fill="none"
                                        strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                                        strokeDashoffset={strokeOffset}
                                        strokeLinecap="round"
                                    />
                                );

                                accumulatedOffset += dashLength + gapSize;
                                return segment;
                            })}
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
                                    {item.label === "Mobile Money" ? (
                                        <View>
                                            <Text style={styles.paymentText}>Mobile</Text>
                                            <Text style={styles.paymentText}>Money</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.paymentText}>{item.label}</Text>
                                    )}
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
        paddingHorizontal: 10
    },
    wrapper: {
        backgroundColor: color.white_FFFFFF,
        borderColor: color.white_FFFFFF,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        margin: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    title: {
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
        color: color.drak_black_000000,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: "400",
        color: color.brown_766F6A,

    },
    labelGHS: {
        fontSize: 14,
        fontWeight: "400",
        color: color.brown_766F6A,

    }
});

export default BoxOfficeSales;
