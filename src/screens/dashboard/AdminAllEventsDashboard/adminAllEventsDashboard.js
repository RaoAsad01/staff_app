import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Dimensions,
    PanResponder,
    Animated,
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import SvgIcons from '../../../components/SvgIcons';
import { color } from '../../../color/color';
import Typography from '../../../components/Typography';

const { width } = Dimensions.get('window');

// Dropdown Component
const Dropdown = ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.dropdown} onPress={onPress}>
        {label && (
            <Typography
                style={styles.dropdownLabel}
                weight="400"
                size={12}
                color={color.grey_87807C}
                numberOfLines={1}
            >
                {label}
            </Typography>
        )}
        <Typography
            style={styles.dropdownValue}
            weight="400"
            size={14}
            color={color.brown_766F6A}
            numberOfLines={1}
        >
            {value}
        </Typography>
        <SvgIcons.downArrow />
    </TouchableOpacity>
);

// DropdownEarningAttendeesFilter Component
const DropdownEarningAttendeesFilter = ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.dropdownEarningAttendeesFilter} onPress={onPress}>
        {label && (
            <Typography
                style={styles.dropdownLabel}
                weight="400"
                size={12}
                color={color.grey_87807C}
                numberOfLines={1}
            >
                {label}
            </Typography>
        )}
        <Typography
            style={styles.dropdownValue}
            weight="400"
            size={14}
            color={color.brown_766F6A}
            numberOfLines={1}
        >
            {value}
        </Typography>
        <SvgIcons.downArrow />
    </TouchableOpacity>
);

