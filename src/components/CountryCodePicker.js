import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { color } from '../color/color';
import Typography from './Typography';
import SvgIcons from '../../components/SvgIcons';
import { countryCodes } from '../constants/countryCodes';

const CountryCodePicker = ({
    selectedCountry,
    onSelectCountry,
    visible,
    onClose
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCountries, setFilteredCountries] = useState(countryCodes);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredCountries(countryCodes);
        } else {
            const filtered = countryCodes.filter(country =>
                country.name.toLowerCase().includes(query.toLowerCase()) ||
                country.dialCode.includes(query) ||
                country.code.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredCountries(filtered);
        }
    };

    const handleSelectCountry = (country) => {
        onSelectCountry(country);
        onClose();
        setSearchQuery('');
        setFilteredCountries(countryCodes);
    };

    const renderCountryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => handleSelectCountry(item)}
        >
            <View style={styles.countryInfo}>
                <Text style={styles.flag}>{item.flag}</Text>
                <View style={styles.countryDetails}>
                    <Typography
                        weight="500"
                        size={16}
                        color={color.grey_DEDCDC}
                        style={styles.countryName}
                    >
                        {item.name}
                    </Typography>
                    <Typography
                        weight="400"
                        size={14}
                        color={color.grey_87807C}
                        style={styles.countryCode}
                    >
                        {item.code}
                    </Typography>
                </View>
            </View>
            <Typography
                weight="600"
                size={16}
                color={color.grey_DEDCDC}
                style={styles.dialCode}
            >
                {item.dialCode}
            </Typography>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <SvgIcons.CrossIconBrownbg width={24} height={24} />
                    </TouchableOpacity>
                    <Typography
                        weight="600"
                        size={18}
                        color={color.grey_DEDCDC}
                        style={styles.headerTitle}
                    >
                        Select Country
                    </Typography>
                    <View style={styles.placeholder} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <SvgIcons.searchIcon width={20} height={20} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search country or code..."
                            placeholderTextColor={color.grey_87807C}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => handleSearch('')}
                                style={styles.clearButton}
                            >
                                <SvgIcons.crossIconRed width={24} height={24} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Countries List */}
                <FlatList
                    data={filteredCountries}
                    renderItem={renderCountryItem}
                    keyExtractor={(item) => item.code}
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />

                {/* No Results */}
                {filteredCountries.length === 0 && (
                    <View style={styles.noResults}>
                        <Typography
                            weight="400"
                            size={16}
                            color={color.grey_87807C}
                            style={styles.noResultsText}
                        >
                            No countries found
                        </Typography>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(19, 19, 20, 0.95)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: color.borderBrown_CEBCA0,
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 34,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(26, 26, 27, 0.9)',
        borderRadius: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: color.borderBrown_CEBCA0,
        height: 46,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: color.grey_DEDCDC,
        fontSize: 16,
        fontWeight: '400',
    },
    clearButton: {
        padding: 5,
    },
    list: {
        flex: 1,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    countryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    flag: {
        fontSize: 24,
        marginRight: 15,
    },
    countryDetails: {
        flex: 1,
    },
    countryName: {
        marginBottom: 2,
    },
    countryCode: {
        textTransform: 'uppercase',
    },
    dialCode: {
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: color.borderBrown_CEBCA0,
        marginLeft: 20,
        marginRight: 20,
    },
    noResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    noResultsText: {
        textAlign: 'center',
    },
});

export default CountryCodePicker;
