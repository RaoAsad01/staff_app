import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';

const NoteModal = ({ visible, onAddNote, onCancel, initialNote,scannedData }) => {
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        if (initialNote) {
            setNoteText(initialNote);
        }
    }, [initialNote]);

    const handleAddNote = () => {
        if (!scannedData) {
            console.warn('Cannot add note: scannedData is null');
            return;
        }
        if (noteText.trim().length > 0) {
            onAddNote(noteText);
            setNoteText('');
        }
        else {
            onAddNote('');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
        //   onRequestClose={onCancel} 
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                        <SvgIcons.CrossIconBrownbg width={24} height={24} />
                    </TouchableOpacity>
                    <Text style={styles.modalText}>Add Note</Text>
                    <TextInput
                        style={[styles.noteInput, { textAlignVertical: 'top' }]}
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={setNoteText}
                        value={noteText}
                        selectionColor={color.selectField_CEBCA0}
                        placeholder='Add your note here...'
                        placeholderTextColor={color.black_544B45}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleAddNote}>
                        <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
       
    },
    modalView: {
        margin: 15,
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
    },
    button: {
        backgroundColor: color.btnBrown_AE6F28,
        width: '100%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: color.btnTxt_FFF6DF,
        fontSize: 16,
        fontWeight: '700'
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",

    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        color: '#3C200A',
        fontSize: 18,
        fontWeight: 500,
    },
    noteInput: {
        borderWidth: 1,
        borderColor: '#CEBCA0',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        width: '100%',
        color: color.black_544B45,
        minHeight: 100,
        maxHeight: 100,
        lineHeight: 20
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        zIndex: 1,
    },
});

export default NoteModal;