import { StyleSheet, Text, View, FlatList, TouchableOpacity,Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import { ticketService } from '../api/apiService';

const CheckInAllPopup = ({ ticketslist }) => {
    const navigation = useNavigation();
    const [tickets, setTickets] = useState(ticketslist);

    const handleStatusChange = async (ticketToCheckIn) => {
        console.log("Check-in ticket data:", ticketToCheckIn); // 👈 DEBUG LOG
        try {
            console.log("Sending:", ticketToCheckIn.eventUuid, ticketToCheckIn.code);
            const response = await ticketService.manualDetailCheckin(ticketToCheckIn.eventUuid, ticketToCheckIn.code);
            console.log("API Response:", response); // Log the entire response for debugging
    
            if (response?.data?.status === 'SCANNED') {
                // Update the local state to reflect the scanned status
                setTickets(prevTickets =>
                    prevTickets.map(ticket =>
                        ticket.uuid === ticketToCheckIn.uuid
                            ? { ...ticket, status: 'Scanned' } // ← change this line
                            : ticket
                    )
                );
                
            } else {
                Alert.alert('Check-in failed', response?.data?.message || 'Ticket not scanned.');
            }
        } catch (error) {
            console.error('Check-in error:', error);
            Alert.alert('Error', error.message || 'Something went wrong.');
        }
    };
      

    const handleItemPress = (item) => {
        if (item.status === 'Scanned') {
            const note = item.note || ''; // Ensure there's a default empty note if none exists
            navigation.navigate('TicketScanned', { note });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.ticketContainer} 
            onPress={() => handleItemPress(item)}
        >
            <View>
                <Text style={styles.ticketheading}>Ticket ID</Text>
                <Text style={styles.ticketId}>#{item.order_number}</Text>
                <Text style={styles.ticketType}>{item.type}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceCurrency}>USD </Text>
                    <Text style={styles.ticketPrice}>{item.price}</Text>
                </View>
            </View>
            <View style={styles.statusAndDateContainer}>
                <TouchableOpacity 
                    style={[
                        styles.statusButton, 
                        item.status === 'Scanned' && styles.scannedButton
                    ]} 
                    onPress={() => handleStatusChange(item)}
                >
                    <Text 
                        style={[
                            styles.statusButtonText, 
                            item.status === 'Scanned' && styles.scannedText
                        ]}
                    >
                        {item.status === 'Scanned' ? 'Scanned' : 'Check-in'}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.ticketDateheading}>Date</Text>
                <Text style={styles.ticketDate}>{item.date}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={tickets}
            renderItem={renderItem}
            keyExtractor={(item) => item.uuid}
        />
    );
};

const styles = StyleSheet.create({
    ticketContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: color.white_FFFFFF,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: color.white_FFFFFF,
        paddingHorizontal: 16,
        paddingVertical: 10,
        // margin: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.3,
        // shadowRadius: 6,
        // elevation: 5,
    },
    ticketId: {
        fontWeight: '400',
        marginTop: 10,
        fontSize: 14,
        color: color.black_544B45
    },
    ticketType: {
        fontSize: 14,
        marginTop: 10,
        color: color.black_2F251D,
        fontWeight: '500',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    priceCurrency: {
        color: color.black_544B45,
    },
    ticketPrice: {
        color: color.black_544B45,
    },
    ticketDate: {
        fontSize: 14,
        color: color.black_544B45,
        fontWeight: '400',
        marginTop: 14,
    },
    ticketheading: {
        fontSize: 14,
        color: color.black_2F251D,
        fontWeight: '500'
    },
    ticketDateheading: {
        fontSize: 14,
        marginTop: 15,
        fontWeight: '500',
        color: color.black_2F251D,
    },
    statusAndDateContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    statusButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 110,
        backgroundColor: color.btnBrown_AE6F28,
        marginBottom: 10,
    },
    statusButtonText: {
        color: color.btnTxt_FFF6DF,
    },
    scannedButton: {
        backgroundColor: color.brown_FFE8BB,
    },
    scannedText: {
        color: color.brown_D58E00,
        fontWeight: '500',
        
    },
});

export default CheckInAllPopup;
