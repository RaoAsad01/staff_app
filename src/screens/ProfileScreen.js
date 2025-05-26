import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { userService } from '../api/apiService';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(require('../../assets/images/Avatar.png'));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setUserData(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch profile data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage({ uri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await userService.Userlogout();
      if (response.success) {
        await SecureStore.deleteItemAsync('accessToken');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.btnBrown_AE6F28} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            <Image source={profileImage} style={styles.avatar} />
            <View style={styles.cameraIconContainer}>
              <SvgIcons.cameraIconInActive width={24} height={24} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>
            {userData ? `${userData.first_name} ${userData.last_name}` : 'Loading...'}
          </Text>
          <Text style={styles.userEmail}>{userData?.email || 'Loading...'}</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 50
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
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: color.btnBrown_AE6F28,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: color.btnBrown_AE6F28,
  },
});

export default ProfileScreen; 