// Bottom Sheet Radio Picker Component (for Event Type & Ticketing Type)
const BottomSheetRadioPicker = ({ visible, onClose, title, options, selectedValue, onSelect }) => {
    const translateY = useRef(new Animated.Value(600)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (visible) {
            setModalVisible(true);
            translateY.setValue(600);
            overlayOpacity.setValue(0);
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (modalVisible) {
            closeWithAnimation();
        }
    }, [visible]);

    const closeWithAnimation = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 600,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
        });
    };

    const handleClose = () => {
        closeWithAnimation();
        setTimeout(() => onClose(), 260);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    handleClose();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const handleSelect = (option) => {
        onSelect(option);
        handleClose();
    };

    return (
        <Modal visible={modalVisible} animationType="none" transparent>
            <View style={styles.bottomSheetOverlayWrapper}>
                <Animated.View style={[styles.bottomSheetOverlayBg, { opacity: overlayOpacity }]}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
                </Animated.View>
                <Animated.View
                    style={[styles.bottomSheetPickerModal, { transform: [{ translateY }] }]}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.modalHandle} />
                    <Typography
                        style={styles.bottomSheetPickerTitle}
                        weight="700"
                        size={18}
                        color={color.brown_3C200A}
                    >
                        {title}
                    </Typography>

                    <ScrollView style={styles.bottomSheetOptionsList} showsVerticalScrollIndicator={false}>
                        {options.map((option, index) => {
                            const isSelected = option.value === selectedValue;
                            return (
                                <TouchableOpacity
                                    key={option.value || index}
                                    style={styles.radioOptionRow}
                                    onPress={() => handleSelect(option)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.radioOuter,
                                        isSelected && styles.radioOuterSelected,
                                    ]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                    <Typography
                                        weight={isSelected ? "400" : "400"}
                                        size={16}
                                        color={color.black_544B45}
                                        style={styles.radioLabel}
                                    >
                                        {option.label}
                                    </Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

// Popover Dropdown Component (for Currency & Filter by Event)
const PopoverDropdown = ({ visible, onClose, options, selectedValue, onSelect, anchorRef }) => {
    const [position, setPosition] = useState({ top: 0, right: 0 });

    useEffect(() => {
        if (visible && anchorRef?.current) {
            anchorRef.current.measureInWindow((x, y, w, h) => {
                setPosition({
                    top: y + h + 4,
                    right: width - (x + w),
                });
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity
                style={styles.popoverOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={[styles.popoverContainer, { top: position.top, right: position.right }]}>
                    <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={option.value || index}
                                style={[
                                    styles.popoverOption,
                                    index < options.length - 1 && styles.popoverOptionBorder,
                                ]}
                                onPress={() => {
                                    onSelect(option);
                                    onClose();
                                }}
                            >
                                <Typography
                                    weight={option.value === selectedValue ? "400" : "400"}
                                    size={12}
                                    color={option.value === selectedValue ? color.black_544B45 : color.black_544B45}
                                >
                                    {option.label}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

// Card Component
const Card = ({ children, style }) => (
    <View style={[styles.card, style]}>{children}</View>
);

// Dashed Line Component using SVG
const DashedLine = () => (
    <Svg height="2" width="100%" style={{ flex: 1 }}>
        <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke={color.btnBrown_AE6F28}
            strokeWidth="1"
            strokeDasharray="8,6"
        />
    </Svg>
);

// Ticket Stat Box Component with Ticket Shape
const TicketStatBox = ({ icon, label, count, grossAmount, netAmount }) => {
    const [topSectionHeight, setTopSectionHeight] = useState(92);

    return (
        <View style={styles.ticketWrapper}>
            <View style={styles.ticketContainer}>
                {/* Top Section */}
                <View
                    style={styles.ticketTopSection}
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        setTopSectionHeight(height);
                    }}
                >
                    <View style={styles.ticketHeader}>
                        <View style={styles.ticketIconCircle}>
                            {icon}
                        </View>
                        <View>
                            <Typography
                                weight="400"
                                size={12}
                                color={color.grey_87807C}
                            >
                                {label}
                            </Typography>
                            <Typography
                                weight="700"
                                size={14}
                                color={color.brown_3C200A}
                            >
                                Count: {count}
                            </Typography>
                        </View>
                    </View>
                </View>

                {/* Dashed Line */}
                <View style={styles.ticketDividerContainer}>
                    <DashedLine />
                </View>

                {/* Bottom Section */}
                <View style={styles.ticketBottomSection}>
                    <View style={styles.ticketAmountItem}>
                        <Typography
                            weight="400"
                            size={12}
                            color={color.grey_87807C}
                        >
                            Gross:
                        </Typography>
                        <Typography
                            weight="700"
                            size={16}
                            color={color.black_2F251D}
                        >
                            {grossAmount}
                        </Typography>
                    </View>
                    <View style={styles.ticketAmountItem}>
                        <Typography
                            weight="400"
                            size={12}
                            color={color.grey_87807C}
                        >
                            Net:
                        </Typography>
                        <Typography
                            weight="700"
                            size={16}
                            color={color.black_2F251D}
                        >
                            {netAmount}
                        </Typography>
                    </View>
                </View>
            </View>

            {/* Left Cutout */}
            <View style={[styles.cutoutAbsolute, { left: -12, top: topSectionHeight - 12 }]} />
            {/* Right Cutout */}
            <View style={[styles.cutoutAbsolute, { right: -12, top: topSectionHeight - 12 }]} />
        </View>
    );
};

// Mini Stat Card Component
const MiniStatCard = ({ icon, label, count, amount }) => (
    <View style={styles.miniStatCard}>
        <View style={styles.miniStatIcon}>
            {icon}
        </View>
        <Typography
            style={styles.miniStatLabel}
            weight="500"
            size={10}
            color={color.grey_87807C}
        >
            {label}
        </Typography>
        <Typography
            style={styles.miniStatCount}
            weight="700"
            size={14}
            color={color.black_2F251D}
        >
            Count: {count}
        </Typography>
        <Typography
            style={styles.miniStatAmount}
            weight="500"
            size={12}
            color={color.black_544B45}
        >
            {amount}
        </Typography>
    </View>
);

// Earnings Chart Component
const EarningsChart = () => {
    const data = [
        { month: 'Jan', gross: 75, net: 60 },
        { month: 'Mar', gross: 85, net: 70 },
        { month: 'May', gross: 120, net: 95 },
        { month: 'Jul', gross: 200, net: 180 },
        { month: 'Sep', gross: 150, net: 130 },
        { month: 'Oct', gross: 140, net: 115 },
        { month: 'Dec', gross: 160, net: 140 },
    ];

    const maxValue = 200;
    const chartHeight = 150;
    const barWidth = 24;

    return (
        <View>
            <View style={styles.yAxisLabels}>
                {[200, 150, 100, 50, 0].map((val) => (
                    <Typography
                        key={val}
                        style={styles.axisLabel}
                        weight="400"
                        size={10}
                        color={color.grey_87807C}
                    >
                        {val}
                    </Typography>
                ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                <View style={styles.chartContainer}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.barGroup}>
                            <View style={styles.barsContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: (item.gross / maxValue) * chartHeight,
                                            backgroundColor: color.brown_F7E4B6,
                                            width: barWidth / 2,
                                        },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: (item.net / maxValue) * chartHeight,
                                            backgroundColor: color.btnBrown_AE6F28,
                                            width: barWidth / 2,
                                            marginLeft: 2,
                                        },
                                    ]}
                                />
                            </View>
                            <Typography
                                style={styles.barLabel}
                                weight="400"
                                size={10}
                                color={color.grey_87807C}
                            >
                                {item.month}
                            </Typography>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.divider} />
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color.brown_F7E4B6 }]} />
                    <Typography
                        style={styles.legendText}
                        weight="500"
                        size={12}
                        color={color.brown_3C200A}
                    >
                        Gross
                    </Typography>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color.btnBrown_AE6F28 }]} />
                    <Typography
                        style={styles.legendText}
                        weight="500"
                        size={12}
                        color={color.brown_3C200A}
                    >
                        Net
                    </Typography>
                </View>
            </View>
        </View>
    );
};

// Attendees Line Chart Component
const AttendeesChart = () => {
    const [selectedIndex, setSelectedIndex] = useState(2);
    const displayData = [23000, 25000, 45000, 27000, 29000, 30000, 35000];
    const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Oct', 'Dec'];

    const maxDataValue = Math.max(...displayData);
    const maxValue = Math.ceil(maxDataValue / 10000) * 10000;

    const yAxisSteps = 5;
    const stepValue = maxValue / yAxisSteps;
    const yAxisLabels = [];
    for (let i = yAxisSteps; i >= 0; i--) {
        const value = stepValue * i;
        yAxisLabels.push(value >= 1000 ? `${value / 1000}k` : value.toString());
    }

    const chartWidth = width - 100;
    const chartHeight = 200;
    const chartPaddingTop = 25;
    const chartPaddingLeft = 2;

    const points = displayData.map((val, i) => ({
        x: (i / (displayData.length - 1)) * (chartWidth - 20) + chartPaddingLeft,
        y: chartHeight - (val / maxValue) * chartHeight + chartPaddingTop,
    }));

    const pathD = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        const prev = points[i - 1];
        const cp1x = prev.x + (point.x - prev.x) / 2;
        const cp2x = prev.x + (point.x - prev.x) / 2;
        return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${point.y}, ${point.x} ${point.y}`;
    }, '');

    const gridLines = yAxisLabels.map((_, i) => {
        return chartPaddingTop + (i * chartHeight) / (yAxisLabels.length - 1);
    });

    return (
        <View style={styles.attendeesChartContainer}>
            <View style={styles.chartWrapper}>
                <View style={styles.yAxisLabelsAttendees}>
                    {yAxisLabels.map((val, index) => (
                        <Typography
                            key={`${val}-${index}`}
                            style={styles.axisLabelAttendees}
                            weight="400"
                            size={12}
                            color={color.grey_87807C}
                        >
                            {val}
                        </Typography>
                    ))}
                </View>

                <View style={styles.chartAreaAttendees}>
                    <Svg width={chartWidth} height={chartHeight + chartPaddingTop + 30}>
                        <Defs>
                            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <Stop offset="0%" stopColor={color.brown_D58E00} stopOpacity={0.15} />
                                <Stop offset="100%" stopColor={color.brown_D58E00} stopOpacity={0.02} />
                            </LinearGradient>
                        </Defs>

                        {gridLines.map((y, i) => (
                            <Path
                                key={i}
                                d={`M ${chartPaddingLeft} ${y} L ${chartWidth - 10} ${y}`}
                                stroke={color.grey_E5E7EB}
                                strokeWidth={1}
                                strokeDasharray="0"
                            />
                        ))}

                        <Path
                            d={`${pathD} L ${points[points.length - 1].x} ${chartHeight + chartPaddingTop} L ${points[0].x} ${chartHeight + chartPaddingTop} Z`}
                            fill="url(#areaGradient)"
                        />

                        <Path d={pathD} stroke={color.btnBrown_AE6F28} strokeWidth={2.5} fill="none" />

                        {selectedIndex !== null && (
                            <>
                                <Defs>
                                    <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <Stop offset="0%" stopColor={color.btnBrown_AE6F28} stopOpacity={1} />
                                        <Stop offset="85%" stopColor={color.btnBrown_AE6F28} stopOpacity={0.3} />
                                        <Stop offset="100%" stopColor={color.btnBrown_AE6F28} stopOpacity={0.05} />
                                    </LinearGradient>
                                </Defs>
                                <Path
                                    d={`M ${points[selectedIndex].x} ${chartPaddingTop - 15} L ${points[selectedIndex].x} ${points[selectedIndex].y + 5}`}
                                    stroke="url(#lineGradient)"
                                    strokeWidth={2}
                                />
                                <Circle
                                    cx={points[selectedIndex].x}
                                    cy={chartPaddingTop - 15}
                                    r={8}
                                    fill="#F3F3F3"
                                />
                                <Circle
                                    cx={points[selectedIndex].x}
                                    cy={chartPaddingTop - 15}
                                    r={5}
                                    fill={color.btnBrown_AE6F28}
                                />
                            </>
                        )}
                    </Svg>

                    <View style={styles.xAxisLabelsAttendees}>
                        {months.map((month, index) => (
                            <TouchableOpacity
                                key={month}
                                onPress={() => setSelectedIndex(index)}
                                style={styles.xAxisLabelTouch}
                            >
                                <Typography
                                    style={styles.axisLabelAttendees}
                                    weight="400"
                                    size={12}
                                    color={color.grey_87807C}
                                >
                                    {month}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

// Donut Chart for Events
const DonutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const size = 140;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const gapAngle = 15;

    const totalGapAngle = gapAngle * data.length;
    const availableAngle = 360 - totalGapAngle;

    let currentAngle = -90 + (gapAngle / 2);

    return (
        <View style={styles.donutContainer}>
            <Svg width={size} height={size}>
                {data.map((item, index) => {
                    const percentage = item.value / total;
                    const segmentAngle = percentage * availableAngle;
                    const segmentLength = (segmentAngle / 360) * circumference;
                    const gapLength = circumference - segmentLength;

                    const rotation = currentAngle;
                    currentAngle += segmentAngle + gapAngle;

                    return (
                        <Circle
                            key={index}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={`${segmentLength} ${gapLength}`}
                            strokeLinecap="round"
                            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                        />
                    );
                })}
            </Svg>
            <View style={styles.donutCenter}>
                <Typography
                    style={styles.donutTotal}
                    weight="700"
                    size={24}
                    color={color.black_2F251D}
                >
                    {total}
                </Typography>
                <Typography
                    style={styles.donutLabel}
                    weight="400"
                    size={12}
                    color={color.grey_87807C}
                >
                    Total
                </Typography>
            </View>
        </View>
    );
};

// Year Picker Component
const YearPicker = ({ visible, onClose, onYearSelect, selectedYear }) => {
    const currentYear = new Date().getFullYear();
    const [decadeStart, setDecadeStart] = useState(Math.floor(currentYear / 10) * 10);

    const years = [];
    for (let i = -1; i < 11; i++) {
        years.push(decadeStart + i);
    }

    const handlePrevDecade = () => {
        setDecadeStart(decadeStart - 10);
    };

    const handleNextDecade = () => {
        setDecadeStart(decadeStart + 10);
    };

    const handleYearPress = (year) => {
        onYearSelect(year);
        onClose();
    };

    const isOutsideDecade = (year) => {
        return year < decadeStart || year >= decadeStart + 10;
    };

    const isCurrentYear = (year) => {
        return year === currentYear;
    };

    const isSelectedYear = (year) => {
        return year === selectedYear;
    };

    return (
        <View style={styles.yearPickerContainer}>
            <View style={styles.yearPickerNav}>
                <TouchableOpacity style={styles.yearNavButton} onPress={handlePrevDecade}>
                    <SvgIcons.leftArrowGreyBg />
                </TouchableOpacity>
                <Typography
                    style={styles.decadeTitle}
                    weight="700"
                    size={14}
                    color={color.brown_3C200A}
                >
                    {decadeStart}-{decadeStart + 9}
                </Typography>
                <TouchableOpacity style={styles.yearNavButton} onPress={handleNextDecade}>
                    <SvgIcons.rightArrowGreyBg />
                </TouchableOpacity>
            </View>

            <View style={styles.yearsGrid}>
                {years.map((year, index) => (
                    <TouchableOpacity
                        key={year}
                        style={[
                            styles.yearCell,
                            isOutsideDecade(year) && styles.yearCellOutside,
                            isSelectedYear(year) && styles.yearCellSelected,
                            isCurrentYear(year) && !isSelectedYear(year) && styles.yearCellCurrent,
                        ]}
                        onPress={() => handleYearPress(year)}
                    >
                        <Typography
                            weight={isSelectedYear(year) || isCurrentYear(year) ? "600" : "400"}
                            size={14}
                            color={
                                isSelectedYear(year)
                                    ? color.btnBrown_AE6F28
                                    : isOutsideDecade(year)
                                        ? color.grey_87807C
                                        : color.black_2F251D
                            }
                        >
                            {year}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// Month Picker Component
const MonthPicker = ({ visible, onClose, onMonthSelect, selectedMonth, selectedYear }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const [displayYear, setDisplayYear] = useState(selectedYear || currentYear);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const handlePrevYear = () => {
        setDisplayYear(displayYear - 1);
    };

    const handleNextYear = () => {
        setDisplayYear(displayYear + 1);
    };

    const handleMonthPress = (monthIndex) => {
        onMonthSelect(monthIndex, displayYear);
        onClose();
    };

    const isCurrentMonth = (monthIndex) => {
        return monthIndex === currentMonth && displayYear === currentYear;
    };

    const isSelectedMonth = (monthIndex) => {
        return monthIndex === selectedMonth && displayYear === selectedYear;
    };

    return (
        <View style={styles.monthPickerContainer}>
            <View style={styles.yearPickerNav}>
                <TouchableOpacity style={styles.yearNavButton} onPress={handlePrevYear}>
                    <SvgIcons.leftArrowGreyBg />
                </TouchableOpacity>
                <Typography
                    style={styles.decadeTitle}
                    weight="700"
                    size={14}
                    color={color.brown_3C200A}
                >
                    {displayYear}
                </Typography>
                <TouchableOpacity style={styles.yearNavButton} onPress={handleNextYear}>
                    <SvgIcons.rightArrowGreyBg />
                </TouchableOpacity>
            </View>

            <View style={styles.monthsGrid}>
                {monthNames.map((month, index) => (
                    <TouchableOpacity
                        key={month}
                        style={[
                            styles.monthCell,
                            isSelectedMonth(index) && styles.monthCellSelected,
                            isCurrentMonth(index) && !isSelectedMonth(index) && styles.monthCellCurrent,
                        ]}
                        onPress={() => handleMonthPress(index)}
                    >
                        <Typography
                            weight={isSelectedMonth(index) || isCurrentMonth(index) ? "600" : "400"}
                            size={14}
                            color={
                                isSelectedMonth(index)
                                    ? color.btnBrown_AE6F28
                                    : color.black_2F251D
                            }
                        >
                            {month}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// Quarter Picker Component (for Last Quarter - shows all 4 quarters)
const QuarterPicker = ({ visible, onClose, onQuarterSelect, selectedQuarter, selectedYear }) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3); // 0-based: 0=Q1, 1=Q2, 2=Q3, 3=Q4
    const [displayYear, setDisplayYear] = useState(selectedYear || currentYear);

    const quarters = [
        { label: 'Q1', subtitle: 'Jan - Mar', index: 0 },
        { label: 'Q2', subtitle: 'Apr - Jun', index: 1 },
        { label: 'Q3', subtitle: 'Jul - Sep', index: 2 },
        { label: 'Q4', subtitle: 'Oct - Dec', index: 3 },
    ];

    const handlePrevYear = () => {
        setDisplayYear(displayYear - 1);
    };

    const handleNextYear = () => {
        setDisplayYear(displayYear + 1);
    };

    const handleQuarterPress = (quarterIndex) => {
        onQuarterSelect(quarterIndex, displayYear);
        onClose();
    };

    const isCurrentQuarter = (quarterIndex) => {
        return quarterIndex === currentQuarter && displayYear === currentYear;
    };

    const isSelectedQuarter = (quarterIndex) => {
        return quarterIndex === selectedQuarter && displayYear === selectedYear;
    };

    return (
        <View style={styles.quarterPickerContainer}>
            <View style={styles.yearPickerNav}>
                <TouchableOpacity style={styles.yearNavButton} onPress={handlePrevYear}>
                    <SvgIcons.leftArrowGreyBg />
                </TouchableOpacity>
                <Typography
                    style={styles.decadeTitle}
                    weight="700"
                    size={14}
                    color={color.brown_3C200A}
                >
                    {displayYear}
                </Typography>
                <TouchableOpacity style={styles.yearNavButton} onPress={handleNextYear}>
                    <SvgIcons.rightArrowGreyBg />
                </TouchableOpacity>
            </View>

            <View style={styles.quartersGrid}>
                {quarters.map((quarter) => (
                    <TouchableOpacity
                        key={quarter.label}
                        style={[
                            styles.quarterCell,
                            isSelectedQuarter(quarter.index) && styles.quarterCellSelected,
                            isCurrentQuarter(quarter.index) && !isSelectedQuarter(quarter.index) && styles.quarterCellCurrent,
                        ]}
                        onPress={() => handleQuarterPress(quarter.index)}
                    >
                        <Typography
                            weight={isSelectedQuarter(quarter.index) || isCurrentQuarter(quarter.index) ? "600" : "500"}
                            size={16}
                            color={
                                isSelectedQuarter(quarter.index)
                                    ? color.btnBrown_AE6F28
                                    : color.black_2F251D
                            }
                        >
                            {quarter.label}
                        </Typography>
                        <Typography
                            weight="400"
                            size={12}
                            color={
                                isSelectedQuarter(quarter.index)
                                    ? color.btnBrown_AE6F28
                                    : color.grey_87807C
                            }
                            style={{ marginTop: 4 }}
                        >
                            {quarter.subtitle}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// Current Quarter Month Picker Component (for This Quarter - shows only months of current quarter)
const CurrentQuarterMonthPicker = ({ onMonthSelect, selectedMonth }) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const startMonthIndex = currentQuarter * 3;

    const allMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const quarterMonths = [
        { name: allMonthNames[startMonthIndex], index: startMonthIndex },
        { name: allMonthNames[startMonthIndex + 1], index: startMonthIndex + 1 },
        { name: allMonthNames[startMonthIndex + 2], index: startMonthIndex + 2 },
    ];

    const quarterLabel = `Q${currentQuarter + 1}`;

    const isCurrentMonth = (monthIndex) => {
        return monthIndex === currentMonth;
    };

    const isSelectedMonth = (monthIndex) => {
        return monthIndex === selectedMonth;
    };

    return (
        <View style={styles.currentQuarterContainer}>
            <Typography
                weight="700"
                size={14}
                color={color.brown_3C200A}
                style={styles.currentQuarterTitle}
            >
                {quarterLabel} - {currentYear}
            </Typography>

            <View style={styles.currentQuarterMonthsRow}>
                {quarterMonths.map((month) => (
                    <TouchableOpacity
                        key={month.name}
                        style={[
                            styles.currentQuarterMonthCell,
                            isSelectedMonth(month.index) && styles.currentQuarterMonthCellSelected,
                            isCurrentMonth(month.index) && !isSelectedMonth(month.index) && styles.currentQuarterMonthCellCurrent,
                        ]}
                        onPress={() => onMonthSelect(month.index, currentYear)}
                    >
                        <Typography
                            weight={isSelectedMonth(month.index) || isCurrentMonth(month.index) ? "600" : "500"}
                            size={16}
                            color={
                                isSelectedMonth(month.index) || isCurrentMonth(month.index)
                                    ? color.btnBrown_AE6F28
                                    : color.black_2F251D
                            }
                        >
                            {month.name}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// Date Range Picker Component
const DateRangePicker = ({ visible, onClose, onDateRangeSelect }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [activeFilter, setActiveFilter] = useState('Today');
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedMonthYear, setSelectedMonthYear] = useState(null);
    const [showQuarterPicker, setShowQuarterPicker] = useState(false);
    const [selectedQuarter, setSelectedQuarter] = useState(null);
    const [selectedQuarterYear, setSelectedQuarterYear] = useState(null);
    const [showCurrentQuarterPicker, setShowCurrentQuarterPicker] = useState(false);
    const [selectedCurrentQuarterMonth, setSelectedCurrentQuarterMonth] = useState(null);

    const filtersScrollRef = useRef(null);
    const translateY = useRef(new Animated.Value(0)).current;

    const filters = ['Today', 'Yesterday', 'Last Week', 'This Week', 'Last Month', 'This Month', 'Last Quarter', 'This Quarter', 'Last Year', 'This Year'];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    Animated.timing(translateY, {
                        toValue: 600,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        translateY.setValue(0);
                        onClose();
                    });
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            translateY.setValue(0);
            const todayDate = new Date();
            const todayStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
            setStartDate(todayStart);
            setEndDate(todayStart);
            setCurrentDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
            setActiveFilter('Today');
            setShowYearPicker(false);
            setShowMonthPicker(false);
            setShowQuarterPicker(false);
            setShowCurrentQuarterPicker(false);
            setSelectedYear(null);
            setSelectedMonth(null);
            setSelectedMonthYear(null);
            setSelectedQuarter(null);
            setSelectedQuarterYear(null);
            setSelectedCurrentQuarterMonth(null);
        }
    }, [visible]);

    // Auto-scroll to active filter
    useEffect(() => {
        if (activeFilter && filtersScrollRef.current) {
            const index = filters.indexOf(activeFilter);
            if (index >= 0) {
                const scrollX = Math.max(0, index * 110 - 40);
                setTimeout(() => {
                    filtersScrollRef.current?.scrollTo({ x: scrollX, animated: true });
                }, 100);
            }
        }
    }, [activeFilter]);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const generateCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
        const prevMonthDays = getDaysInMonth(prevMonth);

        const weeks = [];
        let week = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            week.push({
                day: prevMonthDays - i,
                month: 'prev',
                date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonthDays - i)
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            week.push({
                day,
                month: 'current',
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            });

            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }

        let nextMonthDay = 1;
        while (week.length < 7 && week.length > 0) {
            week.push({
                day: nextMonthDay,
                month: 'next',
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, nextMonthDay)
            });
            nextMonthDay++;
        }
        if (week.length > 0) weeks.push(week);

        return weeks;
    };

    const weeks = generateCalendar();

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    const isInRange = (dayObj) => {
        if (!startDate || !endDate) return false;
        const dayDate = new Date(dayObj.date.getFullYear(), dayObj.date.getMonth(), dayObj.date.getDate());
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        return dayDate > start && dayDate < end;
    };

    const isStartDate = (dayObj) => {
        return isSameDay(dayObj.date, startDate);
    };

    const isEndDate = (dayObj) => {
        return isSameDay(dayObj.date, endDate);
    };

    const handleDayPress = (dayObj) => {
        if (dayObj.month !== 'current') return;

        const selectedDate = new Date(dayObj.date.getFullYear(), dayObj.date.getMonth(), dayObj.date.getDate());
        setActiveFilter(null);
        setShowYearPicker(false);
        setShowMonthPicker(false);
        setShowQuarterPicker(false);
        setShowCurrentQuarterPicker(false);

        if (!startDate || (startDate && endDate)) {
            setStartDate(selectedDate);
            setEndDate(null);
        } else if (selectedDate < startDate) {
            setStartDate(selectedDate);
            setEndDate(null);
        } else {
            setEndDate(selectedDate);
        }
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        setStartDate(start);
        setEndDate(end);
        setCurrentDate(new Date(year, 0, 1));
        setShowYearPicker(false);
    };

    const handleMonthSelect = (monthIndex, year) => {
        setSelectedMonth(monthIndex);
        setSelectedMonthYear(year);
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0);
        setStartDate(start);
        setEndDate(end);
        setCurrentDate(new Date(year, monthIndex, 1));
        setShowMonthPicker(false);
    };

    const handleQuarterSelect = (quarterIndex, year) => {
        setSelectedQuarter(quarterIndex);
        setSelectedQuarterYear(year);
        const startMonth = quarterIndex * 3;
        const start = new Date(year, startMonth, 1);
        const end = new Date(year, startMonth + 3, 0);
        setStartDate(start);
        setEndDate(end);
        setCurrentDate(new Date(year, startMonth, 1));
        setShowQuarterPicker(false);
    };

    const handleCurrentQuarterMonthSelect = (monthIndex, year) => {
        setSelectedCurrentQuarterMonth(monthIndex);
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0);
        setStartDate(start);
        setEndDate(end);
        setCurrentDate(new Date(year, monthIndex, 1));
        setShowCurrentQuarterPicker(false);
    };

    const hideAllPickers = () => {
        setShowYearPicker(false);
        setShowMonthPicker(false);
        setShowQuarterPicker(false);
        setShowCurrentQuarterPicker(false);
    };

    const handleFilterPress = (filter) => {
        setActiveFilter(filter);
        const todayDate = new Date();
        let start, end;

        if (filter === 'Last Year') {
            hideAllPickers();
            setShowYearPicker(true);
            setSelectedYear(todayDate.getFullYear());
            return;
        }

        if (filter === 'Last Month') {
            hideAllPickers();
            setShowMonthPicker(true);
            setSelectedMonth(todayDate.getMonth());
            setSelectedMonthYear(todayDate.getFullYear());
            return;
        }

        if (filter === 'Last Quarter') {
            hideAllPickers();
            setShowQuarterPicker(true);
            const currentQuarter = Math.floor(todayDate.getMonth() / 3);
            setSelectedQuarter(currentQuarter);
            setSelectedQuarterYear(todayDate.getFullYear());
            return;
        }

        if (filter === 'This Quarter') {
            hideAllPickers();
            setShowCurrentQuarterPicker(true);
            setSelectedCurrentQuarterMonth(null);
            // Set date range for the full current quarter
            const currentQuarter = Math.floor(todayDate.getMonth() / 3);
            const startMonth = currentQuarter * 3;
            start = new Date(todayDate.getFullYear(), startMonth, 1);
            end = new Date(todayDate.getFullYear(), startMonth + 3, 0);
            setStartDate(start);
            setEndDate(end);
            setCurrentDate(new Date(todayDate.getFullYear(), startMonth, 1));
            return;
        }

        hideAllPickers();

        switch (filter) {
            case 'Today':
                start = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
                end = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
                break;
            case 'Yesterday':
                const yesterday = new Date(todayDate);
                yesterday.setDate(yesterday.getDate() - 1);
                start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                break;
            case 'This Week':
                start = new Date(todayDate);
                start.setDate(start.getDate() - start.getDay());
                start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                end = new Date(start);
                end.setDate(end.getDate() + 6);
                end = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                break;
            case 'Last Week':
                start = new Date(todayDate);
                start.setDate(start.getDate() - start.getDay() - 7);
                start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                end = new Date(start);
                end.setDate(end.getDate() + 6);
                end = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                break;
            case 'This Month':
                start = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
                end = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
                break;
            case 'This Year':
                start = new Date(todayDate.getFullYear(), 0, 1);
                end = new Date(todayDate.getFullYear(), 11, 31);
                break;
            default:
                return;
        }

        setStartDate(start);
        setEndDate(end);
        setCurrentDate(new Date(start.getFullYear(), start.getMonth(), 1));
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleApply = () => {
        if (startDate && endDate && onDateRangeSelect) {
            onDateRangeSelect({ startDate, endDate });
        }
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <Animated.View
                    style={[styles.datePickerModal, { transform: [{ translateY }] }]}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.modalHandle} />
                    <Typography
                        style={styles.datePickerTitle}
                        weight="700"
                        size={16}
                        color={color.brown_3C200A}
                    >
                        Date Range
                    </Typography>

                    <ScrollView
                        ref={filtersScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filtersScroll}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    activeFilter === filter && styles.filterChipActive,
                                ]}
                                onPress={() => handleFilterPress(filter)}
                            >
                                <Typography
                                    style={[
                                        styles.filterChipText,
                                        activeFilter === filter && styles.filterChipTextActive,
                                    ]}
                                    weight={activeFilter === filter ? "600" : "400"}
                                    size={14}
                                    color={activeFilter === filter ? "white" : color.brown_766F6A}
                                >
                                    {filter}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {showYearPicker ? (
                        <YearPicker
                            visible={showYearPicker}
                            onClose={() => setShowYearPicker(false)}
                            onYearSelect={handleYearSelect}
                            selectedYear={selectedYear}
                        />
                    ) : showMonthPicker ? (
                        <MonthPicker
                            visible={showMonthPicker}
                            onClose={() => setShowMonthPicker(false)}
                            onMonthSelect={handleMonthSelect}
                            selectedMonth={selectedMonth}
                            selectedYear={selectedMonthYear}
                        />
                    ) : showQuarterPicker ? (
                        <QuarterPicker
                            visible={showQuarterPicker}
                            onClose={() => setShowQuarterPicker(false)}
                            onQuarterSelect={handleQuarterSelect}
                            selectedQuarter={selectedQuarter}
                            selectedYear={selectedQuarterYear}
                        />
                    ) : showCurrentQuarterPicker ? (
                        <CurrentQuarterMonthPicker
                            onMonthSelect={handleCurrentQuarterMonthSelect}
                            selectedMonth={selectedCurrentQuarterMonth}
                        />
                    ) : (
                        <>
                            <View style={styles.calendarNav}>
                                <TouchableOpacity onPress={handlePrevMonth}>
                                    <SvgIcons.leftArrowGreyBg />
                                </TouchableOpacity>
                                <Typography
                                    style={styles.monthTitle}
                                    weight="700"
                                    size={16}
                                    color={color.brown_3C200A}
                                >
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </Typography>
                                <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
                                    <SvgIcons.rightArrowGreyBg />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dayHeaders}>
                                {days.map((day) => (
                                    <Typography
                                        key={day}
                                        style={styles.dayHeader}
                                        weight="400"
                                        size={14}
                                        color={color.grey_87807C}
                                    >
                                        {day}
                                    </Typography>
                                ))}
                            </View>

                            {weeks.map((week, weekIndex) => (
                                <View key={weekIndex} style={styles.weekRow}>
                                    {week.map((dayObj, dayIndex) => {
                                        const inRange = isInRange(dayObj);
                                        const isStart = isStartDate(dayObj);
                                        const isEnd = isEndDate(dayObj);
                                        const isBothStartAndEnd = isStart && isSameDay(startDate, endDate);
                                        const isPrevMonth = dayObj.month === 'prev';
                                        const isNextMonth = dayObj.month === 'next';

                                        return (
                                            <TouchableOpacity
                                                key={dayIndex}
                                                style={[
                                                    styles.dayCell,
                                                    inRange && styles.dayCellInRange,
                                                    isStart && !isBothStartAndEnd && styles.dayCellStart,
                                                    isEnd && !isBothStartAndEnd && styles.dayCellEnd,
                                                    isBothStartAndEnd && isStart && styles.dayCellSingle,
                                                ]}
                                                onPress={() => handleDayPress(dayObj)}
                                                disabled={isPrevMonth || isNextMonth}
                                            >
                                                <Typography
                                                    style={[
                                                        styles.dayText,
                                                        (isPrevMonth || isNextMonth) && styles.dayTextMuted,
                                                        inRange && styles.dayTextInRange,
                                                        (isStart || isEnd) && styles.dayTextEnd,
                                                    ]}
                                                    weight={(isStart || isEnd) ? "600" : "400"}
                                                    size={14}
                                                    color={
                                                        (isPrevMonth || isNextMonth)
                                                            ? color.grey_87807C
                                                            : (isStart || isEnd)
                                                                ? "white"
                                                                : inRange
                                                                    ? color.btnBrown_AE6F28
                                                                    : color.black_2F251D
                                                    }
                                                >
                                                    {dayObj.day.toString().padStart(2, '0')}
                                                </Typography>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}
                        </>
                    )}

                    {startDate && endDate && (
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Typography
                                style={styles.applyButtonText}
                                weight="600"
                                size={16}
                                color="white"
                            >
                                Apply
                            </Typography>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

// Main Dashboard Component
const AdminAllEventsDashboard = () => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState('Jan 23, 2026');

    // Bottom Sheet Picker States
    const [showEventTypePicker, setShowEventTypePicker] = useState(false);
    const [showTicketingTypePicker, setShowTicketingTypePicker] = useState(false);

    // Popover Dropdown States
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [showFilterByEventDropdown, setShowFilterByEventDropdown] = useState(false);

    // Selected Values
    const [selectedEventType, setSelectedEventType] = useState('Standard');
    const [selectedTicketingType, setSelectedTicketingType] = useState('Standard');
    const [selectedCurrency, setSelectedCurrency] = useState('GHS');
    const [selectedFilterByEvent, setSelectedFilterByEvent] = useState('All');

    // Refs for popover positioning
    const currencyRef = useRef(null);
    const filterByEventRef = useRef(null);

    // Dynamic Options (replace with API data in future)
    const eventTypeOptions = [
        { label: 'Standard', value: 'Standard' },
        { label: 'Recurring', value: 'Recurring' },
        { label: 'Multi Day Same Venue', value: 'Multi Day Same Venue' },
        { label: 'Multi Day Multi Venue', value: 'Multi Day Multi Venue' },
    ];

    const ticketingTypeOptions = [
        { label: 'Standard', value: 'Standard' },
        { label: 'Members', value: 'Members' },
        { label: 'Early Bird', value: 'Early Bird' },
        { label: 'Packages', value: 'Packages' },
    ];

    const currencyOptions = [
        { label: 'USD', value: 'USD' },
        { label: 'Pounds', value: 'Pounds' },
        { label: 'EUR', value: 'EUR' },
        { label: 'AED', value: 'AED' },
        { label: 'QAR', value: 'QAR' },
        { label: 'GHS', value: 'GHS' },
        { label: 'PKR', value: 'PKR' },
    ];

    const filterByEventOptions = [
        { label: 'All', value: 'All' },
        { label: 'Standard', value: 'Standard' },
        { label: 'Recurring', value: 'Recurring' },
        { label: 'Multi Day Same Venue', value: 'Multi Day Same Venue' },
        { label: 'Multi Day Multi Venue', value: 'Multi Day Multi Venue' },
    ];

    const eventData = [
        { label: 'Today', value: 12, color: color.btnBrown_AE6F28 },
        { label: 'Upcoming', value: 9, color: color.brown_D58E00 },
        { label: 'Past', value: 8, color: color.grey_87807C },
    ];

    const handleDateRangeSelect = ({ startDate, endDate }) => {
        const formatDate = (date) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        };

        if (startDate && endDate) {
            if (startDate.getTime() === endDate.getTime()) {
                setSelectedDate(formatDate(startDate));
            } else {
                setSelectedDate(`${formatDate(startDate)} - ${formatDate(endDate)}`);
            }
        } else if (startDate) {
            setSelectedDate(formatDate(startDate));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRight}>
                    <TouchableOpacity>
                        <SvgIcons.drawerSvg width={24} height={24} fill="transparent" />
                    </TouchableOpacity>
                    <Typography
                        style={styles.pageTitle}
                        weight="700"
                        size={20}
                        color={color.brown_3C200A}
                    >
                        Dashboard
                    </Typography>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.bellButton}>
                        <SvgIcons.bellIcon width={28} height={28} fill="transparent" />
                    </TouchableOpacity>
                    <View style={styles.headerDivider} />
                    <View style={styles.avatar}>
                        <SvgIcons.profileImage width={40} height={40} />
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>


                <View style={styles.filters}>
                    <View style={styles.dropdownWrapper}>
                        <Dropdown
                            value={selectedEventType}
                            onPress={() => setShowEventTypePicker(true)}
                        />
                    </View>
                    <View style={styles.dropdownWrapper}>
                        <Dropdown
                            value={selectedTicketingType}
                            onPress={() => setShowTicketingTypePicker(true)}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowDatePicker(true)}
                >
                    <SvgIcons.calendarIcon />
                    <Typography
                        style={styles.dateSelectorText}
                        weight="400"
                        size={14}
                        color={color.brown_766F6A}
                    >
                        {selectedDate}
                    </Typography>
                    <SvgIcons.downArrow />
                </TouchableOpacity>

                {/* Earnings Card */}
                <Card>
                    <Typography
                        style={styles.cardTitle}
                        weight="700"
                        size={13}
                        color={color.placeholderTxt_24282C}
                    >
                        Earnings
                    </Typography>
                    <View style={styles.earningsHeader}>
                        <View style={styles.earningsInfo}>
                            <SvgIcons.earningArrow />
                            <View>
                                <Typography
                                    style={styles.earningsLabel}
                                    weight="400"
                                    size={10}
                                    color={color.brown_3C200A}
                                >
                                    Earned:
                                </Typography>
                                <Typography
                                    style={styles.earningsValue}
                                    weight="700"
                                    size={14}
                                    color={color.brown_3C200A}
                                >
                                    GHS 355,627.00
                                </Typography>
                            </View>
                        </View>
                        <View style={styles.filterByEventContainer}>
                            <Typography
                                style={styles.filterByEvent}
                                weight="400"
                                size={10}
                                color={color.brown_3C200A}
                            >
                                Currency:
                            </Typography>
                            <View ref={currencyRef} collapsable={false}>
                                <DropdownEarningAttendeesFilter
                                    value={selectedCurrency}
                                    onPress={() => setShowCurrencyDropdown(true)}
                                />
                            </View>
                        </View>
                    </View>
                    <EarningsChart />
                </Card>

                {/* Attendees Card */}
                <Card>
                    <View style={styles.attendeesHeader}>
                        <Typography
                            style={styles.cardTitle}
                            weight="700"
                            size={13}
                            color={color.placeholderTxt_24282C}
                        >
                            Attendees
                        </Typography>
                    </View>
                    <View style={styles.attendeesInfo}>
                        <View style={styles.attendeesLeftSection}>
                            <SvgIcons.attendeesPerson />
                            <View>
                                <Typography
                                    style={styles.attendeesLabel}
                                    weight="400"
                                    size={12}
                                    color={color.grey_87807C}
                                >
                                    Attendees:
                                </Typography>
                                <Typography
                                    style={styles.attendeesValue}
                                    weight="700"
                                    size={18}
                                    color={color.black_2F251D}
                                >
                                    25,000
                                </Typography>
                            </View>
                        </View>
                        <View style={styles.filterByEventContainer}>
                            <Typography
                                style={styles.filterByEvent}
                                weight="400"
                                size={10}
                                color={color.brown_3C200A}
                            >
                                Filter by Event:
                            </Typography>
                            <View ref={filterByEventRef} collapsable={false}>
                                <DropdownEarningAttendeesFilter
                                    value={selectedFilterByEvent}
                                    onPress={() => setShowFilterByEventDropdown(true)}
                                />
                            </View>
                        </View>
                    </View>
                    <AttendeesChart />
                </Card>

                {/* Event Card */}
                <Card>
                    <Typography
                        style={styles.cardTitle}
                        weight="700"
                        size={13}
                        color={color.placeholderTxt_24282C}
                    >
                        Event
                    </Typography>
                    <View style={styles.eventContent}>
                        <DonutChart data={eventData} />
                        <View style={styles.eventLegend}>
                            {eventData.map((item, index) => (
                                <View key={index} style={styles.eventLegendItem}>
                                    <View style={[styles.eventLegendDot, { backgroundColor: item.color }]} />
                                    <Typography
                                        style={styles.eventLegendLabel}
                                        weight="500"
                                        size={14}
                                        color={color.placeholderTxt_24282C}
                                    >
                                        {item.label}
                                    </Typography>
                                    <Typography
                                        style={styles.eventLegendValue}
                                        weight="400"
                                        size={14}
                                        color={color.black_544B45}
                                    >
                                        {item.value.toString().padStart(2, '0')}
                                    </Typography>
                                </View>
                            ))}
                        </View>
                    </View>
                </Card>

                {/* Statistics Card */}
                <Card style={styles.statisticsCard}>
                    <Typography
                        style={styles.cardTitle}
                        weight="700"
                        size={13}
                        color={color.placeholderTxt_24282C}
                    >
                        Statistics
                    </Typography>

                    <TicketStatBox
                        icon={<SvgIcons.ticketIcon width={32} height={32} />}
                        label="Ticket Sold"
                        count="102"
                        grossAmount="GHS 100,000.00"
                        netAmount="GHS 95,000.00"
                    />

                    <View style={styles.statRow}>
                        <MiniStatCard
                            icon={<SvgIcons.ticketsRefunded width={32} height={32} />}
                            label="Tickets Refunded"
                            count="102"
                            amount="GHS 50,0000.00"
                        />
                        <MiniStatCard
                            icon={<SvgIcons.ticketCanceled width={32} height={32} />}
                            label="Tickets Canceled"
                            count="102"
                            amount="GHS 20,0000.00"
                        />
                    </View>
                </Card>

                {/* Coupons Card */}
                <Card style={[styles.lastCard, styles.statisticsCard]}>
                    <Typography
                        style={styles.cardTitle}
                        weight="700"
                        size={13}
                        color={color.placeholderTxt_24282C}
                    >
                        Coupons
                    </Typography>

                    <TicketStatBox
                        icon={<SvgIcons.couponIcon width={32} height={32} />}
                        label="Total Issued"
                        count="102"
                        grossAmount="GHS 100,000.00"
                        netAmount="GHS 95,000.00"
                    />

                    <View style={styles.statRow}>
                        <MiniStatCard
                            icon={<SvgIcons.totalActiveCoupon width={32} height={32} />}
                            label="Total Active"
                            count="05"
                            amount="GHS 50,000.00"
                        />
                        <MiniStatCard
                            icon={<SvgIcons.totalUsedCoupon width={32} height={32} />}
                            label="Total Used"
                            count="10"
                            amount="GHS 20,000.00"
                        />
                    </View>

                    <View style={styles.statRow}>
                        <MiniStatCard
                            icon={<SvgIcons.totalUnusedCoupon width={32} height={32} />}
                            label="Total Unused"
                            count="10"
                            amount="GHS 20,000.00"
                        />
                        <MiniStatCard
                            icon={<SvgIcons.ticketCanceled width={32} height={32} />}
                            label="Total Canceled"
                            count="102"
                            amount="GHS 20,000.00"
                        />
                    </View>
                </Card>
            </ScrollView>

            <DateRangePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onDateRangeSelect={handleDateRangeSelect}
            />

            {/* Event Type Bottom Sheet */}
            <BottomSheetRadioPicker
                visible={showEventTypePicker}
                onClose={() => setShowEventTypePicker(false)}
                title="Event Type"
                options={eventTypeOptions}
                selectedValue={selectedEventType}
                onSelect={(option) => setSelectedEventType(option.value)}
            />

            {/* Ticketing Type Bottom Sheet */}
            <BottomSheetRadioPicker
                visible={showTicketingTypePicker}
                onClose={() => setShowTicketingTypePicker(false)}
                title="Ticketing Type"
                options={ticketingTypeOptions}
                selectedValue={selectedTicketingType}
                onSelect={(option) => setSelectedTicketingType(option.value)}
            />

            {/* Currency Popover Dropdown */}
            <PopoverDropdown
                visible={showCurrencyDropdown}
                onClose={() => setShowCurrencyDropdown(false)}
                options={currencyOptions}
                selectedValue={selectedCurrency}
                onSelect={(option) => setSelectedCurrency(option.value)}
                anchorRef={currencyRef}
            />

            {/* Filter by Event Popover Dropdown */}
            <PopoverDropdown
                visible={showFilterByEventDropdown}
                onClose={() => setShowFilterByEventDropdown(false)}
                options={filterByEventOptions}
                selectedValue={selectedFilterByEvent}
                onSelect={(option) => setSelectedFilterByEvent(option.value)}
                anchorRef={filterByEventRef}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bellButton: {
        position: 'relative',
    },
    headerDivider: {
        width: 2,
        height: 40,
        backgroundColor: color.grey_E5E7EB,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: color.btnBrown_AE6F28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: color.brown_3C200A,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 12,
        width: '100%',
    },
    dropdownWrapper: {
        flex: 1,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.white_FFFFFF,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        borderWidth: 0.1,
        borderColor: color.grey_DADADA,
        justifyContent: 'space-between',
        minWidth: 80,
    },
    dropdownLabel: {
        fontSize: 12,
        color: color.grey_87807C,
    },
    dropdownValue: {
        fontSize: 14,
        color: color.brown_766F6A,
        flex: 1,
    },
    dropdownEarningAttendeesFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.white_FFFFFF,
        borderRadius: 24,
        paddingHorizontal: 14,
        paddingVertical: 6,
        gap: 8,
        borderWidth: 0.1,
        borderColor: color.grey_DADADA,
        justifyContent: 'space-between',
        minWidth: 75,
        maxWidth: 120,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.white_FFFFFF,
        marginHorizontal: 20,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        borderWidth: 0.1,
        borderColor: color.grey_DADADA,
        marginBottom: 16,
    },
    dateSelectorText: {
        flex: 1,
        fontSize: 14,
        color: color.brown_766F6A,
    },
    card: {
        backgroundColor: color.white_FFFFFF,
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    statisticsCard: {
        overflow: 'visible',
    },
    lastCard: {
        marginBottom: 40,
    },
    cardTitle: {
        marginBottom: 16,
    },
    earningsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    earningsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        marginRight: 12,
    },
    yAxisLabels: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: 150,
        justifyContent: 'space-between',
    },
    axisLabel: {
        fontSize: 10,
        color: color.grey_87807C,
    },
    chartScroll: {
        marginLeft: 30,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 180,
        paddingTop: 20,
    },
    barGroup: {
        alignItems: 'center',
        marginRight: 20,
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    bar: {
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    barLabel: {
        fontSize: 10,
        color: color.grey_87807C,
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: color.grey_E5E7EB,
        marginTop: 16,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 4,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 12,
        color: color.brown_766F6A,
    },
    attendeesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    attendeesInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
    },
    attendeesLeftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    attendeesLabel: {
        fontSize: 12,
        color: color.grey_87807C,
    },
    attendeesValue: {
        fontSize: 18,
        fontWeight: '700',
        color: color.black_2F251D,
    },
    filterByEventContainer: {
        alignItems: 'flex-end',
        flex: 0,
        minWidth: 100,
        maxWidth: 150,
    },
    filterByEvent: {
        marginBottom: 4,
    },
    attendeesChartContainer: {
        marginTop: 8,
    },
    chartWrapper: {
        flexDirection: 'row',
    },
    yAxisLabelsAttendees: {
        width: 40,
        justifyContent: 'space-between',
        height: 200,
        paddingTop: 15,
    },
    axisLabelAttendees: {
        fontSize: 12,
        color: color.grey_87807C,
    },
    chartAreaAttendees: {
        flex: 1,
        position: 'relative',
    },
    xAxisLabelsAttendees: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 30,
        paddingRight: 10,
        marginTop: -22,
    },
    xAxisLabelTouch: {
        padding: 4,
    },
    eventContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    donutContainer: {
        position: 'relative',
        width: 140,
        height: 140,
    },
    donutCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutTotal: {
        fontSize: 24,
        fontWeight: '700',
        color: color.black_2F251D,
    },
    donutLabel: {
        fontSize: 12,
        color: color.grey_87807C,
    },
    eventLegend: {
        flex: 1,
        gap: 16,
    },
    eventLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    eventLegendDot: {
        width: 12,
        height: 12,
        borderRadius: 4,
    },
    eventLegendLabel: {
        flex: 1,
        fontSize: 16,
    },
    eventLegendValue: {
        fontSize: 16,
        fontWeight: '400',
        color: color.grey_87807C,
    },
    // Ticket Stat Box Styles
    ticketWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    ticketContainer: {
        backgroundColor: color.lightBrown_FFF6DF,
        borderRadius: 16,
    },
    ticketTopSection: {
        padding: 16,
        paddingBottom: 12,
    },
    ticketHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ticketIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: color.white_FFFFFF,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ticketDividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 2,
        paddingHorizontal: 24,
    },
    ticketBottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 12,
    },
    ticketAmountItem: {
        flex: 1,
    },
    cutoutAbsolute: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: color.white_FFFFFF,
    },
    // Mini Stat Card Styles
    statRow: {
        flexDirection: 'row',
        gap: 12,
    },
    miniStatCard: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    miniStatIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: color.white_FFFFFF,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    miniStatLabel: {
        fontSize: 12,
        color: color.brown_766F6A,
        marginBottom: 4,
        textAlign: 'center',
    },
    miniStatCount: {
        fontSize: 14,
        fontWeight: '700',
        color: color.black_2F251D,
        marginBottom: 2,
    },
    miniStatAmount: {
        fontSize: 12,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    datePickerModal: {
        backgroundColor: color.white_FFFFFF,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: color.grey_AFAFAF,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    datePickerTitle: {
        marginBottom: 16,
    },
    filtersScroll: {
        marginBottom: 20,
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingVertical: 5,
        backgroundColor: color.grey_E5E7EB,
    },
    filterChip: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 30,
    },
    filterChipActive: {
        backgroundColor: color.btnBrown_AE6F28,
    },
    filterChipText: {
        fontSize: 12,
        color: color.brown_766F6A,
    },
    filterChipTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    calendarNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthTitle: {
    },
    dayHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    dayHeader: {
        fontSize: 14,
        color: color.grey_87807C,
        width: 48,
        textAlign: 'center',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    dayCell: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCellInRange: {
        backgroundColor: color.lightBrown_FFF6DF,
    },
    dayCellStart: {
        backgroundColor: color.brown_D58E00,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    dayCellEnd: {
        backgroundColor: color.brown_D58E00,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    dayCellSingle: {
        backgroundColor: color.brown_D58E00,
        borderRadius: 12,
    },
    dayText: {
        fontSize: 14,
        color: color.black_2F251D,
    },
    dayTextMuted: {
        color: color.grey_87807C,
    },
    dayTextInRange: {
        color: color.btnBrown_AE6F28,
    },
    dayTextEnd: {
        color: 'white',
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: color.btnBrown_AE6F28,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Year Picker Styles
    yearPickerContainer: {
        paddingVertical: 10,
    },
    yearPickerNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    yearNavButton: {
        padding: 10,
    },
    decadeTitle: {
    },
    yearsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    yearCell: {
        width: '23%',
        paddingVertical: 16,
        marginBottom: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    yearCellOutside: {
        backgroundColor: 'transparent',
    },
    yearCellSelected: {
        backgroundColor: color.white_FFFFFF,
        borderWidth: 2,
        borderColor: color.btnBrown_AE6F28,
    },
    yearCellCurrent: {
        backgroundColor: color.lightBrown_FFF6DF,
    },
    // Month Picker Styles
    monthPickerContainer: {
        paddingVertical: 10,
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    monthCell: {
        width: '23%',
        paddingVertical: 16,
        marginBottom: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthCellSelected: {
        backgroundColor: color.white_FFFFFF,
        borderWidth: 2,
        borderColor: color.btnBrown_AE6F28,
    },
    monthCellCurrent: {
        backgroundColor: color.lightBrown_FFF6DF,
    },
    // Quarter Picker Styles
    quarterPickerContainer: {
        paddingVertical: 10,
    },
    quartersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    quarterCell: {
        width: '48%',
        paddingVertical: 20,
        marginBottom: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    quarterCellSelected: {
        backgroundColor: color.white_FFFFFF,
        borderWidth: 2,
        borderColor: color.btnBrown_AE6F28,
    },
    quarterCellCurrent: {
        backgroundColor: color.lightBrown_FFF6DF,
    },
    // Current Quarter Month Picker Styles
    currentQuarterContainer: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    currentQuarterTitle: {
        marginBottom: 20,
    },
    currentQuarterMonthsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        width: '100%',
    },
    currentQuarterMonthCell: {
        width: '30%',
        paddingVertical: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    currentQuarterMonthCellSelected: {
        backgroundColor: color.white_FFFFFF,
        borderWidth: 2,
        borderColor: color.btnBrown_AE6F28,
    },
    currentQuarterMonthCellCurrent: {
        backgroundColor: color.white_FFFFFF,
        borderWidth: 2,
        borderColor: color.btnBrown_AE6F28,
    },
    // Bottom Sheet Radio Picker Styles
    bottomSheetOverlayWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomSheetOverlayBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    bottomSheetPickerModal: {
        backgroundColor: color.white_FFFFFF,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    bottomSheetPickerTitle: {
        marginBottom: 20,
    },
    bottomSheetOptionsList: {
        maxHeight: 400,
    },
    radioOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: color.borderBrown_CEBCA0,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    radioOuterSelected: {
        borderColor: color.btnBrown_AE6F28,
        borderWidth: 2.5,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: color.btnBrown_AE6F28,
    },
    radioLabel: {
        flex: 1,
    },
    // Popover Dropdown Styles
    popoverOverlay: {
        flex: 1,
    },
    popoverContainer: {
        position: 'absolute',
        backgroundColor: color.white_FFFFFF,
        borderRadius: 12,
        paddingVertical: 4,
        minWidth: 50,
        maxHeight: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    popoverScroll: {
        maxHeight: 240,
    },
    popoverOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    popoverOptionBorder: {
        borderBottomWidth: 0,
    },
});

export default AdminAllEventsDashboard;