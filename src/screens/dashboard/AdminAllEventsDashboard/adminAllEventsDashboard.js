import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import SvgIcons from '../../../components/SvgIcons';
import { color } from '../../../color/color';
import Typography from '../../../components/Typography';

const { width } = Dimensions.get('window');

// Dropdown Component
const Dropdown = ({ label, value }) => (
    <TouchableOpacity style={styles.dropdown}>
        {label && (
            <Typography
                style={styles.dropdownLabel}
                weight="400"
                size={12}
                color={color.grey_87807C}
            >
                {label}
            </Typography>
        )}
        <Typography
            style={styles.dropdownValue}
            weight="400"
            size={14}
            color={color.brown_766F6A}
        >
            {value}
        </Typography>
        <SvgIcons.downArrow />
    </TouchableOpacity>
);

// DropdownEarningAttendeesFilter Component
const DropdownEarningAttendeesFilter = ({ label, value }) => (
    <TouchableOpacity style={styles.dropdownEarningAttendeesFilter}>
        {label && (
            <Typography
                style={styles.dropdownLabel}
                weight="400"
                size={12}
                color={color.grey_87807C}
            >
                {label}
            </Typography>
        )}
        <Typography
            style={styles.dropdownValue}
            weight="400"
            size={14}
            color={color.brown_766F6A}
        >
            {value}
        </Typography>
        <SvgIcons.downArrow />
    </TouchableOpacity>
);

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
    years.push(decadeStart - 1);
    for (let i = 0; i < 10; i++) {
        years.push(decadeStart + i);
    }
    years.push(decadeStart + 10);

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
                    <Typography weight="600" size={18} color={color.grey_87807C}>
                        {'<<'}
                    </Typography>
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
                    <Typography weight="600" size={18} color={color.grey_87807C}>
                        {'>>'}
                    </Typography>
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

// Date Range Picker Component
const DateRangePicker = ({ visible, onClose, onDateRangeSelect }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [activeFilter, setActiveFilter] = useState('Today');
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    const filters = ['Today', 'Yesterday', 'Last Week', 'This Week', 'Last Month', 'This Month', 'Last Quarter', 'This Quarter', 'Last Year', 'This Year'];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        if (visible) {
            const todayDate = new Date();
            const todayStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
            setStartDate(todayStart);
            setEndDate(todayStart);
            setCurrentDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
            setActiveFilter('Today');
            setShowYearPicker(false);
            setSelectedYear(null);
        }
    }, [visible]);

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

    const handleFilterPress = (filter) => {
        setActiveFilter(filter);
        const todayDate = new Date();
        let start, end;

        if (filter === 'Last Year') {
            setShowYearPicker(true);
            setSelectedYear(todayDate.getFullYear());
            return;
        }

        setShowYearPicker(false);

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
            case 'Last Month':
                start = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
                end = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0);
                break;
            case 'This Quarter': {
                const currentQuarter = Math.floor(todayDate.getMonth() / 3);
                start = new Date(todayDate.getFullYear(), currentQuarter * 3, 1);
                end = new Date(todayDate.getFullYear(), currentQuarter * 3 + 3, 0);
                break;
            }
            case 'Last Quarter': {
                const lastQuarter = Math.floor(todayDate.getMonth() / 3) - 1;
                if (lastQuarter < 0) {
                    start = new Date(todayDate.getFullYear() - 1, 9, 1);
                    end = new Date(todayDate.getFullYear() - 1, 12, 0);
                } else {
                    start = new Date(todayDate.getFullYear(), lastQuarter * 3, 1);
                    end = new Date(todayDate.getFullYear(), lastQuarter * 3 + 3, 0);
                }
                break;
            }
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
                <TouchableOpacity style={styles.datePickerModal} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalHandle} />
                    <Typography
                        style={styles.datePickerTitle}
                        weight="700"
                        size={16}
                        color={color.brown_3C200A}
                    >
                        Date Range
                    </Typography>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
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
                    ) : (
                        <>
                            <View style={styles.calendarNav}>
                                <TouchableOpacity style={styles.navButton} onPress={handlePrevMonth}>
                                    <SvgIcons.leftArrow width={10} height={10} fill="transparent" />
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
                                    <SvgIcons.rightArrow width={5} height={5} fill="transparent" />
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
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// Main Dashboard Component
const AdminAllEventsDashboard = () => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState('Jan 23, 2026');

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
                        <Dropdown value="Event Type" />
                    </View>
                    <View style={styles.dropdownWrapper}>
                        <Dropdown value="Ticketing Type" />
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
                            <DropdownEarningAttendeesFilter value="GHS" />
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
                            <DropdownEarningAttendeesFilter value="All" />
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 8,
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
    navButton: {
        width: 30,
        height: 30,
        borderRadius: 22,
        backgroundColor: '#DDDDDD',
        justifyContent: 'center',
        alignItems: 'center',
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
        width: '30%',
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
});

export default AdminAllEventsDashboard;