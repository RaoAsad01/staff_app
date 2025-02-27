import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color } from '../../color/color'; // Adjust the path as needed

const AttendeesComponent = ({ attendeesData }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendees Details</Text>
      {attendeesData.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.label}>{item.label}:</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 10,
    marginHorizontal: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.brown_3C200A,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    color: color.brown_3C200A,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.brown_3C200A,
  },
});

export default AttendeesComponent;