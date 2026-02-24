import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Dimensions,
} from 'react-native';
import { color } from '../color/color';
import Typography from '../components/Typography';

const { width } = Dimensions.get('window');

const PopoverDropdown = ({ visible, onClose, options, selectedValue, onSelect, anchorRef }) => {
    const [position, setPosition] = useState({ top: 0, right: 0 });

    useEffect(() => {
        if (visible && anchorRef?.current) {
            anchorRef.current.measureInWindow((x, y, w, h) => {
                setPosition({
                    top: y + h + 4,
                    right: width - (x + w),
                });
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.container, { top: position.top, right: position.right }]}>
                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={option.value || index}
                                style={[styles.option, index < options.length - 1 && styles.optionBorder]}
                                onPress={() => {
                                    onSelect(option);
                                    onClose();
                                }}
                            >
                                <Typography
                                    weight="400"
                                    size={12}
                                    color={color.black_544B45}
                                >
                                    {option.label}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    container: {
        position: 'absolute',
        backgroundColor: color.white_FFFFFF,
        borderRadius: 12,
        paddingVertical: 4,
        minWidth: 50,
        maxHeight: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    scroll: {
        maxHeight: 240,
    },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    optionBorder: {
        borderBottomWidth: 0,
    },
});

export default PopoverDropdown;