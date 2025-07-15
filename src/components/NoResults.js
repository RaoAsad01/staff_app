import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SvgIcons from '../../components/SvgIcons';
import { color } from '../color/color';

const NoResults = ({ message = "No Matching Results" }) => {
  return (
    <View style={styles.container}>
      <SvgIcons.noResultsIcon width={29} height={29} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 100,
  },
  message: {
    fontSize: 16,
    color: color.brown_766F6A,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '450',
  },
});

export default NoResults; 