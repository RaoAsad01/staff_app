import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import Typography from '../components/Typography';

const OtpErrorPopup = ({ 
    visible, 
    onClose, 
    title = "Failed to Send OTP", 
    subtitle = "We couldn't send the OTP. Please try shortly.",
    showResendButton = false,
    onResend 
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.conatiner}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <SvgIcons.CrossIconBrownbg width={24} height={24} />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <View style={styles.errorIconCircle}>
                            <SvgIcons.errorRedCircleIcon width={48} height={48} fill={color.white_FFFFFF} />
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

                    {showResendButton && onResend && (
                        <TouchableOpacity style={styles.resendButton} onPress={onResend}>
                            <Typography
                                weight="600"
                                size={16}
                                color={color.grey_DEDCDC}
                            >
                                Resend
                            </Typography>
                        </TouchableOpacity>
                    )}
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
    conatiner: {
        width: '100%',
        paddingHorizontal: 16,
    },
    modalContainer: {
        backgroundColor: '#131314',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: '100%',
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
    errorIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: color.red_FF3B30,
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
    resendButton: {
        backgroundColor: '#131314',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 20,
        alignSelf: 'center',
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: color.borderBrown_CEBCA0,
    },
});

export default OtpErrorPopup; 