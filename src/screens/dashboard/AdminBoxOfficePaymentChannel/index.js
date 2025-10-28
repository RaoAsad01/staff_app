import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from "react-native-svg";
import { color } from '../../../color/color';
import Typography, { Body1, Heading5 } from '../../../components/Typography';
import { formatValue } from '../../../constants/formatValue';

const AdminBoxOfficePaymentChannel = ({ stats }) => {
    // Log the raw stats data received from backend
    console.log('================================================');
    console.log('💰 AdminBoxOfficePaymentChannel - Raw Stats Data:', JSON.stringify(stats, null, 2));
    console.log('💰 AdminBoxOfficePaymentChannel - Box Office Sales Data:', JSON.stringify(stats?.data?.box_office_sales, null, 2));
    console.log('💰 AdminBoxOfficePaymentChannel - Payment Channels:', JSON.stringify(stats?.data?.box_office_sales?.payment_channels, null, 2));
    console.log('================================================');

    const boxOfficeSalesData = stats?.data?.box_office_sales || {};
    // Try both payment_channels (plural) and payment_channel (singular) for backward compatibility
    const paymentChannel = boxOfficeSalesData?.payment_channels || boxOfficeSalesData?.payment_channel || {};
    
    console.log('💰 AdminBoxOfficePaymentChannel - Payment Channel Keys:', Object.keys(paymentChannel));
    console.log('💰 AdminBoxOfficePaymentChannel - Payment Channel Values:', paymentChannel);
    
    // Map payment methods to colors
    const paymentMethodColors = {
        "Cash": "#AE6F28",
        "Card": "#87807C",
        "MoMo": "#EDB58A",
        "Mobile Money": "#EDB58A",
        "P.O.S.": "#945F22",
        "POS": "#945F22",
        "Wallet": "#F4A261",
        "Bank Transfer": "#CEBCA0",
        "Free": "#2A9D8F"
    };

    // Transform the data into the required format for pie chart
    let values = [];
    
    if (Object.keys(paymentChannel).length > 0) {
        values = Object.entries(paymentChannel)
            .filter(([key, value]) => {
                // Filter out unwanted payment methods or zero values
                const lowerKey = key.toLowerCase();
                const shouldExclude = ['wallet', 'bank_transfer', 'free'].includes(lowerKey);
                const hasValue = parseFloat(value) > 0;
                console.log(`💰 Checking ${key}: value=${value}, exclude=${shouldExclude}, hasValue=${hasValue}`);
                return !shouldExclude && hasValue;
            })
            .map(([key, value], index) => {
                const label = key === 'mobile_money' ? 'MoMo' :
                    key === 'pos' ? 'P.O.S.' :
                        key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '); // Capitalize and replace underscore

                return {
                    label: label,
                    value: parseFloat(value) || 0,
                    color: paymentMethodColors[label] || "#87807C" // Fallback color
                };
            });
    }
    
    // If no values after filtering, show "No Data"
    if (values.length === 0) {
        console.log('💰 No payment channel data found, showing No Data');
        values = [{
            label: "No Data",
            value: 0,
            color: "#87807C"
        }];
    }
    
    console.log('💰 Final values array:', values);

    // Sort values in desired order
    const paymentOrder = ["Cash", "P.O.S.", "Card", "MoMo"];
    const sortedValues = paymentOrder
        .map(type => values.find(v => v.label === type))
        .filter(Boolean);
    
    // Add any remaining values not in the order list
    const remainingValues = values.filter(v => !paymentOrder.includes(v.label));
    const allValues = [...sortedValues, ...remainingValues];
    
    const total = allValues.reduce((sum, item) => sum + item.value, 0);

    const radius = 50;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const gapSize = 15;
    const totalGap = gapSize * allValues.length;

    // Calculate segments for the circle with visible gaps and no overlap
    const calculateSegments = () => {
        let currentOffset = 0;
        return allValues.map((item) => {
            const percentage = total > 0 ? item.value / total : 0;
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
                <Text style={styles.heading}>Payment Channels</Text>
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
                        {allValues.map((item, index) => (
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

export default AdminBoxOfficePaymentChannel;
