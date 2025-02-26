import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';

const CheckInAllPopup = ({ ticketslist }) => {
    const navigation = useNavigation();
    const [tickets, setTickets] = useState(ticketslist);

    const handleStatusChange = (id) => {
        setTickets(prevTickets =>
            prevTickets.map(ticket =>
                ticket.id === id
                    ? { ...ticket, status: 'Scanned', note: ticket.note || '' } // Preserve or initialize note
                    : ticket
            )
        );
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
                <Text style={styles.ticketId}>{item.id}</Text>
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
                    onPress={() => handleStatusChange(item.id)}
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
            keyExtractor={(item) => item.id}
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
        margin: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    ticketId: {
        fontWeight: '500',
        marginTop: 10,
        fontSize: 14,
        color: color.black_2F251D
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
        color: color.black_2F251D,
        fontWeight: '500',
        marginTop: 14,
    },
    ticketheading: {
        fontSize: 14,
        color: color.black_544B45,
        fontWeight: '400'
    },
    ticketDateheading: {
        fontSize: 14,
        marginTop: 15,
        fontWeight: '300',
       
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
