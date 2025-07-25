import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Svg, Circle } from "react-native-svg";
import { color } from "../../../color/color";
import { formatValue } from "../../../constants/formatValue";

const ScanCategories = ({ stats }) => {
    // Extract scan categories data with default values
    const scanCategoriesData = stats?.data?.scan_categories || {};
    const total = scanCategoriesData?.total || 0;
    const byCategory = scanCategoriesData?.by_category || {};

    // Map categories to colors
    const categoryColors = {
        "Standard": "#AE6F28",
        "VIP": "#87807C",
        "Member": "#EDB58A",
        "Early Bird": "#CEBCA0"
    };

    // Transform the data into the required format
    const values = Object.entries(byCategory).map(([label, value]) => {
        // Handle cases where value might be an object
        const numericValue = typeof value === 'object' ? (value.total || value.amount || 0) : (value || 0);

        return {
            label: label === "standard" ? "Standard" :
                label === "vip" ? "VIP" :
                    label === "member" ? "Member" :
                        label === "early_bird" ? "Early Bird" : label,
            value: numericValue,
            color: categoryColors[label === "standard" ? "Standard" :
                label === "vip" ? "VIP" :
                    label === "member" ? "Member" :
                        label === "early_bird" ? "Early Bird" : label] || "#AE6F28"
        };
    });

    // Sort values in the order: Standard, VIP, Member, Early Bird
    const categoryOrder = ["Standard", "VIP", "Member", "Early Bird"];
    const sortedValues = categoryOrder
        .map(type => values.find(v => v.label === type))
        .filter(Boolean);

    const radius = 50;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const gapSize = 15;
    const totalGap = gapSize * sortedValues.length;

    // Calculate segments for the circle with visible gaps and no overlap
    const calculateSegments = () => {
        let currentOffset = 0;
        return sortedValues.map((item) => {
            const percentage = item.value / total;
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
                <Text style={styles.title}>Scan Categories</Text>
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
        paddingHorizontal: 10,
        marginTop: 6
    },
    wrapper: {
        backgroundColor: color.white_FFFFFF,
        borderColor: color.white_FFFFFF,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
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
        color: color.plaeholderTxt_24282C,
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

export default ScanCategories;
