import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import Typography, { ButtonTextDemiBold, Caption } from '../components/Typography';

const MiddleSection = ({ showGetStartedButton = false, onGetStartedPress }) => {
    return (
        <>
            <View style={styles.middleSection}>
                <View style={styles.logoContainer}>
                    <SvgIcons.hexalloSvg width={35} height={40} fill="transparent" />
                    <Typography
                        weight="700"
                        size={20}
                        color={color.grey_DEDCDC}
                    >
                        Hexallo
                    </Typography>
                </View>
                <Typography
                    weight="500"
                    size={16}
                    color={color.grey_DEDCDC}
                    style={styles.subtitle}
                >
                    Fast . Secure . Seamless
                </Typography>
            </View>

            {showGetStartedButton && (
                <TouchableOpacity style={styles.button} onPress={onGetStartedPress}>
                    <ButtonTextDemiBold
                        size={16}
                        color={color.btnTxt_FFF6DF}
                        align="center"
                    >
                        Get Started
                    </ButtonTextDemiBold>
                </TouchableOpacity>
            )}

            <View style={styles.bottomtextbg}>
                <Caption color={color.grey_DEDCDC} size={12} align="center">By Hexallo Enterprise</Caption>
            </View>
        </>
    );
};

const styles = {
    middleSection: {
        alignItems: 'center',
        position: 'absolute',
        bottom: 160,
        left: 0,
        right: 0,
        width: '100%',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
    },
    subtitle: {
        marginBottom: 10,
    },
    button: {
        backgroundColor: color.btnBrown_AE6F28,
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
    },
    bottomtextbg: {
        width: 'auto',
        paddingHorizontal: 20,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        alignSelf: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: 0,
    },
};

export default MiddleSection; 