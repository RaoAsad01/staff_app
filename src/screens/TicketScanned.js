import { StyleSheet, Text, View, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import { color } from '../color/color';
import Header from '../../components/header';
import SvgIcons from '../../components/SvgIcons';
import { useNavigation } from '@react-navigation/native';
import { getFormattedDate } from '../constants/dateAndTime';

const TicketScanned = ({ route }) => {
    const { scanResponse, eventInfo, note, status } = route.params;
    const navigation = useNavigation();

    const displayedNote = note || scanResponse?.note || 'No note added';

    console.log('Scanned Data:', scanResponse);
    console.log('Event Info:', eventInfo);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <Header eventInfo={eventInfo} />
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <SvgIcons.backArrow width={24} height={24} fill={color.black_2F251D} />
            </TouchableOpacity>
            <View style={styles.wrapper}>

                <View style={styles.popUp}>
                    <Text style={styles.labeltickets}>
                        {scanResponse?.message || 'N/A'}
                    </Text>
                    <SvgIcons.successBrownSVG width={81} height={80} fill="transparent" style={styles.successImageIcon} />
                    <Text style={styles.ticketHolder}>Ticket Holder</Text>
                    <Text style={styles.userName}>{scanResponse?.ticket_holder || 'N/A'}</Text>
                </View>

                <View style={styles.ticketContainer}>
                    <View style={styles.leftColumn}>
                        <View style={styles.row}>
                            <View style={styles.leftColumnContent}>
                                <Text style={styles.values}>{scanResponse?.ticket || 'N/A'}</Text>
                                <Text style={[styles.value, styles.marginTop10]}>
                                    {scanResponse?.currency || 'PKR'} {scanResponse?.ticket_price || 'N/A'}
                                </Text>
                                <View style={styles.spacer} />
                                <Text style={[styles.label, styles.marginTop20]}>Last Scanned On</Text>
                                <Text style={[styles.value, styles.marginTop10]}>{getFormattedDate(scanResponse?.last_scan) || 'N/A'}</Text>
                            </View>
                            <View style={styles.rightColumnContent}>
                                <Text style={styles.label}>Scanned By</Text>
                                <Text style={[styles.value, styles.marginTop10]}>{scanResponse?.scanned_by || 'N/A'}</Text>
                                <Text style={[styles.ticketNumber, styles.marginTop15]}>#{scanResponse?.ticket_number || 'N/A'}</Text>
                                <Text style={[styles.label, styles.marginTop3]}>Scan Count</Text>
                                <Text style={[styles.value, styles.marginTop9]}>{scanResponse?.scan_count || 'N/A'}</Text>
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
        marginTop: 10,
    },

    labeltickets: {
        color: color.black_2F251D,
        fontSize: 16,
        fontWeight: 'bold',
    },
    ticketHolder: {
        color: color.brown_3C200A,
        fontSize: 14,
        marginTop: 20,
    },
    userName: {
        color: color.brown_3C200A,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
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
        marginBottom: 10,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftColumnContent: {
        width: '50%',
        alignItems: 'flex-start',
    },
    rightColumnContent: {
        width: '50%',
        alignItems: 'flex-start',
        paddingLeft: 30,
    },
    spacer: {
        height: 35,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: color.black_2F251D,
    },
    value: {
        fontSize: 16,
        fontWeight: '400',
        color: color.brown_5A2F0E,
    },
    values: {
        fontSize: 16,
        fontWeight: '500',
        color: color.black_2F251D,
    },
    ticketNumber: {
        fontSize: 16,
        fontWeight: '400',
        color: color.black_544B45,
        marginBottom: 15,
    },
    marginTop10: {
        marginTop: 10,
    },
    marginTop9: {
        marginTop: 9,
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
        borderColor: color.white_FFFFFF,
        borderRadius: 10,
        backgroundColor: color.white_FFFFFF,
        paddingHorizontal: 16,
        paddingVertical: 5,
        marginTop: 15,
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
        color: color.black_544B45,
        marginTop: 5
    },
    backButton: {
        padding: 10
    },
});

export default TicketScanned;