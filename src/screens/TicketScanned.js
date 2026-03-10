import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { color } from '../color/color';
import Header from '../components/header';
import SvgIcons from '../components/SvgIcons';
import { useNavigation } from '@react-navigation/native';
import { formatDateTime } from '../constants/dateAndTime';
import Typography from '../components/Typography';
import { truncateStaffName } from '../utils/stringUtils';

const TicketScanned = ({ route }) => {
  const { scanResponse, eventInfo, note } = route.params;
  const navigation = useNavigation();

  const displayedNote = note || scanResponse?.note || 'No note added';

  // ✅ Safely extract scanned by data
  const scannedByName =
    typeof scanResponse?.scanned_by === 'object'
      ? scanResponse?.scanned_by?.name
      : scanResponse?.scanned_by;

  const scannedByStaffId =
    typeof scanResponse?.scanned_by === 'object'
      ? scanResponse?.scanned_by?.staff_id
      : scanResponse?.staff_id;

  const scannedOn = scanResponse?.scanned_on
    ? formatDateTime(scanResponse?.scanned_on)
    : 'No Record';

  return (
    <SafeAreaView style={styles.container}>
      <Header eventInfo={eventInfo} />

      <View style={styles.wrapper}>
        {/* TOP CARD */}
        <View style={styles.popUp}>
          <Text style={styles.labeltickets}>
            {scanResponse?.message || 'No Record'}
          </Text>

          <SvgIcons.successBrownSVG
            width={81}
            height={80}
            fill="transparent"
            style={styles.successImageIcon}
          />

          <Text style={styles.userName}>
            {scanResponse?.name || 'No Record'}
          </Text>

          <Text style={styles.userEmail}>
            {scanResponse?.user_email || 'No Record'}
          </Text>

          <Text style={styles.userPurchaseDate}>
            Purchase Date: {scanResponse?.date || 'No Record'}
          </Text>
        </View>

        {/* TICKET INFO CARD */}
        <View style={styles.ticketContainer}>
          <View style={styles.row}>
            {/* LEFT COLUMN */}
            <View style={styles.leftColumnContent}>
              <Text style={styles.values}>Category</Text>
              <Typography style={[styles.value, styles.marginTop10]}>
                {scanResponse?.category || 'No Record'}
              </Typography>

              <Text style={[styles.values, styles.marginTop10]}>Class</Text>
              <Typography style={[styles.value, styles.marginTop10]}>
                {scanResponse?.ticketClass || 'No Record'}
              </Typography>

              <Text style={[styles.values, styles.marginTop10]}>Ticket ID</Text>
              <Text style={[styles.ticketNumber, styles.marginTop10]}>
                {scanResponse?.ticket_number || 'No Record'}
              </Text>

              <Text style={[styles.values]}>Last Scanned On</Text>
              <Text style={[styles.valueScanCount, styles.marginTop10]}>
                {scannedOn}
              </Text>
            </View>

            {/* RIGHT COLUMN */}
            <View style={styles.rightColumnContent}>
              <Text style={styles.values}>Scanned By</Text>
              <Text style={[styles.valueScanCount, styles.marginTop8]}>
                {truncateStaffName(scannedByName) || 'No Record'}
              </Text>

              <Text style={[styles.values, styles.marginTop10]}>
                Staff ID
              </Text>
              <Text style={[styles.valueScanCount, styles.marginTop8]}>
                {scannedByStaffId || 'No Record'}
              </Text>

              <Text style={[styles.values, styles.marginTop10]}>
                Price
              </Text>
              <Text style={[styles.value, styles.marginTop10]}>
                {scanResponse?.currency || 'GHS'}{' '}
                {scanResponse?.ticket_price || 'No Record'}
              </Text>

              <Text style={[styles.values, styles.marginTop10]}>
                Scan Count
              </Text>
              <Text style={[styles.valueScanCount, styles.marginTop9]}>
                {scanResponse?.scan_count || 'No Record'}
              </Text>
            </View>
          </View>
        </View>

        {/* NOTE CARD */}
        <View style={styles.noteContainer}>
          <Text style={styles.LabelNote}>Note</Text>
          <Text style={styles.noteDescription}>{displayedNote}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TicketScanned;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  wrapper: {
    flex: 1,
    paddingHorizontal: 10,
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

  userName: {
    color: color.placeholderTxt_24282C,
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },

  userEmail: {
    color: color.placeholderTxt_24282C,
    fontSize: 14,
    marginTop: 10,
  },

  userPurchaseDate: {
    color: color.black_544B45,
    fontSize: 14,
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
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  leftColumnContent: {
    width: '58%',
  },

  rightColumnContent: {
    width: '50%',
    paddingLeft: 50,
  },

  values: {
    fontSize: 14,
    fontWeight: '500',
    color: color.black_2F251D,
  },

  value: {
    color: color.placeholderTxt_24282C,
  },

  valueScanCount: {
    fontSize: 14,
    color: color.black_544B45,
  },

  ticketNumber: {
    fontSize: 14,
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

  noteContainer: {
    borderWidth: 1,
    borderColor: color.brown_F7E4B6,
    borderRadius: 10,
    backgroundColor: color.brown_F7E4B6,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginTop: 10,
  },

  LabelNote: {
    fontSize: 14,
    fontWeight: '500',
    color: color.black_2F251D,
  },

  noteDescription: {
    fontSize: 14,
    color: color.brown_766F6A,
    opacity: 0.7,
    marginTop: 5,
  },
});