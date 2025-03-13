import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');
const overlayWidth = width * 0.8;
const overlayHeight = overlayWidth;

function marker(color, size, borderLength, thickness = 2, borderRadius = 0) {
    return (
        <View style={{ height: size, width: size }}>
            <View
                style={{
                    position: 'absolute',
                    height: borderLength,
                    width: borderLength,
                    top: 0,
                    left: 0,
                    borderColor: color,
                    borderTopWidth: thickness,
                    borderLeftWidth: thickness,
                    borderTopLeftRadius: borderRadius,
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    height: borderLength,
                    width: borderLength,
                    top: 0,
                    right: 0,
                    borderColor: color,
                    borderTopWidth: thickness,
                    borderRightWidth: thickness,
                    borderTopRightRadius: borderRadius,
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    height: borderLength,
                    width: borderLength,
                    bottom: 0,
                    left: 0,
                    borderColor: color,
                    borderBottomWidth: thickness,
                    borderLeftWidth: thickness,
                    borderBottomLeftRadius: borderRadius,
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    height: borderLength,
                    width: borderLength,
                    bottom: 0,
                    right: 0,
                    borderColor: color,
                    borderBottomWidth: thickness,
                    borderRightWidth: thickness,
                    borderBottomRightRadius: borderRadius,
                }}
            />
        </View>
    );
}

const CameraOverlay = ({ linePosition, scannedData }) => {
    const [lineColor, setLineColor] = useState('#AE6F28'); // Default color

    useEffect(() => {
        if (scannedData) {
            setLineColor(scannedData); // Now it directly updates the color
        }
    }, [scannedData]); // Runs when `scannedData` changes

    return (
        <View style={styles.overlayContainer}>
            <View style={styles.frame}>
                {marker('#AE6F28', '80%', '20%', 4, 10)}
                <View
                    style={[
                        styles.scannerLine,
                        { top: linePosition + 35, backgroundColor: lineColor, shadowColor: lineColor },
                    ]}
                />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    overlayContainer: {
        position: 'absolute',
        width: 303,
        height: 301,
        justifyContent: 'center',
        alignItems: 'center',
    },
    frame: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    instructionText: {
        color: '#AE6F28',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'absolute',
    },
    qrCodeImage: {
        width: '70%',
        height: '70%',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerLine: {
        position: 'absolute',
        width: '70%',
        height: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 60,
    },
});

export default CameraOverlay;
