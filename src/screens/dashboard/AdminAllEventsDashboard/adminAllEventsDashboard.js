import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    PanResponder,
    Animated,
    Dimensions,
} from 'react-native';
import SvgIcons from '../../../components/SvgIcons';
import { color } from '../../../color/color';
import Typography from '../../../components/Typography';
import BottomSheetRadioPicker from '../../../constants/bottomSheetRadioPicker';
import AdminEarningCard from './AdminEarningCard';
import AdminAttendeesCard from './AdminAttendeesCard';
import AdminEventCard from './AdminEventCard';
import AdminStatisticsCard from './AdminStatisticsCard';
import AdminCouponsCard from './AdminCouponsCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dropdown Component
const Dropdown = ({ value, onPress }) => (
    <TouchableOpacity style={styles.dropdown} onPress={onPress}>
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

// Year Picker Component
const YearPicker = ({ onYearSelect, selectedYear }) => {
    const currentYear = new Date().getFullYear();
    const [decadeStart, setDecadeStart] = useState(
        Math.floor((selectedYear || currentYear) / 10) * 10
    );

    const years = [];
    for (let i = -1; i < 11; i++) {
        years.push(decadeStart + i);
    }

    const isOutsideDecade = (year) => year < decadeStart || year >= decadeStart + 10;
    const isCurrentYear = (year) => year === currentYear;
    const isSelectedYear = (year) => year === selectedYear;

    return (
        <View style={styles.yearPickerContainer}>
            <View style={styles.pickerNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => setDecadeStart(decadeStart - 10)}>
                    <SvgIcons.leftArrowGreyBg />
                </TouchableOpacity>
                <Typography weight="700" size={14} color={color.brown_3C200A}>
                    {decadeStart}-{decadeStart + 9}
                </Typography>
                <TouchableOpacity style={styles.navButton} onPress={() => setDecadeStart(decadeStart + 10)}>
                    <SvgIcons.rightArrowGreyBg />
                </TouchableOpacity>
            </View>
            <View style={styles.yearsGrid}>
                {years.map((year) => (
                    <TouchableOpacity
                        key={year}
                        style={[
                            styles.yearCell,
                            isOutsideDecade(year) && styles.cellOutside,
                            isSelectedYear(year) && styles.cellSelected,
                            isCurrentYear(year) && !isSelectedYear(year) && styles.cellCurrent,
                        ]}
                        onPress={() => onYearSelect(year)}
                    >
                        <Typography
                            weight={isSelectedYear(year) || isCurrentYear(year) ? '600' : '400'}
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
const MonthPicker = ({ onMonthSelect, selectedMonth, selectedYear }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const [displayYear, setDisplayYear] = useState(selectedYear || currentYear);

    useEffect(() => {
        if (selectedYear !== null && selectedYear !== undefined) {
            setDisplayYear(selectedYear);
        }
    }, [selectedYear]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const isCurrentMonth = (idx) => idx === currentMonth && displayYear === currentYear;
    const isSelectedMonth = (idx) => idx === selectedMonth && displayYear === selectedYear;

    return (
        <View style={styles.monthPickerContainer}>
            <View style={styles.pickerNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => setDisplayYear(displayYear - 1)}>
                    <SvgIcons.leftArrowGreyBg />
                </TouchableOpacity>
                <Typography weight="700" size={14} color={color.brown_3C200A}>
                    {displayYear}
                </Typography>
                <TouchableOpacity style={styles.navButton} onPress={() => setDisplayYear(displayYear + 1)}>
                    <SvgIcons.rightArrowGreyBg />
                </TouchableOpacity>
            </View>
            <View style={styles.monthsGrid}>
                {monthNames.map((month, index) => (
                    <TouchableOpacity
                        key={month}
                        style={[
                            styles.monthCell,
                            isSelectedMonth(index) && styles.cellSelected,
                            isCurrentMonth(index) && !isSelectedMonth(index) && styles.cellCurrent,
                        ]}
                        onPress={() => onMonthSelect(index, displayYear)}
                    >
                        <Typography
                            weight={isSelectedMonth(index) || isCurrentMonth(index) ? '600' : '400'}
                            size={14}
                            color={isSelectedMonth(index) ? color.btnBrown_AE6F28 : color.black_2F251D}
                        >
                            {month}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// Quarter Picker Component
const QuarterPicker = ({ onQuarterSelect, selectedQuarter, selectedYear }) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3);
    const [displayYear, setDisplayYear] = useState(selectedYear || currentYear);

    useEffect(() => {
        if (selectedYear !== null && selectedYear !== undefined) {
            setDisplayYear(selectedYear);
        }
    }, [selectedYear]);

    const quarters = [
        { label: 'Q1', subtitle: 'Jan - Mar', index: 0 },
        { label: 'Q2', subtitle: 'Apr - Jun', index: 1 },
        { label: 'Q3', subtitle: 'Jul - Sep', index: 2 },
        { label: 'Q4', subtitle: 'Oct - Dec', index: 3 },
    ];

    const isCurrentQuarter = (idx) => idx === currentQuarter && displayYear === currentYear;
    const isSelectedQuarter = (idx) => idx === selectedQuarter && displayYear === selectedYear;

    return (
        <View style={styles.quarterPickerContainer}>
            <View style={styles.pickerNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => setDisplayYear(displayYear - 1)}>
                    <SvgIcons.leftArrowGreyBg />
                </TouchableOpacity>
                <Typography weight="700" size={14} color={color.brown_3C200A}>
                    {displayYear}
                </Typography>
                <TouchableOpacity style={styles.navButton} onPress={() => setDisplayYear(displayYear + 1)}>
                    <SvgIcons.rightArrowGreyBg />
                </TouchableOpacity>
            </View>
            <View style={styles.quartersGrid}>
                {quarters.map((quarter) => (
                    <TouchableOpacity
                        key={quarter.label}
                        style={[
                            styles.quarterCell,
                            isSelectedQuarter(quarter.index) && styles.cellSelected,
                            isCurrentQuarter(quarter.index) && !isSelectedQuarter(quarter.index) && styles.cellCurrent,
                        ]}
                        onPress={() => onQuarterSelect(quarter.index, displayYear)}
                    >
                        <Typography
                            weight={isSelectedQuarter(quarter.index) || isCurrentQuarter(quarter.index) ? '600' : '500'}
                            size={16}
                            color={isSelectedQuarter(quarter.index) ? color.btnBrown_AE6F28 : color.black_2F251D}
                        >
                            {quarter.label}
                        </Typography>
                        <Typography
                            weight="400"
                            size={12}
                            color={isSelectedQuarter(quarter.index) ? color.btnBrown_AE6F28 : color.grey_87807C}
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

    const filtersScrollRef = useRef(null);
    const chipLayoutsRef = useRef({});
    const translateY = useRef(new Animated.Value(0)).current;

    const filters = ['Today', 'Yesterday', 'Last Week', 'This Week', 'Last Month', 'This Month', 'Last Quarter', 'This Quarter', 'Last Year', 'This Year'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10 && Math.abs(gs.dy) > Math.abs(gs.dx),
            onPanResponderMove: (_, gs) => {
                if (gs.dy > 0) translateY.setValue(gs.dy);
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > 100) {
                    Animated.timing(translateY, { toValue: 600, duration: 200, useNativeDriver: true }).start(() => {
                        translateY.setValue(0);
                        onClose();
                    });
                } else {
                    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
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
            setSelectedYear(null);
            setSelectedMonth(null);
            setSelectedMonthYear(null);
            setSelectedQuarter(null);
            setSelectedQuarterYear(null);
            chipLayoutsRef.current = {};
        }
    }, [visible]);

    // FIX: Auto-scroll uses actual measured chip positions instead of estimated offsets
    useEffect(() => {
        if (activeFilter && filtersScrollRef.current) {
            const index = filters.indexOf(activeFilter);
            if (index >= 0) {
                setTimeout(() => {
                    const layout = chipLayoutsRef.current[index];
                    if (layout) {
                        // Scroll so the selected chip starts ~12px from left edge of the scroll view
                        const scrollX = Math.max(0, layout.x - 12);
                        filtersScrollRef.current?.scrollTo({ x: scrollX, animated: true });
                    }
                }, 200);
            }
        }
    }, [activeFilter]);

    // Store each chip's x position and width as they render
    const handleChipLayout = (index, event) => {
        const { x, width } = event.nativeEvent.layout;
        chipLayoutsRef.current[index] = { x, width };
    };

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

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
                date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonthDays - i),
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            week.push({
                day,
                month: 'current',
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
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
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, nextMonthDay),
            });
            nextMonthDay++;
        }
        if (week.length > 0) weeks.push(week);

        return weeks;
    };

    const weeks = generateCalendar();

    const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    };

    const isInRange = (dayObj) => {
        if (!startDate || !endDate) return false;
        const d = new Date(dayObj.date.getFullYear(), dayObj.date.getMonth(), dayObj.date.getDate());
        const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        return d > s && d < e;
    };

    const isStartDate = (dayObj) => isSameDay(dayObj.date, startDate);
    const isEndDate = (dayObj) => isSameDay(dayObj.date, endDate);

    const handleDayPress = (dayObj) => {
        if (dayObj.month !== 'current') return;
        const selected = new Date(dayObj.date.getFullYear(), dayObj.date.getMonth(), dayObj.date.getDate());
        setActiveFilter(null);
        setShowYearPicker(false);
        setShowMonthPicker(false);
        setShowQuarterPicker(false);

        if (!startDate || (startDate && endDate)) {
            setStartDate(selected);
            setEndDate(null);
        } else if (selected < startDate) {
            setStartDate(selected);
            setEndDate(null);
        } else {
            setEndDate(selected);
        }
    };

    const hideAllPickers = () => {
        setShowYearPicker(false);
        setShowMonthPicker(false);
        setShowQuarterPicker(false);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setStartDate(new Date(year, 0, 1));
        setEndDate(new Date(year, 11, 31));
        setCurrentDate(new Date(year, 0, 1));
        setShowYearPicker(false);
    };

    const handleMonthSelect = (monthIndex, year) => {
        setSelectedMonth(monthIndex);
        setSelectedMonthYear(year);
        setStartDate(new Date(year, monthIndex, 1));
        setEndDate(new Date(year, monthIndex + 1, 0));
        setCurrentDate(new Date(year, monthIndex, 1));
        setShowMonthPicker(false);
    };

    const handleQuarterSelect = (quarterIndex, year) => {
        setSelectedQuarter(quarterIndex);
        setSelectedQuarterYear(year);
        const startMonth = quarterIndex * 3;
        setStartDate(new Date(year, startMonth, 1));
        setEndDate(new Date(year, startMonth + 3, 0));
        setCurrentDate(new Date(year, startMonth, 1));
        setShowQuarterPicker(false);
    };

    const handleFilterPress = (filter) => {
        setActiveFilter(filter);
        const todayDate = new Date();
        let start, end;

        if (filter === 'Last Year') {
            hideAllPickers();
            const prevYear = todayDate.getFullYear() - 1;
            setSelectedYear(prevYear);
            setStartDate(new Date(prevYear, 0, 1));
            setEndDate(new Date(prevYear, 11, 31));
            setCurrentDate(new Date(prevYear, 0, 1));
            setShowYearPicker(true);
            return;
        }

        if (filter === 'This Year') {
            hideAllPickers();
            const thisYear = todayDate.getFullYear();
            setSelectedYear(thisYear);
            setStartDate(new Date(thisYear, 0, 1));
            setEndDate(new Date(thisYear, 11, 31));
            setCurrentDate(new Date(thisYear, 0, 1));
            setShowYearPicker(true);
            return;
        }

        if (filter === 'Last Month') {
            hideAllPickers();
            let prevMonth = todayDate.getMonth() - 1;
            let prevMonthYear = todayDate.getFullYear();
            if (prevMonth < 0) {
                prevMonth = 11;
                prevMonthYear -= 1;
            }
            setSelectedMonth(prevMonth);
            setSelectedMonthYear(prevMonthYear);
            setStartDate(new Date(prevMonthYear, prevMonth, 1));
            setEndDate(new Date(prevMonthYear, prevMonth + 1, 0));
            setCurrentDate(new Date(prevMonthYear, prevMonth, 1));
            setShowMonthPicker(true);
            return;
        }

        if (filter === 'This Month') {
            hideAllPickers();
            setSelectedMonth(todayDate.getMonth());
            setSelectedMonthYear(todayDate.getFullYear());
            setStartDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
            setEndDate(new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0));
            setCurrentDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
            setShowMonthPicker(true);
            return;
        }

        if (filter === 'Last Quarter') {
            hideAllPickers();
            let prevQuarter = Math.floor(todayDate.getMonth() / 3) - 1;
            let prevQuarterYear = todayDate.getFullYear();
            if (prevQuarter < 0) {
                prevQuarter = 3;
                prevQuarterYear -= 1;
            }
            setSelectedQuarter(prevQuarter);
            setSelectedQuarterYear(prevQuarterYear);
            const sm = prevQuarter * 3;
            setStartDate(new Date(prevQuarterYear, sm, 1));
            setEndDate(new Date(prevQuarterYear, sm + 3, 0));
            setCurrentDate(new Date(prevQuarterYear, sm, 1));
            setShowQuarterPicker(true);
            return;
        }

        if (filter === 'This Quarter') {
            hideAllPickers();
            const currentQuarter = Math.floor(todayDate.getMonth() / 3);
            setSelectedQuarter(currentQuarter);
            setSelectedQuarterYear(todayDate.getFullYear());
            const sm = currentQuarter * 3;
            setStartDate(new Date(todayDate.getFullYear(), sm, 1));
            setEndDate(new Date(todayDate.getFullYear(), sm + 3, 0));
            setCurrentDate(new Date(todayDate.getFullYear(), sm, 1));
            setShowQuarterPicker(true);
            return;
        }

        hideAllPickers();

        switch (filter) {
            case 'Today':
                start = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
                end = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
                break;
            case 'Yesterday': {
                const y = new Date(todayDate);
                y.setDate(y.getDate() - 1);
                start = new Date(y.getFullYear(), y.getMonth(), y.getDate());
                end = new Date(y.getFullYear(), y.getMonth(), y.getDate());
                break;
            }
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
            default:
                return;
        }

        setStartDate(start);
        setEndDate(end);
        setCurrentDate(new Date(start.getFullYear(), start.getMonth(), 1));
    };

    const handleApply = () => {
        if (startDate && endDate && onDateRangeSelect) onDateRangeSelect({ startDate, endDate });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <Animated.View style={[styles.datePickerModal, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
                    <View style={styles.modalHandle} />

                    <ScrollView
                        ref={filtersScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filtersScroll}
                        contentContainerStyle={styles.filtersScrollContent}
                    >
                        {filters.map((filter, index) => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                                onPress={() => handleFilterPress(filter)}
                                onLayout={(e) => handleChipLayout(index, e)}
                            >
                                <Typography
                                    weight={activeFilter === filter ? '600' : '400'}
                                    size={13}
                                    color={activeFilter === filter ? 'white' : color.brown_766F6A}
                                    numberOfLines={1}
                                >
                                    {filter}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {showYearPicker ? (
                        <YearPicker onYearSelect={handleYearSelect} selectedYear={selectedYear} />
                    ) : showMonthPicker ? (
                        <MonthPicker onMonthSelect={handleMonthSelect} selectedMonth={selectedMonth} selectedYear={selectedMonthYear} />
                    ) : showQuarterPicker ? (
                        <QuarterPicker onQuarterSelect={handleQuarterSelect} selectedQuarter={selectedQuarter} selectedYear={selectedQuarterYear} />
                    ) : (
                        <>
                            <View style={styles.calendarNav}>
                                <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                                    <SvgIcons.leftArrowGreyBg />
                                </TouchableOpacity>
                                <Typography weight="700" size={16} color={color.brown_3C200A}>
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </Typography>
                                <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                                    <SvgIcons.rightArrowGreyBg />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dayHeaders}>
                                {days.map((day) => (
                                    <Typography key={day} style={styles.dayHeader} weight="400" size={14} color={color.grey_87807C}>
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
                                        const isBoth = isStart && isSameDay(startDate, endDate);
                                        const isPrev = dayObj.month === 'prev';
                                        const isNext = dayObj.month === 'next';

                                        return (
                                            <TouchableOpacity
                                                key={dayIndex}
                                                style={[
                                                    styles.dayCell,
                                                    inRange && styles.dayCellInRange,
                                                    isStart && !isBoth && styles.dayCellStart,
                                                    isEnd && !isBoth && styles.dayCellEnd,
                                                    isBoth && isStart && styles.dayCellSingle,
                                                ]}
                                                onPress={() => handleDayPress(dayObj)}
                                                disabled={isPrev || isNext}
                                            >
                                                <Typography
                                                    weight={isStart || isEnd ? '600' : '400'}
                                                    size={14}
                                                    color={
                                                        isPrev || isNext
                                                            ? color.grey_87807C
                                                            : isStart || isEnd
                                                                ? 'white'
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
                            <Typography weight="600" size={16} color="white">
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

    const [showEventTypePicker, setShowEventTypePicker] = useState(false);
    const [showTicketingTypePicker, setShowTicketingTypePicker] = useState(false);

    const [selectedEventType, setSelectedEventType] = useState('All');
    const [selectedTicketingType, setSelectedTicketingType] = useState('All');

    const eventTypeOptions = [
        { label: 'All', value: 'All' },
        { label: 'Standard', value: 'Standard' },
        { label: 'Recurring', value: 'Recurring' },
        { label: 'Multi Day Same Venue', value: 'Multi Day Same Venue' },
        { label: 'Multi Day Multi Venue', value: 'Multi Day Multi Venue' },
    ];

    const ticketingTypeOptions = [
        { label: 'All', value: 'All' },
        { label: 'Standard', value: 'Standard' },
        { label: 'Members', value: 'Members' },
        { label: 'Early Bird', value: 'Early Bird' },
        { label: 'Packages', value: 'Packages' },
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
                <View style={styles.headerLeft}>
                    <TouchableOpacity>
                        <SvgIcons.drawerSvg width={24} height={24} fill="transparent" />
                    </TouchableOpacity>
                    <Typography weight="700" size={20} color={color.brown_3C200A}>
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
                        <Dropdown value={selectedEventType} onPress={() => setShowEventTypePicker(true)} />
                    </View>
                    <View style={styles.dropdownWrapper}>
                        <Dropdown value={selectedTicketingType} onPress={() => setShowTicketingTypePicker(true)} />
                    </View>
                </View>

                <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                    <SvgIcons.calendarIcon />
                    <Typography style={styles.dateSelectorText} weight="400" size={14} color={color.brown_766F6A}>
                        {selectedDate}
                    </Typography>
                    <SvgIcons.downArrow />
                </TouchableOpacity>

                <AdminEarningCard />
                <AdminAttendeesCard />
                <AdminEventCard />
                <AdminStatisticsCard />
                <AdminCouponsCard />
            </ScrollView>

            <DateRangePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onDateRangeSelect={handleDateRangeSelect}
            />

            <BottomSheetRadioPicker
                visible={showEventTypePicker}
                onClose={() => setShowEventTypePicker(false)}
                title="Event Type"
                options={eventTypeOptions}
                selectedValue={selectedEventType}
                onSelect={(option) => setSelectedEventType(option.value)}
            />

            <BottomSheetRadioPicker
                visible={showTicketingTypePicker}
                onClose={() => setShowTicketingTypePicker(false)}
                title="Ticketing Type"
                options={ticketingTypeOptions}
                selectedValue={selectedTicketingType}
                onSelect={(option) => setSelectedTicketingType(option.value)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    bellButton: { position: 'relative' },
    headerDivider: { width: 2, height: 40, backgroundColor: color.grey_E5E7EB },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.btnBrown_AE6F28, justifyContent: 'center', alignItems: 'center' },
    filters: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 12, width: '100%' },
    dropdownWrapper: { flex: 1 },
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
    dropdownValue: { fontSize: 14, color: color.brown_766F6A, flex: 1 },
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
    dateSelectorText: { flex: 1, fontSize: 14, color: color.brown_766F6A },
    // Date Picker Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
    datePickerModal: {
        backgroundColor: color.white_FFFFFF,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHandle: { width: 40, height: 4, backgroundColor: color.grey_AFAFAF, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },

    // ──────────────────────────────────────────────────────────────────────────
    // FIX: Filter chips - 3 changes that fix the clipping on S22+
    //
    // 1. filtersScroll: uses marginHorizontal: -20 to bleed into parent padding
    //    so the grey background spans full width, but NO paddingHorizontal here
    //    (that goes on contentContainerStyle so it affects the inner content only)
    //
    // 2. filtersScrollContent: paddingLeft: 20 matches the parent's padding so
    //    the first chip ("Today") starts at the same indent as "Dashboard".
    //    paddingRight: 40 ensures the LAST chip ("This Year") can scroll fully
    //    into view and isn't hidden behind the right edge.
    //
    // 3. filterChip: paddingHorizontal: 14 gives each chip enough internal space
    //    so text like "Last Quarter" is never truncated. marginRight: 8 keeps
    //    chips close together without excessive gaps.
    // ──────────────────────────────────────────────────────────────────────────
    filtersScroll: {
        marginBottom: 20,
        marginHorizontal: -20,
        paddingVertical: 8,
        backgroundColor: color.grey_E5E7EB,
    },
    filtersScrollContent: {
        paddingLeft: 20,
        paddingRight: 40,
        alignItems: 'center',
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    filterChipActive: { backgroundColor: color.btnBrown_AE6F28 },

    calendarNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dayHeaders: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
    dayHeader: { fontSize: 14, color: color.grey_87807C, width: 48, textAlign: 'center' },
    weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    dayCell: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
    dayCellInRange: { backgroundColor: color.lightBrown_FFF6DF },
    dayCellStart: { backgroundColor: color.brown_D58E00, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
    dayCellEnd: { backgroundColor: color.brown_D58E00, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
    dayCellSingle: { backgroundColor: color.brown_D58E00, borderRadius: 12 },
    applyButton: { backgroundColor: color.btnBrown_AE6F28, paddingVertical: 14, borderRadius: 12, marginTop: 20, alignItems: 'center' },
    // Picker shared styles
    pickerNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
    navButton: { padding: 10 },
    cellSelected: { backgroundColor: color.white_FFFFFF, borderWidth: 2, borderColor: color.btnBrown_AE6F28 },
    cellCurrent: { backgroundColor: color.lightBrown_FFF6DF },
    cellOutside: { backgroundColor: 'transparent' },
    // Year Picker
    yearPickerContainer: { paddingVertical: 10 },
    yearsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 },
    yearCell: { width: '23%', paddingVertical: 16, marginBottom: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    // Month Picker
    monthPickerContainer: { paddingVertical: 10 },
    monthsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 },
    monthCell: { width: '23%', paddingVertical: 16, marginBottom: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    // Quarter Picker
    quarterPickerContainer: { paddingVertical: 10 },
    quartersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 },
    quarterCell: { width: '48%', paddingVertical: 20, marginBottom: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9' },
});

export default AdminAllEventsDashboard;