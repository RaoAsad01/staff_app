import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar, Dimensions, SafeAreaView, Animated } from 'react-native';
import CameraOverlay from '../../components/CameraOverlay';
import Header from '../../components/header';
import { color } from '../color/color';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getFormatDate } from '../constants/currentdateandtime';
import NoteModal from '../constants/noteModal';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ticketService } from '../api/apiService';
const { width, height } = Dimensions.get('window');

const HomeScreen = ({ eventInfo, onScanCountUpdate }) => {
  const navigation = useNavigation();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions()
  const [scannedData, setScannedData] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanTime, setScanTime] = useState(null);
  const [activeTab, setActiveTab] = useState('CheckIn');
  const [linePosition, setLinePosition] = useState(0);
  const [movingDown, setMovingDown] = useState(true);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteCount, setNoteCount] = useState(0);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const [showAnimation, setShowAnimation] = useState(false);
  const [scanResponse, setScanResponse] = useState(null);


  useFocusEffect(
    useCallback(() => {
      //setScannedData(null);
      //setScanResult(null);
      setScanning(false);
      //setScanTime(null);
    }, [])
  );

  useEffect(() => {
    requestPermission();
  }, []);


  useEffect(() => {
    setNoteCount(Object.keys(notes).length);
  }, [notes]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLinePosition((prevPosition) => {
        if (movingDown && prevPosition >= 225) { // Reverse at the bottom
          setMovingDown(false);
          return prevPosition - 2;
        } else if (!movingDown && prevPosition <= 0) {
          setMovingDown(true);
          return prevPosition + 2;
        } else {
          return movingDown ? prevPosition + 2 : prevPosition - 2;
        }
      });
    }, 2);

    return () => clearInterval(intervalId);
  }, [movingDown]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Header activeTab={activeTab} />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarCodeScanned = async ({ data }) => {
    if (scanning) return;

    setScanning(true);
    setScannedData(data);
    setScanTime(getFormatDate());

    try {
      // Get the note for this ticket
      const note = notes[data] || '';
      console.log('Sending note with scan:', note);

      const response = await ticketService.scanTicket(data, note);
      setScanResponse(response.data);
      let scanData = {
        text: 'Scan Successful',
        color: '#4BB543',
        icon: 'check'
      };

      // Handle different response statuses
      if (response.data.scan_count > 1) {
        scanData = {
          text: 'Scanned Already',
          color: '#D8A236',
          icon: 'close'
        };
      } else if (response.status === 'error' || response.status === 'invalid') {
        scanData = {
          text: 'Scan Unsuccessful',
          color: '#ED4337',
          icon: 'close'
        };
      } else {
        console.log('Ticket scanned successfully');
        // Update scan count when ticket is successfully scanned
        if (onScanCountUpdate) {
          onScanCountUpdate();
        }
      }

      setScanResult(scanData);
      animateProgressBar();
      setShowAnimation(true);

    } catch (error) {
      let errorMessage = 'Scan Unsuccessful';
      let errorColor = '#ED4337';

      // Check for specific error messages
      if (error.response?.data?.non_field_errors?.includes('Scan limit reached.')) {
        errorMessage = 'Scan Limit Reached';
        errorColor = '#D8A236'; // Use warning color for limit reached
      }

      setScanResult({
        text: errorMessage,
        color: errorColor,
        icon: 'close'
      });
      animateProgressBar();
      setShowAnimation(true);
    }

    setTimeout(() => {
      //setScannedData(null);
      setScanning(false);
      setShowAnimation(false);
    }, 2000);
  };


  const animateProgressBar = () => {
    animatedWidth.setValue(0);
    Animated.timing(animatedWidth, {
      toValue: width,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handleAddNote = async (newNote) => {
    if (!scannedData) {
      console.warn("Cannot update note: scannedData is null.");
      return;
    }

    // Extract ticket code from scanned URL (more robust approach)
    const parts = scannedData.split('/');
    const ticketCode = parts[parts.length - 2]; // Assuming ticket code is the second to last part

    // Assuming you have the eventUuid available in your component
    const currentEventUuid = 'YOUR_EVENT_UUID_HERE'; // Replace with your actual event UUID

    try {
      if (newNote.trim().length > 0) {
        console.log("Updating note for ticket code:", ticketCode, "for event:", currentEventUuid);
        await ticketService.updateTicketNote(ticketCode, newNote, currentEventUuid);
        setNotes((prevNotes) => ({
          ...prevNotes,
          [scannedData]: newNote,
        }));
      }
    } catch (error) {
      console.error("Failed to update ticket note:", error.message);
    }

    setNoteModalVisible(false);
  };


  const handleNoteButtonPress = () => {
    if (noteCount === 1) {
      navigation.navigate('TicketScanned', {
        scanResponse,
        eventInfo,
        note: notes[scannedData] || 'No note added',
      });
    } else {
      const existingNote = notes[scannedData] || '';
      setNoteToEdit(existingNote);
      setNoteModalVisible(true);
    }
  };

  // Edit existing note
  const handleEditNote = (editedNote) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [scannedData]: editedNote,
    }));
    setNoteModalVisible(false);
  };

  const handleDetailButtonPress = () => {
    navigation.navigate('TicketScanned', {
      scanResponse,
      eventInfo,
      note: notes[scannedData] || 'No note added',
    });
  };

  return (
    <View style={styles.mainContainer}>
      <Header eventInfo={eventInfo} />
      <View style={styles.darkBackground}>
        {scanResult && (
          <View style={styles.scanResultContainer}>
            {showAnimation && (
              <Animated.View
                style={[
                  styles.animatedBar,
                  { backgroundColor: scanResult.color, width: animatedWidth },
                ]}
              />
            )}
            {showAnimation && (<Text style={styles.animatedText}>{scanResult.text}</Text>)}
          </View>
        )}
        <View style={styles.cameraContainer}>
          <View style={[styles.cameraWrapper]}>
            <CameraView
              style={styles.camera}
              facing={facing}
              onBarcodeScanned={scanning ? undefined : handleBarCodeScanned}
            />
            <CameraOverlay linePosition={linePosition} scannedData={scanResult ? scanResult.color : '#AE6F28'} />
          </View>
        </View>

        {scanResult && (
          <View style={styles.containerstatus}>
            <View style={styles.scanResultsContainer}>
              <View style={[styles.scaniconresult, { backgroundColor: scanResult.color }]}>
                <MaterialIcons name={scanResult.icon} size={24} color="white" style={{ margin: 13 }} />
              </View>
              <View style={styles.scanResults}>
                <Text style={{ color: scanResult.color }}>{scanResult.text}</Text>
                <Text style={styles.timeColor}>{scanTime}</Text>
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.detailButton} onPress={handleDetailButtonPress}>
                  <Text style={styles.detailColor}>Details</Text>
                </TouchableOpacity>
                {(scanResult.text === 'Scanned Already') && (
                  <TouchableOpacity style={styles.noteButton} onPress={handleNoteButtonPress}>
                    <Text style={styles.noteColor}>Note</Text>
                    {Object.keys(notes).length > 0 && (
                      <View style={styles.greyCircle}>
                        <View style={styles.redCircle}>
                          <Text style={styles.redCircleText}>{Object.keys(notes).length}</Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
      {noteModalVisible && <NoteModal visible={noteModalVisible} onAddNote={handleAddNote} onCancel={() => setNoteModalVisible(false)} initialNote={noteToEdit} scannedData={scannedData} />}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    //backgroundColor: color.btnBrown_AE6F28,
  },
  darkBackground: {
    flex: 1,
    backgroundColor: color.drak_black_000000,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'black',
    marginHorizontal: width * 0.1,
    marginVertical: height * 0.1,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  containerstatus: {
    backgroundColor: 'white',
    borderColor: 'black',
    paddingRight: 16,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 0 : 0,
    width: '100%',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },

  scanResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },

  scanResults: {
    flexDirection: 'column',
    left: 10,
    gap: 5,
  },

  scaniconresult: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',

  },

  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flex: 1,
  },

  detailButton: {
    backgroundColor: '#AE6F28',
    borderRadius: 4,
    width: 66,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noteButton: {
    backgroundColor: '#2F251D',
    borderRadius: 4,
    width: 66,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  redCircle: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#FF2F61',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greyCircle: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: '#F6F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  redCircleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  detailColor: {
    color: '#FFF6DF',
  },

  noteColor: {
    color: '#FFF6DF',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  timeColor: {
    color: '#766F6A',
    fontSize: 12
  },
  noteModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  noteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  addNoteButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  animatedBar: {
    position: 'absolute',
    left: 0,
    height: 30, // Bar height
    justifyContent: 'center',
    alignItems: 'center',
  },

  animatedText: {
    color: color.white_FFFFFF,
    fontWeight: '500',
    textAlign: 'center',
    padding: 5,
    fontSize: 14
  },
});

export default HomeScreen;