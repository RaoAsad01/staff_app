import React from 'react';
import { View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import Typography, { ButtonTextDemiBold, Caption } from '../components/Typography';

const MiddleSection = ({ showGetStartedButton = false, onGetStartedPress }) => {
    const { height: screenHeight } = Dimensions.get('window');
    const isSmallScreen = screenHeight < 700;
    const isLargeScreen = screenHeight > 800;
    return (
        <>
            <View style={[styles.middleSection, { bottom: screenHeight * 0.25 }]}>
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
                <TouchableOpacity style={[styles.button, { bottom: screenHeight * 0.15 }]} onPress={onGetStartedPress}>
                    <ButtonTextDemiBold
                        size={16}
                        color={color.btnTxt_FFF6DF}
                        align="center"
                        weight="600"
                    >
                        Get Started
                    </ButtonTextDemiBold>
                </TouchableOpacity>
            )}

            <SafeAreaView style={[styles.bottomtextbg, { bottom: screenHeight * 0.08 }]}>
                <Caption color={color.grey_DEDCDC} size={12} align="center">By Hexallo Enterprise</Caption>
            </SafeAreaView>
        </>
    );
};

const styles = {
    middleSection: {
        alignItems: 'center',
        position: 'absolute',
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
        alignSelf: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
    },
};

export default MiddleSection; 