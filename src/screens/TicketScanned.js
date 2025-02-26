import { StyleSheet, Text, View, StatusBar, SafeAreaView } from 'react-native';
import { color } from '../color/color';
import Header from '../../components/header';
import SvgIcons from '../../components/SvgIcons';


const TicketScanned = ({ route }) => {
    const { status, note } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <Header />
            <View style={styles.wrapper}>

                <View style={styles.popUp}>
                    <Text style={styles.labeltickets}>
                        {status === 'Scanned' ? 'Ticket Scanned' : 'Ticket Unscanned'}
                    </Text>
                    <SvgIcons.successBrownSVG width={81} height={80} fill="transparent" style={styles.successImageIcon} />
                    <Text style={styles.ticketHolder}>Ticket Holder</Text>
                    <Text style={styles.userName}>John Doe</Text>
                </View>

                <View style={styles.ticketContainer}>
                    <View>
                        <Text style={styles.ticketType}>Standard Ticket</Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceCurrency}>USD </Text>
                            <Text style={styles.ticketPrice}>456</Text>
                        </View>
                        <Text style={styles.tickeScanTime}>Last Scanned On</Text>
                        <Text style={styles.ticketDate}>12-08-2024  05:00 pm</Text>

                    </View>
                    <View style={styles.statusAndDateContainer}>
                        <Text style={styles.ticketScannedBy}>Scanned By</Text>
                        <Text style={styles.ticketScannedByName}>Mark Jacob</Text>
                        <Text style={styles.ticketId}>#134566765</Text>
                        <Text style={styles.scanCount}>Scan Count</Text>
                        <Text style={styles.scanCountValue}>3</Text>
                    </View>
                </View>
                <View style={styles.noteContainer}>
                    <Text style={styles.LabelNote}>Note</Text>
                    <Text style={styles.noteDescription}>{note || 'No note added'}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.white_FFFFFF,
    },
    wrapper: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: color.white_FFFFFF,
    },
    popUp: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginTop: 40,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: color.white_FFFFFF,
        borderRadius: 10,
        backgroundColor: color.white_FFFFFF,
        paddingHorizontal: 16,
        paddingVertical: 5,
        marginTop: 15,
        marginBottom: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    tickeScanTime: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
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
        color: color.black_544B45,
        fontSize: 14,
        fontWeight: '400',
        marginTop: 3
    },
    ticketPrice: {
        color: color.brown_5A2F0E,
        fontWeight: '600',
        fontSize: 18
    },
    ticketDate: {
        fontSize: 14,
        color: color.black_2F251D,
        fontWeight: '500',
        marginTop: 10,
    },
    statusAndDateContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    ticketScannedBy: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
        marginTop: -35

    },
    ticketScannedByName: {
        fontWeight: '500',
        fontSize: 14,
        color: color.brown_3C200A,
        marginTop: 8

    },
    scanCount: {
        fontSize: 14,
        fontWeight: '400',
        color: color.black_544B45,
        top: 28
    },
    scanCountValue: {
        fontSize: 14,
        fontWeight: '500',
        color: color.black_2F251D,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
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
    }

});

export default TicketScanned;