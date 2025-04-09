import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';;
import SvgIcons from '../../components/SvgIcons';
import * as SecureStore from 'expo-secure-store'; 

const ProfileScreen = () => {
  const navigation = useNavigation();
  const imageUrl = require('../../assets/images/Avatar.png');

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={imageUrl} style={styles.avatar} />
          </View>
          <Text style={styles.userName}>Anthony Dinozo</Text>
          <Text style={styles.userEmail}>anthony@hexallo.com</Text>
        </View>

        <View style={styles.menuSection}>
          {/* <TouchableOpacity style={styles.menuItem}>
            <SvgIcons.profileMenuIcon width={24} height={24} />
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <SvgIcons.dashboardMenuIcon width={24} height={24} />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <SvgIcons.logoutMenuIcon width={24} height={24} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 30
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 10,
    backgroundColor: color.btnBrown_AE6F28,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: color.white_FFFFFF,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: color.btnBrown_AE6F28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: color.brown_3C200A,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: color.brown_766F6A,
  },
  menuSection: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: color.black_544B45,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 20,
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: color.brown_3C200A,
    fontWeight: '500',
  },
});

export default ProfileScreen; 