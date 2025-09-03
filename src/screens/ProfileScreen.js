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
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { userService } from '../api/apiService';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage({ uri: result.assets[0].uri });
        setHasChanges(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!profileImage) {
      Alert.alert('No image selected', 'Please select an image to update your profile.');
      return;
    }
    setSaving(true);
    try {
      let fileType = 'image/jpeg';
      if (profileImage.uri) {
        const ext = profileImage.uri.split('.').pop().toLowerCase();
        if (ext === 'png') fileType = 'image/png';
        if (ext === 'jpg' || ext === 'jpeg') fileType = 'image/jpeg';
      }

      const formData = new FormData();
      formData.append('profile_image', {
        uri: profileImage.uri,
        name: `profile.${fileType.split('/')[1]}`,
        type: fileType,
      });
      const response = await userService.updateProfile(formData);

      if (response.success) {
        await fetchProfile();
        setProfileImage(null);
        setHasChanges(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile image.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile image.');
    } finally {
      setSaving(false);
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
          <View style={styles.avatarWrapper}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {profileImage ? (
                <Image source={profileImage} style={styles.avatar} resizeMode="cover" />
              ) : userData?.profile_image ? (
                <Image
                  source={{ uri: userData.profile_image }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <SvgIcons.placeholderImage width={100} height={100} />
              )}
            </TouchableOpacity>
            <View style={styles.cameraIconContainer}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                <SvgIcons.profileCameraIcon width={32} height={32} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.userName}>
            {userData ? `${userData.first_name} ${userData.last_name}` : 'Loading...'}
          </Text>
          <Text style={styles.userEmail}>{userData?.email || 'Loading...'}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <SvgIcons.logoutMenuIcon width={24} height={24} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {hasChanges && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={!profileImage}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )}
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
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  avatarWrapper: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: color.btnBrown_AE6F28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: -16,
    left: '50%',
    transform: [{ translateX: -16 }],
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: color.btnBrown_AE6F28,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: color.brown_3C200A,
    marginBottom: 5,
    paddingTop: 30
  },
  userEmail: {
    fontSize: 16,
    color: color.brown_766F6A,
  },
  menuSection: {
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 15,
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: color.btnBrown_AE6F28,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: color.btnBrown_AE6F28,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginHorizontal: 24,
    marginBottom: 30,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  saveButtonText: {
    color: color.btnTxt_FFF6DF,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen; 