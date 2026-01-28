import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { color } from '../color/color';
import SvgIcons from '../components/SvgIcons';
import Typography, { Body1, Caption } from '../components/Typography';

const ErrorPopup = ({ visible, onClose, title = "", subtitle = "" }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <SvgIcons.CrossIconBrownbg width={24} height={24} />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <SvgIcons.errorRedCircleIcon width={48} height={48} />
                    </View>
                    <Typography style={styles.title}
                        weight="500"
                        size={18}
                        color={color.placeholderTxt_24282C}>{title}
                    </Typography>

                    <Typography style={styles.subtitle}
                        weight="400"
                        size={14}
                        color={color.placeholderTxt_24282C}>
                        {subtitle}</Typography>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        paddingHorizontal: 16,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        position: 'relative',
        minWidth: 300,
        maxWidth: 500,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
        padding: 5,
    },
    iconContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
        fontWeight: 'bold'
    },
    subtitle: {
        textAlign: 'center',
    },
});

export default ErrorPopup; 