import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { color } from "../../../color/color";

// Utility function to format large numbers
function formatNumber(num) {
    if (num >= 1000) {
        const formatted = (num / 1000).toFixed(1);
        return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'k' : formatted + 'k';
    }
    return num.toString();
}

const CHART_HEIGHT = 140;
const BAR_WIDTH = 10;
const BAR_SPACING = 48;
const DOT_SIZE = 2;
const DOT_SPACING = 4;

function getYAxisLabels(yAxisMax) {
    // Use 6 labels if max >= 150, else 5
    const steps = yAxisMax >= 150 ? 6 : 5;
    return Array.from({ length: steps }, (_, i) =>
        Math.round((yAxisMax / (steps - 1)) * i)
    );
}

const AnalyticsChart = ({ title, data, dataType }) => {
    const [selectedBar, setSelectedBar] = useState(null);
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    let yAxisMax = Math.max(...data.map(d => d.value), 0);

    // Calculate Y-axis max dynamically based on the highest value
    if (yAxisMax === 0) {
        yAxisMax = 10; // Default for no data
    } else {
        // Add 50% buffer to the highest value and round up to nearest 10
        yAxisMax = Math.ceil(yAxisMax * 1.5 / 120) * 120;
    }

    const yAxisLabels = getYAxisLabels(yAxisMax);

    const renderDottedLine = () => {
        const dots = [];
        const numberOfDots = Math.floor(300 / (DOT_SIZE + DOT_SPACING)); // 300 is approximate width

        for (let i = 0; i < numberOfDots; i++) {
            dots.push(
                <View
                    key={i}
                    style={[
                        styles.dot,
                        { marginRight: DOT_SPACING }
                    ]}
                />
            );
        }

        return dots;
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>{title} Analytics</Text>
            <View style={styles.chartRow}>
                {/* Chart Area with Grid Lines and Y-Axis Labels */}
                <View style={styles.chartArea}>
                    {/* Grid Lines and Y-Axis Labels */}
                    {yAxisLabels.map((label, idx) => {
                        const y = CHART_HEIGHT - (CHART_HEIGHT / (yAxisLabels.length - 1)) * idx;
                        return (
                            <React.Fragment key={idx}>
                                <View
                                    style={[
                                        styles.gridLine,
                                        {
                                            top: y,
                                        },
                                    ]}
                                >
                                    <View style={styles.dottedLineContainer}>
                                        {renderDottedLine()}
                                    </View>
                                </View>
                                <Text
                                    style={[
                                        styles.yAxisLabel,
                                        {
                                            position: 'absolute',
                                            left: -40,
                                            top: y - 8,
                                            width: 36,
                                        },
                                    ]}
                                >
                                    {formatNumber(label)}
                                </Text>
                            </React.Fragment>
                        );
                    })}
                    {/* Bars and X-Axis Labels */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ 
                            height: CHART_HEIGHT + 24, 
                            alignItems: "flex-end",
                            paddingHorizontal: 60 // Add padding to prevent tooltip cutoff on edges
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT }}>
                            {data.map((item, index) => {
                                // Only render bar and time if value is greater than 0
                                if (item.value === 0) {
                                    return null; // Don't render anything for zero values
                                }

                                const calculatedHeight = (item.value / yAxisMax) * CHART_HEIGHT;
                                const barHeight = Math.max(calculatedHeight, 8); // Minimum bar height of 8px
                                const isSelected = selectedBar === index;
                                
                                return (
                                    <View key={index} style={{ alignItems: 'center', width: BAR_SPACING }}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => setSelectedBar(isSelected ? null : index)}
                                            style={{ height: CHART_HEIGHT, justifyContent: 'flex-end' }}
                                        >
                                            <View style={{ alignItems: 'center' }}>
                                                {isSelected && (
                                                    <View style={styles.tooltipContainer}>
                                                        <View style={styles.tooltip}>
                                                            <Text style={styles.tooltipTime}>{item.time}</Text>
                                                            <Text style={styles.tooltipValue}>
                                                                {formatNumber(item.value)} {dataType === 'sold' ? 'sold' : dataType === 'payment' ? 'GHS' : 'checked in'}
                                                            </Text>
                                                            <View style={styles.tooltipArrow} />
                                                        </View>
                                                    </View>
                                                )}
                                                <View
                                                    style={[
                                                        styles.bar,
                                                        { height: barHeight, width: BAR_WIDTH },
                                                        isSelected && styles.highlightedBar,
                                                    ]}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        <Text
                                            style={[
                                                styles.timeLabel,
                                                isSelected && styles.timeLabelHighlight,
                                                { marginTop: 10 },
                                            ]}
                                        >
                                            {item.time}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#fff",
        borderRadius: 16,
        margin: 0,
        padding: 0,
        paddingTop: 18,
        paddingBottom: 10,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        marginHorizontal: 16,
        marginVertical: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: "500",
        color: color.placeholderTxt_24282C,
        marginBottom: 8,
        textAlign: 'left',
    },
    chartRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginTop: 30
    },
    chartArea: {
        flex: 1,
        height: CHART_HEIGHT + 24,
        position: "relative",
        overflow: "visible",
        justifyContent: "flex-end",
        marginLeft: 40,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        zIndex: 0,
    },
    dottedLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 1,
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: '#ECECEC',
    },
    yAxisLabel: {
        fontSize: 13,
        color: color.brown_3C200A,
        fontWeight: "400",
        opacity: 0.7,
        fontFamily: 'System',
        textAlign: 'right',
    },
    bar: {
        backgroundColor: "#F7E4B6",
        borderRadius: 5,
        width: BAR_WIDTH,
    },
    highlightedBar: {
        backgroundColor: color.btnBrown_AE6F28,
    },
    timeLabel: {
        marginTop: 6,
        fontSize: 14,
        color: color.brown_3C200A,
        opacity: 0.7,
        fontWeight: "400",
        textAlign: "center",
        fontFamily: 'System',
    },
    timeLabelHighlight: {
        color: color.drak_black_000000,
        fontWeight: "700",
    },
    tooltipContainer: {
        position: "absolute",
        bottom: "70%",
        left: "50%",
        transform: [{ translateX: -70 }], // Center the tooltip properly (half of tooltip width)
        zIndex: 10,
        width: 140, // Match tooltip width
        alignItems: 'center',
        marginBottom: 10,
    },
    tooltip: {
        backgroundColor: "#2F251D",
        paddingVertical: 8,
        paddingHorizontal: 1,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 140,
    },
    tooltipArrow: {
        position: "absolute",
        bottom: -8,
        left: "50%",
        marginLeft: -8,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderStyle: "solid",
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#2F251D",
    },
    tooltipTime: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        fontFamily: 'System',
    },
    tooltipValue: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "400",
        textAlign: "center",
        fontFamily: 'System',
        marginTop: 2,
    },
});

export default AnalyticsChart;