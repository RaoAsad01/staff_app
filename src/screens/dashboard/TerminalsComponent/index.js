import React from 'react';
import { View, StyleSheet } from 'react-native';
import { color } from '../../../color/color';
import Typography, { Body1 } from '../../../components/Typography';

const TerminalsComponent = () => {
  return (
    <View style={styles.container}>
      <Body1 style={styles.noListText}>No list found</Body1>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noListText: {
    color: color.black_544B45,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TerminalsComponent;
