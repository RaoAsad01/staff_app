import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { color } from "../../color/color";

const AnalyticsChart = ({ title, data, dataType }) => {
    const minValue = 0;
    const maxValue = Math.max(...data.map((item) => item.value), minValue);

    const barWidth = 8;
    const barSpacing = 20;

    const renderBars = () => {
        return data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100;
            const isHighlighted = item.isHighlighted;

            return (
                <View key={index} style={{ alignItems: "center", marginRight: barSpacing }}>
                    <View
                        style={[
                            styles.bar,
                            { height: barHeight, width: barWidth },
                            isHighlighted && styles.highlightedBar, // Apply highlighted style if needed
                        ]}
                    >
                        {isHighlighted && (
                            <View style={styles.tooltip}>
                                <Text style={styles.tooltipText}>
                                    {item.time}
                                </Text>
                                <Text style={styles.tooltipText}>
                                    {item.value} {dataType}
                                </Text>
                                <View style={styles.tooltipArrow} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.timeLabel}>{item.time}</Text>
                </View>
            );
        });
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <Text style={styles.title}>{title} Analytics</Text>
                <View style={styles.chartContainer}>{renderBars()}</View>
                <View style={styles.yAxisLabels}>
                    <Text>150</Text>
                    <Text>100</Text>
                    <Text>50</Text>
                    <Text>0</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 10,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
        marginVertical: 10,
    },
    container: {
        flex: 1,
        paddingBottom: 25
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: color.brown_3C200A,
        marginBottom: 20,
    },
    chartContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingBottom: 20,
        position: "relative",
        marginLeft: 40,
        top: 40,
    },
    bar: {
        backgroundColor: "#F7E4B6",
        borderRadius: 2,
        justifyContent: "flex-end",
    },
    highlightedBar: {
        backgroundColor: color.btnBrown_AE6F28,
    },
    timeLabel: {
        marginTop: 5,
        fontSize: 11,
        color: color.brown_3C200A,
    },
    timeLabelHighlight:{
        marginTop: 5,
        fontSize: 11,
        color: color.drak_black_000000,
    },
    yAxisLabels: {
        position: "absolute",
        justifyContent: "space-between",
        height: "80%",
        top: 40,
        left: 0,
    },
    tooltip: {
        position: "absolute",
        top: -60,
        backgroundColor: "#2F251D",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        width: 125,
        left: "50%",
        transform: [{ translateX: -60 }],
        zIndex: 10,
    },

    tooltipArrow: {
        position: "absolute",
        bottom: -6,
        left: "50%",
        marginLeft: 4,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderStyle: "solid",
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#2F251D",
    },

    tooltipText: {
        color: "white",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "500",
    },


});

export default AnalyticsChart;