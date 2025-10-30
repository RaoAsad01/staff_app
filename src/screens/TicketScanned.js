import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { color } from '../color/color';
import Header from '../../components/header';
import SvgIcons from '../../components/SvgIcons';
import { useNavigation } from '@react-navigation/native';
import { formatDateTime } from '../constants/dateAndTime';
import Typography, { ButtonTextDemiBold, Caption } from '../components/Typography';
import { useEffect } from 'react';

const TicketScanned = ({ route }) => {
    const { scanResponse, eventInfo, note, status } = route.params;
    const navigation = useNavigation();

    const displayedNote = note || scanResponse?.note || 'No note added';

    useEffect(() => {
        console.log('================================================');
        console.log('🎫 TICKET SCANNED SCREEN - URL INFORMATION');
        console.log('================================================');
        console.log('Base URL: https://d1-admin.hexallo.com/');
        console.log('Full URL Path:', JSON.stringify({
            eventUuid: eventInfo?.eventUuid,
            ticketCode: scanResponse?.code || scanResponse?.ticket_number,
            scanResponseKeys: Object.keys(scanResponse || {}),
            eventInfoKeys: Object.keys(eventInfo || {})
        }, null, 2));
        console.log('Scan Response Full Data:', JSON.stringify(scanResponse, null, 2));
        console.log('Event Info Full Data:', JSON.stringify(eventInfo, null, 2));
        console.log('Scanned By Details:', JSON.stringify({
            name: scanResponse?.scanned_by?.name,
            staff_id: scanResponse?.scanned_by?.staff_id,
            full_scanned_by: scanResponse?.scanned_by
        }, null, 2));
        console.log('================================================');
    }, []);

    console.log('Scanned Data:', scanResponse);
    console.log('Event Info:', eventInfo);

    return (
        <SafeAreaView style={styles.container}>

            <Header eventInfo={eventInfo} />
            <View style={styles.wrapper}>

                <View style={styles.popUp}>
                    {/* <Typography
                        style={styles.labeltickets}
                        weight="600"
                        size={20}
                        color={color.placeholderTxt_24282C}
                    >
                        {scanResponse?.message || 'N/A'}
                    </Typography> */}
                    <Text style={styles.labeltickets}>
                        {scanResponse?.message || 'N/A'}
                    </Text>
                    <SvgIcons.successBrownSVG width={81} height={80} fill="transparent" style={styles.successImageIcon} />
                    {/* <Text style={styles.ticketHolder}>Ticket Holder</Text> */}
                    <Text style={styles.userName}>{scanResponse?.name || 'N/A'}</Text>
                    <Text style={styles.userEmail}>{scanResponse?.user_email || 'N/A'}</Text>
                    <Text style={styles.userPurchaseDate}>Purchase Date: {scanResponse?.date || 'N/A'}</Text>
                </View>

                <View style={styles.ticketContainer}>
                    <View style={styles.leftColumn}>
                        <View style={styles.row}>
                            <View style={styles.leftColumnContent}>
                                <Text style={styles.values}>Category</Text>
                                <Typography
                                    style={[styles.value, styles.marginTop10]}
                                    weight="400"
                                    size={14}
                                    color={color.brown_3C200A}
                                >
                                    {scanResponse?.category || 'N/A'}
                                </Typography>
                                <Text style={[styles.values, styles.marginTop10]}>Class</Text>
                                <Typography
                                    style={[styles.value, styles.marginTop10]}
                                    weight="400"
                                    size={14}
                                    color={color.brown_3C200A}
                                >
                                    {scanResponse?.ticketClass || 'N/A'}
                                </Typography>
                                {/* <Text style={[styles.value, styles.marginTop10]}>
                                    {scanResponse?.currency || 'PKR'} {scanResponse?.ticket_price || 'N/A'}
                                </Text> */}
                                <Text style={[styles.values, styles.marginTop10]}>Ticket ID</Text>
                                <Text style={[styles.ticketNumber, styles.marginTop10]}>{scanResponse?.ticket_number || 'N/A'}</Text>
                                <Text style={[styles.values]}>Last Scanned On</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop10]}>{formatDateTime(scanResponse?.last_scan) || 'N/A'}</Text>
                            </View>
                            <View style={styles.rightColumnContent}>
                                <Text style={styles.values}>Scanned By</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop8]}>
                                    {scanResponse?.scanned_by?.name || 'N/A'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Staff ID</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop8]}>
                                    {scanResponse?.scanned_by?.staff_id || 'N/A'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Price</Text>
                                <Text style={[styles.value, styles.marginTop10]}>
                                    {scanResponse?.currency || 'GHS'} {scanResponse?.ticket_price || 'N/A'}
                                </Text>
                                <Text style={[styles.values, styles.marginTop10]}>Scan Count</Text>
                                <Text style={[styles.valueScanCount, styles.marginTop9]}>{scanResponse?.scan_count || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.noteContainer}>
                    <Text style={styles.LabelNote}>Note</Text>
                    <Text style={styles.noteDescription}>{displayedNote}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor: color.white_FFFFFF,
    },
    wrapper: {
        flex: 1,
        paddingHorizontal: 10,
        //backgroundColor: color.white_FFFFFF,
    },
    popUp: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        width: '100%',
        marginTop: 16,
    },

    labeltickets: {
        fontWeight: '600',
        fontSize: 20,
        color: color.placeholderTxt_24282C,
    },
    ticketHolder: {
        color: color.placeholderTxt_24282C,
        fontSize: 14,
        marginTop: 20,
        fontWeight: 'bold',
    },
    userName: {
        color: color.placeholderTxt_24282C,
        fontSize: 16,
        marginTop: 10,
        fontWeight: '500'
    },
    userEmail: {
        color: color.placeholderTxt_24282C,
        fontSize: 14,
        marginTop: 10,
        fontWeight: '400'
    },
    userPurchaseDate: {
        color: color.black_544B45,
        fontSize: 14,
        marginTop: 10,
        fontWeight: '400'
    },
    successImageIcon: {
        marginTop: 20,
    },
    ticketContainer: {
        borderWidth: 1,
        borderColor: color.white_FFFFFF,
        borderRadius: 10,
        backgroundColor: color.white_FFFFFF,
        padding: 16,
        marginTop: 15,
        marginBottom: 6,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftColumnContent: {
        width: '58%',
        alignItems: 'flex-start',
    },
    rightColumnContent: {
        width: '50%',
        alignItems: 'flex-start',
        paddingLeft: 50,
    },
    spacer: {
        height: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: color.black_2F251D,
    },
    valueScanCount: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
    },
    value: {
        color: color.placeholderTxt_24282C,
    },
    values: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D
    },
    ticketNumber: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
        marginBottom: 10,
    },
    marginTop10: {
        marginTop: 10,
    },
    marginTop9: {
        marginTop: 9,
    },
    marginTop8: {
        marginTop: 8,
    },
    marginTop15: {
        marginTop: 15,
    },
    marginTop20: {
        marginTop: 20,
    },
    marginTop3: {
        marginTop: 3,
    },

    tickeScanTime: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D,
        marginTop: 50,
    },
    ticketId: {
        fontWeight: '400',
        fontSize: 12,
        color: color.black_544B45,
        marginTop: 10

    },
    ticketType: {
        fontSize: 14,
        color: color.black_2F251D,
        fontWeight: '500',
        marginTop: 5
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    priceCurrency: {
        color: color.brown_5A2F0E,
        fontSize: 14,
        fontWeight: '400',
        marginTop: 3
    },
    ticketPrice: {
        color: color.brown_5A2F0E,
        fontWeight: '500',
        fontSize: 14,
        marginTop: 3
    },
    ticketDate: {
        fontSize: 14,
        color: color.black_544B45,
        fontWeight: '400',
        marginTop: 10,
    },
    statusAndDateContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    ticketScannedBy: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D,
        marginTop: -35

    },
    ticketScannedByName: {
        fontWeight: '400',
        fontSize: 14,
        color: color.black_544B45,
        marginTop: 8

    },
    scanCount: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D,
        top: 28
    },
    scanCountValue: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
        top: 38
    },
    noteContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: color.brown_F7E4B6,
        borderRadius: 10,
        backgroundColor: color.brown_F7E4B6,
        paddingHorizontal: 16,
        paddingVertical: 5,
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
    },
    LabelNote: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D
    },
    noteDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: color.brown_766F6A,
        opacity: 0.7,
        marginTop: 5
    },
});

export default TicketScanned;