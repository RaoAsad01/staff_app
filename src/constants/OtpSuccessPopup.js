import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import Typography from '../components/Typography';

const OtpSuccessPopup = ({ visible, onClose, title = "OTP Sent Successfully", subtitle = "We've sent a one-time password to your email" }) => {
    // Auto-close after 2 seconds
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconContainer}>
                        <View style={styles.successIconCircle}>
                            <SvgIcons.successBrownSVG width={48} height={48} fill={color.white_FFFFFF} />
                        </View>
                    </View>
                    
                    <Typography style={styles.title}
                        weight="500"
                        size={18}
                        color={color.grey_DEDCDC}>
                        {title}
                    </Typography>

                    <Typography style={styles.subtitle}
                        weight="400"
                        size={14}
                        color={color.white_CDCDCD}>
                        {subtitle}
                    </Typography>
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
    modalContainer: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 350,
        maxWidth: 400,
    },
    iconContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    successIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: color.btnBrown_AE6F28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default OtpSuccessPopup; 